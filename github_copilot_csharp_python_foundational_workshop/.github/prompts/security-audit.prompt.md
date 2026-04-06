---
name: security-audit
description: "Run a security audit against the OWASP Top 10 and roadmap-identified vulnerabilities. Produces a prioritized finding report with CORE-formatted fix prompts."
---

## Context
The Road Trip Planner has documented security gaps across all services (see PYTHON_BACKEND_ROADMAP.md and CSHARP_BACKEND_ROADMAP.md). This prompt performs a systematic audit.

## Objective
Audit the codebase for security vulnerabilities and produce a prioritized remediation plan.

## Requirements

### Audit Scope
Check all services against OWASP Top 10:

| # | OWASP Category | Where to Check |
|---|---------------|----------------|
| A01 | Broken Access Control | `auth.py`, `get_current_user()`, route guards |
| A02 | Cryptographic Failures | `SECRET_KEY`, JWT signing, token storage |
| A03 | Injection | SQL (SQLAlchemy), XSS (React), command injection, prompt injection (`ai_service.py`) |
| A04 | Insecure Design | `MOCK_TOKEN`, error message leakage, missing rate limits |
| A05 | Security Misconfiguration | CORS (`*`), debug mode, Dockerfile root user |
| A06 | Vulnerable Components | Unpinned dependencies, outdated packages |
| A07 | Auth Failures | Token expiry, refresh flow, session management |
| A08 | Data Integrity | No CSRF protection, unsigned tokens |
| A09 | Logging Failures | `print()` instead of logger, no audit trail |
| A10 | SSRF | External API proxies (Mapbox, Azure Maps, Gemini) |

### Output Format
For each finding:

```markdown
### [CRITICAL/HIGH/MEDIUM/LOW] — Finding Title

**File**: `path/to/file.py:42`
**OWASP**: A02 — Cryptographic Failures
**Description**: Brief description of the vulnerability
**Impact**: What an attacker could do
**Fix**: One-sentence fix description

#### CORE Fix Prompt
> **Context**: [current state]
> **Objective**: [what to fix]
> **Requirements**: [specific technical requirements]
> **Example**: [code before/after]
```

### Priority Rules
- **Critical**: Secrets in code, auth bypass, SQL injection → Fix immediately
- **High**: Docker root, no rate limiting, missing validation → Fix this sprint
- **Medium**: Unpinned deps, logging gaps, CORS permissiveness → Fix next sprint
- **Low**: Missing headers, documentation gaps → Backlog

## Example Usage
1. Run this prompt to generate the audit report
2. Feed each CORE Fix Prompt to `@security-remediation` agent
3. `@code-reviewer` validates the fixes
