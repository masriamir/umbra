# Environment Setup

## Prerequisites

- Python 3.14+ (pinned in `.python-version`)
- uv 0.9.9+ for Python dependency management
- Node.js (LTS) + npm for the frontend
- PostgreSQL running locally (or accessible via network)

## Environment Variables

Copy `.env.sample` to `.env` and fill in the values:

```bash
cp .env.sample .env
```

| Variable | Description |
|---|---|
| `DEBUG` | Enable Django debug mode |
| `SECRET_KEY` | Django secret key (required; no default) |
| `ALLOWED_HOSTS` | Comma-separated hostnames Django will serve (default: `localhost,127.0.0.1`) |
| `DATABASE_URL` | Full DB URL — takes precedence over `DB_*` vars; injected automatically by Railway |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host (default: `localhost`) |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DJANGO_SUPERUSER_USERNAME` | Superuser username for `createsuperuser` |
| `DJANGO_SUPERUSER_PASSWORD` | Superuser password |

Settings are loaded via `django-environ` from `.env`. In production (Railway), environment variables are injected directly — the `.env` file is not present and that is expected.

## Deployment (Railway)

`railway.toml` configures the Railway deployment:

- **Build:** Railpack detects Python and uv natively; runs `cd frontend && npm install && npm run build`, then `uv run python manage.py collectstatic --noinput`.
- **Start:** runs `migrate` (idempotent), then starts `gunicorn` on `$PORT` with 2 workers.
- **Health check:** `GET /health/` with a 30-second timeout.
- **Static files:** WhiteNoise serves both the React SPA (`frontend/dist/`) and Django admin assets (`staticfiles/`). In development WhiteNoise is not loaded — `runserver` handles static files directly.
- **Database:** attach Railway's PostgreSQL plugin; it injects `DATABASE_URL` automatically.

## Dev Server Wiring

The Vite dev server (`http://localhost:5173`) proxies all `/api` requests to the Django server (`http://localhost:8000`). Both servers must be running simultaneously during development — use `make dev` to start them together.
