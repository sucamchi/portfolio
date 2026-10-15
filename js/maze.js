// Hero demo from A-Maze-ing: carve a maze with an iterative depth-first
// search, then solve it with breadth-first search.
import {
    cssColor, fitCanvas, loopWhileVisible, onResize, reducedMotion,
} from "./canvas.js";

// One bit per wall, the same encoding the Python package uses.
const N = 1, E = 2, S = 4, W = 8;
// dx, dy, the wall on this side, the matching wall on the neighbour's side.
const DIRS = [[0, -1, N, S], [1, 0, E, W], [0, 1, S, N], [-1, 0, W, E]];
const CELL = 18;

const canvas = document.getElementById("maze");
const status = document.getElementById("maze-status");
const pauseButton = document.getElementById("maze-pause");

let ctx, cols, rows, left, top;
let walls, reached, current, path, pathShown, steps;
let paused = false;
let finished = false;
let holdTimer = 0;

function grid(value) {
    return Array.from({ length: rows }, () => Array(cols).fill(value));
}

function setup() {
    const fit = fitCanvas(canvas);
    ctx = fit.ctx;
    cols = Math.floor((fit.width - 2) / CELL);
    rows = Math.floor((fit.height - 2) / CELL);
    left = Math.floor((fit.width - cols * CELL) / 2);
    top = Math.floor((fit.height - rows * CELL) / 2);
    walls = grid(N | E | S | W);
    reached = grid(false);
    current = null;
    path = [];
    pathShown = 0;
    holdTimer = 0;
    finished = false;
    steps = run();
    if (reducedMotion) {
        while (!steps.next().done) { /* finish instantly */ }
    }
    draw();
}

function* carve() {
    const seen = grid(false);
    // An explicit stack instead of recursion, as in the original: large
    // mazes would otherwise hit the recursion limit.
    const stack = [[0, 0]];
    seen[0][0] = true;
    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        current = [x, y];
        const options = DIRS.filter(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny][nx];
        });
        if (options.length === 0) {
            stack.pop();  // dead end: backtrack
        } else {
            const [dx, dy, wall, opposite] =
                options[Math.floor(Math.random() * options.length)];
            walls[y][x] &= ~wall;
            walls[y + dy][x + dx] &= ~opposite;
            seen[y + dy][x + dx] = true;
            stack.push([x + dx, y + dy]);
        }
        yield;
    }
    current = null;
}

function* solve() {
    const goal = `${cols - 1},${rows - 1}`;
    const parent = new Map();
    const queue = [[0, 0]];
    reached[0][0] = true;
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        if (`${x},${y}` === goal) break;
        for (const [dx, dy, wall] of DIRS) {
            // The border walls are never carved, so this never leaves the grid.
            if (walls[y][x] & wall) continue;
            const nx = x + dx, ny = y + dy;
            if (reached[ny][nx]) continue;
            reached[ny][nx] = true;
            parent.set(`${nx},${ny}`, [x, y]);
            queue.push([nx, ny]);
        }
        yield;
    }
    // Every step costs the same, so the first path BFS finds is the shortest.
    let cell = [cols - 1, rows - 1];
    while (cell) {
        path.unshift(cell);
        cell = parent.get(`${cell[0]},${cell[1]}`);
    }
    for (pathShown = 1; pathShown <= path.length; pathShown++) {
        yield;
    }
}

function* run() {
    status.textContent = "carving: depth-first search";
    yield* carve();
    status.textContent = "solving: breadth-first search";
    yield* solve();
    status.textContent = `solved: ${path.length} cells, shortest path`;
}

function draw() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = cssColor("--accent-soft");
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (reached[y][x]) {
                ctx.fillRect(left + x * CELL, top + y * CELL, CELL, CELL);
            }
        }
    }

    if (current) {
        ctx.fillStyle = cssColor("--accent");
        ctx.fillRect(left + current[0] * CELL + 3, top + current[1] * CELL + 3,
            CELL - 6, CELL - 6);
    }

    if (pathShown > 1) {
        ctx.strokeStyle = cssColor("--green");
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < Math.min(pathShown, path.length); i++) {
            const px = left + path[i][0] * CELL + CELL / 2;
            const py = top + path[i][1] * CELL + CELL / 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    // Each wall is shared by two cells, so drawing the north and west
    // walls of every cell (plus the outer edges) draws each line once.
    ctx.strokeStyle = cssColor("--text-dim");
    ctx.lineWidth = 1.5;
    ctx.lineCap = "square";
    ctx.beginPath();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = left + x * CELL, py = top + y * CELL;
            if (walls[y][x] & N) { ctx.moveTo(px, py); ctx.lineTo(px + CELL, py); }
            if (walls[y][x] & W) { ctx.moveTo(px, py); ctx.lineTo(px, py + CELL); }
            if (x === cols - 1 && walls[y][x] & E) {
                ctx.moveTo(px + CELL, py); ctx.lineTo(px + CELL, py + CELL);
            }
            if (y === rows - 1 && walls[y][x] & S) {
                ctx.moveTo(px, py + CELL); ctx.lineTo(px + CELL, py + CELL);
            }
        }
    }
    ctx.stroke();
}

loopWhileVisible(canvas, (elapsed) => {
    if (paused || reducedMotion) return;
    if (finished) {
        holdTimer += elapsed;
        if (holdTimer > 4000) setup();  // show the result, then start again
        return;
    }
    // Sized so a maze of any width takes about the same time to carve.
    const perFrame = Math.max(1, Math.ceil((cols * rows) / 160));
    for (let i = 0; i < perFrame && !finished; i++) {
        finished = steps.next().done;
    }
    draw();
});

document.getElementById("maze-new").addEventListener("click", setup);
pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.textContent = paused ? "play" : "pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
});
onResize(canvas, setup);
setup();
