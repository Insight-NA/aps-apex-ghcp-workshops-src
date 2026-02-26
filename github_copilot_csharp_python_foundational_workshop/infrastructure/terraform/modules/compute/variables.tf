# =============================================================================
# Compute Module Variables
# =============================================================================

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for App Service"
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

# -----------------------------------------------------------------------------
# App Service Configuration
# -----------------------------------------------------------------------------

variable "app_service_sku" {
  description = "SKU for App Service Plan"
  type        = string
  default     = "B1"
}

variable "app_service_os" {
  description = "Operating system (Linux or Windows)"
  type        = string
  default     = "Linux"
}

variable "python_version" {
  description = "Python version for the backend"
  type        = string
  default     = "3.12"
}

# -----------------------------------------------------------------------------
# VNet Integration
# -----------------------------------------------------------------------------

variable "enable_vnet_integration" {
  description = "Enable VNet integration for App Service"
  type        = bool
  default     = false
}

variable "app_service_subnet_id" {
  description = "Subnet ID for App Service VNet integration"
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# Static Web App Configuration
# -----------------------------------------------------------------------------

variable "static_web_app_sku" {
  description = "SKU for Static Web App (Free or Standard)"
  type        = string
  default     = "Free"
}

variable "static_web_app_location" {
  description = "Location for Static Web App (limited regions available)"
  type        = string
  default     = "centralus"
}

# -----------------------------------------------------------------------------
# Application Settings
# -----------------------------------------------------------------------------

variable "allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = []
}

variable "ai_service_url" {
  description = "URL of the AI microservice"
  type        = string
  default     = ""
}

variable "additional_app_settings" {
  description = "Additional app settings to add to the App Service"
  type        = map(string)
  default     = {}
}

# -----------------------------------------------------------------------------
# Staging Slot
# -----------------------------------------------------------------------------

variable "enable_staging_slot" {
  description = "Enable staging deployment slot (requires Standard tier or higher)"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Tags
# -----------------------------------------------------------------------------

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
