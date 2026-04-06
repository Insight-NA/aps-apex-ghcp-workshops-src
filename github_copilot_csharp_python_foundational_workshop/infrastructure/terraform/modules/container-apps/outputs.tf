# =============================================================================
# Container Apps Module Outputs
# =============================================================================

# -----------------------------------------------------------------------------
# Container Apps Environment
# -----------------------------------------------------------------------------

output "environment_id" {
  description = "Container Apps Environment ID"
  value       = azurerm_container_app_environment.main.id
}

output "environment_name" {
  description = "Container Apps Environment name"
  value       = azurerm_container_app_environment.main.name
}

output "environment_default_domain" {
  description = "Default domain for the Container Apps Environment"
  value       = azurerm_container_app_environment.main.default_domain
}

# -----------------------------------------------------------------------------
# BFF Container App
# -----------------------------------------------------------------------------

output "bff_id" {
  description = "BFF Container App ID"
  value       = azurerm_container_app.bff.id
}

output "bff_name" {
  description = "BFF Container App name"
  value       = azurerm_container_app.bff.name
}

output "bff_fqdn" {
  description = "BFF Container App FQDN (public-facing)"
  value       = azurerm_container_app.bff.ingress[0].fqdn
}

output "bff_url" {
  description = "BFF Container App full URL"
  value       = "https://${azurerm_container_app.bff.ingress[0].fqdn}"
}

output "bff_identity_principal_id" {
  description = "BFF Managed Identity principal ID"
  value       = azurerm_container_app.bff.identity[0].principal_id
}

# -----------------------------------------------------------------------------
# C# Backend Container App
# -----------------------------------------------------------------------------

output "csharp_backend_id" {
  description = "C# Backend Container App ID"
  value       = azurerm_container_app.csharp_backend.id
}

output "csharp_backend_name" {
  description = "C# Backend Container App name"
  value       = azurerm_container_app.csharp_backend.name
}

output "csharp_backend_fqdn" {
  description = "C# Backend Container App FQDN (internal)"
  value       = azurerm_container_app.csharp_backend.ingress[0].fqdn
}

output "csharp_backend_url" {
  description = "C# Backend Container App full URL (internal)"
  value       = "https://${azurerm_container_app.csharp_backend.ingress[0].fqdn}"
}

output "csharp_backend_identity_principal_id" {
  description = "C# Backend Managed Identity principal ID"
  value       = azurerm_container_app.csharp_backend.identity[0].principal_id
}

# -----------------------------------------------------------------------------
# Java Backend Container App
# -----------------------------------------------------------------------------

output "java_backend_id" {
  description = "Java Backend Container App ID"
  value       = azurerm_container_app.java_backend.id
}

output "java_backend_name" {
  description = "Java Backend Container App name"
  value       = azurerm_container_app.java_backend.name
}

output "java_backend_fqdn" {
  description = "Java Backend Container App FQDN (internal)"
  value       = azurerm_container_app.java_backend.ingress[0].fqdn
}

output "java_backend_url" {
  description = "Java Backend Container App full URL (internal)"
  value       = "https://${azurerm_container_app.java_backend.ingress[0].fqdn}"
}

output "java_backend_identity_principal_id" {
  description = "Java Backend Managed Identity principal ID"
  value       = azurerm_container_app.java_backend.identity[0].principal_id
}

# -----------------------------------------------------------------------------
# All Container Apps Principal IDs (for RBAC)
# -----------------------------------------------------------------------------

output "all_principal_ids" {
  description = "Map of all Container App principal IDs for RBAC assignments"
  value = {
    bff            = azurerm_container_app.bff.identity[0].principal_id
    csharp_backend = azurerm_container_app.csharp_backend.identity[0].principal_id
    java_backend   = azurerm_container_app.java_backend.identity[0].principal_id
  }
}
