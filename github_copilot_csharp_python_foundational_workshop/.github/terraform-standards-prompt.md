# Terraform Standards Update - Context Prompt

## Objective
Update `.github/copilot-instructions.md` to include Terraform development best practices with JSON-driven configuration requirements.

## What Was Done

### 1. Research Phase
- Analyzed `infrastructure/terraform/` structure (5 modules: networking, compute, database, security, monitoring)
- Found dual configuration format: JSON tfvars in root `environments/` folder, HCL in environment subfolders
- Identified patterns from `ROADMAP.md` Milestone 0 (Issues #23-28): Azure IaC Foundation
- Confirmed JSON-driven pattern already in use: `dev.tfvars.json`, `uat.tfvars.json`, `stage.tfvars.json`, `prod.tfvars.json`

### 2. Implementation
Added three sections to `.github/copilot-instructions.md`:

**A. Terraform subsection in Code Standards** (after Python, ~line 65):
- JSON-driven configuration requirement (`*.tfvars.json` NOT HCL `.tfvars`)
- Module-first architecture (extend `infrastructure/terraform/modules/`)
- Required module files: `main.tf`, `variables.tf`, `outputs.tf`
- Variable validation with `description` and `validation` blocks
- Secrets via `TF_VAR_*` environment variables only
- Conditional resources using `count` parameter
- References to `environments/dev.tfvars.json` and `terraform/README.md`

**B. Terraform Infrastructure subsection in Development Workflows** (~line 150):
```bash
cd infrastructure/terraform
terraform init -backend-config=environments/dev/backend.tfvars
terraform plan -var-file=environments/dev.tfvars.json -out=dev.tfplan
terraform apply dev.tfplan
```
- Environment config locations
- State isolation per environment
- Secrets handling reminder

**C. Common Pitfalls additions** (#9 and #10):
- Never use HCL tfvars for environments (breaks CI/CD)
- Never hardcode secrets in tfvars files

## Key Project Patterns Documented

### JSON Configuration Schema (from `environments/dev.tfvars.json`)
```json
{
  "environment": "dev",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-dev",
  "enable_private_endpoints": false,
  "enable_vnet_integration": false,
  "tags": { "Environment": "Development", "ManagedBy": "Terraform" }
}
```

### Module Structure
- 5 production modules + 1 testing module
- Conditional deployment via `count`
- Cross-module dependencies via outputs only

### Environment Tiers
- **Dev**: Public endpoints, B1/Free SKUs, no VNet
- **UAT/Stage/Prod**: Private endpoints, P1V3/Standard SKUs, VNet integration

## Files Modified
- `.github/copilot-instructions.md` (3 additions, ~40 lines total)

## Next Steps (if needed)
- None - implementation complete and aligned with existing Terraform setup
- All standards documented match patterns already in `infrastructure/terraform/`

## Related Documentation
- `infrastructure/terraform/README.md` - Full Terraform guide (293 lines)
- `ROADMAP.md` - Milestone 0 (Issues #23-28)
- `infrastructure/terraform/environments/dev.tfvars.json` - Canonical JSON config pattern
