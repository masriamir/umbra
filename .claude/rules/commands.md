# Commands

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

A `Makefile` is provided at the repo root. Run `make help` to list all targets.

## Setup (after cloning)

```bash
make install            # Install backend + frontend dependencies
make install-hooks      # Install git pre-commit hooks (credential check + docs sync warning)
```

Run `make install-hooks` once per clone. It writes `.git/hooks/pre-commit` which runs:
1. `pre-commit-check.sh` — blocks commits containing `.env` files or hardcoded credentials (hard block, exit 2)
2. `git-pre-commit-docs.sh` — warns when architecture-relevant files are staged without docs changes (soft warning, exit 0)

## Dependencies

```bash
make install            # Install backend + frontend dependencies
make install-backend    # uv sync
make install-frontend   # npm install in frontend/
```

## Development Servers

```bash
make dev                # Run API + frontend concurrently (Ctrl+C stops both)
make api                # Django API server only  (http://localhost:8000)
make frontend           # Vite dev server only    (http://localhost:5173)
```

## Django Management

```bash
make migrate            # Apply pending migrations
make migrations         # Generate migrations for model changes
make shell              # Open the Django shell
make superuser          # Create a Django superuser
```

## Testing

```bash
make test               # Run all backend tests
make test-unit          # Unit tests only  (-m unit)
make test-integration   # Integration tests only  (-m integration)
make test-cov           # Tests with coverage — enforces 80%, outputs to reports/coverage/
make test-watch         # Re-run backend tests on file changes (ptw)
make test-frontend      # Run frontend tests with Vitest
make test-frontend-watch # Re-run frontend tests on file changes
make test-frontend-cov  # Frontend tests with coverage report

# Run a specific backend file or test directly
uv run pytest tests/test_something.py
uv run pytest tests/test_something.py::test_function

# Run backend with coverage manually (no fail-under enforcement)
uv run pytest --cov=todo --cov-report=term-missing
```

Backend coverage is configured in `.coveragerc.toml` (branch coverage, `todo` package only, migrations excluded). Report formats: terminal, HTML, XML (Codecov), JSON, LCOV. All file outputs go to `reports/coverage/` (gitignored).

Frontend tests use **Vitest** + **React Testing Library** + **MSW** (Mock Service Worker). Test infrastructure lives in `frontend/src/test/`: `setup.js` (jest-dom + MSW lifecycle), `server.js` (MSW Node server), `handlers.js` (API stubs), `fixtures.js` (shared data), `utils.jsx` (`renderWithProviders` helper). Test files are colocated with source files (`*.test.jsx`).

## Code Quality

```bash
make check              # lint + format-check + typecheck (no files modified)
make fix                # Auto-fix lint issues and reformat
make lint               # ruff check (report only)
make lint-fix           # ruff check --fix
make format             # ruff format
make format-check       # ruff format --check
make typecheck          # ty
```

## Build & Clean

```bash
make build              # Production frontend build  → frontend/dist/
make clean              # Remove build artifacts and caches
make clean-all          # Remove artifacts + .venv + node_modules
```
