# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** `uv` (not pip)

```bash
# Run development server
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

## Architecture

This is an early-stage Django REST Framework todo API. The project uses PostgreSQL configured via environment variables in `.env` (see `.env.sample`).

**App structure:**

- `ef_todo/` — Django project config (settings, root URLs, WSGI/ASGI)
- `todo/` — Single Django app containing all domain logic
  - `todo/models/` — Split across multiple files; all exported via `__init__.py`
  - `todo/serializers/` — DRF serializers (not yet wired to views/URLs)
  - `todo/views.py` — Currently empty; REST viewsets go here
  - `todo/admin.py` — Admin registrations for all models

**Data model hierarchy:**

- `EFBase` (abstract) — adds `created_date`/`updated_date` to all models
- `Color` → `Tag` (one Color has many Tags)
- `Color` → `TodoList` (one Color per list)
- `TodoList` → `TodoItem` (cascade delete)
- `TodoItem` ↔ `Tag` via `TodoItemTag` (M2M through table)

**Ruff config:** line-length=88, double quotes, no preview mode. Active rules: S, B, A, COM, C4, T20, PTH, I, C90, N, E, W, F, PL, UP, RUF. Ignored: E501 (line too long), COM812, RUF012.

## Environment Setup

Requires PostgreSQL running locally. Copy `.env.sample` to `.env` and fill in DB credentials. The settings use `django-environ` to read from `.env`.
