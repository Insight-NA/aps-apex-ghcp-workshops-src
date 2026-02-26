# Frontend Migration Roadmap: AI-Driven UI Transition

> **Status:** In Progress  
> **Created:** 2026-02-25  
> **Last Updated:** 2026-02-25  
> **Target Completion:** Q2 2026

---

## Executive Summary

This roadmap details the migration from the **OLD frontend** (production-ready, Mapbox-based) to the **NEW AI-driven frontend** (Leaflet/OSM, shadcn/ui, conversational UX). Both UIs will run in parallel during the transition period, accessed via path-based routing.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Map Provider** | Leaflet/OpenStreetMap | Free, open-source, reduce licensing costs |
| **Authentication** | Multi-provider (Google + Apple + Email) | Better user acquisition, enterprise-ready |
| **AI Backend** | C# .NET 8 + Semantic Kernel | Azure-native, strong typing, Semantic Kernel SDK |
| **Feature Strategy** | Keep ALL OLD features | Full backward compatibility |

### Timeline Overview

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **Phase 0** | Week 1 | Local Docker Setup | 🟡 In Progress |
| **Phase 1** | Weeks 2-3 | Core Integration | ⚪ Not Started |
| **Phase 2** | Weeks 4-5 | AI Chat Services (C#) | ⚪ Not Started |
| **Phase 3** | Weeks 6-7 | Feature Parity | ⚪ Not Started |
| **Phase 4** | Weeks 8-9 | Polish & Testing | ⚪ Not Started |
| **Phase 5** | Week 10 | Gradual Rollout | ⚪ Not Started |

---

## Architecture Overview

### Parallel UI Operation Strategy

```
                    ┌─────────────────────────────────────────┐
                    │           Nginx Gateway                 │
                    │         (localhost:8080)                │
                    └─────────────────────────────────────────┘
                              │                    │
                    /v1/*     │                    │  /v2/*
                              ▼                    ▼
               ┌──────────────────────┐  ┌──────────────────────┐
               │   OLD Frontend       │  │   NEW Frontend       │
               │   (Port 3000)        │  │   (Port 3001)        │
               │   - Mapbox           │  │   - Leaflet/OSM      │
               │   - react-map-gl     │  │   - shadcn/ui        │
               │   - Zustand          │  │   - AI Chat Panel    │
               └──────────────────────┘  └──────────────────────┘
                              │                    │
                              └─────────┬──────────┘
                                        ▼
               ┌──────────────────────────────────────────────┐
               │            Backend Services                   │
               ├──────────────────────────────────────────────┤
               │  FastAPI Backend (Python) - Port 8000        │
               │  Go AI Service - Port 8001                   │
               │  C# AI Chat Service - Port 8002 (NEW)        │
               │  Java Auth Service - Port 8003 (NEW)         │
               └──────────────────────────────────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                    ┌──────────────┐     ┌──────────────┐
                    │  PostgreSQL  │     │    Redis     │
                    │  (Port 5432) │     │  (Port 6379) │
                    └──────────────┘     └──────────────┘
```

### Service Architecture

| Service | Language | Framework | Port | Purpose |
|---------|----------|-----------|------|---------|
| **FastAPI Backend** | Python 3.12 | FastAPI | 8000 | Core API, trip CRUD, proxy layer |
| **Go AI Service** | Go 1.21 | Gin | 8001 | Vehicle parsing, existing AI |
| **C# AI Chat Service** | C# .NET 8 | Semantic Kernel | 8002 | Conversational trip planning |
| **Java Auth Service** | Java 21 | Spring Boot 3 | 8003 | Multi-provider OAuth, user management |
| **OLD Frontend** | TypeScript | React + Vite | 3000 | Current production UI |
| **NEW Frontend** | TypeScript | React + Vite | 3001 | AI-driven conversational UI |
| **PostgreSQL** | - | PostgreSQL 15 | 5432 | Primary database |
| **Redis** | - | Redis 7 | 6379 | Session store, caching |

---

## Phase 0: Local Docker Setup

**Goal:** Run both frontends simultaneously in Docker with hot-reload for development.

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 0.1 | Create Dockerfile for new_front_end | ✅ Completed | S | Based on existing frontend Dockerfile |
| 0.2 | Update docker-compose.yml for parallel UIs | ✅ Completed | M | docker-compose.dev.yml created |
| 0.3 | Create nginx gateway configuration | ✅ Completed | S | infrastructure/gateway/nginx.conf |
| 0.4 | Add .env.example for new frontend | ✅ Completed | S | Environment variable template |
| 0.5 | Configure hot-reload volumes | ✅ Completed | S | Dockerfile.dev for both frontends |
| 0.6 | Add PostgreSQL container | ✅ Completed | S | In docker-compose.dev.yml |
| 0.7 | Add Redis container | ✅ Completed | S | In docker-compose.dev.yml |
| 0.8 | Create startup script | ✅ Completed | S | ./dev.sh |
| 0.9 | Test both UIs accessible | 🟡 In Progress | S | Verify routing works |
| 0.10 | Document local setup in README | ⚪ Not Started | S | Developer onboarding |

### Deliverables

- ✅ `new_front_end/Dockerfile` - Production build
- ✅ `new_front_end/Dockerfile.dev` - Development with hot-reload
- ✅ `new_front_end/nginx.conf` - SPA routing
- ✅ `new_front_end/.env.example` - Environment template
- ✅ `frontend/Dockerfile.dev` - OLD frontend dev mode
- ✅ `docker-compose.dev.yml` - Full development stack
- ✅ `infrastructure/gateway/nginx.conf` - Reverse proxy routing
- ✅ `dev.sh` - Startup script
- ✅ `.env.example` - Updated with all variables

---

## Phase 1: Core Integration

**Goal:** Connect NEW frontend to existing backend APIs, implement authentication.

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 1.1 | Create axios instance with interceptors | ⚪ Not Started | S | Token refresh, error handling |
| 1.2 | Add environment configuration | ⚪ Not Started | S | VITE_* env vars |
| 1.3 | Port Zustand store architecture | ⚪ Not Started | M | Adapt from old frontend |
| 1.4 | Implement Google OAuth login | ⚪ Not Started | M | Existing backend endpoint |
| 1.5 | Add token storage and refresh | ⚪ Not Started | M | JWT handling |
| 1.6 | Create AuthProvider context | ⚪ Not Started | S | React context for auth state |
| 1.7 | Add protected route wrapper | ⚪ Not Started | S | Redirect unauthenticated users |
| 1.8 | Connect TripPlanner to /api/trips | ⚪ Not Started | M | Replace mock tripGenerator |
| 1.9 | Connect MapView to /api/directions | ⚪ Not Started | M | Real route calculation |
| 1.10 | Connect POI search to /api/search | ⚪ Not Started | M | Azure Maps integration |
| 1.11 | Add geocoding to location inputs | ⚪ Not Started | S | /api/geocode endpoint |
| 1.12 | Implement trip save/load | ⚪ Not Started | M | CRUD operations |
| 1.13 | Add error boundaries | ⚪ Not Started | S | Graceful error handling |
| 1.14 | Add loading states | ⚪ Not Started | S | UX polish |

### Deliverables

- `src/services/api.ts` - Axios configuration
- `src/services/auth.ts` - Authentication service
- `src/store/useTripStore.ts` - Zustand store
- `src/contexts/AuthContext.tsx`
- Connected components with real API calls

---

## Phase 2: AI Chat Services (C#)

**Goal:** Implement new C# AI Chat service using Semantic Kernel for conversational trip planning.

### New C# Service Specification

```
ai-chat-service/
├── src/
│   └── AIChatService/
│       ├── Program.cs
│       ├── appsettings.json
│       ├── Controllers/
│       │   ├── ChatController.cs
│       │   └── HealthController.cs
│       ├── Services/
│       │   ├── TripPlanningService.cs
│       │   ├── ConversationService.cs
│       │   └── PoiRecommendationService.cs
│       ├── Models/
│       │   ├── ChatMessage.cs
│       │   ├── TripIntent.cs
│       │   └── ConversationContext.cs
│       └── Plugins/
│           ├── TripPlugin.cs
│           ├── PoiPlugin.cs
│           └── GeoPlugin.cs
├── Dockerfile
└── README.md
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/v1/chat` | POST | Process chat message, return AI response |
| `POST /api/v1/chat/extract-trip` | POST | Extract trip details from conversation |
| `POST /api/v1/suggestions/pois` | POST | AI-powered POI recommendations |
| `POST /api/v1/suggestions/stops` | POST | Suggest stops based on route/preferences |
| `GET /api/v1/conversations/{id}` | GET | Retrieve conversation history |
| `DELETE /api/v1/conversations/{id}` | DELETE | Clear conversation |

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 2.1 | Scaffold C# .NET 8 project | ⚪ Not Started | S | Minimal API or Controllers |
| 2.2 | Add Semantic Kernel packages | ⚪ Not Started | S | Microsoft.SemanticKernel |
| 2.3 | Configure Azure OpenAI connection | ⚪ Not Started | S | GPT-4 deployment |
| 2.4 | Implement ChatController | ⚪ Not Started | M | Message handling |
| 2.5 | Create TripPlugin for Semantic Kernel | ⚪ Not Started | L | Trip extraction functions |
| 2.6 | Create PoiPlugin | ⚪ Not Started | M | POI search functions |
| 2.7 | Implement conversation context storage | ⚪ Not Started | M | Redis-backed |
| 2.8 | Add trip intent extraction | ⚪ Not Started | M | Parse origin/dest/dates |
| 2.9 | Create Dockerfile | ⚪ Not Started | S | Multi-stage build |
| 2.10 | Add to docker-compose | ⚪ Not Started | S | Service integration |
| 2.11 | Connect AIChatPanel to new service | ⚪ Not Started | M | Frontend integration |
| 2.12 | Add streaming responses | ⚪ Not Started | M | Real-time chat UX |
| 2.13 | Implement function calling | ⚪ Not Started | L | Tool use for trip creation |
| 2.14 | Add unit tests | ⚪ Not Started | M | xUnit tests |
| 2.15 | Add integration tests | ⚪ Not Started | M | End-to-end chat flow |

### Deliverables

- `ai-chat-service/` - Complete C# service
- Working conversational trip planning
- Connected AIChatPanel component

---

## Phase 3: Feature Parity

**Goal:** Port all features from OLD frontend that are missing in NEW.

### Feature Gap Analysis

| Feature | OLD | NEW | Resolution | Phase |
|---------|-----|-----|------------|-------|
| Google OAuth Login | ✅ | ❌ | Port from OLD | 1 |
| Apple Sign-In | ❌ | ❌ | New implementation | 3 |
| Email/Password Auth | ❌ | ❌ | Java Auth Service | 3 |
| Token Refresh | ✅ | ❌ | Port from OLD | 1 |
| Mapbox Maps | ✅ | ❌ | Keep Leaflet/OSM | - |
| Route Calculation | ✅ | ❌ | Connect to API | 1 |
| Drag-Drop Stop Reorder | ✅ | ❌ | Implement with react-dnd | 3 |
| Direct Stop Add/Remove | ✅ | ❌ | Add to TripPlanner | 3 |
| Offline Mode | ✅ | ❌ | Port IndexedDB logic | 3 |
| POI Search Along Route | ✅ | ❌ | Connect to /api/search | 1 |
| Route Optimization | ✅ | ❌ | Connect to /api/optimize | 3 |
| Vehicle AI Analysis | ✅ | ❌ | Connect to Go AI service | 3 |
| Mobile Navigation | ✅ | ❌ | Add responsive nav | 3 |
| Version Display | ✅ | ❌ | Add VersionDisplay component | 3 |
| Explore/Discovery View | ✅ | ❌ | Port ExploreView | 3 |
| AI Chat Interface | ❌ | ✅ | Already in NEW | - |
| Natural Language Planning | ❌ | ✅ | Already in NEW | - |
| shadcn/ui Components | ❌ | ✅ | Already in NEW | - |
| Tabbed Trip Details | ❌ | ✅ | Already in NEW | - |
| POI Category Filter | ❌ | ✅ | Already in NEW | - |

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 3.1 | Implement drag-drop stop reordering | ⚪ Not Started | M | Use react-dnd (already installed) |
| 3.2 | Add stop add/remove buttons | ⚪ Not Started | S | TripPlanner enhancement |
| 3.3 | Port offline storage (IndexedDB) | ⚪ Not Started | L | offlineStorage.ts |
| 3.4 | Add sync queue for offline changes | ⚪ Not Started | M | syncManager.ts |
| 3.5 | Add online status indicator | ⚪ Not Started | S | useOnlineStatus hook |
| 3.6 | Create mobile bottom navigation | ⚪ Not Started | M | Responsive design |
| 3.7 | Add route optimization button | ⚪ Not Started | S | /api/optimize call |
| 3.8 | Port vehicle specs AI feature | ⚪ Not Started | M | Connect to Go AI service |
| 3.9 | Add VersionDisplay component | ⚪ Not Started | S | Build metadata |
| 3.10 | Port ExploreView | ⚪ Not Started | L | Discovery features |
| 3.11 | Implement Apple Sign-In | ⚪ Not Started | M | Java Auth Service |
| 3.12 | Implement Email/Password auth | ⚪ Not Started | M | Java Auth Service |

---

## Phase 4: Java Auth Service

**Goal:** Implement multi-provider authentication service in Java Spring Boot.

### Service Specification

```
auth-service/
├── src/main/java/com/roadtrip/auth/
│   ├── AuthServiceApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── OAuth2Config.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   └── UserController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   └── TokenService.java
│   ├── model/
│   │   ├── User.java
│   │   └── RefreshToken.java
│   └── repository/
│       ├── UserRepository.java
│       └── RefreshTokenRepository.java
├── Dockerfile
├── pom.xml
└── README.md
```

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 4.1 | Scaffold Spring Boot 3 project | ⚪ Not Started | S | Spring Initializr |
| 4.2 | Add Spring Security OAuth2 | ⚪ Not Started | M | Multi-provider config |
| 4.3 | Implement Google OAuth provider | ⚪ Not Started | M | Port from Python |
| 4.4 | Implement Apple Sign-In | ⚪ Not Started | M | Apple OAuth flow |
| 4.5 | Implement Email/Password | ⚪ Not Started | M | BCrypt + email verification |
| 4.6 | Add JWT token generation | ⚪ Not Started | S | Access + Refresh tokens |
| 4.7 | Add token refresh endpoint | ⚪ Not Started | S | Rotation logic |
| 4.8 | Create user profile endpoints | ⚪ Not Started | S | CRUD operations |
| 4.9 | Add PostgreSQL integration | ⚪ Not Started | S | JPA/Hibernate |
| 4.10 | Create Dockerfile | ⚪ Not Started | S | Multi-stage build |
| 4.11 | Add to docker-compose | ⚪ Not Started | S | Service integration |
| 4.12 | Update FastAPI to proxy auth | ⚪ Not Started | M | Route to Java service |
| 4.13 | Add unit tests | ⚪ Not Started | M | JUnit 5 |
| 4.14 | Add integration tests | ⚪ Not Started | M | Testcontainers |

---

## Phase 5: Polish & Testing

**Goal:** Ensure production readiness with comprehensive testing and performance optimization.

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 5.1 | Add Vitest unit tests | ⚪ Not Started | M | Component tests |
| 5.2 | Add Playwright E2E tests | ⚪ Not Started | L | Critical user flows |
| 5.3 | Add accessibility testing | ⚪ Not Started | M | WCAG compliance |
| 5.4 | Performance audit (Lighthouse) | ⚪ Not Started | M | Core Web Vitals |
| 5.5 | Bundle size optimization | ⚪ Not Started | M | Code splitting |
| 5.6 | Add error tracking (Sentry) | ⚪ Not Started | S | Production monitoring |
| 5.7 | Add analytics | ⚪ Not Started | S | Usage tracking |
| 5.8 | Create production Docker configs | ⚪ Not Started | M | Optimized builds |
| 5.9 | Add Azure SWA configuration | ⚪ Not Started | S | staticwebapp.config.json |
| 5.10 | Security audit | ⚪ Not Started | M | OWASP checks |
| 5.11 | Load testing | ⚪ Not Started | M | Stress test AI service |
| 5.12 | Documentation update | ⚪ Not Started | M | User guides |

---

## Phase 6: Gradual Rollout

**Goal:** Migrate users from OLD to NEW frontend with feature flags.

### Tasks

| ID | Task | Status | Effort | Notes |
|----|------|--------|--------|-------|
| 6.1 | Implement feature flag system | ⚪ Not Started | M | LaunchDarkly or custom |
| 6.2 | Add UI version toggle in settings | ⚪ Not Started | S | User preference |
| 6.3 | Deploy both UIs to production | ⚪ Not Started | M | Azure SWA dual deploy |
| 6.4 | 10% rollout - beta users | ⚪ Not Started | S | Monitor metrics |
| 6.5 | 50% rollout | ⚪ Not Started | S | Expand if stable |
| 6.6 | 100% rollout | ⚪ Not Started | S | Full migration |
| 6.7 | Deprecate OLD frontend | ⚪ Not Started | M | Remove after 30 days |
| 6.8 | Archive OLD frontend code | ⚪ Not Started | S | Create git tag |

---

## Risk Registry

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI service latency affects UX | Medium | High | Implement streaming, timeout handling |
| Leaflet missing Mapbox features | Medium | Medium | Document feature differences, add alternatives |
| Auth migration breaks existing sessions | Low | High | Implement backward-compatible tokens |
| C# service complexity | Medium | Medium | Start with minimal MVP, iterate |
| Java service adds operational overhead | Medium | Medium | Use Spring Boot Actuator, good monitoring |

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature parity | 100% | All OLD features available in NEW |
| Load time (LCP) | < 2.5s | Lighthouse audit |
| AI response time | < 3s | 95th percentile |
| Test coverage | > 80% | Unit + integration |
| User satisfaction | > 4.0/5 | In-app feedback |
| Error rate | < 0.1% | Sentry monitoring |

---

## Appendix A: Technology Stack Comparison

| Category | OLD Frontend | NEW Frontend |
|----------|--------------|--------------|
| **Framework** | React 18 + Vite | React 18 + Vite |
| **Language** | TypeScript | TypeScript |
| **Styling** | Tailwind CSS 3.4 | Tailwind CSS 4.1 |
| **Components** | Custom + Lucide | shadcn/ui + Radix |
| **Maps** | Mapbox GL JS | Leaflet + OSM |
| **State** | Zustand | React useState (→ Zustand) |
| **HTTP** | Axios | Native fetch (→ Axios) |
| **Routing** | react-router v7.9 | react-router v7.13 |
| **Toast** | react-hot-toast | Sonner |
| **Drag & Drop** | @dnd-kit | react-dnd |
| **Forms** | Custom | React Hook Form + Zod |
| **Charts** | None | Recharts |

---

## Appendix B: Environment Variables

### NEW Frontend (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_AI_CHAT_URL=http://localhost:8002
VITE_AUTH_URL=http://localhost:8003

# Map Configuration (OpenStreetMap - no key needed)
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# OAuth Clients
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-client-id

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_OFFLINE_MODE=false

# Build Info
VITE_BUILD_TIMESTAMP=__BUILD_TIMESTAMP__
VITE_APP_VERSION=2.0.0
```

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-02-25 | 1.0 | AI Architect | Initial roadmap creation |
