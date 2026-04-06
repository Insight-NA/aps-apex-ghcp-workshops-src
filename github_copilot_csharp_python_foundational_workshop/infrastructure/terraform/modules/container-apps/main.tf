# =============================================================================
# Container Apps Module - Road Trip Planner
# =============================================================================
# Creates Azure Container Apps Environment and Container Apps for the polyglot
# microservices: BFF (Node.js), C# Backend (ASP.NET), Java Backend (Spring Boot)
#
# Architecture:
# - BFF: External ingress (public-facing API gateway)
# - C# Backend: Internal ingress (AI vehicle parsing, Azure OpenAI)
# - Java Backend: Internal ingress (Geocoding, directions, POI search)
#
# Resources:
# - Container Apps Environment with Log Analytics integration
# - Container Apps with Managed Identities
# - RBAC assignments for Key Vault access
# =============================================================================

# -----------------------------------------------------------------------------
# Container Apps Environment
# -----------------------------------------------------------------------------

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.project_name}-${var.environment}-${var.resource_suffix}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id

  # VNet integration (optional, for prod environments)
  infrastructure_subnet_id = var.enable_vnet_integration ? var.container_apps_subnet_id : null

  # Workload profile (Consumption by default)
  workload_profile {
    name                  = "Consumption"
    workload_profile_type = "Consumption"
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Container App: BFF (Node.js) - External Ingress
# -----------------------------------------------------------------------------

resource "azurerm_container_app" "bff" {
  name                         = "ca-bff-${var.environment}-${var.resource_suffix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  identity {
    type = "SystemAssigned"
  }

  template {
    min_replicas = var.bff_config.min_replicas
    max_replicas = var.bff_config.max_replicas

    container {
      name   = "bff"
      image  = var.bff_config.image
      cpu    = var.bff_config.cpu
      memory = var.bff_config.memory

      # Environment variables
      env {
        name  = "PORT"
        value = "3000"
      }
      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }
      env {
        name  = "PYTHON_BACKEND_URL"
        value = "https://${var.python_backend_url}"
      }
      env {
        name  = "CSHARP_BACKEND_URL"
        value = "https://${azurerm_container_app.csharp_backend.ingress[0].fqdn}"
      }
      env {
        name  = "JAVA_BACKEND_URL"
        value = "https://${azurerm_container_app.java_backend.ingress[0].fqdn}"
      }
      env {
        name  = "ALLOWED_ORIGINS"
        value = join(",", var.allowed_origins)
      }

      # Liveness probe
      liveness_probe {
        transport = "HTTP"
        path      = "/health"
        port      = 3000
      }

      # Readiness probe
      readiness_probe {
        transport = "HTTP"
        path      = "/health"
        port      = 3000
      }
    }

    # Scale rules based on HTTP requests
    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 100
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = var.tags

  depends_on = [
    azurerm_container_app.csharp_backend,
    azurerm_container_app.java_backend
  ]
}

# -----------------------------------------------------------------------------
# Container App: C# Backend (ASP.NET) - Internal Ingress
# -----------------------------------------------------------------------------

resource "azurerm_container_app" "csharp_backend" {
  name                         = "ca-csharp-${var.environment}-${var.resource_suffix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  identity {
    type = "SystemAssigned"
  }

  template {
    min_replicas = var.csharp_config.min_replicas
    max_replicas = var.csharp_config.max_replicas

    container {
      name   = "csharp-backend"
      image  = var.csharp_config.image
      cpu    = var.csharp_config.cpu
      memory = var.csharp_config.memory

      # Environment variables
      env {
        name  = "ASPNETCORE_URLS"
        value = "http://+:8081"
      }
      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = var.environment == "prod" ? "Production" : "Development"
      }
      env {
        name  = "ALLOWED_ORIGINS"
        value = join(",", var.allowed_origins)
      }

      # Azure OpenAI configuration (from Key Vault secrets)
      env {
        name        = "AZURE_OPENAI_ENDPOINT"
        secret_name = "azure-openai-endpoint"
      }
      env {
        name        = "AZURE_OPENAI_API_KEY"
        secret_name = "azure-openai-api-key"
      }
      env {
        name        = "AZURE_OPENAI_DEPLOYMENT"
        secret_name = "azure-openai-deployment"
      }

      # Liveness probe
      liveness_probe {
        transport = "HTTP"
        path      = "/health"
        port      = 8081
      }

      # Readiness probe
      readiness_probe {
        transport = "HTTP"
        path      = "/health"
        port      = 8081
      }
    }

    # Scale rules based on HTTP requests
    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 50
    }
  }

  # Secrets (referenced from environment variables)
  secret {
    name  = "azure-openai-endpoint"
    value = var.azure_openai_endpoint
  }
  secret {
    name  = "azure-openai-api-key"
    value = var.azure_openai_api_key
  }
  secret {
    name  = "azure-openai-deployment"
    value = var.azure_openai_deployment
  }

  ingress {
    external_enabled = false # Internal only - only BFF can access
    target_port      = 8081
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Container App: Java Backend (Spring Boot) - Internal Ingress
# -----------------------------------------------------------------------------

resource "azurerm_container_app" "java_backend" {
  name                         = "ca-java-${var.environment}-${var.resource_suffix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  identity {
    type = "SystemAssigned"
  }

  template {
    min_replicas = var.java_config.min_replicas
    max_replicas = var.java_config.max_replicas

    container {
      name   = "java-backend"
      image  = var.java_config.image
      cpu    = var.java_config.cpu
      memory = var.java_config.memory

      # Environment variables
      env {
        name  = "SERVER_PORT"
        value = "8082"
      }
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = var.environment == "prod" ? "prod" : "dev"
      }
      env {
        name  = "ALLOWED_ORIGINS"
        value = join(",", var.allowed_origins)
      }

      # Mapbox and Azure Maps configuration (from secrets)
      env {
        name        = "MAPBOX_TOKEN"
        secret_name = "mapbox-token"
      }
      env {
        name        = "AZURE_MAPS_KEY"
        secret_name = "azure-maps-key"
      }

      # Liveness probe
      liveness_probe {
        transport = "HTTP"
        path      = "/actuator/health"
        port      = 8082
      }

      # Readiness probe
      readiness_probe {
        transport = "HTTP"
        path      = "/actuator/health"
        port      = 8082
      }
    }

    # Scale rules based on HTTP requests
    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 50
    }
  }

  # Secrets
  secret {
    name  = "mapbox-token"
    value = var.mapbox_token
  }
  secret {
    name  = "azure-maps-key"
    value = var.azure_maps_key
  }

  ingress {
    external_enabled = false # Internal only - only BFF can access
    target_port      = 8082
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# RBAC: Key Vault Secrets User for Container Apps
# -----------------------------------------------------------------------------

resource "azurerm_role_assignment" "bff_keyvault" {
  count = var.key_vault_id != null ? 1 : 0

  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_container_app.bff.identity[0].principal_id
}

resource "azurerm_role_assignment" "csharp_keyvault" {
  count = var.key_vault_id != null ? 1 : 0

  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_container_app.csharp_backend.identity[0].principal_id
}

resource "azurerm_role_assignment" "java_keyvault" {
  count = var.key_vault_id != null ? 1 : 0

  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_container_app.java_backend.identity[0].principal_id
}
