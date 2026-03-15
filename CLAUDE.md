# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

A `Makefile` is provided at the repo root. Run `make help` to list all targets. Key targets:

```bash
# Dependencies
make install            # Install backend + frontend dependencies
make install-backend    # uv sync
make install-frontend   # npm install in frontend/

# Development servers
make dev                # Run API + frontend concurrently (Ctrl+C stops both)
make api                # Django API server only
make frontend           # Vite dev server only

# Django management
make migrate            # Apply pending migrations
make migrations         # Generate migrations for model changes
make shell              # Open Django shell
make superuser          # Create a Django superuser

# Testing
make test               # Run all tests
make test-unit          # Unit tests only  (-m unit)
make test-integration   # Integration tests only  (-m integration)
make test-cov           # Tests with coverage report
make test-watch         # Re-run tests on file changes (ptw)

# Code quality
make check              # lint + format-check + typecheck (no files modified)
make fix                # Auto-fix lint issues and reformat
make lint               # ruff check (report only)
make lint-fix           # ruff check --fix
make format             # ruff format
make format-check       # ruff format --check
make typecheck          # mypy

# Build & clean
make build              # Production frontend build
make clean              # Remove build artifacts and caches
make clean-all          # Remove artifacts + .venv + node_modules
```

You can still run commands directly if needed:

```bash
# Run a single test file or specific test
uv run pytest todo/tests/test_something.py
uv run pytest todo/tests/test_something.py::TestClass::test_method
```

## Architecture

A Django REST Framework API backend with a separate React SPA frontend.

**Django backend (`/`):**
- `ef_todo/` — Django project config (settings, root URLs, WSGI/ASGI)
- `todo/` — Single Django app containing all domain logic
  - `todo/models/` — Split across multiple files; all exported via `__init__.py`
  - `todo/serializers/` — DRF serializers using nested-read / ID-write pattern (e.g. `color` on read, `color_id` on write)
  - `todo/views.py` — ModelViewSets for Color, Tag, TodoList, TodoItem (with reorder action)
  - `todo/urls.py` — DefaultRouter + manual nested paths for items under lists
  - `todo/admin.py` — Admin registrations for all models

**React frontend (`frontend/src/`):**
- `api/` — Axios functions per resource (colors, tags, lists, items)
- `hooks/` — TanStack Query wrappers (`useColors`, `useTags`, `useLists`, `useItems`, `useReorderItems`)
- `components/ui/` — Shared primitives: `ColorPicker`, `ColorSwatch`, `TagBadge`, `TagSelector`, `Modal`, `Spinner`, `ErrorMessage`
- `components/lists/` — `ListCard`, `ListForm`, `ListsGrid`
- `components/items/` — `ItemRow` (dnd-kit sortable), `ItemList` (DndContext), `ItemForm`, `DragHandle`, `ItemCheckbox`
- `pages/` — `ListsPage` (`/`), `ListDetailPage` (`/lists/:id`)
- `utils/colorUtils.js` — `getContrastTextColor(hex)` — WCAG luminance contrast; handles 3-digit hex

**API endpoints:**
- `/api/colors/`, `/api/tags/`, `/api/lists/` — standard CRUD
- `/api/lists/:id/items/` — items scoped to a list
- `POST /api/lists/:id/items/reorder/` — batch reorder `{ "order": [id, ...] }` (atomic)

**Data model hierarchy:**
- `EFBase` (abstract) — adds `created_date`/`updated_date` to all models
- `Color` → `Tag` (one Color has many Tags)
- `Color` → `TodoList` (one Color per list)
- `TodoList` → `TodoItem` (cascade delete)
- `TodoItem` ↔ `Tag` via `TodoItemTag` (M2M through table)

**Ruff config:** line-length=88, double quotes, no preview mode. Active rules: S, B, A, COM, C4, T20, PTH, I, C90, N, E, W, F, PL, UP, RUF. Ignored: E501, COM812, RUF012.

**Tailwind CSS v4** is used in the frontend. Use `@import "tailwindcss"` in CSS (not the v3 `@tailwind` directives). PostCSS plugin is `@tailwindcss/postcss`.

## Environment Setup

Requires PostgreSQL running locally. Copy `.env.sample` to `.env` and fill in DB credentials. The settings use `django-environ` to read from `.env`.

The Vite dev server proxies `/api` requests to `http://localhost:8000`, so both servers must be running during development.
