// Codexion demo: draws codexion-sim.js as coders around a table.
import { cssColor, fitCanvas, loopWhileVisible, onResize } from "./canvas.js";
import { createSim, tick } from "./codexion-sim.js";

// Simulated ms per real ms. Slowed down so the hand-offs can be followed.
const SPEED = 0.4;

const canvas = document.getElementById("codexion-canvas");
const log = document.getElementById("codexion-log");
const scheduler = document.getElementById("codexion-scheduler");
const burnout = document.getElementById("codexion-burnout");
const burnoutValue = document.getElementById("codexion-burnout-value");
const pauseButton = document.getElementById("codexion-pause");

const STATE_COLORS = {
    compiling: "--green",
    debugging: "--accent",
    refactoring: "--blue",
    waiting: "--line-strong",
};

let ctx, width, height, sim;
let paused = false;
let owed = 0;  // fractional simulated ms carried over between frames
let overFor = 0;

function restart() {
    sim = createSim({
        coders: 5, compile: 200, debug: 150, refactor: 150, cooldown: 50,
        burnout: Number(burnout.value), scheduler: scheduler.value,
    });
    owed = 0;
    overFor = 0;
    burnoutValue.textContent = `${burnout.value} ms`;
}

function setup() {
    ({ ctx, width, height } = fitCanvas(canvas));
    draw();
}

function seat(index, count, radius) {
    const angle = -Math.PI / 2 + (index / count) * 2 * Math.PI;
    return [width / 2 + Math.cos(angle) * radius,
        height / 2 + Math.sin(angle) * radius];
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    const count = sim.coders.length;
    const radius = Math.min(width, height) / 2 - 36;

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius * 0.55, 0, 2 * Math.PI);
    ctx.strokeStyle = cssColor("--line");
    ctx.lineWidth = 1;
    ctx.stroke();

    // Coder i uses dongles i and i + 1 (codexion-sim.js), so dongle i
    // sits between coders i - 1 and i.
    sim.dongles.forEach((dongle, i) => {
        const [x, y] = seat(i - 0.5, count, radius * 0.72);
        if (dongle.holder) {
            const [hx, hy] = seat(dongle.holder.id - 1, count, radius);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(hx, hy);
            ctx.strokeStyle = cssColor("--green");
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        const cooling = !dongle.holder && sim.now < dongle.coolUntil;
        ctx.fillStyle = cooling ? cssColor("--amber") : cssColor("--text-dim");
        ctx.fillRect(x - 6, y - 4, 12, 8);
    });

    ctx.textAlign = "center";
    for (const coder of sim.coders) {
        const [x, y] = seat(coder.id - 1, count, radius);
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = cssColor("--panel");
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = cssColor(STATE_COLORS[coder.state]);
        ctx.stroke();

        // Burnout meter: fills up as time since the last compile grows.
        const share = coder.state === "compiling"
            ? 0 : Math.min(1, (sim.now - coder.lastCompile) / sim.settings.burnout);
        if (share > 0) {
            ctx.beginPath();
            ctx.arc(x, y, 26, -Math.PI / 2, -Math.PI / 2 + share * 2 * Math.PI);
            ctx.strokeStyle = share > 0.75 ? cssColor("--red") : cssColor("--line-strong");
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.fillStyle = cssColor("--text");
        ctx.font = `bold 13px ${cssColor("--mono")}`;
        ctx.fillText(String(coder.id), x, y + 5);
    }
}

function showLog() {
    const lines = sim.log.slice(-7).map((entry) =>
        `${String(entry.time).padStart(5)} ${entry.id} ${entry.message}`);
    if (sim.over) {
        lines.push(`-- coder ${sim.over.id} burned out, simulation stopped`);
    }
    log.textContent = lines.join("\n");
}

loopWhileVisible(canvas, (elapsed) => {
    if (paused) return;
    if (sim.over) {
        overFor += elapsed;
        if (overFor > 4000) restart();
    } else {
        owed += elapsed * SPEED;
        while (owed >= 1 && !sim.over) {
            tick(sim);
            owed -= 1;
        }
    }
    draw();
    showLog();
});

scheduler.addEventListener("change", restart);
burnout.addEventListener("input", restart);
document.getElementById("codexion-restart").addEventListener("click", restart);
pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.textContent = paused ? "play" : "pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
});
onResize(canvas, setup);
restart();
setup();
showLog();
