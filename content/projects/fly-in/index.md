# Fly-in

A drone routing simulator: move a whole fleet across a network in as few turns as possible. [Source on GitHub](https://github.com/sucamchi/Fly-in)

`Python` `Dijkstra` `graphs` `pygame` `mypy`

## The problem

A map file describes a network of zones and connections. Zones have a capacity and a type that decides what it costs to fly into them: normal (1 turn), priority (1 turn, preferred on ties), restricted (2 turns) or blocked. Every drone starts at one hub and has to reach another, and the simulation prints one line per turn naming every drone that moved.

## The approach

The obvious solution is to plan a route per drone and walk each drone along it. That is slower and worse: a route planned in advance cannot know about traffic that has not happened yet, so drones keep needing to be re-routed.

Fly-in inverts it:

1. **Dijkstra runs once, backwards from the goal**, giving the remaining cost from every zone to the goal.
2. **Each turn, every drone steps to the neighboring zone with the lowest remaining cost that still has room.** No drone owns a route, so congestion needs no replanning: a drone whose favorite zone is full takes the next best one, or waits.

## Why it can't deadlock

- A drone only ever moves to a zone with a strictly lower remaining cost, so it can never loop or bounce back and forth.
- Drones move **nearest to the goal first**. The closest drone's next zone can only be blocked by drones even closer, and those have already moved this turn. So at least one drone moves every turn and the fleet always makes progress.

Because of that guarantee, a turn where nothing moves can only mean a bug, so the engine raises an error instead of hanging.

## Results

Every map in the test suite finishes at or under its turn target:

- Easy maps: 4 turns each (targets 6 to 8)
- Hard "capacity hell", 12 drones: **16 turns** (target 35)
- Hard "ultimate challenge", 15 drones: **26 turns** (target 45)
- Challenger "the impossible dream", 25 drones: **43 turns** (target 45)

A pygame visualizer draws the network and animates the drones, with play, pause, single-step and speed controls.
