// Fly-in demo: draws the routing from flyin-sim.js and animates each turn.
import {
    cssColor, fitCanvas, loopWhileVisible, onResize, reducedMotion,
} from "./canvas.js";
import {
    LINKS, ZONES, createFleet, distancesToGoal, neighbourTable, playTurn,
} from "./flyin-sim.js";

const DRONES = 8;
const TURN_MS = 750;

const canvas = document.getElementById("flyin");
const log = document.getElementById("flyin-log");
const pauseButton = document.getElementById("flyin-pause");
const neighbours = neighbourTable();
const dist = distancesToGoal(neighbours);

let ctx, width, height;
let fleet, turn, lines, progress, finishedFor;
let paused = false;
const drawn = {};  // where each drone was drawn at the start of the turn

function zonePoint(name) {
    const pad = 30;
    const zone = ZONES[name];
    return [pad + (zone.x / 10) * (width - 2 * pad),
        pad + (zone.y / 4) * (height - 2 * pad)];
}

// Spreads drones sharing a zone around its centre so none hide each other.
function dronePoint(drone) {
    const sharing = fleet.drones.filter((other) => other.zone === drone.zone);
    const [x, y] = zonePoint(drone.zone);
    if (sharing.length === 1) return [x, y];
    const angle = (sharing.indexOf(drone) / sharing.length) * 2 * Math.PI;
    const radius = sharing.length > 2 ? 17 : 8;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
}

function restart() {
    fleet = createFleet(DRONES);
    turn = 0;
    lines = [];
    progress = 1;
    finishedFor = 0;
    for (const drone of fleet.drones) drawn[drone.id] = dronePoint(drone);
    log.textContent = `${DRONES} drones waiting at start`;
}

function setup() {
    ({ ctx, width, height } = fitCanvas(canvas));
    restart();
    draw();
}

function nextTurn() {
    for (const drone of fleet.drones) drawn[drone.id] = dronePoint(drone);
    turn += 1;
    lines.push(`turn ${turn}: ${playTurn(fleet, neighbours, dist).join(" ")}`);
    if (fleet.drones.every((drone) => drone.zone === "goal")) {
        lines.push(`all ${DRONES} drones delivered in ${turn} turns`);
    }
    log.textContent = lines.slice(-5).join("\n");
    progress = 0;
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = cssColor("--line-strong");
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const [one, other] of LINKS) {
        ctx.moveTo(...zonePoint(one));
        ctx.lineTo(...zonePoint(other));
    }
    ctx.stroke();

    ctx.font = `11px ${cssColor("--mono")}`;
    ctx.textAlign = "center";
    // Smaller zones on phones, so neighbouring circles don't touch.
    const size = Math.min(22, width / 26);
    for (const name in ZONES) {
        const [x, y] = zonePoint(name);
        const zone = ZONES[name];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = cssColor("--panel");
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = zone.priority ? cssColor("--amber") : cssColor("--line-strong");
        if (name === "start" || name === "goal") ctx.strokeStyle = cssColor("--accent");
        ctx.stroke();
        ctx.fillStyle = cssColor("--text-dim");
        let label = name;
        if (zone.cap !== Infinity && zone.cap > 1) label += ` x${zone.cap}`;
        ctx.fillText(label, x, y + size + 14);
    }

    // Ease out, so drones settle into place instead of stopping dead.
    // With reduced motion they jump at the end of the turn instead.
    const t = reducedMotion ? Math.floor(progress) : 1 - (1 - progress) ** 3;
    for (const drone of fleet.drones) {
        const [fromX, fromY] = drawn[drone.id];
        const [toX, toY] = dronePoint(drone);
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = drone.zone === "goal" ? cssColor("--green") : cssColor("--accent");
        ctx.fill();
        ctx.fillStyle = cssColor("--bg");
        ctx.font = `bold 9px ${cssColor("--mono")}`;
        ctx.fillText(String(drone.id), x, y + 3);
    }
}

loopWhileVisible(canvas, (elapsed) => {
    if (paused) return;
    const done = fleet.drones.every((drone) => drone.zone === "goal");
    if (progress < 1) {
        progress = Math.min(1, progress + elapsed / TURN_MS);
    } else if (!done) {
        nextTurn();
    } else {
        finishedFor += elapsed;
        if (finishedFor > 3500) restart();
    }
    draw();
});

pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.textContent = paused ? "play" : "pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
});
document.getElementById("flyin-restart").addEventListener("click", () => {
    restart();
    draw();
});
onResize(canvas, setup);
setup();
