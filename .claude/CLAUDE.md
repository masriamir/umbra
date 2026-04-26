# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

**Formatting:** Follow `.editorconfig` for all files — final newline, no trailing whitespace, LF line endings, and per-language indent sizes (4 spaces for Python/TOML, 2 for JS/TS/JSON/YAML/HTML/CSS, tabs for Makefile).

**Style guides:** Follow the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) for Python and the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) for JavaScript. All public modules, packages, classes, and functions must have Google-style docstrings.

**Testing:** Backend uses `pytest` with `@pytest.mark.integration` / `@pytest.mark.api` markers. Frontend uses **Vitest + React Testing Library + MSW** — test files are colocated as `*.test.jsx`, shared infrastructure is in `frontend/src/test/`.

Detailed rules are organized in `.claude/rules/`:
- `commands.md` — Makefile targets and direct CLI commands
- `environment.md` — Prerequisites, `.env` variables, dev server wiring
- `backend.md` — Django architecture, data model, API, code style *(loads when editing Python files)*
- `frontend.md` — React architecture, component structure, Tailwind CSS v4, testing *(loads when editing frontend files)*
