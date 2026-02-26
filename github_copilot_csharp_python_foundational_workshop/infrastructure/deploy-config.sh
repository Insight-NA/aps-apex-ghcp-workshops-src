#!/bin/bash
# Azure Deployment Configuration (moved to infrastructure/)
# Review and update these values before deployment

## Azure Resources (configured)
RESOURCE_GROUP=aps-demo-rg
LOCATION=centralus
SUBSCRIPTION=Azure subscription 1

## Resource Names (globally unique - customize if needed)
APP_NAME=roadtrip-api-hl
STATICWEB_NAME=roadtrip-frontend-hl
DB_SERVER_NAME=roadtrip-db-hl
DB_NAME=roadtripdb
KEYVAULT_NAME=kv-roadtrip-hl

## Secrets Required (set as environment variables before running)
# Export these before running deploy-azure.sh:

# Required:
export MAPBOX_TOKEN="pk.eyJ1..."  # Get from https://account.mapbox.com/
export GOOGLE_CLIENT_ID="123456.apps.googleusercontent.com"  # Get from https://console.cloud.google.com/

# Optional:
export GEMINI_API_KEY="AIza..."  # Get from https://makersuite.google.com/

# Database admin password (or will be prompted):
export DB_ADMIN_PASSWORD="YourSecurePassword123!"  # Min 8 chars, uppercase, lowercase, number

## Deployment URLs (after deployment)
BACKEND_URL=https://roadtrip-api-hl.azurewebsites.net
FRONTEND_URL=https://roadtrip-frontend-hl.azurestaticapps.net

## Quick Deploy Commands

# 1. Set your secrets:
source deploy-config.sh  # (after adding your actual values above)

# 2. Run deployment:
./deploy-azure.sh

# 3. Or run step-by-step for testing:
# See AZURE_DEPLOYMENT.md for manual steps
