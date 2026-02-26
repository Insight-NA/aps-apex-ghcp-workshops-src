# ADR 001: Backend-for-Frontend (BFF) Architecture Strategy with Polyglot Microservices

**Date**: December 6, 2025  
**Status**: Accepted  
**Deciders**: Development Team  
**Related Issues**: #21 (BFF Architecture Research), #22 (AI Service Extraction - Deferred)

---

## Context and Problem Statement

The Road Trip Planner application currently uses a **FastAPI monolith** backend (single Python application with service modules). While this architecture is suitable for MVP and Production Ready milestone (Dec 18, 2025), we need to plan for future scalability, performance optimization, and team growth.

**Key Questions**:
1. Can we use different programming languages (Java, Go, C#) for backend services while keeping FastAPI?
2. How do we migrate from monolith to microservices without rewriting the entire frontend?
3. When should we extract services to separate deployments?
4. What are the trade-offs between monolith simplicity and microservice flexibility?

---

## Decision Drivers

1. **Production Deadline**: 12 days until Production Ready (Dec 18, 2025) - cannot add deployment complexity now
2. **Scalability**: Need to independently scale AI service when traffic justifies it
3. **Performance**: May need sub-100ms route calculations (Go/Rust for performance)
4. **Language Flexibility**: Team may want to use different languages for different domains
5. **Frontend Stability**: React frontend should not require changes when backend architecture evolves
6. **Deployment Complexity**: Must minimize operational overhead during migration

---

## Considered Options

### Option 1: Keep FastAPI Monolith Forever
**Pros**:
- ✅ Simple deployment (one container)
- ✅ Fast development velocity
- ✅ No network overhead between services
- ✅ Easy to debug and monitor

**Cons**:
- ❌ Cannot scale components independently
- ❌ Stuck with Python for all logic
- ❌ Single point of failure
- ❌ Large codebase becomes harder to maintain

**Decision**: ❌ **Rejected** - Not scalable long-term, but **acceptable for MVP** (Dec 2025)

---

### Option 2: Immediate Migration to Microservices (Before Production)
**Pros**:
- ✅ "Correct" architecture from day one
- ✅ Independent scaling from launch
- ✅ Team can specialize in different languages

**Cons**:
- ❌ **12 days to production** - high risk of missing deadline
- ❌ Adds deployment complexity (Docker Compose, service discovery, monitoring)
- ❌ Premature optimization (no traffic data to justify)
- ❌ Increases infrastructure costs (multiple containers)

**Decision**: ❌ **Rejected** - Too risky with tight Production Ready deadline

---

### Option 3: Backend-for-Frontend (BFF) Pattern with Gradual Extraction
**Pros**:
- ✅ **Keep FastAPI monolith for Production Ready** (simple, fast)
- ✅ **Current architecture already supports BFF pattern** (httpx proxying)
- ✅ **Extract services post-launch** when data justifies (Feb 2026+)
- ✅ **Language-agnostic** - can use Java/Go/C#/Python/Rust for services
- ✅ **Frontend unchanged** - React continues calling FastAPI endpoints
- ✅ **Incremental migration** - extract one service at a time (low risk)

**Cons**:
- ⚠️ Temporary technical debt (monolith remains until extraction)
- ⚠️ Need to plan service boundaries now (avoid tight coupling)
- ⚠️ Requires monitoring to identify extraction candidates

**Decision**: ✅ **ACCEPTED** - Best balance of speed, flexibility, and risk

---

## Decision Outcome

**Chosen Option**: **Backend-for-Frontend (BFF) with Gradual Extraction**

### Implementation Plan

#### Phase 1: Production Ready (Dec 2025 - 12 days)
**Keep FastAPI Monolith**:
- ✅ Single Python backend with service modules (`ai_service.py`, `auth.py`, `vehicle_service.py`)
- ✅ Simple deployment (one Azure App Service container)
- ✅ Focus on critical issues: security, testing, bug fixes
- ✅ Service modules already separated for future extraction

**Rationale**: With 12 days to production, architectural changes add unacceptable risk. Current monolith is well-structured and suitable for MVP.

---

#### Phase 2: Post-Launch Monitoring (Feb 2026)
**Monitor Application Insights Metrics** (from Issue #8):
- 📊 Track AI service request volume and latency
- 📊 Monitor routing calculation performance
- 📊 Measure user traffic patterns
- 📊 Identify scaling bottlenecks

**Rationale**: Data-driven decisions require production metrics. Extract services only when justified by traffic/performance data.

---

#### Phase 3: Selective Service Extraction (Mar 2026+)
**Extract Services When Migration Triggers Occur**:

**Trigger 1: Independent Scaling Needed**
- **Condition**: AI service receives 10x more requests than main app
- **Action**: Extract `ai_service.py` to standalone Python/Go microservice
- **Deployment**: Azure Container Apps (separate from main backend)
- **Communication**: FastAPI BFF proxies via HTTP/REST

**Trigger 2: Performance Bottleneck**
- **Condition**: Route calculations take >500ms, need <100ms
- **Action**: Rewrite routing logic in Go for 10x performance
- **Deployment**: Azure Container Apps (Go service)
- **Communication**: FastAPI BFF proxies via gRPC (high-performance)

**Trigger 3: Language-Specific Requirements**
- **Condition**: Enterprise customer requires .NET integration
- **Action**: Add C# (.NET) microservice for enterprise APIs
- **Deployment**: Azure App Service (Windows for .NET Framework if needed)
- **Communication**: FastAPI BFF proxies via HTTP/REST

**Trigger 4: Team Specialization**
- **Condition**: Hiring AI team (Python), infrastructure team (Go), enterprise team (.NET)
- **Action**: Split services by team ownership and language expertise
- **Deployment**: Multiple Azure Container Apps (one per service)
- **Communication**: FastAPI BFF orchestrates all services

---

## Positive Consequences

1. ✅ **FastAPI BFF can proxy to ANY language** (Java/Go/C#/Python/Rust)
2. ✅ **React frontend requires ZERO changes** during service extraction
3. ✅ **Incremental migration** reduces risk (extract one service at a time)
4. ✅ **Current architecture already supports this** (httpx usage is identical)
5. ✅ **Data-driven extraction** based on production metrics (no premature optimization)
6. ✅ **Team flexibility** - use best language for each domain

---

## Negative Consequences

1. ⚠️ **Temporary technical debt** - monolith remains until extraction justified
2. ⚠️ **Need service boundary planning** now to avoid tight coupling later
3. ⚠️ **Monitoring required** - must track metrics to identify extraction candidates
4. ⚠️ **Deployment complexity increases** when first service extracted (Docker Compose, orchestration)
5. ⚠️ **Distributed system challenges** - network latency, failure handling, distributed tracing

---

## Technical Implementation

### Current Architecture (Production Ready - Dec 2025)

```
┌─────────────────────────────┐
│ React Frontend              │
│ (TypeScript + Vite)         │
└──────────┬──────────────────┘
           │ HTTP/REST
           ▼
┌─────────────────────────────┐
│ FastAPI Monolith (Python)   │
│                             │
│ ├── main.py (routes)        │
│ ├── ai_service.py           │
│ ├── auth.py                 │
│ ├── vehicle_service.py      │
│ ├── models.py (SQLAlchemy)  │
│ └── schemas.py (Pydantic)   │
│                             │
│ External API Calls:         │
│ ├── Mapbox (routing)        │
│ ├── Google Gemini (AI)      │
│ └── Azure Maps (POI)        │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ PostgreSQL Database         │
│ (Azure Flexible Server)     │
└─────────────────────────────┘
```

**Deployment**: Single Azure App Service container (B1 SKU)

---

### Future Architecture (Post-Launch - Feb 2026+)

```
┌─────────────────────────────────────────────────────────────┐
│ React Frontend (TypeScript + Vite)                          │
└──────────┬──────────────────────────────────────────────────┘
           │ HTTP/REST
           ▼
┌───────────────────────────────────────────────────────────────┐
│ FastAPI BFF (Python - API Aggregation Layer)                 │
│                                                               │
│ Responsibilities:                                             │
│ ├── Request routing to microservices                         │
│ ├── Response aggregation (combine multiple service calls)    │
│ ├── Authentication/Authorization (JWT)                       │
│ ├── Rate limiting and caching                                │
│ └── Frontend-specific response formatting                    │
└───────────┬───────────────────────────────────────────────────┘
            │
            ├──────────► Java Service (Spring Boot)
            │            - User Management
            │            - Enterprise Integrations
            │            - Complex Business Logic
            │            PORT: 8080 (HTTP/REST)
            │
            ├──────────► Go Service (High-Performance)
            │            - Route Calculations
            │            - Real-time POI Search
            │            - Geospatial Operations
            │            PORT: 8081 (gRPC)
            │
            ├──────────► C# Service (.NET 8)
            │            - Analytics & Reporting
            │            - Data Warehousing
            │            - Azure Service Integration
            │            PORT: 8082 (HTTP/REST)
            │
            └──────────► Python Service (AI/ML)
                         - Azure OpenAI Integration
                         - Vehicle Spec Parsing (NLP)
                         - Trip Generation (AI-powered)
                         - Recommendation Engine
                         PORT: 8083 (HTTP/REST)
            
            ▼
┌─────────────────────────────┐
│ PostgreSQL Database         │
│ (Shared or Per-Service)     │
└─────────────────────────────┘
```

**Deployment**: Azure Container Apps (one per service) + Azure Application Gateway (load balancing)

---

## Code Examples

### Current Pattern (External API - Already BFF!)

```python
# backend/main.py - Current Mapbox API call
@app.post("/api/directions")
async def get_directions(request: DirectionsRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.mapbox.com/directions/v5/mapbox/driving",
            params={"access_token": MAPBOX_TOKEN},
            json=request.dict()
        )
        return response.json()
```

**This is already the BFF pattern!** FastAPI proxies to external Mapbox service.

---

### Future Pattern (Internal Go Service - IDENTICAL CODE!)

```python
# backend/main.py - Future Go routing service call
@app.post("/api/directions")
async def get_directions(request: DirectionsRequest):
    async with httpx.AsyncClient() as client:
        # ONLY THE URL CHANGES! Same httpx code!
        response = await client.post(
            "http://routing-service:8081/calculate-route",  # Internal Go service
            json=request.dict()
        )
        return response.json()
```

**Frontend requires ZERO changes** - React still calls `/api/directions` on FastAPI!

---

### Service Extraction Example: AI Service to Go

**Before (Monolith)**:
```python
# backend/ai_service.py - Current implementation
def parse_vehicle_specs(description: str) -> VehicleSpecs:
    # Call Google Gemini API
    response = genai.generate_content(prompt)
    return parse_response(response)
```

**After (Extracted to Go Microservice)**:

**FastAPI BFF** (minimal changes):
```python
# backend/main.py - Proxy to Go AI service
@app.post("/api/ai/parse-vehicle")
async def parse_vehicle(request: VehicleParseRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://ai-service:8083/api/v1/parse-vehicle",
            json=request.dict(),
            timeout=10.0  # AI calls may take longer
        )
        return response.json()
```

**Go AI Service** (new microservice):
```go
// ai-service/main.go - Standalone Go service
package main

import (
    "github.com/Azure/azure-sdk-for-go/sdk/ai/azopenai"
    "github.com/gin-gonic/gin"
)

func main() {
    router := gin.Default()
    
    router.POST("/api/v1/parse-vehicle", func(c *gin.Context) {
        var req VehicleParseRequest
        c.BindJSON(&req)
        
        // Call Azure OpenAI
        client := azopenai.NewClient(endpoint, credential)
        response := client.GetChatCompletions(ctx, req.Description)
        
        c.JSON(200, parseResponse(response))
    })
    
    router.Run(":8083")
}
```

**React Frontend** (NO CHANGES):
```typescript
// frontend/src/api/vehicle.ts - UNCHANGED!
export async function parseVehicleSpecs(description: string) {
  const response = await fetch('/api/ai/parse-vehicle', {
    method: 'POST',
    body: JSON.stringify({ description })
  });
  return response.json();
}
```

---

## Communication Protocols

### REST/HTTP (Default)
**When to Use**: Simple services, universal compatibility, easy debugging
```python
# FastAPI BFF → Python/Java/C# service
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://user-service:8080/api/users",
        json={"email": "user@example.com"}
    )
```

### gRPC (High-Performance)
**When to Use**: High-throughput services (Go routing), low latency requirements
```python
# FastAPI BFF → Go service (gRPC)
import grpc
from proto import routing_pb2, routing_pb2_grpc

channel = grpc.aio.insecure_channel('routing-service:8081')
stub = routing_pb2_grpc.RoutingServiceStub(channel)
response = await stub.CalculateRoute(request)
```

### GraphQL (Future - Optional)
**When to Use**: Complex data aggregation, frontend flexibility
```python
# FastAPI BFF → GraphQL gateway
query = """
  query {
    trip(id: "123") {
      stops { name, location }
      route { distance, duration }
    }
  }
"""
response = await graphql_client.execute(query)
```

---

## Service Extraction Checklist

When extracting a service from the monolith, follow this checklist:

### 1. Pre-Extraction Planning
- [ ] Identify service boundary (which modules to extract)
- [ ] Define API contract (OpenAPI 3.0 spec or Protobuf)
- [ ] Choose communication protocol (REST, gRPC, GraphQL)
- [ ] Select programming language (Python, Go, Java, C#)
- [ ] Estimate traffic/load (from Application Insights)
- [ ] Plan database strategy (shared vs. per-service)

### 2. Service Implementation
- [ ] Create new service project structure
- [ ] Implement API endpoints matching contract
- [ ] Add health check endpoint (`/health`)
- [ ] Implement retry logic and circuit breaker
- [ ] Add structured logging (JSON format)
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests (Docker Compose)

### 3. BFF Integration
- [ ] Update FastAPI to proxy requests to new service
- [ ] Add error handling for service failures
- [ ] Implement fallback logic (graceful degradation)
- [ ] Add request/response logging
- [ ] Configure timeouts (default: 30s)
- [ ] Test end-to-end flow

### 4. Deployment
- [ ] Create Dockerfile for service
- [ ] Add to docker-compose.yml (local development)
- [ ] Create Azure Container App (production)
- [ ] Configure environment variables
- [ ] Set up Application Insights (monitoring)
- [ ] Configure auto-scaling rules
- [ ] Test deployment in staging environment

### 5. Migration
- [ ] Deploy new service alongside monolith
- [ ] Route 10% of traffic to new service (canary)
- [ ] Monitor metrics (latency, errors, throughput)
- [ ] Gradually increase traffic to 100%
- [ ] Remove old code from monolith (once stable)
- [ ] Update documentation

### 6. Post-Migration
- [ ] Monitor service health for 7 days
- [ ] Review logs for errors/warnings
- [ ] Optimize performance based on metrics
- [ ] Document lessons learned
- [ ] Plan next service extraction

---

## Monitoring and Observability

### Key Metrics to Track (Application Insights)

**Service Health**:
- Request rate (requests/second)
- Error rate (errors/total requests)
- Latency (p50, p95, p99)
- Availability (uptime percentage)

**Business Metrics**:
- AI service usage (calls/day)
- Route calculations (per user session)
- POI searches (per trip)

**Infrastructure**:
- CPU utilization (per container)
- Memory usage (per container)
- Network I/O (between services)

### Distributed Tracing (Future)
When services are extracted, implement distributed tracing:
- Use **OpenTelemetry** for instrumentation
- Send traces to **Azure Monitor** or **Jaeger**
- Trace request flow: React → FastAPI BFF → Microservice → Database

---

## Migration Timeline

### ✅ December 2025: Production Ready
- **Architecture**: FastAPI Monolith
- **Focus**: Critical issues (#2, #3, #4, #5)
- **Deployment**: Single Azure App Service
- **Status**: **CURRENT STATE**

### 📊 February 2026: Post-Launch Monitoring
- **Architecture**: FastAPI Monolith (still)
- **Focus**: Collect metrics (Issue #8 - Application Insights)
- **Activities**: 
  - Monitor AI service usage
  - Track routing performance
  - Identify bottlenecks
- **Status**: **EVALUATION PHASE**

### 🏗️ March 2026+: Selective Extraction
- **Architecture**: FastAPI BFF + 1-2 Microservices
- **Focus**: Extract first service based on data
- **Candidates**:
  - **Option A**: AI Service (if high traffic) → Go/Python
  - **Option B**: Routing Service (if performance issue) → Go
- **Status**: **IMPLEMENTATION PHASE** (if triggers met)

---

## Alternatives Considered

### Alternative 1: API Gateway (Kong, AWS API Gateway)
**Why Not**: Adds another layer between frontend and backend. BFF pattern with FastAPI provides same functionality with less complexity.

### Alternative 2: Service Mesh (Istio, Linkerd)
**Why Not**: Overkill for 2-3 services. Consider when 5+ microservices deployed.

### Alternative 3: Serverless Functions (Azure Functions)
**Why Not**: Current services are stateful (database connections). Serverless better for event-driven, stateless workloads.

### Alternative 4: Rewrite Everything in Go/Java
**Why Not**: 
- Existing FastAPI code works well
- Python excellent for AI/ML integration
- Polyglot approach allows best tool for each job

---

## References

1. **BFF Pattern**: https://samnewman.io/patterns/architectural/bff/
2. **Microservices Migration**: https://martinfowler.com/articles/break-monolith-into-microservices.html
3. **FastAPI with Microservices**: https://fastapi.tiangolo.com/advanced/async-sql-databases/
4. **Azure Container Apps**: https://learn.microsoft.com/en-us/azure/container-apps/
5. **gRPC with Python**: https://grpc.io/docs/languages/python/
6. **OpenTelemetry**: https://opentelemetry.io/docs/

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-06 | Development Team | Initial ADR - BFF architecture strategy |

---

## Approval

**Decision**: ✅ **ACCEPTED**  
**Date**: December 6, 2025  
**Reviewers**: Development Team  

**Next Review**: February 2026 (after Production Ready milestone, based on metrics)
