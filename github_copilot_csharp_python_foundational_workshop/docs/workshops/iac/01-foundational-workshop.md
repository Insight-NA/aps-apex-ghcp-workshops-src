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

```hcl
# In a new .tf file, type this comment and wait for Copilot suggestion:

# Create an Azure resource group in Central US for the roadtrip project

# Copilot will suggest something like:
resource "azurerm_resource_group" "main" {
  name     = "rg-roadtrip-dev"
  location = "centralus"
  
  tags = {
    Environment = "Development"
    Project     = "RoadTrip"
  }
}
```

### Discussion Points
- How does Copilot know about Azure resource types?
- What context influences suggestion quality?
- When should you accept vs reject suggestions?

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

**Step 3**: Notice how Copilot uses the tfvars values:
```hcl
resource "azurerm_service_plan" "main" {
  name                = "asp-roadtrip-dev"  # Matches environment
  resource_group_name = "rg-roadtrip-dev"   # From tfvars
  location            = "centralus"          # From tfvars
  os_type             = "Linux"
  sku_name            = "B1"                 # Matches app_service_sku
}
```

### Tips for Better Context
- Keep relevant tfvars files open while generating resources
- Use descriptive file names (`networking.tf`, `compute.tf`)
- Reference existing modules in comments

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

```hcl
# Create Azure PostgreSQL Flexible Server for production

# Step 1: Accept resource declaration
resource "azurerm_postgresql_flexible_server" "main" {
  
  # Step 2: Tab to accept name (review it)
  name                = "psql-roadtrip-prod"  # ✓ Good naming
  
  # Step 3: Tab to accept location
  resource_group_name = azurerm_resource_group.main.name  # ✓ Good reference
  
  # Step 4: STOP - Review security settings before accepting
  # Copilot might suggest public_network_access_enabled = true
  # For production, we need: public_network_access_enabled = false
  
  # Step 5: Manually add secure defaults
  public_network_access_enabled = false
  
  # Continue with Tab for remaining attributes...
}
```

### Red Flags to Watch For
| Suggestion | Risk | Action |
|------------|------|--------|
| `public_network_access_enabled = true` | Security | Reject for prod |
| `sku_name = "B_Standard_B1ms"` | Cost | Verify against tfvars |
| `backup_retention_days = 7` | Compliance | Check requirements |
| Missing `lifecycle` block | Stability | Add manually |

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

---

## Topic 5: Customizing Copilot for DevOps Workflows (~8 min)

### Concept

Copilot can be tailored for your organization's DevOps practices through instruction files and workspace configuration.

### Instruction File Structure

```markdown
# .github/copilot-instructions.md

## Infrastructure Standards
- Provider: azurerm ~>3.85
- Naming: {resource-type}-{project}-{environment}-{suffix}
- Required tags: Environment, Project, ManagedBy, Owner

## Pipeline Standards  
- Use Azure DevOps variable groups for secrets
- Require approval gates for production deployments
- Include terraform validate and plan in PR pipelines

## Forbidden Patterns
- No inline secrets in YAML
- No skip-ci commits to main
- No terraform apply without plan file
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

**Prompt 2**: "What Azure DevOps variable groups are needed for this pipeline?"

**Expected Response**:
```
Based on the pipeline, you need a variable group named 'roadtrip-prod-vars' with:
- RESOURCE_GROUP: Azure resource group name
- APP_NAME: App Service name
- STATICWEB_NAME: Static Web App name
- MAPBOX_TOKEN: Mapbox API token
- GOOGLE_CLIENT_ID: OAuth client ID
- AZURE_SUBSCRIPTION: Service connection name
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

### Discussion: When NOT to Use Copilot

- Sensitive compliance-driven infrastructure (SOC2, HIPAA) without review
- Production changes without proper testing
- Complex state migrations
- Disaster recovery implementations

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
| #28 | CI/CD pipeline integration | Pipeline exists | No Terraform stages yet |

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

Use Copilot to generate the missing CI/CD pipeline stage for Terraform:
```
Add a TerraformPlan_Dev stage to azure-pipelines.yml that:
1. Initializes Terraform with the dev backend
2. Runs terraform plan with environments/dev.tfvars.json
3. Publishes the plan file as a pipeline artifact
```

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
| Definitions Reference | `docs/workshops/00-copilot-definitions-best-practices.md` |
| Project Roadmap | `ROADMAP.md` |
| Terraform Modules | `infrastructure/terraform/modules/` |
| Pipeline Config | `azure-pipelines.yml` |
| Copilot Instructions | `.github/copilot-instructions.md` |
