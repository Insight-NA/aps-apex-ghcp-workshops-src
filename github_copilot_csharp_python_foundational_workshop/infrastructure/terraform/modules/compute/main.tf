# =============================================================================
# Compute Module - Road Trip Planner
# =============================================================================
# Creates App Service Plan, App Service (Python backend), and Static Web App
# (React frontend) with optional VNet integration.
#
# Resources:
# - App Service Plan (Linux)
# - App Service with Python runtime and Managed Identity
# - Static Web App for React frontend
# =============================================================================

# -----------------------------------------------------------------------------
# App Service Plan
# -----------------------------------------------------------------------------

resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = var.app_service_os
  sku_name            = var.app_service_sku

  tags = var.tags
}

# -----------------------------------------------------------------------------
# App Service (Backend API)
# -----------------------------------------------------------------------------

resource "azurerm_linux_web_app" "backend" {
  name                = "app-${var.project_name}-api-${var.environment}-${var.resource_suffix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id

  # Enable HTTPS only
  https_only = true

  # Managed Identity for Key Vault access
  identity {
    type = "SystemAssigned"
  }

  # VNet integration (conditional)
  virtual_network_subnet_id = var.enable_vnet_integration ? var.app_service_subnet_id : null

  site_config {
    # Python configuration
    application_stack {
      python_version = var.python_version
    }

    # Always on for better performance (not available in Free/Shared tiers)
    always_on = !contains(["F1", "D1"], var.app_service_sku)

    # Health check
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 5

    # CORS configuration
    cors {
      allowed_origins     = var.allowed_origins
      support_credentials = true
    }

    # Minimum TLS version
    minimum_tls_version = "1.2"

    # HTTP/2 support
    http2_enabled = true

    # FTP disabled for security
    ftps_state = "Disabled"
  }

  # Application settings (environment variables)
  app_settings = merge(
    {
      # Azure deployment settings
      "WEBSITE_RUN_FROM_PACKAGE"       = "1"
      "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"

      # Python settings
      "PYTHON_ENABLE_GUNICORN_MULTIWORKERS" = "true"

      # Application settings
      "ENVIRONMENT"     = var.environment
      "ALLOWED_ORIGINS" = join(",", var.allowed_origins)
      "AI_SERVICE_URL"  = var.ai_service_url

      # Application Insights (will be set by monitoring module)
      # "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
    },
    var.additional_app_settings
  )

  # Logs configuration
  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }

    application_logs {
      file_system_level = "Warning"
    }
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [
      # Ignore changes to app_settings that may be set externally
      app_settings["APPLICATIONINSIGHTS_CONNECTION_STRING"],
      app_settings["APPINSIGHTS_INSTRUMENTATIONKEY"],
      # Ignore tags that may be added by Azure
      tags["hidden-link: /app-insights-conn-string"],
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
    ]
  }
}

# -----------------------------------------------------------------------------
# Static Web App (Frontend)
# -----------------------------------------------------------------------------

resource "azurerm_static_web_app" "frontend" {
  name                = "swa-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location            = var.static_web_app_location
  resource_group_name = var.resource_group_name
  sku_tier            = var.static_web_app_sku
  sku_size            = var.static_web_app_sku

  tags = var.tags
}

# -----------------------------------------------------------------------------
# App Service Slot (Staging) - Only for production environments
# -----------------------------------------------------------------------------

resource "azurerm_linux_web_app_slot" "staging" {
  count = var.enable_staging_slot ? 1 : 0

  name           = "staging"
  app_service_id = azurerm_linux_web_app.backend.id

  https_only = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      python_version = var.python_version
    }

    always_on = !contains(["F1", "D1"], var.app_service_sku)

    health_check_path = "/health"

    cors {
      allowed_origins     = var.allowed_origins
      support_credentials = true
    }

    minimum_tls_version = "1.2"
    http2_enabled       = true
    ftps_state          = "Disabled"
  }

  app_settings = merge(
    {
      "WEBSITE_RUN_FROM_PACKAGE" = "1"
      "ENVIRONMENT"              = "${var.environment}-staging"
      "ALLOWED_ORIGINS"          = join(",", var.allowed_origins)
    },
    var.additional_app_settings
  )

  tags = var.tags
}
