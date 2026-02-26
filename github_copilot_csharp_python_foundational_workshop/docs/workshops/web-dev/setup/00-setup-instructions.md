# Workshop Environment Setup Instructions

**Last Updated**: January 20, 2026  
**Estimated Setup Time**: 15-20 minutes

## Prerequisites

### Required Skills
- **Frontend**: React fundamentals, TypeScript basics, component patterns
- **Backend**: Python basics, REST API concepts, async/await patterns
- **Tools**: Git, command line, VS Code familiarity
- **Web Development**: HTTP methods, JSON, environment variables

### Required Software

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | 18.x or 20.x | `brew install node` (Mac) or [nodejs.org](https://nodejs.org) |
| **Python** | 3.12+ | `brew install python@3.12` (Mac) or [python.org](https://python.org) |
| **Git** | 2.x+ | Pre-installed on Mac, or [git-scm.com](https://git-scm.com) |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com) |
| **Azure CLI** | 2.50+ | `brew install azure-cli` (Mac) or [docs.microsoft.com](https://docs.microsoft.com/cli/azure/install-azure-cli) |

### Required VS Code Extensions

**GitHub Copilot Suite** (CRITICAL):
1. **GitHub Copilot** (`GitHub.copilot`)
   - AI pair programmer for inline code suggestions
   - Install: VS Code Extensions → Search "GitHub Copilot" → Install
   - Requires: Active GitHub Copilot subscription

2. **GitHub Copilot Chat** (`GitHub.copilot-chat`)
   - AI chat interface for questions, debugging, refactoring
   - Install: VS Code Extensions → Search "GitHub Copilot Chat" → Install
   - Automatically installed with GitHub Copilot

**Recommended Extensions**:
- **ESLint** (`dbaeumer.vscode-eslint`) - JavaScript/TypeScript linting
- **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- **Python** (`ms-python.python`) - Python IntelliSense
- **Pylance** (`ms-python.vscode-pylance`) - Fast Python language server
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Tailwind class autocomplete

**Verify GitHub Copilot Activation**:
```bash
# Open VS Code, then:
# 1. Press Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)
# 2. Type "GitHub Copilot: Sign In"
# 3. Authenticate with GitHub account
# 4. Verify status bar shows "Copilot" icon (bottom right)
```

---

## Workshop Repository Setup

### Step 1: Clone Repository

```bash
# Clone the Road Trip Planner repository
git clone https://github.com/hlucianojr1/road_trip_app.git
cd road_trip_app

# Verify you're on the correct branch
git branch
# Should show: * main (or ui_updates)
```

### Step 2: Run Automated Setup Script

```bash
# Navigate to workshop setup directory
cd docs/workshops/web-dev/setup

# Make script executable
chmod +x setup-workshop-env.sh

# Run setup script (installs dependencies, creates .env files, seeds database)
./setup-workshop-env.sh

# Expected output:
# ✓ Backend dependencies installed (Python venv created)
# ✓ Frontend dependencies installed (node_modules created)
# ✓ Environment files created (.env templates with placeholders)
# ✓ SQLite database initialized with seed data
# ✓ VS Code settings configured for Copilot
# ✓ Workshop environment ready!
```

### Step 3: Verify Setup

```bash
# Return to project root
cd ../../../..

# Test backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -c "import fastapi; print('✓ Backend dependencies OK')"
deactivate

# Test frontend
cd ../frontend
npm run typecheck  # Should complete without errors
echo "✓ Frontend dependencies OK"

# Verify database
cd ../backend
ls trips.db  # Should exist (SQLite database file)
```

---

## Workshop Environment Configuration

### Backend Environment Variables

**File**: `backend/.env`

The setup script creates this file with placeholder values. **For live demos, you'll need real API tokens**:

```bash
# Database (SQLite for workshops)
DATABASE_URL=sqlite:///./trips.db

# Authentication (use test credentials for workshops)
SECRET_KEY=workshop-demo-secret-key-DO-NOT-USE-IN-PRODUCTION
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# External API Tokens (REQUIRED for routing/AI demos)
MAPBOX_TOKEN=pk.your_mapbox_token_here
GEMINI_API_KEY=your_gemini_api_key_here

# CORS (allow local frontend)
ALLOWED_ORIGINS=http://localhost:5173

# Optional: Azure Maps (for POI search demos)
AZURE_MAPS_KEY=your_azure_maps_key_here
```

**Where to Get API Tokens** (for instructors):
- **Mapbox**: Sign up at [mapbox.com/signup](https://www.mapbox.com/signup) → Copy public token from dashboard
- **Google Client ID**: [console.cloud.google.com](https://console.cloud.google.com) → Create OAuth 2.0 credentials
- **Gemini API**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) → Create API key (free tier available)

### Frontend Environment Variables

**File**: `frontend/.env.local`

```bash
# Backend API URL
VITE_API_URL=http://localhost:8000

# Mapbox Token (public token safe for frontend)
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### VS Code Settings (Auto-configured)

The setup script creates `.vscode/settings.json` with recommended Copilot settings:

```json
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
  }
}
```

---

## Seed Data Overview

The setup script populates the SQLite database with realistic sample data for workshop demos:

### Sample Trips (3 trips)

1. **"San Francisco to Los Angeles Coastal Drive"**
   - 5 stops: SF → Monterey → Big Sur → Santa Barbara → LA
   - Vehicle: RV (Class A)
   - Distance: ~450 miles
   - Is Public: Yes

2. **"Pacific Northwest Road Trip"**
   - 4 stops: Seattle → Portland → Crater Lake → Bend
   - Vehicle: SUV
   - Distance: ~380 miles
   - Is Public: Yes

3. **"Grand Canyon Explorer"**
   - 6 stops: Las Vegas → Hoover Dam → Grand Canyon South Rim → Sedona → Phoenix
   - Vehicle: Truck (Pickup)
   - Distance: ~520 miles
   - Is Public: No (private trip)

### Coordinate Format (CRITICAL)

All coordinates use **GeoJSON format**: `[longitude, latitude]`

```javascript
// ✅ CORRECT (GeoJSON)
const sanFrancisco = [-122.4194, 37.7749];  // [lng, lat]

// ❌ WRONG (Common mistake)
const sanFrancisco = [37.7749, -122.4194];  // [lat, lng] - DON'T USE
```

**Why this matters**: Mapbox GL JS and all GeoJSON specs use `[lng, lat]` order, not `[lat, lng]` like Google Maps. This is a common bug demonstrated in Workshop 1 (Foundational).

---

## Running the Application Locally

### Terminal 1: Backend API (Port 8000)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete.
```

**Test backend**: Open [http://localhost:8000/health](http://localhost:8000/health) → Should return `{"status": "healthy"}`

### Terminal 2: Frontend Dev Server (Port 5173)

```bash
cd frontend
npm run dev

# Expected output:
# VITE v5.x ready in XXX ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**Test frontend**: Open [http://localhost:5173](http://localhost:5173) → Should show Road Trip Planner start page

---

## Workshop Demo Preparation

### Before Each Demo

Instructors should:

1. **Close All Files**: `Cmd+K W` (Mac) / `Ctrl+K W` (Windows) to close all open files
2. **Clear Terminal**: `Cmd+K` or type `clear`
3. **Refresh VS Code**: `Cmd+R` (Mac) / `Ctrl+R` (Windows) to reload window
4. **Verify Copilot Status**: Check bottom-right corner shows Copilot icon ✓

### Demo File Templates

The `setup/demo-templates/` directory contains clean starting files for each demo:

```
setup/demo-templates/
├── demo-01-inline.tsx        # Blank component for inline suggestion demo
├── demo-02-comment.py        # Starter endpoint with comment prompt
├── demo-03-debug.tsx         # Intentional coordinate bug for debugging
├── demo-04-proxy.env         # Example .env showing proxy pattern
└── README.md                 # Instructions for using templates
```

**Usage**: Copy template to working directory before each demo to ensure clean starting state.

---

## Troubleshooting

### Issue: GitHub Copilot Not Activated

**Symptoms**: No inline suggestions, no Copilot icon in status bar

**Solution**:
1. Press `Cmd+Shift+P` → "GitHub Copilot: Sign In"
2. Authenticate with GitHub account
3. Verify subscription at [github.com/settings/copilot](https://github.com/settings/copilot)
4. Reload VS Code window: `Cmd+R` (Mac) / `Ctrl+R` (Windows)

### Issue: Backend Won't Start (Port 8000 in Use)

**Symptoms**: `OSError: [Errno 48] Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn main:app --reload --port 8001
```

### Issue: Frontend Build Fails (TypeScript Errors)

**Symptoms**: `npm run dev` shows type errors

**Solution**:
```bash
cd frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify TypeScript config
npm run typecheck
```

### Issue: Database Not Found

**Symptoms**: `sqlalchemy.exc.OperationalError: no such table: users`

**Solution**:
```bash
cd backend
rm trips.db  # Remove old database

# Rerun setup script to recreate
cd ../docs/workshops/web-dev/setup
./setup-workshop-env.sh
```

### Issue: Mapbox Map Not Rendering

**Symptoms**: Blank gray box instead of map

**Solution**:
1. Verify `VITE_MAPBOX_TOKEN` in `frontend/.env.local`
2. Check token is valid at [mapbox.com/account/access-tokens](https://www.mapbox.com/account/access-tokens)
3. Ensure token starts with `pk.` (public token)
4. Check browser console for errors (F12 → Console tab)

---

## Workshop Materials Checklist

Before starting workshops, instructors should have:

- [ ] VS Code installed with GitHub Copilot activated
- [ ] Repository cloned and setup script executed successfully
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Valid API tokens in `.env` files (Mapbox, Google Client ID)
- [ ] Seed data loaded (3 sample trips visible in database)
- [ ] Demo templates copied to working directory
- [ ] Workshop markdown files reviewed (01-foundational through 04-expert)
- [ ] Screen sharing tested (if remote workshop)
- [ ] Backup plan if live coding fails (code snippets ready)

---

## Additional Resources

### Project Documentation
- **Comprehensive Guide**: `docs/PROJECT_INSTRUCTIONS.md` (1,800+ lines)
- **Development Roadmap**: `ROADMAP.md` (28 issues, 5 milestones)
- **Architecture Decisions**: `docs/adr/001-bff-architecture-strategy.md`
- **Copilot Instructions**: `.github/copilot-instructions.md` (740+ lines)

### Workshop Series
- **Foundational**: `01-foundational-web-dev.md` - Inline suggestions, comment generation
- **Intermediate**: `02-intermediate-web-dev.md` - Prompting, refactoring, state management
- **Advanced**: `03-advanced-web-dev.md` - Chain-of-thought, agents, TDD workflow
- **Expert**: `04-expert-web-dev.md` - MCP servers, custom agents, Spec Kit

### External Documentation
- **GitHub Copilot Docs**: [docs.github.com/copilot](https://docs.github.com/en/copilot)
- **Mapbox API**: [docs.mapbox.com](https://docs.mapbox.com/)
- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)
- **React**: [react.dev](https://react.dev/)
- **Zustand**: [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)

---

**Next Steps**: Proceed to `00-key-definitions-best-practices.md` for foundational concepts before starting Workshop 1.
