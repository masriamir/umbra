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
| `SECRET_KEY` | Django secret key |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host (default: `localhost`) |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DJANGO_SUPERUSER_USERNAME` | Superuser username for `createsuperuser` |
| `DJANGO_SUPERUSER_PASSWORD` | Superuser password |

Settings are loaded via `django-environ` from `.env`.

## Dev Server Wiring

The Vite dev server (`http://localhost:5173`) proxies all `/api` requests to the Django server (`http://localhost:8000`). Both servers must be running simultaneously during development — use `make dev` to start them together.
