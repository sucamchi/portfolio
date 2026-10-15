# Susana Camlett Chica

Python and backend developer in training at 42 Málaga. I build command-line tools, simulations and small services in Python, C and Go, and I like making computers do the boring parts.

## About me

I'm a student at **42 Fundación Telefónica Málaga**, a peer-to-peer coding school with no teachers and no lectures: every project is built from a written spec and then defended in front of other students, who read the code and try to break it.

Alongside the 42 curriculum I've worked through the backend track on Boot.dev (Go HTTP servers, Git, CI/CD, file storage on S3) and a course on AI and Big Data programming.

I care about code other people can read: type-checked and linted Python (mypy, flake8), small focused modules, and READMEs that explain the *why* as well as the how.

## Featured projects

### [CallMeMaybe: reliable function calling with a tiny LLM](/projects/callmemaybe)

Turns a natural-language request into a JSON function call using a small local model (Qwen3-0.6B). Asked politely, the model returns valid JSON about a third of the time. With constrained decoding it is **100%**, because invalid tokens are masked out while the text is being generated.

`Python` `numpy` `pydantic` `LLMs`

### [Fly-in: drone routing simulator](/projects/fly-in)

Routes a fleet of drones through a network of zones with capacities and travel costs, in as few turns as possible. One backwards Dijkstra pass plus a nearest-first move order makes deadlock impossible. Hits every turn target in the test suite, including 25 drones in 43 turns (target 45).

`Python` `Dijkstra` `pygame`

### [Codexion: concurrency in C](/projects/codexion)

A take on the dining philosophers problem with POSIX threads: mutexes, condition variables, a deadlock-free lock order, and FIFO or earliest-deadline-first scheduling through a per-resource priority queue.

`C` `pthreads` `concurrency`

### [A-Maze-ing: maze generator](/projects/a-maze-ing)

Team project. Generates random mazes with an iterative depth-first search, solves them with breadth-first search, and shows them in an interactive, animated terminal display. Ships as a pip-installable package.

`Python` `algorithms` `packaging`

### [OcupaSol: hotel occupancy forecaster](/projects/ocupasol)

Team project. Predicts Costa del Sol hotel occupancy 12 months ahead from official INE data. I owned the data and the model: a 2,035-row dataset pulled from the INE API and a ridge regression backtested against a naive baseline.

`Python` `JavaScript` `data` `forecasting`

### [This website: a static site generator from scratch](/projects/static-site-generator)

A Markdown to HTML generator written in plain Python, with its own inline and block parser, an HTML node tree, and unit tests. It builds the page you are reading.

`Python` `parsing` `unittest`

## More projects

- [Chirpy](https://github.com/sucamchi/Chirpy): an HTTP server in Go, built in the Boot.dev "Learn HTTP Servers in Go" course.
- [gator](https://github.com/sucamchi/aggreGATOR): a command-line RSS aggregator in Go that stores feeds and posts in PostgreSQL and scrapes them in the background.
- [pokedexcli](https://github.com/sucamchi/pokedexcli): an interactive Go REPL for exploring the PokéAPI, with a time-expiring response cache.
- [AI coding agent](https://github.com/sucamchi/boot-ai-coding-agent): a CLI agent that uses Gemini function calling to read, write and run code inside a sandboxed directory.
- [kanji-quiz](https://github.com/sucamchi/kanji-quiz): a spaced-repetition kanji quiz that weights review towards past mistakes and tracks progress per level.
- [libft](https://github.com/sucamchi/libft), [ft_printf](https://github.com/sucamchi/ft_printf) and [get_next_line](https://github.com/sucamchi/get_next_line): my own C standard library, printf and buffered line reader, reused across later 42 projects.
- [Born2beroot](https://github.com/sucamchi/Born2beroot): a hardened Debian server set up from the terminal (encrypted LVM, sudo and password policy, UFW, SSH on a custom port).
- [NetPractice](https://github.com/sucamchi/NetPractice): TCP/IP addressing, subnetting and routing exercises.
- [SusiShell 04](https://github.com/sucamchi/SusiShell04ElectricBoogaloo): an exam practice simulator for 42 students that also flags banned built-in functions.
- [Asteroids](https://github.com/sucamchi/asteroids) and [Alien Invasion](https://github.com/sucamchi/alien-invasion): two arcade games in pygame.

## Skills

- **Languages:** Python, C, Go, Bash, some JavaScript
- **Python:** type hints with mypy, flake8, pydantic, numpy, pygame, packaging with build and uv
- **Systems:** POSIX threads, manual memory management, Makefiles, Linux server administration, TCP/IP basics
- **Backend:** HTTP servers, PostgreSQL, REST APIs
- **Tools:** Git, GitHub, VS Code, Valgrind

## Contact

I'm open to opportunities in Python and backend development. The fastest way to reach me is email.

- Email: [sucamchi@gmail.com](mailto:sucamchi@gmail.com)
- GitHub: [github.com/sucamchi](https://github.com/sucamchi)
- LinkedIn: [linkedin.com/in/scamlett](https://www.linkedin.com/in/scamlett)
