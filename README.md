# Umbra

A TODO web application designed to aid people with ADHD who experience disrupted executive functioning (EF). By providing a structured organization through color-coded lists, tags, priorities, and due dates, Umbra reduces the cognitive overhead of managing tasks.

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
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Deployment](#deployment)

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
- Manage all tags (create, edit, delete) from a dedicated Tags page

### Colors
- Define a shared palette of named colors (stored as hex codes)
- Pick from existing swatches or create a custom color with a visual color picker
- Create colors inline while creating a list or tag
- Validates 3-digit (`#RGB`) and 6-digit (`#RRGGBB`) hex formats
- Manage all colors (create, edit, delete) from a dedicated Colors page

### Dashboard
- Overview of aggregate statistics: total lists, total items, completed vs. active counts
- Due-date awareness: overdue items, items due within 7 days, items with no due date
- Importance breakdown: active item counts grouped by High, Medium, Low, and None
- Top lists by item count with per-list completion percentage
- Most-used tags ranked by item usage count

### Authentication
- Session-based login with a dedicated Login page
- All data is scoped to the authenticated user — no user can access another's lists, tags, or colors
- The application header shows the logged-in username and a logout button
- Unauthenticated requests are redirected to `/login` automatically

### Theming
- One Light and One Dark color schemes toggled from the application header
- Preference is persisted to `localStorage` and restored on next visit
- Anti-flash script in `index.html` applies the correct theme before first paint

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.14 | Runtime |
| Django | 6.0+ | Web framework |
| Django REST Framework | 3.17+ | REST API |
| PostgreSQL | — | Database |
| psycopg | 3.3+ | PostgreSQL driver |
| django-environ | 0.13+ | Environment config |
| django-cors-headers | 4.9+ | CORS handling |
| django-csp | 4.0+ | Content Security Policy headers |
| icalendar | 7.0+ | iCalendar (.ics) generation |
| WhiteNoise | 6.12+ | Static file serving (production) |
| Gunicorn | 25.3+ | WSGI application server (production) |
| uv | 0.9.9+ | Dependency management |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | v4 | Utility-first CSS |
| TanStack Query | v5 | Server state and caching |
| React Router | v7 | Client-side routing |
| dnd-kit | v6 (core) / v10 (sortable) | Drag-and-drop reordering |
| react-colorful | v5 | Visual color picker |
| Axios | 1 | HTTP client |
| Vitest | 4 | Frontend test runner |
| React Testing Library | 16 | Component and page testing |
| MSW | 2 | API mocking for tests |

### Tooling
| Tool | Purpose |
|---|---|
| Ruff | Python linting and formatting |
| Mypy (strict) | Python static type checking |
| Pytest | Backend testing |
| ESLint | Frontend linting |
| Vitest + RTL + MSW | Frontend testing |
| PostCSS | CSS processing |

---

## Project Structure

```
umbra/
├── umbra/                  # Django project config
│   ├── settings.py         # Settings (reads from .env or environment)
│   ├── throttles.py        # LoginRateThrottle (5 req/min per IP)
│   ├── urls.py             # Root URL routing + health check
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
│   ├── serializers/        # DRF serializers (owner-scoped querysets)
│   ├── migrations/         # Database migrations
│   ├── views.py            # ModelViewSets, reorder + export actions, stats view
│   ├── auth_views.py       # login_view, logout_view, me_view
│   ├── urls.py             # API routes (CRUD + auth + stats + export)
│   └── admin.py            # Admin registrations
│
├── frontend/               # React SPA
│   └── src/
│       ├── api/
│       │   ├── client.js   # Axios instance (CSRF interceptor + 403 → /login redirect)
│       │   ├── auth.js     # login(), logout(), getMe()
│       │   └── …           # colors.js, tags.js, lists.js, items.js, stats.js
│       ├── context/
│       │   └── AuthContext.jsx  # AuthProvider, useAuth() hook
│       ├── hooks/          # TanStack Query wrappers (useColors, useTags, useLists, useItems, useStats, …)
│       ├── components/
│       │   ├── ProtectedRoute.jsx  # Redirects unauthenticated users to /login
│       │   ├── ui/         # Shared primitives (Header, Modal, Spinner, ColorPicker, …)
│       │   ├── lists/      # ListCard, ListForm, ListsGrid
│       │   └── items/      # ItemRow (dnd-kit), ItemList, ItemForm, …
│       ├── pages/          # LoginPage (/login), DashboardPage (/), ListsPage (/lists),
│       │                   #   ListDetailPage (/lists/:id), TagsPage (/tags), ColorsPage (/colors)
│       ├── test/           # Vitest infrastructure (setup, MSW server, handlers, fixtures, utils)
│       └── utils/          # colorUtils.js (WCAG contrast helper)
│
├── Makefile                # Developer convenience commands
├── pyproject.toml          # Python project metadata and dependencies
├── mypy.ini                # Mypy configuration
├── pytest.toml             # Pytest configuration
├── railway.toml            # Railway deployment configuration
├── railpack.json           # Railpack config — declares Node.js 22 for the frontend build
├── .env.sample             # Environment variable template
└── .python-version         # Pins Python 3.14.4
```

---

## Prerequisites

- **Python 3.14+** — see `.python-version`
- **uv 0.9.9+** — [install](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js** (LTS) and **npm**
- **PostgreSQL** running locally (or accessible via network)

---

## Local Development

### Quickstart (using Make)

```bash
# 1. Clone and enter the repo
git clone https://github.com/masriamir/umbra.git
cd umbra

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
| `SECRET_KEY` | Django secret key (required) | — |
| `ALLOWED_HOSTS` | Comma-separated hostnames Django will serve | `localhost,127.0.0.1` |
| `DATABASE_URL` | Full DB URL — takes precedence over `DB_*` vars; injected automatically by Railway | — |
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
make test               # Run all backend tests
make test-unit          # Unit tests only  (-m unit)
make test-integration   # Integration tests only  (-m integration)
make test-cov           # Run backend tests with coverage report
make test-watch         # Re-run backend tests automatically on file changes
make test-frontend      # Run frontend tests with Vitest
make test-frontend-watch # Re-run frontend tests on file changes
make test-frontend-cov  # Run frontend tests with coverage report
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

### Backend

Tests use [pytest](https://pytest.org) with the following markers:

| Marker | Description |
|---|---|
| `unit` | Pure unit tests (no I/O) |
| `integration` | Tests involving the database or external services |
| `functional` | End-to-end feature tests |
| `api` | API endpoint tests |
| `slow` | Tests that take longer to run |
| `database` | Tests requiring a database connection |
| `network` | Tests requiring network access |
| `ui` | UI component tests |
| `smoke` | Basic smoke tests for critical functionality |
| `concurrent` | Tests involving concurrent execution |
| `load` | Load and performance tests |

```bash
# Run all backend tests
make test

# Run by marker
make test-unit
make test-integration

# Run a specific file or test
uv run pytest tests/test_something.py
uv run pytest tests/test_something.py::test_function

# With coverage (enforces 80% minimum)
make test-cov

# Watch mode (re-runs on file save)
make test-watch
```

Pytest is configured in `pytest.toml`. Logs are written to `logs/pytest.log` (DEBUG level) and printed to the console at INFO level during test runs.

### Frontend

Frontend tests use **Vitest**, **React Testing Library**, and **MSW** (Mock Service Worker) to intercept API calls at the network layer. Test files are colocated with source files as `*.test.jsx`.

```bash
make test-frontend          # Run all frontend tests once
make test-frontend-watch    # Re-run on file changes
make test-frontend-cov      # Run with coverage report
```

Shared infrastructure in `frontend/src/test/`:

| File | Purpose |
|---|---|
| `setup.js` | Imports `@testing-library/jest-dom` matchers and manages MSW server lifecycle |
| `server.js` | MSW Node server instance shared across all test files |
| `handlers.js` | Default API stubs for all routes (auth, stats, colors, tags, lists) |
| `fixtures.js` | Shared mock data (`mockUser`, `mockColors`, `mockTags`, `mockStats`) |
| `utils.jsx` | `renderWithProviders(ui, { route })` — wraps with `QueryClientProvider`, `MemoryRouter`, and a pre-seeded `AuthContext` (authenticated by default) |

### Coverage

`make test-cov` measures branch coverage of the `todo` package and enforces a minimum of **80%**. It outputs four report formats to `reports/coverage/`:

| Format | Path | Purpose |
|---|---|---|
| Terminal | stdout | Quick summary with missing line numbers |
| HTML | `reports/coverage/html/` | Human-readable browsable report |
| XML | `reports/coverage/coverage.xml` | Codecov / CI integration |
| JSON | `reports/coverage/coverage.json` | Programmatic consumption |
| LCOV | `reports/coverage/coverage.lcov` | Editor integrations (e.g. VS Code Coverage Gutters) |

Coverage is configured in `.coveragerc.toml`. The `reports/` directory is gitignored. To mark a block as intentionally untested, use `# pragma: no cover`.

---

## Code Quality

The project enforces strict code quality standards following Google style conventions — [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) for Python and [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) for JavaScript. All public modules, packages, classes, and functions must have Google-style docstrings.

### Python

| Tool | Config | Command |
|---|---|---|
| Ruff (lint + docstyle) | `pyproject.toml` — line-length 88, double quotes, Google docstring convention | `make lint` |
| Ruff (format) | `pyproject.toml` | `make format` |
| Mypy | `mypy.ini` — strict mode, Python 3.14 | `make typecheck` |
| pytest-cov | `.coveragerc.toml` — branch coverage, 80% minimum, `reports/coverage/` | `make test-cov` |

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

## Authentication

Umbra uses Django's session-based authentication. The React SPA communicates with three dedicated endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login/` | Accepts `{ username, password }`. Opens a session and issues a `csrftoken` cookie. Throttled to 5 requests/min per IP. |
| `POST` | `/api/auth/logout/` | Ends the current session. Accepts unauthenticated requests so an expired-session logout does not 403. |
| `GET` | `/api/auth/me/` | Returns `{ id, username }` for the active session; 403 if unauthenticated. |

### How it works

1. On app load, `AuthProvider` calls `GET /api/auth/me/` to check the existing session.
2. While the check is in flight, `ProtectedRoute` renders a spinner rather than redirecting.
3. If no session exists, the user is redirected to `/login`.
4. After a successful login, `AuthProvider` stores `{ id, username }` in React state and navigates to `/`.
5. All mutating API calls go through `api/client.js`, which reads the `csrftoken` cookie and attaches it as `X-CSRFToken`. Any `403` response triggers a hard redirect to `/login`.
6. All data (lists, items, tags, colors) is filtered server-side to the authenticated user — cross-user access is rejected at the serializer queryset level.

---

## API Reference

All endpoints are under `/api/`. The Django admin interface is available at `/admin/`.

### Serializer pattern

- **Read** responses return nested objects: `color: { id, name, hex_code }`, `tags: [...]`
- **Write** requests accept IDs: `color_id`, `tag_ids`

### Endpoints

All endpoints except the auth trio below require an active session (`IsAuthenticated`). Results are always scoped to the authenticated user.

#### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login/` | Open a session (`{ username, password }`) |
| `POST` | `/api/auth/logout/` | End the current session |
| `GET` | `/api/auth/me/` | Return `{ id, username }` for the active session |

#### Resources

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats/` | Aggregate dashboard statistics (totals, due dates, importance breakdown, top lists and tags) |
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
├── owner    ──FK──> User (CASCADE)
├── name        (unique per user, max 32 chars)
└── hex_code    (unique per user, validated #RGB or #RRGGBB)

Tag
├── owner    ──FK──> User (CASCADE)
├── name        (unique per user, max 32 chars)
└── color  ──FK──> Color (PROTECT)

TodoList
├── owner    ──FK──> User (CASCADE)
├── name        (unique per user, max 32 chars)
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

## Deployment

### Local production build

```bash
make build          # Compiles the React SPA → frontend/dist/
uv run python manage.py collectstatic --noinput
```

WhiteNoise serves both the SPA (`frontend/dist/`) and Django admin assets (`staticfiles/`) in production. In development neither directory is required — `runserver` and the Vite dev server handle static files directly.

### Railway

The project is configured for one-command deployment to [Railway](https://railway.app) via `railway.toml` and `railpack.json`.

#### First-time setup

1. Create a new Railway project and add a service from your GitHub repository.
2. Add a **PostgreSQL** plugin to the same project — Railway injects `DATABASE_URL` into the service automatically.
3. Set the following environment variables on the web service:

   | Variable | Value |
   |---|---|
   | `SECRET_KEY` | A long random string |
   | `ALLOWED_HOSTS` | Your Railway domain (e.g. `umbra-production.up.railway.app`) |
   | `DEBUG` | `False` |

4. Deploy. Railway picks up `railway.toml` and `railpack.json` automatically.

#### What happens on each deploy

| Phase | Action |
|---|---|
| **Setup** | Railpack detects Python (from `.python-version`) and uv; Node.js 22 is installed from `railpack.json` |
| **Install** | `uv sync --no-dev --frozen` installs backend dependencies into the virtual environment |
| **Build** | Builds the React SPA (`cd frontend && npm install && npm run build`), then runs `python manage.py collectstatic` |
| **Start** | Runs `migrate` (idempotent), then starts Gunicorn on `$PORT` with 2 workers |

The health check polls `GET /health/` with a 30-second timeout. If the service fails to start, Railway restarts it automatically (`restartPolicyType = "on_failure"`).
