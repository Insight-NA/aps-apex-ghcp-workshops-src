# Plan: Azure IaC Roadmap Update with Terraform Multi-Environment Deployment

Update [ROADMAP.md](ROADMAP.md) to add a new **Azure Infrastructure IaC Epic** as the highest priority milestone targeting February 28, 2026, using Terraform with JSON configuration files, separate resource groups per environment, and tiered networking (public Dev, private UAT/Stage/Prod).

---

## Steps

### Step 1: Restructure ROADMAP.md Milestones
Replace outdated Dec 2025/Jan 2026 milestones with new timeline:
- **Milestone 0: Azure IaC Foundation** (Feb 28, 2026) - Critical priority
- Shift existing milestones to March+ 2026

### Step 2: Create Terraform Module Structure
Create modular Terraform in [infrastructure/terraform/](infrastructure/terraform/):

```
infrastructure/terraform/
├── main.tf                    # Root orchestrator
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── versions.tf                # Provider versions & backend
├── modules/
│   ├── networking/            # VNet, subnets, NSGs, Private DNS, Private Endpoints
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/               # App Service Plan, App Service, Container Apps
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/              # PostgreSQL Flexible Server + optional private endpoint
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security/              # Key Vault, Managed Identity, RBAC
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── monitoring/            # Application Insights, Log Analytics
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── frontend/              # Static Web App
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── dev.tfvars.json
    ├── uat.tfvars.json
    ├── stage.tfvars.json
    └── prod.tfvars.json
```

### Step 3: Implement JSON Environment Configurations
Create `environments/{env}.tfvars.json` with tiered settings:

**dev.tfvars.json** (Public, Lower SKUs):
```json
{
  "environment": "dev",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-dev",
  "enable_private_endpoints": false,
  "enable_vnet_integration": false,
  "app_service_sku": "B1",
  "database_sku": "B_Standard_B1ms",
  "database_storage_mb": 32768,
  "static_web_app_sku": "Free",
  "tags": {
    "Environment": "Development",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform"
  }
}
```

**uat.tfvars.json / stage.tfvars.json / prod.tfvars.json** (Private, Premium SKUs):
```json
{
  "environment": "prod",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-prod",
  "enable_private_endpoints": true,
  "enable_vnet_integration": true,
  "app_service_sku": "P1V3",
  "database_sku": "GP_Standard_D2s_v3",
  "database_storage_mb": 131072,
  "static_web_app_sku": "Standard",
  "vnet_address_space": ["10.0.0.0/16"],
  "subnet_app_service": "10.0.1.0/24",
  "subnet_database": "10.0.2.0/24",
  "subnet_private_endpoints": "10.0.3.0/24",
  "tags": {
    "Environment": "Production",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform",
    "Criticality": "High"
  }
}
```

### Step 4: Build CI/CD Pipeline Stages
Update [azure-pipelines.yml](azure-pipelines.yml) with Terraform stages:

```yaml
stages:
  - stage: TerraformPlan_Dev
    jobs:
      - job: Plan
        steps:
          - task: TerraformTaskV4@4
            inputs:
              command: 'plan'
              workingDirectory: 'infrastructure/terraform'
              commandOptions: '-var-file=environments/dev.tfvars.json -out=dev.tfplan'

  - stage: TerraformApply_Dev
    dependsOn: TerraformPlan_Dev
    jobs:
      - job: Apply
        steps:
          - task: TerraformTaskV4@4
            inputs:
              command: 'apply'
              workingDirectory: 'infrastructure/terraform'
              commandOptions: 'dev.tfplan'

  # Repeat for UAT, Stage, Prod with environment-specific var files
```

### Step 5: Define Epic with Features and Tasks in Roadmap

---

## Epic: Azure Infrastructure as Code (IaC)

**Target**: February 28, 2026  
**Priority**: Critical  
**Total Effort**: 60-80 hours  
**Dependencies**: None (parallel track)

### Feature 1: Terraform Foundation & State Management
**Estimate**: 8-12 hours

| Task | Description | Estimate |
|------|-------------|----------|
| 1.1 | Create Azure Storage Account for Terraform state backend with containers per environment | 2h |
| 1.2 | Configure `versions.tf` with azurerm provider ~>3.85 and backend configuration | 2h |
| 1.3 | Create root `main.tf`, `variables.tf`, `outputs.tf` with module orchestration | 4-6h |
| 1.4 | Document Terraform usage in `infrastructure/terraform/README.md` | 2h |

### Feature 2: Core Networking Module
**Estimate**: 12-16 hours

| Task | Description | Estimate |
|------|-------------|----------|
| 2.1 | Create `modules/networking/` with VNet and subnet resources (conditional on `enable_vnet_integration`) | 4h |
| 2.2 | Add NSG rules for App Service, Database, and Private Endpoint subnets | 3h |
| 2.3 | Implement Private DNS Zones for PostgreSQL and Key Vault (conditional on `enable_private_endpoints`) | 3h |
| 2.4 | Create Private Endpoints for database and key vault with DNS zone linking | 4-6h |

### Feature 3: Compute & Database Modules
**Estimate**: 12-16 hours

| Task | Description | Estimate |
|------|-------------|----------|
| 3.1 | Create `modules/compute/` with App Service Plan and App Service (Linux, Python 3.12) | 4h |
| 3.2 | Add VNet integration for App Service (conditional on environment) | 2h |
| 3.3 | Create `modules/database/` with PostgreSQL Flexible Server and firewall rules | 4-6h |
| 3.4 | Create `modules/frontend/` with Azure Static Web App resource | 2-4h |

### Feature 4: Security & Monitoring Modules
**Estimate**: 10-14 hours

| Task | Description | Estimate |
|------|-------------|----------|
| 4.1 | Create `modules/security/` with Key Vault and access policies | 4h |
| 4.2 | Add Managed Identity for App Service with Key Vault RBAC | 3h |
| 4.3 | Create `modules/monitoring/` with Log Analytics Workspace | 2h |
| 4.4 | Add Application Insights connected to Log Analytics | 2-4h |

### Feature 5: Environment Configurations
**Estimate**: 8-10 hours

| Task | Description | Estimate |
|------|-------------|----------|
| 5.1 | Create `environments/dev.tfvars.json` with public networking, B1 SKUs | 2h |
| 5.2 | Create `environments/uat.tfvars.json` with private networking, Standard SKUs | 2h |
| 5.3 | Create `environments/stage.tfvars.json` with private networking, Standard SKUs | 2h |
| 5.4 | Create `environments/prod.tfvars.json` with private networking, Premium SKUs | 2h |

### Feature 6: CI/CD Pipeline Integration
**Estimate**: 10-12 hours

| Task | Description | Estimate |
|------|-------------|----------|
| 6.1 | Create Azure DevOps Service Connection with Contributor RBAC | 2h |
| 6.2 | Update `azure-pipelines.yml` with Terraform init/plan/apply stages per environment | 4-6h |
| 6.3 | Add pipeline variables for backend configuration and secrets | 2h |
| 6.4 | Test full deployment to Dev environment | 2-4h |

---

## Updated Milestone Timeline

| Milestone | Due Date | Total Hours | Issues | Priority |
|-----------|----------|-------------|--------|----------|
| **Milestone 0: Azure IaC Foundation** | Feb 28, 2026 | 60-80 | 6 Features, 20 Tasks | 🔴 Critical |
| Milestone 1: Production Ready (App) | Mar 15, 2026 | 29-36 | 5 | High |
| Milestone 2: Pre-Launch Quality | Mar 31, 2026 | 36-48 | 5 | High |
| Milestone 3: Post-Launch Enhancement | Apr 30, 2026 | 50-72 | 7 | Medium |
| Milestone 4: Future Improvements | May 31, 2026 | 23-31 | 5 | Low |

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "Dev Environment (Public)"
        DEV_RG[rg-roadtrip-dev]
        DEV_APP[App Service B1<br/>Public Access]
        DEV_DB[(PostgreSQL B1ms<br/>Public Access)]
        DEV_KV[Key Vault<br/>Public Access]
    end

    subgraph "UAT/Stage/Prod Environments (Private)"
        PROD_RG[rg-roadtrip-{env}]
        
        subgraph "VNet 10.0.0.0/16"
            SUBNET_APP[App Subnet<br/>10.0.1.0/24]
            SUBNET_DB[DB Subnet<br/>10.0.2.0/24]
            SUBNET_PE[Private Endpoints<br/>10.0.3.0/24]
        end
        
        PROD_APP[App Service P1V3<br/>VNet Integrated]
        PROD_DB[(PostgreSQL GP_D2s<br/>Private Endpoint)]
        PROD_KV[Key Vault<br/>Private Endpoint]
        
        PROD_APP --> SUBNET_APP
        SUBNET_PE --> PROD_DB
        SUBNET_PE --> PROD_KV
    end

    subgraph "Terraform State"
        STATE[Azure Storage Account<br/>tfstate containers]
    end

    subgraph "CI/CD"
        PIPELINE[Azure DevOps Pipeline]
        PIPELINE -->|terraform apply| DEV_RG
        PIPELINE -->|terraform apply| PROD_RG
    end
```

---

## Acceptance Criteria

### Epic-Level Acceptance Criteria
- [ ] All 4 environments (dev, uat, stage, prod) deployable via `terraform apply -var-file=environments/{env}.tfvars.json`
- [ ] Dev environment deploys with public endpoints and B1/Free SKUs
- [ ] UAT/Stage/Prod environments deploy with VNet, private endpoints, and Premium SKUs
- [ ] Terraform state stored in Azure Storage with per-environment isolation
- [ ] Azure DevOps pipeline successfully deploys to Dev environment
- [ ] All secrets stored in Key Vault (no hardcoded values)
- [ ] Infrastructure documented in `infrastructure/terraform/README.md`

### Per-Environment Verification
| Environment | Private Endpoints | VNet Integration | App Service SKU | Database SKU |
|-------------|-------------------|------------------|-----------------|--------------|
| Dev | ❌ No | ❌ No | B1 | B_Standard_B1ms |
| UAT | ✅ Yes | ✅ Yes | P1V3 | GP_Standard_D2s_v3 |
| Stage | ✅ Yes | ✅ Yes | P1V3 | GP_Standard_D2s_v3 |
| Prod | ✅ Yes | ✅ Yes | P1V3 | GP_Standard_D2s_v3 |

---

## Open Questions (Resolved)

1. ✅ **IaC Tool**: Terraform (user preference over Bicep)
2. ✅ **Resource Groups**: Separate per environment (`rg-roadtrip-{env}`)
3. ✅ **Approval Gates**: Deferred to future version

## Remaining Decisions

1. **Terraform State Backend** - Use Azure Storage Account with container per environment (`tfstate-dev`, `tfstate-uat`, etc.) with state locking via blob lease. Create manually first or bootstrap via script?

2. **Existing Resources Migration** - Current production uses resources created by [deploy-azure.sh](deploy-azure.sh) (`roadtrip-api-hl`, `roadtrip-db-hl`). Options:
   - A) `terraform import` existing resources into state
   - B) Create fresh resources with new naming convention (`roadtrip-api-prod`, `roadtrip-db-prod`)
   - C) Keep existing prod as-is, only use Terraform for new environments
