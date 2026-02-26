# =============================================================================
# Monitoring Module Variables
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
# Log Analytics Configuration
# -----------------------------------------------------------------------------

variable "log_analytics_sku" {
  description = "SKU for Log Analytics Workspace"
  type        = string
  default     = "PerGB2018"
}

variable "log_analytics_retention" {
  description = "Retention period in days"
  type        = number
  default     = 30
}

variable "daily_quota_gb" {
  description = "Daily ingestion quota in GB (null for unlimited)"
  type        = number
  default     = null
}

# -----------------------------------------------------------------------------
# Application Insights Configuration
# -----------------------------------------------------------------------------

variable "app_insights_type" {
  description = "Application Insights type"
  type        = string
  default     = "web"
}

variable "sampling_percentage" {
  description = "Telemetry sampling percentage (100 = full sampling)"
  type        = number
  default     = 100
}

# -----------------------------------------------------------------------------
# Alert Configuration
# -----------------------------------------------------------------------------

variable "enable_alerts" {
  description = "Enable metric alerts"
  type        = bool
  default     = false
}

variable "enable_app_service_diagnostics" {
  description = "Enable App Service diagnostic settings"
  type        = bool
  default     = true
}

variable "enable_database_diagnostics" {
  description = "Enable Database diagnostic settings"
  type        = bool
  default     = true
}

variable "action_group_id" {
  description = "Action Group ID for alert notifications"
  type        = string
  default     = null
}

variable "error_threshold" {
  description = "Threshold for 5xx error count alert"
  type        = number
  default     = 5
}

variable "response_time_threshold_ms" {
  description = "Threshold for response time alert (milliseconds)"
  type        = number
  default     = 3000
}

variable "cpu_threshold_percent" {
  description = "Threshold for CPU usage alert (percentage)"
  type        = number
  default     = 80
}

# -----------------------------------------------------------------------------
# Resources to Monitor
# -----------------------------------------------------------------------------

variable "app_service_id" {
  description = "App Service ID for diagnostic settings"
  type        = string
  default     = null
}

variable "database_id" {
  description = "Database ID for diagnostic settings"
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
