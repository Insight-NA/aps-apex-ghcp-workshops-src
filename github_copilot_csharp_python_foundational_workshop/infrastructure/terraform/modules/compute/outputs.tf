# =============================================================================
# Compute Module Outputs
# =============================================================================

# -----------------------------------------------------------------------------
# App Service Plan
# -----------------------------------------------------------------------------

output "app_service_plan_id" {
  description = "App Service Plan ID"
  value       = azurerm_service_plan.main.id
}

output "app_service_plan_name" {
  description = "App Service Plan name"
  value       = azurerm_service_plan.main.name
}

# -----------------------------------------------------------------------------
# App Service (Backend)
# -----------------------------------------------------------------------------

output "app_service_id" {
  description = "App Service ID"
  value       = azurerm_linux_web_app.backend.id
}

output "app_service_name" {
  description = "App Service name"
  value       = azurerm_linux_web_app.backend.name
}

output "app_service_url" {
  description = "App Service default URL"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "app_service_default_hostname" {
  description = "App Service default hostname"
  value       = azurerm_linux_web_app.backend.default_hostname
}

output "app_service_identity_principal_id" {
  description = "App Service Managed Identity Principal ID"
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
}

output "app_service_identity_tenant_id" {
  description = "App Service Managed Identity Tenant ID"
  value       = azurerm_linux_web_app.backend.identity[0].tenant_id
}

output "app_service_outbound_ip_addresses" {
  description = "App Service outbound IP addresses"
  value       = azurerm_linux_web_app.backend.outbound_ip_addresses
}

# -----------------------------------------------------------------------------
# Static Web App (Frontend)
# -----------------------------------------------------------------------------

output "static_web_app_id" {
  description = "Static Web App ID"
  value       = azurerm_static_web_app.frontend.id
}

output "static_web_app_name" {
  description = "Static Web App name"
  value       = azurerm_static_web_app.frontend.name
}

output "static_web_app_url" {
  description = "Static Web App default URL"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "static_web_app_default_hostname" {
  description = "Static Web App default hostname"
  value       = azurerm_static_web_app.frontend.default_host_name
}

output "static_web_app_api_key" {
  description = "Static Web App deployment API key"
  value       = azurerm_static_web_app.frontend.api_key
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Staging Slot
# -----------------------------------------------------------------------------

output "staging_slot_id" {
  description = "Staging slot ID (if enabled)"
  value       = length(azurerm_linux_web_app_slot.staging) > 0 ? azurerm_linux_web_app_slot.staging[0].id : null
}

output "staging_slot_url" {
  description = "Staging slot URL (if enabled)"
  value       = length(azurerm_linux_web_app_slot.staging) > 0 ? "https://${azurerm_linux_web_app_slot.staging[0].default_hostname}" : null
}

output "staging_slot_identity_principal_id" {
  description = "Staging slot Managed Identity Principal ID (if enabled)"
  value       = length(azurerm_linux_web_app_slot.staging) > 0 ? azurerm_linux_web_app_slot.staging[0].identity[0].principal_id : null
}
