# A-Maze-ing

A maze generator and solver with an interactive terminal display, built as a team of two. [Source on GitHub](https://github.com/sucamchi/A-Maze-ing)

`Python` `DFS` `BFS` `packaging` `mypy` `flake8`

## What it does

The program reads a config file (size, entry, exit, output file, maze type), generates a random maze, and shows it in the terminal with ASCII art and ANSI colors. From the menu you can regenerate the maze, show or hide the shortest path, change wall colors, and watch an animation of the maze being carved out.

Two kinds of maze are supported:

- **Perfect mazes**: exactly one path between any two cells, with no loops and no unreachable areas.
- **Pac-Man boards**: mazes with loops, open corners, an open center and almost no dead ends.

## How it works

- **Generation** uses depth-first search with an explicit stack instead of recursion, so large mazes don't hit Python's recursion limit.
- **Solving** uses breadth-first search, which always finds the shortest path when every step costs the same.
- **Storage**: each cell is a 4-bit number, one bit per wall, which keeps the grid compact and makes the hex output format trivial.
- **Reuse**: the core is a self-contained, pip-installable package that other projects can import.

## My part

I set up the project and its architecture (virtualenv, Makefile, flake8 and mypy from day one, packaging), wrote the maze generation core and the terminal display, built the generation animation, and wrote the documentation. My teammate wrote the BFS solver, the output format and the Pac-Man board mode. We worked on separate branches and merged regularly, which kept main working the whole time.
