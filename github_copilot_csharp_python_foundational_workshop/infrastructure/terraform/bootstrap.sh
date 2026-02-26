#!/bin/bash
# =============================================================================
# Bootstrap Script for Terraform State Backend
# =============================================================================
# This script creates the Azure Storage Account and Container required for
# Terraform remote state management. Run this once before initializing Terraform.
#
# Usage:
#   ./bootstrap.sh [--location <region>] [--resource-group <name>] [--storage-account <name>]
#
# Requirements:
#   - Azure CLI installed and authenticated (az login)
#   - Contributor access to the target subscription
#
# =============================================================================

set -euo pipefail

# Default configuration
LOCATION="${TERRAFORM_STATE_LOCATION:-centralus}"
RESOURCE_GROUP_NAME="${TERRAFORM_STATE_RG:-rg-terraform-state}"
STORAGE_ACCOUNT_NAME="${TERRAFORM_STATE_SA:-roadtriptfstate}"
CONTAINER_NAME="${TERRAFORM_STATE_CONTAINER:-tfstate}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --location)
            LOCATION="$2"
            shift 2
            ;;
        --resource-group)
            RESOURCE_GROUP_NAME="$2"
            shift 2
            ;;
        --storage-account)
            STORAGE_ACCOUNT_NAME="$2"
            shift 2
            ;;
        --container)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --location         Azure region (default: centralus)"
            echo "  --resource-group   Resource group name (default: rg-terraform-state)"
            echo "  --storage-account  Storage account name (default: roadtriptfstate)"
            echo "  --container        Container name (default: tfstate)"
            echo ""
            echo "Environment variables:"
            echo "  TERRAFORM_STATE_LOCATION   Override default location"
            echo "  TERRAFORM_STATE_RG         Override default resource group"
            echo "  TERRAFORM_STATE_SA         Override default storage account"
            echo "  TERRAFORM_STATE_CONTAINER  Override default container"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Display configuration
echo ""
echo "=============================================="
echo "  Terraform State Backend Bootstrap"
echo "=============================================="
echo ""
log_info "Configuration:"
log_info "  Location:         ${LOCATION}"
log_info "  Resource Group:   ${RESOURCE_GROUP_NAME}"
log_info "  Storage Account:  ${STORAGE_ACCOUNT_NAME}"
log_info "  Container:        ${CONTAINER_NAME}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed. Please install it first:"
    echo "  macOS:   brew install azure-cli"
    echo "  Windows: winget install Microsoft.AzureCLI"
    echo "  Linux:   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    exit 1
fi

# Check if logged into Azure
log_info "Checking Azure CLI authentication..."
if ! az account show &> /dev/null; then
    log_error "Not logged into Azure. Please run: az login"
    exit 1
fi

# Get current subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_success "Authenticated to subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})"

# Check if resource group exists
log_info "Checking if resource group '${RESOURCE_GROUP_NAME}' exists..."
if az group show --name "${RESOURCE_GROUP_NAME}" &> /dev/null; then
    log_warning "Resource group '${RESOURCE_GROUP_NAME}' already exists"
else
    log_info "Creating resource group '${RESOURCE_GROUP_NAME}' in '${LOCATION}'..."
    az group create \
        --name "${RESOURCE_GROUP_NAME}" \
        --location "${LOCATION}" \
        --tags "Purpose=TerraformState" "ManagedBy=Bootstrap" "CreatedDate=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --output none
    log_success "Resource group created successfully"
fi

# Check if storage account exists
log_info "Checking if storage account '${STORAGE_ACCOUNT_NAME}' exists..."
if az storage account show --name "${STORAGE_ACCOUNT_NAME}" --resource-group "${RESOURCE_GROUP_NAME}" &> /dev/null; then
    log_warning "Storage account '${STORAGE_ACCOUNT_NAME}' already exists"
else
    log_info "Creating storage account '${STORAGE_ACCOUNT_NAME}'..."
    
    # Check if storage account name is available
    NAME_AVAILABLE=$(az storage account check-name --name "${STORAGE_ACCOUNT_NAME}" --query nameAvailable -o tsv)
    if [ "${NAME_AVAILABLE}" != "true" ]; then
        log_error "Storage account name '${STORAGE_ACCOUNT_NAME}' is not available"
        log_info "Storage account names must be globally unique and between 3-24 characters"
        log_info "Try a different name with: ./bootstrap.sh --storage-account <unique-name>"
        exit 1
    fi
    
    az storage account create \
        --name "${STORAGE_ACCOUNT_NAME}" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --location "${LOCATION}" \
        --sku "Standard_LRS" \
        --kind "StorageV2" \
        --access-tier "Hot" \
        --min-tls-version "TLS1_2" \
        --allow-blob-public-access false \
        --https-only true \
        --tags "Purpose=TerraformState" "ManagedBy=Bootstrap" "CreatedDate=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --output none
    log_success "Storage account created successfully"
fi

# Enable versioning for state file protection
log_info "Enabling blob versioning for state file protection..."
az storage account blob-service-properties update \
    --account-name "${STORAGE_ACCOUNT_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --enable-versioning true \
    --output none
log_success "Blob versioning enabled"

# Enable soft delete for additional protection
log_info "Enabling soft delete for blob protection..."
az storage account blob-service-properties update \
    --account-name "${STORAGE_ACCOUNT_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --enable-delete-retention true \
    --delete-retention-days 30 \
    --enable-container-delete-retention true \
    --container-delete-retention-days 30 \
    --output none
log_success "Soft delete enabled (30-day retention)"

# Get storage account key
log_info "Retrieving storage account key..."
STORAGE_KEY=$(az storage account keys list \
    --account-name "${STORAGE_ACCOUNT_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --query "[0].value" -o tsv)

# Create blob container
log_info "Checking if container '${CONTAINER_NAME}' exists..."
if az storage container show --name "${CONTAINER_NAME}" --account-name "${STORAGE_ACCOUNT_NAME}" --account-key "${STORAGE_KEY}" &> /dev/null; then
    log_warning "Container '${CONTAINER_NAME}' already exists"
else
    log_info "Creating container '${CONTAINER_NAME}'..."
    az storage container create \
        --name "${CONTAINER_NAME}" \
        --account-name "${STORAGE_ACCOUNT_NAME}" \
        --account-key "${STORAGE_KEY}" \
        --output none
    log_success "Container created successfully"
fi

# Add resource lock to prevent accidental deletion
log_info "Adding delete lock to resource group..."
if az lock show --name "DoNotDelete" --resource-group "${RESOURCE_GROUP_NAME}" &> /dev/null; then
    log_warning "Delete lock already exists"
else
    az lock create \
        --name "DoNotDelete" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --lock-type CanNotDelete \
        --notes "Protects Terraform state backend from accidental deletion" \
        --output none
    log_success "Delete lock added to resource group"
fi

# Output summary
echo ""
echo "=============================================="
echo "  Bootstrap Complete!"
echo "=============================================="
echo ""
log_success "Terraform state backend is ready"
echo ""
echo "Backend Configuration for terraform init:"
echo "----------------------------------------"
echo "  resource_group_name  = \"${RESOURCE_GROUP_NAME}\""
echo "  storage_account_name = \"${STORAGE_ACCOUNT_NAME}\""
echo "  container_name       = \"${CONTAINER_NAME}\""
echo ""
echo "Initialize Terraform with:"
echo "----------------------------------------"
echo "  # Development environment"
echo "  terraform init -backend-config=\"environments/dev/backend.tfvars\""
echo ""
echo "  # Or with inline config"
echo "  terraform init \\"
echo "    -backend-config=\"resource_group_name=${RESOURCE_GROUP_NAME}\" \\"
echo "    -backend-config=\"storage_account_name=${STORAGE_ACCOUNT_NAME}\" \\"
echo "    -backend-config=\"container_name=${CONTAINER_NAME}\" \\"
echo "    -backend-config=\"key=dev.terraform.tfstate\""
echo ""
echo "Azure Portal:"
echo "  https://portal.azure.com/#@/resource/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP_NAME}"
echo ""

# Save configuration to a local file for reference
cat > .backend-config <<EOF
# Backend configuration generated by bootstrap.sh
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

resource_group_name  = "${RESOURCE_GROUP_NAME}"
storage_account_name = "${STORAGE_ACCOUNT_NAME}"
container_name       = "${CONTAINER_NAME}"
subscription_id      = "${SUBSCRIPTION_ID}"
EOF

log_success "Configuration saved to .backend-config"
