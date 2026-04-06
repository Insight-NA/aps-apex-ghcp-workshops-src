# Workshop 04: GitHub Copilot for IaC - Expert Enterprise Topics

> **Duration**: 1 hour  
> **Level**: Expert  
> **Prerequisites**: Completed Workshops 01-03, production infrastructure experience  
> **Format**: 6 topics (~10 minutes each) + 15-minute hands-on exercise

---

## 🎯 Learning Objectives

By the end of this workshop, participants will:
- Leverage MCP servers for Azure resource introspection
- Apply enterprise policy patterns for Terraform compliance
- Optimize model selection for IaC cost/quality tradeoffs
- Understand GitHub Copilot certification paths
- Use Spec Kit for comprehensive infrastructure planning
- Analyze Copilot metrics for IaC productivity improvement

---

## Topic 1: MCP Servers for Azure Introspection (~10 min)

### Concept

Model Context Protocol (MCP) servers allow Copilot to query live Azure resources, enabling brownfield scenarios like generating Terraform from existing infrastructure.

### Available Azure MCP Tools

| Tool | Purpose | Example Use |
|------|---------|-------------|
| `mcp_com_microsoft_subscription_list` | List subscriptions | Discover available subscriptions |
| `mcp_com_microsoft_group_list` | List resource groups | Find existing RGs |
| `mcp_com_microsoft_documentation` | Search MS docs | Get latest API info |
| `mcp_com_microsoft_get_bestpractices` | Azure best practices | Compliance guidance |
| `mcp_com_microsoft_applens` | Diagnostics | Troubleshoot resources |
| `mcp_com_microsoft_bicepschema` | Bicep schemas | ARM/Bicep generation |

### Discovering Resources

**Step 1: List Subscriptions**
```
Use the Azure MCP to list all subscriptions I have access to.
```

**Tool Call**:
```json
{
  "tool": "mcp_com_microsoft_subscription_list",
  "parameters": {}
}
```

**Step 2: List Resource Groups**
```
List all resource groups in subscription "Production" that have the tag ManagedBy=Terraform.
```

### Resource Introspection Workflow

```
1. Query subscriptions → Identify target subscription
2. List resource groups → Find infrastructure scope
3. Query specific resources → Get current configuration
4. Generate import blocks → Create terraform import commands
5. Generate resource definitions → Match existing infrastructure
```

### Live Demo: Introspection

**Query Existing Resources**:
```
Using Azure MCP tools, discover all resources in resource group "aps-demo-rg" 
and categorize them by resource type.
```

**Expected Discovery**:
```markdown
## Resources in aps-demo-rg

### Compute
- App Service Plan: asp-roadtrip-prod
- App Service: roadtrip-api-hl

### Database
- PostgreSQL Flexible Server: psql-roadtrip-prod

### Storage
- Storage Account: stateroadtrip

### Networking
- Virtual Network: vnet-roadtrip-prod
- Private Endpoint: pe-postgresql

### Security
- Key Vault: kv-roadtrip-prod

### Monitoring
- Application Insights: appi-roadtrip
- Log Analytics Workspace: log-roadtrip
```

### Generating Import Blocks

**Prompt**:
```
For each resource discovered in aps-demo-rg, generate the terraform import 
command using the correct resource type and resource ID format.
```

**Output**:
```bash
# Resource Group
terraform import azurerm_resource_group.main /subscriptions/xxx/resourceGroups/aps-demo-rg

# App Service Plan
terraform import azurerm_service_plan.main /subscriptions/xxx/resourceGroups/aps-demo-rg/providers/Microsoft.Web/serverfarms/asp-roadtrip-prod

# App Service
terraform import azurerm_linux_web_app.main /subscriptions/xxx/resourceGroups/aps-demo-rg/providers/Microsoft.Web/sites/roadtrip-api-hl

# PostgreSQL
terraform import azurerm_postgresql_flexible_server.main /subscriptions/xxx/resourceGroups/aps-demo-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-roadtrip-prod

# Key Vault
terraform import azurerm_key_vault.main /subscriptions/xxx/resourceGroups/aps-demo-rg/providers/Microsoft.KeyVault/vaults/kv-roadtrip-prod
```

---

## Topic 2: Enterprise Policy for Terraform Compliance (~10 min)

### Concept

Enterprise environments require Terraform to comply with organizational policies. Copilot can generate policy-compliant infrastructure when properly configured.

### Policy Categories

| Category | Example Policies |
|----------|-----------------|
| **Naming** | Resources must follow `{type}-{project}-{env}` pattern |
| **Tagging** | Required tags: Environment, Owner, CostCenter, ManagedBy |
| **Networking** | Production must use private endpoints |
| **Security** | TLS 1.2 minimum, no public blob access |
| **Cost** | Dev environments: B-tier only |
| **Compliance** | Data residency in approved regions only |

### Policy-as-Code Integration

**Sentinel/OPA Policies Example**:
```hcl
# policy/require-tags.sentinel
import "tfplan/v2" as tfplan

required_tags = ["Environment", "Owner", "CostCenter", "ManagedBy"]

main = rule {
  all tfplan.resources as _, resource {
    all required_tags as tag {
      resource.change.after.tags contains tag
    }
  }
}
```

### Copilot Instruction for Policy Compliance

Add to `.github/copilot-instructions.md`:

```markdown
## Enterprise Policy Requirements

### Mandatory Tags
All Azure resources MUST include these tags:
```hcl
tags = {
  Environment = var.environment      # dev, uat, stage, prod
  Owner       = var.owner            # Team/individual responsible
  CostCenter  = var.cost_center      # Budget allocation
  ManagedBy   = "Terraform"          # Always "Terraform"
  CreatedDate = timestamp()          # Auto-populated
}
```

### Approved Regions
Only these Azure regions are permitted:
- centralus (primary)
- eastus2 (DR)

### SKU Restrictions by Environment
| Environment | App Service | Database | Storage |
|-------------|-------------|----------|---------|
| dev | B1 | B_Standard_B1ms | Standard_LRS |
| uat | P1V2 | GP_Standard_D2s_v3 | Standard_GRS |
| stage | P1V2 | GP_Standard_D2s_v3 | Standard_GRS |
| prod | P1V3 | GP_Standard_D4s_v3 | Standard_RAGRS |

### Network Security
- **Production**: Private endpoints required, no public IPs
- **Non-Production**: Public endpoints allowed with IP restrictions
```

### Policy Validation Prompt

```
Generate an Azure App Service configuration for production that complies with:
1. Our naming convention: app-{project}-api-{env}-{suffix}
2. Required tags from terraform.instructions.md
3. Production SKU (P1V3)
4. Private endpoint integration
5. TLS 1.2 minimum

After generation, validate the output against all policies and list any violations.
```

### Pipeline Parallel: Policy Enforcement in CI

Policies should be enforced in the CI pipeline, not just in instruction files. Add a security scan step to `terraform.yml`:

```yaml
# Add to .github/workflows/terraform.yml validate job:

- name: Security Scan (tfsec)
  uses: aquasecurity/tfsec-action@v1.0.3
  with:
    working_directory: infrastructure/terraform
    soft_fail: false  # Block merge on HIGH/CRITICAL findings

- name: Policy Check (checkov)
  uses: bridgecrewio/checkov-action@v12
  with:
    directory: infrastructure/terraform
    framework: terraform
    check: CKV_AZURE_*  # Azure-specific checks only
    soft_fail: false
```

For Azure DevOps, add to the TerraformPlan_Dev stage:
```yaml
- task: AzureCLI@2
  displayName: 'Security Scan'
  inputs:
    azureSubscription: $(azureSubscription)
    scriptType: 'bash'
    scriptPath: 'infrastructure/scripts/terraform-ci.sh'
    arguments: '--action validate --environment dev'
```

The `terraform-ci.sh` script includes tfsec scanning when available, following the cicd.instructions.md Golden Rule of delegating all logic to scripts.

### Compliance Checklist Generation

```
Based on our enterprise policies in terraform.instructions.md, generate a 
pre-commit compliance checklist for Terraform changes that includes:
1. Naming validation regex
2. Required tag verification
3. SKU appropriateness check
4. Network security validation
5. Region compliance
6. CI pipeline validation (format, init, validate, tfsec)
```

---

## Topic 3: Model Selection for IaC Cost Optimization (~10 min)

### Concept

Different Copilot models have varying capabilities, costs, and latencies. Selecting the right model for IaC tasks optimizes both quality and expense.

### Model Comparison for IaC Tasks

| Model | Best For | Speed | Cost | Accuracy |
|-------|----------|-------|------|----------|
| **GPT-4o** | Complex modules, security review | Medium | Higher | Highest |
| **Claude 3.5 Sonnet** | Detailed explanations, refactoring | Medium | Higher | High |
| **GPT-4o-mini** | Simple resources, boilerplate | Fast | Lower | Good |
| **o1-preview** | Architecture planning, CoT | Slow | Highest | Excellent |

### Task-to-Model Mapping

| IaC Task | Recommended Model | Rationale |
|----------|-------------------|-----------|
| Generate basic resource | GPT-4o-mini | Fast, cost-effective for standard patterns |
| Complex networking module | GPT-4o / Claude | Better dependency handling |
| Security review | GPT-4o / o1-preview | Thorough vulnerability analysis |
| Architecture planning | o1-preview | Extended reasoning capabilities |
| Documentation | Claude 3.5 | Excellent technical writing |
| Quick fixes | GPT-4o-mini | Rapid iteration |

### Live Demo: Model Selection

**Scenario**: Generate a complex networking module with conditional logic.

**GPT-4o-mini attempt**:
```hcl
# May miss edge cases in conditional logic
resource "azurerm_virtual_network" "main" {
  count = var.enable_vnet ? 1 : 0
  # Basic implementation
}
```

**GPT-4o / o1-preview attempt**:
```hcl
# Better handles module-level conditionals
# In root main.tf:
module "networking" {
  source = "./modules/networking"
  count  = local.should_enable_vnet_integration ? 1 : 0
  # ... pass all variables
}

# Inside modules/networking/main.tf — no count on individual resources:
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = var.vnet_address_space
  tags                = var.tags
}

resource "azurerm_subnet" "app_service" {
  name                 = "snet-app-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.subnet_app_service]

  delegation {
    name = "delegation-app-service"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}
# Includes 4 subnets with proper delegations and NSGs
```

### Cost Optimization Strategy

```markdown
## Model Usage Policy

### Use GPT-4o-mini for:
- Single resource generation
- Variable definitions
- Output blocks
- Simple conditionals
- Documentation snippets

### Use GPT-4o / Claude for:
- Multi-resource modules
- Security-sensitive code
- Complex conditional logic
- Code reviews
- Refactoring

### Use o1-preview for:
- Architecture decisions
- Multi-environment planning
- Compliance analysis
- Root cause analysis
```

---

## Topic 4: GitHub Copilot Certification Paths (~10 min)

### Concept

GitHub offers certification programs that validate Copilot proficiency. Understanding these paths helps teams standardize skills and demonstrate expertise.

### Certification Overview

| Certification | Focus | Relevant IaC Skills |
|--------------|-------|---------------------|
| **GitHub Foundations** | Basic GitHub usage | Repository management, collaboration |
| **GitHub Actions** | CI/CD automation | Pipeline for Terraform, deployment automation |
| **GitHub Advanced Security** | Security features | Secret scanning, code scanning |
| **GitHub Copilot** | AI-assisted development | All Copilot features covered in workshops |

### Copilot Certification Topics

**Exam Domains**:
1. **Copilot Fundamentals** (20%)
   - How Copilot generates suggestions
   - Supported languages and IDEs
   - Privacy and security model

2. **Prompt Engineering** (25%)
   - Effective prompting techniques
   - Context provision strategies
   - Few-shot and chain-of-thought

3. **Code Generation** (25%)
   - Inline suggestions
   - Copilot Chat usage
   - Multi-file context

4. **Enterprise Features** (15%)
   - Copilot for Business
   - Content exclusions
   - Audit logging

5. **Best Practices** (15%)
   - Security considerations
   - Code review with Copilot
   - Responsible AI usage

### IaC-Specific Study Areas

```markdown
## Study Guide for IaC Professionals

### Terraform-Specific Skills
- [ ] Generate provider configurations
- [ ] Create modules with proper structure
- [ ] Use Copilot for state management commands
- [ ] Generate import blocks for existing resources

### Azure-Specific Skills
- [ ] ARM/Bicep generation with Copilot
- [ ] Azure CLI command suggestions
- [ ] Azure DevOps pipeline YAML
- [ ] Azure resource documentation lookup

### DevOps Integration Skills
- [ ] GitHub Actions for Terraform
- [ ] Secret management patterns
- [ ] Infrastructure testing approaches
- [ ] Drift detection automation
```

### Certification Preparation Resources

| Resource | Link | Purpose |
|----------|------|---------|
| GitHub Skills | skills.github.com | Hands-on learning paths |
| MS Learn | learn.microsoft.com | Azure + GitHub integration |
| Copilot Docs | docs.github.com/copilot | Official documentation |
| Practice Exams | certifications.github.com | Exam preparation |

---

## Topic 5: Spec Kit for Infrastructure Planning (~10 min)

### Concept

Spec Kit is a structured approach to specification-driven development. For IaC, it ensures infrastructure changes are fully planned, reviewed, and documented before implementation.

### Spec Kit Agents in Our Repo

From `.github/agents/`:
- `speckit.specify.agent.md` - Create specifications
- `speckit.plan.agent.md` - Generate implementation plans
- `speckit.tasks.agent.md` - Break into actionable tasks
- `speckit.clarify.agent.md` - Identify ambiguities
- `speckit.analyze.agent.md` - Cross-artifact consistency
- `speckit.implement.agent.md` - Execute the plan

### IaC Spec Kit Workflow

```
1. speckit.specify → Define infrastructure requirements
2. speckit.clarify → Resolve ambiguities (SKUs, regions, networking)
3. speckit.plan → Create implementation design
4. speckit.tasks → Generate task breakdown
5. speckit.implement → Execute with validation
6. speckit.analyze → Verify consistency
```

### Pipeline Parallel: Spec Kit for CI/CD Changes

Spec Kit also works for pipeline infrastructure:
```
@speckit.specify Create a specification for adding a staging environment to our
Terraform CI/CD pipeline (.github/workflows/terraform.yml):
- Purpose: Pre-production validation before prod deployment
- Trigger: Push to release/* branches
- Approval: Requires 'staging' GitHub Environment gate
- Script: Reuse infrastructure/scripts/terraform-ci.sh with --environment stage
- Artifacts: Pass plan artifact from plan-stage to apply-stage
- Config: Add stage.tfvars.json to infrastructure/terraform/environments/
```

The Spec Kit workflow ensures pipeline changes are planned with the same rigor as infrastructure changes.

### Live Demo: Infrastructure Specification

**Step 1: Invoke speckit.specify**
```
@speckit.specify Create a specification for adding a Redis cache to the 
Road Trip Planner infrastructure:
- Purpose: Cache POI search results
- Capacity: 100MB for dev, 1GB for prod
- Connectivity: Same VNet as App Service in prod
- Eviction: LRU policy
- TTL: 24 hours for POI data
```

**Spec Output**:
```markdown
# Specification: Redis Cache Infrastructure

## Overview
Add Azure Cache for Redis to Road Trip Planner for caching POI search results.

## Requirements

### Functional
- FR-1: Cache POI search responses by location hash
- FR-2: Support TTL of 24 hours
- FR-3: LRU eviction when capacity reached

### Non-Functional
- NFR-1: 99.9% availability (SLA)
- NFR-2: <10ms latency for cache hits
- NFR-3: Encrypted at rest and in transit

### Environment Configuration
| Environment | SKU | Capacity | VNet Integration |
|-------------|-----|----------|------------------|
| dev | Basic C0 | 250MB | No |
| prod | Standard C1 | 1GB | Yes |

## Constraints
- Must use private endpoint in production
- No data persistence required (cache only)
- Must integrate with existing App Service

## Success Criteria
- [ ] Cache hit rate > 80% for repeated POI queries
- [ ] P95 latency < 50ms
- [ ] Cost < $100/month for dev, < $300/month for prod
```

**Step 2: Invoke speckit.tasks**
```
@speckit.tasks Generate tasks from the Redis Cache specification
```

**Tasks Output**:
```markdown
# Tasks: Redis Cache Implementation

## Task 1: Create Terraform Module
- File: modules/cache/main.tf
- Effort: 2 hours
- Dependencies: None

## Task 2: Add Module Variables
- File: modules/cache/variables.tf
- Effort: 30 min
- Dependencies: Task 1

## Task 3: Update Environment Configs
- Files: environments/*.tfvars.json
- Effort: 30 min
- Dependencies: Task 2

## Task 4: Integrate with Compute Module
- File: modules/compute/main.tf (add Redis connection string)
- Effort: 1 hour
- Dependencies: Task 1

## Task 5: Add Private Endpoint (prod)
- File: modules/networking/private_endpoints.tf
- Effort: 1 hour
- Dependencies: Tasks 1, 4

## Task 6: Validate and Test
- Run: terraform plan for all environments
- Effort: 1 hour
- Dependencies: All above
```

---

## Topic 6: Copilot Metrics for IaC Productivity (~10 min)

### Concept

Measuring Copilot's impact on IaC development helps justify investment and identify optimization opportunities.

### Key Metrics to Track

| Metric | How to Measure | Target |
|--------|---------------|--------|
| **Acceptance Rate** | Suggestions accepted / shown | >30% |
| **Lines Saved** | Accepted lines / total lines written | >40% |
| **Time to Module** | Hours to complete a module | 50% reduction |
| **Error Reduction** | terraform validate errors | 30% reduction |
| **Review Findings** | Security issues caught | 20% more found |

### GitHub Copilot Metrics Dashboard

Enterprise accounts have access to:
- Suggestion acceptance rates by language
- Active users over time
- Engagement by file type (.tf, .yml, etc.)

### IaC-Specific Metrics

**Module Generation Efficiency**:
```markdown
## Baseline (Before Copilot)
- New module creation: 4 hours
- Variables + outputs: 1 hour
- Documentation: 30 min
- Total: 5.5 hours

## With Copilot
- New module creation: 1.5 hours (62% faster)
- Variables + outputs: 15 min (75% faster)
- Documentation: 10 min (67% faster)
- Total: 1.75 hours (68% reduction)
```

**Quality Metrics**:
```markdown
## terraform validate Errors (per 100 resources)
- Without Copilot: 15 errors
- With Copilot: 8 errors (47% reduction)

## tfsec Security Findings (per module)
- Without Copilot: 3 HIGH, 5 MEDIUM
- With Copilot prompting for security: 1 HIGH, 2 MEDIUM (60% reduction)
```

### Tracking in Practice

**Per-Session Metrics** (self-reported):
```markdown
# Session: Module Development - Key Vault
Date: 2026-01-20
Developer: [Name]

## Copilot Usage
- Suggestions shown: 45
- Suggestions accepted: 28 (62%)
- Lines accepted: 180
- Manual lines: 50
- Copilot contribution: 78%

## Time Tracking
- Estimated without Copilot: 3 hours
- Actual time: 1 hour
- Time saved: 2 hours (67%)

## Quality
- validate errors: 2 (both were missing variable references)
- tfsec findings: 1 MEDIUM (fixed with Copilot suggestion)
```

### ROI Calculation

```markdown
## Copilot ROI for IaC Team (Example)

### Investment
- Copilot Business: $19/user/month
- Team size: 5 developers
- Annual cost: $19 × 5 × 12 = $1,140

### Savings
- Hours saved/week/dev: 8 hours
- Developer cost: $75/hour
- Weekly savings: 8 × $75 × 5 = $3,000
- Annual savings: $3,000 × 50 weeks = $150,000

### ROI
- Net annual benefit: $150,000 - $1,140 = $148,860
- ROI: 13,058%
```

---

## 🔬 Hands-On Exercise: Azure MCP Discovery and Import (15 min)

### Objective

Use Azure MCP tools to discover deployed resources in `aps-demo-rg` and generate Terraform import blocks + resource definitions.

### Prerequisites

- Azure subscription access
- Resources deployed to `aps-demo-rg` (or your target resource group)
- MCP tools enabled in Copilot

### Exercise Steps

#### Step 1: Discover Subscriptions (2 min)

**Prompt to Copilot**:
```
Use the Azure MCP tool to list all subscriptions I have access to.
```

Note the subscription ID for `aps-demo-rg`.

#### Step 2: List Resources in Resource Group (3 min)

**Prompt**:
```
Using Azure MCP, list all resources in resource group "aps-demo-rg" 
(or "rg-roadtrip-dev") and organize them by resource type.

For each resource, include:
- Resource name
- Resource type
- Resource ID
- Key properties (SKU, location, etc.)
```

**Expected Output Format**:
```markdown
## Resources in aps-demo-rg

### Microsoft.Web/serverfarms
- Name: asp-roadtrip-prod
- SKU: P1V3
- OS: Linux
- ID: /subscriptions/.../providers/Microsoft.Web/serverfarms/asp-roadtrip-prod

### Microsoft.Web/sites
- Name: roadtrip-api-hl
- Runtime: Python 3.12
- ID: /subscriptions/.../providers/Microsoft.Web/sites/roadtrip-api-hl

### Microsoft.DBforPostgreSQL/flexibleServers
- Name: psql-roadtrip-prod
- SKU: GP_Standard_D2s_v3
- Version: 16
- ID: /subscriptions/.../providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-roadtrip-prod
```

#### Step 3: Generate Import Blocks (5 min)

**Prompt**:
```
For each resource discovered, generate the terraform import command using 
the correct azurerm resource type and ID format. Also specify which 
Terraform file should contain each resource definition.
```

**Expected Output**:
```bash
# ============================================================================
# Terraform Import Commands for aps-demo-rg
# ============================================================================

# Resource Group → main.tf
terraform import azurerm_resource_group.main \
  /subscriptions/12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/aps-demo-rg

# App Service Plan → modules/compute/main.tf
terraform import azurerm_service_plan.main \
  /subscriptions/12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/aps-demo-rg/providers/Microsoft.Web/serverfarms/asp-roadtrip-prod

# App Service → modules/compute/main.tf
terraform import azurerm_linux_web_app.main \
  /subscriptions/12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/aps-demo-rg/providers/Microsoft.Web/sites/roadtrip-api-hl

# PostgreSQL → modules/database/main.tf
terraform import azurerm_postgresql_flexible_server.main \
  /subscriptions/12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/aps-demo-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-roadtrip-prod
```

#### Step 4: Generate Resource Definitions (5 min)

**Prompt**:
```
Based on the discovered resources and their properties, generate the 
Terraform resource definitions that match the deployed infrastructure.

Use our naming conventions and variable references where appropriate:
- var.project_name = "roadtrip"
- var.environment = "prod"
- local.common_tags for tags

Generate for the App Service Plan and App Service resources.
```

**Expected Output**:
```hcl
# modules/compute/main.tf

resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku  # "P1V3" for prod
  
  tags = local.common_tags
}

resource "azurerm_linux_web_app" "main" {
  name                = "app-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id
  
  https_only = true
  
  identity {
    type = "SystemAssigned"
  }
  
  site_config {
    minimum_tls_version = "1.2"
    
    application_stack {
      python_version = var.python_version  # "3.12"
    }
  }
  
  app_settings = {
    WEBSITE_RUN_FROM_PACKAGE = "1"
    # Additional settings from discovery...
  }
  
  tags = local.common_tags
}
```

### Deliverable

1. List of all resources in target resource group
2. Complete `terraform import` script
3. Generated resource definitions for at least 2 resources
4. Validation that import would succeed

### Verification

After generating import blocks, verify the format:
```bash
# Dry run - check import syntax
terraform plan -generate-config-out=generated.tf
```

---

## 📋 Workshop Summary

### Key Takeaways

1. **MCP servers** - Query live Azure resources for brownfield scenarios
2. **Enterprise policy** - Encode compliance requirements in instruction files
3. **Model selection** - Match model complexity to task requirements
4. **Certifications** - Structured path to demonstrate Copilot proficiency
5. **Spec Kit** - Specification-driven infrastructure development
6. **Metrics** - Quantify productivity gains for ROI justification

### Workshop Series Complete!

You've completed all four workshops:
- ✅ Workshop 01: Foundational Skills
- ✅ Workshop 02: Intermediate Skills
- ✅ Workshop 03: Advanced Skills
- ✅ Workshop 04: Expert Enterprise Topics

### Next Steps

1. **Practice**: Apply techniques to your organization's infrastructure
2. **Customize**: Create instruction files and agents for your team
3. **Measure**: Track productivity metrics before/after Copilot
4. **Certify**: Pursue GitHub Copilot certification
5. **Share**: Train teammates on these techniques

### Resources

| Resource | Location |
|----------|----------|
| Definitions Reference | `docs/workshops/iac/00-copilot-definitions-best-practices.md` |
| All Workshop Files | `docs/workshops/iac/` |
| Custom Agents | `.github/copilot-agents/` |
| Spec Kit Agents | `.github/agents/` |
| Project Roadmap | `ROADMAP.md` |
| Terraform Instructions | `.github/instructions/terraform.instructions.md` |
| CI/CD Instructions | `.github/instructions/cicd.instructions.md` |
| Terraform CI/CD Workflow | `.github/workflows/terraform.yml` |
| Terraform CI Script | `infrastructure/scripts/terraform-ci.sh` |
| Azure DevOps Pipeline | `azure-pipelines.yml` |

### Feedback

We'd love to hear how these workshops helped your IaC development:
- What techniques were most valuable?
- What additional topics would you like covered?
- How has your productivity changed?

---

## 🏆 Certification of Completion

**Workshop Series**: GitHub Copilot for Infrastructure as Code (Azure)

| Workshop | Topics Covered | Duration |
|----------|---------------|----------|
| Foundational | 7 topics + exercise | 1 hour |
| Intermediate | 9 topics + exercise | 1 hour |
| Advanced | 8 topics + exercise | 1 hour |
| Expert | 6 topics + exercise | 1 hour |

**Total Training**: 4 hours of hands-on IaC + Copilot instruction

**Skills Validated**:
- Terraform generation with Copilot
- Azure resource introspection via MCP
- Chain-of-thought prompting for complex modules
- Enterprise policy compliance
- Custom agent development
- Productivity metrics tracking
