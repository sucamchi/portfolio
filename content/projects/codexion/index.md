# Codexion

A multithreaded simulation in C, based on the dining philosophers problem. [Source on GitHub](https://github.com/sucamchi/Codexion)

`C` `pthreads` `mutexes` `condition variables` `scheduling`

## The problem

A group of coders (threads) sit around a table, with one USB dongle (a shared resource) between each pair. To compile, a coder needs both dongles next to them at once. Each dongle has a cooldown after use, and a coder who goes too long without compiling burns out and ends the simulation. The program has to keep everyone alive, never deadlock, and log every action in the correct order.

## How it works

- **Deadlock-free lock order.** Odd-numbered coders take their left dongle first, even-numbered coders their right. That breaks the circular wait that would otherwise let everyone hold one dongle and wait forever for the second.
- **Fair scheduling.** Each dongle keeps a small priority queue of waiting coders. In FIFO mode the earliest request wins, and in EDF mode (earliest deadline first) the coder closest to burning out wins.
- **Synchronised start.** Every thread waits on a condition variable until all of them are ready, so no coder gets a head start.
- **A monitor thread** checks every coder's last compile time every millisecond and stops the simulation the moment one burns out, waking any thread asleep on a dongle so it can exit cleanly.
- **Clean output.** All logging goes through one mutex, so lines from different threads never interleave.
- **Edge cases**, like a single coder with only one dongle on the table, are handled explicitly.

## What I learned

Concurrency bugs don't show up on every run, so I had to reason about them rather than test them away. The README documents which shared fields are deliberately read without a lock and why that is safe: the stop flag only ever goes from 0 to 1, and each counter has exactly one writer. That kind of argument was the hardest and most interesting part of the project.
