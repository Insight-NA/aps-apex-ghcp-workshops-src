# Workshop 3: Advanced Web Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, Zustand/Pydantic patterns

> **Codebase Reference**: All demos use real files from the Road Trip Planner polyglot microservices app.  
> Architecture: Frontend (React+Vite :5173) → BFF (Node :3000) → Python (:8000) / C# (:8081) / Java (:8082) → PostgreSQL

---

## Learning Objectives

By the end of this workshop, you will master these **8 advanced Copilot techniques**:

1. **Chain-of-Thought Prompting** - Break complex features into logical reasoning steps
2. **Instruction Files** - Customize `.github/copilot-instructions.md` with project-specific rules
3. **Prompt Files** - Create reusable `.prompt.md` files for consistent code generation
4. **Copilot Code Review** - Use Copilot to review PRs, identify issues, and suggest fixes
5. **Copilot Plan Mode** - Architect multi-step solutions before implementation
6. **Copilot Coding Agent** - Delegate autonomous multi-file tasks to Copilot agents
7. **Copilot Agent HQ** - Manage and orchestrate custom agents for specialized workflows
8. **Architecture & Tech Stack Generation** - Generate project scaffolding and tech decisions

---

## Workshop Agenda

| Time | Demo | Topic | Focus Files |
|------|------|-------|-------------|
| 0-10 min | Demo 1 | Chain-of-Thought Prompting | `backend/vehicle_service.py`, `backend/schemas.py` |
| 10-20 min | Demo 2 | Instruction Files | `.github/copilot-instructions.md` (471 lines) |
| 20-30 min | Demo 3 | Prompt Files | `.github/prompts/*.prompt.md` (3 existing) |
| 30-40 min | Demo 4 | Copilot Code Review | `backend-csharp/Services/AiParsingService.cs` |
| 40-55 min | Demo 5 | Copilot Plan Mode | `backend/tests/`, `.github/prompts/plan-mockExternalApisBackendTests.prompt.md` |
| 55-70 min | Demo 6 | Copilot Coding Agent | `frontend/src/store/`, `frontend/src/utils/`, `backend/schemas.py` |
| 70-80 min | Demo 7 | Copilot Agent HQ | `.github/copilot-agents/` (17 agents) |
| 80-90 min | Demo 8 | Architecture & Tech Stack Generation | `backend-csharp/`, `docs/adr/`, `infrastructure/terraform/` |

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex features into step-by-step reasoning chains that guide Copilot toward correct solutions.

### Scenario
Enhance the vehicle specification system by adding vehicle-aware routing parameters to the Python backend's `/api/vehicle-specs` endpoint. This connects the AI parsing flow (C# backend at `:8081`) with the geospatial routing flow (Java backend at `:8082`).

> **Architecture Context**: Per the BFF route table in `.github/copilot-instructions.md`:
> - `/api/vehicle-specs` → Python backend (:8000) — fallback + orchestration
> - `/api/v1/parse-vehicle` → C# backend (:8081) — Azure OpenAI parsing
> - `/api/directions` → Java backend (:8082) — Mapbox routing

### Live Coding Steps

**Step 1: Write chain-of-thought prompt**
```python
# In backend/vehicle_service.py, before get_vehicle_specs():

"""
CHAIN OF THOUGHT: Add routing profile and metric conversions to vehicle specs

Step 1: Identify requirements
- The existing get_vehicle_specs() returns height/width/length/weight in metric
- Mapbox Directions API needs: profile, height(m), weight(kg), width(m)
- Accept vehicle_type from our 9 types: car, suv, mini_van, van, truck, rv_small, rv_large, ev_sedan, ev_truck
- Return routing metadata alongside vehicle specs

Step 2: Review existing data model
- VehicleSpecsResponse in schemas.py has: height, width, length, weight, fuelType, range, mpg
- DEFAULT_VEHICLE_SPECS already stores values in metric (meters, tonnes)
- Need to add: mapbox_profile, is_oversized, routing_restrictions dict

Step 3: Implement profile mapping
- car/suv/mini_van/ev_sedan → 'mapbox/driving' (standard vehicles)
- van/truck/rv_small/rv_large/ev_truck → 'mapbox/driving-traffic' (with restrictions)
- Note: Mapbox 'truck' profile requires Premium; use 'driving-traffic' with restriction params

Step 4: Build routing restrictions
- Only for oversized vehicles (height > 2.0m OR weight > 3.5 tonnes)
- Convert weight from tonnes to kg for Mapbox API (×1000)
- height and width already in meters (no conversion needed)

Step 5: Return enriched response
- Original vehicle specs + mapbox_profile + routing_restrictions
- routing_restrictions only populated for oversized vehicles

Now implement:
"""
```

**Step 2: Accept Copilot suggestions following the chain**
```python
# Copilot should generate based on each step:
def get_mapbox_profile(vehicle_type: str) -> str:
    """Step 3: Map vehicle type to Mapbox routing profile."""
    oversized_types = {'van', 'truck', 'rv_small', 'rv_large', 'ev_truck'}
    if vehicle_type in oversized_types:
        return 'mapbox/driving-traffic'  # Supports vehicle restrictions
    return 'mapbox/driving'

def get_routing_restrictions(vehicle_type: str) -> dict | None:
    """Step 4: Build Mapbox restriction params for oversized vehicles."""
    specs = DEFAULT_VEHICLE_SPECS.get(vehicle_type)
    if not specs:
        return None
    
    # Only apply restrictions for tall/heavy vehicles
    if specs['height'] <= 2.0 and specs['weight'] <= 3.5:
        return None
    
    return {
        'height': specs['height'],           # Already in meters
        'width': specs['width'],             # Already in meters
        'weight': int(specs['weight'] * 1000) # Tonnes → kg for Mapbox
    }
```

**Step 3: Show why the chain matters — compare with a weak prompt**
```python
# ❌ WITHOUT chain-of-thought (vague, Copilot may hallucinate):
# "Add Mapbox truck routing to vehicle service"
# → Copilot might invent 'mapbox/truck' profile (doesn't exist!)
# → Copilot might use imperial units (Mapbox requires metric)
# → Copilot might ignore the 9 existing vehicle types

# ✅ WITH chain-of-thought (grounded in real code):
# Each step references actual code: DEFAULT_VEHICLE_SPECS, VehicleSpecsResponse
# Conversions are explicit: tonnes→kg (×1000), already-metric heights
# Profile names are correct: 'mapbox/driving-traffic' (not 'mapbox/truck')
```

### Teaching Points

| Chain-of-Thought Formula | Road Trip Planner Example |
|-------------------------|--------------------------|
| Step 1: Requirements | 9 vehicle types, Mapbox metric units, BFF routing |
| Step 2: Data model | `VehicleSpecsResponse` in `schemas.py`, `DEFAULT_VEHICLE_SPECS` dict |
| Step 3: Business logic | Profile mapping, oversized vehicle detection |
| Step 4: Integration | Mapbox API params: `height`(m), `weight`(kg), `width`(m) |
| Step 5: Response | Original specs + `mapbox_profile` + `routing_restrictions` |

**When to Use**: Multi-step features, unfamiliar APIs, cross-service integration  
**Avoid**: Simple CRUD operations, straightforward implementations  
**Pro Tip**: Use `@context7` (Workshop 4 topic) to validate API parameters like Mapbox profiles before writing the chain

---

## Demo 2: Instruction Files (10 min)

### Objective
Understand how `.github/copilot-instructions.md` encodes project-specific rules that Copilot automatically follows — and how to extend it.

> **Key Insight**: This project already has a **471-line instruction file** with architecture tables, technology mandates, and coding standards. This demo shows the real file, not a fabricated example.

### Scenario
Walk through the existing instruction file's key sections, then add a new rule to address a real gap.

### Live Coding Steps

**Step 1: Open and explore the real instruction file**
```bash
# Open the existing 471-line instruction file
code .github/copilot-instructions.md
```

**Highlight these 4 sections already in the file:**

1. **Architecture Adherence** (12 technology mandates)
```markdown
# Already present in .github/copilot-instructions.md:

### Architecture Adherence (CRITICAL)
**DO NOT override or replace existing technology choices:**
- **State Management**: Zustand ONLY (NOT Redux, MobX, or Context API for global state)
- **HTTP Client**: Axios via `axiosInstance` (with auth interceptors) — do NOT use raw `fetch`
- **Styling**: Tailwind CSS ONLY (NOT Bootstrap, Material-UI, or CSS Modules)
- **AI Provider**: Azure OpenAI (in C# backend, NOT Google Gemini)
# ... 12 mandates total
```

2. **BFF Route Table** (which backend handles which endpoint)
```markdown
# Already present — critical for cross-service prompts:

### BFF Route Table
| Frontend Path | Backend | Service |
|---|---|---|
| `/api/auth/*` | `backend-python:8000` | Python |
| `/api/v1/parse-vehicle` | `backend-csharp:8081` | C# |
| `/api/directions*` | `backend-java:8082` | Java |
| `/health` | BFF (aggregated) | All |
```

3. **No Hardcoded Strings** (with ❌/✅ examples)
```markdown
# Already present with concrete examples:

### No Hardcoded Strings (STRICTLY ENFORCED)
# ❌ WRONG - hardcoded URL
fetch('https://api.mapbox.com/directions/v5/mapbox/driving');
# ✅ CORRECT - use environment variable
fetch(`${import.meta.env.VITE_API_URL}/api/directions`);
```

4. **TDD Mandate** (testing strategy)
```markdown
# Already present — enforces test-first development:

## Testing Strategy (TDD Mandate)
**Write tests BEFORE implementation**
# Backend: pytest + unittest.mock for mocking external APIs
# Frontend: Vitest + @testing-library/react
```

**Step 2: Add a NEW rule for GeoJSON coordinate format**
```markdown
<!-- Add to .github/copilot-instructions.md under Code Standards -->

### GeoJSON Coordinate Format (CRITICAL)

**ALWAYS use `[longitude, latitude]` order — never `[lat, lng]`**

This aligns with: GeoJSON RFC 7946, Mapbox GL JS, and the existing `Coordinates` type in `frontend/src/types/index.ts`.

```typescript
// Type already defined in frontend/src/types/index.ts:
export type Coordinates = [number, number]; // [lng, lat]

// ❌ WRONG - Google Maps order
const sf = [37.7749, -122.4194];  // [lat, lng]

// ✅ CORRECT - GeoJSON order
const sf: Coordinates = [-122.4194, 37.7749];  // [lng, lat]
```

**Copilot should always use the `Coordinates` type from `src/types/index.ts` instead of inline `[number, number]`.**
```

**Step 3: Verify the instruction file takes effect**
```bash
# Open a new TypeScript file and type:
# "Create coordinates for San Francisco"
# Expected: Copilot suggests [-122.4194, 37.7749] with Coordinates type
# NOT [37.7749, -122.4194]

# Type: "Create a state management store for favorites"
# Expected: Copilot uses Zustand (not Redux or Context API)
# because of the Architecture Adherence mandates
```

### Teaching Points

| Instruction File Pattern | Real Example from This Project |
|-------------------------|-------------------------------|
| Architecture mandates | 12 tech choices (Zustand, axiosInstance, Tailwind, etc.) |
| Route/service mapping | BFF Route Table → prevents wrong-backend calls |
| ❌/✅ contrast examples | No Hardcoded Strings, No `any` Types |
| Enforcement strategy | "STRICTLY ENFORCED", "CRITICAL" keywords |
| Cross-references | Links to `PROJECT_INSTRUCTIONS.md`, `ROADMAP.md` |

**Rule Writing Principles**:
- Use **🚨 CRITICAL** or **STRICTLY ENFORCED** for non-negotiable rules
- Always provide ❌ WRONG and ✅ CORRECT code-fenced examples
- Reference exact file paths where patterns exist (e.g., `src/types/index.ts`)
- Keep rules specific — "use `axiosInstance`" is better than "use proper HTTP client"
- Our 471-line file proves: **more specific = better Copilot compliance**

---

## Demo 3: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files for consistent code generation patterns. This project already has 3 prompt files — we'll examine them and create a new one.

> **Existing Prompt Files** (already in `.github/prompts/`):
> 1. `version-update.prompt.md` — Semantic versioning workflow
> 2. `plan-azureIacRoadmapUpdate.prompt.md` — Azure infrastructure planning
> 3. `plan-mockExternalApisBackendTests.prompt.md` — Test mocking strategy (see Demo 5)

### Scenario
Examine the existing mock-external-APIs prompt file, then create a new prompt file for generating typed FastAPI endpoints.

### Live Coding Steps

**Step 1: Show a real prompt file from this project**
```markdown
<!-- Actual content from .github/prompts/plan-mockExternalApisBackendTests.prompt.md -->

## Plan: Mock External APIs in Backend Tests (Issue #4) - Final

Mock 5 httpx-based external API endpoints using `unittest.mock.patch`,
with JSON fixtures in separate files, keeping tests in `test_main.py`,
and including error response test cases.

### Steps

1. **Create fixture directory and JSON files** in `backend/tests/fixtures/`:
   - `mapbox_geocode.json` + `mapbox_geocode_error.json`
   - `mapbox_directions.json` + `mapbox_directions_error.json`
   - `azure_maps_search.json` + `azure_maps_search_error.json`
   - `ai_service_vehicle.json` + `ai_service_vehicle_error.json`

2. **Create backend/tests/conftest.py** with:
   - Fixture loader helper to read JSON files
   - `@pytest.fixture` for each mock response (success + error)
   - Shared `httpx.AsyncClient` patching using `unittest.mock`

3. **Update backend/tests/test_main.py** with mocked tests:
   - `test_geocode_success` + `test_geocode_error`
   - `test_directions_success` + `test_directions_error`
   - ...

4. **Remove `continue-on-error: true`** from CI workflow

5. **Verify locally** with `pytest -v`
```

> **Key Design Choice**: This prompt specifies `unittest.mock.patch` (not `pytest-httpx`) because that's the established pattern in `backend/tests/conftest.py`. Prompt files should encode **real project conventions**, not general best practices.

**Step 2: Create a new prompt file for FastAPI endpoints**
```markdown
<!-- .github/prompts/fastapi-endpoint.prompt.md -->

# FastAPI Endpoint Generator

Generate a FastAPI endpoint following Road Trip Planner conventions and the
patterns established in `backend/main.py`.

## Architecture Context
- All external API calls are proxied through backends (see BFF Route Table)
- Python backend handles: auth, trips CRUD, vehicle specs fallback
- Service logic goes in `backend/*_service.py`, NOT inline in route handlers
- Schemas go in `backend/schemas.py` using Pydantic BaseModel

## Requirements
- Use Pydantic models for request/response (see `backend/schemas.py`)
- Follow service-layer pattern (see `backend/vehicle_service.py`)
- Use `HTTPException` with clear status codes
- Include docstring with OpenAPI description
- Mock external calls using `unittest.mock.patch` (NOT pytest-httpx)
- No hardcoded strings (use constants)

## Template
```python
from pydantic import BaseModel, Field
from fastapi import HTTPException, Depends

class {{EndpointName}}Request(BaseModel):
    """Request schema — add to backend/schemas.py."""
    # Fields with types and validation

class {{EndpointName}}Response(BaseModel):
    """Response schema — add to backend/schemas.py."""
    # Fields with types

@app.post("/api/{{endpoint_path}}", response_model={{EndpointName}}Response)
async def {{function_name}}(
    request: {{EndpointName}}Request,
    db: AsyncSession = Depends(get_db)
) -> {{EndpointName}}Response:
    """{{Description for OpenAPI docs}}."""
    try:
        result = await {{service_name}}.{{method}}(request)
        return {{EndpointName}}Response(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Checklist
- [ ] Schema in `backend/schemas.py` (not inline)
- [ ] Logic in `backend/*_service.py` (not in route handler)
- [ ] Tests in `backend/tests/` with `unittest.mock` fixtures
- [ ] No `any`/`Any` types in schema (use explicit types)
- [ ] Route registered in BFF proxy (`bff/src/index.ts`)
```

**Step 3: Use the prompt file in Copilot Chat**
```
# In Copilot Chat:
@workspace #file:.github/prompts/fastapi-endpoint.prompt.md

Create a trip-sharing endpoint:
- POST /api/share-trip
- Input: trip_id (int), is_public (bool)
- Output: share_url (str), expires_at (datetime)
- Service: sharing_service.py
```

### Teaching Points

| Prompt File Element | Purpose | Example from This Project |
|--------------------|---------|--------------------------|
| Architecture Context | Ground in real stack | "Service logic in `*_service.py`" |
| Requirements | Enforce project rules | "`unittest.mock.patch` not pytest-httpx" |
| Template | Structural consistency | Pydantic request/response pattern |
| Placeholders `{{}}` | Dynamic substitution | `{{EndpointName}}`, `{{service_name}}` |
| Checklist | Verification gates | Schema in schemas.py, tests exist |

**Benefits**:
- **Consistency**: Every endpoint follows the same service-layer pattern
- **Onboarding**: New developers generate correct code immediately
- **Version-controlled**: Prompts evolve with the codebase
- **Real conventions**: Encodes actual patterns (unittest.mock, not pytest-httpx)

---

## Demo 4: Copilot Code Review (10 min)

### Objective
Use Copilot to review real production code for security vulnerabilities, SOLID violations, and type safety issues.

### Scenario
Review `backend-csharp/Services/AiParsingService.cs` — the C# backend's Azure OpenAI integration. This file has **real deficiencies** documented in `docs/CSHARP_BACKEND_ROADMAP.md`: 0 tests, 5 SOLID violations, 6 security gaps.

> **Why this file?** Unlike fabricated code review demos, this file has actual production issues that Copilot can find. The C# Backend Roadmap already catalogues them — this demo shows Copilot independently discovering the same issues.

### Live Coding Steps

**Step 1: Open the real file and invoke review**
```
# In Copilot Chat:
@workspace Review backend-csharp/Services/AiParsingService.cs for:
1. OWASP Top 10 security vulnerabilities
2. SOLID principle violations
3. Missing error handling
4. Testability issues (the C# backend has 0 tests)
5. Hardcoded strings (per .github/copilot-instructions.md rules)

Also reference docs/CSHARP_BACKEND_ROADMAP.md for known issues.
```

**Step 2: Expected Copilot review output**
```markdown
## Code Review: AiParsingService.cs

### 🔴 Critical Issues

**1. SEC-1: Prompt Injection Risk** (Line 22-35)
```csharp
// ❌ Current: User input is interpolated into system prompt
private const string VehicleParsingSystemPrompt = @"You are a vehicle
specification parser. Given a vehicle description, extract structured
specifications. Return ONLY valid JSON...";

// The user-supplied 'description' is sent as a user message alongside
// this system prompt — no input sanitization or guardrails.

// ✅ Fix: Add input sanitization and response validation
public async Task<ParseVehicleResponse> ParseVehicleAsync(string description)
{
    // Sanitize input — strip potential prompt injection attempts
    var sanitized = SanitizeInput(description);
    
    // Validate response matches expected JSON schema
    var response = await ParseWithAzureOpenAI(sanitized);
    ValidateResponseSchema(response);
    return response;
}
```

**2. DIP Violation: Hardcoded Environment Variables** (Line 39-42)
```csharp
// ❌ Current: Direct Environment.GetEnvironmentVariable calls
_endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT");
_apiKey = Environment.GetEnvironmentVariable("AZURE_OPENAI_API_KEY");
_deployment = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT");

// ✅ Fix: Use IConfiguration via dependency injection
public AiParsingService(
    ILogger<AiParsingService> logger,
    IConfiguration configuration)  // Inject configuration
{
    _endpoint = configuration["AzureOpenAI:Endpoint"];
    _apiKey = configuration["AzureOpenAI:ApiKey"];
    _deployment = configuration["AzureOpenAI:Deployment"];
}
```

### 🟡 Warnings

**3. SRP Violation: 4 Responsibilities**
```csharp
// AiParsingService currently handles:
// 1. Azure OpenAI client creation
// 2. Vehicle description parsing
// 3. Trip plan generation
// 4. Rule-based fallback logic

// ✅ Fix: Extract to focused services
// - IAzureOpenAIClientFactory (responsibility 1)
// - IVehicleParsingService (responsibility 2)
// - ITripGenerationService (responsibility 3)
// - IRuleBasedFallbackService (responsibility 4)
```

**4. OCP Violation: If/Else Chains** (Fallback logic)
```csharp
// ❌ Current: New vehicle types require modifying existing code
if (vehicleType == "car") { ... }
else if (vehicleType == "truck") { ... }
else if (vehicleType == "rv") { ... }

// ✅ Fix: Strategy pattern with IVehicleSpecResolver dictionary
```

### 🟢 Suggestions

**5. Zero Test Coverage**
```csharp
// The entire C# backend has 0 tests (per CSHARP_BACKEND_ROADMAP.md)
// Priority tests for this service:
// - ParseVehicleAsync with valid description → correct JSON
// - ParseVehicleAsync with Azure OpenAI unavailable → fallback
// - ParseVehicleAsync with invalid description → error handling
// - GenerateTripAsync with valid request → structured trip
// Use xUnit + Moq (established .NET testing pattern)
```

**6. Missing Authentication** (VehicleController.cs)
```csharp
// ❌ Current: No auth on endpoints
[HttpPost("parse-vehicle")]
public async Task<IActionResult> ParseVehicle(...)

// ✅ Fix: Add authorization
[HttpPost("parse-vehicle")]
[Authorize]
public async Task<IActionResult> ParseVehicle(...)
```

### Summary
| Severity | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 2 | Prompt injection, DIP violation |
| 🟡 Warning | 2 | SRP violation, OCP violation |
| 🟢 Suggestion | 2 | Zero tests, missing auth |

**Cross-reference**: All 6 issues match findings in `docs/CSHARP_BACKEND_ROADMAP.md`
(8 epics, 25 tasks, 19-29 hours estimated effort).
```

**Step 3: Apply a fix with Copilot**
```
# In Copilot Chat:
@workspace Fix the DIP violation in AiParsingService.cs
Replace Environment.GetEnvironmentVariable calls with IConfiguration injection.
Follow ASP.NET 8 dependency injection patterns.
```

### Teaching Points

| Review Category | What Copilot Found | Real File Location |
|----------------|--------------------|--------------------|
| 🔴 Security | Prompt injection risk | `AiParsingService.cs:22-35` |
| 🔴 SOLID (DIP) | Hardcoded env vars | `AiParsingService.cs:39-42` |
| 🟡 SOLID (SRP) | 4 responsibilities | `AiParsingService.cs` (entire class) |
| 🟡 SOLID (OCP) | If/else vehicle types | `AiParsingService.cs` (fallback logic) |
| 🟢 Testing | 0 test coverage | `backend-csharp/` (no test project) |
| 🟢 Auth | No endpoint auth | `VehicleController.cs` |

**Code Review Prompt Templates**:
```
# Security-focused (OWASP Top 10)
@workspace Review [file] for injection, broken auth, sensitive data exposure

# SOLID principles
@workspace Review [file] for SRP, OCP, LSP, ISP, DIP violations

# Cross-reference with roadmap
@workspace Compare [file] issues with docs/CSHARP_BACKEND_ROADMAP.md findings

# Test coverage gaps
@workspace What tests are missing for [service]? Use xUnit + Moq pattern.
```

---

## Demo 5: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect multi-step solutions before implementation. This demo uses a **real prompt file** that already exists in the project.

### Scenario
Create a comprehensive plan to mock external APIs in backend tests (Issue #4). The prompt file `.github/prompts/plan-mockExternalApisBackendTests.prompt.md` already defines this plan — we'll use Plan Mode to execute and refine it.

> **Reality Check**: The project already has:
> - 10 JSON fixture files in `backend/tests/fixtures/` (mapbox_geocode, mapbox_directions, azure_maps_search, etc.)
> - A `conftest.py` using `unittest.mock` with `MagicMock`, `AsyncMock`, and `patch`
> - A `load_fixture()` helper that reads JSON files from the fixtures directory
>
> This demo shows Plan Mode working with **existing infrastructure**, not starting from scratch.

### Live Coding Steps

**Step 1: Invoke Plan Mode with the existing prompt file**
```
# In Copilot Chat, click "Plan" button or type:
@workspace #file:.github/prompts/plan-mockExternalApisBackendTests.prompt.md

Create a plan to add remaining mock tests for the optimize endpoint.

Context:
- Existing pattern in backend/tests/conftest.py uses unittest.mock (NOT pytest-httpx)
- 10 JSON fixtures already exist in backend/tests/fixtures/
- conftest.py has load_fixture() helper and named pytest fixtures
- Tests use AsyncMock for httpx.AsyncClient patching
```

**Step 2: Review generated plan — note it follows real patterns**
```markdown
## Plan: Add Optimize Endpoint Mock Tests

### Phase 1: Verify Existing Infrastructure (2 min)
☐ 1.1 Confirm fixtures exist: `mapbox_optimize.json`, `mapbox_optimize_error.json`
☐ 1.2 Confirm conftest.py has `mapbox_optimize_fixture` and `mapbox_optimize_error_fixture`

### Phase 2: Write Tests Following Existing Pattern (10 min)
☐ 2.1 Add `test_optimize_success` to `test_main.py`
```python
# Following the REAL pattern from conftest.py:
from unittest.mock import patch, AsyncMock, MagicMock

@pytest.mark.asyncio
async def test_optimize_success(client, mapbox_optimize_fixture):
    """Test optimize endpoint with mocked Mapbox response."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mapbox_optimize_fixture
    mock_response.raise_for_status = MagicMock()

    with patch("httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        response = await client.post("/api/optimize", json={
            "coordinates": [[-122.4194, 37.7749], [-118.2437, 34.0522]]
        })

    assert response.status_code == 200
    assert "trips" in response.json()
```

☐ 2.2 Add `test_optimize_error` for error handling
```python
@pytest.mark.asyncio
async def test_optimize_error(client, mapbox_optimize_error_fixture):
    """Test optimize endpoint handles Mapbox errors gracefully."""
    mock_response = MagicMock()
    mock_response.status_code = 422
    mock_response.json.return_value = mapbox_optimize_error_fixture
    mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
        "422", request=MagicMock(), response=mock_response
    )
    # ... same patching pattern
```

### Phase 3: Verify & Cleanup (3 min)
☐ 3.1 Run: `pytest tests/ -v --no-header`
☐ 3.2 Verify no network calls: `pytest tests/ -v --timeout=5`
☐ 3.3 Check coverage: `pytest --cov=. --cov-report=term-missing`

**Success Criteria**:
✅ Tests pass without network calls
✅ Both success and error paths covered
✅ Pattern matches existing `conftest.py` conventions (unittest.mock, not pytest-httpx)
✅ Test runtime < 5 seconds per test
```

**Step 3: Execute plan step-by-step with Copilot**
```
# In Copilot Chat:
@workspace Execute Phase 2.1 of the plan.
Use the same mocking pattern from backend/tests/conftest.py.
Follow the existing test style in backend/tests/test_main.py.
```

### Teaching Points

| Plan Mode Element | Purpose | This Project Example |
|------------------|---------|---------------------|
| Phase grouping | Logical progression | Verify → Write → Verify |
| Checkboxes ☐ | Track progress | 5 checkboxes across 3 phases |
| Real code snippets | Pattern alignment | `unittest.mock` pattern from conftest.py |
| Time estimates | Set expectations | 2 + 10 + 3 = 15 min total |
| Success criteria | Definition of done | No network calls, < 5s runtime |
| Existing context | Ground in reality | References 10 existing fixtures |

**When to Use Plan Mode**:
- Complex refactoring spanning multiple files
- Test infrastructure that must match existing patterns
- Tasks with a `.prompt.md` file that defines the strategy
- Team collaboration (share plan for review before coding)

**When NOT to Use Plan Mode**:
- Simple, single-file changes
- Well-understood patterns with no ambiguity
- Quick bug fixes with obvious solutions

---

## Demo 6: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file tasks to Copilot's coding agent for complex refactoring across the polyglot codebase.

### Scenario
Use the coding agent to fix all `any` type violations across the frontend and Python backend. There are **7 real violations** (not 20) — accuracy matters when scoping agent work.

> **Real Violation Inventory** (verified by grep):
> | File | Line(s) | Violation |
> |------|---------|-----------|
> | `frontend/src/store/useTripStore.ts` | 140, 198, 246 | `catch (error: any)` (3 instances) |
> | `frontend/src/utils/axios.ts` | 12, 13 | `resolve: (value?: any)`, `reject: (reason?: any)` |
> | `backend/schemas.py` | 33 | `stops: List[Any]` |
> | `backend/schemas.py` | 34 | `vehicle_specs: Any` |

### Live Coding Steps

**Step 1: Invoke Copilot Coding Agent with precise scope**
```
# In Copilot Chat (Coding Agent mode):
Fix all `any` type violations in the frontend and Python backend.

Inventory (7 total violations):

## TypeScript (5 violations)
1. frontend/src/store/useTripStore.ts:140 - catch (error: any)
2. frontend/src/store/useTripStore.ts:198 - catch (error: any)
3. frontend/src/store/useTripStore.ts:246 - catch (error: any)
4. frontend/src/utils/axios.ts:12 - resolve: (value?: any)
5. frontend/src/utils/axios.ts:13 - reject: (reason?: any)

## Python (2 violations)
6. backend/schemas.py:33 - stops: List[Any]
7. backend/schemas.py:34 - vehicle_specs: Any

Rules from .github/copilot-instructions.md:
- No `any` types allowed — use interfaces, `unknown`, or specific types
- Use existing types from frontend/src/types/index.ts (Stop, VehicleSpecs)
- For catch blocks, use `unknown` then narrow with type guards

For each violation:
1. Identify the correct replacement type
2. Apply the fix
3. Verify TypeScript/Python compiles
```

**Step 2: Agent executes autonomously**
```markdown
## Agent Progress Report

### File 1: useTripStore.ts (3 violations)
**Found**: Lines 140, 198, 246 - `catch (error: any)`
**Fix**: Replace with `unknown` + type guard pattern
```typescript
// ❌ Before (3 identical violations)
catch (error: any) {
    set({ error: error.message || 'An error occurred' });
}

// ✅ After (all 3 locations)
catch (error: unknown) {
    const message = error instanceof Error
        ? error.message
        : 'An error occurred';
    set({ error: message });
}
```
**Status**: ✅ 3/3 fixed

### File 2: axios.ts (2 violations)
**Found**: Lines 12-13 - `resolve: (value?: any)`, `reject: (reason?: any)`
**Fix**: Type the failed queue properly
```typescript
// ❌ Before
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = [];

// ✅ After
interface QueueItem {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];
```
**Status**: ✅ 2/2 fixed

### File 3: schemas.py (2 violations)
**Found**: Lines 33-34 - `stops: List[Any]`, `vehicle_specs: Any`
**Fix**: Import and use proper Pydantic models
```python
# ❌ Before
class TripBase(BaseModel):
    stops: List[Any]        # Line 33
    vehicle_specs: Any      # Line 34

# ✅ After — use typed models (create if needed)
from typing import Optional

class StopSchema(BaseModel):
    name: str
    coordinates: list[float]  # [lng, lat]
    stop_type: str            # 'start' | 'end' | 'stop'

class VehicleSpecsSchema(BaseModel):
    height: float
    width: float
    length: float
    weight: float
    fuel_type: Optional[str] = None

class TripBase(BaseModel):
    stops: list[StopSchema]
    vehicle_specs: Optional[VehicleSpecsSchema] = None
```
**Status**: ✅ 2/2 fixed

### Summary
- Files processed: 3
- Violations fixed: 7/7
- New types created: `QueueItem` (TS), `StopSchema` + `VehicleSpecsSchema` (Python)
- Compile errors: 0
```

**Step 3: Verify agent work**
```bash
# TypeScript verification
cd frontend && npx tsc --noEmit
# Expected: 0 errors (was 5 any violations)

# Python verification
cd backend && python -c "from schemas import TripBase; print('OK')"
# Expected: OK (schema imports succeed)

# Grep to confirm no remaining violations
grep -rn "any" frontend/src/store/useTripStore.ts frontend/src/utils/axios.ts
grep -rn "Any" backend/schemas.py
# Expected: 0 matches
```

### Teaching Points

| Agent Best Practice | Example from This Demo |
|--------------------|----------------------|
| **Precise scope** | 7 violations enumerated with file:line |
| **Real inventory** | Verified by grep, not estimated |
| **Rules reference** | Points to `.github/copilot-instructions.md` |
| **Existing types** | Uses `Stop`, `VehicleSpecs` from `src/types/` |
| **Verification steps** | `tsc --noEmit`, `python -c`, `grep` |

**Agent Prompt Formula**:
```
1. Inventory: List every instance with file:line
2. Rules: Reference instruction file mandates
3. Existing types: Point to types that should be reused
4. Per-instance steps: Identify → Fix → Verify
5. Final verification: Compile check + grep for zero remaining
```

**Common Pitfall**: Saying "fix all 20 `any` violations" when there are only 7. The agent wastes time searching for violations that don't exist. **Always grep first, then scope the agent prompt.**

---

## Demo 7: Copilot Agent HQ (10 min)

### Objective
Understand how to create, manage, and orchestrate custom agents using the `.chatagent` frontmatter format in `.github/copilot-agents/`.

> **This project has 17 custom agents** — more than most enterprise projects. We'll examine the real agent format, showcase key agents, and demonstrate orchestration patterns.

### Scenario
Explore the existing agent ecosystem and create a new specialized agent following the established `.chatagent` frontmatter format.

### Live Coding Steps

**Step 1: Examine the real agent format — Context7 agent (835 lines)**

```markdown
<!-- .github/copilot-agents/context7.agent.md -->
<!-- Uses .chatagent frontmatter format (NOT YAML registry) -->

---
name: Context7-Expert
description: Expert in latest library versions, best practices, and correct syntax
argument-hint: 'Ask about specific libraries/frameworks (e.g., "Next.js routing")'
tools: ['read', 'search', 'web', 'context7/*']
mcp-servers:
  context7:
    type: http
    url: "https://mcp.context7.com/mcp"
    headers: {"CONTEXT7_API_KEY": "${{ secrets.COPILOT_MCP_CONTEXT7 }}"}
    tools: ["get-library-docs", "resolve-library-id"]
handoffs:
  - label: Implement with Context7
    agent: agent
    prompt: Implement the solution using the Context7 best practices above.
    send: false
---

# Context7 Documentation Expert

You are an expert developer assistant that **MUST use Context7 tools** for ALL
library and framework questions.

## 🚨 CRITICAL RULE
BEFORE answering ANY question about a library, you MUST:
1. STOP - Do NOT answer from memory
2. IDENTIFY - Extract the library name
3. CALL `mcp_context7_resolve-library-id`
4. SELECT - Choose best matching library ID
5. CALL `mcp_context7_get-library-docs` with that ID
```

**Step 2: Show the TDD agent trio pattern**

```markdown
<!-- .github/copilot-agents/tdd-red.agent.md -->
---
description: "Guide test-first development by writing failing tests from GitHub
  issue context before implementation exists."
name: "TDD Red Phase - Write Failing Tests First"
tools: ["github", "findTestFiles", "edit/editFiles", "runTests", "runCommands",
  "codebase", "filesystem", "search", "problems", "testFailure",
  "terminalLastCommand"]
---

# TDD Red Phase - Write Failing Tests First

## GitHub Issue Integration
- **Extract issue number** from branch name pattern: `*{number}*`
- **Fetch issue details** using MCP GitHub
- **Understand the full context** from description and comments
```

> **Agent Trio**: `tdd-red.agent.md` → `tdd-green.agent.md` → `tdd-refactor.agent.md`
> This implements the Red-Green-Refactor cycle as three cooperating agents.

**Step 3: List all 17 agents in this project**

| Agent | File | Specialty |
|-------|------|-----------|
| **Context7-Expert** | `context7.agent.md` | Library docs via MCP (835 lines) |
| **TDD Red** | `tdd-red.agent.md` | Write failing tests from GitHub issues |
| **TDD Green** | `tdd-green.agent.md` | Make tests pass with minimal code |
| **TDD Refactor** | `tdd-refactor.agent.md` | Refactor while keeping tests green |
| **Accessibility** | `accessibility.agent.md` | WCAG compliance auditing |
| **Playwright Tester** | `playwright-tester.agent.md` | End-to-end test generation |
| **Debug** | `debug.agent.md` | Production issue diagnosis |
| **Janitor** | `janitor.agent.md` | Code cleanup and dead code removal |
| **API Docs Generator** | `api-docs-generator.agent.md` | OpenAPI spec generation |
| **Pre-Commit Enforcer** | `pre-commit-enforcer.agent.md` | Pre-commit hook validation |
| **Task Researcher** | `task-researcher.agent.md` | Issue research and analysis |
| **Task Planner** | `task-planner.agent.md` | Task decomposition and planning |
| **Tech Debt Remediation** | `tech-debt-remediation-plan.agent.md` | Technical debt analysis |
| **Terraform Azure** | `terraform-azure-planning.agent.md` | IaC planning for Azure |
| *(+ 3 more)* | *See `.github/copilot-agents/`* | *Specialized workflows* |

**Step 4: Create a new agent following the established format**

```markdown
<!-- .github/copilot-agents/csharp-reviewer.agent.md -->
---
name: "C# Backend Code Reviewer"
description: "Reviews C# backend code for SOLID violations, security gaps, and
  test coverage using the roadmap as a reference."
tools: ["codebase", "filesystem", "search", "edit/editFiles", "problems"]
handoffs:
  - label: Create xUnit tests
    agent: tdd-red
    prompt: Write failing xUnit tests for the issues found in this review.
    send: true
---

# C# Backend Code Reviewer

You are a C# code reviewer specialized in the Road Trip Planner's C# backend.

## Reference Documents
- **Roadmap**: `docs/CSHARP_BACKEND_ROADMAP.md` (8 epics, 25 tasks, 19-29 hours)
- **Service Under Review**: `backend-csharp/Services/AiParsingService.cs`
- **Controller**: `backend-csharp/Controllers/VehicleController.cs`

## Review Checklist
1. **SOLID Violations**: SRP, OCP, DIP (5 known violations in roadmap)
2. **Security**: Prompt injection, missing auth (6 known gaps)
3. **Hardcoded Strings**: Environment vars, magic strings (12+ known)
4. **Test Coverage**: Currently 0% — suggest xUnit + Moq tests
5. **Dependency Injection**: ASP.NET 8 DI patterns

## Handoff
After review, hand off to `@tdd-red` to write failing tests for findings.
```

**Step 5: Invoke the new agent**
```
# In Copilot Chat:
@csharp-reviewer Review AiParsingService.cs and compare findings
with docs/CSHARP_BACKEND_ROADMAP.md. How many of the 25 documented
tasks has the agent independently identified?
```

### Teaching Points

| `.chatagent` Frontmatter Field | Purpose | Example |
|-------------------------------|---------|---------|
| `name` | Display name in agent picker | `"Context7-Expert"` |
| `description` | What the agent does | `"Expert in latest library versions..."` |
| `argument-hint` | Placeholder text in chat | `"Ask about specific libraries"` |
| `tools` | Available tool IDs | `["github", "runTests", "search"]` |
| `mcp-servers` | MCP server connections | Context7, GitHub |
| `handoffs` | Agent-to-agent delegation | TDD Red → TDD Green → TDD Refactor |

**Agent Design Patterns in This Project**:

| Pattern | Example | Benefit |
|---------|---------|---------|
| **Trio/Pipeline** | TDD Red → Green → Refactor | Workflow stages as agents |
| **MCP-Powered** | Context7 (Library docs via MCP) | Live external data |
| **Handoff Chain** | C# Reviewer → TDD Red | Cross-concern delegation |
| **Domain Expert** | Terraform Azure Planning | Infrastructure specialization |
| **Quality Gate** | Pre-Commit Enforcer | Automated validation |

**Key Insight**: Agents are **NOT** registered in a YAML file. Each agent is a standalone `.agent.md` file with `.chatagent` frontmatter. Place them in `.github/copilot-agents/` and they're automatically discovered.

---

## Demo 8: Architecture & Tech Stack Generation (10 min)

### Objective
Use Copilot to generate architecture decisions, infrastructure scaffolding, and remediation plans grounded in the real codebase.

### Scenario
Generate an Architecture Decision Record (ADR) and remediation plan for the C# backend — addressing the 5 SOLID violations, 6 security gaps, and 0 test coverage documented in `docs/CSHARP_BACKEND_ROADMAP.md`.

> **Why this is better than a generic scaffold demo**: The project already has a real ADR (`docs/adr/001-bff-architecture-strategy.md`, 563 lines) and real infrastructure (`infrastructure/terraform/main.tf` with 7 modules). This demo shows Copilot generating architecture artifacts that **fit the existing codebase**, not creating a new project from scratch.

### Live Coding Steps

**Step 1: Generate an ADR following the existing format**
```
# In Copilot Chat:
@workspace Generate an ADR for the C# backend remediation.

Context:
- Existing ADR format: docs/adr/001-bff-architecture-strategy.md (use same structure)
- Problem: AiParsingService.cs has 5 SOLID violations per docs/CSHARP_BACKEND_ROADMAP.md
- Current: Monolithic AiParsingService handles OpenAI, vehicle parsing, trip gen, and fallback
- Proposal: Extract to SOLID-compliant service architecture

Follow the same format as ADR 001:
- Status, Context, Decision, Alternatives, Consequences
```

**Step 2: Copilot generates ADR**
```markdown
<!-- docs/adr/002-csharp-backend-solid-remediation.md -->

# ADR 002: C# Backend SOLID Remediation

**Date**: 2025-01-15
**Status**: Proposed
**Deciders**: Development Team
**Related Issues**: CSHARP_BACKEND_ROADMAP.md (8 epics, 25 tasks)

---

## Context and Problem Statement

The C# backend (`backend-csharp/Services/AiParsingService.cs`) currently handles
4 responsibilities in a single class:
1. Azure OpenAI client creation and configuration
2. Vehicle description parsing (AI + fallback)
3. Trip plan generation
4. Rule-based fallback logic

This violates SRP, DIP, and OCP principles. The service has:
- 0 test coverage (untestable due to tight coupling)
- 6 security gaps (prompt injection, missing auth, hardcoded config)
- 12+ hardcoded strings

## Decision

Extract AiParsingService into a SOLID-compliant architecture:

```
backend-csharp/
├── Services/
│   ├── IAzureOpenAIClientFactory.cs    # DIP: Abstract client creation
│   ├── AzureOpenAIClientFactory.cs     # Concrete factory
│   ├── IVehicleParsingService.cs       # Interface
│   ├── VehicleParsingService.cs        # AI-powered parsing only
│   ├── ITripGenerationService.cs       # Interface  
│   ├── TripGenerationService.cs        # Trip planning only
│   └── RuleBasedFallbackService.cs     # OCP: Strategy pattern
├── Configuration/
│   ├── AzureOpenAIOptions.cs           # DIP: Options pattern
│   └── ServiceCollectionExtensions.cs  # DI registration
├── Validation/
│   └── InputSanitizer.cs              # SEC-1: Prompt injection guard
└── Tests/
    ├── VehicleParsingServiceTests.cs   # xUnit + Moq
    └── TripGenerationServiceTests.cs
```

## Alternatives Considered

| Approach | Effort | Risk | Chosen? |
|----------|--------|------|---------|
| Full rewrite in Python | 40 hrs | Lose Azure OpenAI integration | ❌ |
| Incremental SOLID extraction | 19-29 hrs | Controlled, testable | ✅ |
| Keep monolith, add tests only | 8 hrs | Doesn't fix root cause | ❌ |

## Consequences

### Positive
- Each service has single responsibility → testable with xUnit + Moq
- IConfiguration injection replaces Environment.GetEnvironmentVariable
- Strategy pattern for vehicle types eliminates if/else chains
- Input sanitizer prevents prompt injection (SEC-1)

### Negative
- 19-29 hours of refactoring effort
- Temporary code duplication during extraction
- Team needs ASP.NET 8 DI pattern knowledge

### Risks
- Integration tests needed to verify behavior is preserved
- BFF route table unchanged (POST /api/v1/parse-vehicle → C# :8081)
```

**Step 3: Generate Terraform module for the remediated service**
```
# In Copilot Chat:
@workspace Generate a Terraform module for the C# backend container app.
Follow the module pattern in infrastructure/terraform/main.tf (7 existing modules)
and the module structure rules in .github/copilot-instructions.md.
```

**Copilot generates module following existing patterns:**
```hcl
# infrastructure/terraform/modules/csharp-backend/main.tf
# Follows existing module pattern: main.tf + variables.tf + outputs.tf

resource "azurerm_container_app" "csharp_backend" {
  name                         = "backend-csharp-${var.environment}"
  container_app_environment_id = var.container_app_env_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  template {
    container {
      name   = "backend-csharp"
      image  = "${var.container_registry}/backend-csharp:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "AZURE_OPENAI_ENDPOINT"
        secret_name = "openai-endpoint"  # From Key Vault
      }
      env {
        name        = "AZURE_OPENAI_DEPLOYMENT"
        secret_name = "openai-deployment"
      }
    }
  }

  ingress {
    external_enabled = false  # Internal only — BFF routes to it
    target_port      = 8081
    transport        = "http"
  }
}
```

```hcl
# infrastructure/terraform/modules/csharp-backend/variables.tf
variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "container_registry" {
  type        = string
  description = "ACR login server URL"
}

variable "image_tag" {
  type        = string
  description = "Container image tag"
  default     = "latest"
}
```

### Teaching Points

| Generation Type | Real Codebase Reference | Output |
|----------------|------------------------|--------|
| ADR | `docs/adr/001-bff-architecture-strategy.md` | ADR 002 in same format |
| Service extraction | `backend-csharp/Services/AiParsingService.cs` | SOLID file structure |
| Terraform module | `infrastructure/terraform/main.tf` (7 modules) | Module with vars + validation |
| Remediation plan | `docs/CSHARP_BACKEND_ROADMAP.md` | Effort estimates, phased approach |

**Architecture Prompt Patterns**:
```
# ADR generation (follow existing format)
@workspace Generate ADR for [decision]. Follow format of docs/adr/001-*.md

# Service extraction (reference real violations)
@workspace Plan SOLID extraction of [service]. Reference [roadmap doc]

# Terraform module (follow module rules)
@workspace Generate Terraform module for [service].
Follow module pattern in infrastructure/terraform/ and rules in copilot-instructions.md

# Cross-reference validation
@workspace Compare generated ADR with findings in [roadmap]. Any gaps?
```

---

## Workshop Summary

### 8 Advanced Techniques Mastered

| # | Technique | Key Takeaway | Real Codebase Reference |
|---|-----------|--------------|------------------------|
| 1 | **Chain-of-Thought** | Break features into numbered reasoning steps | `vehicle_service.py` → 9 vehicle types, metric specs |
| 2 | **Instruction Files** | 471 lines of project rules Copilot auto-follows | `.github/copilot-instructions.md` → 12 tech mandates |
| 3 | **Prompt Files** | Reusable `.prompt.md` for consistent generation | 3 existing prompts, `plan-mockExternalApisBackendTests` |
| 4 | **Code Review** | Security + SOLID + coverage analysis on real code | `AiParsingService.cs` → 5 violations, 6 security gaps |
| 5 | **Plan Mode** | Multi-phase architecture before coding | `conftest.py` → unittest.mock pattern, 10 JSON fixtures |
| 6 | **Coding Agent** | Autonomous refactoring with precise scope | 7 `any` violations across 3 files (not 20) |
| 7 | **Agent HQ** | `.chatagent` frontmatter, MCP servers, handoffs | 17 agents, Context7 (835 lines), TDD trio pipeline |
| 8 | **Architecture Gen** | ADRs + Terraform grounded in existing patterns | ADR 001 format, 7 Terraform modules, C# roadmap |

### What Makes This Workshop Different

This workshop used **real code** from the Road Trip Planner, not fabricated examples:
- **Real violations**: 7 `any` instances at verified file:line locations
- **Real agents**: 17 `.chatagent` files with MCP servers and handoff chains
- **Real mocking**: `unittest.mock.patch` (not `pytest-httpx`) matching `conftest.py`
- **Real architecture**: ADR 001 (563 lines), Terraform (7 modules), C# roadmap (25 tasks)
- **Real Mapbox**: `mapbox/driving-traffic` with restrictions (not the non-existent `mapbox/truck`)

### Quick Reference Card

```
# Chain-of-Thought (Demo 1)
"""
Step 1: [identify requirements from real code]
Step 2: [review existing data model]
Step 3: [implement mapping logic]
Step 4: [integration with correct API params]
Step 5: [return enriched response]
Now implement:
"""

# Instruction File (Demo 2) — already 471 lines
# Add rules with ❌/✅ contrast examples
# Reference real files: "see src/types/index.ts"

# Prompt File (Demo 3) — 3 already exist
<!-- .github/prompts/[name].prompt.md -->
## Architecture Context (ground in real stack)
## Requirements (encode real conventions)
## Template (with {{placeholders}})
## Checklist (verification gates)

# Code Review (Demo 4) — use real files
@workspace Review [real-file.cs] for OWASP, SOLID, coverage
Cross-reference with [roadmap doc]

# Plan Mode (Demo 5) — use existing prompt files
@workspace #file:.github/prompts/plan-*.prompt.md
Follow patterns in conftest.py (unittest.mock, not pytest-httpx)

# Coding Agent (Demo 6) — precise inventory
# ALWAYS grep first to count violations
# Enumerate every file:line in the prompt

# Agent HQ (Demo 7) — .chatagent frontmatter
# NOT YAML registry — standalone .agent.md files
# Key fields: name, description, tools, mcp-servers, handoffs

# Architecture Gen (Demo 8) — follow existing patterns
@workspace Generate ADR following docs/adr/001-*.md format
@workspace Generate Terraform module following infrastructure/terraform/ pattern
```

### Next Workshop Preview

**Workshop 4: Expert Web Development** (90 min)
- **Demo 1**: From Extensions to MCP — Evolution of Copilot tooling
- **Demo 2**: MCP Servers in Action — `@context7` for live library docs, `@azure` MCP
- **Demo 3**: Enterprise Copilot Policy — Admin controls, model governance
- **Demo 4**: Model Selection Strategy — When to use Claude vs GPT-4o vs o1
- **Demo 5**: Certification Preparation — GitHub Copilot certification readiness
- **Demo 6**: Spec Kit Workflow — Feature specs → implementation with traceability
- **Demo 7**: Metrics Dashboard — Measuring developer productivity with Copilot

---

## Resources

### Project Files Referenced in This Workshop

| Resource | Path | Used In |
|----------|------|---------|
| Instruction file | `.github/copilot-instructions.md` (471 lines) | Demo 2 |
| Prompt files | `.github/prompts/` (3 files) | Demos 3, 5 |
| Custom agents | `.github/copilot-agents/` (17 agents) | Demo 7 |
| Vehicle service | `backend/vehicle_service.py` (9 vehicle types) | Demo 1 |
| C# AI service | `backend-csharp/Services/AiParsingService.cs` | Demos 4, 8 |
| Test config | `backend/tests/conftest.py` (unittest.mock) | Demo 5 |
| Type definitions | `frontend/src/types/index.ts` (191 lines) | Demos 1, 6 |
| C# roadmap | `docs/CSHARP_BACKEND_ROADMAP.md` (25 tasks) | Demos 4, 8 |
| BFF ADR | `docs/adr/001-bff-architecture-strategy.md` | Demo 8 |
| Terraform | `infrastructure/terraform/main.tf` (7 modules) | Demo 8 |

### Documentation Links

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Copilot Chat in VS Code](https://docs.github.com/en/copilot/using-github-copilot/copilot-chat/using-github-copilot-chat-in-your-ide)
- [Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [Prompt Files](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-prompt-files-to-your-repository)
- [Copilot Coding Agent](https://docs.github.com/en/copilot/using-github-copilot/copilot-coding-agent)
- [Custom Chat Agents](https://docs.github.com/en/copilot/customizing-copilot/building-copilot-agents)
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
