# Workshop 02: GitHub Copilot for IaC - Intermediate Skills

> **Duration**: 1 hour  
> **Level**: Intermediate  
> **Prerequisites**: Completed Workshop 01, familiarity with Terraform basics  
> **Format**: 9 topics (~6 minutes each) + 15-minute hands-on exercise

---

## 🎯 Learning Objectives

By the end of this workshop, participants will:
- Use inline suggestions effectively in `.tf` files
- Craft prompts for specific Azure resource generation
- Leverage Copilot to explain shell scripts
- Generate Terraform from descriptive comments
- Refactor Dockerfiles using Copilot
- Debug pipeline errors with Copilot Chat
- Apply few-shot prompting with tfvars examples
- Integrate terraform validate into workflows
- Use Copilot CLI for Azure commands

---

## Topic 1: Inline Suggestions for .tf Files (~6 min)

### Concept

Copilot provides real-time inline suggestions as you type in Terraform files. Understanding the suggestion triggers maximizes productivity.

### Suggestion Triggers

| Trigger | Example | Copilot Behavior |
|---------|---------|------------------|
| Resource type | `resource "azurerm_` | Lists available resource types |
| Attribute start | `  name = ` | Suggests value based on context |
| Block start | `  tags = {` | Completes tag structure |
| Reference start | `azurerm_resource_group.` | Lists available resources |
| Variable reference | `var.` | Shows defined variables |

### Live Demo: Typing Flow

From our actual `modules/compute/main.tf` — observe how Copilot auto-completes:
```hcl
# Start typing and observe suggestions at each point:

resource "azurerm_linux_web_app" "backend" {
  # After typing 'name = "' Copilot suggests naming pattern with suffix
  name                = "app-${var.project_name}-api-${var.environment}-${var.resource_suffix}"
  
  # After typing 'resource_group' Copilot references the variable
  resource_group_name = var.resource_group_name
  
  # After typing 'service_plan' Copilot references the service plan
  service_plan_id     = azurerm_service_plan.main.id
  
  # Type 'https' and Copilot suggests security setting
  https_only = true
  
  # After opening identity block, Copilot suggests managed identity
  identity {
    type = "SystemAssigned"
  }
  
  # After typing 'virtual_network' Copilot suggests the conditional pattern
  virtual_network_subnet_id = var.enable_vnet_integration ? var.app_service_subnet_id : null
  
  # After opening site_config, Copilot auto-completes security settings
  site_config {
    application_stack {
      python_version = var.python_version
    }
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 5
    minimum_tls_version = "1.2"
    ftps_state          = "Disabled"
  }
}
```

### Pipeline Parallel: Inline YAML Suggestions

The same inline experience works in workflow YAML. Start typing:
```yaml
# In .github/workflows/terraform.yml, type a step and observe:

- name: Setup Terraform
  uses: hashicorp/  # Copilot suggests: setup-terraform@v3
  with:
    terraform_  # Copilot suggests: version: '1.7.0'

- name: Azure Login
  uses: azure/  # Copilot suggests: login@v2
  with:
    creds: ${{ secrets.  # Copilot suggests: AZURE_CREDENTIALS }}

- name: Terraform Plan
  run: ./infrastructure/scripts/  # Copilot suggests: terraform-ci.sh
```

### Pro Tips

1. **Type slowly at decision points** - Give Copilot time to fetch suggestions
2. **Use `Ctrl+Space`** - Force suggestion menu if none appears
3. **Arrow keys** - Navigate alternative suggestions
4. **Tab** - Accept current suggestion
5. **Escape** - Dismiss and type manually
6. **In YAML**: Type `uses:` and a space for action suggestions

### Exercise: Trigger Exploration

Create a new file `test-suggestions.tf` and type:
```hcl
resource "azurerm_
```
Count how many resource types Copilot suggests. Find `azurerm_key_vault_secret`.

---

## Topic 2: Prompting for Azure Resources (~6 min)

### Concept

Effective prompts for Azure resource generation follow a structured pattern:
```
[Action] [Resource Type] for [Purpose] with [Requirements]
```

### Prompt Quality Comparison

**❌ Vague Prompt**:
```
# Create a storage account
```
Result: Generic configuration, wrong naming, no security settings

**✅ Specific Prompt**:
```hcl
# Create an Azure Storage Account for Terraform state backend
# Requirements:
# - Account name: stroadtripstate${random_string.suffix.result}
# - Location: same as resource group
# - Standard LRS replication (dev environment)
# - Enable blob versioning for state protection
# - Disable public blob access
# - Use managed identity for access
```

### Azure-Specific Prompt Elements

| Element | Example | Purpose |
|---------|---------|---------|
| SKU/Tier | "B1 for dev, P1V3 for prod" | Cost control |
| Networking | "private endpoint required" | Security |
| Identity | "system-assigned managed identity" | Auth pattern |
| Compliance | "geo-redundant backup" | Data protection |
| Integration | "connected to Log Analytics workspace" | Observability |

### Live Demo: PostgreSQL Prompt

```hcl
# Create Azure PostgreSQL Flexible Server for the Road Trip Planner backend
# Requirements:
# - Environment-aware naming: psql-${var.project_name}-${var.environment}-${var.resource_suffix}
# - SKU from variable: var.database_sku (B_Standard_B1ms for dev)
# - Storage: var.database_storage_mb (32GB for dev)
# - PostgreSQL version 16
# - Backup retention: var.backup_retention_days (7 dev, 35 prod)
# - VNet integration: conditional on var.enable_private_endpoint
# - Dynamic high_availability block (ZoneRedundant for prod only)
# - Maintenance window: Sunday 2-4 AM
# - Lifecycle: prevent_destroy=false, ignore administrator_password changes

resource "azurerm_postgresql_flexible_server" "main" {
  # Copilot generates based on structured requirements...
}
```

Compare to our actual `modules/database/main.tf` — the structured prompt should produce code matching the real implementation.

### Pipeline Parallel: Prompting for Pipeline Steps

The same structured prompting works for pipeline actions:
```yaml
# Prompt:
# Create a GitHub Actions step for Terraform plan that:
# - Delegates to infrastructure/scripts/terraform-ci.sh
# - Passes --action plan --environment dev
# - Injects secrets as TF_VAR_* env vars (mapbox, google, jwt, gemini, azure_maps)
# - Uploads the plan file as an artifact with 5-day retention

- name: Terraform Plan (dev)
  run: ./infrastructure/scripts/terraform-ci.sh --action plan --environment dev
  env:
    TF_VAR_mapbox_token: ${{ secrets.TF_VAR_MAPBOX_TOKEN }}
    TF_VAR_google_client_id: ${{ secrets.TF_VAR_GOOGLE_CLIENT_ID }}
    TF_VAR_jwt_secret_key: ${{ secrets.TF_VAR_JWT_SECRET_KEY }}
    TF_VAR_gemini_api_key: ${{ secrets.TF_VAR_GEMINI_API_KEY }}
    TF_VAR_azure_maps_key: ${{ secrets.TF_VAR_AZURE_MAPS_KEY }}

- uses: actions/upload-artifact@v4
  with:
    name: tfplan-dev
    path: infrastructure/terraform/tfplan-dev.out
    retention-days: 5
```

---

## Topic 3: Explaining startup.sh with Copilot (~6 min)

### Concept

Shell scripts in IaC projects often contain critical initialization logic. Copilot Chat can explain complex scripts and identify potential issues.

### Our startup.sh Analysis

The Road Trip Planner has a `backend/startup.sh` script for Azure App Service.

**Copilot Chat Prompt**:
```
Explain what backend/startup.sh does, identify any security concerns, 
and suggest improvements for production deployment.
```

### Common Script Patterns Copilot Explains

| Pattern | What Copilot Identifies |
|---------|------------------------|
| Environment variable checks | Missing required vars |
| Database migrations | Alembic upgrade commands |
| Dependency installation | pip install patterns |
| Process management | Gunicorn/uvicorn startup |
| Health checks | Pre-flight validation |

### Live Demo: Script Explanation

```bash
#!/bin/bash
# Ask Copilot: "What does each section of this startup script do?"

# Section 1: Environment validation
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

# Section 2: Database migrations
cd /app
python -m alembic upgrade head

# Section 3: Application startup
exec gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120
```

**Copilot Explanation**:
```
This script:
1. Validates DATABASE_URL is set (fails fast if missing)
2. Runs Alembic migrations to update database schema
3. Starts Gunicorn with 4 Uvicorn workers for async support
4. Binds to all interfaces on port 8000 with 120s timeout

Security concern: No secret validation for other required vars
Improvement: Add health check endpoint call after startup
```

### Exercise: Identify Missing Validation

Ask Copilot Chat:
```
What environment variables does our backend/main.py require that 
startup.sh doesn't validate?
```

---

## Topic 4: Comment-Based Terraform Generation (~6 min)

### Concept

Well-structured comments in Terraform files guide Copilot to generate accurate, context-aware code. This is "prompt engineering" directly in code.

### Comment Structure Pattern

```hcl
# =============================================================================
# [Section Name]
# =============================================================================
# Purpose: [What this section does]
# Dependencies: [What must exist first]
# Outputs: [What this creates/exposes]
# =============================================================================

# [Specific resource requirement]
# - Attribute 1: [value or logic]
# - Attribute 2: [value or logic]
```

### Live Demo: Module Generation from Comments

```hcl
# =============================================================================
# Compute Module - App Service Configuration
# =============================================================================
# Purpose: Deploy Azure App Service for FastAPI backend
# Dependencies: Resource Group, Service Plan, Networking (for VNet integration)
# Outputs: App Service ID, Default Hostname, Managed Identity Principal ID
# =============================================================================

# Create Linux App Service for Python 3.12 FastAPI application
# - Name pattern: app-{project}-{environment}
# - OS: Linux (required for Python)
# - Runtime: Python 3.12
# - VNet Integration: Conditional based on var.enable_vnet_integration
# - Managed Identity: System-assigned for Key Vault access
# - HTTPS Only: Enforced
# - Minimum TLS: 1.2

resource "azurerm_linux_web_app" "main" {
  # Copilot generates complete resource based on structured comments
  name                = "app-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  
  https_only = true
  
  identity {
    type = "SystemAssigned"
  }
  
  site_config {
    minimum_tls_version = "1.2"
    
    application_stack {
      python_version = "3.12"
    }
  }
  
  # VNet integration (conditional)
  virtual_network_subnet_id = var.enable_vnet_integration ? var.app_service_subnet_id : null
}
```

Notice the actual code uses a **simple conditional** (`? :`) for VNet integration — not a `dynamic` block. This is cleaner and matches how `modules/compute/main.tf` is actually implemented.

### Pipeline Parallel: Comment-Based Pipeline Generation

Structured comments work for YAML too. Add these to a workflow:
```yaml
# =============================================================================
# Terraform Apply Stage
# =============================================================================
# Purpose: Apply approved Terraform changes to dev environment
# Dependencies: plan-dev job must succeed, push to main branch
# Security: Uses GitHub Environment 'dev' for deployment tracking
# Script: Delegates to infrastructure/scripts/terraform-ci.sh
# =============================================================================

apply-dev:
  name: 'Apply (dev)'
  needs: plan-dev
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment: dev
  steps:
    - uses: actions/checkout@v4
    - uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: '1.7.0'
    - uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    - uses: actions/download-artifact@v4
      with:
        name: tfplan-dev
        path: infrastructure/terraform
    - name: Terraform Apply (dev)
      run: ./infrastructure/scripts/terraform-ci.sh --action apply --environment dev
```

### Best Practices

1. **Be specific about conditionals** - "if dev then X, if prod then Y"
2. **Reference variables by name** - `var.environment`, `var.database_sku`
3. **Specify security requirements** - TLS, encryption, access controls
4. **Include output requirements** - What downstream resources need
5. **For pipelines** - Specify the script path and argument pattern in the comment

---

## Topic 5: Refactoring Dockerfile to Multi-Stage (~6 min)

### Concept

Copilot excels at refactoring single-stage Dockerfiles into optimized multi-stage builds, reducing image size and improving security.

### Current Backend Dockerfile

```dockerfile
# backend/Dockerfile (simplified)
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Copilot Refactoring Prompt

```
Refactor this Dockerfile to multi-stage build:
1. Build stage: Install dependencies with pip
2. Production stage: Copy only necessary files
3. Use non-root user for security
4. Optimize layer caching
5. Add health check
```

### Multi-Stage Result

```dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim as builder

WORKDIR /build
COPY requirements.txt .

RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production runtime
FROM python:3.12-slim as production

# Security: Run as non-root user
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /app

# Copy only pip packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Set PATH for pip packages
ENV PATH=/home/appuser/.local/bin:$PATH

USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Size Comparison

| Stage | Image Size |
|-------|------------|
| Single-stage | ~450MB |
| Multi-stage | ~180MB |

### Exercise: Refactor Frontend Dockerfile

Ask Copilot to refactor `frontend/Dockerfile`:
```
Convert this React Dockerfile to multi-stage:
1. Node builder for npm build
2. Nginx for serving static files
3. Non-root nginx user
```

---

## Topic 6: Copilot Chat for Pipeline Errors (~6 min)

### Concept

When CI/CD pipelines fail, Copilot Chat can diagnose issues from error messages and suggest fixes specific to your pipeline configuration.

### Error Analysis Workflow

1. **Copy the error** from pipeline logs
2. **Provide context** - pipeline file name, stage, job
3. **Ask for root cause** and fix

### Live Demo: Debugging Azure Pipeline

**Error Message**:
```
##[error]TerraformTaskV4@4: Error: Invalid resource configuration: 
The subscription_id attribute is required.
```

**Copilot Chat Prompt**:
```
This error occurs in our azure-pipelines.yml during the Terraform plan stage.
We're using TerraformTaskV4@4. What's the root cause and how do I fix it?
```

**Copilot Response**:
```
Root Cause: The Terraform task requires explicit Azure subscription configuration.

Fix: Add the environmentServiceNameAzureRM input to your Terraform task:

- task: TerraformTaskV4@4
  inputs:
    provider: 'azurerm'
    command: 'plan'
    workingDirectory: 'infrastructure/terraform'
    environmentServiceNameAzureRM: 'Azure-ServiceConnection'  # Add this
    commandOptions: '-var-file=environments/dev.tfvars.json'

Also ensure your service connection 'Azure-ServiceConnection' has 
Contributor access to the subscription.
```

### Common Pipeline Errors and Prompts

| Error Type | Prompt Template |
|------------|-----------------|
| Task not found | "Task XYZ@version not found. What's the correct task name?" |
| Variable missing | "$(VAR_NAME) is empty in stage X. How do I pass variables between stages?" |
| Condition failed | "Stage didn't run. Explain this condition: `condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')`" |
| Artifact missing | "Artifact 'terraform-plan' not found. How do I publish/download artifacts?" |

### Exercise: Debug Our Pipeline

Find this line in `azure-pipelines.yml`:
```yaml
continueOnError: true  # Don't fail build if tests fail
```

Ask Copilot:
```
Why is continueOnError: true problematic for CI/CD quality gates? 
How should I handle test failures instead?
```

---

## Topic 7: Few-Shot Prompting with tfvars (~6 min)

### Concept

Few-shot prompting provides examples of the desired output pattern before requesting new generation. This ensures consistency across environment configurations.

### Pattern: Environment tfvars Generation

**Few-Shot Prompt** (using _actual_ keys from our repo):
```
Here are our existing environment configurations:

Example 1 - dev.tfvars.json:
{
  "environment": "dev",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-dev",
  "project_name": "roadtrip",
  "enable_private_endpoints": false,
  "enable_vnet_integration": false,
  "app_service_sku": "B1",
  "app_service_os": "Linux",
  "python_version": "3.12",
  "database_sku": "B_Standard_B1ms",
  "database_storage_mb": 32768,
  "database_version": "16",
  "database_backup_retention_days": 7,
  "database_geo_redundant_backup": false,
  "static_web_app_sku": "Free",
  "allowed_origins": ["http://localhost:5173", "http://localhost:3000"],
  "ai_service_url": "http://localhost:8080",
  "enable_monitoring": true,
  "enable_key_vault": false,
  "enable_auto_scaling": false,
  "enable_alerts": false,
  "tags": {
    "Environment": "Development",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform",
    "Owner": "DevTeam"
  }
}

Example 2 - prod.tfvars.json:
{
  "environment": "prod",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-prod",
  "project_name": "roadtrip",
  "enable_private_endpoints": true,
  "enable_vnet_integration": true,
  "vnet_address_space": ["10.0.0.0/16"],
  "subnet_app_service": "10.0.1.0/24",
  "subnet_database": "10.0.2.0/24",
  "subnet_private_endpoints": "10.0.3.0/24",
  "app_service_sku": "P1V3",
  "database_sku": "GP_Standard_D2s_v3",
  "database_storage_mb": 131072,
  "database_backup_retention_days": 35,
  "database_geo_redundant_backup": true,
  "static_web_app_sku": "Standard",
  "allowed_origins": ["https://roadtrip.azurestaticapps.net"],
  "ai_service_url": "https://roadtrip-ai-prod.azurecontainerapps.io",
  "enable_monitoring": true,
  "enable_key_vault": true,
  "enable_auto_scaling": true,
  "tags": {
    "Environment": "Production",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform",
    "Owner": "DevTeam",
    "Criticality": "High"
  }
}

Now generate uat.tfvars.json:
- UAT is a pre-production environment
- Should have private endpoints (like prod)
- Can use slightly lower SKUs than prod
- VNet required for security testing
- Separate VNet CIDR: 10.1.0.0/16
- UAT-specific allowed origins
```

**Generated uat.tfvars.json**:
```json
{
  "environment": "uat",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-uat",
  "project_name": "roadtrip",
  "enable_private_endpoints": true,
  "enable_vnet_integration": true,
  "vnet_address_space": ["10.1.0.0/16"],
  "subnet_app_service": "10.1.1.0/24",
  "subnet_database": "10.1.2.0/24",
  "subnet_private_endpoints": "10.1.3.0/24",
  "app_service_sku": "P1V2",
  "app_service_os": "Linux",
  "python_version": "3.12",
  "database_sku": "GP_Standard_D2s_v3",
  "database_storage_mb": 65536,
  "database_version": "16",
  "database_backup_retention_days": 14,
  "database_geo_redundant_backup": false,
  "static_web_app_sku": "Standard",
  "allowed_origins": ["https://roadtrip-uat.azurestaticapps.net"],
  "ai_service_url": "https://roadtrip-ai-uat.azurecontainerapps.io",
  "enable_monitoring": true,
  "enable_key_vault": true,
  "enable_auto_scaling": false,
  "enable_alerts": true,
  "tags": {
    "Environment": "UAT",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform",
    "Owner": "DevTeam"
  }
}
```

### Pipeline Parallel: Few-Shot Workflow Environment Matrix

Use few-shot to generate environment-specific pipeline configs:
```
Here is how we deploy to dev:

apply-dev:
  needs: plan-dev
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment: dev
  steps:
    - run: ./infrastructure/scripts/terraform-ci.sh --action apply --environment dev

Now generate apply-uat with:
- Needs: plan-uat
- Only on release branches (release/*)
- Requires 'uat' environment approval
- Same script, different --environment flag
```

**Generated**:
```yaml
apply-uat:
  needs: plan-uat
  runs-on: ubuntu-latest
  if: startsWith(github.ref, 'refs/heads/release/')
  environment: uat
  steps:
    - uses: actions/checkout@v4
    - uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: '1.7.0'
    - uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    - uses: actions/download-artifact@v4
      with:
        name: tfplan-uat
        path: infrastructure/terraform
    - name: Terraform Apply (uat)
      run: ./infrastructure/scripts/terraform-ci.sh --action apply --environment uat
```

### Few-Shot Benefits for IaC

| Benefit | Example |
|---------|---------|
| Consistency | Same tag structure across all envs |
| Pattern learning | Copilot infers naming conventions |
| Error reduction | Less likely to miss required fields |
| Team alignment | Everyone generates same format |

---

## Topic 8: Testing with terraform validate (~6 min)

### Concept

Integrate Copilot with Terraform validation commands for immediate feedback on generated code quality. Our CI pipeline runs this automatically via `infrastructure/scripts/terraform-ci.sh`.

### Validation Workflow

```bash
# After Copilot generates Terraform code:

# Step 1: Format check
terraform fmt -check -recursive
# Copilot: "Fix formatting issues in the generated code"

# Step 2: Initialize (if needed)
terraform init -backend=false

# Step 3: Validate syntax and references
terraform validate
# Copilot: "Fix validation errors: <paste error>"

# Step 4: Security scan
tfsec .
# Copilot: "Address these security findings: <paste findings>"
```

### Pipeline Parallel: Validation in CI

Our `terraform.yml` workflow runs this same sequence automatically:
```yaml
# From .github/workflows/terraform.yml - validate job
validate:
  name: 'Validate'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: '1.7.0'
    - name: Terraform Format Check
      run: terraform fmt -check -recursive
      working-directory: infrastructure/terraform
    - name: Terraform Init (no backend)
      run: terraform init -backend=false
      working-directory: infrastructure/terraform
    - name: Terraform Validate
      run: terraform validate
      working-directory: infrastructure/terraform
```

The CI script (`infrastructure/scripts/terraform-ci.sh`) runs the same steps with `--action validate`:
```bash
./infrastructure/scripts/terraform-ci.sh --action validate --environment dev
```

### Copilot Integration with Validation Errors

**Validation Error**:
```
Error: Reference to undeclared resource

  on main.tf line 45, in resource "azurerm_linux_web_app" "main":
  45:   service_plan_id = azurerm_service_plan.app.id

A managed resource "azurerm_service_plan" "app" has not been declared.
```

**Copilot Fix Prompt**:
```
The terraform validate found this error. The App Service references 
azurerm_service_plan.app but I named it azurerm_service_plan.main. 
Fix the reference.
```

### Automated Validation Script

```bash
#!/bin/bash
# validate-terraform.sh - Use with Copilot generated code

set -e

echo "🔄 Formatting Terraform files..."
terraform fmt -recursive

echo "📦 Initializing Terraform..."
terraform init -backend=false

echo "✅ Validating configuration..."
terraform validate

echo "🔐 Running security scan..."
if command -v tfsec &> /dev/null; then
    tfsec . --soft-fail
fi

echo "✅ All validations passed!"
```

### Exercise: Validate Module

Run these commands on `infrastructure/terraform/`:
```bash
cd infrastructure/terraform
terraform init -backend=false
terraform validate
```

If errors appear, use Copilot Chat to diagnose and fix.

---

## Topic 9: Copilot CLI for Azure Commands (~6 min)

### Concept

GitHub Copilot CLI (`gh copilot`) translates natural language into shell commands, perfect for Azure CLI operations.

### Installation

```bash
# Install GitHub CLI extension
gh extension install github/gh-copilot
```

### Usage Patterns

```bash
# Explain a command
gh copilot explain "az webapp deployment slot swap --name app --resource-group rg --slot staging"

# Suggest a command
gh copilot suggest "list all Azure resource groups with terraform tag"

# Output:
# az group list --query "[?tags.ManagedBy=='Terraform']" -o table
```

### Common Azure CLI Requests

| Natural Language Request | Generated Command |
|-------------------------|-------------------|
| "Show App Service logs" | `az webapp log tail --name app --resource-group rg` |
| "Get PostgreSQL connection string" | `az postgres flexible-server show-connection-string --server-name psql` |
| "List Key Vault secrets" | `az keyvault secret list --vault-name kv --query "[].name"` |
| "Scale App Service to 3 instances" | `az webapp scale --name app -g rg --instance-count 3` |
| "Check deployment status" | `az webapp deployment list-publishing-profiles -n app -g rg` |

### Live Demo: Azure Resource Discovery

```bash
# Request
gh copilot suggest "show all resources in rg-roadtrip-dev grouped by type"

# Generated command
az resource list --resource-group rg-roadtrip-dev \
  --query "[].{Name:name, Type:type, Location:location}" \
  -o table

# Request
gh copilot suggest "export terraform import commands for all resources in rg-roadtrip-dev"

# Generated (conceptual)
az resource list -g rg-roadtrip-dev --query "[].id" -o tsv | \
while read id; do
  name=$(basename $id)
  type=$(echo $id | grep -oP 'providers/\K[^/]+/[^/]+')
  echo "terraform import azurerm_${type//\//_}.${name} ${id}"
done
```

### Exercise: Generate Import Commands

Use `gh copilot suggest` to:
1. List all App Services in your subscription
2. Generate a terraform import command for a specific resource

---

## 🔬 Hands-On Exercise: Generate main.tf with App Service (15 min)

### Objective

Generate `infrastructure/terraform/main.tf` additions for App Service Plan and App Service using existing tfvars as context.

### Setup

1. Open `infrastructure/terraform/environments/dev.tfvars.json` in VS Code
2. Open `infrastructure/terraform/main.tf` in a split view
3. Keep `infrastructure/terraform/variables.tf` accessible

### Exercise Steps

#### Step 1: Analyze Existing Context (2 min)

Review `dev.tfvars.json` for these values:
- `app_service_sku`: "B1"
- `app_service_os`: "Linux"
- `python_version`: "3.12"
- `project_name`: "roadtrip"
- `environment`: "dev"

#### Step 2: Generate App Service Plan (5 min)

In `main.tf`, add this comment block and let Copilot generate:

```hcl
# =============================================================================
# App Service Plan
# =============================================================================
# Create Azure App Service Plan (Linux) for hosting the FastAPI backend
# - Name: asp-${var.project_name}-${var.environment}
# - SKU from variable: var.app_service_sku
# - OS Type: var.app_service_os (Linux)
# - Zone redundancy: disabled for dev, enabled for prod
# - Tags: Use local.common_tags

resource "azurerm_service_plan" "main" {
  # Let Copilot complete...
}
```

**Expected Output**:
```hcl
resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = var.app_service_os
  sku_name            = var.app_service_sku

  tags = local.common_tags
}
```

#### Step 3: Generate App Service (5 min)

Continue with App Service resource:

```hcl
# =============================================================================
# App Service (Linux Web App)
# =============================================================================
# Create Azure App Service for Python FastAPI backend
# - Name: app-${var.project_name}-${var.environment}
# - Python version: var.python_version
# - HTTPS only: enforced
# - TLS 1.2 minimum
# - System-assigned managed identity for Key Vault access
# - App settings from variables: ALLOWED_ORIGINS, AI_SERVICE_URL
# - Conditional VNet integration based on var.enable_vnet_integration
# - Tags: Use local.common_tags

resource "azurerm_linux_web_app" "main" {
  # Let Copilot complete...
}
```

**Expected Output**:
```hcl
resource "azurerm_linux_web_app" "main" {
  name                = "app-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    minimum_tls_version = "1.2"
    
    application_stack {
      python_version = var.python_version
    }
  }

  app_settings = {
    ALLOWED_ORIGINS = join(",", var.allowed_origins)
    AI_SERVICE_URL  = var.ai_service_url
  }

  tags = local.common_tags
}
```

#### Step 4: Validate Your Work (3 min)

```bash
cd infrastructure/terraform
terraform fmt
terraform validate
```

If errors occur, use Copilot Chat:
```
terraform validate shows this error: <paste error>
Fix the generated Terraform code.
```



### Deliverable

Successfully generated and validated:
- `azurerm_service_plan.main` resource
- `azurerm_linux_web_app.main` resource
- Both resources reference correct variables from tfvars

### Bonus Challenge

Add outputs for the App Service:
```hcl
# Generate outputs for:
# - App Service ID
# - Default hostname
# - Managed Identity principal ID
```

---

## 📋 Workshop Summary

### Key Takeaways

1. **Inline suggestions** - Type slowly at decision points, use Tab/Escape
2. **Structured prompts** - Action + Resource + Purpose + Requirements
3. **Script explanation** - Copilot Chat for shell script understanding
4. **Comment-driven generation** - Detailed comments = accurate code
5. **Multi-stage Docker** - Copilot reduces image size by 60%+
6. **Pipeline debugging** - Paste errors, get fixes
7. **Few-shot consistency** - Examples ensure uniform configs
8. **Validate immediately** - terraform validate after generation
9. **CLI assistance** - Natural language to az commands

### Next Steps

- Practice generating complete modules
- Create few-shot examples for your organization
- Integrate validation into your workflow
- Join Workshop 03: Advanced IaC Skills

### Resources

| Resource | Location |
|----------|----------|
| Definitions Reference | `docs/workshops/iac/00-copilot-definitions-best-practices.md` |
| Environment Configs | `infrastructure/terraform/environments/` |
| Existing Modules | `infrastructure/terraform/modules/` |
| Terraform CI/CD Workflow | `.github/workflows/terraform.yml` |
| Terraform CI Script | `infrastructure/scripts/terraform-ci.sh` |
| Azure DevOps Pipeline | `azure-pipelines.yml` |
| Terraform Instructions | `.github/instructions/terraform.instructions.md` |
| CI/CD Instructions | `.github/instructions/cicd.instructions.md` |
| Backend Dockerfile | `backend/Dockerfile` |
