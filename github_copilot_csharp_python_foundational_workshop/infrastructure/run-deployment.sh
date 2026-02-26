#!/bin/bash
# Deployment wrapper - loads environment variables from .env
# SECURITY: Never commit API keys to version control!

# Check if .env file exists
if [ ! -f ../.env ] && [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file from .env.example template"
    echo "  cp .env.example .env"
    echo "  # Then edit .env with your actual values"
    exit 1
fi

# Load environment variables from .env (prefer repo root)
set -a
if [ -f ../.env ]; then
  source ../.env
else
  source .env
fi
set +a

# Validate required variables
if [ -z "$MAPBOX_TOKEN" ] || [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$DB_ADMIN_PASSWORD" ]; then
    echo "ERROR: Required environment variables not set in .env"
    echo "Required: MAPBOX_TOKEN, GOOGLE_CLIENT_ID, DB_ADMIN_PASSWORD"
    exit 1
fi

# Run the deployment (script in same folder)
./deploy-azure.sh
