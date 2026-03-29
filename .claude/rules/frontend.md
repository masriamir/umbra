---
paths:
  - "frontend/**"
---

# Frontend

## Architecture

React SPA located in `frontend/src/`:

- `api/` — Axios functions per resource (colors, tags, lists, items)
- `hooks/` — TanStack Query wrappers (`useColors`, `useTags`, `useLists`, `useItems`, `useReorderItems`)
- `components/ui/` — Shared primitives: `ColorPicker`, `ColorSwatch`, `TagBadge`, `TagSelector`, `Modal`, `Spinner`, `ErrorMessage`
- `components/lists/` — `ListCard`, `ListForm`, `ListsGrid`
- `components/items/` — `ItemRow` (dnd-kit sortable), `ItemList` (DndContext), `ItemForm`, `DragHandle`, `ItemCheckbox`
- `pages/` — `ListsPage` (`/`), `ListDetailPage` (`/lists/:id`)
- `utils/colorUtils.js` — `getContrastTextColor(hex)` — WCAG luminance contrast; handles 3-digit hex

## Code Style

Follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html). Use JSDoc comments for public functions and React components.

## Tailwind CSS v4

Use `@import "tailwindcss"` in CSS files — **not** the v3 `@tailwind` directives. The PostCSS plugin is `@tailwindcss/postcss`.
