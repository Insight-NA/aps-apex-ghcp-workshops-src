# Road Trip Planner — Copilot Instructions Hub

> **📋 ROADMAP FIRST**: Before proposing ANY new tasks or features, read [ROADMAP.md](../docs/ROADMAP.md). DO NOT create duplicate tasks.

> **Complete Documentation**: See [PROJECT_INSTRUCTIONS.md](../docs/PROJECT_INSTRUCTIONS.md) for comprehensive guides.

---

## Sub-Instructions Index

Copilot automatically loads the instruction file that matches the file you are editing.
These files are scoped via `applyTo` glob patterns — no manual action needed.

| File | Applies to | Topic |
|---|---|---|
| [react.instructions.md](instructions/react.instructions.md) | `frontend/**/*.{ts,tsx}` | React, TypeScript, Zustand, Tailwind, Map GL |
| [python.instructions.md](instructions/python.instructions.md) | `backend/**/*.py` | FastAPI, SQLAlchemy, Pydantic, auth |
| [java.instructions.md](instructions/java.instructions.md) | `backend-java/**/*.java` | Spring Boot 3, Mapbox/Azure Maps proxy |
| [csharp.instructions.md](instructions/csharp.instructions.md) | `backend-csharp/**/*.cs` | ASP.NET Web API, Azure OpenAI |
| [bff.instructions.md](instructions/bff.instructions.md) | `bff/**/*.{ts,js}` | Node.js Express API gateway |
| [terraform.instructions.md](instructions/terraform.instructions.md) | `infrastructure/**/*.tf` | Terraform modules, tfvars.json, secrets |
| [testing.instructions.md](instructions/testing.instructions.md) | `**/*.test.*`, `**/tests/**` | Vitest, Pytest, JUnit 5, xUnit |
| [playwright.instructions.md](instructions/playwright.instructions.md) | `frontend/e2e/**/*.ts`, `playwright.config.ts` | Playwright E2E, POM, fixtures, selectors, auth |
| [cicd.instructions.md](instructions/cicd.instructions.md) | `**/*.yml`, `infrastructure/*.sh` | Pipeline YAML, deployment scripts |

---

## Architecture Overview

**Polyglot microservices** road trip planning app. A **Node.js BFF** routes all frontend traffic to specialist backends.

### Service Map
| Service | Directory | Technology | Port | Responsibility |
|---------|-----------|-----------|------|----------------|
| **BFF** | `bff/` | Node.js / Express | 3000 | API gateway, routing, CORS, health aggregation |
| **Python** | `backend/` | FastAPI | 8000 | Trips CRUD, auth (JWT + Google OAuth) |
| **C#** | `backend-csharp/` | ASP.NET Web API (.NET 8) | 8081 | AI vehicle parsing, trip generation (Azure OpenAI) |
| **Java** | `backend-java/` | Spring Boot 3 | 8082 | Geocoding, directions, POI search, route optimisation |
| **Database** | — | PostgreSQL 15 | 5432 | Shared relational database |
| **Frontend** | `frontend/` | React + Vite → Nginx | 5173 | SPA with Mapbox GL maps |

### Critical Data Flow (BFF Proxy Pattern)
```
Frontend → BFF (3000) → Java backend (8082) → Mapbox API
                      → Python backend (8000)
                      → C# backend (8081) → Azure OpenAI
```
**NEVER** call Mapbox, Azure Maps, or Azure OpenAI directly from the frontend.

### BFF Route Table
| Frontend Path | Forwards to |
|---|---|
| `/api/auth/*`, `/api/trips*`, `/api/public-trips*`, `/api/vehicle-specs` | `backend-python:8000` |
| `/api/v1/parse-vehicle`, `/api/v1/generate-trip` | `backend-csharp:8081` |
| `/api/geocode*`, `/api/directions*`, `/api/search*`, `/api/optimize*` | `backend-java:8082` |
| `/health` | BFF (aggregated) |

---

## Universal Rules (Apply to Every File)

### 1 — Never Hardcode Secrets or Strings
- **Secrets**: Always environment variables — never in source files or committed configs
- **URLs & endpoints**: Environment variables (`VITE_API_URL`, `MAPBOX_TOKEN`, etc.)
- **Magic strings / enums**: Constants files per service — see sub-instructions for examples
- **Exceptions allowed**: debug `console.log`, test assertions, one-time data-transformation keys

### 2 — Lock-In Technology Choices
**Do not swap any of these without explicit user approval:**

| Concern | Required choice |
|---|---|
| Frontend framework | React 18+ with TypeScript |
| State management | Zustand |
| Routing | React Router |
| Map library | React Map GL (Mapbox GL JS wrapper) |
| Build tool | Vite |
| Styling | Tailwind CSS |
| HTTP client | `axiosInstance` (never raw axios/fetch) |
| BFF | Node.js + Express |
| Python backend | FastAPI + SQLAlchemy |
| C# backend | ASP.NET Web API (.NET 8) |
| Java backend | Spring Boot 3 |
| Database | PostgreSQL |
| Auth | `python-jose` + Google OAuth |
| AI provider | Azure OpenAI (C# backend) |

### 3 — Service Layer: Keep Route Handlers Thin
Business logic belongs in `*_service` files/classes — never inline in route handlers or controllers.

### 4 — TDD Mandate
Write the test first. See [testing.instructions.md](instructions/testing.instructions.md) and never hit real external APIs in tests.

---

## Development Workflows

### Docker (Preferred)
```bash
docker-compose up --build
# Frontend: http://localhost:5173 | BFF: http://localhost:3000
# Python:   http://localhost:8000 | C#: http://localhost:8081
# Java:     http://localhost:8082 | DB: localhost:5432
```

### Non-Docker
```bash
# Terminal 1 — Python backend
cd backend && python -m venv venv && .\venv\Scripts\Activate.ps1
pip install -r requirements.txt && uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev

# Terminal 3 — BFF
cd bff && npm install && npm run dev

# Terminal 4 — C# backend
cd backend-csharp && dotnet run

# Terminal 5 — Java backend
cd backend-java && ./mvnw spring-boot:run
```

### Environment Variables
- `.env` in **project root** (not in subdirectories)
- Docker reads root `.env` via `docker-compose.yml`
- Frontend: `VITE_` prefix required for Vite
- Production: Azure Key Vault via `@Microsoft.KeyVault(SecretUri=...)`

### Database Dual-Mode
```python
# backend/database.py
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trips.db")
# Docker: DATABASE_URL=postgresql://roadtrip:roadtrip_dev@postgres:5432/roadtrip
```
Migrations (PostgreSQL only): `alembic revision --autogenerate -m "..."` then `alembic upgrade head`

---

## Azure Deployment

```bash
./infrastructure/deploy-azure.sh          # Full one-time setup

# Backend redeploy
cd backend && zip -r ../backend-deploy.zip . -x "venv/*" -x "__pycache__/*"
az webapp deploy --resource-group aps-demo-rg --name roadtrip-api-hl --src-path backend-deploy.zip

# Frontend redeploy
cd frontend && npm run build
az staticwebapp deploy --name roadtrip-frontend-hl --app-location ./dist
```
- CI/CD via GitHub Actions (`.github/workflows/`) and Azure DevOps (`azure-pipelines.yml`)
- See [cicd.instructions.md](instructions/cicd.instructions.md) for pipeline and script standards

---

## Common Pitfalls

1. **Swapping architecture choices** — never replace React, Zustand, FastAPI, SQLAlchemy, etc.
2. **Calling external APIs from frontend** — always proxy through BFF then backend
3. **`any` in TypeScript** — use `unknown` if truly dynamic
4. **Hardcoded strings** — use constants/env vars in every layer
5. **Derived state in Zustand** — calculate on-the-fly (e.g. total distance from `routeLegs`)
6. **DB queries in route handlers** — delegate to service layer
7. **Inline code in pipeline YAML** — extract to `infrastructure/*.sh` or `infrastructure/*.ps1`
8. **HCL `.tfvars` for environments** — always use `*.tfvars.json`
9. **Secrets committed to tfvars** — use `TF_VAR_*` env vars

---

## Project-Specific Conventions

- **GeoJSON First** — all map data uses standard GeoJSON for Mapbox compatibility
- **Coordinate order** — `[longitude, latitude]` (GeoJSON spec) — never `[lat, lng]`
- **Stop types** — `'start' | 'end' | 'stop'` (TypeScript union, defined in `src/constants/index.ts`)
- **Units** — metric in backend (metres, tonnes), imperial in UI (feet, tons)
- **IDs** — SQLAlchemy auto-increment PKs for DB; UUIDs for frontend temporary stops
