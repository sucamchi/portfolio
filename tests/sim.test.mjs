// Run with: node --test
import test from "node:test";
import assert from "node:assert/strict";

import * as flyin from "../js/flyin-sim.js";
import { createSim, tick } from "../js/codexion-sim.js";

test("fly-in delivers every drone and never overfills a zone", () => {
    const neighbours = flyin.neighbourTable();
    const dist = flyin.distancesToGoal(neighbours);
    assert.equal(dist.start, 5);

    const fleet = flyin.createFleet(8);
    let turns = 0;
    while (fleet.drones.some((drone) => drone.zone !== "goal")) {
        const moves = flyin.playTurn(fleet, neighbours, dist);
        assert.ok(moves.length > 0, "a turn with no moves means deadlock");
        for (const name in flyin.ZONES) {
            assert.ok(fleet.occupancy[name] <= flyin.ZONES[name].cap, name);
        }
        turns += 1;
    }
    // 8 drones, 5 hops, at most 2 drones in the last zone at a time.
    assert.ok(turns <= 10, `took ${turns} turns`);
});

const settings = {
    coders: 5, burnout: 900, compile: 200, debug: 150, refactor: 150,
    cooldown: 50, scheduler: "fifo",
};

function run(overrides, ms) {
    const sim = createSim({ ...settings, ...overrides });
    for (let i = 0; i < ms && !sim.over; i++) {
        tick(sim);
        for (const coder of sim.coders) {
            if (coder.state !== "compiling") continue;
            // A compiling coder must hold both of its dongles.
            for (const dongle of coder.order) {
                assert.equal(dongle.holder, coder);
            }
        }
    }
    return sim;
}

for (const scheduler of ["fifo", "edf"]) {
    test(`codexion ${scheduler}: default settings never burn out`, () => {
        const sim = run({ scheduler }, 20000);
        assert.equal(sim.over, null);
        for (const coder of sim.coders) {
            assert.ok(coder.compiles > 10, `coder ${coder.id} starved`);
        }
    });
}

test("codexion: a tight burnout limit ends the run", () => {
    const sim = run({ burnout: 300 }, 20000);
    assert.notEqual(sim.over, null);
    assert.equal(sim.log.at(-1).message, "burned out");
});
