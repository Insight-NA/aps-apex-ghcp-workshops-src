# GitHub Copilot for IaC/DevOps: Definitions & Best Practices

> **Reference Document for Workshop Series**  
> Duration: Use as pre-read or reference during workshops  
> Audience: DevOps Engineers, Platform Engineers, SREs, Cloud Architects

---

## 📖 Key Definitions (IaC/DevOps Context)

### 1. GitHub Copilot

**Definition**: An AI-powered pair programmer that integrates directly into VS Code (and other IDEs) to provide code suggestions, explanations, and automated generation based on context.

**IaC/DevOps Context**:
- Generates Terraform HCL, Bicep, ARM templates, and CloudFormation
- Suggests Azure CLI/PowerShell commands
- Completes YAML for CI/CD pipelines (Azure DevOps, GitHub Actions)
- Understands infrastructure patterns from comments and existing code

**Azure Example**:
```hcl
# Copilot understands this comment and generates the resource
# Create an Azure App Service Plan for Linux with B1 SKU
resource "azurerm_service_plan" "main" {
  name                = "asp-roadtrip-dev"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}
```

---

### 2. MCP Servers (Model Context Protocol)

**Definition**: Standardized protocol allowing Copilot to connect to external data sources, APIs, and services to enrich context beyond the local codebase.

**IaC/DevOps Context**:
- **Azure MCP**: Query deployed resources, subscription info, resource groups
- **Documentation MCP**: Fetch latest Azure/Terraform docs during generation
- **Kubernetes MCP**: Introspect clusters for accurate manifest generation

**Azure Example**:
```
# Using Azure MCP to discover existing resources
@azure List all App Services in subscription "Production"

# Copilot can then generate Terraform import blocks:
terraform import azurerm_linux_web_app.main /subscriptions/.../resourceGroups/rg-roadtrip-prod/providers/Microsoft.Web/sites/roadtrip-api
```

**Available Tools in this Repo**:
- `mcp_com_microsoft_subscription_list` - List Azure subscriptions
- `mcp_com_microsoft_group_list` - List resource groups
- `mcp_com_microsoft_documentation` - Search Microsoft docs
- `mcp_com_microsoft_get_bestpractices` - Azure best practices

---

### 3. Custom Agents

**Definition**: Specialized AI assistants with predefined instructions, expertise areas, and workflows that can be invoked for specific tasks.

**IaC/DevOps Context**:
- `@terraform-azure-planning` - Generates Terraform plans following Azure best practices
- `@debug` - Troubleshoots pipeline failures and deployment errors
- `@task-researcher` - Researches Azure service capabilities before implementation

**Repo Example** (from `.github/copilot-agents/`):
```markdown
# terraform-azure-planning.agent.md
You are an expert in Terraform and Azure infrastructure.
When generating Terraform:
1. Always use azurerm provider ~>3.85
2. Follow naming convention: {resource-type}-{project}-{environment}
3. Use locals for computed values
4. Add lifecycle blocks for critical resources
```

**Usage**:
```
@terraform-azure-planning Create a networking module with VNet, 3 subnets, and NSGs for production
```

---

### 4. Prompt Files

**Definition**: Reusable `.prompt.md` files containing structured prompts that can be invoked across sessions for consistent AI-assisted workflows.

**IaC/DevOps Context**:
- Standardize how teams request infrastructure generation
- Ensure compliance requirements are always included
- Capture organizational patterns and policies

**Example** (`/.github/prompts/create-terraform-module.prompt.md`):
```markdown
# Create Terraform Module

## Context
- Provider: azurerm ~>3.85
- Naming: {type}-{project}-{env}-{suffix}
- Backend: Azure Storage Account

## Requirements
Generate a Terraform module with:
1. main.tf - Resource definitions
2. variables.tf - Input variables with descriptions
3. outputs.tf - Exported values
4. README.md - Module documentation

## Module: {{MODULE_NAME}}
Purpose: {{PURPOSE}}
Resources: {{RESOURCE_LIST}}
```

---

### 5. Instruction Files

**Definition**: Configuration files (like `.github/copilot-instructions.md`) that provide persistent context to Copilot about project conventions, architecture decisions, and constraints.

**IaC/DevOps Context**:
- Define approved Azure services and SKUs
- Specify networking patterns (public vs private endpoints)
- Enforce tagging standards and naming conventions
- Reference compliance requirements

**Repo Example** (from `copilot-instructions.md`):
```markdown
### Infrastructure Standards
- **Compute**: Azure App Service (P1V3 for prod, B1 for dev)
- **Database**: PostgreSQL Flexible Server (not single server)
- **Networking**: Private endpoints required for prod/stage/uat
- **Secrets**: Azure Key Vault (no hardcoded values)
```

---

### 6. Chain-of-Thought Prompting

**Definition**: A prompting technique where you ask the AI to reason through a problem step-by-step before generating code, improving accuracy for complex tasks.

**IaC/DevOps Context**:
- Complex networking setups with multiple dependencies
- Multi-environment configurations with conditional logic
- Security implementations with RBAC and policies

**Azure Networking Example**:
```
Think through this step by step:

1. First, determine if we need a VNet based on environment (dev=no, prod=yes)
2. If VNet needed, calculate CIDR blocks for 3 subnets (app, db, private endpoints)
3. For each subnet, determine which NSG rules are required
4. Identify which resources need private endpoints (PostgreSQL, Key Vault)
5. Plan the Private DNS zones needed for each endpoint type
6. Finally, generate the Terraform code with proper dependencies

Now create the networking module for the Road Trip Planner production environment.
```

---

### 7. Few-Shot Prompting

**Definition**: Providing examples of desired input-output pairs before asking for new generation, helping the AI understand the exact format and style expected.

**IaC/DevOps Context**:
- Consistent variable naming across modules
- Standardized resource configurations
- Uniform tagging patterns

**Example with tfvars**:
```
Here are examples of our environment tfvars files:

Example 1 (dev.tfvars.json):
{
  "environment": "dev",
  "enable_private_endpoints": false,
  "app_service_sku": "B1",
  "database_sku": "B_Standard_B1ms"
}

Example 2 (prod.tfvars.json):
{
  "environment": "prod", 
  "enable_private_endpoints": true,
  "app_service_sku": "P1V3",
  "database_sku": "GP_Standard_D2s_v3"
}

Now generate uat.tfvars.json following the same pattern (private endpoints, mid-tier SKUs).
```

---

### 8. Tree-of-Thoughts Prompting

**Definition**: An advanced technique where the AI explores multiple solution paths simultaneously, evaluates each, and selects the optimal approach.

**IaC/DevOps Context**:
- Comparing deployment strategies (Blue-Green vs Canary vs Rolling)
- Evaluating networking architectures (Hub-Spoke vs Flat vs Mesh)
- Assessing database scaling options (vertical vs horizontal vs read replicas)

**Azure Example**:
```
Explore three different approaches for implementing auto-scaling for our Azure App Service:

Approach A: Azure Monitor autoscale rules based on CPU/Memory
Approach B: Azure Front Door with multiple regional backends
Approach C: Azure Container Apps with KEDA scalers

For each approach:
1. List the Azure resources required
2. Estimate monthly cost for 1000 req/min average load
3. Identify complexity of implementation
4. Note any limitations for our Python FastAPI backend

Select the best approach and generate the Terraform configuration.
```

---

### 9. Self-Consistency Prompting

**Definition**: Running the same prompt multiple times and selecting the most consistent answer, or asking the AI to verify its own output against requirements.

**IaC/DevOps Context**:
- Validating generated Terraform against security policies
- Ensuring CI/CD pipelines cover all required stages
- Verifying module outputs match expected interfaces

**Example**:
```
Generate a Terraform module for Azure PostgreSQL Flexible Server.

After generation, verify the output against these requirements:
□ Uses private endpoint when enable_private_endpoints = true
□ Configures backup retention (7 days dev, 35 days prod)
□ Sets firewall rules to deny public access in production
□ Includes diagnostic settings for Log Analytics
□ Uses managed identity for authentication where possible

If any requirement is not met, regenerate the relevant section.
```

---

## 🏆 AI-Assisted DevOps/SRE Best Practices

### Terraform Automation with Copilot

#### 1. Context-Rich Generation

**Best Practice**: Always provide existing tfvars, modules, and naming conventions as context before requesting new infrastructure.

```
# Good: Provides context
Given our existing dev.tfvars.json configuration and the naming pattern 
used in modules/compute/main.tf, generate the staging environment configuration.

# Bad: No context
Create a staging environment for Azure.
```

#### 2. Iterative Refinement

**Best Practice**: Generate infrastructure in layers, validating each before proceeding.

```bash
# Layer 1: Foundation (validate)
terraform validate && terraform plan -target=module.networking

# Layer 2: Compute (validate)
terraform validate && terraform plan -target=module.compute

# Layer 3: Security (validate)
terraform validate && terraform plan -target=module.security
```

#### 3. Security-First Generation

**Best Practice**: Explicitly request security controls in every infrastructure prompt.

```
Generate an Azure App Service configuration with:
- Managed Identity enabled (system-assigned)
- HTTPS only enforcement
- Minimum TLS 1.2
- IP restrictions for production (allow Azure Front Door only)
- Diagnostic logging to Log Analytics
- No FTP access
```

#### 4. Cost-Aware Infrastructure

**Best Practice**: Include cost constraints when generating infrastructure.

```
Generate Azure infrastructure for a development environment:
- Monthly budget: $100
- Prefer consumption-based services
- Use Basic/Free tiers where available
- No geo-redundancy required
- Single region (Central US)
```

---

### Azure Pipeline Optimization

#### 1. Pipeline Generation Pattern

**Best Practice**: Start with pipeline skeleton, then expand stages.

```yaml
# Step 1: Ask Copilot for skeleton
# "Generate Azure DevOps pipeline skeleton for Python backend + React frontend"

# Step 2: Expand each stage
# "Add caching for pip dependencies in BuildBackend job"

# Step 3: Add deployment
# "Add deployment stage to Azure App Service with slot swapping"

# Step 4: Add quality gates
# "Add SonarCloud analysis and minimum coverage threshold"
```

#### 2. Variable Group Management

**Best Practice**: Use Copilot to generate variable group documentation.

```
# Prompt:
Based on our azure-pipelines.yml, generate documentation for the required 
variable groups including:
- Variable name
- Description
- Example value (sanitized)
- Where it's used in the pipeline
```

#### 3. Template Extraction

**Best Practice**: When pipelines exceed 200 lines, ask Copilot to extract templates.

```
# Prompt:
Refactor this azure-pipelines.yml to use templates:
1. Extract Python build steps to templates/python-build.yml
2. Extract deployment steps to templates/app-service-deploy.yml
3. Create a parameters schema for reusability
```

---

### Incident Response with Copilot

#### 1. Log Analysis

**Best Practice**: Use Copilot Chat to analyze error patterns.

```
# Prompt with log context:
Analyze these Application Insights traces:
[paste error logs]

Identify:
1. Root cause of the 500 errors
2. Affected endpoints
3. Correlation with recent deployments
4. Suggested fix in our FastAPI codebase
```

#### 2. Runbook Generation

**Best Practice**: Generate incident response runbooks from architecture docs.

```
# Prompt:
Based on our ARCHITECTURE.md and deployment scripts, generate an incident 
runbook for:
- Database connection failures
- Include Azure CLI diagnostic commands
- Add escalation contacts (placeholder)
- Provide rollback procedure using Terraform
```

#### 3. Post-Mortem Analysis

**Best Practice**: Use Copilot to structure post-mortems.

```
# Prompt:
Create a post-mortem document for this incident:
- Service: Azure App Service (roadtrip-api)
- Duration: 45 minutes
- Impact: 502 errors for 30% of users
- Root cause: Database connection pool exhaustion

Include: Timeline, 5 Whys analysis, action items with owners
```

---

### GitOps Workflows

#### 1. Pull Request Automation

**Best Practice**: Use Copilot to generate PR descriptions for IaC changes.

```
# Prompt:
Generate a PR description for these Terraform changes:
[paste diff]

Include:
- Summary of infrastructure changes
- Resources added/modified/destroyed
- Cost impact estimate
- Required approvals (networking team for VNet changes)
- Rollback procedure
```

#### 2. Drift Detection

**Best Practice**: Generate drift detection scripts.

```
# Prompt:
Create a GitHub Action that:
1. Runs terraform plan on schedule (daily)
2. Detects drift between state and deployed resources
3. Opens an issue if drift detected
4. Tags the infrastructure team
```

#### 3. Environment Promotion

**Best Practice**: Automate environment promotion with Copilot-generated scripts.

```
# Prompt:
Generate a script to promote infrastructure from dev to staging:
1. Compare dev.tfvars.json and stage.tfvars.json
2. Highlight SKU and scaling differences
3. Generate terraform plan for staging
4. Create approval gate before apply
```

---

### Security Scanning Integration

#### 1. Pre-Commit Security

**Best Practice**: Integrate security scanning in development workflow.

```yaml
# Generated by Copilot for .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.86.0
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tflint
      - id: terraform_tfsec
        args:
          - --args=--soft-fail
```

#### 2. Pipeline Security Gates

**Best Practice**: Add security scanning to CI/CD pipelines.

```
# Prompt:
Add security scanning to our azure-pipelines.yml:
- tfsec for Terraform security issues
- Checkov for compliance policies
- Trivy for container vulnerabilities
- Fail pipeline on HIGH/CRITICAL findings
- Generate SARIF report for GitHub Security tab
```

#### 3. Secret Detection

**Best Practice**: Prevent secrets in IaC with automated scanning.

```
# Prompt:
Generate a GitHub Action to scan for exposed secrets:
- Check .tf files for hardcoded credentials
- Scan tfvars for sensitive values
- Verify no API keys in pipeline variables
- Block PR merge if secrets detected
```

---

## 🔗 Quick Reference Links

| Resource | Location |
|----------|----------|
| Copilot Instructions | `.github/copilot-instructions.md` |
| Custom Agents | `.github/copilot-agents/` |
| Spec Kit Agents | `.github/agents/` |
| Terraform Modules | `infrastructure/terraform/modules/` |
| Environment Configs | `infrastructure/terraform/environments/` |
| Pipeline Config | `azure-pipelines.yml` |
| Project Roadmap | `ROADMAP.md` (Issues #23-#28 for IaC) |

---

## 📚 Further Reading

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines)
- [Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/)
- [HashiCorp Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)
