# =============================================================================
# Security Module - Road Trip Planner
# =============================================================================
# Creates Azure Key Vault with access policies, RBAC assignments, and secrets
# management. Optional private endpoint support for production environments.
#
# Features:
# - Key Vault with soft delete and purge protection
# - RBAC-based access (Key Vault Secrets User for App Service)
# - Secret storage for API keys and database credentials
# - Optional private endpoint for enhanced security
# =============================================================================

# -----------------------------------------------------------------------------
# Key Vault
# -----------------------------------------------------------------------------

resource "azurerm_key_vault" "main" {
  name                = "kv-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id

  sku_name = "standard"

  # Security settings
  enabled_for_deployment          = false
  enabled_for_disk_encryption     = false
  enabled_for_template_deployment = false

  # Soft delete (required) - 7 days minimum retention
  soft_delete_retention_days = var.soft_delete_retention_days
  purge_protection_enabled   = var.purge_protection_enabled

  # Enable RBAC authorization (recommended over access policies)
  enable_rbac_authorization = true

  # Network rules
  network_acls {
    bypass                     = "AzureServices"
    default_action             = var.enable_private_endpoint ? "Deny" : "Allow"
    ip_rules                   = var.enable_private_endpoint ? [] : var.allowed_ip_ranges
    virtual_network_subnet_ids = var.enable_private_endpoint ? [] : []
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# RBAC Role Assignments
# -----------------------------------------------------------------------------

# Key Vault Secrets User role for App Service Managed Identity
resource "azurerm_role_assignment" "app_service_secrets_user" {
  count = var.app_service_principal_id != null ? 1 : 0

  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.app_service_principal_id
}

# Key Vault Secrets User role for Staging Slot Managed Identity (if exists)
resource "azurerm_role_assignment" "staging_slot_secrets_user" {
  count = var.staging_slot_principal_id != null ? 1 : 0

  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.staging_slot_principal_id
}

# Key Vault Administrator role for the deployment service principal
resource "azurerm_role_assignment" "deployment_admin" {
  count = var.deployment_principal_id != null ? 1 : 0

  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = var.deployment_principal_id
}

# -----------------------------------------------------------------------------
# Secrets
# -----------------------------------------------------------------------------

resource "azurerm_key_vault_secret" "secrets" {
  for_each = var.secrets

  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.main.id

  content_type = "text/plain"

  tags = var.tags

  depends_on = [
    azurerm_role_assignment.deployment_admin
  ]
}

# -----------------------------------------------------------------------------
# Private Endpoint (for production environments)
# -----------------------------------------------------------------------------

resource "azurerm_private_endpoint" "keyvault" {
  count = var.enable_private_endpoint ? 1 : 0

  name                = "pe-kv-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoint_subnet_id

  private_service_connection {
    name                           = "psc-kv-${var.project_name}-${var.environment}"
    private_connection_resource_id = azurerm_key_vault.main.id
    is_manual_connection           = false
    subresource_names              = ["vault"]
  }

  dynamic "private_dns_zone_group" {
    for_each = var.private_dns_zone_id != null ? [1] : []
    content {
      name                 = "default"
      private_dns_zone_ids = [var.private_dns_zone_id]
    }
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Diagnostic Settings
# -----------------------------------------------------------------------------

resource "azurerm_monitor_diagnostic_setting" "keyvault" {
  count = var.log_analytics_workspace_id != null ? 1 : 0

  name                       = "diag-kv-${var.project_name}-${var.environment}"
  target_resource_id         = azurerm_key_vault.main.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "AuditEvent"
  }

  enabled_log {
    category = "AzurePolicyEvaluationDetails"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
