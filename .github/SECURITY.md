# Security Policy

## Supported versions

Only the latest deployment of Umbra receives security fixes. No historical versions are maintained.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please use [GitHub's private vulnerability reporting](https://github.com/masriamir/umbra/security/advisories/new) to submit a report confidentially. This keeps the disclosure private while the issue is investigated and a fix is prepared.

When reporting, please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof-of-concept if available
- Any suggested mitigations, if known

You can expect an acknowledgement within **48 hours** and a status update within **7 days** of the initial report.

## Scope

This policy covers the Umbra application code in this repository, including the Django backend, React frontend, and deployment configuration.

Vulnerabilities in third-party dependencies should be reported directly to their maintainers. Dependabot version-update PRs are automatically opened for dependencies with known CVEs.
