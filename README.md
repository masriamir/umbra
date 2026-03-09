# ef-todo

A todo web application designed to aid people with ADHD who experience disrupted executive functioning (EF). By providing structured organization through color-coded lists, tags, priorities, and due dates, ef-todo reduces the cognitive overhead of managing tasks.

## Features

### Todo Lists
- Create multiple named todo lists to group related tasks
- Assign a color to each list for quick visual identification
- Color-coded cards with automatic light/dark text contrast

### Todo Items
- Add items to any list with a title and optional description
- Set due dates to surface time-sensitive tasks
- Mark items as complete (struck-through in the UI)
- Reorder items via drag and drop — order is persisted to the server
- Apply multiple color-coded tags per item

### Tags
- Create reusable tags with associated colors
- Apply multiple tags to a todo item for cross-list categorization
- Create new tags inline while editing an item

### Colors
- Define a shared palette of named colors (stored as hex codes)
- Pick from existing swatches or create a custom color with a visual color picker
- New colors can be created inline while creating a list or tag

## Tech Stack

**Backend**
- Python 3.13 / Django 5 / Django REST Framework
- PostgreSQL (via psycopg 3)
- uv for dependency management

**Frontend**
- React 18 / Vite 7
- Tailwind CSS v4
- TanStack Query v5 (server state and caching)
- React Router v6
- dnd-kit (drag-and-drop)
- react-colorful (color picker)
- Axios (HTTP client)

## Setup

### Backend

1. Copy `.env.sample` to `.env` and fill in your PostgreSQL credentials.
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Apply migrations:
   ```bash
   uv run python manage.py migrate
   ```
4. Start the API server:
   ```bash
   uv run python manage.py runserver
   ```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies all `/api` requests to the Django server at `http://localhost:8000`, so both must be running during development.

## API

All endpoints are under `/api/`.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/colors/` | List or create colors |
| GET / PATCH / DELETE | `/api/colors/:id/` | Retrieve, update, or delete a color |
| GET / POST | `/api/tags/` | List or create tags |
| GET / PATCH / DELETE | `/api/tags/:id/` | Retrieve, update, or delete a tag |
| GET / POST | `/api/lists/` | List or create todo lists |
| GET / PATCH / DELETE | `/api/lists/:id/` | Retrieve, update, or delete a list |
| GET / POST | `/api/lists/:id/items/` | List or create items within a list |
| GET / PATCH / DELETE | `/api/lists/:id/items/:item_id/` | Retrieve, update, or delete an item |
| POST | `/api/lists/:id/items/reorder/` | Reorder items: `{ "order": [id, ...] }` |

Write requests accept foreign keys by ID (e.g. `color_id`, `tag_ids`). Read responses return nested objects (e.g. `color`, `tags`).
