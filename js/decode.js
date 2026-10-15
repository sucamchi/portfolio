// CallMeMaybe demo: replays constrained decoding one decision at a time.
// The token splits and scores are illustrative; the rules are the real ones.
import { reducedMotion } from "./canvas.js";

// Each step either writes forced skeleton text, or shows one decision:
// the tokens the model scored, which ones the mask allows, and the pick.
// pick: null means the slot ends there.
const STEPS = [
    { forced: '{"name": "' },
    {
        slot: "function name",
        note: "Every name in the catalog starts with the same token, so there is nothing to decide. No model call.",
        options: [{ token: "fn", allowed: true }],
        pick: "fn",
    },
    {
        slot: "function name",
        note: "The model may only pick the next token of a name still in the race. Anything else is masked to -inf.",
        options: [
            { token: "_add", score: 9.1, allowed: true },
            { token: "sum", score: 7.8, allowed: false },
            { token: "_get", score: 6.4, allowed: true },
            { token: "_greet", score: 2.2, allowed: true },
            { token: "_reverse", score: 1.7, allowed: true },
        ],
        pick: "_add",
    },
    {
        slot: "function name",
        note: "Only one name survives, so the rest of it is forced.",
        options: [{ token: "_numbers", allowed: true }],
        pick: "_numbers",
    },
    { forced: '", "parameters": {"a": ' },
    {
        slot: "a: number",
        note: "Only number-shaped tokens pass the mask. A quote or a word can never start this value.",
        options: [
            { token: "40", score: 8.7, allowed: true },
            { token: "\"", score: 7.9, allowed: false },
            { token: "forty", score: 5.1, allowed: false },
            { token: "4", score: 4.3, allowed: true },
        ],
        pick: "40",
    },
    {
        slot: "a: number",
        note: "A number has no 'end' token. The model's unmasked favourite is a comma, outside the mask, so the number ends here.",
        options: [
            { token: ",", score: 9.4, allowed: false },
            { token: ".", score: 3.2, allowed: true },
            { token: "0", score: 1.1, allowed: true },
        ],
        pick: null,
    },
    { forced: ', "b": ' },
    {
        slot: "b: number",
        note: "Same mask, same rules.",
        options: [
            { token: "2", score: 8.9, allowed: true },
            { token: "two", score: 5.0, allowed: false },
            { token: "40", score: 3.1, allowed: true },
        ],
        pick: "2",
    },
    {
        slot: "b: number",
        note: "The model wants to close the object, which is outside the mask: slot over.",
        options: [
            { token: "}", score: 9.0, allowed: false },
            { token: "0", score: 2.0, allowed: true },
        ],
        pick: null,
    },
    { forced: "}}" },
];

const root = document.getElementById("decode");
const output = document.getElementById("decode-output");
const slot = document.getElementById("decode-slot");
const table = document.getElementById("decode-options");
const note = document.getElementById("decode-note");
const pauseButton = document.getElementById("decode-pause");

let paused = false;
let visible = false;
new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
}).observe(root);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Waits ms, then keeps waiting while paused or scrolled out of view.
async function wait(ms) {
    await sleep(ms);
    while (paused || !visible) await sleep(150);
}

function append(text, className) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    output.insertBefore(span, output.lastChild);  // keep the cursor last
    return span;
}

async function typeForced(text) {
    if (reducedMotion) {
        append(text, "forced");
        return;
    }
    const span = append("", "forced");
    for (const char of text) {
        span.textContent += char;
        await wait(18);
    }
}

function showOptions(step) {
    slot.textContent = step.slot;
    note.textContent = step.note;
    table.replaceChildren();
    for (const option of step.options) {
        const row = document.createElement("li");
        row.className = option.allowed ? "allowed" : "masked";
        const token = document.createElement("code");
        token.textContent = JSON.stringify(option.token);
        const bar = document.createElement("span");
        bar.className = "bar";
        bar.style.setProperty("--score", option.score === undefined ? 1 : option.score / 10);
        const score = document.createElement("span");
        score.className = "score";
        if (!option.allowed) score.textContent = "-inf";
        else if (option.score === undefined) score.textContent = "forced";
        else score.textContent = option.score.toFixed(1);
        row.append(token, bar, score);
        table.append(row);
    }
}

async function decide(step) {
    showOptions(step);
    await wait(step.options.length > 1 ? 2600 : 1500);
    const rows = [...table.children];
    if (step.pick === null) {
        note.textContent += " (slot closed)";
        await wait(1200);
        return;
    }
    const index = step.options.findIndex((option) => option.token === step.pick);
    rows[index].classList.add("picked");
    await wait(900);
    append(step.pick, "picked");
}

async function play() {
    while (true) {
        output.replaceChildren(Object.assign(document.createElement("span"), {
            className: "cursor", textContent: " ",
        }));
        root.classList.remove("valid");
        for (const step of STEPS) {
            if (step.forced) await typeForced(step.forced);
            else await decide(step);
        }
        JSON.parse(output.textContent);  // throws if the replay ever breaks
        root.classList.add("valid");
        slot.textContent = "done";
        table.replaceChildren();
        note.textContent = "JSON.parse() accepts it. Valid by construction, not by luck.";
        await wait(5000);
    }
}

pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.textContent = paused ? "play" : "pause";
    pauseButton.setAttribute("aria-pressed", String(paused));
});
play();
