#!/usr/bin/env bash
# Pre-commit security check hook.
#
# Fires via PreToolUse on `git commit` commands. Blocks the commit and feeds
# feedback to Claude if sensitive files are staged or obvious credentials are
# detected in the diff.
#
# Exit codes:
#   0  — allow the commit to proceed
#   2  — block the commit; stderr is shown to the user and fed back to Claude

set -euo pipefail

STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# ── 1. Block sensitive file types ──────────────────────────────────────────

SENSITIVE_FILES=$(echo "$STAGED_FILES" | grep -E \
  '(^|/)\.env$|(^|/)\.env\.[^s]|\.pem$|\.key$|id_rsa|id_ed25519|\.p12$|\.pfx$|\.jks$' \
  || true)

if [ -n "$SENSITIVE_FILES" ]; then
  echo "Blocked: the following sensitive files are staged for commit:" >&2
  echo "$SENSITIVE_FILES" | sed 's/^/  /' >&2
  echo "" >&2
  echo "Remove them with: git restore --staged <file>" >&2
  echo "If this is intentional (e.g., .env.sample), confirm the file contains no real credentials." >&2
  exit 2
fi

# ── 2. Scan staged diff for hardcoded credentials ──────────────────────────
# Looks for lines *added* (starting with +) that look like credential
# assignments. Skips sample/example/test files and comments.

STAGED_DIFF=$(git diff --cached 2>/dev/null || true)

CREDENTIAL_LINES=$(echo "$STAGED_DIFF" | grep -E \
  '^\+[^+].*\b(password|secret_key|api_key|api_secret|access_token|private_key|auth_token)\s*[=:]\s*["\x27][^"\x27{$<][^"\x27]{3,}' \
  | grep -iv 'sample\|example\|placeholder\|changeme\|your_\|<your\|# ' \
  | grep -v '^+++' \
  || true)

if [ -n "$CREDENTIAL_LINES" ]; then
  echo "Blocked: possible hardcoded credential detected in staged changes:" >&2
  echo "" >&2
  echo "$CREDENTIAL_LINES" | head -5 | sed 's/^/  /' >&2
  echo "" >&2
  echo "Move secrets to .env and read them via django-environ or os.environ." >&2
  exit 2
fi

# ── 3. Warn if .env.sample was modified (may have gained real values) ───────

SAMPLE_MODIFIED=$(echo "$STAGED_FILES" | grep -E '\.env\.sample$|\.env\.example$' || true)

if [ -n "$SAMPLE_MODIFIED" ]; then
  # Not a hard block — just inject a warning for Claude to surface
  echo "Warning: .env.sample is staged. Verify it contains only placeholder values, not real credentials." >&2
  # Exit 0 so the commit is not blocked, but Claude sees the stderr warning
fi

exit 0
