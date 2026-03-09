# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** `uv` (not pip) for Python, `npm` for the frontend.

```bash
# Run Django API server
uv run python manage.py runserver

# Apply migrations
uv run python manage.py migrate

# Create migrations
uv run python manage.py makemigrations

# Run all tests
uv run pytest

# Run a single test file or test
uv run pytest todo/tests/test_something.py
uv run pytest todo/tests/test_something.py::TestClass::test_method

# Run only unit or integration tests (via markers)
uv run pytest -m unit
uv run pytest -m integration

# Lint
uv run ruff check .

# Format
uv run ruff format .

# Type check
uv run mypy .
```

```bash
# Frontend (from frontend/)
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # Production build
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
