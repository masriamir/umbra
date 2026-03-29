# Commands

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

A `Makefile` is provided at the repo root. Run `make help` to list all targets.

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
make test               # Run all tests
make test-unit          # Unit tests only  (-m unit)
make test-integration   # Integration tests only  (-m integration)
make test-cov           # Tests with coverage — enforces 80%, outputs to reports/coverage/
make test-watch         # Re-run tests on file changes (ptw)

# Run a specific file or test directly
uv run pytest tests/test_something.py
uv run pytest tests/test_something.py::test_function

# Run with coverage manually (no fail-under enforcement)
uv run pytest --cov=todo --cov-report=term-missing
```

Coverage is configured in `.coveragerc.toml` (branch coverage, `todo` package only, migrations excluded). Report formats: terminal, HTML, XML (Codecov), JSON, LCOV. All file outputs go to `reports/coverage/` (gitignored).

## Code Quality

```bash
make check              # lint + format-check + typecheck (no files modified)
make fix                # Auto-fix lint issues and reformat
make lint               # ruff check (report only)
make lint-fix           # ruff check --fix
make format             # ruff format
make format-check       # ruff format --check
make typecheck          # mypy
```

## Build & Clean

```bash
make build              # Production frontend build  → frontend/dist/
make clean              # Remove build artifacts and caches
make clean-all          # Remove artifacts + .venv + node_modules
```
