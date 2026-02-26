# Semantic Versioning Quick Start Guide

## 🎯 Overview

This project enforces **Semantic Versioning 2.0.0 (SemVer)** for all releases. A dedicated Copilot agent ensures version updates are consistent, validated, and properly tagged.

## 📌 Version Format

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─── Bug fixes (backward-compatible)
  │     └───────── New features (backward-compatible)
  └─────────────── Breaking changes (incompatible)
```

**Current Version**: `1.0.0`

## 🚀 Quick Start

### Using the Semantic Versioning Agent

**In Copilot Chat:**
```
@workspace reference .github/prompts/version-update.prompt.md

I need to update the version for [describe your changes]
```

The agent will:
1. ✅ Show current version
2. ✅ Ask for change type (MAJOR/MINOR/PATCH)
3. ✅ Validate your description matches the change type
4. ✅ Update all 5 version files consistently
5. ✅ Create git commit and tag automatically

## 🎨 Version Types Explained

### PATCH (1.0.X)
**When**: Bug fixes, UI tweaks, performance improvements

**Examples:**
- Fixed crash on trip save
- Improved loading spinner animation
- Fixed map marker positioning bug
- Corrected typo in profile screen

**Command**: Specify `PATCH` when asked

### MINOR (1.X.0)
**When**: New features, backward-compatible additions

**Examples:**
- Added favorites feature
- New settings screen
- Enhanced map with traffic layer
- Added trip export functionality

**Command**: Specify `MINOR` when asked

### MAJOR (X.0.0)
**When**: Breaking changes, incompatible API changes

**Examples:**
- Removed deprecated API endpoints
- Changed navigation structure
- Rewrote authentication system
- Migrated to new state management library

**Command**: Specify `MAJOR` when asked

## �� Files Updated Automatically

The agent updates these 5 files:

```
✓ frontend/package.json
✓ frontend/src/utils/version.ts
✓ mobile/package.json
✓ mobile/app.json (expo.version)
✓ mobile/src/constants/version.ts
```

## ⚠️ Validation Rules

The agent **validates** your change description against the requested version type:

| Type | Expected Keywords | Warning If Contains |
|------|-------------------|---------------------|
| **PATCH** | fix, bug, performance, refactor | breaking, feature, new |
| **MINOR** | add, feature, enhance, new | breaking, remove |
| **MAJOR** | breaking, remove, incompatible, rewrite | fix, small, patch |

**If mismatch detected**, the agent will:
1. Show warning with detected type
2. Ask you to confirm or change
3. Prevent incorrect version bumps

## 🔒 What the Agent Won't Do

The agent **ONLY** handles version updates. It will **reject** requests for:
- Code refactoring
- Feature implementation
- Bug fixes
- Documentation updates
- Any non-versioning tasks

**Response:**
```
❌ REJECTED: This agent only handles Semantic Version updates.
Please use the appropriate agent or tool for your request.
```

## 📋 Example Workflows

### Example 1: Bug Fix (PATCH)

```
You: I fixed the map crash and improved loading states. Update version.

Agent: 
📌 Current Version: 1.0.0

What type of version change is this?
1️⃣  MAJOR - Breaking changes
2️⃣  MINOR - New features  
3️⃣  PATCH - Bug fixes

You: PATCH

Agent: Please describe what changed:

You: Fixed map crash on iOS and improved loading states

Agent:
📦 SEMANTIC VERSION UPDATE PLAN
Current Version:  1.0.0
New Version:      1.0.1
Change Type:      PATCH

Files to Update:
✓ frontend/package.json
✓ frontend/src/utils/version.ts
✓ mobile/package.json
✓ mobile/app.json
✓ mobile/src/constants/version.ts

Proceed? (yes)

Agent: [Updates files, commits, creates tag v1.0.1]

✅ VERSION UPDATE COMPLETE
Version: 1.0.0 → 1.0.1
```

### Example 2: New Feature (MINOR)

```
You: Added trip favorites and sharing. Update version.

Agent: Current Version: 1.0.1
Type? MAJOR/MINOR/PATCH

You: MINOR

Agent: Describe changes:

You: Added favorites screen, trip sharing via link, and social media integration

Agent: 
✅ Validation passed (detected: MINOR)
New Version: 1.1.0

[Updates files, commits, creates tag v1.1.0]
```

### Example 3: Validation Catches Mismatch

```
You: Update to MAJOR version

Agent: Current Version: 1.1.0
Describe changes:

You: Fixed small bug in profile screen

Agent:
⚠️  VERSION VALIDATION WARNING

Requested: MAJOR
New Version: 2.0.0

Your description suggests: PATCH
Expected for MAJOR: breaking, remove, incompatible
Found: fixed, small, bug

This may be incorrect. Confirm:
1. Proceed with MAJOR (2.0.0)
2. Change to PATCH (1.1.1)
3. Cancel

You: 2

Agent: [Updates to 1.1.1 instead]
```

## ��️ Git Tags

Each version update creates a git tag:

```bash
# View all version tags
git tag -l v*

# Output:
v1.0.0
v1.0.1
v1.1.0

# View tag details
git show v1.1.0

# Push tags to remote
git push origin --tags
```

## 📦 Release Workflow

After version update:

```bash
# 1. Version updated by agent ✅
# 2. Git commit created ✅
# 3. Git tag created ✅

# 4. Push to remote
git push origin ui_updates
git push origin v1.1.0

# 5. Create GitHub Release (optional)
gh release create v1.1.0 --title "Release 1.1.0" --notes "Added favorites and sharing"

# 6. Deploy to production
npm run deploy:frontend
npm run deploy:mobile
```

## 🐛 Troubleshooting

### Version Inconsistency Detected

```
⚠️  Inconsistent versions detected:
- frontend/package.json: 1.0.0
- mobile/app.json: 1.0.1
```

**Fix:**
```bash
# Manually sync versions or use the agent to fix
# Check all version files and correct manually if needed
```

### Agent Rejects Request

```
❌ This agent only handles Semantic Version updates.
```

**Fix:** Use the agent ONLY for version updates. For other tasks, use appropriate agents/tools.

## 📚 References

- **Semantic Versioning Spec**: https://semver.org/
- **Agent Prompt File**: `.github/prompts/version-update.prompt.md`
- **Version Display Implementation**: `UI_VERSION_IMPLEMENTATION_SUMMARY.md`

## 💡 Best Practices

1. **Update version AFTER merging changes** to main/production branch
2. **Write clear change descriptions** for validation
3. **Follow SemVer strictly** - don't skip versions
4. **Tag releases consistently** using `vX.Y.Z` format
5. **Update CHANGELOG.md** alongside version updates (manual step)
6. **Test deployments** before tagging production releases

---

**Questions?** Check the full agent prompt at `.github/prompts/version-update.prompt.md`
