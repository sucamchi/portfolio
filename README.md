# Portfolio Static Site Generator

[![Python](https://img.shields.io/badge/Python-3.x-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222)](https://sucamchi.github.io/portfolio-static-site/)

A custom-built static site generator created as part of the [Boot.dev](https://www.boot.dev) course on **Building a Static Site Generator in Python**.

## 🌐 Live Site

**Visit the site:** [https://sucamchi.github.io/portfolio-static-site/](https://sucamchi.github.io/portfolio-static-site/)

## ✨ Features

- **Static Site Generation**: Converts Markdown to HTML with a configurable template
- **Recursive Page Generation**: Automatically processes all markdown files while maintaining directory structure
- **Markdown Support**: Comprehensive markdown formatting including:
  - Headings (H1-H6)
  - Bold, italic, and code formatting
  - Links and images
  - Lists (ordered and unordered)
  - Blockquotes
  - Code blocks
- **Configurable Base Path**: Support for GitHub Pages and custom deployment paths
- **Local Development**: Built-in HTTP server for local testing
- **Production Ready**: Automated build scripts for GitHub Pages deployment

## 🚀 Getting Started

### Prerequisites
- Python 3.x

### Installation

```bash
git clone https://github.com/sucamchi/portfolio-static-site.git
cd portfolio-static-site
```

### Local Development

```bash
# Generate site and start local server on port 8888
bash main.sh
```

Visit `http://localhost:8888` in your browser.

### Production Build

```bash
# Generate site for GitHub Pages with basepath
bash build.sh
```

## 📁 Project Structure

```
portfolio-static-site/
├── src/                      # Source code
│   ├── main.py              # Main generator script
│   ├── textnode.py          # Markdown parsing
│   ├── htmlnode.py          # HTML generation
│   └── test_*.py            # Unit tests
├── content/                 # Markdown content
│   ├── index.md            # Home page
│   ├── blog/               # Blog posts
│   └── contact/            # Contact page
├── static/                 # Static assets
│   ├── index.css           # Styling
│   └── images/             # Image files
├── docs/                   # Generated site (GitHub Pages)
├── template.html           # HTML template
├── main.sh                 # Local development script
├── build.sh                # Production build script
└── README.md               # This file
```

## 🔧 Usage

### Running the Generator

**Local development** (basepath `/`):
```bash
python3 src/main.py
```

**Production build** (basepath `/portfolio-static-site/`):
```bash
python3 src/main.py "/portfolio-static-site/"
```

### Adding Content

1. Create a markdown file in the `content/` directory
2. Run the generator to create HTML
3. All links and images will automatically use the configured basepath

### Customizing the Template

Edit `template.html` to change the site layout. Use placeholders:
- `{{ Title }}` - Page title (extracted from first H1 heading)
- `{{ Content }}` - Generated HTML content

## 🎓 Learning Source

This project was built following the **[Building a Static Site Generator in Python](https://www.boot.dev/courses/build-static-site-generator-python)** course on [Boot.dev](https://www.boot.dev).

## 📝 Future Plans

This site is **under active development** and will be personalized in the future to include:
- Personal blog content about topics of interest
- Work portfolio and project showcase
- Updated styling and design
- Additional features and functionality

The foundation and structure are in place—content will evolve to reflect personal interests and professional goals.

## 📜 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and make it your own! This is a great foundation for building a personal site.

---

**Built with ❤️ by [Susana](https://github.com/sucamchi)**
