# =============================================================================
# Networking Module Outputs
# =============================================================================

output "vnet_id" {
  description = "Virtual Network ID"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Virtual Network name"
  value       = azurerm_virtual_network.main.name
}

output "subnet_app_service_id" {
  description = "App Service subnet ID"
  value       = azurerm_subnet.app_service.id
}

output "subnet_app_service_name" {
  description = "App Service subnet name"
  value       = azurerm_subnet.app_service.name
}

output "subnet_database_id" {
  description = "Database subnet ID"
  value       = azurerm_subnet.database.id
}

output "subnet_database_name" {
  description = "Database subnet name"
  value       = azurerm_subnet.database.name
}

output "subnet_private_endpoints_id" {
  description = "Private Endpoints subnet ID"
  value       = azurerm_subnet.private_endpoints.id
}

output "subnet_private_endpoints_name" {
  description = "Private Endpoints subnet name"
  value       = azurerm_subnet.private_endpoints.name
}

output "nsg_app_service_id" {
  description = "App Service NSG ID"
  value       = azurerm_network_security_group.app_service.id
}

output "nsg_database_id" {
  description = "Database NSG ID"
  value       = azurerm_network_security_group.database.id
}

output "private_dns_zone_postgres_id" {
  description = "PostgreSQL Private DNS Zone ID"
  value       = var.enable_private_endpoints ? azurerm_private_dns_zone.postgres[0].id : null
}

output "private_dns_zone_postgres_name" {
  description = "PostgreSQL Private DNS Zone name"
  value       = var.enable_private_endpoints ? azurerm_private_dns_zone.postgres[0].name : null
}

output "private_dns_zone_keyvault_id" {
  description = "Key Vault Private DNS Zone ID"
  value       = var.enable_private_endpoints ? azurerm_private_dns_zone.keyvault[0].id : null
}

output "private_dns_zone_keyvault_name" {
  description = "Key Vault Private DNS Zone name"
  value       = var.enable_private_endpoints ? azurerm_private_dns_zone.keyvault[0].name : null
}

output "subnet_container_apps_id" {
  description = "Container Apps subnet ID"
  value       = var.enable_container_apps ? azurerm_subnet.container_apps[0].id : null
}

output "subnet_container_apps_name" {
  description = "Container Apps subnet name"
  value       = var.enable_container_apps ? azurerm_subnet.container_apps[0].name : null
}
