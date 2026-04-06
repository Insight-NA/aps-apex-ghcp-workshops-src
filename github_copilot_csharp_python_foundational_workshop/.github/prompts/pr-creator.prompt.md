---
name: pr-creator
description: "Create a pull request with conventional commit message, description linking to roadmap task/GitHub issue, and checklist of changes. Final stage of the AI SDLC pipeline."
---

## Context
You are at the final stage of the AI SDLC pipeline. An implementation has been completed, tests pass, and the code reviewer has approved. Now create a pull request.

## Objective
Create a well-structured pull request for the completed work.

## Requirements

### Branch Naming
```
{type}/{issue-number}-{short-description}
```
Examples:
- `feat/42-extract-auth-service`
- `fix/15-secret-key-hardcoded`
- `refactor/23-split-ai-parsing-service`

### Commit Message (Conventional Commits)
```
{type}({scope}): {description}

{body}

Refs: #{issue-number}
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `security`
Scopes: `python`, `csharp`, `java`, `bff`, `frontend`, `terraform`, `cicd`

### PR Description Template

```markdown
## Summary
{One-sentence description of what this PR does}

## Roadmap Task
- **Roadmap**: {PYTHON_BACKEND_ROADMAP.md | CSHARP_BACKEND_ROADMAP.md | ...}
- **Epic**: {Epic name}
- **Task**: {Task ID — Task name}
- **Issue**: #{issue-number}

## Changes
- {Change 1}
- {Change 2}
- {Change 3}

## Files Changed
| File | Change Type | Description |
|------|------------|-------------|
| `path/to/file` | Added/Modified/Deleted | What changed |

## Testing
- [ ] New tests added
- [ ] All existing tests pass
- [ ] Edge cases covered
- [ ] External APIs mocked

## Security Checklist
- [ ] No secrets in code
- [ ] Input validation added (if applicable)
- [ ] Auth/authz verified (if applicable)

## Convention Compliance
- [ ] Follows {language}.instructions.md
- [ ] Constants extracted (no hardcoded strings)
- [ ] File size within limits

## Screenshots
{If UI changes, add before/after screenshots}
```

### PR Labels
Apply appropriate labels:
- `backend-python`, `backend-csharp`, `backend-java`, `bff`, `frontend`, `infrastructure`
- `security`, `bug`, `feature`, `refactor`
- `ready-for-review`

## Example

```
Branch: feat/42-extract-auth-service
Commit: feat(python): extract auth logic from main.py to auth_service.py

Move authentication business logic (google_login, refresh_token, 
get_current_user) into dedicated AuthService class following SRP.
main.py reduced from 450 to 280 lines.

- Created backend/auth_service.py with AuthService class
- Updated backend/main.py to delegate to AuthService  
- Added 8 new tests in backend/tests/test_auth_service.py
- All 53 tests passing

Refs: #42
```
