# =============================================================================
# Security Module Outputs
# =============================================================================

output "key_vault_id" {
  description = "Key Vault ID"
  value       = azurerm_key_vault.main.id
}

output "key_vault_name" {
  description = "Key Vault name"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
}

output "key_vault_resource_id" {
  description = "Key Vault Resource ID for Key Vault references in App Service"
  value       = azurerm_key_vault.main.id
}

# Secret URIs for App Service Key Vault references
output "secret_uris" {
  description = "Map of secret names to their Key Vault URIs"
  value = {
    for name, secret in azurerm_key_vault_secret.secrets :
    name => secret.id
  }
  sensitive = true
}

# Versioned secret URIs (latest version)
output "secret_version_uris" {
  description = "Map of secret names to their versioned Key Vault URIs"
  value = {
    for name, secret in azurerm_key_vault_secret.secrets :
    name => secret.versionless_id
  }
  sensitive = true
}

output "private_endpoint_ip" {
  description = "Private endpoint IP address (if enabled)"
  value       = var.enable_private_endpoint && length(azurerm_private_endpoint.keyvault) > 0 ? azurerm_private_endpoint.keyvault[0].private_service_connection[0].private_ip_address : null
}
