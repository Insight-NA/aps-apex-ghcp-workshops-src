---
applyTo: ".github/workflows/*.{yml,yaml},azure-pipelines.yml,infrastructure/*.{sh,ps1}"
---
# CI/CD Pipeline & Deployment Script Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these CI/CD rules.

## Golden Rule — No Inline Code in Pipeline YAML
```yaml
# ❌ WRONG — inline logic in YAML
- name: Deploy Backend
  run: |
    cd backend
    zip -r ../backend-deploy.zip . -x "venv/*"
    az webapp deploy --name ${{ vars.APP_NAME }}
    # ... 50 more lines

# ✅ CORRECT — delegate to script file
- name: Deploy Backend
  run: ./infrastructure/deploy-backend.sh
  env:
    APP_NAME: ${{ vars.APP_NAME }}
    RESOURCE_GROUP: ${{ vars.RESOURCE_GROUP }}
```

**Pipeline YAML is only for:**
- Job and step definitions
- Environment variable injection
- Conditional logic (`if:`)
- Ordering dependencies (`needs:`)

**All logic belongs in:**
- `infrastructure/*.sh` (bash) for Linux/macOS runners
- `infrastructure/*.ps1` (PowerShell) for Windows runners

---

## Deployment Script Standards

Every script must follow this structure:

```bash
#!/bin/bash
set -e  # Exit on any error

# 1. Validate required inputs (fail fast)
: "${RESOURCE_GROUP:?RESOURCE_GROUP must be set}"
: "${APP_NAME:?APP_NAME must be set}"

# 2. Support CLI argument overrides
while [[ $# -gt 0 ]]; do
  case $1 in
    --resource-group) RESOURCE_GROUP="$2"; shift 2 ;;
    --app-name)       APP_NAME="$2";       shift 2 ;;
    --dry-run)        DRY_RUN=true;        shift   ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# 3. Dry-run support
if [ "$DRY_RUN" = true ]; then
  echo "DRY RUN: Would deploy to $APP_NAME in $RESOURCE_GROUP"
  exit 0
fi

# 4. Detailed logging
echo "Deploying to $APP_NAME in $RESOURCE_GROUP..."

# 5. Idempotent deployment logic
```

**Every script must:**
1. Accept both environment variables and `--flag value` CLI arguments
2. Validate required inputs with a clear error when missing
3. Support `--dry-run` for local validation without side-effects
4. Output detailed logs (each step logged)
5. Be **idempotent** — safe to run multiple times

---

## Local Testing Workflow
```bash
# Always test scripts locally before pushing to CI
export RESOURCE_GROUP="rg-roadtrip-dev"
export APP_NAME="roadtrip-api-dev"

./infrastructure/deploy-backend.sh --dry-run   # validate
./infrastructure/deploy-backend.sh             # deploy
```

---

## GitHub Actions — Structure Reference
```yaml
jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - name: Deploy Backend          # ← minimal step; logic is in the script
        run: ./infrastructure/deploy-backend.sh
        env:
          RESOURCE_GROUP: ${{ vars.RESOURCE_GROUP }}
          APP_NAME: ${{ vars.APP_NAME }}
```
- Secrets: stored in GitHub Actions secrets — never hardcoded in YAML
- Variables: stored in GitHub Actions variables (`vars.*`) for non-sensitive config

---

## Azure DevOps — Structure Reference
```yaml
steps:
  - task: AzureCLI@2
    displayName: Deploy Backend
    inputs:
      azureSubscription: $(SERVICE_CONNECTION)
      scriptType: bash
      scriptPath: infrastructure/deploy-backend.sh
    env:
      RESOURCE_GROUP: $(RESOURCE_GROUP)
      APP_NAME: $(APP_NAME)
```
