# Road Trip Planner - AI Coding Agent Guide

> **📋 ROADMAP FIRST**: Before proposing ANY new tasks or features, read **[ROADMAP.md](../docs/ROADMAP.md)** - it contains the phased development plan with priorities, estimates, and dependencies. DO NOT create duplicate tasks.

> **Complete Documentation**: See [PROJECT_INSTRUCTIONS.md](../docs/PROJECT_INSTRUCTIONS.md) for comprehensive guides.  
> This file is a quick-reference cheat sheet for AI agents focusing on architectural patterns and non-obvious workflows.

## Architecture Overview

This is a **polyglot microservices** road trip planning app with a **Node.js BFF** routing to **Python**, **C#**, and **Java** backends. The app uses **Mapbox** for routing/maps, **Azure Maps** for POI search, and **Azure OpenAI** for AI vehicle spec parsing.

### Service Architecture
| Service | Directory | Technology | Port | Responsibility |
|---------|-----------|-----------|------|----------------|
| **BFF** | `bff/` | Node.js / Express | 3000 | API gateway, request routing, CORS, health aggregation |
| **Python Backend** | `backend/` | FastAPI | 8000 | Trips CRUD, auth (JWT + Google OAuth), vehicle specs fallback |
| **C# Backend** | `backend-csharp/` | ASP.NET Web API (.NET 8) | 8081 | AI vehicle parsing, trip generation (Azure OpenAI) |
| **Java Backend** | `backend-java/` | Spring Boot 3 | 8082 | Geocoding, directions, POI search, route optimization |
| **Database** | — | PostgreSQL 15 | 5432 | Shared relational database |
| **Frontend** | `frontend/` | React + Vite → Nginx | 5173 | SPA with Mapbox GL maps |

### Critical Data Flow (BFF Proxy Pattern)
All frontend requests go through the BFF, which routes to the correct backend:
1. Frontend calls `http://localhost:3000/api/directions` (via BFF)
2. BFF proxies to Java backend at `http://backend-java:8082/api/directions`
3. Java backend proxies to Mapbox API with server-side `MAPBOX_TOKEN`
4. Response flows back: Mapbox → Java → BFF → Frontend
5. Frontend updates `useTripStore.routeGeoJSON` → Map re-renders

**Never** call external APIs directly from frontend components.

### BFF Route Table
| Frontend Path | Backend | Service |
|---|---|---|
| `/api/auth/*` | `backend-python:8000` | Python |
| `/api/trips*` | `backend-python:8000` | Python |
| `/api/public-trips*` | `backend-python:8000` | Python |
| `/api/vehicle-specs` | `backend-python:8000` | Python |
| `/api/v1/parse-vehicle` | `backend-csharp:8081` | C# |
| `/api/v1/generate-trip` | `backend-csharp:8081` | C# |
| `/api/geocode*` | `backend-java:8082` | Java |
| `/api/directions*` | `backend-java:8082` | Java |
| `/api/search*` | `backend-java:8082` | Java |
| `/api/optimize*` | `backend-java:8082` | Java |
| `/health` | BFF (aggregated) | All |

## Code Standards (Strictly Enforced)

### Architecture Adherence (CRITICAL)
**DO NOT override or replace existing technology choices:**
- **Frontend Framework**: React 18+ with TypeScript (NOT Vue, Angular, or plain JS)
- **State Management**: Zustand ONLY (NOT Redux, MobX, or Context API for global state)
- **Routing**: React Router ONLY (already configured - do not replace)
- **Map Library**: React Map GL (Mapbox GL JS wrapper) ONLY (NOT Leaflet, Google Maps, or OpenLayers)
- **Build Tool**: Vite ONLY (NOT Webpack, Parcel, or Create React App)
- **Styling**: Tailwind CSS ONLY (NOT Bootstrap, Material-UI, or CSS Modules)
- **HTTP Client**: Axios via `axiosInstance` (with auth interceptors) — do NOT use raw `fetch` or raw `axios`
- **BFF**: Node.js with Express (NOT Fastify, Koa, or Hapi)
- **Python Backend**: FastAPI ONLY (NOT Flask, Django, or Express)
- **C# Backend**: ASP.NET Web API (.NET 8) (NOT Minimal API, gRPC-only, or older .NET)
- **Java Backend**: Spring Boot 3 ONLY (NOT Quarkus, Micronaut, or Jakarta EE)
- **ORM**: SQLAlchemy ONLY in Python (NOT Django ORM, Prisma, or raw SQL)
- **Database**: PostgreSQL (shared across all services)
- **Authentication**: Custom JWT with `python-jose` + Google OAuth (in Python backend)
- **AI Provider**: Azure OpenAI (in C# backend, NOT Google Gemini)
- **Container Orchestration**: Docker Compose for local dev

**Before adding ANY new library:**
1. Check if existing libraries can solve the problem
2. Verify it doesn't conflict with the established stack
3. Get explicit user approval for new dependencies

### No Hardcoded Strings (STRICTLY ENFORCED)
**All literal strings must be externalized** - never embed raw strings directly in code:

**URLs & Endpoints:**
```typescript
// ❌ WRONG - hardcoded URL
fetch('https://api.mapbox.com/directions/v5/mapbox/driving');

// ✅ CORRECT - use environment variable or constant
fetch(`${import.meta.env.VITE_API_URL}/api/directions`);
```

**Error Messages & User-Facing Text:**
```typescript
// ❌ WRONG - inline string
throw new Error('Trip not found');

// ✅ CORRECT - use constants file
// src/constants/errors.ts
export const ERROR_MESSAGES = {
  TRIP_NOT_FOUND: 'Trip not found',
  UNAUTHORIZED: 'Please sign in to continue',
} as const;

throw new Error(ERROR_MESSAGES.TRIP_NOT_FOUND);
```

**Magic Strings (Status, Types, Keys):**
```typescript
// ❌ WRONG - magic string
if (stop.type === 'start') { }

// ✅ CORRECT - use enum or const object
// src/constants/index.ts
export const STOP_TYPES = {
  START: 'start',
  END: 'end',
  WAYPOINT: 'stop',
} as const;

if (stop.type === STOP_TYPES.START) { }
```

**Required Constants Files:**
- `frontend/src/constants/index.ts` - App-wide constants (stop types, status codes)
- `frontend/src/constants/errors.ts` - Error messages
- `frontend/src/constants/routes.ts` - Route paths (`/itinerary`, `/explore`)
- `frontend/src/constants/api.ts` - API endpoint paths
- `backend/constants.py` - Python constants (create if missing)

**Exceptions (strings allowed inline):**
- Log messages for debugging: `console.log('Debug: calculating route')`
- Test assertions: `expect(result).toBe('expected value')`
- One-time object keys in data transformations

### TypeScript
- **No `any` types allowed** - all props/state must have interfaces
- **No hardcoded strings** - use constants files (see above)
- Component props: Define `interface ComponentProps` above component
- API responses: Use typed interfaces in `src/types/` (create if missing)
- State: All Zustand store slices must be typed (see `TripState` in `useTripStore.ts`)
- **Component Structure**: Follow existing functional component patterns (no class components)

### Python
- **Pydantic models for all API schemas** (see `backend/schemas.py`)
- **No hardcoded strings** - use constants module:
```python
# ❌ WRONG - hardcoded strings
raise HTTPException(status_code=404, detail="Trip not found")
if vehicle_type == "rv":

# ✅ CORRECT - use constants
# backend/constants.py
class ErrorMessages:
    TRIP_NOT_FOUND = "Trip not found"
    UNAUTHORIZED = "Authentication required"

class VehicleTypes:
    RV = "rv"
    TRUCK = "truck"
    CAR = "car"

raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
if vehicle_type == VehicleTypes.RV:
```
- Business logic belongs in `backend/*_service.py`, NOT in `main.py` route handlers
- Use `HTTPException` with clear status codes (not generic `Exception`)
- **File Structure**: Keep `main.py` under 400 lines - extract to service modules if growing

### Terraform (Infrastructure as Code)
- **JSON-driven configuration**: All environment configs use `*.tfvars.json` format (NOT HCL `.tfvars`)
- **Module-first architecture**: Extend modules in `infrastructure/terraform/modules/` - never inline resources in root
- **Required module files**: Every module must have `main.tf`, `variables.tf`, `outputs.tf`
- **Variable validation**: All variables require `description` and `validation` blocks for enums
- **Secrets via environment**: Use `TF_VAR_*` environment variables - NEVER commit secrets to tfvars
- **Conditional resources**: Use `count` parameter for optional resources (e.g., VNet only in prod)
- **Reference configs**: See `infrastructure/terraform/environments/dev.tfvars.json` for canonical pattern
- **Full documentation**: See `infrastructure/terraform/README.md` for complete Terraform guide

### State Management Pattern
- **Global state (Zustand)**: Trip data, route, vehicle specs, user session
- **Local state (useState)**: Form inputs before save, UI toggles (modals, sidebars)
- **Never** store API responses in local state - always go through Zustand
- **Do NOT** introduce Redux, MobX, Recoil, or Jotai - Zustand is the chosen solution

## Testing Strategy (TDD Mandate)

**Write tests BEFORE implementation** - see `PROJECT_INSTRUCTIONS.md#testing-strategy` for full details.

### Frontend (Vitest - Currently Not Configured)
```bash
cd frontend
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
```
- **Mock Zustand**: See [useTripStore.test.ts](../frontend/src/test/useTripStore.test.ts) for pattern
- **Component Tests**: Use `@testing-library/react` (installed)
- **Never** test implementation details - focus on user behavior

### Backend Testing (Pytest)
```bash
cd backend
pytest tests/ -v                              # All tests with verbose
pytest tests/test_main.py::test_health_check  # Specific test
pytest --cov=. --cov-report=html              # Coverage report
```
- **Critical**: Mock external APIs (Mapbox/Gemini/Azure Maps) - Issue #4 in ROADMAP
- CI pipeline has `continueOnError: true` because tests hit real APIs (security issue)
- Use `TestClient` for endpoint tests: `client.get("/health")`

## 🛠️ Development Workflows

### Local Development (Docker — preferred)
```bash
# Start all services (postgres, bff, python, csharp, java, frontend)
docker-compose up --build

# Frontend:  http://localhost:5173
# BFF:       http://localhost:3000
# Python:    http://localhost:8000
# C#:        http://localhost:8081
# Java:      http://localhost:8082
# PostgreSQL: localhost:5432
```

### Local Development (Non-Docker)
```bash
# Terminal 1 - Backend (port 8000)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 - Frontend (port 5173)
cd frontend
npm install
npm run dev

# Terminal 3 - BFF (port 3000)
cd bff
npm install
npm run dev

# Terminal 4 - C# backend (port 8081)
cd backend-csharp
dotnet run

# Terminal 5 - Java backend (port 8082)
cd backend-java
./mvnw spring-boot:run
```

### Environment Variables
- **Local Dev**: Create `.env` in **project root** (NOT in backend/ or frontend/)
- **Docker**: Reads from root `.env` via docker-compose.yml
- **Backend**: Reads via `os.getenv("MAPBOX_TOKEN")` with `python-dotenv`
- **Frontend**: Reads `import.meta.env.VITE_MAPBOX_TOKEN` (Vite requires `VITE_` prefix)
- **Azure Production**: All secrets in Key Vault, referenced as `@Microsoft.KeyVault(SecretUri=...)`
- **Security Issue #3**: docker-compose.yml has hardcoded token - remove before production

### Database Dual-Mode (Critical Pattern)
```python
# backend/database.py lines 6-17
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./trips.db"  # Local dev default (non-Docker)
)
# Docker mode: DATABASE_URL=postgresql://roadtrip:roadtrip_dev@postgres:5432/roadtrip
```

### Alembic Migrations (PostgreSQL Only)
```bash
cd backend
alembic revision --autogenerate -m "Add route_geojson column"
alembic upgrade head  # Apply to current DATABASE_URL
# SQLite auto-creates tables via models.Base.metadata.create_all() in main.py
```
**Key Files**: 
- Models: [backend/models.py](../backend/models.py) (SQLAlchemy - database schema)
- Schemas: [backend/schemas.py](../backend/schemas.py) (Pydantic - API validation)
- Migrations: [backend/alembic/versions/](../backend/alembic/versions/)

## 🎨 Component Patterns

### Map Integration (React Map GL)
```tsx
// Always use useTripStore for map data
const { stops, routeGeoJSON } = useTripStore();

// Auto-fit bounds pattern (see MapComponent.tsx lines 14-40)
useEffect(() => {
  if (!mapRef.current) return;
  const bounds = new mapboxgl.LngLatBounds();
  routeGeoJSON.coordinates.forEach(coord => bounds.extend(coord));
  mapRef.current.fitBounds(bounds, { padding: 50 });
}, [routeGeoJSON]);
```

### Zustand Store Updates
```typescript
// ❌ WRONG - mutating state directly
useTripStore.getState().stops.push(newStop);

// ✅ CORRECT - immutable update
addStop: (stop) => set((state) => ({ stops: [...state.stops, stop] }))
```

### Authentication Flow
1. Frontend initiates Google OAuth (`@react-oauth/google`)
2. Google returns JWT → Frontend sends to `/auth/google` endpoint
3. Backend (`auth.py`) validates with Google, creates/fetches User in DB
4. Backend returns custom JWT (using `python-jose`)
5. Frontend stores token, includes in `Authorization: Bearer <token>` headers
6. Protected routes use `get_current_user` dependency (see `main.py` line 28)

## ☁️ Azure Deployment (Production)

### Quick Deploy
```bash
# One-time setup (creates all Azure resources)
./infrastructure/deploy-azure.sh

# Redeploy after code changes
cd backend && zip -r ../backend-deploy.zip . -x "venv/*" -x "__pycache__/*"
az webapp deploy --resource-group aps-demo-rg --name roadtrip-api-hl --src-path backend-deploy.zip

cd frontend && npm run build
az staticwebapp deploy --name roadtrip-frontend-hl --app-location ./dist
```

### Key Configuration
- **CORS**: Backend allows origins from `ALLOWED_ORIGINS` env var (comma-separated)
- **Database URL**: Auto-switches based on `DATABASE_URL` env var (see `database.py`)
- **Health Checks**: `/health` (basic) and `/api/health` (with DB check) for Azure probes

- **GitHub Actions**: `.github/workflows/backend.yml` and `frontend.yml`
- **Azure DevOps**: `azure-pipelines.yml`
- Both auto-deploy on push to `main` branch

## � CI/CD Pipeline Standards

### Pipeline Code Organization
```yaml
# ❌ NO: Inline scripts in pipeline YAML
- name: Deploy Backend
  run: |
    cd backend
    zip -r ../backend-deploy.zip . -x "venv/*"
    az webapp deploy --name ${{ vars.APP_NAME }}
    # ... 50 more lines of bash

# ✅ YES: Call external script files
- name: Deploy Backend
  run: ./infrastructure/deploy-backend.sh
  env:
    APP_NAME: ${{ vars.APP_NAME }}
    RESOURCE_GROUP: ${{ vars.RESOURCE_GROUP }}
```

**Rules**:
- **NO inline code** in `.github/workflows/*.yml` or `azure-pipelines.yml`
- All logic must be in script files: `infrastructure/*.sh` (bash) or `infrastructure/*.ps1` (PowerShell)
- Pipeline YAML only for: job/step definitions, environment variables, conditionals
- Benefits: Scripts are testable locally, version-controlled, reusable across CI/CD platforms

### Deployment Script Standards
```bash
# ✅ All deployment scripts must support local execution
./infrastructure/deploy-azure.sh         # Full Azure deployment
./infrastructure/deploy-backend.sh       # Backend only
./infrastructure/deploy-frontend.sh      # Frontend only
./infrastructure/deploy-ai-service.sh    # AI service only

# Scripts must:
# 1. Accept environment variables OR CLI arguments
# 2. Validate required inputs (fail fast with clear error messages)
# 3. Support dry-run mode: ./deploy-azure.sh --dry-run
# 4. Output detailed logs for debugging
# 5. Be idempotent (safe to run multiple times)
```

**Example Script Structure**:
```bash
#!/bin/bash
set -e  # Exit on error

# Validate required environment variables
: "${RESOURCE_GROUP:?RESOURCE_GROUP must be set}"
: "${APP_NAME:?APP_NAME must be set}"

# Support CLI arguments (override env vars)
while [[ $# -gt 0 ]]; do
  case $1 in
    --resource-group) RESOURCE_GROUP="$2"; shift 2 ;;
    --app-name) APP_NAME="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Main deployment logic
if [ "$DRY_RUN" = true ]; then
  echo "DRY RUN: Would deploy to $APP_NAME in $RESOURCE_GROUP"
  exit 0
fi

echo "Deploying backend to $APP_NAME..."
# Actual deployment commands
```

### Local Testing Before CI/CD
```bash
# Always test scripts locally before pushing
export RESOURCE_GROUP="rg-roadtrip-dev"
export APP_NAME="roadtrip-api-dev"
./infrastructure/deploy-backend.sh --dry-run  # Validate
./infrastructure/deploy-backend.sh            # Deploy
```

## 🚨 Common Pitfalls

1. **Replacing existing architecture**: NEVER swap out React, Zustand, FastAPI, SQLAlchemy, React Map GL, or Tailwind CSS
2. **Forgetting to proxy external APIs**: Always route Mapbox/Gemini through backend
3. **Using `any` in TypeScript**: Breaks type safety - use `unknown` if truly dynamic
4. **Hardcoded strings in code**: Use constants files - NEVER inline URLs, error messages, or magic strings
5. **Storing derived state in Zustand**: Calculate on-the-fly (e.g., total distance from `routeLegs`)
6. **Direct DB queries in route handlers**: Use service layer pattern
7. **Hardcoding API tokens**: Use environment variables + `.env` files (never commit!)
8. **Adding conflicting libraries**: Check existing stack before proposing new dependencies
9. **Bypassing established patterns**: All components must follow existing architectural conventions
10. **Inline pipeline code**: Extract all logic to script files in `infrastructure/` directory
11. **Non-local-testable deployments**: All deployment scripts must run locally with CLI arguments
12. **Using HCL tfvars for environments**: Always use JSON format (`*.tfvars.json`) for CI/CD compatibility
13. **Hardcoding secrets in Terraform**: Use `TF_VAR_*` environment variables, never commit passwords to tfvars files

## 📁 File Organization Conventions

### Frontend
- `src/components/`: Reusable UI components (prefer functional components)
- `src/views/`: Page-level components (routes)
- `src/store/`: Zustand stores (one store per domain, e.g., `useTripStore`, `useAuthStore`)
- `src/types/`: Shared TypeScript interfaces
- **DO NOT** create Redux stores, MobX stores, or Context providers for global state

### Backend (Python — Trips & Auth)
- `backend/main.py`: Route definitions only (keep under 400 lines)
- `backend/*_service.py`: Business logic (e.g., `ai_service.py` for C# service calls)
- `backend/models.py`: SQLAlchemy ORM models (DB schema)
- `backend/schemas.py`: Pydantic models (API request/response validation)
- **DO NOT** create Flask blueprints, Django views, or Express routers

### Backend (C# — AI Service)
- `backend-csharp/Controllers/`: ASP.NET API controllers
- `backend-csharp/Models/`: Request/response DTOs
- `backend-csharp/Services/`: Business logic (Azure OpenAI integration)
- **DO NOT** mix with Python backend code

### Backend (Java — Geospatial)
- `backend-java/src/main/java/com/roadtrip/geospatial/controller/`: REST controllers
- `backend-java/src/main/java/com/roadtrip/geospatial/service/`: Business logic (Mapbox, Azure Maps proxies)
- `backend-java/src/main/java/com/roadtrip/geospatial/dto/`: Data transfer objects
- **DO NOT** add trip/auth logic here — those belong in the Python backend

### BFF (Node.js — API Gateway)
- `bff/src/routes/`: Proxy route definitions and health checks
- `bff/src/middleware/`: Cross-cutting concerns (request ID, error handling)
- **DO NOT** add business logic — the BFF is a thin routing layer only

## 🎯 Project-Specific Conventions

- **GeoJSON First**: All map data uses standard GeoJSON format for Mapbox compatibility
- **Coordinates Format**: Always `[longitude, latitude]` (GeoJSON spec) - NOT `[lat, lng]`
- **Stop Types**: Enum values `'start' | 'end' | 'stop'` (TypeScript union type)
- **Vehicle Specs**: Metric units in backend (meters, tonnes), imperial in UI (feet, tons)
- **Database IDs**: SQLAlchemy auto-increments primary keys, frontend uses UUIDs for temp stops
