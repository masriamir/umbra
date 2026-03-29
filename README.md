# ef-todo

A todo web application designed to aid people with ADHD who experience disrupted executive functioning (EF). By providing structured organization through color-coded lists, tags, priorities, and due dates, ef-todo reduces the cognitive overhead of managing tasks.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Makefile Reference](#makefile-reference)
- [Versioning](#versioning)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Production Build](#production-build)

---

## Features

### Todo Lists
- Create multiple named lists to group related tasks
- Assign a color to each list for quick visual identification
- Color-coded cards with automatic WCAG light/dark text contrast

### Todo Items
- Add items to any list with a title and optional description
- Set due dates to surface time-sensitive tasks
- Mark items as complete (struck-through in the UI)
- Reorder items via drag and drop — order is persisted to the server
- Apply multiple color-coded tags per item
- Set a priority for manual ordering
- Set an importance level (High, Medium, Low) per item
- Set a duration in minutes used when exporting to a calendar

### Calendar Export
- Export an entire list as an iCalendar (`.ics`) file — includes all incomplete items that have a due date
- Export a single item as an iCalendar (`.ics`) file
- Each calendar event includes the item title, due date, duration (defaults to 30 minutes), importance, tags as categories, and a structured description
- Importance maps to RFC 5545 `PRIORITY` values for compatible calendar apps

### Tags
- Create reusable tags with associated colors
- Apply multiple tags to an item for cross-list categorization
- Create new tags inline while editing an item

### Colors
- Define a shared palette of named colors (stored as hex codes)
- Pick from existing swatches or create a custom color with a visual color picker
- Create colors inline while creating a list or tag
- Validates 3-digit (`#RGB`) and 6-digit (`#RRGGBB`) hex formats

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.13 | Runtime |
| Django | 5.2+ | Web framework |
| Django REST Framework | 3.17+ | REST API |
| PostgreSQL | — | Database |
| psycopg | 3.3+ | PostgreSQL driver |
| django-environ | 0.13+ | Environment config |
| django-cors-headers | 4.9+ | CORS handling |
| icalendar | 7.0+ | iCalendar (.ics) generation |
| uv | 0.9.9+ | Dependency management |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 7 | Build tool and dev server |
| Tailwind CSS | v4 | Utility-first CSS |
| TanStack Query | v5 | Server state and caching |
| React Router | v7 | Client-side routing |
| dnd-kit | v6 (core) / v10 (sortable) | Drag-and-drop reordering |
| react-colorful | v5 | Visual color picker |
| Axios | 1 | HTTP client |

### Tooling
| Tool | Purpose |
|---|---|
| Ruff | Python linting and formatting |
| Mypy (strict) | Python static type checking |
| Pytest | Python testing |
| ESLint | Frontend linting |
| PostCSS | CSS processing |

---

## Project Structure

```
ef_todo/
├── ef_todo/                # Django project config
│   ├── settings.py         # Settings (reads from .env)
│   ├── urls.py             # Root URL routing
│   ├── wsgi.py
│   └── asgi.py
│
├── todo/                   # Main Django app
│   ├── models/             # Data models (split by file)
│   │   ├── core.py         # EFBase abstract model (timestamps)
│   │   ├── color.py        # Color model
│   │   ├── tag.py          # Tag model
│   │   ├── todo.py         # TodoList, TodoItem, TodoItemTag
│   │   └── validators.py   # HexCodeValidator
│   ├── serializers/        # DRF serializers
│   ├── migrations/         # Database migrations
│   ├── views.py            # ModelViewSets + reorder action
│   ├── urls.py             # API routes
│   └── admin.py            # Admin registrations
│
├── frontend/               # React SPA
│   └── src/
│       ├── api/            # Axios functions per resource
│       ├── hooks/          # TanStack Query wrappers
│       ├── components/
│       │   ├── ui/         # Shared primitives (Modal, Spinner, ColorPicker, …)
│       │   ├── lists/      # ListCard, ListForm, ListsGrid
│       │   └── items/      # ItemRow (dnd-kit), ItemList, ItemForm, …
│       ├── pages/          # ListsPage (/), ListDetailPage (/lists/:id)
│       └── utils/          # colorUtils.js (WCAG contrast helper)
│
├── Makefile                # Developer convenience commands
├── pyproject.toml          # Python project metadata and dependencies
├── mypy.ini                # Mypy configuration
├── pytest.toml             # Pytest configuration
├── .env.sample             # Environment variable template
└── .python-version         # Pins Python 3.13
```

---

## Prerequisites

- **Python 3.13+** — see `.python-version`
- **uv 0.9.9+** — [install](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js** (LTS) and **npm**
- **PostgreSQL** running locally (or accessible via network)

---

## Local Development

### Quickstart (using Make)

```bash
# 1. Clone and enter the repo
git clone https://github.com/masriamir/ef-todo.git
cd ef-todo

# 2. Configure environment
cp .env.sample .env
# Edit .env with your PostgreSQL credentials

# 3. Install all dependencies (backend + frontend)
make install

# 4. Apply database migrations
make migrate

# 5. (Optional) Create a Django admin superuser
make superuser

# 6. Start both servers concurrently
make dev
```

`make dev` starts the Django API at `http://localhost:8000` and the Vite frontend at `http://localhost:5173`. Press `Ctrl+C` to stop both.

### Manual Setup

#### Backend

```bash
# Install Python dependencies
uv sync

# Apply migrations
uv run python manage.py migrate

# Start API server (http://localhost:8000)
uv run python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `http://localhost:8000`, so both servers must be running simultaneously.

---

## Environment Variables

Copy `.env.sample` to `.env` and fill in the values:

```bash
cp .env.sample .env
```

| Variable | Description | Default |
|---|---|---|
| `DEBUG` | Enable Django debug mode | `False` |
| `SECRET_KEY` | Django secret key | — |
| `DB_NAME` | PostgreSQL database name | `postgres` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DJANGO_SUPERUSER_USERNAME` | Superuser username for `createsuperuser` | `admin` |
| `DJANGO_SUPERUSER_PASSWORD` | Superuser password | — |

---

## Makefile Reference

Run `make help` to list all available targets.

### Dependencies

```bash
make install            # Install backend + frontend dependencies
make install-backend    # uv sync (Python deps only)
make install-frontend   # npm install in frontend/
```

### Development Servers

```bash
make dev                # Run API + frontend servers concurrently (Ctrl+C stops both)
make api                # Django API server only  (http://localhost:8000)
make frontend           # Vite dev server only    (http://localhost:5173)
```

### Django Management

```bash
make migrate            # Apply pending database migrations
make migrations         # Generate new migrations for model changes
make shell              # Open the Django shell
make superuser          # Create a Django admin superuser
```

### Testing

```bash
make test               # Run all tests
make test-unit          # Unit tests only  (-m unit)
make test-integration   # Integration tests only  (-m integration)
make test-cov           # Run tests and print a coverage report
make test-watch         # Re-run tests automatically on file changes
```

### Code Quality

```bash
make check              # Run lint + format-check + typecheck (no files modified)
make fix                # Auto-fix lint issues and reformat code
make lint               # ruff check (report only)
make lint-fix           # ruff check --fix (auto-fix safe issues)
make format             # ruff format (reformat files)
make format-check       # ruff format --check (check only)
make typecheck          # mypy static type check
```

### Versioning

```bash
make version-major      # Tag a new major version (vX.0.0) — resets minor and revision
make version-minor      # Tag a new minor version (vx.Y.0) — resets revision
make version-revision   # Tag a new revision     (vx.y.Z)
```

### Build & Clean

```bash
make build              # Production frontend build  → frontend/dist/
make clean              # Remove build artifacts and caches
make clean-all          # Remove artifacts + .venv + node_modules
```

---

## Versioning

The project uses [hatch-vcs](https://github.com/ofek/hatch-vcs) to derive its version dynamically from annotated git tags. There is no static version string in `pyproject.toml` — the version is resolved at build time from the most recent tag reachable in git history.

Tags follow the `vMAJOR.MINOR.REVISION` format (e.g. `v1.2.3`).

### Bumping the version

Use the Makefile targets to increment the appropriate segment and create the annotated tag in one step:

```bash
make version-major      # v1.4.2 → v2.0.0  (breaking change)
make version-minor      # v1.4.2 → v1.5.0  (new feature)
make version-revision   # v1.4.2 → v1.4.3  (bug fix / patch)
```

Each target reads the latest tag, increments the correct number, and runs:

```bash
git tag -a "vX.Y.Z" -m "Version X.Y.Z"
```

Push the tag to the remote when ready:

```bash
git push origin vX.Y.Z
```

### Development builds

Commits made after a tag resolve to a dev version string such as `1.4.2.dev5+gabcdef0`, indicating 5 commits past `v1.4.2`. This is handled automatically by `hatch-vcs` and requires no manual action.

### Initial tag

If no tags exist yet, the version resolves to a dev build against `0.0.0`. Create the first tag to establish a baseline:

```bash
git tag -a "v0.1.0" -m "Version 0.1.0"
```

---

## Testing

Tests use [pytest](https://pytest.org) with the following markers:

| Marker | Description |
|---|---|
| `unit` | Pure unit tests (no I/O) |
| `integration` | Tests involving the database or external services |
| `functional` | End-to-end feature tests |
| `api` | API endpoint tests |
| `slow` | Tests that take longer to run |
| `database` | Tests requiring a database connection |

```bash
# Run all tests
make test

# Run by marker
make test-unit
make test-integration

# Run a specific file or test
uv run pytest todo/tests/test_something.py
uv run pytest todo/tests/test_something.py::TestClass::test_method

# With coverage
make test-cov

# Watch mode (re-runs on file save)
make test-watch
```

Pytest is configured in `pytest.toml`. Logs are written to `logs/pytest-logs.log` (DEBUG level) and printed to the console at INFO level during test runs.

---

## Code Quality

The project enforces strict code quality standards.

### Python

| Tool | Config | Command |
|---|---|---|
| Ruff (lint) | `pyproject.toml` — line-length 88, double quotes | `make lint` |
| Ruff (format) | `pyproject.toml` | `make format` |
| Mypy | `mypy.ini` — strict mode, Python 3.13 | `make typecheck` |

Run all checks at once (read-only, no files modified):

```bash
make check
```

Auto-fix and reformat:

```bash
make fix
```

### Frontend

ESLint is configured in `frontend/eslint.config.js`.

```bash
cd frontend
npm run lint
```

---

## API Reference

All endpoints are under `/api/`. The Django admin interface is available at `/admin/`.

### Serializer pattern

- **Read** responses return nested objects: `color: { id, name, hex_code }`, `tags: [...]`
- **Write** requests accept IDs: `color_id`, `tag_ids`

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` / `POST` | `/api/colors/` | List or create colors |
| `GET` / `PATCH` / `DELETE` | `/api/colors/:id/` | Retrieve, update, or delete a color |
| `GET` / `POST` | `/api/tags/` | List or create tags |
| `GET` / `PATCH` / `DELETE` | `/api/tags/:id/` | Retrieve, update, or delete a tag |
| `GET` / `POST` | `/api/lists/` | List or create todo lists |
| `GET` / `PATCH` / `DELETE` | `/api/lists/:id/` | Retrieve, update, or delete a list |
| `GET` | `/api/lists/:id/export/` | Export list as `.ics` (incomplete items with a due date) |
| `GET` / `POST` | `/api/lists/:id/items/` | List or create items within a list |
| `GET` / `PATCH` / `DELETE` | `/api/lists/:id/items/:item_id/` | Retrieve, update, or delete an item |
| `GET` | `/api/lists/:id/items/:item_id/export/` | Export a single item as `.ics` (requires a due date) |
| `POST` | `/api/lists/:id/items/reorder/` | Atomic batch reorder: `{ "order": [id, ...] }` |

---

## Data Model

```
EFBase (abstract)
└── created_date, updated_date

Color
├── name        (unique, max 32 chars)
└── hex_code    (unique, validated #RGB or #RRGGBB)

Tag
├── name        (unique, max 32 chars)
└── color  ──FK──> Color (PROTECT)

TodoList
├── name        (unique, max 32 chars)
├── description (optional, max 256 chars)
└── color  ──FK──> Color (PROTECT)

TodoItem
├── title            (max 64 chars)
├── description      (optional, max 256 chars)
├── due_date         (optional datetime)
├── duration_minutes (optional positive integer, defaults to 30 for calendar export)
├── importance       (integer choice: None=0, High=1, Medium=5, Low=9 — RFC 5545 PRIORITY)
├── completed        (boolean)
├── synced           (boolean)
├── priority         (positive integer, for ordering)
├── list   ──FK──> TodoList (CASCADE)
└── tags   ──M2M──> Tag (via TodoItemTag)

TodoItemTag  (M2M through table)
├── todo_item ──FK──> TodoItem (CASCADE)
└── tag       ──FK──> Tag (CASCADE)
```

---

## Production Build

Build the React frontend for production:

```bash
make build
# Output: frontend/dist/
```

The compiled static files in `frontend/dist/` can be served by Django's `staticfiles` or any static file host (e.g. S3, Nginx). The Django API is a standard WSGI/ASGI app — deploy with Gunicorn/Uvicorn behind Nginx or any compatible platform.

Set `DEBUG=False` and configure `SECRET_KEY`, `ALLOWED_HOSTS`, and database credentials via environment variables in production.
