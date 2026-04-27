---
name: security-audit
description: Perform a comprehensive security audit of the Umbra codebase. Use this when asked to find vulnerabilities, check security posture, audit before a release, or review for OWASP issues. Covers Django backend, React frontend, dependencies, secrets, and configuration.
argument-hint: [backend|frontend|deps|all]
allowed-tools: Bash(uv run bandit *) Bash(uv run pip-audit) Bash(cd frontend && npm audit *) Bash(npm audit *) Bash(git log *) Bash(git diff *) Bash(git status *) Bash(git ls-files *) Grep Glob Read
---

# Security Audit — Umbra

**Scope:** `$ARGUMENTS` (omit for full audit — equivalent to `all`)

## Live Context

- **Branch:** !`git branch --show-current 2>/dev/null`
- **Recent commits:** !`git log --oneline -5 2>/dev/null`
- **Unstaged changes:** !`git diff --name-only 2>/dev/null || echo "(none)"`
- **Staged changes:** !`git diff --name-only --cached 2>/dev/null || echo "(none)"`
- **Tracked Python files:** !`git ls-files '*.py' | wc -l | tr -d ' '`
- **Tracked JS/JSX files:** !`git ls-files '*.js' '*.jsx' | wc -l | tr -d ' '`

---

Work through each section that matches the requested scope. For every finding record:

- **Severity:** Critical / High / Medium / Low / Info
- **Location:** file path and line number(s) where possible
- **Issue:** what is wrong and why it matters
- **Fix:** a concrete, actionable remediation

After all sections produce a **Summary Report** (see end of this file).

---

## 1. Dependency Vulnerabilities

Run both tools and report all findings. Do not skip findings even if they appear minor.

```bash
uv run bandit -r todo/ -f txt --severity-level medium --confidence-level medium
```

```bash
cd frontend && npm audit --audit-level=moderate 2>&1
```

Also manually inspect `pyproject.toml` and `frontend/package.json`:
- Flag any dependency pinned to a version with a known CVE
- Flag any dependency that is severely outdated relative to the current major version

## 2. Django Security Configuration

Read `umbra/settings.py` in full. Check each item:

| Setting | Expected |
|---|---|
| `DEBUG` | Must read from env; must default to `False` |
| `SECRET_KEY` | Must read from env; must have no hardcoded fallback |
| `ALLOWED_HOSTS` | Must not be `['*']`; must be restrictive in production |
| `CSRF_COOKIE_SECURE` | Should be `True` when `not DEBUG` |
| `SESSION_COOKIE_SECURE` | Should be `True` when `not DEBUG` |
| `CSRF_COOKIE_HTTPONLY` | Should be `True` |
| `X_FRAME_OPTIONS` | Should be `'DENY'` or `'SAMEORIGIN'` |
| `SECURE_BROWSER_XSS_FILTER` | Should be `True` |
| `SECURE_CONTENT_TYPE_NOSNIFF` | Should be `True` |
| `SECURE_SSL_REDIRECT` | Should be `True` in production |
| `SECURE_HSTS_SECONDS` | Should be set for production |
| `CORS_ALLOW_ALL_ORIGINS` | Must be `False` in production |
| `CORS_ALLOWED_ORIGINS` | Should be an explicit allowlist |
| `AUTH_PASSWORD_VALIDATORS` | Should include all four default validators |
| `DEFAULT_AUTO_FIELD` | Note if set — not a security issue, just good hygiene |

## 3. Secrets and Credentials in Code

Search for hardcoded secrets across all tracked files:

```bash
git ls-files | xargs grep -n -i -E "(password|secret_key|api_key|token|private_key|access_key)\s*=\s*['\"][^'\"{$][^'\"]{3,}" 2>/dev/null | grep -v ".sample" | grep -v "test_" | grep -v "#"
```

Also check:
- `.env` is listed in `.gitignore` — read `.gitignore` to verify
- `.env.sample` contains only placeholder values, not real credentials
- No secrets were committed to git history in the last 20 commits:
  ```bash
  git log --all --oneline -20 -- "*.env" "*.pem" "*.key" "id_rsa*" 2>/dev/null
  ```

## 4. API Endpoint Security

Read `todo/views.py` and `todo/urls.py` in full. Check:

- **Authentication & permissions** — are DRF `permission_classes` set on all ViewSets? The default (`IsAuthenticated` vs `AllowAny`) should be explicit and intentional
- **Authorization** — do item endpoints verify that the requesting user owns the parent list? (relevant once auth is added)
- **`GET /api/stats/`** — this endpoint aggregates all data; confirm it is intentionally public or note it should require auth
- **Mass assignment** — review all DRF serializers in `todo/serializers/`: are write-only fields (`color_id`, `tag_ids`) not leaking internal IDs or allowing writes to protected fields? Check `read_only_fields` and `extra_kwargs`
- **Pagination** — list endpoints (`/api/lists/`, `/api/tags/`, `/api/colors/`) have no visible pagination; flag if a large dataset could cause DoS
- **Rate limiting** — is there any rate limiting on the API? DRF `DEFAULT_THROTTLE_CLASSES` in settings?

## 5. Injection Risks

### SQL Injection
```bash
grep -rn "raw\|\.extra(\|RawSQL\|cursor\.execute" todo/ 2>/dev/null
```
Django ORM is safe by default. Only flag actual raw SQL usage.

### Command Injection
```bash
grep -rn "subprocess\|os\.system\|os\.popen\|eval(\|exec(" todo/ 2>/dev/null
```
Check `todo/ics.py` specifically — it generates filenames from user-supplied list/item titles. Verify `_sanitize_filename` is sufficient.

### Template Injection
```bash
git ls-files "*.html" | head -20
```
If Django templates exist, check for unescaped `{{ }}` with user-controlled content.

## 6. ICS / Calendar Export

Read `todo/ics.py` in full:

- Does `_sanitize_filename` adequately prevent path traversal (e.g., `../../../etc/passwd`)?
- Is user-supplied content (title, description, tag names) properly escaped before being written into the ICS payload? The `icalendar` library handles escaping for standard fields, but verify custom fields
- Can a malformed or excessively long title cause a denial of service during export?

## 7. Frontend Security

Read relevant frontend source files and check:

- **XSS** — search for `dangerouslySetInnerHTML`, `innerHTML =`, `document.write`:
  ```bash
  grep -rn "dangerouslySetInnerHTML\|innerHTML\s*=\|document\.write" frontend/src/ 2>/dev/null
  ```
- **Sensitive data in localStorage** — the app currently stores `theme` (safe); flag anything else:
  ```bash
  grep -rn "localStorage\.setItem" frontend/src/ 2>/dev/null
  ```
- **Open redirects** — check for `window.location` or `router.push` with unvalidated user input:
  ```bash
  grep -rn "window\.location\|router\.push\|router\.replace" frontend/src/ 2>/dev/null
  ```
- **Axios base URL** — `client.js` uses `/api` (relative, proxied). Confirm no absolute URLs to untrusted origins exist elsewhere
- **Content Security Policy** — is a CSP header configured in Django or the web server? Note its absence

## 8. Error Handling and Information Leakage

- Does the DRF exception handler return stack traces when `DEBUG=True`? (expected behavior, but must be disabled in production — already covered in §2)
- Do any API error responses expose internal details (model field names, database errors, file paths)?
- Check `umbra/settings.py` for `LOGGING` configuration — are log levels appropriate and is there any risk of sensitive data being logged?

---

## Summary Report

After completing all applicable sections, produce a report in this format:

```
## Security Audit Summary
**Date:** <today>
**Scope:** <what was audited>
**Branch:** <current branch>

### Finding Counts
| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| Info | N |

### Top Findings (must-fix)
1. [Severity] Short description — file:line
2. [Severity] Short description — file:line
3. [Severity] Short description — file:line

### Overall Posture
**Pass / Needs Attention / Fail** — one-sentence rationale.
```
