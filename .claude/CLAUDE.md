# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

**Formatting:** Follow `.editorconfig` for all files — final newline, no trailing whitespace, LF line endings, and per-language indent sizes (4 spaces for Python/TOML, 2 for JS/TS/JSON/YAML/HTML/CSS, tabs for Makefile).

Detailed rules are organized in `.claude/rules/`:
- `commands.md` — Makefile targets and direct CLI commands
- `environment.md` — Prerequisites, `.env` variables, dev server wiring
- `backend.md` — Django architecture, data model, API, code style *(loads when editing Python files)*
- `frontend.md` — React architecture, component structure, Tailwind CSS v4 *(loads when editing frontend files)*
