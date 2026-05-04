#!/usr/bin/env bash
# docs-sync-check.sh
#
# PostToolUse hook: fires after every Edit or Write tool call and reminds
# Claude to update architecture diagrams and docs when relevant source files
# are modified.
#
# Receives JSON via stdin:
#   {"tool_name": "Edit", "tool_input": {"file_path": "/abs/path", ...}, ...}
#
# Exit codes:
#   0 — always (this hook warns but never blocks)

set -euo pipefail

FILE_PATH=$(python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except Exception:
    print('')
" 2>/dev/null || true)

[ -z "$FILE_PATH" ] && exit 0

# ── Match file path against tracked patterns ──────────────────────────────────

DIAGRAMS=()
NOTES=()

case "$FILE_PATH" in
  */todo/models/*)
    DIAGRAMS+=(
      "docs/internal/diagrams/data-model.mmd"
      "docs/public/diagrams/data-model.mmd"
    )
    NOTES+=("Update entity attributes, relationships, and constraints.")
    ;;
  */todo/urls.py|*/umbra/urls.py)
    DIAGRAMS+=(
      "docs/internal/diagrams/system-architecture.mmd"
      "docs/public/diagrams/system-architecture.mmd"
    )
    NOTES+=("If a new ViewSet or top-level route was added, also update:")
    NOTES+=("  docs/internal/diagrams/frontend-routes.mmd")
    NOTES+=("  docs/public/diagrams/frontend-routes.mmd")
    ;;
  */todo/views.py|*/todo/auth_views.py)
    DIAGRAMS+=(
      "docs/internal/diagrams/system-architecture.mmd"
      "docs/public/diagrams/system-architecture.mmd"
    )
    NOTES+=("If auth logic changed, also update:")
    NOTES+=("  docs/internal/diagrams/auth-flow.mmd")
    NOTES+=("  docs/public/diagrams/auth-flow.mmd")
    ;;
  */todo/serializers/*)
    DIAGRAMS+=(
      "docs/internal/diagrams/data-model.mmd"
      "docs/public/diagrams/data-model.mmd"
    )
    NOTES+=("If the public shape of a resource changed, also update docs/public/api/.")
    ;;
  */frontend/src/App.jsx|*/frontend/src/main.jsx)
    DIAGRAMS+=(
      "docs/internal/diagrams/frontend-routes.mmd"
      "docs/public/diagrams/frontend-routes.mmd"
      "docs/internal/diagrams/frontend-component-tree.mmd"
      "docs/public/diagrams/frontend-component-tree.mmd"
    )
    NOTES+=("Root shell or router changes affect both frontend diagrams.")
    ;;
  */frontend/src/pages/*)
    DIAGRAMS+=(
      "docs/internal/diagrams/frontend-routes.mmd"
      "docs/public/diagrams/frontend-routes.mmd"
      "docs/internal/diagrams/frontend-component-tree.mmd"
      "docs/public/diagrams/frontend-component-tree.mmd"
    )
    NOTES+=("Update the route node and any new/removed components in the tree.")
    ;;
  */frontend/src/components/*|*/frontend/src/hooks/*|*/frontend/src/context/*)
    DIAGRAMS+=(
      "docs/internal/diagrams/frontend-component-tree.mmd"
      "docs/public/diagrams/frontend-component-tree.mmd"
    )
    NOTES+=("Add, remove, or relabel nodes to reflect the change.")
    ;;
  */railway.toml|*/nixpacks.toml|*/umbra/settings.py|*/pyproject.toml)
    DIAGRAMS+=(
      "docs/internal/diagrams/system-architecture.mmd"
      "docs/public/diagrams/system-architecture.mmd"
    )
    NOTES+=("If this is a significant architectural choice, consider an ADR:")
    NOTES+=("  docs/internal/decisions/NNNN-<slug>.md")
    ;;
  *)
    exit 0
    ;;
esac

# ── Print reminder ─────────────────────────────────────────────────────────────

echo "" >&2
echo "┌─ DOCS SYNC ──────────────────────────────────────────────────" >&2
echo "│ $(basename "$FILE_PATH") changed — please update:" >&2
echo "│" >&2
for d in "${DIAGRAMS[@]}"; do
  echo "│   • $d" >&2
done
if [ ${#NOTES[@]} -gt 0 ]; then
  echo "│" >&2
  for n in "${NOTES[@]}"; do
    echo "│   $n" >&2
  done
fi
echo "└──────────────────────────────────────────────────────────────" >&2
echo "" >&2

exit 0
