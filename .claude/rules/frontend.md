---
paths:
  - "frontend/**"
---

# Frontend

## Architecture

React SPA located in `frontend/src/`:

- `api/` — Axios functions per resource (colors, tags, lists, items, stats)
- `hooks/` — TanStack Query wrappers (`useColors`, `useTags`, `useLists`, `useItems`, `useReorderItems`, `useStats`)
- `components/ui/` — Shared primitives: `ColorPicker`, `ColorSwatch`, `TagBadge`, `TagSelector`, `Modal`, `Spinner`, `ErrorMessage`, `Header`
- `components/lists/` — `ListCard`, `ListForm`, `ListsGrid`
- `components/items/` — `ItemRow` (dnd-kit sortable), `ItemList` (DndContext), `ItemForm`, `DragHandle`, `ItemCheckbox`
- `pages/` — `DashboardPage` (`/`), `ListsPage` (`/lists`), `ListDetailPage` (`/lists/:id`), `TagsPage` (`/tags`), `ColorsPage` (`/colors`)
- `test/` — Vitest test infrastructure: `setup.js`, `server.js` (MSW node server), `handlers.js` (API stubs), `fixtures.js` (shared data), `utils.jsx` (`renderWithProviders`)
- `utils/colorUtils.js` — `getContrastTextColor(hex)` — WCAG luminance contrast; handles 3-digit hex

## Testing

Frontend tests use **Vitest** + **React Testing Library** + **MSW**. Test files are colocated with source as `*.test.jsx`. Run with `make test-frontend` or `npm test` from `frontend/`. The `renderWithProviders(ui, { route })` helper in `src/test/utils.jsx` wraps components with `QueryClientProvider` (retries disabled) and `MemoryRouter`.

## Code Style

Follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html). Use JSDoc comments for public functions and React components.

## Tailwind CSS v4

Use `@import "tailwindcss"` in CSS files — **not** the v3 `@tailwind` directives. The PostCSS plugin is `@tailwindcss/postcss`.
