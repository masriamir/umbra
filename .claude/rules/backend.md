---
paths:
  - "**/*.py"
  - "todo/**"
  - "umbra/**"
---

# Backend

## Django Architecture

- `umbra/` — Django project config (settings, root URLs, WSGI/ASGI)
- `umbra/throttles.py` — `LoginRateThrottle` (5 req/min per IP; subclasses `AnonRateThrottle`)
- `todo/` — Single Django app containing all domain logic
  - `todo/models/` — Split across multiple files; all exported via `__init__.py`
  - `todo/serializers/` — DRF serializers using nested-read / ID-write pattern (e.g. `color` on read, `color_id` on write)
  - `todo/views.py` — ModelViewSets for Color, Tag, TodoList, TodoItem (with reorder + export actions); `stats` function-based view
  - `todo/auth_views.py` — Session auth endpoints: `login_view`, `logout_view`, `me_view`
  - `todo/urls.py` — DefaultRouter + manual nested paths for items under lists + auth routes
  - `todo/admin.py` — Admin registrations for all models

## Data Model Hierarchy

- `EFBase` (abstract) — adds `created_date`/`updated_date` to all models
- All top-level models (`Color`, `Tag`, `TodoList`) carry an `owner` FK to `User` (cascade delete). ViewSets filter querysets to `request.user` so users can only access their own data.
- `Color` → `Tag` (one Color has many Tags)
- `Color` → `TodoList` (one Color per list)
- `TodoList` → `TodoItem` (cascade delete)
- `TodoItem` ↔ `Tag` via `TodoItemTag` (M2M through table)

## Authentication & Permissions

All endpoints require `IsAuthenticated` (DRF global default) via `SessionAuthentication`. The three auth endpoints use `AllowAny`:

- `POST /api/auth/login/` — accepts `{username, password}`; opens session + issues `csrftoken` cookie; throttled to 5 req/min per IP
- `POST /api/auth/logout/` — ends session; accepts unauthenticated requests so an expired-session logout doesn't 403
- `GET /api/auth/me/` — returns `{id, username}` for the current session; 403 if unauthenticated

Global throttle rates: `anon` 20/min, `user` 300/min, `login` 5/min.

## API Endpoints

- `/api/colors/`, `/api/tags/`, `/api/lists/` — standard CRUD (owner-scoped)
- `/api/lists/:id/items/` — items scoped to a list
- `POST /api/lists/:id/items/reorder/` — batch reorder `{ "order": [id, ...] }` (atomic)
- `GET /api/lists/:id/items/:id/export/` — export a single item as iCal
- `GET /api/stats/` — summary counts for the authenticated user

## Code Style

**Style guide:** [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html). All public modules, packages, classes, and non-trivial functions require Google-style docstrings (summary line ending in a period, then `Args:` / `Returns:` / `Raises:` sections as needed).

**Ruff config:** line-length=88, double quotes, no preview mode. Active rule sets: S, B, A, COM, C4, T20, PTH, I, C90, N, E, W, F, D, PL, UP, RUF. Docstyle convention: `google`. Globally ignored: E501, COM812, RUF012, D105, D107.

**ty:** strict type checking, Python 3.14 target, migrations and tests excluded. Django ORM `unresolved-attribute` errors suppressed globally; Django field descriptor false positives suppressed in `todo/ics.py`.

## Testing

Test markers (defined in `pytest.toml`): `unit`, `integration`, `functional`, `api`, `slow`, `database`, `network`, `smoke`, `concurrent`, `load`.

Pytest options: verbose, short traceback, show locals, top 10 slowest durations, failed-first, exit on first failure.
