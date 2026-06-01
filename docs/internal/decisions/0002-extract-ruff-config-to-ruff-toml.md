# 0002 — Extract ruff configuration to standalone ruff.toml

**Status:** Accepted

## Context

The project's ruff configuration — linting rules, formatter settings, per-file ignores, isort, pydocstyle, and flake8-quotes options — currently lives inside `pyproject.toml` under seven `[tool.ruff*]` sections. This mixes tooling configuration with project metadata (name, version, dependencies, classifiers, URLs) in a single file.

The precedent for separation already exists in this repo: `ty` (the type checker) was extracted to its own `ty.toml` when it was adopted (see ADR 0001). Ruff supports an identical pattern: a `ruff.toml` (or `.ruff.toml`) file at the project root, where all settings are expressed with the `[tool.ruff]` prefix stripped.

No information is lost in the migration — every setting that is valid under `[tool.ruff*]` in `pyproject.toml` has a direct equivalent in `ruff.toml` syntax. The only change is the file and section names.

**Section name mapping:**

| `pyproject.toml` | `ruff.toml` |
|---|---|
| `[tool.ruff]` | *(top-level bare keys, no section header)* |
| `[tool.ruff.lint]` | `[lint]` |
| `[tool.ruff.format]` | `[format]` |
| `[tool.ruff.lint.per-file-ignores]` | `[lint.per-file-ignores]` |
| `[tool.ruff.lint.pydocstyle]` | `[lint.pydocstyle]` |
| `[tool.ruff.lint.isort]` | `[lint.isort]` |
| `[tool.ruff.lint.flake8-quotes]` | `[lint.flake8-quotes]` |

## Decision

Move all ruff configuration from `pyproject.toml` into a `ruff.toml` file at the repository root. Remove all `[tool.ruff*]` sections from `pyproject.toml` entirely — no residual ruff reference is needed there once the standalone file exists. Use `ruff.toml` (not `.ruff.toml`) to match the naming convention of `ty.toml`.

## Consequences

- **Cleaner `pyproject.toml`:** Project metadata is no longer interleaved with linting rules; the file shrinks by ~100 lines.
- **Consistent tooling pattern:** `ty.toml`, `ruff.toml` — all Astral tooling lives in named files at the root, making the tooling surface easy to locate and audit independently.
- **Zero functional change:** No rules, thresholds, or formatter options are altered. `make check` output is identical before and after.
- **Section naming:** Developers unfamiliar with `ruff.toml` may not immediately recognise that `[lint]` maps to `[tool.ruff.lint]`. The ruff documentation covers this, and this ADR records the mapping for future reference.
