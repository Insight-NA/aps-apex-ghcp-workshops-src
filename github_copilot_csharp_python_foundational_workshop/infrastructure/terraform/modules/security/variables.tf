# =============================================================================
# Security Module Variables
# =============================================================================

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, uat, stage, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "resource_suffix" {
  description = "Unique suffix for resource names"
  type        = string
}

variable "tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
}

# -----------------------------------------------------------------------------
# Key Vault Configuration
# -----------------------------------------------------------------------------

variable "soft_delete_retention_days" {
  description = "Days to retain soft-deleted secrets"
  type        = number
  default     = 7
}

variable "purge_protection_enabled" {
  description = "Enable purge protection (prevents permanent deletion)"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Access Control
# -----------------------------------------------------------------------------

variable "app_service_principal_id" {
  description = "App Service Managed Identity Principal ID for Key Vault access"
  type        = string
  default     = null
}

variable "staging_slot_principal_id" {
  description = "Staging Slot Managed Identity Principal ID for Key Vault access"
  type        = string
  default     = null
}

variable "deployment_principal_id" {
  description = "Deployment Service Principal ID for Key Vault administration"
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# Secrets
# -----------------------------------------------------------------------------

variable "secrets" {
  description = "Map of secrets to store in Key Vault"
  type        = map(string)
  default     = {}
  # Note: sensitive = false because for_each cannot use sensitive values
  # The actual secret values are still protected by azurerm_key_vault_secret
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

variable "enable_private_endpoint" {
  description = "Enable private endpoint for Key Vault"
  type        = bool
  default     = false
}

variable "private_endpoint_subnet_id" {
  description = "Subnet ID for private endpoint"
  type        = string
  default     = null
}

variable "private_dns_zone_id" {
  description = "Private DNS zone ID for Key Vault"
  type        = string
  default     = null
}

variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access Key Vault (for public access)"
  type        = list(string)
  default     = []
}

# -----------------------------------------------------------------------------
# Monitoring
# -----------------------------------------------------------------------------

variable "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID for diagnostic logs"
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# Tags
# -----------------------------------------------------------------------------

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
