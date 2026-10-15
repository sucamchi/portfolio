# Static site generator

The generator that builds this website: Markdown in, HTML out, in plain Python with no dependencies. [Source on GitHub](https://github.com/sucamchi/portfolio-static-site)

`Python` `parsing` `unittest` `GitHub Pages`

## How it works

Every page on this site is a Markdown file in a content folder. The generator walks that folder and, for each file:

1. **Splits it into blocks** (headings, paragraphs, lists, quotes, code) and works out the type of each one.
2. **Parses the inline formatting** inside each block (bold, italic, code, links and images) into a list of text nodes.
3. **Builds a tree of HTML nodes** from those, and renders the tree to an HTML string.
4. **Fills a template** with the page title (taken from the first heading) and the rendered content, then writes the page to the same path in the output folder.

Static files like the stylesheet are copied across, and every root-relative link is rewritten with a configurable base path, so the same content works both locally and on GitHub Pages under a project subfolder.

```
python3 src/main.py                          # local build, base path /
python3 src/main.py "/portfolio-static-site/"  # GitHub Pages build
```

## Testing

The parser and the HTML node classes are covered by unit tests with Python's built-in unittest module, run with a single script.

## Background

I built it following the [Build a Static Site Generator in Python](https://www.boot.dev/courses/build-static-site-generator-python) course on Boot.dev, then turned it into this portfolio.
