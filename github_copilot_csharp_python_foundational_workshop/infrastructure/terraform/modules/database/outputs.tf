# =============================================================================
# Database Module Outputs
# =============================================================================

output "server_id" {
  description = "PostgreSQL Flexible Server ID"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_name" {
  description = "PostgreSQL Flexible Server name"
  value       = azurerm_postgresql_flexible_server.main.name
}

output "server_fqdn" {
  description = "PostgreSQL Flexible Server FQDN"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_id" {
  description = "Application database ID"
  value       = azurerm_postgresql_flexible_server_database.app.id
}

output "database_name" {
  description = "Application database name"
  value       = azurerm_postgresql_flexible_server_database.app.name
}

output "administrator_login" {
  description = "Administrator login username"
  value       = azurerm_postgresql_flexible_server.main.administrator_login
}

output "connection_string" {
  description = "PostgreSQL connection string (without password)"
  value       = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.app.name}?sslmode=require"
  sensitive   = true
}

output "jdbc_connection_string" {
  description = "JDBC connection string"
  value       = "jdbc:postgresql://${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.app.name}?sslmode=require"
}
