// The Fly-in routing rules, ported from the Python project. No drawing in
// here, so tests/sim.test.mjs can run it under Node.

// x, y are positions on a 10 x 4 grid, cap is how many drones fit at once.
// Start and goal hold the whole fleet.
export const ZONES = {
    start: { x: 0, y: 2, cap: Infinity },
    a: { x: 2, y: 1, cap: 1 },
    b: { x: 2, y: 3, cap: 1 },
    c: { x: 4, y: 0, cap: 1 },
    d: { x: 4, y: 2, cap: 2, priority: true },
    e: { x: 4, y: 4, cap: 1 },
    f: { x: 6, y: 1, cap: 1 },
    g: { x: 6, y: 3, cap: 1 },
    h: { x: 8, y: 2, cap: 2 },
    goal: { x: 10, y: 2, cap: Infinity },
};

export const LINKS = [
    ["start", "a"], ["start", "b"], ["a", "c"], ["a", "d"], ["b", "d"],
    ["b", "e"], ["c", "f"], ["d", "f"], ["d", "g"], ["e", "g"],
    ["f", "h"], ["g", "h"], ["h", "goal"],
];

export function neighbourTable() {
    const table = {};
    for (const name in ZONES) {
        table[name] = [];
    }
    for (const [one, other] of LINKS) {
        table[one].push(other);
        table[other].push(one);
    }
    return table;
}

// Dijkstra run once, backwards from the goal: how many turns each zone is
// from the goal. Every zone here costs 1 turn to enter (the real project
// also has 2-turn "restricted" zones, which is why this isn't a plain BFS).
export function distancesToGoal(neighbours) {
    const dist = {};
    for (const name in ZONES) {
        dist[name] = Infinity;
    }
    dist.goal = 0;
    const done = new Set();
    while (done.size < Object.keys(ZONES).length) {
        // With 10 zones a linear scan beats a heap for readability.
        let closest = null;
        for (const name in ZONES) {
            if (!done.has(name) && (closest === null || dist[name] < dist[closest])) {
                closest = name;
            }
        }
        done.add(closest);
        for (const next of neighbours[closest]) {
            dist[next] = Math.min(dist[next], dist[closest] + 1);
        }
    }
    return dist;
}

export function createFleet(count) {
    const drones = [];
    for (let id = 1; id <= count; id++) {
        drones.push({ id, zone: "start" });
    }
    const occupancy = {};
    for (const name in ZONES) {
        occupancy[name] = 0;
    }
    occupancy.start = count;
    return { drones, occupancy };
}

// Plays one turn and returns the moves, e.g. ["D1-a", "D2-b"].
export function playTurn(fleet, neighbours, dist) {
    const { drones, occupancy } = fleet;
    // Nearest to the goal moves first, so a drone leaving a zone frees
    // its space for the drone behind it in the same turn.
    const flying = drones.filter((drone) => drone.zone !== "goal");
    flying.sort((one, other) => dist[one.zone] - dist[other.zone]);

    const moves = [];
    for (const drone of flying) {
        let best = null;
        for (const next of neighbours[drone.zone]) {
            // Strictly closer only: the cost falls every move, so no loops.
            if (dist[next] >= dist[drone.zone]) continue;
            if (occupancy[next] >= ZONES[next].cap) continue;
            const closer = best === null || dist[next] < dist[best];
            const tieWon = best !== null && dist[next] === dist[best]
                && ZONES[next].priority;
            if (closer || tieWon) best = next;
        }
        if (best === null) continue;  // everything closer is full: wait
        occupancy[drone.zone]--;
        occupancy[best]++;
        drone.zone = best;
        moves.push(`D${drone.id}-${best}`);
    }
    return moves;
}
