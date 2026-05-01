---
paths:
  - "frontend/**"
---

# Frontend

## Architecture

React SPA located in `frontend/src/`:

- `api/client.js` — Shared Axios instance (`baseURL: /api`). A request interceptor attaches `X-CSRFToken` from the `csrftoken` cookie on mutating requests. A response interceptor redirects to `/login` on any 403 (unless already on that page).
- `api/auth.js` — `login(username, password)`, `logout()`, `getMe()` — thin wrappers around `client`
- `api/` — Axios functions per resource (colors, tags, lists, items, stats) — all use `client`
- `context/AuthContext.jsx` — `AuthProvider` (checks session on mount via `GET /api/auth/me/`; exposes `login` + `logout` actions that navigate after state update), `useAuth()` hook
- `components/ProtectedRoute.jsx` — Redirects unauthenticated users to `/login`; shows `Spinner` while session is loading
- `hooks/` — TanStack Query wrappers (`useColors`, `useTags`, `useLists`, `useItems`, `useReorderItems`, `useStats`)
- `components/ui/` — Shared primitives: `ColorPicker`, `ColorSwatch`, `TagBadge`, `TagSelector`, `Modal`, `Spinner`, `ErrorMessage`, `Header` (includes dark-mode toggle + logout button)
- `components/lists/` — `ListCard`, `ListForm`, `ListsGrid`
- `components/items/` — `ItemRow` (dnd-kit sortable), `ItemList` (DndContext), `ItemForm`, `DragHandle`, `ItemCheckbox`
- `pages/` — `LoginPage` (`/login`), `DashboardPage` (`/`), `ListsPage` (`/lists`), `ListDetailPage` (`/lists/:id`), `TagsPage` (`/tags`), `ColorsPage` (`/colors`)
- `test/` — Vitest test infrastructure: `setup.js`, `server.js` (MSW node server), `handlers.js` (API stubs including `/api/auth/me/`), `fixtures.js` (shared data including `mockUser`), `utils.jsx` (`renderWithProviders` — wraps with `QueryClientProvider`, `MemoryRouter`, and `AuthContext`)
- `utils/colorUtils.js` — `getContrastTextColor(hex)` — WCAG luminance contrast; handles 3-digit hex

## Auth Flow

`AuthProvider` wraps the entire app inside `BrowserRouter`. On mount it calls `GET /api/auth/me/`; while loading, `ProtectedRoute` renders a `Spinner`. Unauthenticated users are redirected to `/login`. After a successful `POST /api/auth/login/`, `AuthProvider` stores `{id, username}` in state and navigates to `/`. Logout calls `POST /api/auth/logout/` and navigates to `/login`.

All API calls go through `api/client.js`. On any 403, the response interceptor hard-redirects to `/login`.

## Dark Mode

Dark mode is toggled via a button in `Header` and persisted through a CSS class on `<html>`. Tailwind dark-mode variants (`dark:`) are used throughout.

## Testing

Frontend tests use **Vitest** + **React Testing Library** + **MSW**. Test files are colocated with source as `*.test.jsx`. Run with `make test-frontend` or `npm test` from `frontend/`. The `renderWithProviders(ui, { route })` helper in `src/test/utils.jsx` wraps components with `QueryClientProvider` (retries disabled), `MemoryRouter`, and a pre-seeded `AuthContext` (authenticated by default). MSW handlers stub `/api/auth/me/` to return `mockUser` from `fixtures.js`.

## Code Style

Follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html). Use JSDoc comments for public functions and React components.

## Tailwind CSS v4

Use `@import "tailwindcss"` in CSS files — **not** the v3 `@tailwind` directives. The PostCSS plugin is `@tailwindcss/postcss`.
