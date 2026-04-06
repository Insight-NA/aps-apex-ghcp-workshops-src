# =============================================================================
# Road Trip Planner - Main Terraform Configuration
# =============================================================================
# This file orchestrates all modules and resources for the Road Trip Planner
# Azure infrastructure. It creates the resource group and calls child modules
# for networking, compute, database, security, and monitoring.
#
# Usage:
#   terraform init -backend-config="environments/dev/backend.tfvars"
#   terraform plan -var-file="environments/dev/terraform.tfvars"
#   terraform apply -var-file="environments/dev/terraform.tfvars"
# =============================================================================

# -----------------------------------------------------------------------------
# Data Sources
# -----------------------------------------------------------------------------

# Get current Azure subscription and client information
data "azurerm_subscription" "current" {}

data "azurerm_client_config" "current" {}

# -----------------------------------------------------------------------------
# Random String for Unique Naming
# -----------------------------------------------------------------------------

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# -----------------------------------------------------------------------------
# Local Variables
# -----------------------------------------------------------------------------

locals {
  # Generate unique resource suffix if not provided
  resource_suffix = var.name_suffix != "" ? var.name_suffix : random_string.suffix.result

  # Common naming convention: {resource-type}-{project}-{environment}-{suffix}
  name_prefix = "${var.project_name}-${var.environment}"

  # Merge default tags with provided tags
  common_tags = merge(
    {
      Project            = var.project_name
      Environment        = var.environment
      ManagedBy          = "Terraform"
      CreatedDate        = timestamp()
      TerraformWorkspace = terraform.workspace
      GitRepository      = "hlucianojr1/road_trip_app"
    },
    var.tags
  )

  # Determine if environment requires enhanced security
  is_production = contains(["prod", "stage"], var.environment)

  # Feature flags based on environment
  should_enable_private_endpoints = var.enable_private_endpoints || local.is_production
  should_enable_vnet_integration  = var.enable_vnet_integration || local.is_production
  should_enable_monitoring        = var.enable_monitoring
  should_enable_key_vault         = var.enable_key_vault

  # Database admin username
  database_admin_username = "roadtripadmin"

  # Generate database password if not provided
  database_password = var.database_admin_password != "" ? var.database_admin_password : random_password.database[0].result
}

# -----------------------------------------------------------------------------
# Random Password for Database (if not provided)
# -----------------------------------------------------------------------------

resource "random_password" "database" {
  count = var.database_admin_password == "" ? 1 : 0

  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
  min_lower        = 4
  min_upper        = 4
  min_numeric      = 4
  min_special      = 2
}

# -----------------------------------------------------------------------------
# Resource Group
# -----------------------------------------------------------------------------

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags

  lifecycle {
    # Prevent accidental deletion of the resource group
    prevent_destroy = false
  }
}

# -----------------------------------------------------------------------------
# Module: Networking (Issue #24)
# -----------------------------------------------------------------------------
# Creates VNet, subnets, NSGs, and private DNS zones
# Only enabled for UAT, Stage, and Prod environments

module "networking" {
  source = "./modules/networking"

  count = local.should_enable_vnet_integration ? 1 : 0

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name

  vnet_address_space       = var.vnet_address_space
  subnet_app_service       = var.subnet_app_service
  subnet_database          = var.subnet_database
  subnet_private_endpoints = var.subnet_private_endpoints
  subnet_container_apps    = var.subnet_container_apps

  enable_private_endpoints = local.should_enable_private_endpoints
  enable_container_apps    = var.enable_container_apps

  tags = local.common_tags

  depends_on = [azurerm_resource_group.main]
}

# -----------------------------------------------------------------------------
# Module: Compute (Issue #25)
# -----------------------------------------------------------------------------
# Creates App Service Plan, App Service, and Static Web App

module "compute" {
  source = "./modules/compute"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  resource_suffix     = local.resource_suffix

  app_service_sku    = var.app_service_sku
  app_service_os     = var.app_service_os
  python_version     = var.python_version
  static_web_app_sku = var.static_web_app_sku

  # VNet integration (only if enabled)
  enable_vnet_integration = local.should_enable_vnet_integration
  app_service_subnet_id   = local.should_enable_vnet_integration ? module.networking[0].subnet_app_service_id : null

  # Environment variables for the app
  allowed_origins = var.allowed_origins
  ai_service_url  = var.ai_service_url

  # Staging slot for production environments
  enable_staging_slot = local.is_production

  tags = local.common_tags

  depends_on = [azurerm_resource_group.main]
}

# -----------------------------------------------------------------------------
# Module: Database (Issue #25)
# -----------------------------------------------------------------------------
# Creates PostgreSQL Flexible Server with optional private endpoint

module "database" {
  source = "./modules/database"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  resource_suffix     = local.resource_suffix

  database_sku            = var.database_sku
  database_storage_mb     = var.database_storage_mb
  database_version        = var.database_version
  database_admin_username = local.database_admin_username
  database_admin_password = local.database_password
  backup_retention_days   = var.database_backup_retention_days
  geo_redundant_backup    = var.database_geo_redundant_backup

  # VNet integration (only if enabled)
  enable_private_endpoint = local.should_enable_private_endpoints
  delegated_subnet_id     = local.should_enable_private_endpoints ? module.networking[0].subnet_database_id : null
  private_dns_zone_id     = local.should_enable_private_endpoints ? module.networking[0].private_dns_zone_postgres_id : null

  # Firewall rules (allow Azure services for dev, private only for prod)
  allow_azure_services = !local.should_enable_private_endpoints

  # High availability for production
  enable_high_availability = local.is_production

  tags = local.common_tags

  depends_on = [azurerm_resource_group.main]
}

# -----------------------------------------------------------------------------
# Module: Security (Issue #26)
# -----------------------------------------------------------------------------
# Creates Key Vault with access policies and RBAC

module "security" {
  source = "./modules/security"

  count = local.should_enable_key_vault ? 1 : 0

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  resource_suffix     = local.resource_suffix

  tenant_id = data.azurerm_client_config.current.tenant_id

  # App Service Managed Identity for secret access
  app_service_principal_id  = module.compute.app_service_identity_principal_id
  staging_slot_principal_id = local.is_production ? module.compute.staging_slot_identity_principal_id : null
  deployment_principal_id   = data.azurerm_client_config.current.object_id

  # Private endpoint configuration (only if enabled)
  enable_private_endpoint    = local.should_enable_private_endpoints
  private_endpoint_subnet_id = local.should_enable_private_endpoints ? module.networking[0].subnet_private_endpoints_id : null
  private_dns_zone_id        = local.should_enable_private_endpoints ? module.networking[0].private_dns_zone_keyvault_id : null

  # Log Analytics for diagnostics
  log_analytics_workspace_id = local.should_enable_monitoring ? module.monitoring[0].log_analytics_workspace_id : null

  # Secrets to store
  secrets = {
    "mapbox-token"               = var.mapbox_token
    "google-client-id"           = var.google_client_id
    "jwt-secret-key"             = var.jwt_secret_key
    "gemini-api-key"             = var.gemini_api_key
    "azure-maps-key"             = var.azure_maps_key
    "database-password"          = local.database_password
    "database-connection-string" = "postgresql://${local.database_admin_username}:${local.database_password}@${module.database.server_fqdn}:5432/roadtrip?sslmode=require"
    # Azure OpenAI secrets for C# backend (Container Apps)
    "azure-openai-endpoint"   = var.azure_openai_endpoint
    "azure-openai-api-key"    = var.azure_openai_api_key
    "azure-openai-deployment" = var.azure_openai_deployment
  }

  tags = local.common_tags

  depends_on = [azurerm_resource_group.main, module.compute, module.database, module.monitoring]
}

# -----------------------------------------------------------------------------
# Module: Monitoring (Issue #26)
# -----------------------------------------------------------------------------
# Creates Log Analytics Workspace and Application Insights

module "monitoring" {
  source = "./modules/monitoring"

  count = local.should_enable_monitoring ? 1 : 0

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  resource_suffix     = local.resource_suffix

  # Log Analytics configuration
  log_analytics_sku       = "PerGB2018"
  log_analytics_retention = local.is_production ? 90 : 30

  # Application Insights configuration
  app_insights_type = "web"

  # Resources to monitor
  app_service_id = module.compute.app_service_id
  database_id    = module.database.server_id

  # Enable alerts for production
  enable_alerts = local.is_production

  tags = local.common_tags

  depends_on = [azurerm_resource_group.main, module.compute, module.database]
}

# -----------------------------------------------------------------------------
# Module: Container Apps (Polyglot Microservices)
# -----------------------------------------------------------------------------
# Creates Container Apps Environment and Container Apps for:
# - BFF (Node.js) - External ingress, API gateway
# - C# Backend (ASP.NET) - Internal ingress, AI services
# - Java Backend (Spring Boot) - Internal ingress, geospatial services

module "container_apps" {
  source = "./modules/container-apps"

  count = var.enable_container_apps ? 1 : 0

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  resource_suffix     = local.resource_suffix

  # Log Analytics integration
  log_analytics_workspace_id = local.should_enable_monitoring ? module.monitoring[0].log_analytics_workspace_id : null

  # VNet integration (only if enabled)
  enable_vnet_integration  = local.should_enable_vnet_integration
  container_apps_subnet_id = local.should_enable_vnet_integration ? module.networking[0].subnet_container_apps_id : null

  # Key Vault for RBAC
  key_vault_id = local.should_enable_key_vault ? module.security[0].key_vault_id : null

  # Python backend URL (App Service)
  python_backend_url = module.compute.app_service_default_hostname
  allowed_origins    = var.allowed_origins

  # Container App configurations
  bff_config    = var.bff_config
  csharp_config = var.csharp_config
  java_config   = var.java_config

  # Secrets for container apps
  azure_openai_endpoint   = var.azure_openai_endpoint
  azure_openai_api_key    = var.azure_openai_api_key
  azure_openai_deployment = var.azure_openai_deployment
  mapbox_token            = var.mapbox_token
  azure_maps_key          = var.azure_maps_key

  tags = local.common_tags

  depends_on = [azurerm_resource_group.main, module.compute, module.monitoring]
}

# -----------------------------------------------------------------------------
# Diagnostic Settings for Resource Group
# -----------------------------------------------------------------------------
# Note: Resource groups don't support diagnostic settings directly.
# Only resources within the resource group can have diagnostic settings.
# This has been removed as it causes a 400 Bad Request error.

# resource "azurerm_monitor_diagnostic_setting" "resource_group" {
#   count = local.should_enable_monitoring ? 1 : 0
#
#   name                       = "diag-${local.name_prefix}"
#   target_resource_id         = azurerm_resource_group.main.id
#   log_analytics_workspace_id = module.monitoring[0].log_analytics_workspace_id
#
#   enabled_log {
#     category = "Administrative"
#   }
#
#   enabled_log {
#     category = "Security"
#   }
#
#   enabled_log {
#     category = "Alert"
#   }
# }
