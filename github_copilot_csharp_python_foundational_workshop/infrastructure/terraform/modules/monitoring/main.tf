# =============================================================================
# Monitoring Module - Road Trip Planner
# =============================================================================
# Creates Log Analytics Workspace and Application Insights for comprehensive
# monitoring, logging, and observability.
#
# Features:
# - Log Analytics Workspace for centralized logging
# - Application Insights for APM and telemetry
# - Alert rules for critical metrics
# - Dashboard for monitoring
# =============================================================================

# -----------------------------------------------------------------------------
# Log Analytics Workspace
# -----------------------------------------------------------------------------

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.log_analytics_sku
  retention_in_days   = var.log_analytics_retention

  # Daily cap to control costs (optional)
  daily_quota_gb = var.daily_quota_gb

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Application Insights
# -----------------------------------------------------------------------------

resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = var.app_insights_type

  # Sampling configuration
  sampling_percentage = var.sampling_percentage

  # Disable IP masking for debugging (enable in production for privacy)
  disable_ip_masking = var.environment == "dev"

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Alert Rules
# -----------------------------------------------------------------------------

# Alert: High Error Rate (5xx errors)
resource "azurerm_monitor_metric_alert" "high_error_rate" {
  count = var.enable_alerts ? 1 : 0

  name                = "alert-errors-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  scopes              = [var.app_service_id]
  description         = "Alert when 5xx error rate exceeds threshold"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http5xx"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = var.error_threshold
  }

  dynamic "action" {
    for_each = var.action_group_id != null ? [1] : []
    content {
      action_group_id = var.action_group_id
    }
  }

  tags = var.tags
}

# Alert: High Response Time
resource "azurerm_monitor_metric_alert" "high_response_time" {
  count = var.enable_alerts ? 1 : 0

  name                = "alert-latency-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  scopes              = [var.app_service_id]
  description         = "Alert when response time exceeds threshold"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = var.response_time_threshold_ms
  }

  dynamic "action" {
    for_each = var.action_group_id != null ? [1] : []
    content {
      action_group_id = var.action_group_id
    }
  }

  tags = var.tags
}

# Alert: High CPU Usage
resource "azurerm_monitor_metric_alert" "high_cpu" {
  count = var.enable_alerts ? 1 : 0

  name                = "alert-cpu-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  scopes              = [var.app_service_id]
  description         = "Alert when CPU usage exceeds threshold"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "CpuPercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = var.cpu_threshold_percent
  }

  dynamic "action" {
    for_each = var.action_group_id != null ? [1] : []
    content {
      action_group_id = var.action_group_id
    }
  }

  tags = var.tags
}

# Alert: Database Connection Failures
resource "azurerm_monitor_metric_alert" "database_connections" {
  count = var.enable_alerts ? 1 : 0

  name                = "alert-db-conn-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  scopes              = [var.database_id]
  description         = "Alert when database connections fail"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "connections_failed"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 10
  }

  dynamic "action" {
    for_each = var.action_group_id != null ? [1] : []
    content {
      action_group_id = var.action_group_id
    }
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Diagnostic Settings for App Service
# -----------------------------------------------------------------------------

resource "azurerm_monitor_diagnostic_setting" "app_service" {
  count = var.enable_app_service_diagnostics ? 1 : 0

  name                       = "diag-app-${var.project_name}-${var.environment}"
  target_resource_id         = var.app_service_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }

  enabled_log {
    category = "AppServiceConsoleLogs"
  }

  enabled_log {
    category = "AppServiceAppLogs"
  }

  enabled_log {
    category = "AppServiceAuditLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# -----------------------------------------------------------------------------
# Diagnostic Settings for Database
# -----------------------------------------------------------------------------

resource "azurerm_monitor_diagnostic_setting" "database" {
  count = var.enable_database_diagnostics ? 1 : 0

  name                       = "diag-db-${var.project_name}-${var.environment}"
  target_resource_id         = var.database_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "PostgreSQLLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
