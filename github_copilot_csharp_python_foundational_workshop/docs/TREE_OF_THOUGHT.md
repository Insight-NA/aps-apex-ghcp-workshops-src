# Tree of Thought (ToT) for Road Trip App Development

**Date**: March 20, 2026  
**Context**: Road Trip App — Python/FastAPI · C#/ASP.NET · Java/Spring Boot with GitHub Copilot  
**Framework**: CORE (Context, Objective, Requirements, Examples)

---

## What is Tree of Thought?

Tree of Thought (ToT) is a prompting technique where you explore **multiple reasoning branches in parallel**, evaluate each branch against criteria, prune weak options, and converge on the best solution. Unlike Chain of Thought (linear step-by-step), ToT builds a **branching decision tree**.

**Think of it like a code review** — you don't merge the first implementation you write. You consider multiple architectural approaches, evaluate each against the project's non-negotiables, prune the weak options, and ship the best one:

```
          [Current Problem]
         /        |         \
   Approach A  Approach B  Approach C
      /   \      |         /   \
   A1     A2    B1       C1    C2
   ✗      ✓     ✓        ✗     ✓
         Best → B1 (strongest after evaluation)
```

### CoT vs ToT at a Glance

| | Chain of Thought | Tree of Thought |
|---|---|---|
| **Structure** | Linear (Step 1 → 2 → 3) | Branching (explore → evaluate → prune) |
| **When to use** | Problem has one clear path | Problem has competing valid approaches |
| **Risk** | May lock into a suboptimal path early | More upfront work, but avoids dead ends |
| **Analogy** | Stepping through code | Debugging with multiple hypotheses |

---

## The CORE Framework for Prompts

Every prompt in this guide follows the **CORE** framework — a structured approach recommended by Microsoft and GitHub for effective Copilot interactions:

| Component | Description | Example |
|-----------|-------------|---------|
| **C**ontext | Background information, project type, constraints | "I'm working in `backend/` — FastAPI with SQLAlchemy..." |
| **O**bjective | What you want to achieve | "Add rate limiting to the `/api/v1/parse-vehicle` endpoint..." |
| **R**equirements | Specific criteria, constraints, standards | "Must follow service-layer pattern, no business logic in routes..." |
| **E**xamples | Input/output examples, expected behaviour | "When vehicle description is empty, return HTTP 422..." |

### CORE + ToT Integration

When combining CORE with Tree of Thought, structure your prompts like this:

```markdown
**Context**: [Service name, file paths, existing patterns, stack]
**Objective**: [What you want to accomplish]
**Requirements**: [Evaluation criteria for branches — align with instructions]

**Use Tree of Thought reasoning:**
1. Generate 3 candidate approaches
2. Evaluate each against: [Requirement 1], [Requirement 2], [Requirement 3]
3. Prune the weakest branch and explain why
4. Produce final implementation

**Examples**: [Expected behaviour, edge cases, error scenarios]
```

---

## Road Trip App Architecture Overview

Before diving into examples, understand how the three backend services collaborate:

```
Frontend (React)
     │
     ▼
BFF (Node.js / Express)          ← orchestrates calls, serves SPA
     │           │
     ▼           ▼
Python/FastAPI   C#/ASP.NET      ← trip CRUD + auth | AI vehicle parsing
(backend/)       (backend-csharp/)
                     │
                     ▼
              Java/Spring Boot   ← geocoding, directions, POI (backend-java/)
```

Each service has non-negotiable stack and responsibility rules defined in `.github/instructions/`.

---

## Example 1: Python — Async Vehicle Specs Endpoint

### Scenario

`vehicle_service.py` has a `TODO` comment: the `get_vehicle_specs()` function calls the async C# AI service synchronously, which is a design smell. You need to refactor the `/api/v1/vehicle/{type}` route to be fully async.

### ❌ Without Tree of Thought (Single Path)

**Prompt:**
> Fix the async issue in get_vehicle_specs.

**Problem with this approach:**
- Copilot might wrap the call with `asyncio.run()` — valid but blocks the event loop
- May miss the service-layer pattern requirement
- Ignores the fallback contract the rest of the app depends on

### ✅ With Tree of Thought (CORE Framework)

**Prompt:**

```markdown
**Context**:
I'm working in `backend/vehicle_service.py` and `backend/main.py`.
The stack is FastAPI + SQLAlchemy + Pydantic v2. The function `get_vehicle_specs()`
calls `ai_service.get_vehicle_specs_from_ai()` which is an `async` function, but
`get_vehicle_specs()` itself is synchronous. The FastAPI route in `main.py` calls
this function directly.

**Objective**:
Make `get_vehicle_specs()` properly async so the AI call is non-blocking,
while preserving the fallback to `DEFAULT_VEHICLE_SPECS` when the C# service
is unavailable.

**Requirements** (from python.instructions.md):
- Business logic must stay in `vehicle_service.py`, NOT in the route handler
- Return type must be a Pydantic `VehicleSpecsResponse` from `schemas.py`
- No hardcoded strings — use constants from `constants.py`
- Graceful fallback when C# AI service is unavailable or returns None

**Use Tree of Thought reasoning:**
1. Generate 3 approaches to make the service async
2. Evaluate each against: non-blocking, service-layer pattern, fallback correctness,
   testability with `unittest.mock.patch`
3. Lookahead: What happens if Pydantic validation fails on the AI response?
   What if the AI service is slow (30s timeout)?
4. Prune the weakest branch
5. Produce the final `get_vehicle_specs` function and its updated route in `main.py`

**Examples**:
- Input: vehicle_type = "rv_large", AI service available → returns AI-parsed specs
- Input: vehicle_type = "ev_sedan", AI service returns None → returns DEFAULT_VEHICLE_SPECS["ev_sedan"]
- Input: vehicle_type = "unknown_type", AI service unavailable → returns default "car" specs
```

#### Step 1: Generate Candidate Branches

```
         [Make get_vehicle_specs async]
        /              |              \
   A: asyncio.run()   B: async def   C: Background task
   (run in thread)   (pure async)    (deferred response)
```

**Branch A — `asyncio.run()` in a thread executor**
```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

def get_vehicle_specs(vehicle_type: str) -> VehicleSpecsResponse:
    with ThreadPoolExecutor() as executor:
        future = executor.submit(asyncio.run, ai_service.get_vehicle_specs_from_ai(vehicle_type))
        ai_result = future.result(timeout=30)
    specs = ai_result or DEFAULT_VEHICLE_SPECS.get(vehicle_type, DEFAULT_VEHICLE_SPECS["car"])
    return VehicleSpecsResponse(**specs)
```
- Keeps the function synchronous
- Runs the coroutine in a separate thread's event loop
- Works, but nested event loops are fragile

**Branch B — Pure `async def` service function**
```python
# vehicle_service.py
async def get_vehicle_specs(vehicle_type: str) -> VehicleSpecsResponse:
    ai_result = await ai_service.get_vehicle_specs_from_ai(vehicle_type)
    specs = ai_result or DEFAULT_VEHICLE_SPECS.get(vehicle_type, DEFAULT_VEHICLE_SPECS["car"])
    return VehicleSpecsResponse(**specs)

# main.py
@app.get("/api/v1/vehicle/{vehicle_type}")
async def vehicle_specs(vehicle_type: str, current_user = Depends(get_current_user)):
    return await vehicle_service.get_vehicle_specs(vehicle_type)
```
- Clean async propagation throughout the call chain
- FastAPI natively supports `async def` route handlers
- Trivial to mock with `AsyncMock` in tests

**Branch C — FastAPI `BackgroundTasks` with a cache**
```python
from fastapi import BackgroundTasks
_spec_cache: dict = {}

@app.get("/api/v1/vehicle/{vehicle_type}")
async def vehicle_specs(vehicle_type: str, background_tasks: BackgroundTasks):
    if vehicle_type in _spec_cache:
        return _spec_cache[vehicle_type]
    # Return defaults immediately, fetch AI in background
    background_tasks.add_task(prefetch_ai_specs, vehicle_type)
    return DEFAULT_VEHICLE_SPECS.get(vehicle_type, DEFAULT_VEHICLE_SPECS["car"])
```
- Fast first response (no waiting for AI)
- Cache state is shared in-process (not safe under multiple workers)
- Client never gets AI-parsed specs on first call — incorrect behaviour

#### Step 2: Evaluate with Lookahead

| Criteria | A (asyncio.run in thread) | B (pure async) | C (BackgroundTasks) |
|----------|--------------------------|----------------|---------------------|
| **Non-blocking** | ⚠️ Moves blocking to a thread | ✅ Truly non-blocking | ✅ Immediately returns |
| **Service-layer pattern** | ✅ Logic stays in service | ✅ Logic stays in service | ❌ Cache logic bleeds into route |
| **Fallback correctness** | ✅ Fallback on `None` | ✅ Fallback on `None` | ❌ Always fallback on first request |
| **Testability** | ⚠️ `asyncio.run` hard to mock | ✅ `AsyncMock` works cleanly | ❌ Background task ordering is non-deterministic |
| **Lookahead: Pydantic error** | ⚠️ Exception escapes thread | ✅ Propagates naturally to 422 | ❌ Silently swallowed in background |
| **Lookahead: 30s timeout** | ⚠️ Thread holds connection | ✅ `httpx` timeout raises cleanly | ✅ Client doesn't wait |
| **Instruction compliance** | ✅ | ✅ | ❌ route handler contains logic |

#### Step 3: Prune and Decide

```
         [Make get_vehicle_specs async]
        /              |              \
   ⚠️ Fragile    ⭐ Selected        ✗ Pruned
```

- **Branch C pruned** — Clients get stale default data on first call; this violates the contract that users see their actual vehicle specs. Background cache state is also not safe with multiple uvicorn workers.
- **Branch A viable** but nested event loops are a known source of subtle bugs; threads add overhead.
- **Branch B selected** — Native FastAPI async, clean error propagation, easiest to test.

#### Step 4: Final Implementation (Branch B)

```python
# backend/vehicle_service.py

from typing import Optional
from schemas import VehicleSpecsResponse
import ai_service
from constants import VehicleTypes

DEFAULT_VEHICLE_SPECS = {
    VehicleTypes.CAR: {
        "height": 1.5, "width": 1.8, "length": 4.5, "weight": 1.5,
        "fuel_type": "gas", "range": 400, "mpg": 30
    },
    VehicleTypes.RV_LARGE: {
        "height": 3.8, "width": 2.6, "length": 10.0, "weight": 12.0,
        "fuel_type": "diesel", "range": 400, "mpg": 6
    },
    # … other types
}

async def get_vehicle_specs(vehicle_type: str) -> VehicleSpecsResponse:
    """
    Resolve vehicle specs: AI-first with fallback to defaults.
    Never raises — always returns a valid VehicleSpecsResponse.
    """
    ai_result = await ai_service.get_vehicle_specs_from_ai(vehicle_type)
    raw = ai_result or DEFAULT_VEHICLE_SPECS.get(vehicle_type, DEFAULT_VEHICLE_SPECS[VehicleTypes.CAR])
    return VehicleSpecsResponse(vehicle_type=vehicle_type, **raw)
```

```python
# backend/main.py (route only — no business logic)

@app.get("/api/v1/vehicle/{vehicle_type}", response_model=VehicleSpecsResponse)
async def vehicle_specs_endpoint(
    vehicle_type: str,
    current_user: models.User = Depends(get_current_user),
):
    return await vehicle_service.get_vehicle_specs(vehicle_type)
```

```python
# backend/tests/test_vehicle_service.py

from unittest.mock import AsyncMock, patch
import pytest
from vehicle_service import get_vehicle_specs

@pytest.mark.asyncio
async def test_get_vehicle_specs_uses_ai_when_available():
    mock_specs = {"height": 3.8, "width": 2.6, "length": 10.0,
                  "weight": 12.0, "fuel_type": "diesel", "range": 400, "mpg": 6}
    with patch("vehicle_service.ai_service.get_vehicle_specs_from_ai",
               new=AsyncMock(return_value=mock_specs)):
        result = await get_vehicle_specs("rv_large")
    assert result.height == 3.8
    assert result.fuel_type == "diesel"

@pytest.mark.asyncio
async def test_get_vehicle_specs_falls_back_when_ai_unavailable():
    with patch("vehicle_service.ai_service.get_vehicle_specs_from_ai",
               new=AsyncMock(return_value=None)):
        result = await get_vehicle_specs("car")
    assert result.vehicle_type == "car"
    assert result.mpg == 30
```

#### Step 5: Verify Against Requirements

- [x] Non-blocking — `await` throughout, no thread executors
- [x] Service-layer pattern — route handler is 3 lines; logic in `vehicle_service.py`
- [x] No hardcoded strings — `VehicleTypes.CAR`, `VehicleTypes.RV_LARGE` from `constants.py`
- [x] Graceful fallback — `None` from AI → default specs, unknown type → `"car"` defaults
- [x] Testable — `AsyncMock` patches the AI call without hitting C# service

---

## Example 2: C# — Trip Generation Error Handling Strategy

### Scenario

`AiParsingService.cs` catches `Exception` broadly and falls back silently. The team wants proper structured error responses for the `/api/v1/generate-trip` endpoint so the BFF can distinguish between "AI unavailable" and "bad request".

### ✅ With Tree of Thought (CORE Framework)

**Prompt:**

```markdown
**Context**:
I'm working in `backend-csharp/Services/AiParsingService.cs` and
`backend-csharp/Controllers/VehicleController.cs`.
Stack: ASP.NET Web API (.NET 8), Azure.AI.OpenAI SDK, `IOptions<AzureOpenAIOptions>`.
Currently `GenerateTripAsync` catches all exceptions and returns a generic fallback
response with no detail. The BFF needs to differentiate errors to surface
appropriate messages to the frontend.

**Objective**:
Implement a structured error-handling strategy for `GenerateTripAsync` that
distinguishes between configuration errors, upstream AI failures, and validation errors.

**Requirements** (from csharp.instructions.md):
- Services must implement an interface (`IAiParsingService`) — no changes to the contract
- Config read from `IOptions<AzureOpenAIOptions>` / environment variables — never hardcode
- Return `IActionResult` / `ActionResult<T>` from controllers — never raw objects
- Constructor injection only inside controllers
- `#nullable enable` in all new files

**Use Tree of Thought reasoning:**
1. Generate 3 error-handling patterns available in ASP.NET:
   - A: Result/discriminated union pattern (no exceptions in service)
   - B: Custom exception types + global `IExceptionHandler`
   - C: `ProblemDetails` responses returned directly from service
2. Evaluate against: controller simplicity, BFF error distinguishability,
   testability of service in isolation, .NET 8 best practice
3. Lookahead: What if we add 3 more AI endpoints? What if the Azure OpenAI SDK
   changes its exception hierarchy?
4. Prune and select the winner
5. Produce the updated service method signatures, exception types if needed,
   and the controller action

**Examples**:
- Azure OpenAI not configured → HTTP 503 with `{ "error": "AI service unavailable" }`
- Azure OpenAI returns 429 (rate limit) → HTTP 502 with `{ "error": "AI quota exceeded" }`
- Origin is empty → HTTP 400 (caught by `[Required]` on the DTO)
- Success → HTTP 200 with `GenerateTripResponse`
```

#### Step 1: Generate Candidate Branches

```
         [GenerateTripAsync Error Strategy]
        /                |               \
   A: Result<T,E>   B: Custom exceptions   C: ProblemDetails
   (no exceptions)  + global handler       from service
```

**Branch A — Result/Discriminated Union**
```csharp
// AiResult.cs
public record AiResult<T>
{
    public T? Value { get; init; }
    public AiError? Error { get; init; }
    public bool IsSuccess => Error is null;
}

public enum AiError { NotConfigured, QuotaExceeded, UpstreamFailure }

// Service
public async Task<AiResult<GenerateTripResponse>> GenerateTripAsync(
    string origin, string destination, List<string> interests)
{
    if (!_isConfigured)
        return new AiResult<GenerateTripResponse> { Error = AiError.NotConfigured };
    try { /* call OpenAI */ }
    catch (RequestFailedException ex) when (ex.Status == 429)
    {
        return new AiResult<GenerateTripResponse> { Error = AiError.QuotaExceeded };
    }
}

// Controller maps result to IActionResult
```
- No exceptions cross the service boundary
- Controller switches on `AiError` to map HTTP status codes

**Branch B — Custom Exceptions + `IExceptionHandler`**
```csharp
// Exceptions
public class AiServiceUnavailableException(string message) : Exception(message);
public class AiQuotaExceededException(string message) : Exception(message);

// Service — just throws
public async Task<GenerateTripResponse> GenerateTripAsync(...)
{
    if (!_isConfigured)
        throw new AiServiceUnavailableException("Azure OpenAI is not configured");
    // ...
}

// GlobalExceptionHandler.cs (registered in Program.cs)
public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch {
            AiServiceUnavailableException => (503, "AI service unavailable"),
            AiQuotaExceededException      => (502, "AI quota exceeded"),
            _                             => (500, "Internal error")
        };
        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new { error = title }, ct);
        return true;
    }
}
```
- Controller stays thin — no error-mapping logic
- Single place to add new error mappings

**Branch C — `ProblemDetails` from Service**
```csharp
// Service returns ProblemDetails on error
public async Task<(GenerateTripResponse? Result, ProblemDetails? Problem)> GenerateTripAsync(...)
{
    if (!_isConfigured)
        return (null, new ProblemDetails { Status = 503, Title = "AI unavailable" });
}

// Controller unpacks the tuple
var (result, problem) = await _aiService.GenerateTripAsync(...);
if (problem is not null)
    return StatusCode(problem.Status ?? 500, problem);
return Ok(result);
```
- No exceptions at all — tuple return
- `ProblemDetails` is an HTTP concept leaking into the service layer

#### Step 2: Evaluate with Lookahead

| Criteria | A (Result<T,E>) | B (Custom exceptions) | C (ProblemDetails) |
|----------|-----------------|-----------------------|--------------------|
| **Controller simplicity** | ⚠️ Switch on AiError per action | ✅ Controller stays thin | ⚠️ Tuple unpacking in every action |
| **BFF distinguishability** | ✅ Typed enum maps cleanly | ✅ HTTP status codes set correctly | ✅ ProblemDetails is RFC 9457 |
| **Service testability** | ✅ Check `IsSuccess` / `Error` | ✅ Assert exception type | ⚠️ HTTP concept in unit tests |
| **.NET 8 best practice** | ✅ Functional, idiomatic | ✅ `IExceptionHandler` is .NET 8 | ❌ Antipattern — HTTP concerns in service |
| **Lookahead: 3 more AI endpoints** | ❌ Switch duplicated in each controller | ✅ One global handler covers all | ❌ Tuple pattern duplicated everywhere |
| **Lookahead: SDK exception changes** | ✅ Isolated in service | ✅ Isolated in service | ✅ Isolated in service |
| **Interface contract change** | ⚠️ Return type changes to `AiResult<T>` | ✅ No change to `IAiParsingService` | ❌ Tuple breaks the interface |

#### Step 3: Prune and Decide

```
         [GenerateTripAsync Error Strategy]
        /                |               \
   ⚠️ Viable        ⭐ Selected        ✗ Pruned
```

- **Branch C pruned** — `ProblemDetails` is an HTTP/presentation layer concept; injecting it into a service violates separation of concerns and makes unit testing awkward.
- **Branch A viable** but changes the interface return type; switching on `AiError` must be duplicated in every controller action.
- **Branch B selected** — `IExceptionHandler` is the .NET 8-idiomatic global handler; the interface remains `Task<GenerateTripResponse>` (no change to callers); one handler covers all new AI endpoints automatically.

#### Step 4: Final Implementation (Branch B)

```csharp
// backend-csharp/Services/Exceptions/AiServiceException.cs
#nullable enable
namespace RoadTrip.AiService.Services.Exceptions;

public class AiServiceUnavailableException(string message) : Exception(message);
public class AiQuotaExceededException(string message) : Exception(message);
public class AiResponseParseException(string message, Exception inner)
    : Exception(message, inner);
```

```csharp
// backend-csharp/Services/AiParsingService.cs  (updated GenerateTripAsync)
public async Task<GenerateTripResponse> GenerateTripAsync(
    string origin, string destination, List<string> interests)
{
    if (!_isConfigured)
        throw new AiServiceUnavailableException(
            "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT, API_KEY, and DEPLOYMENT.");

    try
    {
        return await CallOpenAIForTripAsync(origin, destination, interests);
    }
    catch (RequestFailedException ex) when (ex.Status == 429)
    {
        _logger.LogWarning("Azure OpenAI quota exceeded: {Message}", ex.Message);
        throw new AiQuotaExceededException("Azure OpenAI request quota exceeded.");
    }
    catch (RequestFailedException ex)
    {
        _logger.LogError(ex, "Azure OpenAI call failed");
        throw new AiServiceUnavailableException($"Azure OpenAI returned HTTP {ex.Status}.");
    }
}
```

```csharp
// backend-csharp/Infrastructure/GlobalExceptionHandler.cs
#nullable enable
using Microsoft.AspNetCore.Diagnostics;
using RoadTrip.AiService.Services.Exceptions;

namespace RoadTrip.AiService.Infrastructure;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, message) = exception switch
        {
            AiServiceUnavailableException ex => (503, ex.Message),
            AiQuotaExceededException ex      => (502, ex.Message),
            AiResponseParseException ex      => (500, "AI response could not be parsed."),
            _                                => (500, "An unexpected error occurred.")
        };

        logger.LogError(exception, "Handled exception: {StatusCode} — {Message}", statusCode, message);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(
            new { error = message }, cancellationToken);

        return true;
    }
}
```

```csharp
// backend-csharp/Program.cs (registration)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
// ...
app.UseExceptionHandler();
```

```csharp
// backend-csharp/Controllers/VehicleController.cs  (no change needed — stays thin)
[HttpPost("generate-trip")]
public async Task<ActionResult<GenerateTripResponse>> GenerateTrip(
    [FromBody] GenerateTripRequest request)
{
    var result = await _aiService.GenerateTripAsync(
        request.Origin, request.Destination, request.Interests);
    return Ok(result);
}
// Exceptions bubble up to GlobalExceptionHandler automatically
```

#### Step 5: Verify Against Requirements

- [x] `IAiParsingService` interface unchanged — no breaking contract change
- [x] Config via environment variables / `IOptions<AzureOpenAIOptions>` — no hardcoding
- [x] Controller returns `ActionResult<T>` — thin, no error-mapping logic
- [x] Constructor injection only — `GlobalExceptionHandler` injected by DI
- [x] `#nullable enable` in all new files
- [x] BFF gets 503/502/400/200 — unambiguous status codes

---

## Example 3: Java — Route Optimization Strategy for Geospatial Service

### Scenario

The Java geospatial service has a `GET /api/optimize` endpoint in `GeospatialController` that proxies to Mapbox's Optimization API. The team wants to add support for RV-specific routing restrictions (avoiding low bridges, weight limits) using Azure Maps as an alternative to Mapbox for vehicles with constraints.

### ✅ With Tree of Thought (CORE Framework)

**Prompt:**

```markdown
**Context**:
I'm working in `backend-java/src/main/java/com/roadtrip/geospatial/`.
Stack: Spring Boot 3, Maven, Java 17, WebClient for HTTP.
Current services: `MapboxService.java` (geocoding + directions + optimization),
`AzureMapsService.java` (POI fuzzy search).
The `GET /api/optimize` endpoint currently delegates entirely to `MapboxService.optimizeRoute()`.
Vehicle specs (height, width, weight, fuel_type) are passed from the Python backend
as query parameters. Azure Maps supports truck routing with height/weight restrictions
via its Route API.

**Objective**:
Add a routing strategy that selects Mapbox for standard vehicles and Azure Maps
for constraint-heavy vehicles (RVs, trucks), without breaking the existing
`GeospatialController` contract.

**Requirements** (from java.instructions.md):
- Business logic in service classes only — controllers delegate
- External API calls exclusively in service classes
- Use `WebClient` — no `HttpURLConnection`
- Tokens read from `@Value("${...}")` — never hardcoded
- Return `ResponseEntity<T>` from controllers
- Custom exceptions in `exception/` package + `@ControllerAdvice`
- DTOs use Java Records where possible

**Use Tree of Thought reasoning:**
1. Generate 3 architectural patterns for the routing selection:
   - A: Strategy pattern — `RoutingStrategy` interface with MapboxStrategy/AzureMapsStrategy
   - B: Conditional logic inside `MapboxService` — add a `useAzureMaps` boolean flag
   - C: New `RouteOptimizationService` orchestrator that delegates to both sub-services
2. Evaluate against: SRP, testability, extensibility (e.g. adding HERE Maps later),
   Spring Boot idioms, controller thinness
3. Lookahead: What if we need a third provider (HERE Maps)?
   What if a vehicle has electric fuel type (no gas station routing)?
4. Prune and decide
5. Produce interface, implementations, orchestrator (if needed), and updated controller

**Examples**:
- `vehicle_type=car` → delegates to Mapbox
- `vehicle_type=rv_large`, height=3.8, weight=12000 → delegates to Azure Maps truck routing
- `vehicle_type=ev_sedan` → delegates to Mapbox (EV-specific charging stops: future work)
- External API error → HTTP 502 via `@ControllerAdvice`
```

#### Step 1: Generate Candidate Branches

```
         [Routing Provider Selection]
        /              |              \
   A: Strategy      B: Flag in        C: Orchestrator
      interface     MapboxService     service
```

**Branch A — Strategy Pattern**
```java
// RoutingStrategy.java
public interface RoutingStrategy {
    boolean supports(VehicleContext vehicle);
    Map<String, Object> optimize(String coords, VehicleContext vehicle);
}

// MapboxRoutingStrategy.java
@Component
public class MapboxRoutingStrategy implements RoutingStrategy {
    private final MapboxService mapboxService;
    public boolean supports(VehicleContext v) {
        return !v.requiresRestrictions();  // car, SUV, EV
    }
    public Map<String, Object> optimize(String coords, VehicleContext v) {
        return mapboxService.optimizeRoute(coords);
    }
}

// AzureMapsRoutingStrategy.java
@Component
public class AzureMapsRoutingStrategy implements RoutingStrategy {
    private final AzureMapsService azureMapsService;
    public boolean supports(VehicleContext v) {
        return v.requiresRestrictions();  // RV, truck
    }
    public Map<String, Object> optimize(String coords, VehicleContext v) {
        return azureMapsService.optimizeWithRestrictions(coords, v);
    }
}
```
- Spring auto-wires a `List<RoutingStrategy>` — iterate to find first match
- Adding a third provider = add a new `@Component`
- `VehicleContext` record carries height/weight/fuel type

**Branch B — Boolean flag inside `MapboxService`**
```java
// MapboxService.java (modified)
public Map<String, Object> optimizeRoute(String coords, boolean useAzureMaps,
                                          Double height, Double weight) {
    if (useAzureMaps) {
        // Azure Maps call embedded in Mapbox service
        return callAzureMaps(coords, height, weight);
    }
    return callMapbox(coords);
}
```
- A service named `MapboxService` calling Azure Maps — confusing
- Violates SRP; two external APIs in one service
- Boolean flags tend to proliferate

**Branch C — `RouteOptimizationService` Orchestrator**
```java
// RouteOptimizationService.java
@Service
@RequiredArgsConstructor
public class RouteOptimizationService {
    private final MapboxService mapboxService;
    private final AzureMapsService azureMapsService;

    public Map<String, Object> optimize(String coords, VehicleContext vehicle) {
        if (vehicle.requiresRestrictions()) {
            return azureMapsService.optimizeWithRestrictions(coords, vehicle);
        }
        return mapboxService.optimizeRoute(coords);
    }
}
```
- Single orchestrator owns the selection logic
- Both sub-services remain focused on their provider
- Controller delegates to `RouteOptimizationService` instead of directly to `MapboxService`

#### Step 2: Evaluate with Lookahead

| Criteria | A (Strategy pattern) | B (Flag in MapboxService) | C (Orchestrator service) |
|----------|----------------------|---------------------------|--------------------------|
| **SRP** | ✅ Each strategy has one job | ❌ MapboxService has two jobs | ✅ Each service has one job |
| **Testability** | ✅ Each strategy tested in isolation | ⚠️ One big class to test | ✅ Mock two focused services |
| **Controller thinness** | ✅ Delegates to strategy resolver | ❌ Controller passes flags | ✅ Delegates to orchestrator |
| **Spring Boot idioms** | ✅ `@Component` list injection | ❌ Strays from conventions | ✅ `@Service` + constructor injection |
| **Lookahead: HERE Maps** | ✅ Add `HereMapsRoutingStrategy` | ❌ More flags, more complexity | ⚠️ Add else-if to orchestrator |
| **Lookahead: EV routing** | ✅ `EVRoutingStrategy` class | ❌ Fourth flag | ⚠️ Third provider in if-chain |
| **Simplicity now** | ⚠️ More boilerplate for 2 providers | ❌ | ✅ Simple, readable |

#### Step 3: Prune and Decide

```
         [Routing Provider Selection]
        /              |              \
   ⭐ Best long-term  ✗ Pruned     ⭐ Best now
```

**Decision**: Start with **Branch C** (Orchestrator) now — simple, idiomatic Spring Boot, and correct. Structure the code so migrating to **Branch A** is a one-step refactor if a third provider is needed.

- **Branch B pruned** — SRP violation is unacceptable; `MapboxService` calling Azure Maps is a clear code smell.
- **Branch A** excellent for 3+ providers, but adds interface/strategy boilerplate for what are currently just two cases.
- **Branch C selected** — Two services, one orchestrator, zero flags. Clean enough to promote to strategy pattern later without breaking the controller.

#### Step 4: Final Implementation (Branch C with Strategy-Ready Structure)

```java
// backend-java/.../dto/VehicleContext.java
package com.roadtrip.geospatial.dto;

public record VehicleContext(
        String vehicleType,
        Double heightMeters,
        Double widthMeters,
        Double weightKg
) {
    /** Returns true when Azure Maps truck routing restrictions should apply. */
    public boolean requiresRestrictions() {
        return (heightMeters != null && heightMeters > 3.0)
            || (weightKg != null && weightKg > 5000)
            || "rv_large".equalsIgnoreCase(vehicleType)
            || "truck".equalsIgnoreCase(vehicleType);
    }
}
```

```java
// backend-java/.../service/RouteOptimizationService.java
package com.roadtrip.geospatial.service;

import com.roadtrip.geospatial.dto.VehicleContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RouteOptimizationService {

    private final MapboxService mapboxService;
    private final AzureMapsService azureMapsService;

    /**
     * Select routing provider based on vehicle constraints.
     * Standard vehicles → Mapbox Optimization API.
     * RVs and trucks    → Azure Maps Route API (height/weight restrictions).
     */
    public Map<String, Object> optimize(String coords, VehicleContext vehicle) {
        if (vehicle.requiresRestrictions()) {
            return azureMapsService.optimizeWithRestrictions(coords, vehicle);
        }
        return mapboxService.optimizeRoute(coords);
    }
}
```

```java
// backend-java/.../exception/RoutingException.java
package com.roadtrip.geospatial.exception;

public class RoutingException extends RuntimeException {
    public RoutingException(String message) { super(message); }
    public RoutingException(String message, Throwable cause) { super(message, cause); }
}
```

```java
// backend-java/.../controller/GeospatialController.java  (updated optimize endpoint)
private final RouteOptimizationService routeOptimizationService;

@GetMapping("/optimize")
public ResponseEntity<Map<String, Object>> optimizeRoute(
        @RequestParam("coords") String coords,
        @RequestParam(value = "vehicle_type", required = false) String vehicleType,
        @RequestParam(value = "height", required = false) Double height,
        @RequestParam(value = "weight", required = false) Double weight) {

    var vehicle = new VehicleContext(vehicleType, height, null, weight);
    Map<String, Object> result = routeOptimizationService.optimize(coords, vehicle);
    return ResponseEntity.ok(result);
}
```

```java
// backend-java/src/test/.../service/RouteOptimizationServiceTest.java
@ExtendWith(MockitoExtension.class)
class RouteOptimizationServiceTest {

    @Mock MapboxService mapboxService;
    @Mock AzureMapsService azureMapsService;
    @InjectMocks RouteOptimizationService service;

    @Test
    void standardVehicle_usesMapbox() {
        var vehicle = new VehicleContext("car", 1.5, 1.8, 1500.0);
        when(mapboxService.optimizeRoute(any())).thenReturn(Map.of("type", "FeatureCollection"));
        service.optimize("lng,lat;lng,lat", vehicle);
        verify(mapboxService).optimizeRoute(any());
        verifyNoInteractions(azureMapsService);
    }

    @Test
    void rvLarge_usesAzureMaps() {
        var vehicle = new VehicleContext("rv_large", 3.8, 2.6, 12000.0);
        when(azureMapsService.optimizeWithRestrictions(any(), any()))
            .thenReturn(Map.of("routes", List.of()));
        service.optimize("lng,lat;lng,lat", vehicle);
        verify(azureMapsService).optimizeWithRestrictions(any(), any());
        verifyNoInteractions(mapboxService);
    }
}
```

#### Step 5: Verify Against Requirements

- [x] Business logic in `RouteOptimizationService`, not in controller
- [x] External API calls stay in `MapboxService` and `AzureMapsService`
- [x] `WebClient` used in both sub-services (unchanged)
- [x] Tokens read from `@Value` — no hardcoding
- [x] Controller returns `ResponseEntity<T>` — thin, delegates to orchestrator
- [x] `RoutingException` in `exception/` package, handled by `@ControllerAdvice`
- [x] `VehicleContext` is a Java Record

---

## Example 4: Python — Trip CRUD Authorization Strategy

### Scenario

Trips have an `is_public` flag. The team wants to enforce: authenticated users see their own trips; public trips are visible to all (including guest users); featured trips appear on a public explore page. The current `main.py` has no consistent authorization check.

### ✅ With Tree of Thought (CORE Framework)

**Prompt:**

```markdown
**Context**:
Working in `backend/main.py` and `backend/models.py`.
Models: `User` (has `is_guest`), `Trip` (has `user_id`, `is_public`, `is_featured`).
Auth is via JWT — `get_current_user` dependency in `main.py`. Guest users have
valid JWTs (`is_guest=True`) but cannot create trips.
Schemas are in `schemas.py`; business logic must stay in `*_service.py` files.

**Objective**:
Implement consistent authorization for the trips endpoints:
- `GET /trips/{id}` — owner or public trip
- `GET /trips/` — return only owner's trips
- `POST /trips/` — authenticated non-guest only
- `PATCH /trips/{id}` — owner only

**Requirements** (from python.instructions.md):
- Service-layer pattern — no authorization logic inline in route handlers
- Use `HTTPException` with explicit status codes from `constants.py`
- Pydantic schemas for all responses
- Never return raw SQLAlchemy models

**Use Tree of Thought reasoning:**
1. Generate 3 patterns for centralizing the authorization check:
   - A: FastAPI dependencies — `get_accessible_trip`, `require_trip_owner`
   - B: Service layer method — `trip_service.authorize_access(trip, user)`
   - C: SQLAlchemy query filter — always add `user_id` filter in queries
2. Evaluate each against: DRY, testability, route handler readability, Pydantic compliance
3. Lookahead: What if we add admin roles? What if public trips need rate limiting?
4. Prune and select
5. Produce the dependency functions or service methods and 2 annotated route handlers

**Examples**:
- GET /trips/5 as owner → 200
- GET /trips/5 as other user, trip.is_public=True → 200
- GET /trips/5 as other user, trip.is_public=False → 403
- POST /trips/ as guest → 403
```

#### Step 1: Generate Candidate Branches

```
         [Trip Authorization Strategy]
        /               |              \
   A: FastAPI Deps   B: Service layer   C: Query filter
   (reusable deps)  (authorize method) (DB-level filter)
```

**Branch A — Reusable FastAPI Dependencies**
```python
# trip_deps.py (new module)
async def get_trip_or_404(trip_id: int, db: Session = Depends(get_db)) -> models.Trip:
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
    return trip

async def get_accessible_trip(
    trip: models.Trip = Depends(get_trip_or_404),
    current_user: models.User = Depends(get_current_user),
) -> models.Trip:
    if not trip.is_public and trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail=ErrorMessages.FORBIDDEN)
    return trip

async def require_trip_owner(
    trip: models.Trip = Depends(get_trip_or_404),
    current_user: models.User = Depends(get_current_user),
) -> models.Trip:
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail=ErrorMessages.FORBIDDEN)
    return trip
```
- Route handlers declare intent via `Depends(require_trip_owner)` — declarative at the signature
- Dependencies are independently testable with no web server needed

**Branch B — Authorization inside `trip_service.py`**
```python
# trip_service.py
def authorize_trip_access(trip, user, require_owner=False):
    if require_owner and trip.user_id != user.id:
        raise HTTPException(status_code=403, detail=ErrorMessages.FORBIDDEN)
    if not trip.is_public and trip.user_id != user.id:
        raise HTTPException(status_code=403, detail=ErrorMessages.FORBIDDEN)

# Route handler calls service explicitly
@app.get("/trips/{trip_id}")
async def get_trip(trip_id, current_user=Depends(get_current_user), db=Depends(get_db)):
    trip = trip_service.get_trip_by_id(db, trip_id)
    trip_service.authorize_trip_access(trip, current_user)
    return trip
```
- All trip logic consolidated in `trip_service.py`
- Two explicit service calls per handler (get + authorize)

**Branch C — SQLAlchemy Filter**
```python
# Always filter by user_id OR is_public in the query
@app.get("/trips/{trip_id}")
async def get_trip(trip_id, current_user=Depends(get_current_user), db=Depends(get_db)):
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id,
        (models.Trip.user_id == current_user.id) | (models.Trip.is_public == True)
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
    return trip
```
- Authorization encoded in the query itself
- A 404 is returned where a 403 might be more appropriate (existence leakage)
- Query logic duplicated across GET, PATCH, DELETE handlers

#### Step 2: Evaluate with Lookahead

| Criteria | A (FastAPI Deps) | B (Service method) | C (Query filter) |
|----------|------------------|--------------------|------------------|
| **DRY** | ✅ Dep reused with `Depends()` | ✅ Service method reused | ❌ Filter copy-pasted |
| **Route readability** | ✅ Declarative at signature | ⚠️ Two service calls per handler | ❌ Authorization hidden in query |
| **Testability** | ✅ Dep tested standalone | ✅ Service method unit testable | ❌ Requires DB for every auth test |
| **Correct 403 vs 404** | ✅ Separate get and authorize deps | ✅ Separate calls | ❌ Always 404 |
| **Lookahead: admin roles** | ✅ Add `require_admin` dependency | ⚠️ Add param to service | ❌ Multiple query branches |
| **Lookahead: rate limiting** | ✅ Compose another dependency | ⚠️ Rate limit in service feels wrong | ❌ |
| **Instruction compliance** | ✅ Logic in deps, not route body | ✅ Logic in service | ❌ Query in route handler |

#### Step 3: Prune and Decide

```
         [Trip Authorization Strategy]
        /               |              \
   ⭐ Selected      ⚠️ Viable         ✗ Pruned
```

- **Branch C pruned** — Encoding authorization in SQL queries returns 404 instead of 403 (information leakage), duplicates filter logic across every CRUD endpoint, and requires a database hit to test authorization logic.
- **Branch B viable** but calling `authorize_trip_access` as a separate post-fetch step is easy to forget. It also places `HTTPException` (HTTP concern) inside the service layer.
- **Branch A selected** — FastAPI's `Depends()` is purpose-built for this. Authorization is declarative at the route signature, independently testable, and composable.

#### Step 4: Final Implementation (Branch A)

```python
# backend/trip_deps.py

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
from database import get_db
from constants import ErrorMessages

async def get_trip_or_404(
    trip_id: int,
    db: Session = Depends(get_db),
) -> models.Trip:
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=ErrorMessages.TRIP_NOT_FOUND)
    return trip

async def get_accessible_trip(
    trip: models.Trip = Depends(get_trip_or_404),
    current_user: models.User = Depends(get_current_user),
) -> models.Trip:
    """Allow if trip is public OR current user is the owner."""
    if not trip.is_public and trip.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail=ErrorMessages.FORBIDDEN)
    return trip

async def require_trip_owner(
    trip: models.Trip = Depends(get_trip_or_404),
    current_user: models.User = Depends(get_current_user),
) -> models.Trip:
    """Strict ownership check — used for mutations (PATCH, DELETE)."""
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail=ErrorMessages.FORBIDDEN)
    return trip

async def require_non_guest(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Block guest users from creating or modifying trips."""
    if current_user.is_guest:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail=ErrorMessages.GUESTS_CANNOT_CREATE_TRIPS)
    return current_user
```

```python
# backend/main.py  (route handlers — clean, declarative)

@app.get("/trips/{trip_id}", response_model=schemas.Trip)
async def get_trip(
    trip: models.Trip = Depends(get_accessible_trip),
):
    return trip

@app.post("/trips/", response_model=schemas.Trip, status_code=201)
async def create_trip(
    trip_data: schemas.TripCreate,
    current_user: models.User = Depends(require_non_guest),
    db: Session = Depends(get_db),
):
    return trip_service.create_trip(db, trip_data, current_user.id)

@app.patch("/trips/{trip_id}", response_model=schemas.Trip)
async def update_trip(
    trip_data: schemas.TripUpdate,
    trip: models.Trip = Depends(require_trip_owner),
    db: Session = Depends(get_db),
):
    return trip_service.update_trip(db, trip, trip_data)
```

```python
# backend/tests/test_trip_deps.py

from unittest.mock import MagicMock
import pytest
from fastapi import HTTPException
from trip_deps import get_accessible_trip, require_trip_owner, require_non_guest

def make_trip(user_id=1, is_public=False):
    t = MagicMock()
    t.user_id = user_id
    t.is_public = is_public
    return t

def make_user(user_id=1, is_guest=False):
    u = MagicMock()
    u.id = user_id
    u.is_guest = is_guest
    return u

@pytest.mark.asyncio
async def test_owner_can_access_private_trip():
    trip = make_trip(user_id=1, is_public=False)
    user = make_user(user_id=1)
    result = await get_accessible_trip.__wrapped__(trip, user)
    assert result is trip

@pytest.mark.asyncio
async def test_non_owner_blocked_on_private_trip():
    trip = make_trip(user_id=1, is_public=False)
    user = make_user(user_id=2)
    with pytest.raises(HTTPException) as exc:
        await get_accessible_trip.__wrapped__(trip, user)
    assert exc.value.status_code == 403

@pytest.mark.asyncio
async def test_guest_cannot_create():
    guest = make_user(is_guest=True)
    with pytest.raises(HTTPException) as exc:
        await require_non_guest.__wrapped__(guest)
    assert exc.value.status_code == 403
```

#### Step 5: Verify Against Requirements

- [x] Authorization logic in `trip_deps.py` — zero business logic in route handlers
- [x] `HTTPException` with explicit status codes from `constants.py`
- [x] Pydantic `response_model=schemas.Trip` on every route
- [x] Raw SQLAlchemy models never returned to clients
- [x] Correct 403 vs 404 distinction — existence and access are separate checks

---

## Example 5: Cross-Service — AI Vehicle Parsing Resilience

### Scenario

The Python backend calls the C# AI service via `ai_service.py`. If the C# service is down, the Python backend falls back to rule-based defaults. The team wants to add a health-aware circuit breaker so that after 3 consecutive failures, the Python backend stops attempting the C# call for 60 seconds.

### ✅ With Tree of Thought (CORE Framework)

**Prompt:**

```markdown
**Context**:
`backend/ai_service.py` calls `http://backend-csharp:8081/api/v1/parse-vehicle`
using `httpx.AsyncClient`. Currently it catches `httpx.HTTPError` and returns `None`.
The Python service, Java service, and C# service are Docker containers. In production
the C# service may restart or be briefly unavailable during deployments.

**Objective**:
Add a circuit breaker to `ai_service.py` so repeated failures don't incur
the 30-second `httpx` timeout on every request during a C# service outage.

**Requirements** (from python.instructions.md):
- Business logic isolated in `ai_service.py` — not in `vehicle_service.py` or routes
- No new external dependencies unless absolutely necessary
- Async-safe — must work with FastAPI's async event loop
- Integrate cleanly with existing `None`-fallback contract

**Use Tree of Thought reasoning:**
1. Generate 3 circuit breaker implementation approaches:
   - A: `pybreaker` library — production-grade circuit breaker
   - B: Hand-rolled async circuit breaker class using `asyncio.Lock`
   - C: TTL bool flag — `_circuit_open` bool + last-failure timestamp (module globals)
2. Evaluate against: async-safe, no new heavy deps, easy to unit test,
   minimal code change to `ai_service.py`
3. Lookahead: What if the C# service recovers mid-timeout period?
   What about multiple uvicorn worker processes?
4. Prune and select
5. Produce the final `ai_service.py` with circuit breaker logic

**Examples**:
- C# service up → normal call, returns specs
- C# service down, attempt 1-2 → returns None after timeout
- C# service down, attempt 3+ within 60s → immediate None, no HTTP call made
- C# service recovers after 60s → next request tries again, resets counter on success
```

#### Step 1: Generate Candidate Branches

```
         [Circuit Breaker for C# AI Call]
        /               |              \
   A: pybreaker     B: asyncio.Lock    C: TTL flag
   (library)        (hand-rolled)      (module globals)
```

**Branch A — `pybreaker` library**
```python
import pybreaker

ai_circuit = pybreaker.CircuitBreaker(fail_max=3, reset_timeout=60)

@ai_circuit
async def get_vehicle_specs_from_ai(description: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(...)
        return response.json()
```
- Battle-tested library with configurable states
- `pybreaker` is not async-aware by default — needs shim
- Adds a new dependency; team unfamiliar with it

**Branch B — Hand-rolled `AsyncCircuitBreaker`**
```python
import asyncio, time

class AsyncCircuitBreaker:
    def __init__(self, fail_max: int, reset_timeout: float):
        self._fail_max = fail_max
        self._reset_timeout = reset_timeout
        self._failures = 0
        self._opened_at: float | None = None
        self._lock = asyncio.Lock()

    async def call(self, coro):
        async with self._lock:
            if self._is_open():
                return None  # fast-fail
        try:
            result = await coro
            async with self._lock:
                self._failures = 0
                self._opened_at = None
            return result
        except Exception:
            async with self._lock:
                self._failures += 1
                if self._failures >= self._fail_max:
                    self._opened_at = time.monotonic()
            return None
```
- Fully async-safe, no new deps (~40 lines)
- Explicit state machine — readable and debuggable

**Branch C — TTL bool flag (module globals)**
```python
import time

_failures = 0
_circuit_open_until: float = 0.0

async def get_vehicle_specs_from_ai(description: str):
    global _failures, _circuit_open_until
    if time.monotonic() < _circuit_open_until:
        return None
    try:
        result = await _call_csharp_service(description)
        _failures = 0
        return result
    except Exception:
        _failures += 1
        if _failures >= 3:
            _circuit_open_until = time.monotonic() + 60.0
        return None
```
- Zero new code — inline in the function
- Module-level globals are not safe across concurrent async tasks (race condition)

#### Step 2: Evaluate with Lookahead

| Criteria | A (pybreaker) | B (AsyncCircuitBreaker) | C (TTL flag) |
|----------|---------------|-------------------------|--------------|
| **Async-safe** | ⚠️ Needs shim | ✅ `asyncio.Lock` | ⚠️ Race condition without lock |
| **No heavy deps** | ❌ New dependency | ✅ stdlib only | ✅ stdlib only |
| **Unit testable** | ⚠️ Needs library mocking | ✅ Direct class instantiation | ⚠️ Module globals are hard to reset |
| **Minimal code change** | ✅ Decorator | ⚠️ New class + refactor | ✅ Inline only |
| **Lookahead: C# recovers** | ✅ Automatic half-open | ✅ Retry after timeout | ✅ Retry after TTL |
| **Lookahead: Multi-worker** | ❌ Per-process state | ❌ Per-process state | ❌ Per-process state |
| **Race condition risk** | ✅ None | ✅ Lock prevents it | ❌ Yes — concurrent tasks both read stale `_failures` |

> **Multi-worker note**: All three share the limitation that circuit state is per-process. For true multi-worker reliability, state would need Redis. The Docker-per-service deployment model makes per-process state acceptable here.

#### Step 3: Prune and Decide

```
         [Circuit Breaker for C# AI Call]
        /               |              \
   ⚠️ Dep overhead  ⭐ Selected       ✗ Race condition
```

- **Branch C pruned** — The race condition between concurrent async tasks is a correctness issue. Two requests can both read `_failures = 2` simultaneously and neither opens the circuit. `global` mutation in an async context requires explicit locking.
- **Branch A viable** but adds a dependency for a problem solvable with ~40 lines of stdlib code, and the async integration requires additional setup.
- **Branch B selected** — Fully async-safe with `asyncio.Lock`, no new dependencies, easily unit-testable by instantiating the class directly.

#### Step 4: Final Implementation (Branch B)

```python
# backend/ai_service.py

import httpx
import os
import asyncio
import time
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://backend-csharp:8081")


class AsyncCircuitBreaker:
    """
    Async-safe circuit breaker (stdlib only).
    Opens after `fail_max` consecutive failures; resets after `reset_timeout` seconds.
    """
    CLOSED = "closed"
    OPEN   = "open"

    def __init__(self, fail_max: int = 3, reset_timeout: float = 60.0):
        self._fail_max = fail_max
        self._reset_timeout = reset_timeout
        self._failures = 0
        self._opened_at: Optional[float] = None
        self._lock = asyncio.Lock()

    def _state(self) -> str:
        if self._opened_at is None:
            return self.CLOSED
        if time.monotonic() - self._opened_at >= self._reset_timeout:
            return self.CLOSED  # allow one probe through
        return self.OPEN

    async def call(self, coro) -> Optional[Any]:
        async with self._lock:
            if self._state() == self.OPEN:
                logger.debug("Circuit breaker OPEN — skipping C# AI call")
                return None

        try:
            result = await coro
            async with self._lock:
                self._failures = 0
                self._opened_at = None
            return result
        except Exception as exc:
            async with self._lock:
                self._failures += 1
                if self._failures >= self._fail_max:
                    self._opened_at = time.monotonic()
                    logger.warning(
                        "Circuit breaker opened after %d failures. Retry in %ss.",
                        self._fail_max, self._reset_timeout
                    )
            logger.warning("C# AI service call failed: %s", exc)
            return None


_circuit_breaker = AsyncCircuitBreaker(fail_max=3, reset_timeout=60.0)


async def _raw_call(description: str) -> Optional[Dict[str, Any]]:
    """Direct HTTP call — wrapped by circuit breaker."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{AI_SERVICE_URL}/api/v1/parse-vehicle",
            json={"description": description},
        )
        response.raise_for_status()
        data = response.json()
        specs = data.get("specs", {})
        return {
            "height": specs.get("height", 1.5),
            "width": specs.get("width", 1.8),
            "length": specs.get("length", 4.5),
            "weight": specs.get("weight", 1500) / 1000,
            "fuel_type": "gas",
            "range": 400,
            "mpg": 25,
        }


async def get_vehicle_specs_from_ai(description: str) -> Optional[Dict[str, Any]]:
    """
    Calls the C# AI microservice with circuit-breaker protection.
    Returns None on failure so callers fall back to rule-based defaults.
    """
    return await _circuit_breaker.call(_raw_call(description))
```

```python
# backend/tests/test_ai_service.py

import pytest
import asyncio
from ai_service import AsyncCircuitBreaker


@pytest.mark.asyncio
async def test_circuit_opens_after_three_failures():
    cb = AsyncCircuitBreaker(fail_max=3, reset_timeout=60.0)

    async def always_fail():
        raise Exception("connection refused")

    for _ in range(3):
        await cb.call(always_fail())

    assert cb._state() == AsyncCircuitBreaker.OPEN


@pytest.mark.asyncio
async def test_circuit_skips_call_when_open():
    cb = AsyncCircuitBreaker(fail_max=1, reset_timeout=60.0)
    call_count = 0

    async def counting_fail():
        nonlocal call_count
        call_count += 1
        raise Exception("fail")

    await cb.call(counting_fail())  # opens circuit
    await cb.call(counting_fail())  # should be skipped
    assert call_count == 1          # only one real call made


@pytest.mark.asyncio
async def test_circuit_resets_after_timeout():
    cb = AsyncCircuitBreaker(fail_max=1, reset_timeout=0.01)

    async def fail():
        raise Exception("fail")

    await cb.call(fail())
    await asyncio.sleep(0.02)
    assert cb._state() == AsyncCircuitBreaker.CLOSED
```

#### Step 5: Verify Against Requirements

- [x] Business logic isolated in `ai_service.py` — no circuit breaker logic leaks to callers
- [x] No new dependencies — `asyncio`, `time`, stdlib only
- [x] Async-safe — `asyncio.Lock` prevents race conditions
- [x] Preserves `None`-fallback contract — callers (`vehicle_service.py`) unchanged
- [x] C# service recovery — circuit resets after 60s, next request probes through

---

## Prompt Templates

Use these templates directly in GitHub Copilot Chat (`@workspace`) for each backend:

### Python (FastAPI) ToT Template

```markdown
@workspace **Context**: I'm working in `backend/[file].py`. Stack: FastAPI + SQLAlchemy + Pydantic v2.
[Describe current state and any relevant models/schemas]

**Objective**: [What you want to implement or fix]

**Requirements** (from python.instructions.md):
- Business logic in `*_service.py`, not route handlers
- Pydantic schemas from `schemas.py` for all I/O
- Constants from `constants.py` — no hardcoded strings
- `HTTPException` with explicit status codes only
- [Add task-specific requirements]

**Use Tree of Thought reasoning:**
1. Generate 3 approaches
2. Evaluate each: async correctness, service-layer compliance, testability with pytest+AsyncMock
3. Prune the weakest, explain why
4. Produce final implementation + test stub

**Examples**: [Input → expected output/status code]
```

### C# (ASP.NET) ToT Template

```markdown
@workspace **Context**: I'm working in `backend-csharp/[file].cs`. Stack: ASP.NET Web API .NET 8, Azure.AI.OpenAI.
[Describe current service/controller and the gap]

**Objective**: [What you want to implement or fix]

**Requirements** (from csharp.instructions.md):
- Interface for every service (`IAiParsingService`)
- Config via `IOptions<T>` or environment variables — no hardcoded keys/endpoints
- Controller returns `ActionResult<T>`; no business logic in controllers
- Constructor injection only
- `#nullable enable`
- [Add task-specific requirements]

**Use Tree of Thought reasoning:**
1. Generate 3 patterns
2. Evaluate: controller thinness, testability (xUnit + Moq), .NET 8 idioms, extensibility
3. Prune the weakest, explain why
4. Produce final implementation + unit test structure

**Examples**: [Request → expected response/status code]
```

### Java (Spring Boot) ToT Template

```markdown
@workspace **Context**: I'm working in `backend-java/src/main/java/com/roadtrip/geospatial/`.
Stack: Spring Boot 3, Maven, Java 17, WebClient.
[Describe relevant services/controllers/DTOs and the problem]

**Objective**: [What you want to implement or fix]

**Requirements** (from java.instructions.md):
- Controllers delegate; logic in `service/`
- `@ControllerAdvice` for error handling — no try/catch in controllers
- DTOs as Java Records where possible
- All coordinates `[longitude, latitude]`
- Tokens from `@Value("${...}")` — never hardcoded
- [Add task-specific requirements]

**Use Tree of Thought reasoning:**
1. Generate 3 approaches
2. Evaluate: SRP, Spring Boot idioms, testability (JUnit 5 + Mockito), extensibility
3. Prune the weakest, explain why
4. Produce final implementation + test class skeleton

**Examples**: [Request params → expected response/status]
```

---

## Quick Reference: ToT Decision Criteria by Service

| When you see... | ToT is valuable because... |
|-----------------|----------------------------|
| **Python**: `# TODO` or sync call to async service | Multiple async patterns exist; wrong choice blocks the event loop |
| **Python**: Authorization scattered in route handlers | Service-layer deps vs. service method vs. query filtering are all valid |
| **C#**: Broad `catch (Exception)` in service | Result types, custom exceptions, `IExceptionHandler` each have trade-offs |
| **C#**: Config duplication across services | `IOptions<T>` vs. direct `Environment.GetEnvironmentVariable` trade-offs |
| **Java**: Controller calling two external APIs | Strategy, orchestrator, delegate — SRP implications differ per pattern |
| **Java**: External API error handling | Custom exceptions vs. `ResponseStatusException` vs. inline `try/catch` |
| **All**: New cross-cutting behaviour (logging, rate limiting, caching) | Interceptors, filters, middleware, decorators, FastAPI deps — choose once consistently |
