# Playwright Workshop: Setup Instructions

**Workshop**: Foundational Playwright Testing with GitHub Copilot  
**Estimated Setup Time**: 15–20 minutes  
**Prerequisites**: General project setup from `docs/workshops/web-dev/setup/00-setup-instructions.md`

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [VS Code Extensions](#vs-code-extensions)
3. [Project Setup](#project-setup)
4. [Install Playwright Browsers](#install-playwright-browsers)
5. [Start the Docker Compose Stack](#start-the-docker-compose-stack)
6. [Verify Playwright Runs](#verify-playwright-runs)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| **Node.js** | 18.x or later | `node --version` |
| **npm** | 9.x or later | `npm --version` |
| **Docker Desktop** | 4.x (with Compose v2) | `docker --version` |
| **Git** | 2.30+ | `git --version` |
| **VS Code** | 1.95+ | `code --version` |

> **Note**: Playwright requires Docker Desktop to be running for browser downloads and the application stack. Ensure Docker has at least **4 GB of RAM** allocated (Settings → Resources → Memory).

---

## VS Code Extensions

### Required

| Extension | ID | Purpose |
|-----------|----|---------|
| **GitHub Copilot** | `github.copilot` | AI inline suggestions |
| **GitHub Copilot Chat** | `github.copilot-chat` | AI chat, debugging, CORE prompts |
| **Playwright Test for VS Code** | `ms-playwright.playwright` | Test explorer, codegen, trace viewer |

### Recommended

| Extension | ID | Purpose |
|-----------|----|---------|
| **ESLint** | `dbaeumer.vscode-eslint` | Linting for test files |
| **TypeScript Importer** | `pmneo.tsimporter` | Auto-import for POM classes |

### Install Extensions

```bash
# Install all required extensions at once
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension ms-playwright.playwright
```

### Verify Copilot is Active

1. Open VS Code
2. Look for the Copilot icon (sparkle) in the bottom-right status bar
3. Click it — it should show **"GitHub Copilot: Ready"**
4. If it shows "Disabled", click to enable for this workspace

---

## Project Setup

If you haven't already cloned and set up the Road Trip Planner project:

```bash
# Clone the repository
git clone <repository-url> road_trip_app
cd road_trip_app

# Install frontend dependencies (includes Playwright)
cd frontend
npm install
```

If you've already completed the web-dev workshop setup, skip to the next section.

---

## Install Playwright Browsers

Playwright needs browser binaries installed locally. This downloads Chromium, Firefox, and WebKit:

```bash
cd frontend
npx playwright install

# Install system dependencies (Linux/CI only — not needed on Windows/macOS)
# npx playwright install-deps
```

**Expected output**:
```
Downloading Chromium 131.0.6778.33 ...
Downloading Firefox 132.0 ...
Downloading Webkit 18.2 ...
```

### Verify Browser Installation

```bash
npx playwright --version
# Expected: Version 1.57.0 or later
```

---

## Start the Docker Compose Stack

The Playwright tests run against the full application stack. Start all services:

```bash
# From project root (c:\code\road_trip_app)
cd ..
docker-compose up --build -d
```

### Wait for Services to Be Healthy

```bash
# Check all services are running
docker-compose ps

# Expected: All services "Up" or "healthy"
# ┌──────────────────┬─────────┬──────────┐
# │ Service          │ Status  │ Port     │
# ├──────────────────┼─────────┼──────────┤
# │ frontend         │ Up      │ 5173     │
# │ bff              │ Up      │ 3000     │
# │ backend-python   │ Up      │ 8000     │
# │ backend-csharp   │ Up      │ 8081     │
# │ backend-java     │ Up      │ 8082     │
# │ postgres         │ Up      │ 5432     │
# └──────────────────┴─────────┴──────────┘
```

### Quick Health Check

```bash
# BFF aggregated health (checks all backends)
curl http://localhost:3000/health

# Frontend loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Expected: 200
```

---

## Verify Playwright Runs

Run the existing smoke tests to confirm everything is wired up:

```bash
cd frontend

# Run smoke tests only (fastest verification)
npm run test:e2e:smoke

# Expected output:
#   Running 8 tests using 4 workers
#   ✓ SM-01: App loads and redirects root to /explore
#   ✓ SM-02: Sidebar navigation items render
#   ...
#   8 passed
```

### Alternative: Run with Visible Browser

```bash
# See the browser open and tests execute
npm run test:e2e:headed

# Or use the interactive UI mode (recommended for learning)
npm run test:e2e:ui
```

### VS Code Test Explorer

1. Open the **Testing** sidebar panel (beaker icon, or `Ctrl+Shift+T`)
2. You should see the Playwright test tree with `smoke/` and `navigation/` folders
3. Click the green play button on any test to run it
4. Click the debug icon to step through with breakpoints

---

## Environment Variables

Playwright tests use these environment variables (all have sensible defaults):

| Variable | Default | Purpose |
|----------|---------|---------|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | Frontend URL for `page.goto()` |
| `PLAYWRIGHT_BFF_URL` | `http://localhost:3000` | BFF URL for API tests |
| `CI` | *(not set)* | When set, enables retries and JUnit reporter |

These are configured in `frontend/playwright.config.ts`. You typically don't need to change them for local development.

### Optional: Create a `.env` for Playwright

If your Docker stack runs on non-default ports:

```bash
# frontend/.env (optional, only if ports differ)
PLAYWRIGHT_BASE_URL=http://localhost:5173
PLAYWRIGHT_BFF_URL=http://localhost:3000
```

---

## Troubleshooting

### "Browser not found" Error

```bash
# Re-install browsers
npx playwright install

# On Linux, install system dependencies
npx playwright install-deps
```

### Tests Fail with "Connection Refused"

The Docker Compose stack isn't running or hasn't finished starting:

```bash
# Check services
docker-compose ps

# Restart if needed
docker-compose down && docker-compose up --build -d

# Wait 30 seconds for all services to initialize, then retry
npm run test:e2e:smoke
```

### "Timeout 30000ms Exceeded"

The application is slow to load (common on first run when building images):

```bash
# Run with extended timeout
npx playwright test --timeout=60000

# Or run just one test to verify
npx playwright test app-loads --project=chromium
```

### Copilot Not Suggesting in `.spec.ts` Files

1. Ensure the Playwright Test extension is installed (it provides TypeScript context for test files)
2. Open `frontend/e2e/tests/smoke/app-loads.spec.ts` — Copilot should see the `@playwright/test` imports
3. Check `.github/copilot-instructions.md` is loaded (Copilot icon → "Repository instructions loaded")

### Port Conflicts

If ports 5173, 3000, 8000, 8081, or 8082 are in use:

```bash
# Windows: Find process using port
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

---

## Workshop Files Reference

After setup, your workshop-relevant files are:

```
frontend/
├── playwright.config.ts          ← Test configuration (5 browser projects)
├── e2e/
│   ├── global-setup.ts           ← Auth caching (runs once before all tests)
│   ├── global-teardown.ts        ← Test data cleanup
│   ├── fixtures/
│   │   ├── auth.fixture.ts       ← Authenticated page fixture
│   │   └── base.fixture.ts       ← Page Object Model fixtures
│   ├── helpers/
│   │   ├── selectors.ts          ← Centralized locator constants
│   │   ├── test-data.ts          ← Reusable test data (coordinates, queries, timeouts)
│   │   └── api-helpers.ts        ← Direct API calls for setup/teardown
│   ├── pages/
│   │   ├── BasePage.ts           ← Shared navigation, toast, map, auth helpers
│   │   ├── ExplorePage.ts        ← /explore view interactions
│   │   ├── ItineraryPage.ts      ← /itinerary view interactions
│   │   ├── TripsPage.ts          ← /trips view interactions
│   │   ├── StartTripPage.ts      ← /start view interactions
│   │   ├── AllTripsPage.ts       ← /all-trips view interactions
│   │   └── components/
│   │       ├── Sidebar.ts        ← Desktop sidebar navigation
│   │       ├── MapComponent.ts   ← Map canvas and markers
│   │       └── AuthStatus.ts     ← Login status display
│   └── tests/
│       ├── smoke/
│       │   └── app-loads.spec.ts ← SM-01..SM-08 (8 tests, all passing)
│       └── navigation/
│           └── sidebar-nav.spec.ts ← NAV-01..NAV-02 (7 tests, all passing)
```

---

## Ready to Go?

✅ Node.js 18+ installed  
✅ Playwright browsers downloaded (`npx playwright install`)  
✅ Docker Compose stack running (`docker-compose up --build -d`)  
✅ Smoke tests pass (`npm run test:e2e:smoke`)  
✅ VS Code has Copilot + Playwright extensions  
✅ Test Explorer shows tests in sidebar  

**Next**: Open `docs/workshops/playwright/01-foundational-playwright.md` and begin the workshop.
