# =============================================================================
# Terraform Version and Provider Configuration
# =============================================================================
# This file defines the required Terraform version, provider versions, and
# backend configuration for remote state management.
# =============================================================================

terraform {
  # Minimum Terraform version required
  required_version = ">= 1.5.0"

  # Required providers with version constraints
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Azure Storage backend for remote state
  # Configure via -backend-config flag or backend.tfvars file
  # Example: terraform init -backend-config="environments/dev/backend.tfvars"
  backend "azurerm" {
    # These values are provided via -backend-config or backend.tfvars:
    # - resource_group_name  = "rg-terraform-state"
    # - storage_account_name = "roadtriptfstate"
    # - container_name       = "tfstate"
    # - key                  = "dev.terraform.tfstate"
  }
}

# =============================================================================
# Azure Provider Configuration
# =============================================================================

provider "azurerm" {
  features {
    # Key Vault configuration
    key_vault {
      # Purge soft-deleted Key Vaults during destroy
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }

    # Resource Group configuration
    resource_group {
      # Prevent destroy if resources exist (safety)
      prevent_deletion_if_contains_resources = true
    }

    # App Service configuration
    app_configuration {
      purge_soft_delete_on_destroy = true
      recover_soft_deleted         = true
    }

    # Virtual Machine configuration
    virtual_machine {
      delete_os_disk_on_deletion     = true
      graceful_shutdown              = false
      skip_shutdown_and_force_delete = false
    }

    # Log Analytics configuration
    log_analytics_workspace {
      permanently_delete_on_destroy = true
    }

    # PostgreSQL Flexible Server configuration
    postgresql_flexible_server {
      restart_server_on_configuration_value_change = true
    }
  }

  # Target specific Azure subscription
  subscription_id = "1ff037b8-7994-481b-aaae-1d8e1bc9951a"

  # Skip provider registration if it's already registered
  skip_provider_registration = true

  # Storage account settings
  storage_use_azuread = true
}
