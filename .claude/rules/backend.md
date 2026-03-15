---
paths:
  - "**/*.py"
  - "todo/**"
  - "ef_todo/**"
---

# Backend

## Django Architecture

- `ef_todo/` — Django project config (settings, root URLs, WSGI/ASGI)
- `todo/` — Single Django app containing all domain logic
  - `todo/models/` — Split across multiple files; all exported via `__init__.py`
  - `todo/serializers/` — DRF serializers using nested-read / ID-write pattern (e.g. `color` on read, `color_id` on write)
  - `todo/views.py` — ModelViewSets for Color, Tag, TodoList, TodoItem (with reorder action)
  - `todo/urls.py` — DefaultRouter + manual nested paths for items under lists
  - `todo/admin.py` — Admin registrations for all models

## Data Model Hierarchy

- `EFBase` (abstract) — adds `created_date`/`updated_date` to all models
- `Color` → `Tag` (one Color has many Tags)
- `Color` → `TodoList` (one Color per list)
- `TodoList` → `TodoItem` (cascade delete)
- `TodoItem` ↔ `Tag` via `TodoItemTag` (M2M through table)

## API Endpoints

- `/api/colors/`, `/api/tags/`, `/api/lists/` — standard CRUD
- `/api/lists/:id/items/` — items scoped to a list
- `POST /api/lists/:id/items/reorder/` — batch reorder `{ "order": [id, ...] }` (atomic)

## Code Style

**Ruff config:** line-length=88, double quotes, no preview mode. Active rules: S, B, A, COM, C4, T20, PTH, I, C90, N, E, W, F, PL, UP, RUF. Ignored: E501, COM812, RUF012.

**Mypy:** strict mode enabled, Python 3.13 target, migrations excluded.

## Testing

Test markers (defined in `pytest.toml`): `unit`, `integration`, `functional`, `api`, `slow`, `database`, `network`, `smoke`, `concurrent`, `load`.

Pytest options: verbose, short traceback, show locals, top 10 slowest durations, failed-first, exit on first failure.
