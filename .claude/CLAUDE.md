# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

**Formatting:** Follow `.editorconfig` for all files — final newline, no trailing whitespace, LF line endings, and per-language indent sizes (4 spaces for Python/TOML, 2 for JS/TS/JSON/YAML/HTML/CSS, tabs for Makefile).

**Style guides:** Follow the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) for Python and the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) for JavaScript. All public modules, packages, classes, and functions must have Google-style docstrings.

**Type annotations:** All Python code must carry complete type annotations — mypy runs in `strict` mode (`disallow_untyped_defs`, `disallow_incomplete_defs`, `disallow_untyped_decorators`, `warn_return_any`). Use modern union syntax (`X | None`, `list[str]`, `dict[str, int]`) rather than `Optional`, `List`, `Dict` from `typing`. Never leave a function untyped or return `Any` without explicit justification.

**Python linting rules (ruff):** The following rule sets are active — keep them in mind when generating code:
- **No `print()` calls** (T20) — use `logging` instead.
- **Use `pathlib.Path`** (PTH) — never `os.path` functions.
- **Import order** (I/isort) — stdlib → third-party → first-party (`todo`, `umbra`), each group separated by a blank line.
- **No builtin shadowing** (A) — don't name variables `list`, `id`, `type`, `input`, etc.
- **Security** (S) — no hardcoded secrets, no bare `assert` outside tests, use `subprocess` with `shell=False`.
- **Naming** (N) — `snake_case` for functions/variables/modules, `PascalCase` for classes, `UPPER_CASE` for module-level constants.
- **Docstrings** (D/google) — required on all public modules, classes, and functions (summary line ending in a period, then `Args:` / `Returns:` / `Raises:` sections as needed). Magic methods and `__init__` are exempt.
- **Modern syntax** (UP) — prefer `X | Y` unions, built-in generics (`list[str]` not `List[str]`), and other pyupgrade-recommended idioms for Python 3.14.
- **Complexity** (C90) — keep cyclomatic complexity low; extract helpers rather than nesting deeply.

**Testing:** Backend uses `pytest` with `@pytest.mark.integration` / `@pytest.mark.api` markers. Frontend uses **Vitest + React Testing Library + MSW** — test files are colocated as `*.test.jsx`, shared infrastructure is in `frontend/src/test/`.

**Security:** Run `/security-audit` (or `/security-audit backend|frontend|deps`) to trigger a full AI-powered security review. A `PreToolUse` hook on `git commit` automatically blocks commits that stage `.env` files or obvious hardcoded credentials — see `.claude/hooks/pre-commit-check.sh`.

Detailed rules are organized in `.claude/rules/`:
- `commands.md` — Makefile targets and direct CLI commands
- `environment.md` — Prerequisites, `.env` variables, dev server wiring
- `backend.md` — Django architecture, data model, API, code style *(loads when editing Python files)*
- `frontend.md` — React architecture, component structure, Tailwind CSS v4, testing *(loads when editing frontend files)*
