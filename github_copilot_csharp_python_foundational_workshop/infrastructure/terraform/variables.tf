# =============================================================================
# Terraform Variables for Road Trip Planner Infrastructure
# =============================================================================
# This file defines all input variables for the Terraform configuration.
# Variables are organized by category for clarity.
# =============================================================================

# -----------------------------------------------------------------------------
# Environment Configuration
# -----------------------------------------------------------------------------

variable "environment" {
  description = "Environment name (dev, uat, stage, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "uat", "stage", "prod"], var.environment)
    error_message = "Environment must be one of: dev, uat, stage, prod."
  }
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
  default     = "centralus"

  validation {
    condition = contains([
      "centralus", "eastus", "eastus2", "westus", "westus2", "westus3",
      "northeurope", "westeurope", "southeastasia", "australiaeast"
    ], var.location)
    error_message = "Location must be a valid Azure region."
  }
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string

  validation {
    condition     = can(regex("^rg-", var.resource_group_name))
    error_message = "Resource group name should start with 'rg-' per naming conventions."
  }
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "roadtrip"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,20}$", var.project_name))
    error_message = "Project name must be lowercase alphanumeric with hyphens, 3-21 characters."
  }
}

# -----------------------------------------------------------------------------
# Networking Configuration
# -----------------------------------------------------------------------------

variable "enable_private_endpoints" {
  description = "Enable private endpoints for secure service access (recommended for prod)"
  type        = bool
  default     = false
}

variable "enable_vnet_integration" {
  description = "Enable VNet integration for App Service"
  type        = bool
  default     = false
}

variable "vnet_address_space" {
  description = "Address space for the virtual network (CIDR notation)"
  type        = list(string)
  default     = ["10.0.0.0/16"]

  validation {
    condition     = alltrue([for cidr in var.vnet_address_space : can(cidrhost(cidr, 0))])
    error_message = "VNet address space must be valid CIDR notation."
  }
}

variable "subnet_app_service" {
  description = "CIDR block for App Service subnet"
  type        = string
  default     = "10.0.1.0/24"

  validation {
    condition     = can(cidrhost(var.subnet_app_service, 0))
    error_message = "App Service subnet must be valid CIDR notation."
  }
}

variable "subnet_database" {
  description = "CIDR block for Database subnet"
  type        = string
  default     = "10.0.2.0/24"

  validation {
    condition     = can(cidrhost(var.subnet_database, 0))
    error_message = "Database subnet must be valid CIDR notation."
  }
}

variable "subnet_private_endpoints" {
  description = "CIDR block for Private Endpoints subnet"
  type        = string
  default     = "10.0.3.0/24"

  validation {
    condition     = can(cidrhost(var.subnet_private_endpoints, 0))
    error_message = "Private Endpoints subnet must be valid CIDR notation."
  }
}

# -----------------------------------------------------------------------------
# App Service Configuration
# -----------------------------------------------------------------------------

variable "app_service_sku" {
  description = "SKU for App Service Plan (B1 for dev, P1V3 for prod)"
  type        = string
  default     = "B1"

  validation {
    condition     = contains(["F1", "B1", "B2", "B3", "S1", "S2", "S3", "P1V2", "P2V2", "P3V2", "P1V3", "P2V3", "P3V3"], var.app_service_sku)
    error_message = "App Service SKU must be a valid tier."
  }
}

variable "app_service_os" {
  description = "Operating system for App Service (Linux or Windows)"
  type        = string
  default     = "Linux"

  validation {
    condition     = contains(["Linux", "Windows"], var.app_service_os)
    error_message = "App Service OS must be Linux or Windows."
  }
}

variable "python_version" {
  description = "Python version for backend App Service"
  type        = string
  default     = "3.12"

  validation {
    condition     = contains(["3.10", "3.11", "3.12"], var.python_version)
    error_message = "Python version must be 3.10, 3.11, or 3.12."
  }
}

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------

variable "database_sku" {
  description = "SKU for PostgreSQL Flexible Server"
  type        = string
  default     = "B_Standard_B1ms"

  validation {
    condition     = can(regex("^(B_Standard_B|GP_Standard_D|MO_Standard_E)", var.database_sku))
    error_message = "Database SKU must be Burstable (B_), General Purpose (GP_), or Memory Optimized (MO_)."
  }
}

variable "database_storage_mb" {
  description = "Storage size for PostgreSQL in MB (min 32768 = 32GB)"
  type        = number
  default     = 32768

  validation {
    condition     = var.database_storage_mb >= 32768 && var.database_storage_mb <= 16777216
    error_message = "Database storage must be between 32GB (32768 MB) and 16TB (16777216 MB)."
  }
}

variable "database_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"

  validation {
    condition     = contains(["14", "15", "16"], var.database_version)
    error_message = "PostgreSQL version must be 14, 15, or 16."
  }
}

variable "database_backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 7

  validation {
    condition     = var.database_backup_retention_days >= 7 && var.database_backup_retention_days <= 35
    error_message = "Backup retention must be between 7 and 35 days."
  }
}

variable "database_geo_redundant_backup" {
  description = "Enable geo-redundant backup for database"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Static Web App Configuration
# -----------------------------------------------------------------------------

variable "static_web_app_sku" {
  description = "SKU tier for Static Web App (Free or Standard)"
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.static_web_app_sku)
    error_message = "Static Web App SKU must be Free or Standard."
  }
}

# -----------------------------------------------------------------------------
# CORS and Origins Configuration
# -----------------------------------------------------------------------------

variable "allowed_origins" {
  description = "List of allowed CORS origins for the API"
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:3000"]
}

variable "ai_service_url" {
  description = "URL of the AI microservice (if deployed separately)"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Secrets (Sensitive Values)
# -----------------------------------------------------------------------------
# These should be provided via:
# - Environment variables: TF_VAR_mapbox_token, etc.
# - Azure DevOps/GitHub Secrets
# - .tfvars file (DO NOT COMMIT!)
# -----------------------------------------------------------------------------

variable "mapbox_token" {
  description = "Mapbox API token for maps and routing"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.mapbox_token) > 10
    error_message = "Mapbox token appears to be invalid or missing."
  }
}

variable "google_client_id" {
  description = "Google OAuth Client ID for authentication"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret_key" {
  description = "Secret key for JWT token signing (min 32 characters)"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_secret_key) >= 32
    error_message = "JWT secret key must be at least 32 characters for security."
  }
}

variable "gemini_api_key" {
  description = "Google Gemini AI API key for vehicle parsing"
  type        = string
  sensitive   = true
  default     = ""
}

variable "azure_maps_key" {
  description = "Azure Maps API key for POI search"
  type        = string
  sensitive   = true
  default     = ""
}

variable "database_admin_password" {
  description = "Admin password for PostgreSQL database"
  type        = string
  sensitive   = true
  default     = ""

  validation {
    condition     = var.database_admin_password == "" || (length(var.database_admin_password) >= 8 && can(regex("[A-Z]", var.database_admin_password)) && can(regex("[a-z]", var.database_admin_password)) && can(regex("[0-9]", var.database_admin_password)))
    error_message = "Database password must be at least 8 characters with uppercase, lowercase, and numbers."
  }
}

# -----------------------------------------------------------------------------
# Tags
# -----------------------------------------------------------------------------

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project   = "RoadTripPlanner"
    ManagedBy = "Terraform"
  }

  validation {
    condition     = contains(keys(var.tags), "Project") || contains(keys(var.tags), "Environment")
    error_message = "Tags must include at least 'Project' or 'Environment' key."
  }
}

# -----------------------------------------------------------------------------
# Feature Flags
# -----------------------------------------------------------------------------

variable "enable_monitoring" {
  description = "Enable Application Insights and Log Analytics"
  type        = bool
  default     = true
}

variable "enable_key_vault" {
  description = "Enable Azure Key Vault for secrets management"
  type        = bool
  default     = true
}

variable "enable_auto_scaling" {
  description = "Enable auto-scaling for App Service (requires P1V2+ SKU)"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Naming Convention Suffix
# -----------------------------------------------------------------------------

variable "name_suffix" {
  description = "Optional suffix to append to resource names for uniqueness"
  type        = string
  default     = ""

  validation {
    condition     = var.name_suffix == "" || can(regex("^[a-z0-9-]{1,10}$", var.name_suffix))
    error_message = "Name suffix must be lowercase alphanumeric with hyphens, max 10 characters."
  }
}
