# =============================================================================
# Container Apps Module Variables
# =============================================================================

# -----------------------------------------------------------------------------
# Common Variables
# -----------------------------------------------------------------------------

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for Container Apps"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, uat, stage, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "uat", "stage", "prod"], var.environment)
    error_message = "Environment must be one of: dev, uat, stage, prod."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "resource_suffix" {
  description = "Unique suffix for resource names"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# -----------------------------------------------------------------------------
# Container Apps Environment Configuration
# -----------------------------------------------------------------------------

variable "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID for Container Apps Environment"
  type        = string
}

variable "enable_vnet_integration" {
  description = "Enable VNet integration for Container Apps"
  type        = bool
  default     = false
}

variable "container_apps_subnet_id" {
  description = "Subnet ID for Container Apps VNet integration"
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# Key Vault Integration
# -----------------------------------------------------------------------------

variable "key_vault_id" {
  description = "Key Vault ID for RBAC assignment (optional)"
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# Backend URLs
# -----------------------------------------------------------------------------

variable "python_backend_url" {
  description = "URL of the Python backend App Service (FQDN without https://)"
  type        = string
}

variable "allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = []
}

# -----------------------------------------------------------------------------
# BFF Configuration (Node.js)
# -----------------------------------------------------------------------------

variable "bff_config" {
  description = "Configuration for BFF Container App"
  type = object({
    image        = string
    cpu          = number
    memory       = string
    min_replicas = optional(number, 0)
    max_replicas = optional(number, 5)
  })
  default = {
    image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
    cpu          = 0.5
    memory       = "1Gi"
    min_replicas = 0
    max_replicas = 5
  }
}

# -----------------------------------------------------------------------------
# C# Backend Configuration (ASP.NET)
# -----------------------------------------------------------------------------

variable "csharp_config" {
  description = "Configuration for C# Backend Container App"
  type = object({
    image        = string
    cpu          = number
    memory       = string
    min_replicas = optional(number, 0)
    max_replicas = optional(number, 5)
  })
  default = {
    image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
    cpu          = 0.5
    memory       = "1Gi"
    min_replicas = 0
    max_replicas = 5
  }
}

# Azure OpenAI secrets for C# backend
variable "azure_openai_endpoint" {
  description = "Azure OpenAI endpoint URL"
  type        = string
  sensitive   = true
}

variable "azure_openai_api_key" {
  description = "Azure OpenAI API key"
  type        = string
  sensitive   = true
}

variable "azure_openai_deployment" {
  description = "Azure OpenAI deployment/model name"
  type        = string
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Java Backend Configuration (Spring Boot)
# -----------------------------------------------------------------------------

variable "java_config" {
  description = "Configuration for Java Backend Container App"
  type = object({
    image        = string
    cpu          = number
    memory       = string
    min_replicas = optional(number, 0)
    max_replicas = optional(number, 5)
  })
  default = {
    image        = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
    cpu          = 0.75
    memory       = "1.5Gi"
    min_replicas = 0
    max_replicas = 5
  }
}

# Secrets for Java backend (passed from root module)
variable "mapbox_token" {
  description = "Mapbox API token"
  type        = string
  sensitive   = true
}

variable "azure_maps_key" {
  description = "Azure Maps API key"
  type        = string
  sensitive   = true
}
