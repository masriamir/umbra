# ADA Compliance: Make the frontend WCAG 2.1 AA accessible

## Overview

The Umbra frontend needs a comprehensive accessibility audit and remediation pass to meet [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsLevel=AA) requirements (ADA / Section 508 / EN 301 549). This issue catalogues every gap found across all pages and components and defines acceptance criteria for each.

---

## 1. Color Contrast (WCAG 1.4.3 / 1.4.11)

WCAG AA requires **4.5:1** contrast for normal text and **3:1** for large text (≥ 24 px or bold ≥ 18.67 px) and non-text UI elements.

### Light-mode failures (`index.css :root`)

| Token | Value | Contrast vs `--surface` (#fafafa) | Status |
|---|---|---|---|
| `--muted` | `#a0a1a7` | 2.47:1 | ❌ Fails all text |
| `--primary` | `#4078f2` | 3.88:1 | ❌ Fails normal text |
| `--success` | `#50a14f` | 3.07:1 | ❌ Fails normal text |
| `--danger` | `#e45649` | 3.51:1 | ❌ Fails normal text |
| `--caution` | `#986801` | 4.66:1 | ✅ Passes |
| `--secondary` | `#696c77` | 5.01:1 | ✅ Passes |
| `--body` | `#383a42` | 10.86:1 | ✅ Passes |

### Dark-mode failures (`.dark`)

| Token | Value | Contrast vs `--surface` (#282c34) | Status |
|---|---|---|---|
| `--muted` | `#5c6370` | 2.32:1 | ❌ Fails all text |
| `--secondary` | `#828997` | 3.98:1 | ❌ Fails normal text |
| `--danger` | `#e06c75` | 4.38:1 | ❌ Fails normal text |

### Where failing tokens appear in the codebase

- `text-muted`: item descriptions, due-date text, dashboard table cells, drag handles, empty states — heavy normal-text usage throughout
- `text-primary`: nav links, Edit buttons in item rows
- `text-success`: Completed stat card, Low importance label, Export .ics button text
- `text-danger`: Delete buttons (all pages), inline validation errors, High importance label

### Color-blindness (WCAG 1.4.1 — no color as sole conveyor of meaning)

- `ItemRow.jsx` importance labels (High / Med / Low) are colored red / amber / grey. While text labels are present, the Dashboard stat cards (`DashboardPage.jsx`) use only color-coded `accent` classes with no icon or pattern to differentiate them for red-green color-blind users.
- List cards (`ListCard.jsx`) and tag badges (`TagBadge.jsx`) use user-defined hex colors as backgrounds; the binary black/white text overlay chosen by `getContrastTextColor()` uses a simplified non-WCAG luminance formula that can produce incorrect results near the threshold.

### Acceptance criteria — colors

- [ ] Raise `--muted` (light + dark) to ≥ 4.5:1 against the surface background, or restrict `text-muted` to decorative / large-text-only contexts.
- [ ] Raise `--primary`, `--success`, `--danger` (light mode) to ≥ 4.5:1 for normal-weight text uses, or ensure they are only applied to text ≥ 24 px or bold ≥ 18.67 px.
- [ ] Raise dark-mode `--secondary` and `--danger` to ≥ 4.5:1 for normal text.
- [ ] Add a non-color indicator (icon, symbol, or pattern) alongside each color-coded importance level and each status-based stat card (e.g., ⚠ High, ✓ Completed, ⏰ Overdue).
- [ ] Replace the simplified luminance formula in `colorUtils.js` (`getContrastTextColor`) with the full WCAG 2.1 gamma-corrected relative luminance calculation.
- [ ] When a user selects a custom color in `ColorPicker.jsx`, display the calculated WCAG contrast ratio against common backgrounds and warn if it falls below 3:1.

---

## 2. Missing ARIA Roles and Labels (WCAG 4.1.2)

### `Modal.jsx`
- No `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` — screen readers cannot identify the dialog or its title.
- No focus trap — keyboard users can tab outside the modal while it is open.
- Focus is not moved into the modal on open, nor returned to the trigger element on close.

### `Spinner.jsx`
- Purely visual spinning `<div>` with no `role="status"`, `aria-label`, or `aria-live` region — screen readers are silent during loading.

### `ErrorMessage.jsx`
- No `role="alert"` — dynamically injected error text is not announced to screen readers.

### `ColorSwatch.jsx`
- `<button>` only has a `title` attribute (the hex code). `title` is not reliably exposed by all assistive technologies, and it conveys only the hex value, not the color name. Needs `aria-label="{colorName} ({hexCode})"`.

### `ListCard.jsx`
- The entire card is a `<div onClick>` with no `role`, `tabIndex`, or keyboard event handler — completely inaccessible to keyboard-only users.

### `TagSelector.jsx` — tag toggle buttons
- No `aria-pressed` attribute to communicate selected / deselected state to screen readers.

### `ItemRow.jsx` — action buttons
- "Edit", "Delete", and "Export" buttons have no contextual `aria-label` specifying which item they act on. Screen-reader users navigating by button encounter a list of identical "Edit" / "Delete" labels.

### `DragHandle.jsx`
- The decorative six-dot SVG inside the button has no `aria-hidden="true"`, so its markup may be read aloud by screen readers.

### `Header.jsx` — logout button
- The "Log out" button has no `aria-label` associating it with the authenticated user.

### Acceptance criteria — ARIA

- [ ] `Modal`: add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the modal heading id.
- [ ] `Modal`: implement a focus trap (tab/shift-tab cycle within focusable children); move focus to the first focusable element on open; restore focus to the trigger element on close.
- [ ] `Spinner`: add `role="status"` and `aria-label="Loading"` (or wrap in `aria-live="polite"`).
- [ ] `ErrorMessage`: add `role="alert"`.
- [ ] `ColorSwatch`: replace `title` with `aria-label="{colorName} ({hexCode})"`.
- [ ] `ListCard`: convert the outer `<div>` to an `<article>` containing a proper `<a>` or `<button>` as the primary interactive element; ensure keyboard activation works.
- [ ] `TagSelector` buttons: add `aria-pressed={selectedIds.includes(tag.id)}`.
- [ ] `ItemRow` buttons: add contextual `aria-label` per button per item (e.g., `aria-label={`Edit "${item.title}"`}`).
- [ ] `DragHandle` SVG: add `aria-hidden="true"`.
- [ ] `Header` logout button: add `aria-label={`Log out ${user.username}`}`.

---

## 3. Form Accessibility (WCAG 1.3.1, 3.3.2)

Virtually every form renders `<label>` elements that are **not programmatically associated** with their `<input>` / `<select>` / `<textarea>` via `htmlFor`/`id` pairs. Screen readers cannot determine which label belongs to which field.

Affected components:
- `ItemForm.jsx` — Title, Description, Tags, Due Date, Importance, Duration (all missing `id` / `htmlFor`)
- `ListForm.jsx` — Name, Description, Color (missing `id` / `htmlFor`)
- `ColorsPage.jsx ColorForm` — Name, Color picker
- `TagsPage.jsx TagForm` — Name, Color select
- `TagSelector.jsx` — the inline new-tag inputs ("Tag name" and Color select) have **no `<label>` at all**

### Acceptance criteria — forms

- [ ] Add unique `id` attributes to every `<input>`, `<select>`, and `<textarea>`, and link each to its `<label>` via `htmlFor`.
- [ ] Add visually-hidden labels to the `TagSelector` new-tag inputs.
- [ ] Link per-field inline errors to their input with `aria-describedby="{fieldId}-error"`.
- [ ] Confirm that `required` fields are announced as required by common screen readers (native `required` attribute is already present on some inputs — verify behavior across AT).

---

## 4. Keyboard Navigation (WCAG 2.1.1, 2.4.3, 2.4.7)

- **`ListCard.jsx`** — the primary click target is a `<div>`; pressing Enter or Space does nothing for keyboard users.
- **Drag-and-drop** — `@dnd-kit` supports keyboard reordering via Spacebar/arrow keys, but keyboard DnD must be verified as enabled and accompanied by live-region announcements for reorder events.
- **`HexColorPicker` (`react-colorful`)** — has known limited keyboard support. The existing hex-code text input should be surfaced as a fully accessible primary alternative.
- **`focus:outline-none`** — used throughout on interactive elements without a compensating `focus-visible:ring` class, eliminating the visible focus indicator required by WCAG 2.4.7.

### Acceptance criteria — keyboard

- [ ] `ListCard`: make the card navigable and activatable by keyboard.
- [ ] Verify / enable keyboard drag-and-drop in `@dnd-kit`; add `aria-roledescription="sortable"` and live-region announcements for drag start / end / cancel / reorder.
- [ ] Audit every `focus:outline-none` instance and replace with an explicit `focus-visible:ring-2` (or equivalent visible indicator).
- [ ] Verify `HexColorPicker` is fully keyboard-operable, or prominently label the hex text input as the keyboard-accessible alternative.

---

## 5. Page Structure and Navigation (WCAG 1.3.1, 2.4.1, 2.4.2)

- **Skip link** — no "Skip to main content" link; keyboard users must tab through the entire header on every page load / navigation.
- **Page titles** — `<title>` in `index.html` is a static "Umbra" that never updates on navigation. WCAG 2.4.2 requires each view to have a descriptive title.
- **`<main>` landmark** — page content is rendered inside a bare `<div>` in `App.jsx`; there is no `<main id="main-content">` landmark.
- **Dashboard tables** — both tables in `DashboardPage.jsx` lack `<caption>` and `scope="col"` on `<th>` elements.
- **`ListDetailPage.jsx` back link** — text is "← Back" with no context; ambiguous for screen-reader link-list navigation.

### Acceptance criteria — structure

- [ ] Add a visually-hidden (but keyboard-focusable) "Skip to main content" link as the first element in `<body>`, targeting `#main-content`.
- [ ] Wrap all route content in `<main id="main-content">` in `App.jsx`.
- [ ] Update `document.title` on each route change (e.g., via `useEffect` + `document.title`, or `react-helmet-async`).
- [ ] Add `<caption>` and `scope="col"` to both tables in `DashboardPage.jsx`.
- [ ] Add `aria-label="Back to My Lists"` to the back link in `ListDetailPage.jsx`.

---

## 6. Live Regions and Dynamic Content (WCAG 4.1.3)

The app performs many async mutations (create / update / delete) but provides no live-region announcements for their outcome. Screen-reader users receive no feedback after saving a list, adding an item, etc.

### Acceptance criteria — live regions

- [ ] Add a global `aria-live="polite"` status region (e.g., a toast or visually-hidden announcer) and populate it with success messages ("List saved.", "Item deleted.", etc.).
- [ ] Ensure `ErrorMessage` and all inline error `<p>` tags use `role="alert"` or `aria-live="assertive"` so they are announced immediately on appearance.
- [ ] Clear the `Spinner` live-region announcement when loading finishes.

---

## 7. Text Alternatives for Visual-Only Content (WCAG 1.1.1)

- **List color dot** in `ListDetailPage.jsx` — the small colored circle next to the list name (`w-4 h-4 rounded-full` div) has no text equivalent.
- **Completed item strikethrough** in `ItemRow.jsx` — the `line-through` style is the only completed indicator; a visually-hidden ", completed" suffix should be appended to the item title.
- **Color swatches** — see §2 above.

### Acceptance criteria — text alternatives

- [ ] Decorative color dots should get `aria-hidden="true"`; if they convey meaning (e.g., the list's assigned color), include a `<span className="sr-only">` with the color name.
- [ ] Completed items: add a visually-hidden ", completed" suffix to the item title text in `ItemRow.jsx`.

---

## 8. Reduced Motion (WCAG 2.3.3 — AAA, recommended)

- `Spinner.jsx` uses `animate-spin`, which ignores `prefers-reduced-motion`.
- `ListCard.jsx` uses `hover:-translate-y-0.5` transitions that ignore the reduced-motion preference.

### Acceptance criteria — motion

- [ ] Apply Tailwind's `motion-safe:` variant (or `@media (prefers-reduced-motion: no-preference)`) to all animations and transitions.

---

## References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/?currentsLevel=AA)
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/) — recommended for ongoing automated audits
- [dnd-kit Accessibility Guide](https://docs.dndkit.com/guides/accessibility)
