# 0001 — Migrate type checker from mypy to ty

**Status:** Accepted

## Context

The project uses `uv` for package management and `ruff` for linting and formatting — both tools from Astral. mypy, the previous type checker, sits outside this toolchain: it requires separate configuration (`mypy.ini`), its own dependency tree, and per-package stub packages (e.g. `types-aiofiles`).

Astral released `ty`, a Rust-based Python type checker designed to complement `uv` and `ruff`. Consolidating on a single toolchain vendor reduces configuration surface, speeds up the type-checking step, and keeps the dependency graph smaller.

The primary compatibility gap at migration time (ty 0.0.40) is Django: ty does not yet have Django stubs. This surfaces two categories of false positives: `.objects` manager access (and similar ORM attributes) triggers `unresolved-attribute` errors across the codebase; Django model field descriptors typed as their field classes rather than their Python runtime equivalents (`DateTimeField` instead of `datetime`, `CharField` instead of `str`, etc.) trigger `invalid-argument-type` and `unsupported-operator` errors in `todo/ics.py`.

## Decision

Replace mypy with ty as the project's sole static type checker. Configuration lives in `ty.toml` at the project root. `unresolved-attribute` is suppressed via `[[overrides]]` scoped to `todo/**` (the only package that uses the Django ORM); `invalid-argument-type` and `unsupported-operator` are additionally suppressed in `todo/ics.py` where Django field descriptors trigger false positives. All rules remain active outside of `todo/`.

## Consequences

- **Faster checks:** ty is written in Rust and significantly faster than mypy on repeated runs.
- **Unified toolchain:** uv + ruff + ty are all Astral projects with compatible configuration conventions.
- **Reduced deps:** `mypy`, its extensions, and `types-aiofiles` are removed from the dev dependency group.
- **Alpha risk:** ty is pre-1.0 and uses `0.0.X` versioning where any increment may carry breaking changes. The dependency constraint is `>=0.0.40,<0.1.0`, scoping Dependabot updates to the current pre-release minor. `uv.lock` provides the actual reproducible pin used in CI; the constraint governs the range Dependabot is permitted to update within.
- **Suppressed Django errors:** `unresolved-attribute` is suppressed within `todo/**`, and `invalid-argument-type` / `unsupported-operator` are suppressed in `todo/ics.py`. This means genuine attribute errors on Django model instances will not be caught until ty gains Django stubs support. The previous mypy setup had the same blind spot: `django-stubs` was never a project dependency, so mypy also could not see Django ORM attributes — it silently ignored them via `ignore_missing_imports = True`.
- **mypy-specific options dropped:** Several mypy.ini flags have no ty equivalent (`disallow_untyped_calls`, `show_traceback`, `raise_exceptions`, `warn_incomplete_stub`). These are accepted gaps; the effective strictness of the checks is equivalent. (`exclude_gitignore` does have an equivalent: `respect-ignore-files = true` in `ty.toml`.)
