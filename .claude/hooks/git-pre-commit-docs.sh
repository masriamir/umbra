#!/usr/bin/env bash
# git-pre-commit-docs.sh
#
# Installed as part of .git/hooks/pre-commit (via make install-hooks).
# Warns when architecture-relevant files are staged without any corresponding
# docs changes. This is a soft warning — commits are never blocked by this
# script. Use `git commit --no-verify` to suppress all pre-commit hooks.

set -euo pipefail

STAGED=$(git diff --cached --name-only 2>/dev/null || true)
[ -z "$STAGED" ] && exit 0

# Returns 0 (true) if the relevant pattern matches staged files AND no docs
# files are staged. When docs are already included, no warning is needed.
has_undocumented_change() {
  local pattern="$1"
  echo "$STAGED" | grep -qE "$pattern" || return 1
  echo "$STAGED" | grep -qE '^docs/' && return 1
  return 0
}

WARNINGS=()

if has_undocumented_change '^todo/models/'; then
  WARNINGS+=("Model change → docs/*/diagrams/data-model.mmd")
fi

if has_undocumented_change '^todo/urls\.py|^umbra/urls\.py'; then
  WARNINGS+=("URL routing change → docs/*/diagrams/system-architecture.mmd")
fi

if has_undocumented_change '^todo/views\.py|^todo/auth_views\.py'; then
  WARNINGS+=("Views change → docs/*/diagrams/system-architecture.mmd (or auth-flow.mmd)")
fi

if has_undocumented_change '^todo/serializers/'; then
  WARNINGS+=("Serializer change → docs/*/diagrams/data-model.mmd")
fi

if has_undocumented_change '^frontend/src/pages/'; then
  WARNINGS+=("Page change → docs/*/diagrams/frontend-routes.mmd + frontend-component-tree.mmd")
fi

if has_undocumented_change '^frontend/src/(components|hooks|context)/'; then
  WARNINGS+=("Component/hook change → docs/*/diagrams/frontend-component-tree.mmd")
fi

if has_undocumented_change '^frontend/src/(App|main)\.jsx'; then
  WARNINGS+=("App shell change → all four frontend-*.mmd diagrams")
fi

if has_undocumented_change '^railway\.toml|^nixpacks\.toml|^umbra/settings\.py'; then
  WARNINGS+=("Infrastructure change → docs/*/diagrams/system-architecture.mmd")
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "" >&2
  echo "DOCS SYNC WARNING — staged changes may need diagram updates:" >&2
  for w in "${WARNINGS[@]}"; do
    echo "  • $w" >&2
  done
  echo "" >&2
  echo "See docs/README.md for the full update guide." >&2
  echo "To commit without updating docs: git commit --no-verify" >&2
  echo "" >&2
fi

exit 0
