# =============================================================================
# Terraform Outputs for Road Trip Planner Infrastructure
# =============================================================================
# This file defines all outputs from the Terraform configuration.
# These values can be used for:
# - CI/CD pipeline configuration
# - Application deployment scripts
# - Documentation and reference
# =============================================================================

# -----------------------------------------------------------------------------
# Subscription and Client Information
# -----------------------------------------------------------------------------

output "subscription_id" {
  description = "Azure Subscription ID"
  value       = data.azurerm_subscription.current.subscription_id
}

output "tenant_id" {
  description = "Azure AD Tenant ID"
  value       = data.azurerm_client_config.current.tenant_id
}

# -----------------------------------------------------------------------------
# Resource Group Information
# -----------------------------------------------------------------------------

output "resource_group_id" {
  description = "Resource Group ID"
  value       = azurerm_resource_group.main.id
}

output "resource_group_name" {
  description = "Resource Group name"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Resource Group location"
  value       = azurerm_resource_group.main.location
}

# -----------------------------------------------------------------------------
# Environment Information
# -----------------------------------------------------------------------------

output "environment" {
  description = "Environment name (dev, uat, stage, prod)"
  value       = var.environment
}

output "resource_suffix" {
  description = "Unique resource suffix used for naming"
  value       = local.resource_suffix
}

output "is_production_environment" {
  description = "Whether this is a production-like environment (prod or stage)"
  value       = local.is_production
}

# -----------------------------------------------------------------------------
# Networking Outputs (Issue #24)
# -----------------------------------------------------------------------------

output "vnet_id" {
  description = "Virtual Network ID (null if VNet not enabled)"
  value       = local.should_enable_vnet_integration ? module.networking[0].vnet_id : null
}

output "vnet_name" {
  description = "Virtual Network name (null if VNet not enabled)"
  value       = local.should_enable_vnet_integration ? module.networking[0].vnet_name : null
}

output "subnet_app_service_id" {
  description = "App Service subnet ID"
  value       = local.should_enable_vnet_integration ? module.networking[0].subnet_app_service_id : null
}

output "subnet_database_id" {
  description = "Database subnet ID"
  value       = local.should_enable_vnet_integration ? module.networking[0].subnet_database_id : null
}

output "subnet_private_endpoints_id" {
  description = "Private Endpoints subnet ID"
  value       = local.should_enable_vnet_integration ? module.networking[0].subnet_private_endpoints_id : null
}

# -----------------------------------------------------------------------------
# Compute Outputs (Issue #25)
# -----------------------------------------------------------------------------

output "app_service_id" {
  description = "App Service ID"
  value       = module.compute.app_service_id
}

output "app_service_name" {
  description = "App Service name"
  value       = module.compute.app_service_name
}

output "app_service_url" {
  description = "App Service default URL (https://...azurewebsites.net)"
  value       = module.compute.app_service_url
}

output "app_service_identity_principal_id" {
  description = "App Service Managed Identity Principal ID"
  value       = module.compute.app_service_identity_principal_id
}

output "static_web_app_id" {
  description = "Static Web App ID"
  value       = module.compute.static_web_app_id
}

output "static_web_app_name" {
  description = "Static Web App name"
  value       = module.compute.static_web_app_name
}

output "static_web_app_url" {
  description = "Static Web App default URL (https://...azurestaticapps.net)"
  value       = module.compute.static_web_app_url
}

output "static_web_app_api_key" {
  description = "Static Web App deployment API key"
  value       = module.compute.static_web_app_api_key
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Database Outputs (Issue #25)
# -----------------------------------------------------------------------------

output "database_server_id" {
  description = "PostgreSQL Flexible Server ID"
  value       = module.database.server_id
}

output "database_server_name" {
  description = "PostgreSQL Flexible Server name"
  value       = module.database.server_name
}

output "database_fqdn" {
  description = "PostgreSQL Flexible Server FQDN"
  value       = module.database.server_fqdn
}

output "database_name" {
  description = "Default database name"
  value       = module.database.database_name
}

output "database_admin_username" {
  description = "Database administrator username"
  value       = module.database.administrator_login
}

output "database_connection_string" {
  description = "PostgreSQL connection string (without password)"
  value       = module.database.connection_string
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Security Outputs (Issue #26)
# -----------------------------------------------------------------------------

output "key_vault_id" {
  description = "Key Vault ID"
  value       = local.should_enable_key_vault ? module.security[0].key_vault_id : null
}

output "key_vault_name" {
  description = "Key Vault name"
  value       = local.should_enable_key_vault ? module.security[0].key_vault_name : null
}

output "key_vault_uri" {
  description = "Key Vault URI (https://...vault.azure.net/)"
  value       = local.should_enable_key_vault ? module.security[0].key_vault_uri : null
}

# -----------------------------------------------------------------------------
# Monitoring Outputs (Issue #26)
# -----------------------------------------------------------------------------

output "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID"
  value       = local.should_enable_monitoring ? module.monitoring[0].log_analytics_workspace_id : null
}

output "log_analytics_workspace_name" {
  description = "Log Analytics Workspace name"
  value       = local.should_enable_monitoring ? module.monitoring[0].log_analytics_workspace_name : null
}

output "application_insights_id" {
  description = "Application Insights ID"
  value       = local.should_enable_monitoring ? module.monitoring[0].app_insights_id : null
}

output "application_insights_name" {
  description = "Application Insights name"
  value       = local.should_enable_monitoring ? module.monitoring[0].app_insights_name : null
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = local.should_enable_monitoring ? module.monitoring[0].app_insights_connection_string : null
  sensitive   = true
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key (deprecated, use connection string)"
  value       = local.should_enable_monitoring ? module.monitoring[0].app_insights_instrumentation_key : null
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Feature Flags
# -----------------------------------------------------------------------------

output "features" {
  description = "Feature flags for this environment"
  value = {
    private_endpoints_enabled = local.should_enable_private_endpoints
    vnet_integration_enabled  = local.should_enable_vnet_integration
    monitoring_enabled        = local.should_enable_monitoring
    key_vault_enabled         = local.should_enable_key_vault
  }
}

# -----------------------------------------------------------------------------
# Azure Portal Links
# -----------------------------------------------------------------------------

output "azure_portal_resource_group_url" {
  description = "Azure Portal link to the resource group"
  value       = "https://portal.azure.com/#@/resource${azurerm_resource_group.main.id}"
}

output "azure_portal_subscription_url" {
  description = "Azure Portal link to the subscription"
  value       = "https://portal.azure.com/#@/resource/subscriptions/${data.azurerm_subscription.current.subscription_id}"
}

# -----------------------------------------------------------------------------
# Deployment Summary
# -----------------------------------------------------------------------------

output "deployment_summary" {
  description = "Summary of deployed resources and configuration"
  value = {
    environment        = var.environment
    location           = var.location
    resource_group     = azurerm_resource_group.main.name
    is_production      = local.is_production
    private_endpoints  = local.should_enable_private_endpoints
    vnet_integration   = local.should_enable_vnet_integration
    app_service_sku    = var.app_service_sku
    database_sku       = var.database_sku
    static_web_app_sku = var.static_web_app_sku
    deployed_at        = timestamp()
  }
}
