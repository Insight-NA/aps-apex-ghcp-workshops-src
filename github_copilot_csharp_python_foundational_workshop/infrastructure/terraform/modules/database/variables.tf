# =============================================================================
# Database Module Variables
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

# -----------------------------------------------------------------------------
# PostgreSQL Configuration
# -----------------------------------------------------------------------------

variable "database_sku" {
  description = "SKU for PostgreSQL Flexible Server"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "database_storage_mb" {
  description = "Storage size in MB"
  type        = number
  default     = 32768
}

variable "database_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"
}

variable "database_admin_username" {
  description = "Administrator username"
  type        = string
  default     = "roadtripadmin"
}

variable "database_admin_password" {
  description = "Administrator password"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Name of the application database"
  type        = string
  default     = "roadtrip"
}

# -----------------------------------------------------------------------------
# Backup Configuration
# -----------------------------------------------------------------------------

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "geo_redundant_backup" {
  description = "Enable geo-redundant backup"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

variable "enable_private_endpoint" {
  description = "Enable VNet integration with delegated subnet"
  type        = bool
  default     = false
}

variable "delegated_subnet_id" {
  description = "Delegated subnet ID for PostgreSQL"
  type        = string
  default     = null
}

variable "private_dns_zone_id" {
  description = "Private DNS zone ID for PostgreSQL"
  type        = string
  default     = null
}

variable "allow_azure_services" {
  description = "Allow Azure services to access (for dev, disable for prod)"
  type        = bool
  default     = true
}

variable "allowed_ip_addresses" {
  description = "List of allowed IP addresses for firewall rules"
  type = list(object({
    name     = string
    start_ip = string
    end_ip   = string
  }))
  default = []
}

# -----------------------------------------------------------------------------
# High Availability
# -----------------------------------------------------------------------------

variable "enable_high_availability" {
  description = "Enable zone-redundant high availability"
  type        = bool
  default     = false
}

variable "availability_zone" {
  description = "Primary availability zone"
  type        = string
  default     = "1"
}

variable "standby_availability_zone" {
  description = "Standby availability zone for HA"
  type        = string
  default     = "2"
}

# -----------------------------------------------------------------------------
# Performance
# -----------------------------------------------------------------------------

variable "enable_pg_stat_statements" {
  description = "Enable pg_stat_statements extension"
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# Tags
# -----------------------------------------------------------------------------

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
