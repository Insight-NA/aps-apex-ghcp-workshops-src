---
applyTo: "infrastructure/**/*.{tf,tfvars,json},infrastructure/**/*.tfvars.json"
---
# Terraform / Infrastructure as Code Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these Terraform-specific rules.

## Format (Non-Negotiable)
- **Environment configs**: `*.tfvars.json` ONLY — never HCL `.tfvars` files (CI/CD requires JSON)
- **Module-first**: All resources go inside modules in `infrastructure/terraform/modules/` — never inline resources in root `main.tf`
- **Every module must have**: `main.tf`, `variables.tf`, `outputs.tf`

## Variable Standards
```hcl
# ✅ CORRECT — every variable needs description and validation
variable "environment" {
  description = "Deployment environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}
```
- All enum-like variables **must** have `validation` blocks
- All variables **must** have `description` fields

## Secrets Management
```bash
# ✅ CORRECT — via environment variables
export TF_VAR_db_password="$(az keyvault secret show --name db-password --query value -o tsv)"
terraform apply

# ❌ WRONG — never commit secrets
# dev.tfvars.json:  { "db_password": "my-secret-123" }
```
- Use `TF_VAR_*` environment variables for all secrets
- Never commit passwords, API keys, or connection strings to any `.tfvars.json`
- Reference Azure Key Vault secrets at deploy time via the shell scripts

## Conditional Resources
```hcl
# Use count for optional resources (e.g., VNet only in prod)
resource "azurerm_virtual_network" "main" {
  count = var.enable_vnet ? 1 : 0
  ...
}
```

## File Structure Reference
```
infrastructure/terraform/
  main.tf            # Root — calls modules only
  variables.tf       # Root input variables
  outputs.tf         # Root outputs
  providers.tf       # Provider declarations
  modules/
    app_service/     # main.tf + variables.tf + outputs.tf
    database/
    networking/
    key_vault/
  environments/
    dev.tfvars.json  # Canonical pattern — reference this
    staging.tfvars.json
    prod.tfvars.json
```

## Naming Convention
```hcl
# Pattern: {project}-{resource}-{environment}
resource "azurerm_app_service" "main" {
  name = "${var.project_name}-api-${var.environment}"
}
```

## State Management
- Remote state in Azure Blob Storage — never local `terraform.tfstate`
- Use `azurerm` backend:
  ```hcl
  terraform {
    backend "azurerm" {
      resource_group_name  = "rg-tfstate"
      storage_account_name = "sttfstateroadtrip"
      container_name       = "tfstate"
      key                  = "roadtrip.tfstate"
    }
  }
  ```

## Full Documentation
See [infrastructure/terraform/README.md](../../infrastructure/terraform/README.md) for the complete guide.
