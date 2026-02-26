# =============================================================================
# Networking Module Variables
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

variable "vnet_address_space" {
  description = "Address space for the VNet"
  type        = list(string)
}

variable "subnet_app_service" {
  description = "CIDR for App Service subnet"
  type        = string
}

variable "subnet_database" {
  description = "CIDR for Database subnet"
  type        = string
}

variable "subnet_private_endpoints" {
  description = "CIDR for Private Endpoints subnet"
  type        = string
}

variable "enable_private_endpoints" {
  description = "Enable private endpoints and DNS zones"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
