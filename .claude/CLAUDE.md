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

**Branching workflow:** This project follows Gitflow. Before starting any GitHub issue or new feature: (1) switch to `main` and pull the latest changes (`git pull --rebase`), (2) create and checkout a new branch named `feature/###-short-description`, where `###` is the GitHub issue number. Never commit feature work directly to `main`. To keep a feature branch up to date with `main`: prefer a fast-forward merge when possible; otherwise a regular merge commit is fine. Prefer `git pull --rebase` over `git pull` when syncing a branch with its remote tracking branch.

**GitHub issue linking:** When creating a PR or writing a commit message that completes a GitHub issue, include a closing keyword so GitHub auto-closes the issue on merge. Use `Closes #NNN`, `Fixes #NNN`, or `Resolves #NNN` (GitHub recognises all three and their past-tense variants). Put the keyword in the PR body (preferred) or in the final commit message. Never use informal phrasing like "related to #NNN" when the intent is to close the issue.

**Security:** Run `/security-audit` (or `/security-audit backend|frontend|deps`) to trigger a full AI-powered security review. A `PreToolUse` hook on `git commit` automatically blocks commits that stage `.env` files or obvious hardcoded credentials — see `.claude/hooks/pre-commit-check.sh`.

**Documentation (`docs/`):** Architecture diagrams, runbooks, ADRs, and API references live in `docs/`. The directory is split by audience:
- `docs/internal/` — developer-facing material (technical diagrams, runbooks, Architecture Decision Records). Never requires a public-safe review.
- `docs/public/` — safe to publish. Protected by `CODEOWNERS`: any PR touching this subtree requires `@masriamir` approval before merge.

Sub-categories within each audience directory:
- `diagrams/` — Mermaid (`.mmd`) architecture and data model diagrams
- `runbooks/` — operational procedures (deploy, rollback, DB migrations)
- `decisions/` — Architecture Decision Records (ADRs, internal only)
- `api/` — public API reference (public only)
- `guides/` — user-facing guides (public only)

**Docs file naming:** All filenames use `kebab-case` (no spaces, no underscores, no camelCase). No version suffixes — use git history instead.

**ADR format:** Decision records in `docs/internal/decisions/` are numbered and named `NNNN-slug.md` (e.g. `0001-session-auth-over-jwt.md`), zero-padded to four digits. Records are immutable once merged — superseded ones are marked with a `Superseded by` status rather than deleted. Each ADR has three sections: **Context** (what prompted the decision), **Decision** (what was chosen), **Consequences** (tradeoffs).

**When to write an ADR:** Write one when a decision meets any of these criteria: (1) it affects more than one layer of the stack, (2) it rules out alternatives that would seem reasonable to a future contributor, or (3) it carries non-obvious tradeoffs that aren't apparent from reading the code. Bug fixes, routine feature additions, and style choices do not qualify.

**ADR behaviour:** During any discussion of architecture or technology choices, proactively suggest drafting an ADR. At implementation time, if the change meets the criteria above, create the ADR in `docs/internal/decisions/` with status `Accepted` before marking the task complete. Use status `Proposed` if the decision is still being discussed.

**Docs sync — required diagram updates:** After editing any of the files below, update the corresponding diagrams before finishing the task. A `PostToolUse` hook (`docs-sync-check.sh`) will also remind you automatically.

| File(s) changed | Diagrams to update |
|---|---|
| `todo/models/*` | `data-model.mmd` (both internal + public) |
| `todo/urls.py`, `umbra/urls.py` | `system-architecture.mmd`; also `frontend-routes.mmd` if a new top-level route was added |
| `todo/views.py`, `todo/auth_views.py` | `system-architecture.mmd`; also `auth-flow.mmd` if auth logic changed |
| `todo/serializers/*` | `data-model.mmd`; consider `docs/public/api/` if the public contract changed |
| `frontend/src/App.jsx`, `frontend/src/main.jsx` | All four frontend diagrams (`frontend-routes.mmd` + `frontend-component-tree.mmd`) |
| `frontend/src/pages/*` | `frontend-routes.mmd` + `frontend-component-tree.mmd` (both internal + public) |
| `frontend/src/components/*`, `frontend/src/hooks/*`, `frontend/src/context/*` | `frontend-component-tree.mmd` (both internal + public) |
| `railway.toml`, `nixpacks.toml`, `umbra/settings.py` | `system-architecture.mmd`; consider an ADR if this is a significant architectural choice |

Detailed rules are organized in `.claude/rules/`:
- `commands.md` — Makefile targets and direct CLI commands
- `environment.md` — Prerequisites, `.env` variables, dev server wiring
- `backend.md` — Django architecture, data model, API, code style *(loads when editing Python files)*
- `frontend.md` — React architecture, component structure, Tailwind CSS v4, testing *(loads when editing frontend files)*
