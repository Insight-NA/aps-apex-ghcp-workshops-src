# Road Trip Planner - Development Roadmap

**Last Updated**: February 25, 2026  
**Status**: Polyglot microservices rearchitecture in progress  
**Total Effort**: 135-186 hours across 8 phases  
**Architecture**: Node.js BFF → Python + C# + Java backends (Docker-first)

---

## 📋 Quick Overview

This roadmap reorganizes the project around a **polyglot microservices architecture** with a Node.js BFF (Backend-for-Frontend) API gateway routing to Python (trips/auth), C# (AI/vehicle parsing), and Java (geospatial) backend services. All services run in Docker Compose locally. Infrastructure/cloud deployment is deferred to the final phase.

> **For AI Agents**: This is the **single source of truth** for project planning. Do NOT create duplicate issues. Always reference this roadmap before proposing new tasks.

### ✅ Recent Completions
- **Issue #4** (Jan 21, 2026): Backend API mocking - 10 JSON fixtures, 10 new tests, CI hardened
- **Issue #1** (Dec 6, 2025): Frontend Testing Infrastructure
- **Issue #21** (Dec 6, 2025): BFF Architecture Research
- **Phase 0** (Feb 25, 2026): Go ai-service removed, replaced by C# ASP.NET Web API scaffold
- **Phase 1** (Feb 25, 2026): Docker Compose rewritten with all 6 services (postgres, bff, python, csharp, java, frontend)
- **Phase 2** (Feb 25, 2026): BFF Docker build verified (npm install + TypeScript compilation)
- **Phase 3** (Feb 25, 2026): C# build verified (dotnet build + fallback mode tested + Docker build)
- **Phase 4** (Feb 25, 2026): Java Docker build verified (Maven package + Spring Boot JAR)

### Architecture Decision Summary
| Decision | Choice | Rationale |
|----------|--------|-----------|
| BFF Technology | Node.js (Express) | Lightweight gateway, strong proxy ecosystem |
| AI Service | C# ASP.NET Web API | Replaces Go, Azure OpenAI SDK support |
| Geospatial Service | Java Spring Boot | Enterprise-grade, WebClient for proxy calls |
| Trips/Auth | Python FastAPI | Existing codebase, minimal migration |
| Database | Shared PostgreSQL | Simplest for local Docker dev |
| API Gateway Pattern | Separate BFF service | Clean separation from business logic |

---

## 🎯 Phases

| Phase | Effort | Description | Priority | Status |
|-------|--------|-------------|----------|--------|
| [Phase 0: Cleanup](#phase-0-cleanup) | 1-2 hrs | Remove Go ai-service | Critical | ✅ **DONE** |
| [Phase 1: Docker-First Setup](#phase-1-docker-first-local-development) | 4-6 hrs | Docker Compose with all services | Critical | ✅ **DONE** |
| [Phase 2: Node.js BFF](#phase-2-nodejs-bff-service) | 8-12 hrs | API gateway routing layer | Critical | 🟡 Build Verified |
| [Phase 3: C# AI Service](#phase-3-c-aspnet-web-api--ai-service) | 12-16 hrs | Vehicle parsing + trip generation | High | 🟡 Build Verified |
| [Phase 4: Java Geospatial](#phase-4-java-spring-boot--geospatial-services) | 16-20 hrs | Geocode, directions, search, optimize | High | 🟡 Build Verified |
| [Phase 5: Frontend Integration](#phase-5-frontend-bff-integration) | 6-8 hrs | Wire frontend to BFF, standardize API calls | High | 🔴 Not started |
| [Phase 6: Code Quality](#phase-6-code-quality--testing) | 10-14 hrs | TypeScript fixes, token cleanup, tests | Medium | 🔴 Not started |
| [Phase 7: Features](#phase-7-feature-enhancement) | 20-30 hrs | Vehicle routing, AI trips, accessibility | Medium | 🔴 Not started |
| [Phase 8: Infrastructure](#phase-8-infrastructure--deployment) | 58-78 hrs | Terraform, CI/CD, Azure deployment | Low | 🔴 Not started |

---

## Phase 0: Cleanup

**Effort**: 1-2 hours | **Status**: ✅ **COMPLETED** (Feb 25, 2026)

Remove the Go ai-service and prepare the codebase for polyglot architecture.

### Completed Work
- [x] Deleted `ai-service/` directory (Go project: main.go, handlers/, go.mod, Dockerfile)
- [x] Updated `backend/ai_service.py` — now points to C# service at `http://backend-csharp:8081`
- [x] Removed `infrastructure/deploy-ai-service.sh`
- [x] Go service endpoints (`/api/v1/parse-vehicle`, `/api/v1/generate-trip`) will be reimplemented in C#

---

## Phase 1: Docker-First Local Development

**Effort**: 4-6 hours | **Status**: ✅ **COMPLETED** (Feb 25, 2026)

Full Docker Compose stack with all services, PostgreSQL database, and service networking.

### Completed Work
- [x] Rewrote `docker-compose.yml` with 6 services: postgres, bff, backend-python, backend-csharp, backend-java, frontend
- [x] Added PostgreSQL 15 container with health checks and persistent volume
- [x] Frontend `VITE_API_URL` now points to BFF (`http://localhost:3000`) instead of Python backend
- [x] Updated `.env.example` with all service environment variables
- [x] Service networking: frontend → BFF → (Python|C#|Java) → PostgreSQL

### Service Architecture (Docker Compose)

| Service | Port | Technology | Responsibility |
|---------|------|------------|----------------|
| `postgres` | 5432 | PostgreSQL 15 | Shared database |
| `bff` | 3000 | Node.js/Express | API gateway/routing |
| `backend-python` | 8000 | Python/FastAPI | Trips CRUD, Auth, Vehicle fallback |
| `backend-csharp` | 8081 | C#/ASP.NET 8 | AI vehicle parsing, trip generation |
| `backend-java` | 8082 | Java/Spring Boot 3 | Geocode, directions, search, optimize |
| `frontend` | 5173 | React/Vite → Nginx | SPA served via Nginx |

### Verification
```bash
docker-compose up --build
# All services should start and respond to /health
curl http://localhost:3000/health    # BFF aggregated health
curl http://localhost:8000/health    # Python
curl http://localhost:8081/health    # C#
curl http://localhost:8082/health    # Java (via actuator)
```

---

## Phase 2: Node.js BFF Service

**Effort**: 8-12 hours | **Status**: � Integration Tested (all proxy routes verified via Docker Compose)

Lightweight Express API gateway that routes frontend requests to the correct backend.

### Project Structure: `bff/`
```
bff/
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts              # Express app entry point
    ├── middleware/
    │   ├── requestId.ts      # X-Request-ID propagation
    │   └── errorHandler.ts   # Uniform error responses
    └── routes/
        ├── health.ts         # Aggregated health checks
        └── proxy.ts          # Route table (path → backend)
```

### Route Table

| Frontend Path | Backend | Service |
|---|---|---|
| `/api/auth/*` | `http://backend-python:8000` | Python |
| `/api/trips*` | `http://backend-python:8000` | Python |
| `/api/public-trips*` | `http://backend-python:8000` | Python |
| `/api/vehicle-specs` | `http://backend-python:8000` | Python |
| `/api/v1/parse-vehicle` | `http://backend-csharp:8081` | C# |
| `/api/v1/generate-trip` | `http://backend-csharp:8081` | C# |
| `/api/geocode*` | `http://backend-java:8082` | Java |
| `/api/directions*` | `http://backend-java:8082` | Java |
| `/api/search*` | `http://backend-java:8082` | Java |
| `/api/optimize*` | `http://backend-java:8082` | Java |
| `/health` | BFF (aggregated) | All |

### Remaining Work
- [x] Run `npm install` to generate `package-lock.json` ✅ (Feb 25, 2026 — via Docker build)
- [x] Verify TypeScript compilation (`npm run build`) ✅ (Feb 25, 2026 — via Docker build)
- [x] Test proxy routing with live backends ✅ (Feb 25, 2026 — 18/18 integration tests pass)
- [ ] Add request logging with correlation IDs
- [ ] Add circuit breaker pattern for backend failures
- [ ] Write Jest tests for routing logic
- [x] Verify Docker build succeeds ✅ (Feb 25, 2026)

### Acceptance Criteria
- [x] `curl http://localhost:3000/health` returns aggregated health from all backends ✅ (Feb 25, 2026)
- [x] `curl http://localhost:3000/api/trips` proxies to Python backend ✅ (Feb 25, 2026 — public-trips verified)
- [x] `curl http://localhost:3000/api/geocode?q=Denver` proxies to Java backend ✅ (Feb 25, 2026 — 500 from missing API key, proxy works)
- [x] `curl -X POST http://localhost:3000/api/v1/parse-vehicle` proxies to C# backend ✅ (Feb 25, 2026)
- [ ] Authorization headers forwarded to all backends
- [ ] X-Request-ID generated and propagated
- [ ] 502 returned with uniform error body when backend is down

---

## Phase 3: C# ASP.NET Web API — AI Service

**Effort**: 12-16 hours | **Status**: 🟡 Build Verified (fallback tested, needs Azure OpenAI + xUnit tests)

Replaces the Go ai-service with a fully implemented C# service. The Go service returned hardcoded mocks — this service actually parses AI responses.

### Project Structure: `backend-csharp/`
```
backend-csharp/
├── Dockerfile                    # Multi-stage .NET 8 build
├── RoadTrip.AiService.csproj
├── Program.cs                    # App configuration
├── appsettings.json
├── README.md
├── Controllers/
│   └── VehicleController.cs      # /api/v1/parse-vehicle, /api/v1/generate-trip
├── Models/
│   └── AiModels.cs               # VehicleSpecs, request/response DTOs
└── Services/
    ├── IAiParsingService.cs      # Interface
    └── AiParsingService.cs       # Azure OpenAI + rule-based fallback
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/parse-vehicle` | Parse vehicle description → structured specs |
| POST | `/api/v1/generate-trip` | Generate trip suggestions via AI |
| GET | `/health` | Health check (ASP.NET health checks middleware) |

### Key Improvements Over Go Service
1. **Actually parses AI responses** — Go version logged the response but returned hardcoded mocks
2. **Trip generation implemented** — Go version was a stub returning hardcoded suggestions
3. **Graceful fallback** — When Azure OpenAI is not configured, uses rule-based parsing (RV, truck, SUV, van, car)
4. **Swagger UI** — Built-in API documentation at `/swagger`

### Remaining Work
- [x] Run `dotnet restore` and verify build ✅ (Feb 25, 2026 — `dotnet build` succeeded)
- [ ] Test with Azure OpenAI credentials (set env vars)
- [x] Test fallback mode (no Azure OpenAI configured) ✅ (Feb 25, 2026 — truck, RV, car, trip gen all work)
- [ ] Add input validation (description length limits)
- [ ] Add structured logging (ILogger)
- [ ] Create xUnit test project with mocked Azure OpenAI client
- [x] Verify Docker multi-stage build succeeds ✅ (Feb 25, 2026)
- [x] Integration test: BFF → C# service → response ✅ (Feb 25, 2026 — truck, RV, sedan, trip gen all pass through BFF)

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | No* | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | No* | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | No* | Model deployment name |
| `PORT` | No | Listen port (default: 8081) |

*When not configured, uses rule-based fallback.

---

## Phase 4: Java Spring Boot — Geospatial Services

**Effort**: 16-20 hours | **Status**: 🟡 Build Verified (Docker build passes, needs endpoint testing with real API keys)

Migrates geospatial proxy endpoints from the Python backend to Java Spring Boot. These endpoints proxy to external APIs (Mapbox, Azure Maps) with server-side API key management.

### Project Structure: `backend-java/`
```
backend-java/
├── Dockerfile                    # Multi-stage JDK 21 build
├── pom.xml                       # Spring Boot 3.3 + WebFlux
├── mvnw                          # Maven wrapper
├── README.md
└── src/main/java/com/roadtrip/geospatial/
    ├── GeospatialApplication.java
    ├── config/
    │   ├── CorsConfig.java
    │   └── WebClientConfig.java
    ├── controller/
    │   ├── GeospatialController.java   # All 4 endpoints
    │   └── HealthController.java
    ├── dto/
    │   ├── GeocodeResponse.java
    │   ├── DirectionsResponse.java
    │   └── SearchResponse.java
    └── service/
        ├── MapboxService.java          # Geocode, directions, optimize
        └── AzureMapsService.java       # POI fuzzy search
```

### Endpoints (ported from Python `backend/main.py`)

| Method | Path | External API | Python Source |
|--------|------|-------------|--------------|
| GET | `/api/geocode?q=` | Mapbox Geocoding | `main.py:241` |
| GET | `/api/directions?coords=&profile=` | Mapbox Directions | `main.py:268` |
| GET | `/api/search?query=&proximity=` | Azure Maps Fuzzy | `main.py:298` |
| GET | `/api/optimize?coords=` | Mapbox Optimization | `main.py:362` |
| GET | `/health` | — | — |

### Response Format Compatibility
The Java service returns **identical JSON shapes** to the Python backend to ensure frontend compatibility:
- Geocode: `{"coordinates": [lng, lat], "placeName": "..."}` (Note: Java uses camelCase by default — verify `place_name` vs `placeName` compatibility)
- Directions: `{"distance": N, "duration": N, "geometry": {...}, "legs": [...]}`
- Search: `{"features": [{"id", "type", "text", "place_name", "geometry"}]}` — transformed from Azure Maps format to Mapbox-compatible GeoJSON
- Optimize: passthrough of Mapbox response

### Remaining Work
- [ ] Generate proper Maven wrapper (`mvn wrapper:wrapper`) — current mvnw is simplified
- [x] Run `./mvnw package` and verify build ✅ (Feb 25, 2026 — via Docker build)
- [ ] Test each endpoint with real Mapbox/Azure Maps keys
- [ ] Verify response JSON format matches Python backend exactly (snake_case vs camelCase)
- [ ] Add Jackson configuration for snake_case JSON if needed
- [ ] Add error handling for API key not configured
- [ ] Create JUnit tests with MockWebServer
- [ ] **Remove migrated endpoints from Python `backend/main.py`** — geocode, directions, search, optimize
- [x] Verify Docker multi-stage build succeeds ✅ (Feb 25, 2026)
- [x] Integration test: BFF → Java service → response ✅ (Feb 25, 2026 — proxy verified, 500 expected without API keys)

### Post-Migration: Python Backend Cleanup
After Java service is verified, remove these functions from `backend/main.py`:
- `geocode_address()` (line 241)
- `get_directions()` (line 268)
- `search_places()` (line 298)
- `optimize_route()` (line 362)

This will reduce `main.py` from ~448 lines to ~280 lines.

---

## Phase 5: Frontend BFF Integration

**Effort**: 6-8 hours | **Status**: 🔴 Not started

Wire the React frontend to use the BFF as its single API endpoint. Standardize HTTP client usage.

### Changes Required

#### 1. VITE_API_URL Change (already done in docker-compose)
Frontend now points to `http://localhost:3000` (BFF) instead of `http://localhost:8000` (Python).
No code changes needed — all `import.meta.env.VITE_API_URL` references automatically resolve.

#### 2. Standardize HTTP Client (Issue from research)
Currently two patterns coexist — some files use `axiosInstance` (with auth interceptors), others use raw `axios`:

**Files using raw `axios` (need migration to `axiosInstance`):**
- `frontend/src/components/FloatingPanel.tsx` — 10 raw axios calls
- `frontend/src/views/TripsView.tsx` — 2 raw axios calls
- `frontend/src/views/AllTripsView.tsx` — 1 raw axios call
- `frontend/src/views/ExploreView.tsx` — 3 raw axios calls

#### 3. Create Constants Files (per coding standards)
- [ ] `frontend/src/constants/api.ts` — endpoint paths
- [ ] `frontend/src/constants/errors.ts` — error messages
- [ ] `frontend/src/constants/routes.ts` — route paths

### Acceptance Criteria
- [ ] All frontend API calls use `axiosInstance` from `utils/axios.ts`
- [ ] No raw `axios.get/post` calls remain in component files
- [ ] Constants files created per copilot-instructions.md standards
- [ ] Frontend loads at `http://localhost:5173` with all features working through BFF
- [ ] Auth flow works: login → token stored → subsequent calls authenticated

---

## Phase 6: Code Quality & Testing

**Effort**: 10-14 hours | **Status**: 🔴 Not started

Carry-forward issues from the original roadmap focused on code quality.

### Issue #2: Fix TypeScript `any` Violations
- **Estimate**: 8-10 hours
- **Problem**: 20 instances of `any` type across frontend components
- **Acceptance Criteria**:
  - [ ] Create `frontend/src/types/` directory with proper interfaces
  - [ ] Replace all 20 `any` types with typed interfaces
  - [ ] Enable `"strict": true` in tsconfig.json
  - [ ] Zero TypeScript errors in build

### Issue #3: Remove Hardcoded API Tokens ⚠️ SECURITY
- **Estimate**: 2 hours
- **Problem**: Tokens still potentially hardcoded in config files
- **Acceptance Criteria**:
  - [ ] Audit all services for hardcoded secrets
  - [ ] All tokens read from environment variables only
  - [ ] `.env.example` files document all required vars

### Issue #5: Store Route GeoJSON in Database
- **Estimate**: 3-4 hours
- **Problem**: Saved trips lose route geometry on reload
- **Acceptance Criteria**:
  - [ ] Add `route_geojson` column to Trip model
  - [ ] Create Alembic migration
  - [ ] Frontend saves/restores route with trip

### Issue #20: Extract Duplicate Code
- **Estimate**: 6-8 hours
- **Problem**: Default image logic, token retrieval duplicated across components
- **Acceptance Criteria**:
  - [ ] Create shared utility functions
  - [ ] Replace all duplicated code
  - [ ] Write unit tests for utilities

---

## Phase 7: Feature Enhancement

**Effort**: 20-30 hours | **Status**: 🔴 Not started

Feature development leveraging the new polyglot architecture.

### Issue #6: Vehicle-Aware Routing
- **Estimate**: 6-8 hours
- **Flow**: Frontend → BFF → Java (directions with truck profile) + C# (vehicle specs)
- **Dependencies**: Phase 4 (Java geospatial service)

### Issue #10: JWT Refresh Token Flow
- **Estimate**: 6-8 hours
- **Flow**: Frontend → BFF → Python (auth service)
- **Acceptance Criteria**: Auto-refresh, token rotation, secure cookie storage

### Issue #14: AI Trip Generation
- **Estimate**: 12-16 hours
- **Flow**: Frontend → BFF → C# (Azure OpenAI trip generation)
- **Note**: Originally planned for Gemini, now uses Azure OpenAI via C# service
- **Dependencies**: Phase 3 (C# AI service)

### Issue #7: WCAG AA Accessibility
- **Estimate**: 10-12 hours
- **Scope**: Frontend-only, no backend changes needed

### Issue #9: Interactive API Documentation
- **Estimate**: 6-8 hours
- **Scope**: OpenAPI/Swagger for all 4 services (BFF, Python, C#, Java)

---

## Phase 8: Infrastructure & Deployment

**Effort**: 58-78 hours | **Status**: 🔴 Not started (deferred to last phase)

All Terraform/Azure IaC work. Now must account for 4+ services instead of 2.

### Terraform Foundation (Issues #23-28)
Original Milestone 0 issues carried forward but expanded for polyglot architecture:
- **Issue #23**: Terraform Foundation & State Management (10-14 hrs)
- **Issue #24**: Core Networking Module (12-16 hrs)
- **Issue #25**: Compute & Database Modules — now needs App Service for Python, C#, Java + Container Apps for BFF (12-16 hrs)
- **Issue #26**: Security & Monitoring Modules (10-14 hrs)
- **Issue #27**: Environment Configurations — JSON tfvars (4-6 hrs)
- **Issue #28**: CI/CD Pipeline Integration — separate build/deploy per language (10-12 hrs)

### Additional Infrastructure Work
- **Issue #8**: Azure App Insights & Logging — distributed tracing across polyglot services
- **Issue #13**: Auto-Scaling — per-service scaling policies
- **Issue #18**: Custom Domain & SSL
- **Issue #15**: Image Upload (Azure Blob Storage)
- **Issue #12**: E2E Tests with Playwright
- **Issue #16**: Pre-commit Hooks (Husky)
- **Issue #17**: Architecture Diagrams (Mermaid) — update for polyglot architecture

---

## Issues Removed or Superseded

| Original Issue | Disposition |
|---|---|
| **#22** (Go AI Service) | **Removed** — replaced by C# ASP.NET Web API in Phase 3 |
| **#21** (BFF Research) | **Completed** (Dec 6, 2025) — now being implemented in Phase 2 |
| **#11** (POI Caching) | **Deferred** to Phase 8 — implement after Java geospatial service is stable |
| **#19** (Quick Start Templates) | **Deferred** to Phase 8 |

---

## 🏗️ Architecture Diagram

```mermaid
graph TB
    A[React Frontend<br/>TypeScript + Vite<br/>Port 5173] -->|HTTP/REST| B[Node.js BFF<br/>Express Gateway<br/>Port 3000]
    
    B -->|/api/auth/*<br/>/api/trips*<br/>/api/vehicle-specs| C[Python Backend<br/>FastAPI<br/>Port 8000]
    B -->|/api/v1/parse-vehicle<br/>/api/v1/generate-trip| D[C# Backend<br/>ASP.NET Web API<br/>Port 8081]
    B -->|/api/geocode<br/>/api/directions<br/>/api/search<br/>/api/optimize| E[Java Backend<br/>Spring Boot<br/>Port 8082]
    
    C -->|SQLAlchemy| DB[(PostgreSQL<br/>Port 5432)]
    D -->|Azure.AI.OpenAI| AI[Azure OpenAI<br/>GPT-4]
    E -->|WebClient| MB[Mapbox API]
    E -->|WebClient| AM[Azure Maps API]
    
    style B fill:#ffeb3b,stroke:#333,stroke-width:3px
    style A fill:#4caf50,stroke:#333,stroke-width:2px
    style C fill:#ff9800,stroke:#333,stroke-width:2px
    style D fill:#9c27b0,stroke:#333,stroke-width:2px
    style E fill:#2196f3,stroke:#333,stroke-width:2px
    style DB fill:#e0e0e0,stroke:#333,stroke-width:2px
```

---

## 📊 Progress Tracking

### Completed
- ✅ Phase 0: Go ai-service removed
- ✅ Phase 1: Docker Compose with all services
- ✅ Issue #1: Frontend Testing Infrastructure
- ✅ Issue #4: Backend API Mocking
- ✅ Issue #21: BFF Architecture Research

### Integration Tested (needs unit tests + external API key testing)
- 🟢 Phase 2: BFF service (all proxy routes verified, 18/18 Docker Compose integration tests pass)
- 🟢 Phase 3: C# AI service (BFF→C# proxy verified, fallback mode tested, needs xUnit tests + Azure OpenAI)
- 🟢 Phase 4: Java geospatial service (BFF→Java proxy verified, needs real API key testing)

### Not Started
- 🔴 Phase 5: Frontend BFF integration
- 🔴 Phase 6: Code quality (Issues #2, #3, #5, #20)
- 🔴 Phase 7: Features (Issues #6, #7, #9, #10, #14)
- 🔴 Phase 8: Infrastructure (Issues #8, #12, #13, #15-18, #23-28)

---

## 🔗 Related Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Project Guide**: `docs/PROJECT_INSTRUCTIONS.md`
- **BFF ADR**: `docs/adr/001-bff-architecture-strategy.md`
- **BFF README**: `bff/README.md`
- **C# Service**: `backend-csharp/README.md`
- **Java Service**: `backend-java/README.md`
- **Docker Compose**: `docker-compose.yml`
- **Environment Setup**: `.env.example`

---

## 📋 Quick Overview

This roadmap organizes all development tasks into 5 milestones with clear priorities, time estimates, and dependencies. Issues are tracked in GitHub Projects at: **https://github.com/users/hlucianojr1/projects/1**

> **For AI Agents**: This is the **single source of truth** for project planning. Do NOT create duplicate issues. Always reference this roadmap and existing GitHub issues before proposing new tasks.

### ✅ Recent Completions
- **Build Verification** (Feb 25, 2026): All 3 new services build verified — C# (dotnet build + fallback tested), BFF (Docker npm+tsc), Java (Docker mvn package)
- **Issue #4** (Jan 21, 2026): Backend API mocking - 10 JSON fixtures, 10 new tests, CI hardened

---

## 🎯 Milestones

| Milestone | Due Date | Total Hours | Issues | Priority | Status |
|-----------|----------|-------------|--------|----------|--------|
| [Azure IaC Foundation](#milestone-0-azure-iac-foundation) | Feb 28, 2026 | 58-78 | 6 | Critical | 🔴 **39 days remaining** |
| [Production Ready](#milestone-1-production-ready) | Mar 15, 2026 | 23-28 | 5 (1 done) | High | 🟡 54 days |
| [Pre-Launch Quality](#milestone-2-pre-launch-quality) | Mar 31, 2026 | 36-48 | 5 | High | 🟡 70 days |
| [Post-Launch Enhancement](#milestone-3-post-launch-enhancement) | Apr 30, 2026 | 50-72 | 7 | Medium | 🟢 100 days |
| [Future Improvements](#milestone-4-future-improvements) | May 31, 2026 | 23-31 | 5 | Low | 🔵 131 days |

---

## Milestone 0: Azure IaC Foundation

**Due**: February 28, 2026 (39 days) | **Effort**: 58-78 hours | **Priority**: Critical

Establish Terraform-based Infrastructure as Code (IaC) for multi-environment Azure deployment. This epic creates the foundation for all Azure resources with separate resource groups per environment (Dev, UAT, Stage, Prod) and tiered networking (public Dev, private UAT/Stage/Prod).

### Issue #23: Terraform Foundation & State Management
- **Labels**: `priority:critical`, `type:infra`
- **Estimate**: 10-14 hours
- **Problem**: No Terraform modules exist - only placeholder tfvars files. Need bootstrap script, state backend, and root module orchestration.
- **Evidence**:
  - `infrastructure/terraform/` has only `.terraform.lock.hcl` and tfvars files
  - No `main.tf`, `variables.tf`, `outputs.tf` in root
  - State backend storage account `roadtriptfstate` not created
- **Acceptance Criteria**:
  - [ ] Create `infrastructure/terraform/bootstrap.sh` to provision Azure Storage Account for state
  - [ ] Create storage account `roadtriptfstate` with container `tfstate`
  - [ ] Configure `versions.tf` with azurerm provider ~>3.85 and backend configuration
  - [ ] Create root `main.tf` with module orchestration for all child modules
  - [ ] Create root `variables.tf` with all input variables (environment, location, SKUs, networking flags)
  - [ ] Create root `outputs.tf` with key resource IDs and endpoints
  - [ ] Document Terraform usage in `infrastructure/terraform/README.md`
  - [ ] Test: `terraform init` succeeds with remote backend
- **Dependencies**: None
- **Agent Workflow**: `@terraform-azure-planning` → Manual review → Apply bootstrap

---

### Issue #24: Core Networking Module
- **Labels**: `priority:critical`, `type:infra`
- **Estimate**: 12-16 hours
- **Problem**: No networking infrastructure for private endpoints. Prod environment requires VNet integration for security compliance.
- **Architecture**:
  - Dev: Public endpoints (no VNet)
  - UAT/Stage/Prod: VNet with 3 subnets (App Service, Database, Private Endpoints)
- **Acceptance Criteria**:
  - [ ] Create `modules/networking/main.tf` with conditional VNet resource
  - [ ] Create `modules/networking/variables.tf` with `enable_vnet_integration` flag
  - [ ] Create `modules/networking/outputs.tf` with subnet IDs and VNet ID
  - [ ] Add 3 subnets: `snet-app` (10.0.1.0/24), `snet-db` (10.0.2.0/24), `snet-pe` (10.0.3.0/24)
  - [ ] Add NSG rules for App Service subnet (allow 443 inbound)
  - [ ] Add NSG rules for Database subnet (allow 5432 from App subnet only)
  - [ ] Implement Private DNS Zones for PostgreSQL (`privatelink.postgres.database.azure.com`)
  - [ ] Implement Private DNS Zones for Key Vault (`privatelink.vaultcore.azure.net`)
  - [ ] Create Private Endpoints with DNS zone linking (conditional on `enable_private_endpoints`)
  - [ ] Test: Dev deploys without VNet, Prod deploys with full networking
- **Dependencies**: Issue #23 (Terraform Foundation)
- **Agent Workflow**: `@terraform-azure-planning` → `@tdd-green` (validate with `terraform plan`)

---

### Issue #25: Compute & Database Modules
- **Labels**: `priority:critical`, `type:infra`
- **Estimate**: 12-16 hours
- **Problem**: Need reusable Terraform modules for App Service, App Service Plan, PostgreSQL Flexible Server, and Static Web App.
- **Evidence**:
  - Current `deploy-azure.sh` creates resources imperatively with `az` CLI
  - No idempotent, version-controlled infrastructure
- **Acceptance Criteria**:
  - [ ] Create `modules/compute/main.tf` with App Service Plan (Linux)
  - [ ] Create `modules/compute/main.tf` with App Service (Python 3.12 runtime)
  - [ ] Add VNet integration for App Service (conditional on `enable_vnet_integration`)
  - [ ] Add Managed Identity for App Service (system-assigned)
  - [ ] Create `modules/database/main.tf` with PostgreSQL Flexible Server
  - [ ] Add firewall rules: allow Azure services (Dev), private endpoint only (UAT/Stage/Prod)
  - [ ] Add private endpoint for PostgreSQL (conditional on `enable_private_endpoints`)
  - [ ] Create `modules/frontend/main.tf` with Azure Static Web App
  - [ ] Configure SKU tiers: B1/Free (Dev), P1V3/Standard (Prod)
  - [ ] Test: Both environments deploy successfully with correct SKUs
- **Dependencies**: Issue #23, Issue #24 (for VNet integration)
- **Agent Workflow**: `@terraform-azure-planning` → `@tdd-green` (validate deployments)

---

### Issue #26: Security & Monitoring Modules
- **Labels**: `priority:critical`, `type:infra`
- **Estimate**: 10-14 hours
- **Problem**: Key Vault and Application Insights need Terraform modules. Currently created manually or via CLI scripts.
- **Security Requirements**:
  - All secrets in Key Vault (no hardcoded values)
  - Managed Identity for secret access (no connection strings in app settings)
  - Private endpoint for Key Vault in Prod
- **Acceptance Criteria**:
  - [ ] Create `modules/security/main.tf` with Key Vault resource
  - [ ] Add Key Vault access policies for App Service Managed Identity
  - [ ] Add RBAC role assignments: Key Vault Secrets User for App Service
  - [ ] Add private endpoint for Key Vault (conditional on `enable_private_endpoints`)
  - [ ] Create `modules/monitoring/main.tf` with Log Analytics Workspace
  - [ ] Add Application Insights connected to Log Analytics
  - [ ] Configure App Service to send logs to Application Insights
  - [ ] Add diagnostic settings for all resources → Log Analytics
  - [ ] Test: App Service can read secrets from Key Vault via Managed Identity
- **Dependencies**: Issue #23, Issue #24, Issue #25
- **Agent Workflow**: `@terraform-azure-planning` → `@tdd-green` (validate secret access)

---

### Issue #27: Environment Configurations (JSON tfvars)
- **Labels**: `priority:high`, `type:infra`
- **Estimate**: 4-6 hours
- **Problem**: Existing tfvars files use HCL format. Need JSON format for CI/CD variable substitution and consistency.
- **Environment Tiers**:
  - **Dev**: Public endpoints, B1/Free SKUs, `rg-roadtrip-dev`
  - **UAT**: Private endpoints, P1V3/GP_D2s SKUs, `rg-roadtrip-uat`
  - **Stage**: Private endpoints, P1V3/GP_D2s SKUs, `rg-roadtrip-stage`
  - **Prod**: Private endpoints, P1V3/GP_D2s SKUs, `rg-roadtrip-prod`
- **Acceptance Criteria**:
  - [ ] Create `environments/dev.tfvars.json` with public networking settings
  - [ ] Create `environments/uat.tfvars.json` with private networking settings
  - [ ] Create `environments/stage.tfvars.json` with private networking settings
  - [ ] Create `environments/prod.tfvars.json` with private networking settings
  - [ ] Remove old HCL tfvars files (`dev.tfvars`, `prod.tfvars`)
  - [ ] Validate JSON syntax with `terraform validate`
  - [ ] Document all variables in `infrastructure/terraform/README.md`
  - [ ] Test: `terraform plan -var-file=environments/dev.tfvars.json` succeeds
  - [ ] Test: `terraform plan -var-file=environments/uat.tfvars.json` succeeds
  - [ ] Test: `terraform plan -var-file=environments/stage.tfvars.json` succeeds
  - [ ] Test: `terraform plan -var-file=environments/prod.tfvars.json` succeeds
- **Dependencies**: Issue #23
- **Agent Workflow**: `@terraform-azure-planning` → Manual review

**dev.tfvars.json** (Reference):
```json
{
  "environment": "dev",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-dev",
  "enable_private_endpoints": false,
  "enable_vnet_integration": false,
  "app_service_sku": "B1",
  "database_sku": "B_Standard_B1ms",
  "database_storage_mb": 32768,
  "static_web_app_sku": "Free",
  "tags": {
    "Environment": "Development",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform"
  }
}
```

**uat.tfvars.json** (Reference):
```json
{
  "environment": "uat",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-uat",
  "enable_private_endpoints": true,
  "enable_vnet_integration": true,
  "app_service_sku": "P1V3",
  "database_sku": "GP_Standard_D2s_v3",
  "database_storage_mb": 65536,
  "static_web_app_sku": "Standard",
  "vnet_address_space": ["10.1.0.0/16"],
  "subnet_app_service": "10.1.1.0/24",
  "subnet_database": "10.1.2.0/24",
  "subnet_private_endpoints": "10.1.3.0/24",
  "tags": {
    "Environment": "UAT",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform"
  }
}
```

**stage.tfvars.json** (Reference):
```json
{
  "environment": "stage",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-stage",
  "enable_private_endpoints": true,
  "enable_vnet_integration": true,
  "app_service_sku": "P1V3",
  "database_sku": "GP_Standard_D2s_v3",
  "database_storage_mb": 65536,
  "static_web_app_sku": "Standard",
  "vnet_address_space": ["10.2.0.0/16"],
  "subnet_app_service": "10.2.1.0/24",
  "subnet_database": "10.2.2.0/24",
  "subnet_private_endpoints": "10.2.3.0/24",
  "tags": {
    "Environment": "Staging",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform"
  }
}
```

**prod.tfvars.json** (Reference):
```json
{
  "environment": "prod",
  "location": "centralus",
  "resource_group_name": "rg-roadtrip-prod",
  "enable_private_endpoints": true,
  "enable_vnet_integration": true,
  "app_service_sku": "P1V3",
  "database_sku": "GP_Standard_D2s_v3",
  "database_storage_mb": 131072,
  "static_web_app_sku": "Standard",
  "vnet_address_space": ["10.0.0.0/16"],
  "subnet_app_service": "10.0.1.0/24",
  "subnet_database": "10.0.2.0/24",
  "subnet_private_endpoints": "10.0.3.0/24",
  "tags": {
    "Environment": "Production",
    "CostCenter": "Engineering",
    "ManagedBy": "Terraform",
    "Criticality": "High"
  }
}
```

---

### Issue #28: CI/CD Pipeline Integration
- **Labels**: `priority:high`, `type:infra`
- **Estimate**: 10-12 hours
- **Problem**: `azure-pipelines.yml` has no Terraform stages. Infrastructure changes require manual `terraform apply`.
- **Pipeline Requirements**:
  - Terraform init/plan/apply stages per environment
  - Service Connection with Contributor RBAC
  - Plan output for review before apply
- **Acceptance Criteria**:
  - [ ] Create Azure DevOps Service Connection with Contributor role on subscription
  - [ ] Add Terraform extension to Azure DevOps organization
  - [ ] Add `TerraformPlan_Dev` stage with `terraform plan -var-file=environments/dev.tfvars.json`
  - [ ] Add `TerraformApply_Dev` stage
  - [ ] Add `TerraformPlan_UAT` stage with `terraform plan -var-file=environments/uat.tfvars.json`
  - [ ] Add `TerraformApply_UAT` stage
  - [ ] Add `TerraformPlan_Stage` stage with `terraform plan -var-file=environments/stage.tfvars.json`
  - [ ] Add `TerraformApply_Stage` stage
  - [ ] Add `TerraformPlan_Prod` stage with `terraform plan -var-file=environments/prod.tfvars.json`
  - [ ] Add `TerraformApply_Prod` stage
  - [ ] Configure pipeline variables for backend configuration (storage account, container, key)
  - [ ] Test: Full pipeline execution deploys Dev environment
  - [ ] Document pipeline usage in `infrastructure/terraform/README.md`
- **Dependencies**: Issue #23, Issue #27
- **Agent Workflow**: `@terraform-azure-planning` → Manual review → Test deployment

**Pipeline Stage Example**:
```yaml
stages:
  - stage: TerraformPlan_Dev
    displayName: 'Terraform Plan (Dev)'
    jobs:
      - job: Plan
        steps:
          - task: TerraformTaskV4@4
            displayName: 'Terraform Init'
            inputs:
              provider: 'azurerm'
              command: 'init'
              workingDirectory: 'infrastructure/terraform'
              backendServiceArm: 'Azure-ServiceConnection'
              backendAzureRmResourceGroupName: 'rg-terraform-state'
              backendAzureRmStorageAccountName: 'roadtriptfstate'
              backendAzureRmContainerName: 'tfstate'
              backendAzureRmKey: 'dev.terraform.tfstate'
          - task: TerraformTaskV4@4
            displayName: 'Terraform Plan'
            inputs:
              provider: 'azurerm'
              command: 'plan'
              workingDirectory: 'infrastructure/terraform'
              commandOptions: '-var-file=environments/dev.tfvars.json -out=dev.tfplan'
              environmentServiceNameAzureRM: 'Azure-ServiceConnection'
```

---

### Azure IaC Architecture Diagram

```mermaid
graph TB
    subgraph "Dev Environment (Public)"
        DEV_RG[rg-roadtrip-dev]
        DEV_APP[App Service B1<br/>Public Access]
        DEV_DB[(PostgreSQL B1ms<br/>Public Access)]
        DEV_KV[Key Vault<br/>Public Access]
        DEV_SWA[Static Web App<br/>Free Tier]
        DEV_AI[Application Insights]
    end

    subgraph "Prod Environment (Private)"
        PROD_RG[rg-roadtrip-prod]
        
        subgraph "VNet 10.0.0.0/16"
            SUBNET_APP[App Subnet<br/>10.0.1.0/24]
            SUBNET_DB[DB Subnet<br/>10.0.2.0/24]
            SUBNET_PE[Private Endpoints<br/>10.0.3.0/24]
        end
        
        PROD_APP[App Service P1V3<br/>VNet Integrated]
        PROD_DB[(PostgreSQL GP_D2s<br/>Private Endpoint)]
        PROD_KV[Key Vault<br/>Private Endpoint]
        PROD_SWA[Static Web App<br/>Standard Tier]
        PROD_AI[Application Insights]
        
        PROD_APP --> SUBNET_APP
        SUBNET_PE --> PROD_DB
        SUBNET_PE --> PROD_KV
    end

    subgraph "Terraform State"
        STATE[Azure Storage Account<br/>roadtriptfstate<br/>Container: tfstate]
    end

    subgraph "CI/CD Pipeline"
        PIPELINE[Azure DevOps Pipeline]
        PIPELINE -->|terraform apply<br/>dev.tfvars.json| DEV_RG
        PIPELINE -->|terraform apply<br/>uat.tfvars.json| UAT_RG
        PIPELINE -->|terraform apply<br/>stage.tfvars.json| STAGE_RG
        PIPELINE -->|terraform apply<br/>prod.tfvars.json| PROD_RG
    end

    style DEV_RG fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style PROD_RG fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style STATE fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style PIPELINE fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

> **Note**: UAT (`rg-roadtrip-uat`, VNet 10.1.0.0/16) and Stage (`rg-roadtrip-stage`, VNet 10.2.0.0/16) environments follow the same private architecture pattern as Prod.

### Environment Verification Matrix

| Environment | Resource Group | Private Endpoints | VNet Integration | App Service SKU | Database SKU | Static Web App |
|-------------|----------------|-------------------|------------------|-----------------|--------------|----------------|
| Dev | `rg-roadtrip-dev` | ❌ No | ❌ No | B1 | B_Standard_B1ms | Free |
| UAT | `rg-roadtrip-uat` | ✅ Yes | ✅ Yes | P1V3 | GP_Standard_D2s_v3 | Standard |
| Stage | `rg-roadtrip-stage` | ✅ Yes | ✅ Yes | P1V3 | GP_Standard_D2s_v3 | Standard |
| Prod | `rg-roadtrip-prod` | ✅ Yes | ✅ Yes | P1V3 | GP_Standard_D2s_v3 | Standard |

### Epic-Level Acceptance Criteria

- [ ] All 4 environments (dev, uat, stage, prod) deployable via `terraform apply -var-file=environments/{env}.tfvars.json`
- [ ] Dev environment deploys with public endpoints and B1/Free SKUs
- [ ] UAT/Stage/Prod environments deploy with VNet, private endpoints, and P1V3/GP_D2s SKUs
- [ ] Terraform state stored in Azure Storage with per-environment isolation
- [ ] Azure DevOps pipeline successfully deploys to Dev environment
- [ ] All secrets stored in Key Vault (no hardcoded values)
- [ ] App Service accesses secrets via Managed Identity
- [ ] Infrastructure documented in `infrastructure/terraform/README.md`

---

## Milestone 1: Production Ready

**Due**: March 15, 2026 (54 days) | **Effort**: 23-28 hours (1 of 5 complete) | **Priority**: High

These issues **MUST** be resolved before production deployment. They address security vulnerabilities, testing gaps, and core functionality bugs.

> **Note**: Milestone shifted from Dec 2025 to Mar 2026 to prioritize Azure IaC Foundation (Milestone 0).

### Completed Issues (1)
- ✅ **Issue #1**: Frontend Testing Infrastructure (4-6 hours)
- ✅ **Issue #4**: Backend API Mocking (6 hours) - **Completed Jan 21, 2026**

---

### Issue #1: Add Frontend Testing Infrastructure ⚡ **COMPLETED**
- **Labels**: `priority:critical`, `type:testing`
- **Estimate**: 4-6 hours
- **Status**: ✅ **DONE** - Vitest configured, dependencies installed, example tests created
- **Acceptance Criteria**:
  - [x] Install vitest, @testing-library/react, @testing-library/user-event
  - [x] Configure Vitest in vite.config.ts
  - [x] Verify useTripStore.test.ts runs successfully
  - [x] Add npm test script to package.json
  - [x] Document test commands in frontend/README.md
  - [x] Add 2-3 example component tests
- **Dependencies**: None
- **Agent Workflow**: `@tdd-red` → `@tdd-green` → `@tdd-refactor`

---

### Issue #2: Fix TypeScript `any` Violations
- **Labels**: `priority:critical`, `type:refactor`
- **Estimate**: 8-10 hours
- **Problem**: 20 instances of `any` type violate coding standards: "No `any` types allowed"
- **Key Violations**:
  - `frontend/src/components/FloatingPanel.tsx` line 27: any props
  - `frontend/src/components/MapComponent.tsx` line 32: any event handlers
  - `frontend/src/views/ExploreView.tsx` line 35: any[] for trips
- **Missing**: `frontend/src/types/` directory doesn't exist
- **Acceptance Criteria**:
  - [ ] Create `frontend/src/types/` directory
  - [ ] Define interfaces: Route, Leg, Feature, Stop, Vehicle, Trip, POI
  - [ ] Replace all 20 `any` types with proper interfaces
  - [ ] Enable `"strict": true` in tsconfig.json
  - [ ] Fix all resulting type errors
  - [ ] No TypeScript errors in build output
- **Dependencies**: None
- **Agent Workflow**: `@tech-debt-remediation-plan` (analyze) → `@janitor` (implement fixes)

---

### Issue #3: Remove Hardcoded API Tokens ⚠️ **SECURITY**
- **Labels**: `priority:critical`, `type:security`
- **Estimate**: 2 hours
- **Problem**: **CRITICAL SECURITY ISSUE** - Mapbox token hardcoded in docker-compose.yml lines 3-5
- **Evidence**:
  ```yaml
  # NOTE: The token below is a structurally valid fake token used for training purposes only.
  VITE_MAPBOX_TOKEN: pk.eyJ1IjoiZXhhbXBsZS11c2VyIiwiYSI6ImV4YW1wbGVrZXkxMjM0NTY3ODkwIn0.SomeValidLookingSignature
  ```
- **Missing**: No .env.example files in frontend/ or backend/
- **Acceptance Criteria**:
  - [ ] Remove hardcoded token from docker-compose.yml
  - [ ] Update docker-compose.yml to use ${VITE_MAPBOX_TOKEN}
  - [ ] Create `frontend/.env.example` with all VITE_* variables
  - [ ] Create `backend/.env.example` with all backend variables
  - [ ] Document required variables in PROJECT_INSTRUCTIONS.md
  - [ ] Update README.md with environment setup instructions
  - [ ] Verify deployment scripts use environment variables only
- **Dependencies**: None
- **Agent Workflow**: `@janitor` (cleanup) → Manual verification

---

### Issue #4: Add Backend API Mocking for External Services ✅ **COMPLETED**
- **Labels**: `priority:critical`, `type:testing`
- **Estimate**: 6-8 hours | **Actual**: 6 hours
- **Completed**: January 21, 2026
- **Problem**: Backend tests hit real external APIs (Mapbox, Gemini, Azure Maps). CI pipeline has `continueOnError: true` to ignore failures
- **Evidence**: 
  - `.github/workflows/backend.yml` line 52: continueOnError allows test failures
  - `backend/tests/` has no fixtures for HTTP mocking
- **Acceptance Criteria**: ✅ **ALL COMPLETE**
  - [x] Install pytest-httpx or responses library (used unittest.mock)
  - [x] Create fixtures for Mapbox Directions API responses
  - [x] Create fixtures for Gemini AI responses
  - [x] Create fixtures for Azure Maps responses
  - [x] Update test_main.py to use mocked responses (10 new tests)
  - [x] Update test_trips.py to use mocked responses (not needed - no external calls)
  - [x] Remove `continueOnError: true` from backend.yml
  - [x] All tests pass in CI without external API calls (45/45 passing)
- **Implementation Summary**:
  - Created 10 JSON fixture files in `backend/tests/fixtures/` (5 success + 5 error responses)
  - Created `backend/tests/conftest.py` with shared pytest fixtures and mock utilities
  - Added 10 comprehensive tests covering all external API endpoints with success/error cases
  - All 45 backend tests now pass locally without network calls
  - See `backend/BACKEND_TESTING_MEMORY.md` for detailed implementation notes
- **Dependencies**: None
- **Agent Workflow**: `@tdd-green` (create mocks) → `@debug` (verify CI passes)

---

### Issue #5: Store Route GeoJSON in Database When Saving Trips
- **Labels**: `priority:critical`, `type:bug`
- **Estimate**: 3-4 hours
- **Problem**: When trips are saved, the calculated route geometry is not persisted. Loading a saved trip shows stops but no route line on the map
- **Evidence**:
  - `backend/schemas.py` TripCreate schema missing `route_geojson` field
  - `frontend/src/components/FloatingPanel.tsx` line 319 calculates distance but doesn't save route
  - `backend/models.py` Trip model has no route_geojson column
- **Acceptance Criteria**:
  - [ ] Add `route_geojson` column to Trip model (JSON type)
  - [ ] Create Alembic migration: `alembic revision -m "Add route_geojson to trips"`
  - [ ] Update TripCreate and TripResponse schemas to include route_geojson
  - [ ] Update FloatingPanel.tsx save logic to include routeGeoJSON from store
  - [ ] Update trip load logic to restore route on map
  - [ ] Test: Save trip → reload page → route displays correctly
  - [ ] Run migration in Azure: `alembic upgrade head`
- **Dependencies**: None
- **Agent Workflow**: `@debug` (investigate) → `@tdd-red` (write tests) → `@tdd-green` (implement)

---

## Milestone 2: Pre-Launch Quality

**Due**: March 31, 2026 (70 days) | **Effort**: 36-48 hours | **Priority**: High

These issues ensure production-quality features, security, and user experience before public launch.

### Issue #6: Implement Vehicle-Aware Routing with Mapbox Truck Profile
- **Labels**: `priority:high`, `type:feature`
- **Estimate**: 6-8 hours
- **Problem**: Marketing mentions "vehicle-aware routing" but vehicle dimensions are collected and never used. All routes use Mapbox car profile
- **Evidence**: 
  - `backend/main.py` /api/directions endpoint doesn't pass vehicle specs to Mapbox
  - Mapbox Directions API supports `driving-traffic`, `driving`, `walking`, `cycling`, `truck` profiles
  - Vehicle height/weight/width stored but not utilized
- **Acceptance Criteria**:
  - [ ] Research Mapbox Directions API truck profile parameters
  - [ ] Add vehicle_type parameter to /api/directions endpoint
  - [ ] Map vehicle specs to Mapbox truck restrictions (height, weight, hazmat)
  - [ ] Update frontend to pass vehicle type in route request
  - [ ] Add UI indicator: "Route safe for {vehicle_type}"
  - [ ] Test with RV (height restriction) vs car route differences
  - [ ] Document limitations in PROJECT_INSTRUCTIONS.md
- **Dependencies**: Issue #5 (route storage)
- **Agent Workflow**: `@task-researcher` → `@task-planner` → `@tdd-red` → `@tdd-green` → `@tdd-refactor`

---

### Issue #7: Add WCAG AA Accessibility Compliance
- **Labels**: `priority:high`, `type:a11y`
- **Estimate**: 10-12 hours
- **Problem**: Zero accessibility attributes found in codebase. WCAG AA compliance documented in PROJECT_INSTRUCTIONS.md but not implemented
- **Evidence**:
  - No `aria-label` attributes found
  - No `role=` attributes found
  - Icon-only buttons missing labels
  - No keyboard navigation testing
- **Legal Risk**: Section 508 compliance required for government use
- **Acceptance Criteria**:
  - [ ] Install @axe-core/react for development
  - [ ] Audit all pages with axe DevTools
  - [ ] Add aria-label to all icon-only buttons
  - [ ] Ensure all interactive elements keyboard accessible
  - [ ] Add focus indicators (visible outline on tab)
  - [ ] Test with VoiceOver (Mac) or NVDA (Windows)
  - [ ] Add skip-to-content link
  - [ ] Document a11y patterns in PROJECT_INSTRUCTIONS.md
  - [ ] Pass WAVE accessibility checker
- **Dependencies**: None
- **Agent Workflow**: `@accessibility` (audit and implement)

---

### Issue #8: Configure Azure Application Insights and Structured Logging
- **Labels**: `priority:high`, `type:infra`
- **Estimate**: 4-6 hours
- **Problem**: No production monitoring. Backend uses print() statements instead of structured logging. No error tracking for frontend
- **Evidence**:
  - `backend/main.py` has print("WARNING: SECRET_KEY not set...")
  - 12 console.log() instances in frontend production code
  - No Application Insights SDK installed
- **Acceptance Criteria**:
  - [ ] Create Azure Application Insights resource
  - [ ] Install applicationinsights in backend/requirements.txt
  - [ ] Replace print() with logging.info/warning/error
  - [ ] Add Application Insights JS SDK to frontend
  - [ ] Configure custom events for route calculations
  - [ ] Set up alert rules: 500 errors > 5/min, avg response time > 3s
  - [ ] Create Azure Dashboard with key metrics
  - [ ] Test error tracking: trigger error → verify in App Insights
  - [ ] Document monitoring in AZURE_DEPLOYMENT.md
- **Dependencies**: None
- **Agent Workflow**: `@terraform-azure-planning` (infrastructure) → `@task-researcher` (SDK integration)

---

### Issue #9: Create Interactive API Documentation with Examples
- **Labels**: `priority:high`, `type:docs`
- **Estimate**: 4-6 hours
- **Problem**: FastAPI auto-generates /docs but lacks customization, examples, and authentication documentation
- **Current State**: Basic Swagger UI at /docs with minimal descriptions
- **Acceptance Criteria**:
  - [ ] Add docstrings to all route handlers with param descriptions
  - [ ] Add request/response examples to Pydantic schemas
  - [ ] Document authentication flow (Google OAuth → JWT)
  - [ ] Add "Try it out" examples for public endpoints
  - [ ] Configure Swagger UI title, description, version
  - [ ] Add API versioning strategy (e.g., /api/v1/)
  - [ ] Document rate limits (when implemented)
  - [ ] Add Redoc alternative view at /redoc
  - [ ] Link to API docs from PROJECT_INSTRUCTIONS.md
- **Dependencies**: None
- **Agent Workflow**: `@api-docs-generator` (custom agent)

---

### Issue #10: Implement JWT Refresh Token Flow
- **Labels**: `priority:high`, `type:security`
- **Estimate**: 6-8 hours
- **Problem**: JWT tokens expire after 15 minutes (backend/auth.py line 35). No refresh mechanism = users logged out mid-session
- **Current Behavior**: User must re-authenticate every 15 minutes
- **Acceptance Criteria**:
  - [ ] Add refresh_token column to User model (hashed)
  - [ ] Create /auth/refresh endpoint
  - [ ] Return both access_token (15min) and refresh_token (7 days) on login
  - [ ] Frontend stores refresh_token in httpOnly cookie
  - [ ] Implement token refresh interceptor in axios
  - [ ] Auto-refresh access_token when expired (using refresh_token)
  - [ ] Revoke refresh_token on logout
  - [ ] Add refresh_token rotation (issue new on each use)
  - [ ] Test: Wait 16 minutes → verify auto-refresh works
- **Dependencies**: None
- **Agent Workflow**: `@task-planner` → `@tdd-red` → `@tdd-green` → `@debug` (verify)

---

## Milestone 3: Post-Launch Enhancement

**Due**: April 30, 2026 (100 days) | **Effort**: 50-72 hours | **Priority**: Medium

These issues improve performance, add features, enhance the user experience after launch, and establish the foundation for future polyglot microservices architecture.

### Issue #11: Optimize POI Search with Batching and Caching
- **Labels**: `priority:medium`, `type:feature`
- **Estimate**: 6-8 hours
- **Problem**: POI search makes 10 parallel API calls to Azure Maps (one per route sample point). Risk of rate limits and slow response
- **Evidence**: 
  - `backend/main.py` line 244-249: samples 10 points along route
  - Comment line 237: "In production, you'd optimize this..."
- **Acceptance Criteria**:
  - [ ] Research Azure Maps batch API endpoints
  - [ ] Implement batching: single request for multiple points
  - [ ] Add Redis caching layer (Azure Cache for Redis)
  - [ ] Cache POI results by location hash (50km radius)
  - [ ] Set TTL: 24 hours for POI data
  - [ ] Add debouncing: wait 500ms after last stop change
  - [ ] Monitor: compare before/after API call volume
  - [ ] Document caching strategy in PROJECT_INSTRUCTIONS.md
- **Dependencies**: None
- **Agent Workflow**: `@task-researcher` → `@task-planner` → `@tdd-green`

---

### Issue #12: Add End-to-End Tests with Playwright
- **Labels**: `priority:medium`, `type:testing`
- **Estimate**: 12-16 hours
- **Problem**: No E2E tests for critical user flows. Manual testing required for each deployment
- **Risk**: Regressions in core functionality (route calculation, trip save/load)
- **Acceptance Criteria**:
  - [ ] Install Playwright (@playwright/test)
  - [ ] Configure playwright.config.ts (Chrome, Firefox, Safari)
  - [ ] Write test: Create trip → add 3 stops → calculate route → save
  - [ ] Write test: Load saved trip → verify stops and route display
  - [ ] Write test: Search POIs → add to trip → verify marker
  - [ ] Write test: Google login flow (with test account)
  - [ ] Add to CI pipeline (.github/workflows/e2e.yml)
  - [ ] Generate HTML test reports
  - [ ] Document test commands in README.md
- **Dependencies**: Issue #1 (test infrastructure)
- **Agent Workflow**: `@playwright-tester` (specialized agent)

---

### Issue #13: Configure Auto-Scaling for Azure App Service
- **Labels**: `priority:medium`, `type:infra`
- **Estimate**: 6-8 hours
- **Problem**: Single B1 App Service instance cannot handle traffic spikes. No auto-scaling configured
- **Evidence**: `deploy-azure.sh` creates fixed B1 SKU
- **Acceptance Criteria**:
  - [ ] Define scaling rules: CPU > 70% for 5min → scale out
  - [ ] Set max instances: 5 (cost control)
  - [ ] Set min instances: 1 (cost optimization)
  - [ ] Configure scale-in delay: 10 minutes
  - [ ] Add Application Gateway for load balancing
  - [ ] Test: Run load test (Apache Bench) → verify scale-out
  - [ ] Monitor: Check metrics after scale event
  - [ ] Document scaling rules in AZURE_DEPLOYMENT.md
  - [ ] Set up budget alert: >$100/month
- **Dependencies**: Issue #8 (Application Insights for metrics)
- **Agent Workflow**: `@terraform-azure-planning` (create infrastructure plan)

---

### Issue #14: Implement AI Trip Generation with Google Gemini
- **Labels**: `priority:medium`, `type:feature`
- **Estimate**: 12-16 hours
- **Problem**: "AI Trip Planner" button exists in StartTripView (line 43-56) but navigates to blank itinerary. No AI generation logic
- **Vision**: User enters "3-day trip from SF to LA" → AI generates stops and route
- **Acceptance Criteria**:
  - [ ] Design prompt template for Gemini: "Generate {duration} road trip from {start} to {destination} with {interests}"
  - [ ] Create /api/ai/generate-trip endpoint
  - [ ] Parse AI response to extract locations (geocode with Azure Maps)
  - [ ] Create UI modal: duration, interests, preferences
  - [ ] Handle AI errors gracefully (fallback to manual)
  - [ ] Add loading state with progress indicator
  - [ ] Validate AI output (ensure valid coordinates)
  - [ ] Test with 5 different prompt types
  - [ ] Document AI features in PROJECT_INSTRUCTIONS.md
- **Dependencies**: Issue #2 (TypeScript types for AI responses)
- **Agent Workflow**: `@task-researcher` → `@task-planner` → `@context7` (Gemini docs) → `@tdd-red/green`

---

### Issue #15: Add Image Upload for Public Trips with Azure Blob Storage
- **Labels**: `priority:medium`, `type:feature`
- **Estimate**: 8-10 hours
- **Problem**: Trip image_url field exists in database but no upload interface. Currently uses hardcoded Unsplash URLs
- **Evidence**:
  - `backend/models.py` has image_url column
  - `frontend/src/views/AllTripsView.tsx` displays images
  - No upload UI in FloatingPanel save section
- **Acceptance Criteria**:
  - [ ] Create Azure Blob Storage account (or use existing)
  - [ ] Add azure-storage-blob to requirements.txt
  - [ ] Create /api/upload endpoint (max 5MB, jpg/png only)
  - [ ] Generate SAS token for upload
  - [ ] Add image upload component in FloatingPanel
  - [ ] Implement client-side image compression (max 1920x1080)
  - [ ] Update Trip schema to save blob URL
  - [ ] Add image preview before upload
  - [ ] Set blob lifecycle policy: delete after 90 days if trip deleted
  - [ ] Test: Upload → save trip → reload → image displays
- **Dependencies**: None
- **Agent Workflow**: `@task-researcher` (Azure Blob patterns) → `@terraform-azure-planning` → `@tdd-green`

---

### Issue #21: Research and Document BFF Architecture Migration Strategy
- **Labels**: `priority:low`, `type:docs`, `type:architecture`
- **Estimate**: 4-6 hours
- **Status**: ✅ **COMPLETED** (Dec 6, 2025) - All acceptance criteria met
- **Problem**: Current monolith FastAPI backend is suitable for MVP, but need to plan future migration to Backend-for-Frontend (BFF) architecture with polyglot microservices
- **Research Findings**:
  - ✅ BFF pattern is **language-agnostic** - FastAPI can orchestrate Java/Go/C#/Python services
  - ✅ Current architecture **already supports this** - httpx usage is identical for internal services
  - ✅ Communication protocols: REST/HTTP (universal), gRPC (high-performance), GraphQL (flexible)
  - ⚠️ **Recommendation**: Keep FastAPI monolith for Production Ready milestone (Dec 18, 2025)
  - 📅 **Extract to microservices later** when needed (post-launch, Feb+ 2026)
- **Acceptance Criteria**:
  - [x] Research BFF pattern with polyglot microservices (COMPLETED Dec 6, 2025)
  - [x] Confirm FastAPI can proxy to Java/Go/C# services (CONFIRMED)
  - [x] Document migration triggers: independent scaling, different languages, team specialization
  - [x] Create architecture decision record (ADR) documenting BFF strategy (COMPLETED - docs/adr/001-bff-architecture-strategy.md)
  - [x] Add Mermaid diagram showing future polyglot architecture (COMPLETED - Added to ROADMAP.md)
  - [x] Document service extraction criteria in PROJECT_INSTRUCTIONS.md (COMPLETED)
  - [x] Define API contract standards (OpenAPI/Protobuf) for future services (COMPLETED - in ADR and PROJECT_INSTRUCTIONS.md)
  - [x] Create example migration plan: AI service extraction to separate language (COMPLETED - Go example in ADR and PROJECT_INSTRUCTIONS.md)
- **Dependencies**: Issue #17 (Architecture Diagrams with Mermaid)
- **Agent Workflow**: `@hlbpa` (High-Level Big Picture Architect) → `@task-planner` (migration strategy)
- **Future Architecture Example**:
  ```mermaid
  graph TB
      A[React App<br/>TypeScript + Vite] -->|HTTP/REST| B[FastAPI BFF<br/>Python - API Aggregation]
      B -->|HTTP/REST| C[Java Service<br/>Spring Boot<br/>User Management]
      B -->|gRPC| D[Go Service<br/>High-Performance<br/>Routing/Maps]
      B -->|HTTP/REST| E[C# Service<br/>.NET 8<br/>Analytics/Reporting]
      B -->|HTTP/REST| F[Python Service<br/>AI/ML<br/>Azure OpenAI]
      
      C -.->|Read/Write| DB[(PostgreSQL<br/>User Data)]
      D -.->|Read| CACHE[(Redis<br/>Route Cache)]
      E -.->|Read| DW[(Data Warehouse<br/>Analytics)]
      F -.->|API Call| AI[Azure OpenAI<br/>GPT-4]
      
      style B fill:#ff9,stroke:#333,stroke-width:3px
      style A fill:#9f9,stroke:#333,stroke-width:2px
      style C fill:#9cf,stroke:#333,stroke-width:2px
      style D fill:#f9c,stroke:#333,stroke-width:2px
      style E fill:#c9f,stroke:#333,stroke-width:2px
      style F fill:#fc9,stroke:#333,stroke-width:2px
  ```
- **Migration Triggers** (defer until one of these occurs):
  1. AI service gets heavy traffic → extract to separate Go/Python service
  2. Routing performance becomes bottleneck → rewrite in Go
  3. Need .NET for enterprise integrations → add C# service
  4. Team grows and wants language specialization

---

### Issue #22: Build Standalone AI Service with Azure OpenAI (Go Microservice)
- **Labels**: `priority:medium`, `type:feature`, `type:infra`
- **Estimate**: 16-24 hours
- **Status**: ⏸️ **DEFERRED** - Keep in FastAPI monolith until post-launch (Feb 2026+)
- **Rationale**: Production Ready deadline (Dec 18, 2025) is 12 days away. Current Google Gemini integration works. Polyglot microservices add deployment complexity without immediate value. Extract later when AI traffic justifies independent scaling.
- **Problem**: Current backend uses Google Gemini AI (via `ai_service.py`) for vehicle specification parsing. Future state: migrate to Azure OpenAI and implement as a separate, independently scalable microservice
- **Architecture**: Build a standalone Go microservice with its own API and container, allowing independent scaling from the main FastAPI backend
- **Acceptance Criteria** (when implemented post-launch):
  - [ ] Create new Go project structure: `ai-service/` directory
  - [ ] Implement Azure OpenAI SDK integration in Go
  - [ ] Create RESTful API endpoints:
    - `POST /api/v1/parse-vehicle` - Parse vehicle specs from text
    - `POST /api/v1/generate-trip` - Generate trip itinerary (for Issue #14)
    - `GET /health` - Health check endpoint
  - [ ] Implement request/response schemas compatible with existing Python backend
  - [ ] Create Dockerfile for Go service (multi-stage build)
  - [ ] Add docker-compose.yml service definition for local development
  - [ ] Configure Azure Container Apps deployment (separate from main backend)
  - [ ] Set up environment variables: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT
  - [ ] Implement rate limiting and retry logic with exponential backoff
  - [ ] Add structured logging (JSON format for Azure Application Insights)
  - [ ] Write Go unit tests for AI prompt formatting and response parsing
  - [ ] Update FastAPI backend to call new Go AI service via HTTP (BFF pattern)
  - [ ] Remove `google-generativeai` dependency from requirements.txt (if fully replaced)
  - [ ] Document Go service API in README.md and deployment guide
  - [ ] Update `deploy-azure.sh` to deploy both containers
- **Dependencies**: Issue #21 (BFF Architecture Documentation)
- **Agent Workflow**: `@task-researcher` (Go + Azure OpenAI patterns) → `@task-planner` (microservice architecture) → `@terraform-azure-planning` (container deployment)
- **Implementation Timeline**:
  - ✅ **Dec 2025**: Keep Gemini in FastAPI monolith (Production Ready)
  - 📅 **Feb 2026**: Re-evaluate based on AI usage metrics from Application Insights
  - 📅 **Mar 2026**: If traffic justifies, extract AI service to Go/Python microservice
- **Note**: ⚠️ This will replace Gemini usage in both current vehicle parsing AND future Issue #14 (AI Trip Generation). Implementing as separate service allows independent scaling during high AI usage periods. **Defer until post-launch** to avoid deployment complexity pre-production.

---

## Milestone 4: Future Improvements

**Due**: May 31, 2026 (131 days) | **Effort**: 23-31 hours | **Priority**: Low

These issues improve developer experience, documentation, and code quality for long-term maintainability.

### Issue #16: Add Pre-commit Hooks with Husky and lint-staged
- **Labels**: `priority:low`, `type:refactor`
- **Estimate**: 2-3 hours
- **Problem**: No automated checks before commit. Broken code can be pushed to main branch
- **Acceptance Criteria**:
  - [ ] Install husky and lint-staged
  - [ ] Configure pre-commit hook: run ESLint on staged files
  - [ ] Configure pre-commit hook: run TypeScript type check
  - [ ] Configure pre-commit hook: run Prettier formatting
  - [ ] Add commit-msg hook: enforce conventional commits
  - [ ] Add pre-push hook: run tests
  - [ ] Document in CONTRIBUTING.md
  - [ ] Test: Try to commit broken code → verify rejection
- **Dependencies**: Issue #1 (test infrastructure)
- **Agent Workflow**: `@pre-commit-enforcer` (custom agent)

---

### Issue #17: Create Architecture Diagrams with Mermaid
- **Labels**: `priority:low`, `type:docs`
- **Estimate**: 4-6 hours
- **Problem**: Text-based architecture description in PROJECT_INSTRUCTIONS.md (lines 417-428). No visual diagrams
- **Acceptance Criteria**:
  - [ ] Create system architecture diagram (frontend, backend, Azure services)
  - [ ] Create component hierarchy diagram (React components)
  - [ ] Create data flow diagram (user action → API → database → UI)
  - [ ] Create authentication flow diagram (OAuth → JWT)
  - [ ] Create deployment pipeline diagram (GitHub → Azure)
  - [ ] Embed Mermaid diagrams in PROJECT_INSTRUCTIONS.md
  - [ ] Export PNG versions to docs_archive/images/
  - [ ] Verify diagrams render on GitHub
- **Dependencies**: None
- **Agent Workflow**: `@hlbpa` (High-Level Big Picture Architect) - ⚠️ **NOT YET INSTALLED**

---

### Issue #18: Configure Custom Domain and SSL Certificate
- **Labels**: `priority:low`, `type:infra`
- **Estimate**: 3-4 hours
- **Problem**: App uses default Azure domains: roadtrip-frontend-hl.azurestaticapps.net and roadtrip-api-hl.azurewebsites.net
- **Acceptance Criteria**:
  - [ ] Purchase domain (e.g., roadtrip.app) or use existing
  - [ ] Configure CNAME: www → Static Web App
  - [ ] Configure CNAME: api → App Service
  - [ ] Add custom domain in Azure Portal
  - [ ] Provision free SSL certificate (Azure managed)
  - [ ] Update CORS settings with new domain
  - [ ] Update ALLOWED_ORIGINS environment variable
  - [ ] Test HTTPS: verify certificate valid
  - [ ] Set up DNS redirect: apex → www
  - [ ] Document in AZURE_DEPLOYMENT.md
- **Dependencies**: None
- **Agent Workflow**: `@terraform-azure-planning` (infrastructure plan)

---

### Issue #19: Implement Quick Start Templates with Pre-populated Data
- **Labels**: `priority:low`, `type:feature`
- **Estimate**: 8-10 hours
- **Problem**: Quick Start template buttons exist in StartTripView (lines 60-84) but don't populate any data
- **Vision**: Click "Weekend Getaway" → pre-filled 2-day trip with sample stops
- **Acceptance Criteria**:
  - [ ] Define 4 template data structures: Weekend Getaway, Cross Country, Coastal Drive, National Parks
  - [ ] Create /api/templates endpoint (returns template JSON)
  - [ ] Each template includes: stops, vehicle type, duration, description
  - [ ] Update StartTripView to load template on click
  - [ ] Populate useTripStore with template data
  - [ ] Navigate to itinerary with template loaded
  - [ ] Add "Customize" prompt to edit template
  - [ ] Test all 4 templates
  - [ ] Document template format in PROJECT_INSTRUCTIONS.md
- **Dependencies**: Issue #2 (TypeScript types)
- **Agent Workflow**: `@task-planner` → `@tdd-red` → `@tdd-green`

---

### Issue #20: Extract Duplicate Code into Utility Functions
- **Labels**: `priority:low`, `type:refactor`
- **Estimate**: 6-8 hours
- **Problem**: Code duplication found in multiple files
- **Key Violations**:
  1. **Default Image Logic**: Repeated in AllTripsView.tsx and ExploreView.tsx (same Unsplash URLs)
  2. **Token Retrieval**: `localStorage.getItem('token')` repeated 10+ times across components
- **Acceptance Criteria**:
  - [ ] Create `frontend/src/utils/images.ts` with getDefaultTripImage()
  - [ ] Create `frontend/src/hooks/useAuth.ts` with token retrieval
  - [ ] Replace all instances of duplicate image logic
  - [ ] Replace all instances of localStorage.getItem('token')
  - [ ] Add JSDoc comments to utility functions
  - [ ] Write unit tests for new utilities
  - [ ] Verify no functionality broken
  - [ ] Document patterns in PROJECT_INSTRUCTIONS.md
- **Dependencies**: Issue #1 (test infrastructure for unit tests)
- **Agent Workflow**: `@janitor` → `@tdd-refactor`

---

## 🤖 AI Agent Guidelines

### Before Creating New Tasks

1. **Check this roadmap** - All 28 issues are documented here
2. **Search GitHub Issues** - Use `gh issue list --repo hlucianojr1/road_tirp_app`
3. **Reference existing issues** - Use "Related to #6" instead of creating duplicates
4. **Confirm with user** - If unsure, ask before creating new issues

### Recommended Agent Workflows by Issue Type

| Issue Type | Agent Chain |
|------------|-------------|
| **Bug Fixes** | `@debug` → `@tdd-red` → `@tdd-green` |
| **New Features** | `@task-researcher` → `@task-planner` → `@tdd-red` → `@tdd-green` → `@tdd-refactor` |
| **Refactoring** | `@tech-debt-remediation-plan` → `@janitor` → `@tdd-refactor` |
| **Infrastructure** | `@terraform-azure-planning` → Manual review → Apply plan |
| **Testing** | `@tdd-red` → `@tdd-green` (unit), `@playwright-tester` (E2E) |
| **Documentation** | `@api-docs-generator` (API), `@hlbpa` (diagrams) |
| **Accessibility** | `@accessibility` (audit and implement) |

### Critical Constraints

- ✅ **Research first**: Always use `@task-researcher` for new features before implementation
- ✅ **Get approval**: All planning agents require user confirmation before coding
- ✅ **Reference issues**: Include GitHub issue number in all agent prompts (e.g., "Fix Issue #5")
- ❌ **Never bypass**: Do not skip TDD workflow or planning phases
- ❌ **Never replace**: Do not swap out established tech stack (React, Zustand, FastAPI, etc.)

---

## 🏗️ Architecture Evolution Strategy

### Current State (Dec 2025 - Production Ready)
**FastAPI Monolith** - Single Python backend with service modules:
- ✅ Simple deployment (one container)
- ✅ Fast development velocity
- ✅ Suitable for MVP and initial user base
- ✅ Already structured for future extraction (`ai_service.py`, `auth.py`, etc.)

### Future State (Feb 2026+ - Post-Launch)
**BFF (Backend-for-Frontend) with Polyglot Microservices** - When needed:

```mermaid
graph TB
    A[React App Frontend] -->|REST/HTTP| B[FastAPI BFF<br/>API Aggregation Layer]
    B -->|REST| C[Java Service<br/>Spring Boot]
    B -->|gRPC| D[Go Service<br/>High-Performance]
    B -->|REST| E[C# Service<br/>.NET]
    B -->|REST| F[Python Service<br/>AI/ML]
    
    style B fill:#ffeb3b,stroke:#333,stroke-width:4px
    style A fill:#4caf50,stroke:#333,stroke-width:2px
    style C fill:#2196f3,stroke:#333,stroke-width:2px
    style D fill:#e91e63,stroke:#333,stroke-width:2px
    style E fill:#9c27b0,stroke:#333,stroke-width:2px
    style F fill:#ff9800,stroke:#333,stroke-width:2px
```

### Migration Triggers (Wait for one of these)
1. **Independent Scaling Needed**: AI service gets 10x traffic of main app
2. **Performance Bottleneck**: Route calculations need sub-100ms response (consider Go)
3. **Language-Specific Requirements**: Enterprise integration needs .NET libraries
4. **Team Specialization**: Separate teams want different tech stacks

### Key Principles
- ✅ **Language-Agnostic**: FastAPI BFF can proxy to **any** backend service (Java/Go/C#/Python/Rust)
- ✅ **Standard Protocols**: Use REST/HTTP (simple), gRPC (performant), or GraphQL (flexible)
- ✅ **Frontend Unchanged**: React continues talking to single FastAPI endpoint
- ✅ **Incremental Migration**: Extract one service at a time (start with AI or routing)

### Current Architecture Already Supports This
The FastAPI backend **already uses the BFF pattern** for external APIs:
```python
# Current pattern (external API)
async def get_directions():
    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.mapbox.com/...")
        return response.json()

# Future pattern (internal Go service) - SAME CODE!
async def get_directions():
    async with httpx.AsyncClient() as client:
        response = await client.post("http://routing-service:8080/calculate-route")
        return response.json()
```

**No code changes needed in React** - just change the backend service URL!

### Recommended First Extraction (when ready)
**Option A: AI Service** (if high AI traffic)
- Extract `ai_service.py` to standalone Python/Go service
- Benefits: Independent scaling, isolate AI costs, use Azure OpenAI natively

**Option B: Routing Service** (if performance critical)
- Rewrite routing logic in Go for <100ms response times
- Benefits: 10x performance improvement, reduced Mapbox API costs (caching)

**Decision Point**: Monitor Application Insights metrics post-launch (Feb 2026)

---

## 📊 Progress Tracking

### Completed Issues

- ✅ **Issue #1**: Frontend Testing Infrastructure (4-6 hours) - **DONE Dec 6, 2025**
- ✅ **Issue #21**: BFF Architecture Research and Documentation (4-6 hours) - **✅ COMPLETED Dec 6, 2025**

### In Progress

- None currently

### Blocked

- Issue #6 blocked by Issue #5 (route storage)
- Issue #12 blocked by Issue #1 (now unblocked)
- Issue #13 blocked by Issue #8 (monitoring metrics)
- Issue #14 blocked by Issue #2 (TypeScript types)
- Issue #16 blocked by Issue #1 (now unblocked)
- Issue #20 blocked by Issue #1 (now unblocked)
- Issue #21 blocked by Issue #17 (Mermaid diagrams - partial completion OK)
- Issue #22 **DEFERRED** until post-launch (Feb 2026+) - blocked by Issue #21 (BFF strategy documentation)
- Issue #24 blocked by Issue #23 (Terraform Foundation)
- Issue #25 blocked by Issue #23 and Issue #24 (for VNet integration)
- Issue #26 blocked by Issue #23, #24, #25
- Issue #27 blocked by Issue #23
- Issue #28 blocked by Issue #23 and Issue #27

### Critical Path for Azure IaC Foundation (Feb 28, 2026)

**58-78 hours remaining, 39 days available = ~1.5-2 hours/day**

```mermaid
gantt
    title Azure IaC Foundation Critical Path
    dateFormat YYYY-MM-DD
    section Foundation
    Issue #23 Terraform Foundation :a1, 2026-01-21, 5d
    Issue #27 Environment Configs :a2, after a1, 3d
    section Modules
    Issue #24 Networking Module :b1, after a1, 5d
    Issue #25 Compute/Database :b2, after b1, 5d
    Issue #26 Security/Monitoring :b3, after b2, 4d
    section Pipeline
    Issue #28 CI/CD Integration :c1, after a2, 4d
    Azure IaC Complete :milestone, 2026-02-28, 0d
```

---

## 🔗 Related Documentation

- **Agent Usage**: `.github/copilot-agents/README.md` - How to use installed agents
- **Quick Start**: `.github/copilot-agents/QUICK_START.md` - Agent examples
- **Cross-Analysis**: `.github/copilot-agents/AGENT_TASK_CROSS_ANALYSIS.md` - Agent-to-issue mapping
- **Project Guide**: `PROJECT_INSTRUCTIONS.md` - Complete development reference
- **Deployment**: See deployment scripts in `infrastructure/` directory
- **GitHub Project**: https://github.com/users/hlucianojr1/projects/1 (use `setup-github-project.sh` to create)

---

## 📞 Support

For questions about this roadmap or task prioritization, reference:
1. This file (ROADMAP.md) - single source of truth
2. GitHub Issues - detailed acceptance criteria
3. PROJECT_INSTRUCTIONS.md - technical implementation details
4. `.github/copilot-agents/AGENT_TASK_CROSS_ANALYSIS.md` - agent workflow validation
