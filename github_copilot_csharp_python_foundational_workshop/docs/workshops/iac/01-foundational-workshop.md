# Workshop 01: GitHub Copilot for IaC - Foundational Skills

> **Duration**: 1 hour  
> **Level**: Beginner to Intermediate  
> **Prerequisites**: VS Code installed, GitHub Copilot extension, Azure subscription access  
> **Format**: 7 topics (~8 minutes each) + 15-minute hands-on exercise

---

## 🎯 Learning Objectives

By the end of this workshop, participants will:
- Understand Copilot's role in Terraform and YAML generation
- Know how to provide effective context for Azure resource generation
- Practice iterative acceptance patterns for HCL code
- Apply security best practices when using Copilot with deployment scripts
- Customize Copilot behavior for DevOps workflows
- Debug CI/CD pipelines using Copilot Chat
- Recognize limitations of AI-assisted IaC

---

## Topic 1: Copilot's Role in Terraform & YAML Generation (~8 min)

### Concept

GitHub Copilot acts as an intelligent pair programmer that understands:
- **HCL (HashiCorp Configuration Language)**: Terraform's declarative syntax
- **YAML**: Pipeline definitions, Kubernetes manifests, configuration files
- **Azure Resource Manager concepts**: Resource groups, providers, dependencies

### How Copilot Assists IaC Development

| Task | Copilot Capability |
|------|-------------------|
| Resource Generation | Suggests complete resource blocks from comments |
| Boilerplate Reduction | Auto-completes providers, backends, variables |
| Pattern Recognition | Learns naming conventions from existing code |
| Documentation | Generates README.md and inline comments |

### Live Demo: Terraform Generation

From our actual `infrastructure/terraform/main.tf` — this is how the resource group is defined:
```hcl
# In a new .tf file, type this comment and wait for Copilot suggestion:

# Create an Azure resource group with standard tags and lifecycle protection

# Copilot should generate something matching our actual pattern:
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags

  lifecycle {
    prevent_destroy = false
  }
}
```

Notice the actual code uses **variables** (`var.resource_group_name`), **computed tags** (`local.common_tags`), and a **lifecycle block** — not hardcoded values. If Copilot suggests `name = "rg-roadtrip-dev"`, that's a sign it lacks context from your `variables.tf`.

### Pipeline Parallel: YAML Generation

The same concept applies to pipeline YAML. Type a comment in `.github/workflows/terraform.yml`:
```yaml
# Copilot can also generate pipeline steps from comments:

# Step: Install Terraform and validate configuration
- name: Setup Terraform
  uses: hashicorp/setup-terraform@v3
  with:
    terraform_version: '1.7.0'

- name: Terraform Validate
  run: terraform validate -no-color
  working-directory: infrastructure/terraform
```

**Key insight**: Copilot generates both HCL *and* pipeline YAML from comments — keep both file types open for cross-context suggestions.

### Discussion Points
- How does Copilot know about Azure resource types?
- What context influences suggestion quality?
- When should you accept vs reject suggestions?
- How does Copilot handle the difference between `.tf` and `.yml` syntax?

---

## Topic 2: Providing Context for Azure Resources (~8 min)

### Concept

Copilot's suggestion quality depends heavily on available context:
1. **Open files** - Currently visible code in editor
2. **Instruction files** - `.github/copilot-instructions.md`
3. **Comments** - Natural language descriptions
4. **Existing patterns** - Code already in the workspace

### Context Hierarchy (Most to Least Influential)

```
1. Currently selected/highlighted code
2. Current file content
3. Open editor tabs
4. Instruction files (copilot-instructions.md)
5. Workspace file names and structure
```

### Practical Exercise: Context Provision

**Step 1**: Open `infrastructure/terraform/environments/dev.tfvars.json`

**Step 2**: With that file open, create a new file and type:
```hcl
# Based on the dev environment configuration, create an App Service Plan
```

**Step 3**: Notice how Copilot uses the tfvars values. Compare to our actual `modules/compute/main.tf`:
```hcl
# Actual code from modules/compute/main.tf:
resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = var.app_service_os
  sku_name            = var.app_service_sku

  tags = var.tags
}
```

The actual code uses **variable interpolation** for naming — not hardcoded strings. Good Copilot suggestions should match this pattern when your `variables.tf` is open.

### Pipeline Parallel: Context in Workflows

The same context principle applies to pipelines. With `environments/dev.tfvars.json` open, Copilot generates better workflow steps:
```yaml
# With tfvars context open, Copilot knows the environment pattern:
- name: Terraform Plan (dev)
  run: ./infrastructure/scripts/terraform-ci.sh --action plan --environment dev
  env:
    TF_VAR_mapbox_token: ${{ secrets.TF_VAR_MAPBOX_TOKEN }}
    TF_VAR_google_client_id: ${{ secrets.TF_VAR_GOOGLE_CLIENT_ID }}
```

### Tips for Better Context
- Keep relevant tfvars files open while generating resources
- Use descriptive file names (`networking.tf`, `compute.tf`)
- Reference existing modules in comments
- **For pipelines**: Keep the Terraform script (`terraform-ci.sh`) open when editing workflow YAML

---

## Topic 3: Iterative HCL Acceptance Patterns (~8 min)

### Concept

Don't accept large Terraform blocks blindly. Use iterative acceptance:
1. **Accept** the resource type and name
2. **Review** each attribute carefully
3. **Tab through** optional suggestions
4. **Escape** to stop and modify manually

### Acceptance Workflow

```
Comment → Suggestion → Tab (accept line) → Tab → Tab → Escape → Edit
```

### Live Demo: Iterative Acceptance

From our actual `modules/database/main.tf` — iterate through each attribute:
```hcl
# Create Azure PostgreSQL Flexible Server

# Step 1: Accept resource declaration
resource "azurerm_postgresql_flexible_server" "main" {
  
  # Step 2: Tab to accept name (review naming pattern)
  name                = "psql-${var.project_name}-${var.environment}-${var.resource_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location

  # Step 3: Tab — review auth (actual code uses variables, not hardcoded)
  administrator_login    = var.database_admin_username
  administrator_password = var.database_admin_password

  # Step 4: Tab — review SKU (verify it comes from tfvars)
  sku_name   = var.database_sku
  storage_mb = var.database_storage_mb
  version    = var.database_version

  # Step 5: STOP — review VNet integration (conditional!)
  # Copilot might omit the conditional — add it manually:
  delegated_subnet_id = var.enable_private_endpoint ? var.delegated_subnet_id : null
  private_dns_zone_id = var.enable_private_endpoint ? var.private_dns_zone_id : null

  # Step 6: Tab — review backup (actual uses variables per environment)
  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup

  # Step 7: STOP — Copilot may miss the dynamic HA block. Add manually:
  dynamic "high_availability" {
    for_each = var.enable_high_availability ? [1] : []
    content {
      mode                      = "ZoneRedundant"
      standby_availability_zone = var.standby_availability_zone
    }
  }

  # Step 8: Review lifecycle block (actual code has it!)
  lifecycle {
    prevent_destroy = false
    ignore_changes  = [administrator_password, zone]
  }
}
```

### Pipeline Parallel: Iterative YAML Editing

The same iterative pattern applies to pipeline steps. When adding a Terraform stage:
```yaml
# Step 1: Accept the task skeleton
- task: AzureCLI@2
  displayName: 'Terraform Plan (Dev)'
  inputs:
    azureSubscription: '$(AZURE_SUBSCRIPTION)'
    scriptType: 'bash'
    # Step 2: STOP — Copilot may suggest inline script
    # Reject inline and use script path instead (per cicd.instructions.md):
    scriptPath: 'infrastructure/scripts/terraform-ci.sh'
    arguments: '--action plan --environment dev'
  # Step 3: STOP — Add secret injection manually:
  env:
    TF_VAR_mapbox_token: $(MAPBOX_TOKEN)
    TF_VAR_google_client_id: $(GOOGLE_CLIENT_ID)
```

**Key takeaway**: Always pause at security-sensitive attributes — whether in HCL or YAML.

### Red Flags to Watch For
| Suggestion | Risk | Action |
|------------|------|--------|
| `public_network_access_enabled = true` | Security | Reject for prod |
| `sku_name = "B_Standard_B1ms"` | Cost | Verify against tfvars |
| `backup_retention_days = 7` | Compliance | Check requirements |
| Missing `lifecycle` block | Stability | Add manually |
| Missing `dynamic "high_availability"` | Resilience | Add for prod |
| Inline script in pipeline YAML | Maintainability | Delegate to `.sh` script |

---

## Topic 4: Security for Secrets in Deployment Scripts (~8 min)

### Concept

AI assistants can inadvertently expose sensitive information. Apply these guardrails when using Copilot with deployment scripts.

### ❌ Anti-Patterns to Avoid

```bash
# NEVER let Copilot generate hardcoded secrets:
export MAPBOX_TOKEN="pk.eyJ1Ijoic3R..."  # Exposed API key!
export DATABASE_PASSWORD="SuperSecret123"  # Hardcoded password!

# NEVER commit Copilot suggestions with real values:
az webapp config appsettings set \
  --name roadtrip-api \
  --settings GOOGLE_CLIENT_SECRET="actual-secret-value"
```

### ✅ Secure Patterns

```bash
# Use environment variable references
export MAPBOX_TOKEN="${MAPBOX_TOKEN:?MAPBOX_TOKEN not set}"

# Use Azure Key Vault references in App Service
az webapp config appsettings set \
  --name roadtrip-api \
  --settings MAPBOX_TOKEN="@Microsoft.KeyVault(SecretUri=https://kv-roadtrip.vault.azure.net/secrets/mapbox-token)"

# Use Azure CLI credential helpers
az keyvault secret show --vault-name kv-roadtrip --name db-password --query value -o tsv
```

### Copilot Instructions for Security

Add to `.github/copilot-instructions.md`:
```markdown
## Security Requirements
- NEVER generate hardcoded API keys, passwords, or secrets
- Always use environment variables with ${VAR_NAME} syntax
- Reference Azure Key Vault for production secrets
- Use managed identity authentication where possible
```

### Practical Check

**Review**: Open `docker-compose.yml` in this repo and identify any hardcoded tokens.
```yaml
# Current (INSECURE):
environment:
  - VITE_MAPBOX_TOKEN=pk.eyJ1Ijoic3RyaWRlcj...  # Hardcoded!

# Should be:
environment:
  - VITE_MAPBOX_TOKEN=${VITE_MAPBOX_TOKEN}  # From .env file
```

### Pipeline Parallel: Secrets in CI/CD Pipelines

The same principles apply to pipeline YAML. Compare these patterns from our actual workflows:

**✅ GitHub Actions** (from `.github/workflows/terraform.yml`):
```yaml
# Secrets injected via TF_VAR_* environment variables — never inline
- name: Terraform Plan (dev)
  run: ./infrastructure/scripts/terraform-ci.sh --action plan --environment dev
  env:
    TF_VAR_mapbox_token: ${{ secrets.TF_VAR_MAPBOX_TOKEN }}
    TF_VAR_google_client_id: ${{ secrets.TF_VAR_GOOGLE_CLIENT_ID }}
    TF_VAR_jwt_secret_key: ${{ secrets.TF_VAR_JWT_SECRET_KEY }}
```

**✅ Azure DevOps** (from `azure-pipelines.yml`):
```yaml
# Secrets from variable groups, injected as env vars to script
- task: AzureCLI@2
  displayName: 'Terraform Plan (Dev)'
  inputs:
    azureSubscription: '$(AZURE_SUBSCRIPTION)'
    scriptType: 'bash'
    scriptPath: 'infrastructure/scripts/terraform-ci.sh'
    arguments: '--action plan --environment dev'
  env:
    TF_VAR_mapbox_token: $(MAPBOX_TOKEN)
```

**❌ Anti-Pattern** — hardcoded secrets in pipeline YAML:
```yaml
# NEVER do this:
env:
  TF_VAR_mapbox_token: "pk.eyJ1Ijoic3RyaWRlcj..."  # Exposed in repo!
```

From our actual `modules/security/main.tf`, secrets are managed through Key Vault:
```hcl
# Secrets stored in Key Vault, never in tfvars
secrets = {
  "mapbox-token"               = var.mapbox_token
  "google-client-id"           = var.google_client_id
  "database-password"          = local.database_password
  "database-connection-string" = "postgresql://...@${module.database.server_fqdn}:5432/roadtrip?sslmode=require"
}
```

---

## Topic 5: Customizing Copilot for DevOps Workflows (~8 min)

### Concept

Copilot can be tailored for your organization's DevOps practices through instruction files and workspace configuration.

### Instruction File Structure

From our actual `.github/instructions/terraform.instructions.md`:
```markdown
# Terraform / Infrastructure as Code Standards

## Format (Non-Negotiable)
- Environment configs: *.tfvars.json ONLY — never HCL .tfvars files
- Module-first: All resources in infrastructure/terraform/modules/
- Every module must have: main.tf, variables.tf, outputs.tf

## Variable Standards
- All variables must have description and validation blocks
- Use TF_VAR_* environment variables for secrets

## Naming Convention
- Pattern: {project}-{resource}-{environment}
```

And from `.github/instructions/cicd.instructions.md`:
```markdown
# CI/CD Pipeline Standards

## Golden Rule — No Inline Code in Pipeline YAML
- Pipeline YAML is ONLY for: job definitions, env injection, conditions, ordering
- All logic belongs in: infrastructure/*.sh scripts

## Every script must:
- Accept both env vars and --flag value CLI arguments
- Support --dry-run for local validation
- Be idempotent — safe to run multiple times
```

### Live Demo: Custom Instruction Impact

**Before custom instructions** (generic suggestion):
```hcl
resource "azurerm_storage_account" "storage" {
  name                     = "mystorageaccount"
  resource_group_name      = "my-rg"
  # Generic, no conventions
}
```

**After custom instructions** (follows conventions):
```hcl
resource "azurerm_storage_account" "main" {
  name                     = "stroadtripdev${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  
  tags = local.common_tags  # Uses standard tags
}
```

### Exercise: Examine Our Instructions

Open `.github/copilot-instructions.md` and identify:
1. What naming conventions are enforced?
2. What technologies are prohibited?
3. What testing requirements exist?

### Pipeline Parallel: Instruction Files for Pipeline Generation

Our `cicd.instructions.md` teaches Copilot how to generate pipelines correctly:

**Without instruction file** — Copilot generates inline scripts:
```yaml
# ❌ Generic (violates golden rule)
- name: Deploy
  run: |
    cd infrastructure/terraform
    terraform init
    terraform plan -var-file=dev.tfvars.json
    terraform apply -auto-approve
```

**With instruction file** — Copilot delegates to scripts:
```yaml
# ✅ Follows cicd.instructions.md
- name: Terraform Plan (Dev)
  run: ./infrastructure/scripts/terraform-ci.sh --action plan --environment dev
  env:
    TF_VAR_mapbox_token: ${{ secrets.TF_VAR_MAPBOX_TOKEN }}
```

---

## Topic 6: Chat Debugging for Azure Pipelines (~8 min)

### Concept

Copilot Chat excels at debugging CI/CD pipeline failures by analyzing YAML syntax, identifying missing variables, and suggesting fixes.

### Common Pipeline Issues Copilot Can Debug

| Issue | Copilot Prompt |
|-------|----------------|
| YAML syntax error | "Why does this pipeline fail to parse?" |
| Missing variable | "What variables does this pipeline need?" |
| Task version mismatch | "Update this task to the latest version" |
| Condition logic error | "Why doesn't this stage run on PR?" |

### Live Demo: Debug Our Pipeline

Open `azure-pipelines.yml` and use Copilot Chat:

**Prompt 1**: "Explain what causes `continueOnError: true` on line 52 and why it's risky"

**Expected Response**:
```
The continueOnError: true setting on the pytest step means the pipeline 
will continue even if tests fail. This is risky because:
1. Broken code could be deployed to production
2. Test failures won't block the PR
3. Quality gates are bypassed

Recommendation: Remove continueOnError or set to false, and add a 
separate stage gate that requires passing tests before deployment.
```

**Prompt 2**: "What variables and secrets does `.github/workflows/terraform.yml` need?"

**Expected Response**:
```
Based on the Terraform workflow, you need these GitHub secrets:
- ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID
- AZURE_CREDENTIALS (service principal JSON for Azure login)
- TF_VAR_MAPBOX_TOKEN, TF_VAR_GOOGLE_CLIENT_ID, TF_VAR_JWT_SECRET_KEY
- TF_VAR_GEMINI_API_KEY, TF_VAR_AZURE_MAPS_KEY

And these GitHub Environments:
- dev (auto-deploy on push to main)
- production (requires reviewer approval before terraform apply)
```

### Pipeline Parallel: Debugging the Terraform Workflow

Common Terraform pipeline errors and how to debug with Copilot Chat:

| Error | Prompt |
|-------|--------|
| `Error: Backend initialization required` | "terraform init fails in CI. My backend config uses Azure Blob Storage — what env vars does the azurerm backend need?" |
| `Error: No valid credential sources found` | "Azure login fails in GitHub Actions. I'm using `azure/login@v2` with service principal — what format does AZURE_CREDENTIALS need?" |
| `Error: Saved plan is stale` | "Terraform apply fails because the plan artifact is from a previous job. How do I pass plan files between GitHub Actions jobs?" |

```yaml
# Example fix: Passing plan artifacts between jobs
# In plan job:
- uses: actions/upload-artifact@v4
  with:
    name: tfplan-dev
    path: infrastructure/terraform/tfplan-dev.out

# In apply job:
- uses: actions/download-artifact@v4
  with:
    name: tfplan-dev
    path: infrastructure/terraform
```

### Debugging Workflow
1. Copy error message from failed pipeline
2. Open Copilot Chat (`Cmd+Shift+I` / `Ctrl+Shift+I`)
3. Paste error and ask for root cause
4. Request specific fix with context

---

## Topic 7: IaC Generation Limitations (~8 min)

### Concept

Understanding Copilot's limitations prevents over-reliance and ensures infrastructure quality.

### Known Limitations

| Limitation | Example | Mitigation |
|------------|---------|------------|
| **Outdated API versions** | Suggests deprecated `azurerm_app_service` instead of `azurerm_linux_web_app` | Always check Terraform registry docs |
| **Missing dependencies** | Forgets `depends_on` for private endpoints | Review resource ordering |
| **Incorrect defaults** | Wrong SKU for production workloads | Validate against requirements |
| **Security blind spots** | Enables public access by default | Apply security checklist |
| **No cost awareness** | Suggests expensive SKUs | Add budget constraints to prompts |
| **State management gaps** | Doesn't understand existing state | Provide state context |

### What Copilot Cannot Do

1. **Access your Terraform state** - Doesn't know what's deployed
2. **Validate against Azure quotas** - Doesn't check subscription limits
3. **Understand compliance requirements** - Must be explicitly stated
4. **Test infrastructure changes** - Requires terraform plan/apply
5. **Manage secrets securely** - Will suggest if not constrained

### Validation Checklist

After Copilot generates Terraform:
```bash
# 1. Format check
terraform fmt -check

# 2. Syntax validation
terraform validate

# 3. Security scan
tfsec .

# 4. Plan review
terraform plan -out=plan.tfplan

# 5. Cost estimation (if using Infracost)
infracost breakdown --path .
```

### Pipeline Parallel: Automated Validation in CI

Our Terraform CI pipeline (`terraform.yml`) automates this checklist:
```yaml
# From .github/workflows/terraform.yml — the validate job:
validate:
  name: 'Validate'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: '1.7.0'

    - name: Terraform Format Check      # Step 1 automated
      run: terraform fmt -check -recursive
      working-directory: infrastructure/terraform

    - name: Terraform Init
      run: terraform init -backend=false -input=false
      working-directory: infrastructure/terraform

    - name: Terraform Validate           # Step 2 automated
      run: terraform validate -no-color
      working-directory: infrastructure/terraform
```

**Key insight**: CI catches issues Copilot misses. The pipeline runs `fmt -check` and `validate` on every PR, blocking merge if Copilot-generated code has errors.

### Discussion: When NOT to Use Copilot

- Sensitive compliance-driven infrastructure (SOC2, HIPAA) without review
- Production changes without proper testing
- Complex state migrations
- Disaster recovery implementations
- Pipeline changes that skip approval gates

---

## 🔬 Hands-On Exercise: Analyze Incomplete Terraform Structure (15 min)

### Objective

Use Copilot Chat to analyze the existing Terraform structure in `infrastructure/terraform/` and identify what's missing according to the project roadmap.

### Setup

1. Open VS Code in the `road_trip_app` workspace
2. Open Copilot Chat (`Cmd+Shift+I` / `Ctrl+Shift+I`)
3. Have `ROADMAP.md` open in a tab for reference

### Exercise Steps

#### Step 1: Discover Current Structure (3 min)

**Prompt to Copilot Chat**:
```
Analyze the Terraform structure in infrastructure/terraform/. 
List all modules, their purpose, and identify which files exist vs which are empty or placeholders.
```

**Expected Findings**:
- `modules/compute/` - App Service resources
- `modules/database/` - PostgreSQL configuration
- `modules/networking/` - VNet and subnets (may be incomplete)
- `modules/security/` - Key Vault setup
- `modules/monitoring/` - Application Insights

#### Step 2: Compare to Roadmap Requirements (5 min)

**Prompt to Copilot Chat**:
```
Based on ROADMAP.md Issues #23-#28 (Azure IaC Foundation), compare what's 
required vs what exists in our Terraform setup. Create a gap analysis table.
```

**Expected Output** (example):
| Issue | Required | Current Status | Gap |
|-------|----------|----------------|-----|
| #23 | Terraform state backend | `bootstrap.sh` exists | Verify storage account created |
| #24 | Networking module with conditional VNet | Module exists | Check if dev=public, prod=private logic works |
| #25 | Compute/Database modules | Modules exist | Verify VNet integration |
| #26 | Security/Monitoring modules | Modules exist | Check private endpoints |
| #27 | Environment JSON tfvars | 4 files exist | Validate all required vars |
| #28 | CI/CD pipeline integration | Pipeline exists | ✅ `TerraformPlan_Dev` stage added to azure-pipelines.yml, `.github/workflows/terraform.yml` created |

#### Step 3: Identify Specific Missing Components (5 min)

**Prompt to Copilot Chat**:
```
For the networking module (Issue #24), check if modules/networking/main.tf 
includes:
1. Conditional VNet creation (dev=no VNet, prod=VNet)
2. Three subnets: app (10.0.1.0/24), db (10.0.2.0/24), private endpoints (10.0.3.0/24)
3. NSG rules for each subnet
4. Private DNS zones for PostgreSQL and Key Vault
5. Private endpoint configurations

Report what's present and what's missing.
```

#### Step 4: Generate Recommendations (2 min)

**Prompt to Copilot Chat**:
```
Based on your analysis, prioritize the top 3 changes needed to complete 
the Azure IaC Foundation (Milestone 0). For each, explain:
1. What to implement
2. Which files to modify
3. Estimated complexity (low/medium/high)
```

### Deliverable

Create a brief summary (in your notes or as a comment) documenting:
1. What Terraform components currently exist
2. What's missing for Issues #23-#28
3. Your recommended next action

### Bonus Challenge

Use Copilot to generate **both** pipeline formats for Terraform:

**GitHub Actions** (`.github/workflows/terraform.yml`):
```
Generate a Terraform plan step for the dev environment that:
1. Delegates to infrastructure/scripts/terraform-ci.sh
2. Passes secrets as TF_VAR_* environment variables
3. Uploads the plan file as an artifact
```

**Azure DevOps** (`azure-pipelines.yml`):
```
Add a TerraformPlan_Dev stage to azure-pipelines.yml that:
1. Uses AzureCLI@2 task with scriptPath (not inline)
2. Runs terraform-ci.sh --action plan --environment dev
3. Publishes the plan file as a pipeline artifact
```

Compare both outputs — the same script (`terraform-ci.sh`) is used in both!

---

## 📋 Workshop Summary

### Key Takeaways

1. **Context is king** - Keep relevant files open for better suggestions
2. **Iterate, don't accept blindly** - Tab through suggestions carefully
3. **Security first** - Add guardrails in instruction files
4. **Customize for your org** - Instruction files shape suggestions
5. **Chat for debugging** - Pipeline errors are Copilot's strength
6. **Know the limits** - Validate, scan, and review generated IaC

### Next Steps

- Complete the hands-on exercise independently
- Review your organization's IaC standards
- Create/update `.github/copilot-instructions.md` for your project
- Join Workshop 02: Intermediate IaC Skills

### Resources

| Resource | Location |
|----------|----------|
| Definitions Reference | `docs/workshops/iac/00-copilot-definitions-best-practices.md` |
| Project Roadmap | `ROADMAP.md` |
| Terraform Modules | `infrastructure/terraform/modules/` |
| Pipeline Config (ADO) | `azure-pipelines.yml` |
| Pipeline Config (GHA) | `.github/workflows/terraform.yml` |
| Terraform CI Script | `infrastructure/scripts/terraform-ci.sh` |
| Copilot Instructions | `.github/copilot-instructions.md` |
| Terraform Instructions | `.github/instructions/terraform.instructions.md` |
| CI/CD Instructions | `.github/instructions/cicd.instructions.md` |
