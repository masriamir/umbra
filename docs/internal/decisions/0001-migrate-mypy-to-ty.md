# 0001 — Migrate type checker from mypy to ty

**Status:** Accepted

## Context

The project uses `uv` for package management and `ruff` for linting and formatting — both tools from Astral. mypy, the previous type checker, sits outside this toolchain: it requires separate configuration (`mypy.ini`), its own dependency tree, and per-package stub packages (e.g. `types-aiofiles`).

Astral released `ty`, a Rust-based Python type checker designed to complement `uv` and `ruff`. Consolidating on a single toolchain vendor reduces configuration surface, speeds up the type-checking step, and keeps the dependency graph smaller.

The primary compatibility gap at migration time (ty 0.0.40) is Django: ty does not yet have Django stubs, so `.objects` manager access and model field descriptors produce false-positive `unresolved-attribute` errors. These are suppressed in `ty.toml`; all other rules run at full severity.

## Decision

Replace mypy with ty as the project's sole static type checker. Configuration lives in `ty.toml` at the project root. The `unresolved-attribute` rule is globally set to `"ignore"` until Django stubs land in ty; `invalid-argument-type` and `unsupported-operator` are additionally suppressed in `todo/ics.py` where Django field descriptors trigger false positives.

## Consequences

- **Faster checks:** ty is written in Rust and significantly faster than mypy on repeated runs.
- **Unified toolchain:** uv + ruff + ty are all Astral projects with compatible configuration conventions.
- **Reduced deps:** `mypy`, its extensions, and `types-aiofiles` are removed from the dev dependency group.
- **Alpha risk:** ty is pre-1.0. Its configuration schema and rule set may change between releases. The version is pinned to `>=0.0.40,<1.0.0` to avoid unexpected breaking changes.
- **Suppressed Django errors:** `unresolved-attribute` is globally suppressed. This means genuine attribute errors on Django model instances will not be caught until ty gains Django stubs support. This is the same posture as the previous `ignore_missing_imports = True` approach in mypy.ini, which also relied on django-stubs being present to catch ORM issues.
- **mypy-specific options dropped:** Several mypy.ini flags have no ty equivalent (`disallow_untyped_calls`, `show_traceback`, `raise_exceptions`, `warn_incomplete_stub`, `exclude_gitignore`). These are accepted gaps; the effective strictness of the checks is equivalent.
