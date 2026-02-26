# Terraform Infrastructure for Road Trip Planner

This directory contains the Terraform configuration for deploying the Road Trip Planner application infrastructure to Azure.

## Architecture Overview

The infrastructure supports 4 environments with different configurations:

| Environment | Resource Group | Private Endpoints | VNet | App Service | Database | SWA |
|-------------|----------------|-------------------|------|-------------|----------|-----|
| **Dev** | `rg-roadtrip-dev` | ❌ No | ❌ No | B1 | B_Standard_B1ms | Free |
| **UAT** | `rg-roadtrip-uat` | ✅ Yes | ✅ Yes (10.1.0.0/16) | P1V3 | GP_Standard_D2s_v3 | Standard |
| **Stage** | `rg-roadtrip-stage` | ✅ Yes | ✅ Yes (10.2.0.0/16) | P1V3 | GP_Standard_D2s_v3 | Standard |
| **Prod** | `rg-roadtrip-prod` | ✅ Yes | ✅ Yes (10.0.0.0/16) | P1V3 | GP_Standard_D2s_v3 | Standard |

## Prerequisites

Before you begin, ensure you have:

1. **Terraform** installed (>= 1.5.0)
   ```bash
   # macOS
   brew install terraform
   
   # Windows
   winget install Hashicorp.Terraform
   
   # Verify installation
   terraform version
   ```

2. **Azure CLI** installed and authenticated
   ```bash
   # Install
   brew install azure-cli  # macOS
   
   # Login
   az login
   
   # Set subscription (optional)
   az account set --subscription "Your Subscription Name"
   ```

3. **Required permissions**:
   - Contributor access to the Azure subscription
   - Ability to create resource groups and storage accounts

## Quick Start

### Step 1: Bootstrap the State Backend

Run the bootstrap script to create the Azure Storage Account for Terraform state:

```bash
cd infrastructure/terraform
chmod +x bootstrap.sh
./bootstrap.sh
```

This creates:
- Resource group: `rg-terraform-state`
- Storage account: `roadtriptfstate`
- Blob container: `tfstate`
- Versioning and soft delete enabled
- Delete lock to prevent accidental deletion

### Step 2: Initialize Terraform

Initialize Terraform with the backend configuration for your target environment:

```bash
# Development
terraform init -backend-config="environments/dev/backend.tfvars"

# UAT
terraform init -backend-config="environments/uat/backend.tfvars"

# Stage
terraform init -backend-config="environments/stage/backend.tfvars"

# Production
terraform init -backend-config="environments/prod/backend.tfvars"
```

### Step 3: Set Required Secrets

Set sensitive values via environment variables (never commit these!):

```bash
export TF_VAR_mapbox_token="pk.xxx..."
export TF_VAR_google_client_id="xxx.apps.googleusercontent.com"
export TF_VAR_jwt_secret_key="your-32-character-minimum-secret-key"
export TF_VAR_gemini_api_key="AIza..."
export TF_VAR_azure_maps_key="xxx..."
export TF_VAR_database_admin_password="YourSecurePassword123!"
```

### Step 4: Plan and Apply

```bash
# Validate configuration
terraform validate

# Preview changes
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply changes
terraform apply -var-file="environments/dev/terraform.tfvars"
```

## Directory Structure

```
terraform/
├── bootstrap.sh              # Creates state storage account
├── versions.tf               # Provider and backend configuration
├── variables.tf              # Input variable definitions
├── main.tf                   # Main configuration and module calls
├── outputs.tf                # Output definitions
├── .terraform.lock.hcl       # Provider lock file
├── environments/
│   ├── dev/
│   │   ├── backend.tfvars    # Dev state backend config
│   │   └── terraform.tfvars  # Dev environment variables
│   ├── uat/
│   │   ├── backend.tfvars    # UAT state backend config
│   │   └── terraform.tfvars  # UAT environment variables
│   ├── stage/
│   │   ├── backend.tfvars    # Stage state backend config
│   │   └── terraform.tfvars  # Stage environment variables
│   └── prod/
│       ├── backend.tfvars    # Prod state backend config
│       └── terraform.tfvars  # Prod environment variables
└── modules/                  # Reusable Terraform modules
    ├── networking/           # VNet, subnets, NSGs (Issue #24)
    ├── compute/              # App Service, SWA (Issue #25)
    ├── database/             # PostgreSQL (Issue #25)
    ├── security/             # Key Vault (Issue #26)
    └── monitoring/           # App Insights, Log Analytics (Issue #26)
```

## Modules

The infrastructure is organized into reusable modules:

### Networking (Issue #24)
- Virtual Network with address space per environment
- Subnets: App Service, Database, Private Endpoints
- Network Security Groups with appropriate rules
- Private DNS Zones for PostgreSQL and Key Vault

### Compute (Issue #25)
- App Service Plan (Linux, Python 3.12)
- App Service with Managed Identity
- Azure Static Web App for frontend
- VNet integration for private environments

### Database (Issue #25)
- PostgreSQL Flexible Server
- Private endpoint for secure access
- Automatic backups with retention
- Firewall rules based on environment

### Security (Issue #26)
- Azure Key Vault for secrets
- RBAC role assignments
- Private endpoint for secure access
- Secrets: API tokens, database credentials

### Monitoring (Issue #26)
- Log Analytics Workspace
- Application Insights
- Diagnostic settings for all resources
- Alert rules for production

## Commands Reference

### Validation
```bash
# Format check
terraform fmt -check -recursive

# Validate configuration
terraform validate

# Show plan without applying
terraform plan -var-file="environments/dev/terraform.tfvars"
```

### Deployment
```bash
# Apply with auto-approve (CI/CD)
terraform apply -var-file="environments/dev/terraform.tfvars" -auto-approve

# Target specific resource
terraform apply -var-file="environments/dev/terraform.tfvars" -target=azurerm_resource_group.main
```

### State Management
```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show azurerm_resource_group.main

# Move resource in state
terraform state mv azurerm_resource_group.main azurerm_resource_group.primary
```

### Destruction
```bash
# Destroy all resources (use with caution!)
terraform destroy -var-file="environments/dev/terraform.tfvars"

# Destroy specific resource
terraform destroy -var-file="environments/dev/terraform.tfvars" -target=azurerm_resource_group.main
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `TF_VAR_mapbox_token` | Mapbox API token | Yes | `pk.eyJ1...` |
| `TF_VAR_google_client_id` | Google OAuth Client ID | No | `xxx.apps.googleusercontent.com` |
| `TF_VAR_jwt_secret_key` | JWT signing key (32+ chars) | Yes | `your-very-long-secret-key-here!` |
| `TF_VAR_gemini_api_key` | Google Gemini API key | No | `AIza...` |
| `TF_VAR_azure_maps_key` | Azure Maps API key | No | `xxx...` |
| `TF_VAR_database_admin_password` | PostgreSQL admin password | No* | `SecurePass123!` |

*If not provided, a random password is generated and stored in Key Vault.

## CI/CD Integration

### GitHub Actions

See `.github/workflows/terraform.yml` for pipeline configuration.

```yaml
- name: Terraform Init
  run: terraform init -backend-config="environments/${{ env.ENVIRONMENT }}/backend.tfvars"

- name: Terraform Plan
  run: terraform plan -var-file="environments/${{ env.ENVIRONMENT }}/terraform.tfvars" -out=tfplan

- name: Terraform Apply
  if: github.ref == 'refs/heads/main'
  run: terraform apply -auto-approve tfplan
```

### Azure DevOps

See `azure-pipelines.yml` for pipeline configuration.

## Troubleshooting

### State Lock Issues
```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Provider Version Conflicts
```bash
# Update provider lock file
terraform init -upgrade
```

### Backend Configuration Issues
```bash
# Reconfigure backend
terraform init -reconfigure -backend-config="environments/dev/backend.tfvars"
```

### Resource Already Exists
```bash
# Import existing resource
terraform import azurerm_resource_group.main /subscriptions/<sub-id>/resourceGroups/<rg-name>
```

## Related Documentation

- [ROADMAP.md](../../ROADMAP.md) - Project roadmap with IaC epic details
- [PROJECT_INSTRUCTIONS.md](../../docs/PROJECT_INSTRUCTIONS.md) - Project development guidelines
- [Azure Deployment Guide](../azure/README.md) - Azure-specific deployment details

## Support

For issues with this Terraform configuration:
1. Check the [GitHub Issues](https://github.com/hlucianojr1/road_trip_app/issues) for existing solutions
2. Reference the [ROADMAP.md](../../ROADMAP.md) for planned improvements
3. Contact the DevOps team for Azure-specific questions
