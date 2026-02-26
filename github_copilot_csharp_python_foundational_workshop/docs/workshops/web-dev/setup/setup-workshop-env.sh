#!/bin/bash

################################################################################
# Workshop Environment Setup Script
# Road Trip Planner - GitHub Copilot Web Development Workshop Series
#
# Description: Automates workshop environment setup including:
#   - Backend/frontend dependency installation
#   - Environment file creation with placeholders
#   - SQLite database initialization with seed data
#   - VS Code settings configuration for Copilot
#
# Usage: ./setup-workshop-env.sh
# Estimated Time: 5-10 minutes
################################################################################

set -e  # Exit on error

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

################################################################################
# Prerequisite Checks
################################################################################

print_section "1. Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Install from: https://nodejs.org (version 18.x or 20.x)"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Install from: https://python.org (version 3.12+)"
    exit 1
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_error "Git not found. Install from: https://git-scm.com"
    exit 1
fi

################################################################################
# Navigate to Project Root
################################################################################

print_section "2. Navigating to Project Root"

# Script is in docs/workshops/web-dev/setup/, navigate to root
cd "$(dirname "$0")/../../../.." || exit 1
PROJECT_ROOT=$(pwd)
print_success "Project root: $PROJECT_ROOT"

################################################################################
# Backend Setup
################################################################################

print_section "3. Setting Up Backend (Python/FastAPI)"

cd "$PROJECT_ROOT/backend" || exit 1

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created: backend/venv"
else
    print_warning "Virtual environment already exists (skipping)"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies (this may take 2-3 minutes)..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
print_success "Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend/.env file..."
    cat > .env << 'EOF'
# Backend Environment Variables (Workshop Configuration)
# WARNING: Replace placeholder values with real tokens for live demos

# Database (SQLite for local workshops)
DATABASE_URL=sqlite:///./trips.db

# Authentication
SECRET_KEY=workshop-demo-secret-key-DO-NOT-USE-IN-PRODUCTION
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# External API Tokens (REQUIRED for routing/AI demos)
MAPBOX_TOKEN=pk.your_mapbox_token_here
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173

# Optional: Azure Maps (for POI search demos)
AZURE_MAPS_KEY=your_azure_maps_key_here
EOF
    print_success "Created backend/.env with placeholder values"
    print_warning "Replace API tokens in backend/.env before live demos"
else
    print_warning "backend/.env already exists (skipping)"
fi

# Initialize database with seed data
echo "Initializing SQLite database with seed data..."
python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '.')

from database import SessionLocal, engine, Base
from models import User, Trip
from datetime import datetime, UTC

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if seed data already exists
existing_trips = db.query(Trip).count()
if existing_trips > 0:
    print("Seed data already exists (skipping)")
    db.close()
    sys.exit(0)

# Create workshop demo user
demo_user = User(
    email="workshop@roadtrip.app",
    google_id="workshop-user-123",
    is_guest=False
)
db.add(demo_user)
db.commit()
db.refresh(demo_user)

# Seed Trip 1: San Francisco to Los Angeles Coastal Drive
trip1 = Trip(
    name="San Francisco to Los Angeles Coastal Drive",
    description="Scenic coastal route through Big Sur and Santa Barbara",
    user_id=demo_user.id,
    is_public=True,
    is_featured=True,
    distance_miles=450,
    image_url="https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800",
    stops=[
        {
            "name": "San Francisco",
            "address": "San Francisco, CA",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "stop_type": "start",
            "order": 0
        },
        {
            "name": "Monterey",
            "address": "Monterey, CA",
            "latitude": 36.6002,
            "longitude": -121.8947,
            "stop_type": "stop",
            "order": 1
        },
        {
            "name": "Big Sur",
            "address": "Big Sur, CA",
            "latitude": 36.2704,
            "longitude": -121.8081,
            "stop_type": "stop",
            "order": 2
        },
        {
            "name": "Santa Barbara",
            "address": "Santa Barbara, CA",
            "latitude": 34.4208,
            "longitude": -119.6982,
            "stop_type": "stop",
            "order": 3
        },
        {
            "name": "Los Angeles",
            "address": "Los Angeles, CA",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "stop_type": "end",
            "order": 4
        }
    ],
    vehicle_specs={
        "vehicle_type": "RV",
        "height_ft": 12.5,
        "width_ft": 8.0,
        "weight_tons": 10.0,
        "fuel_type": "diesel",
        "range": 300,
        "mpg": 8
    }
)
db.add(trip1)

# Seed Trip 2: Pacific Northwest Road Trip
trip2 = Trip(
    name="Pacific Northwest Road Trip",
    description="Explore Oregon's natural beauty from Seattle to Bend",
    user_id=demo_user.id,
    is_public=True,
    is_featured=False,
    distance_miles=380,
    image_url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    stops=[
        {
            "name": "Seattle",
            "address": "Seattle, WA",
            "latitude": 47.6062,
            "longitude": -122.3321,
            "stop_type": "start",
            "order": 0
        },
        {
            "name": "Portland",
            "address": "Portland, OR",
            "latitude": 45.5152,
            "longitude": -122.6784,
            "stop_type": "stop",
            "order": 1
        },
        {
            "name": "Crater Lake National Park",
            "address": "Crater Lake, OR",
            "latitude": 42.8684,
            "longitude": -122.1685,
            "stop_type": "stop",
            "order": 2
        },
        {
            "name": "Bend",
            "address": "Bend, OR",
            "latitude": 44.0582,
            "longitude": -121.3153,
            "stop_type": "end",
            "order": 3
        }
    ],
    vehicle_specs={
        "vehicle_type": "SUV",
        "height_ft": 6.5,
        "width_ft": 6.5,
        "weight_tons": 2.5,
        "fuel_type": "gas",
        "range": 400,
        "mpg": 22
    }
)
db.add(trip2)

# Seed Trip 3: Grand Canyon Explorer
trip3 = Trip(
    name="Grand Canyon Explorer",
    description="Desert adventure from Vegas to Phoenix via Grand Canyon",
    user_id=demo_user.id,
    is_public=False,
    is_featured=False,
    distance_miles=520,
    image_url="https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800",
    stops=[
        {
            "name": "Las Vegas",
            "address": "Las Vegas, NV",
            "latitude": 36.1699,
            "longitude": -115.1398,
            "stop_type": "start",
            "order": 0
        },
        {
            "name": "Hoover Dam",
            "address": "Hoover Dam, NV",
            "latitude": 36.0161,
            "longitude": -114.7377,
            "stop_type": "stop",
            "order": 1
        },
        {
            "name": "Grand Canyon South Rim",
            "address": "Grand Canyon Village, AZ",
            "latitude": 36.0544,
            "longitude": -112.1401,
            "stop_type": "stop",
            "order": 2
        },
        {
            "name": "Sedona",
            "address": "Sedona, AZ",
            "latitude": 34.8697,
            "longitude": -111.7610,
            "stop_type": "stop",
            "order": 3
        },
        {
            "name": "Phoenix",
            "address": "Phoenix, AZ",
            "latitude": 33.4484,
            "longitude": -112.0740,
            "stop_type": "end",
            "order": 4
        }
    ],
    vehicle_specs={
        "vehicle_type": "Truck",
        "height_ft": 7.0,
        "width_ft": 7.0,
        "weight_tons": 3.5,
        "fuel_type": "gas",
        "range": 350,
        "mpg": 18
    }
)
db.add(trip3)

db.commit()
print(f"✓ Created 3 seed trips with {len(trip1.stops) + len(trip2.stops) + len(trip3.stops)} stops")
db.close()
PYTHON_SCRIPT

print_success "Database initialized: backend/trips.db"

deactivate

################################################################################
# Frontend Setup
################################################################################

print_section "4. Setting Up Frontend (React/TypeScript/Vite)"

cd "$PROJECT_ROOT/frontend" || exit 1

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take 3-5 minutes)..."
    npm install > /dev/null 2>&1
    print_success "Frontend dependencies installed"
else
    print_warning "node_modules already exists (skipping npm install)"
fi

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating frontend/.env.local file..."
    cat > .env.local << 'EOF'
# Frontend Environment Variables (Workshop Configuration)
# WARNING: Replace placeholder values with real tokens for live demos

# Backend API URL
VITE_API_URL=http://localhost:8000

# Mapbox Token (public token safe for frontend)
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
EOF
    print_success "Created frontend/.env.local with placeholder values"
    print_warning "Replace tokens in frontend/.env.local before live demos"
else
    print_warning "frontend/.env.local already exists (skipping)"
fi

################################################################################
# VS Code Settings Configuration
################################################################################

print_section "5. Configuring VS Code Settings for Copilot"

cd "$PROJECT_ROOT" || exit 1

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Create settings.json with recommended Copilot configuration
if [ ! -f ".vscode/settings.json" ]; then
    echo "Creating .vscode/settings.json..."
    cat > .vscode/settings.json << 'EOF'
{
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "yaml": true,
    "plaintext": false
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.advanced": {
    "listCount": 10,
    "inlineSuggestCount": 3
  },
  "editor.inlineSuggest.enabled": true,
  "editor.quickSuggestions": {
    "other": true,
    "comments": true,
    "strings": true
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
EOF
    print_success "Created .vscode/settings.json with Copilot configuration"
else
    print_warning ".vscode/settings.json already exists (skipping)"
fi

################################################################################
# Demo Templates Creation
################################################################################

print_section "6. Creating Demo Template Files"

mkdir -p "$PROJECT_ROOT/docs/workshops/web-dev/setup/demo-templates"

# Demo 1: Blank React component for inline suggestions
cat > "$PROJECT_ROOT/docs/workshops/web-dev/setup/demo-templates/demo-01-inline.tsx" << 'EOF'
// Demo 1: Inline Suggestions - Vehicle Type Selector Component
// Instructions: Start typing props interface and let Copilot suggest
import React from 'react';

EOF

# Demo 2: FastAPI endpoint with comment prompt
cat > "$PROJECT_ROOT/docs/workshops/web-dev/setup/demo-templates/demo-02-comment.py" << 'EOF'
# Demo 2: Comment-Based Generation - User Trips Endpoint
# Instructions: Write comment describing endpoint, let Copilot generate

from fastapi import APIRouter

router = APIRouter()

# Create endpoint to fetch all trips for the current authenticated user

EOF

# Demo 3: Coordinate bug for debugging
cat > "$PROJECT_ROOT/docs/workshops/web-dev/setup/demo-templates/demo-03-debug.tsx" << 'EOF'
// Demo 3: Chat Debugging - Map Marker Positioning Bug
// Instructions: Use Copilot Chat to debug why markers appear in wrong location
import { Marker } from 'react-map-gl';

const stops = [
  { name: 'San Francisco', coordinates: [37.7749, -122.4194] },  // BUG: Wrong order!
  { name: 'Los Angeles', coordinates: [34.0522, -118.2437] }
];

export function MapMarkers() {
  return (
    <>
      {stops.map((stop, index) => (
        <Marker key={index} longitude={stop.coordinates[0]} latitude={stop.coordinates[1]}>
          <div className="marker-pin">{stop.name}</div>
        </Marker>
      ))}
    </>
  );
}
EOF

# Demo 4: Environment variables example
cat > "$PROJECT_ROOT/docs/workshops/web-dev/setup/demo-templates/demo-04-proxy.env" << 'EOF'
# Demo 4: API Proxy Security Pattern
# Instructions: Show how backend hides API keys from frontend

# ❌ WRONG: Frontend .env (exposes secret to client)
VITE_MAPBOX_SECRET_TOKEN=sk.secret_key_exposed_in_browser

# ✅ CORRECT: Backend .env (server-side only)
MAPBOX_TOKEN=sk.secret_key_safe_on_server

# ✅ CORRECT: Frontend .env (public token only)
VITE_MAPBOX_TOKEN=pk.public_token_safe_in_browser
EOF

print_success "Created demo template files in setup/demo-templates/"

################################################################################
# Summary
################################################################################

print_section "✓ Workshop Environment Setup Complete!"

echo ""
echo "Summary:"
echo "  • Backend dependencies: ✓ Installed (Python venv created)"
echo "  • Frontend dependencies: ✓ Installed (node_modules created)"
echo "  • Database: ✓ Initialized (3 sample trips, 13 stops)"
echo "  • Environment files: ✓ Created (backend/.env, frontend/.env.local)"
echo "  • VS Code settings: ✓ Configured (.vscode/settings.json)"
echo "  • Demo templates: ✓ Ready (setup/demo-templates/)"
echo ""
echo "Next Steps:"
echo "  1. Replace placeholder API tokens in backend/.env and frontend/.env.local"
echo "  2. Verify GitHub Copilot is activated in VS Code (bottom-right status icon)"
echo "  3. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  4. Start frontend: cd frontend && npm run dev"
echo "  5. Open http://localhost:5173 to verify application works"
echo ""
print_warning "API Tokens Required for Live Demos:"
echo "  • Mapbox Token: https://mapbox.com/signup"
echo "  • Google Client ID: https://console.cloud.google.com"
echo "  • Gemini API Key: https://aistudio.google.com/app/apikey"
echo ""
echo "Ready to start workshops! Proceed to:"
echo "  docs/workshops/web-dev/00-key-definitions-best-practices.md"
echo ""
