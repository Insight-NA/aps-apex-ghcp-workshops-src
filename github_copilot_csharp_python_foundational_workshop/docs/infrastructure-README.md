# Infrastructure

This folder contains deployment scripts, CI/CD configuration, and Infrastructure as Code (IaC) for the Road Trip Planner project.

## Directory Structure

```
infrastructure/
├── README.md                 # This file
├── deploy-azure.sh           # Azure CLI deployment script (legacy)
├── deploy-config.sh          # Deployment configuration template
├── run-deployment.sh         # Local wrapper that sources .env
├── terraform/                # Terraform IaC (recommended)
│   ├── bootstrap.sh          # Creates state storage account
│   ├── versions.tf           # Provider configuration
│   ├── variables.tf          # Input variables
│   ├── main.tf               # Main configuration
│   ├── outputs.tf            # Output definitions
│   ├── README.md             # Terraform documentation
│   └── environments/         # Environment-specific configs
│       ├── dev/
│       ├── uat/
│       ├── stage/
│       └── prod/
├── azure/                    # Azure-specific resources
└── aws/                      # AWS resources (if applicable)
```

## Deployment Methods

### Terraform (Recommended)

Terraform provides Infrastructure as Code with state management, drift detection, and repeatable deployments.

```bash
cd terraform
./bootstrap.sh                                              # One-time setup
terraform init -backend-config="environments/dev/backend.tfvars"
terraform plan -var-file="environments/dev/terraform.tfvars"
terraform apply -var-file="environments/dev/terraform.tfvars"
```

See [terraform/README.md](terraform/README.md) for complete documentation.

### Azure CLI (Legacy)

For quick deployments or when Terraform is not available:

```bash
./run-deployment.sh    # Sources .env and runs deploy-azure.sh
```

## Security Notes

- Do not commit secrets into version control
- Use `.env` locally and Azure Key Vault in production
- Set sensitive values via environment variables: `TF_VAR_*`

