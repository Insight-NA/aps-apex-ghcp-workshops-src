# =============================================================================
# Database Module - Road Trip Planner
# =============================================================================
# Creates PostgreSQL Flexible Server with optional VNet integration and
# private endpoint support.
#
# Features:
# - PostgreSQL Flexible Server
# - VNet integration for private environments
# - Firewall rules for public access in dev
# - Database for the application
# =============================================================================

# -----------------------------------------------------------------------------
# PostgreSQL Flexible Server
# -----------------------------------------------------------------------------

resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-${var.project_name}-${var.environment}-${var.resource_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location

  # Authentication
  administrator_login    = var.database_admin_username
  administrator_password = var.database_admin_password

  # SKU configuration
  sku_name   = var.database_sku
  storage_mb = var.database_storage_mb
  version    = var.database_version

  # VNet integration (for private environments)
  delegated_subnet_id = var.enable_private_endpoint ? var.delegated_subnet_id : null
  private_dns_zone_id = var.enable_private_endpoint ? var.private_dns_zone_id : null

  # Backup configuration
  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup

  # Availability zone (single zone for cost optimization in non-prod)
  zone = var.availability_zone

  # High availability (only for production)
  dynamic "high_availability" {
    for_each = var.enable_high_availability ? [1] : []
    content {
      mode                      = "ZoneRedundant"
      standby_availability_zone = var.standby_availability_zone
    }
  }

  # Maintenance window (Sunday 2-4 AM)
  maintenance_window {
    day_of_week  = 0
    start_hour   = 2
    start_minute = 0
  }

  tags = var.tags

  lifecycle {
    # Prevent accidental deletion
    prevent_destroy = false

    # Ignore password changes from external sources
    ignore_changes = [
      administrator_password,
      zone,
    ]
  }
}

# -----------------------------------------------------------------------------
# Application Database
# -----------------------------------------------------------------------------

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# -----------------------------------------------------------------------------
# Firewall Rules (only for public access - dev environment)
# -----------------------------------------------------------------------------

# Allow Azure services to access the database
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  count = var.allow_azure_services ? 1 : 0

  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Allow specific IP addresses (for development/debugging)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allowed_ips" {
  for_each = var.allow_azure_services ? { for ip in var.allowed_ip_addresses : ip.name => ip } : {}

  name             = each.value.name
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = each.value.start_ip
  end_ip_address   = each.value.end_ip
}

# -----------------------------------------------------------------------------
# PostgreSQL Server Configuration
# -----------------------------------------------------------------------------

resource "azurerm_postgresql_flexible_server_configuration" "timezone" {
  name      = "timezone"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "UTC"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_connections" {
  name      = "log_connections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_disconnections" {
  name      = "log_disconnections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_duration" {
  name      = "log_duration"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

# Performance tuning for production
resource "azurerm_postgresql_flexible_server_configuration" "shared_preload_libraries" {
  count = var.enable_pg_stat_statements ? 1 : 0

  name      = "shared_preload_libraries"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "pg_stat_statements"
}
