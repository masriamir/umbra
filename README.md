# ef-todo

A todo web application designed to aid people with ADHD who experience disrupted executive functioning (EF). By providing structured organization through color-coded lists, tags, priorities, and due dates, ef-todo reduces the cognitive overhead of managing tasks.

## Features

### Todo Lists
- Create multiple named todo lists to group related tasks
- Assign a color to each list for quick visual identification

### Todo Items
- Add items to any list with a title and optional description
- Set due dates to surface time-sensitive tasks
- Mark items as complete
- Assign a priority order to items within a list
- Track whether an item has been synced to an external system

### Tags
- Create reusable tags with associated colors
- Apply multiple tags to a todo item for cross-list categorization and filtering

### Colors
- Define a palette of named colors (stored as hex codes) shared across lists and tags

## Tech Stack

- **Python 3.13** / **Django 5** / **Django REST Framework**
- **PostgreSQL** (via psycopg 3)
- **uv** for dependency management

## Setup

1. Copy `.env.sample` to `.env` and fill in your PostgreSQL credentials.
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Apply migrations:
   ```bash
   uv run python manage.py migrate
   ```
4. Start the development server:
   ```bash
   uv run python manage.py runserver
   ```
