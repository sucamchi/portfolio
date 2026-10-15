// The Codexion simulation, ported from C threads to a single-threaded loop
// that advances one simulated millisecond per tick(). No drawing in here,
// so tests/sim.test.mjs can run it under Node.

export function createSim(settings) {
    const count = settings.coders;
    const coders = [];
    const dongles = [];
    for (let i = 0; i < count; i++) {
        dongles.push({ holder: null, coolUntil: 0, queue: [] });
    }
    for (let i = 0; i < count; i++) {
        const left = dongles[i];
        const right = dongles[(i + 1) % count];
        const id = i + 1;
        // The deadlock fix: odd coders reach left first, even coders right
        // first, so no circle of "hold one, wait for the next" can form.
        const order = id % 2 === 1 ? [left, right] : [right, left];
        coders.push({
            id, order, held: 0, state: "waiting", until: 0,
            lastCompile: 0, compiles: 0,
        });
    }
    const sim = { settings, now: 0, coders, dongles, log: [], over: null };
    for (const coder of coders) {
        request(sim, coder);
    }
    return sim;
}

function say(sim, coder, message) {
    sim.log.push({ time: sim.now, id: coder.id, message });
}

// Joins the queue of the next dongle this coder needs.
function request(sim, coder) {
    const dongle = coder.order[coder.held];
    // FIFO serves the oldest request; EDF the coder closest to burnout.
    const priority = sim.settings.scheduler === "edf"
        ? coder.lastCompile + sim.settings.burnout
        : sim.now;
    dongle.queue.push({ coder, priority });
}

function release(sim, coder) {
    for (const dongle of coder.order) {
        dongle.holder = null;
        dongle.coolUntil = sim.now + sim.settings.cooldown;
    }
    coder.held = 0;
}

export function tick(sim) {
    if (sim.over) return;
    sim.now += 1;
    const { settings } = sim;

    for (const coder of sim.coders) {
        if (coder.state === "waiting" || sim.now < coder.until) continue;
        if (coder.state === "compiling") {
            release(sim, coder);
            coder.state = "debugging";
            coder.until = sim.now + settings.debug;
            say(sim, coder, "is debugging");
        } else if (coder.state === "debugging") {
            coder.state = "refactoring";
            coder.until = sim.now + settings.refactor;
            say(sim, coder, "is refactoring");
        } else {
            coder.state = "waiting";
            request(sim, coder);
        }
    }

    for (const dongle of sim.dongles) {
        if (dongle.holder || sim.now < dongle.coolUntil) continue;
        if (dongle.queue.length === 0) continue;
        // Strict < keeps the earlier request on ties, like the C min-heap.
        let best = 0;
        for (let i = 1; i < dongle.queue.length; i++) {
            if (dongle.queue[i].priority < dongle.queue[best].priority) best = i;
        }
        const coder = dongle.queue.splice(best, 1)[0].coder;
        dongle.holder = coder;
        coder.held += 1;
        say(sim, coder, "has taken a dongle");
        if (coder.held === 1) {
            request(sim, coder);
        } else {
            coder.state = "compiling";
            coder.until = sim.now + settings.compile;
            coder.lastCompile = sim.now;
            coder.compiles += 1;
            say(sim, coder, "is compiling");
        }
    }

    for (const coder of sim.coders) {
        if (coder.state === "compiling") continue;
        if (sim.now - coder.lastCompile > settings.burnout) {
            sim.over = { id: coder.id, time: sim.now };
            say(sim, coder, "burned out");
            return;
        }
    }
}
