# Umbra Documentation

This directory contains architecture diagrams, API references, guides, and decision records for the Umbra project.

## Structure

```
docs/
  internal/          # Developer-facing material — not for public distribution
    diagrams/        # Architecture and data model diagrams (.mmd)
    runbooks/        # Operational procedures: deploy, rollback, migrations
    decisions/       # Architecture Decision Records (ADRs)
  public/            # Safe to publish — GitHub repo, wiki, or GitHub Pages
    diagrams/        # Architecture and data model diagrams (.mmd)
    api/             # Public API reference and auth model docs
    guides/          # User-facing feature walkthroughs and getting-started guides
  README.md          # This file
```

**Audience boundary:** Everything under `public/` is reviewed before merging (see `CODEOWNERS`). When in doubt, put it in `internal/` first.

---

## Diagrams

Diagrams are written in [Mermaid](https://mermaid.js.org/) syntax and saved as `.mmd` files. Each diagram has an `internal/` version (dense, technical) and a `public/` version (annotated, plain-language).

### Current diagrams

| File | Description |
|------|-------------|
| `diagrams/system-architecture.mmd` | Full deployment stack: browser → Railway → Django/WhiteNoise → PostgreSQL, including dev environment |
| `diagrams/data-model.mmd` | Entity-relationship diagram for all models: User, Color, Tag, TodoList, TodoItem, TodoItemTag |
| `diagrams/auth-flow.mmd` | Session + CSRF authentication sequence: login, authenticated request, logout |
| `diagrams/frontend-component-tree.mmd` | Complete React component hierarchy with hooks and API endpoints |
| `diagrams/frontend-routes.mmd` | React Router page/route layer only |

### Viewing diagrams

**In draw.io:** Open [app.diagrams.net](https://app.diagrams.net), choose *Extras → Edit Diagram*, paste the `.mmd` file contents, and select *Close*.

**In VS Code:** Install the [Mermaid Preview](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension and open the file.

**In GitHub:** Paste the diagram source into a `.md` file inside a fenced code block tagged `mermaid` — GitHub renders it natively.

### Adding a new diagram

1. Create `docs/internal/diagrams/<name>.mmd` and `docs/public/diagrams/<name>.mmd`.
2. Use `flowchart`, `erDiagram`, or `sequenceDiagram` depending on the content.
3. Add a row to the table above in both versions of this README.
4. Internal version: use technical labels (class names, HTTP methods, field types). Public version: use plain-language descriptions and explanatory annotations.

---

## Architecture Decision Records (ADRs)

Decisions that shaped the architecture live in `internal/decisions/`. They are immutable once merged — superseded records are marked as such rather than deleted.

### Numbering and naming

```
decisions/0001-session-auth-over-jwt.md
decisions/0002-whitenoise-over-cdn.md
decisions/0003-railway-deployment.md
```

Zero-pad to four digits. Use `kebab-case` for the slug after the number.

### ADR template

```markdown
# NNNN — Title

**Status:** Proposed | Accepted | Superseded by [NNNN](./NNNN-title.md)
**Date:** YYYY-MM-DD

## Context

What situation or constraint prompted this decision?

## Decision

What was decided?

## Consequences

What becomes easier or harder as a result?
```

### Existing decisions to document

The following design choices are worth capturing as ADRs:

- Session auth + CSRF over JWT (same-origin SPA, no token storage problem, Django native)
- WhiteNoise over a CDN or separate static server (zero extra infrastructure, sufficient for this scale)
- Railway for deployment (managed PostgreSQL plugin, nixpacks build, zero-config HTTPS)
- DRF `SessionAuthentication` with `IsAuthenticated` default (all endpoints protected unless explicitly opted out)
- Importance field mapped to RFC 5545 PRIORITY values (interop with iCalendar export)

---

## File naming conventions

- All filenames use `kebab-case` — no spaces, no underscores, no `camelCase`.
- Mermaid diagram sources: `.mmd`
- Documentation prose: `.md`
- No version suffixes in filenames (`-v2`, `-new`, `-final`) — use git history instead.

---

## What belongs where

| Content | Location |
|---------|----------|
| Architecture diagrams (technical) | `internal/diagrams/` |
| Architecture diagrams (annotated) | `public/diagrams/` |
| Deployment runbooks | `internal/runbooks/` |
| Architecture Decision Records | `internal/decisions/` |
| Public API endpoint reference | `public/api/` |
| User-facing feature guides | `public/guides/` |
| Secrets, credentials, env values | **Never in this directory** |
