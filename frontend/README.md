# Umbra — Frontend

React SPA for the Umbra task management application. Communicates with the Django REST API via a Vite dev proxy.

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 19 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| HTTP client | Axios |
| Styling | Tailwind CSS v4 (CSS-variable theming) |
| Drag and drop | dnd-kit |
| Color picker | react-colorful |
| Build tool | Vite 8 |
| Testing | Vitest + React Testing Library + MSW |

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `DashboardPage` | Aggregate stats: totals, due dates, importance breakdown, top lists and tags |
| `/lists` | `ListsPage` | Browse and manage all todo lists |
| `/lists/:id` | `ListDetailPage` | Items within a list, with drag-to-reorder and calendar export |
| `/tags` | `TagsPage` | Full CRUD for tags |
| `/colors` | `ColorsPage` | Full CRUD for colors |

## Getting Started

```bash
# From the repo root
make install-frontend   # npm install

# Run the frontend dev server (requires the Django API to also be running)
make frontend           # http://localhost:5173

# Run both servers together
make dev
```

## Testing

Tests use **Vitest**, **React Testing Library**, and **MSW** (Mock Service Worker) to intercept API calls.

```bash
make test-frontend          # Run all tests once
make test-frontend-watch    # Re-run on file changes
make test-frontend-cov      # Run with coverage report

# Or directly via npm (from this directory)
npm test
npm run test:watch
npm run test:coverage
```

Test files are colocated with source files as `*.test.jsx`. Shared test infrastructure lives in `src/test/`:

- `setup.js` — Imports `@testing-library/jest-dom` matchers and manages the MSW server lifecycle
- `server.js` — MSW Node server instance
- `handlers.js` — Default API stubs for all routes
- `fixtures.js` — Shared mock data (`mockColors`, `mockTags`, `mockStats`)
- `utils.jsx` — `renderWithProviders(ui, { route })` helper that wraps components with `QueryClientProvider` and `MemoryRouter`

## Build

```bash
make build   # Production build → frontend/dist/
```

## Theming

The app supports **One Light** and **One Dark** color schemes toggled via the header. The preference is persisted in `localStorage`. Colors are defined as CSS custom properties in `src/index.css` and referenced via Tailwind's `@theme inline` block, so dark mode works without `dark:` prefixes on every class.
