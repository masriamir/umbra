# Copilot Instructions for Umbra

Umbra is a Django 6 REST API + React 19 SPA for task management. The backend is Python 3.14 and the frontend is JavaScript (React, Vite, Tailwind CSS v4). The database is PostgreSQL. Production runs on Railway via `gunicorn` with WhiteNoise serving the compiled React SPA.

## Package managers

- **Python**: `uv` exclusively — never `pip`. Add dependencies to `pyproject.toml` and sync with `uv sync --all-groups`.
- **Frontend**: `npm` exclusively. Manage dependencies in `frontend/package.json`.

## Project layout

```
todo/           Django app — models, views, serializers, URLs, migrations
umbra/          Django project config — settings.py, root urls.py, wsgi.py
frontend/src/   React SPA — pages/, components/, hooks/, context/, test/
tests/          Backend pytest suite
docs/           Architecture diagrams, runbooks, ADRs (internal + public)
```

## Development servers

```bash
make dev          # Django (port 8000) + Vite dev server (port 5173) concurrently
make api          # Django only
make frontend     # Vite only
```

The Vite server proxies all `/api` requests to Django. Both must run simultaneously during development. Copy `.env.sample` to `.env` and fill in values before first run.

## Installing dependencies

```bash
uv sync --all-groups          # Python — install/sync all dependencies
npm ci --prefix frontend      # Frontend — clean install
```

## Testing

```bash
make test                     # Backend: pytest (requires a running PostgreSQL database)
make test-frontend            # Frontend: vitest run
uv run pytest tests/path.py::test_fn   # Single backend test
```

Backend tests need `DATABASE_URL` or `DB_*` environment variables set in `.env`.

## Code quality — must pass before every PR

```bash
make check    # ruff check + ruff format --check + ty (read-only)
make fix      # ruff check --fix + ruff format (auto-fix linting and formatting)
```

All three gates must pass with zero errors. ty enforces strict type checking.

## Django management

```bash
make migrate        # Apply pending migrations
make migrations     # Generate new migrations after model changes
make shell          # Open the Django shell
```

Never edit migration files manually. Always run `make migrations` then `make migrate`.

## Python conventions

- Google-style docstrings required on all public modules, classes, and functions.
- `snake_case` for functions/variables/modules; `PascalCase` for classes; `UPPER_CASE` for constants.
- Complete type annotations everywhere — no untyped functions or bare `Any`.
- No `print()` — use `logging`. No `os.path` — use `pathlib.Path`.

## Frontend conventions

- Colocate test files as `*.test.jsx` next to the source file.
- Shared test infrastructure lives in `frontend/src/test/` — `setup.js`, `server.js`, `handlers.js`, `fixtures.js`, `utils.jsx`.

## Documentation rules

- Update diagrams in `docs/internal/diagrams/` and `docs/public/diagrams/` when models, routes, or views change.
- Write an ADR in `docs/internal/decisions/` (format: `NNNN-slug.md`) for any cross-layer architectural decision.
- All doc filenames use `kebab-case`.

## Pre-merge checklist

1. `make check` passes (lint + format + type check)
2. `make test` passes (all backend tests green)
3. `make test-frontend` passes (all frontend tests green)
4. Diagrams updated if models, routes, or views changed
5. ADR written if the change affects more than one layer of the stack
