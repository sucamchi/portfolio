# CallMeMaybe

Reliable function calling with a 0.6B-parameter local LLM. [Source on GitHub](https://github.com/sucamchi/CallMeMaybe)

`Python` `numpy` `pydantic` `Qwen3-0.6B` `constrained decoding`

## The problem

Given a prompt like "What is the sum of 2 and 3?" and a catalog of available functions, the program does not answer "5". It answers with the function call that would:

```
{"name": "fn_add_numbers", "parameters": {"a": 2.0, "b": 3.0}}
```

A model this small, simply asked for JSON, returns something parseable only about **33%** of the time. CallMeMaybe returns valid, schema-correct JSON **100%** of the time, because validity never depends on the model behaving. It is enforced while the text is being generated.

## How it works

A language model scores every token in its vocabulary (151,936 of them for Qwen3) and the highest score wins. **Constrained decoding** adds one step in between: every token that would break the output is set to negative infinity, so it can never be picked. The model still makes the choice, but only among options that are allowed.

The output is split into a fixed **skeleton** (braces, keys, colons, commas) written directly, and a few **slots** where the model actually decides:

- **Which function to call.** All function names are tokenized and walked side by side. At each position the model chooses only among the next tokens of the names still in the race, so it can never invent a function that does not exist. Positions where every survivor agrees are skipped without calling the model at all.
- **Each argument's value.** Numbers, integers and strings each get a precomputed token mask, built once at startup instead of once per token. Number tokens are also checked against a small state machine for the JSON number grammar, so things like "1.2." or "007" can't sneak through.
- **When to stop.** Strings end at their closing quote. Numbers have no such token, so a number ends the moment the model's unconstrained choice would rather write something else, like a comma.

## Results

On 11 test prompts against 6 functions, running on a laptop GPU:

- **100%** of outputs are valid JSON that matches the declared types
- The correct function is chosen on every prompt; about 80 to 90% of argument values are right
- 109 forward passes in total, which take 97% of the runtime: the decoding logic itself is negligible

## What I learned

I had no previous experience with LLMs when I started. Understanding tokenization, logits and decoding meant reading papers and blog posts, then poking the model's inputs and outputs until the behavior made sense. The SDK was sparsely documented, so I also read its source to find out what it actually did.

The project is linted with flake8, type-checked with mypy, and tested end to end against valid and deliberately broken input files.
