# Workshop 3: Advanced Web Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, Zustand/Pydantic patterns

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

### CORE Prompt Framework

All prompts in this workshop follow the **CORE** framework:

| Element | Meaning | Example |
|---------|---------|---------|
| **C** – Context | Background, tech stack, relevant files | "In the Spring Boot Java backend (`backend-java/`)..." |
| **O** – Objective | What you want Copilot to produce | "Implement route optimization with vehicle constraints" |
| **R** – Requirements | Constraints, rules, patterns to follow | "Use `WebClient` for HTTP calls, return DTOs, no raw `Map`" |
| **E** – Examples | Expected inputs/outputs, code patterns | "Input: `coords='lng,lat;lng,lat'` → Output: `DirectionsResponse`" |

---

## Workshop Agenda

| Time | Demo | Topic | Languages | Focus Files |
|------|------|-------|-----------|-------------|
| 0-10 min | Demo 1 | Chain-of-Thought Prompting | Python, C#, Java | `vehicle_service.py`, `AiParsingService.cs`, `MapboxService.java` |
| 10-20 min | Demo 2 | Instruction Files | All | `.github/copilot-instructions.md` |
| 20-30 min | Demo 3 | Prompt Files | Python, C#, Java | `.github/prompts/*.prompt.md` |
| 30-40 min | Demo 4 | Copilot Code Review | All | Pull Request review |
| 40-55 min | Demo 5 | Copilot Plan Mode | Python, Java | `backend/tests/`, `backend-java/` |
| 55-70 min | Demo 6 | Copilot Coding Agent | C#, Python, Java | Multi-service refactoring |
| 70-80 min | Demo 7 | Copilot Agent HQ | All | Custom agent creation |
| 80-90 min | Demo 8 | Architecture & Tech Stack Generation | All | New service scaffolding |

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex features into step-by-step reasoning chains that guide Copilot toward correct solutions.

### Scenario
Add vehicle-aware constraints across three backends: the Python vehicle service, the C# AI parser, and the Java directions endpoint.

---

### Example 1A: Python — Vehicle Fuel Range Validation (`backend/vehicle_service.py`)

**CORE Prompt:**
```
Context: In the Python backend vehicle_service.py, we have a DEFAULT_VEHICLE_SPECS
dictionary with vehicle types like 'rv_large', 'ev_sedan', 'truck'. Each has range (miles)
and mpg. The function get_vehicle_specs() returns a VehicleSpecsResponse.

Objective: Add a function calculate_fuel_stops() that determines required fuel stops
for a given route distance.

Requirements:
- Use VehicleSpecsResponse schema from schemas.py
- Include safety margin (refuel at 80% of max range)
- Return list of recommended fuel stop distances in miles
- Handle electric vehicles differently (charging time estimate)

Examples:
- Input: vehicle_type='rv_large' (range=400mi), route_distance=1200mi
  Output: [320, 640, 960] (stops every 320mi = 400 × 0.8)
- Input: vehicle_type='ev_sedan' (range=300mi), route_distance=500mi
  Output: [240] (one charge stop at 240mi = 300 × 0.8)

Chain of thought:
Step 1: Look up vehicle specs from DEFAULT_VEHICLE_SPECS
Step 2: Calculate safe range (max_range × 0.8)
Step 3: Generate stop positions at each safe_range interval
Step 4: Handle EV differently — add estimated charge time (30 min per stop)
Step 5: Return structured response with stop distances and metadata

Now implement:
```

**Expected Copilot Output:**
```python
# In backend/vehicle_service.py

def calculate_fuel_stops(vehicle_type: str, route_distance_miles: float) -> dict:
    """
    Calculate recommended fuel/charge stops along a route.

    Args:
        vehicle_type: Vehicle type key from DEFAULT_VEHICLE_SPECS
        route_distance_miles: Total route distance in miles

    Returns:
        Dictionary with stop positions and metadata
    """
    # Step 1: Look up vehicle specs
    specs = DEFAULT_VEHICLE_SPECS.get(vehicle_type.lower(), DEFAULT_VEHICLE_SPECS["car"])

    # Step 2: Calculate safe range (80% of max)
    max_range = specs["range"]
    safe_range = max_range * 0.8

    # Step 3: Generate stop positions
    stops = []
    current_distance = safe_range
    while current_distance < route_distance_miles:
        stops.append(round(current_distance, 1))
        current_distance += safe_range

    # Step 4: Handle EV charging time
    is_electric = specs["fuelType"] == "electric"
    estimated_stop_time_minutes = 30 if is_electric else 10

    # Step 5: Return structured response
    return {
        "vehicle_type": vehicle_type,
        "max_range_miles": max_range,
        "safe_range_miles": safe_range,
        "fuel_stops": stops,
        "total_stops": len(stops),
        "is_electric": is_electric,
        "estimated_stop_time_minutes": estimated_stop_time_minutes * len(stops),
    }
```

---

### Example 1B: C# — Azure OpenAI Spec Validation (`backend-csharp/Services/AiParsingService.cs`)

**CORE Prompt:**
```
Context: In the C# backend AiParsingService.cs, the ParseWithAzureOpenAI method sends
a vehicle description to Azure OpenAI with VehicleParsingSystemPrompt. The response is
deserialized into a VehicleSpecs record (vehicleType, length, width, height, weight,
maxWeight, numAxles, isCommercial). The GetFallbackSpecs method handles cases when
Azure OpenAI is unavailable.

Objective: Add a new method ValidateAndEnrichSpecs that validates AI-parsed specs
against physical constraints and enriches with derived fields.

Requirements:
- Validate height < 5m, weight < 40000kg, length < 25m
- Add derived fields: clearanceCategory (low/standard/oversized), requiresPermit
- Use the existing VehicleSpecs model from Models/AiModels.cs
- Log warnings for out-of-range values using ILogger
- Return enriched specs, never throw — clamp to valid ranges instead

Examples:
- Input: VehicleSpecs { Height = 3.5, Weight = 8000, Length = 10.0 }
  Output: VehicleSpecs + { clearanceCategory = "oversized", requiresPermit = false }
- Input: VehicleSpecs { Height = 12.0, Weight = 50000 } (invalid)
  Output: Clamped to Height = 5.0, Weight = 40000, logged warning

Chain of thought:
Step 1: Define physical constraint constants
Step 2: Validate each dimension, clamp if out-of-range, log warning
Step 3: Derive clearanceCategory from height (< 2m = low, < 3m = standard, else oversized)
Step 4: Derive requiresPermit from weight > 11793kg (26,000 lbs federal limit)
Step 5: Return enriched VehicleSpecs

Now implement:
```

**Expected Copilot Output:**
```csharp
// In backend-csharp/Services/AiParsingService.cs

private const double MaxHeightMeters = 5.0;
private const double MaxWeightKg = 40000.0;
private const double MaxLengthMeters = 25.0;
private const double PermitWeightThresholdKg = 11793.0; // 26,000 lbs

private VehicleSpecs ValidateAndEnrichSpecs(VehicleSpecs specs)
{
    // Step 2: Validate and clamp dimensions
    if (specs.Height > MaxHeightMeters)
    {
        _logger.LogWarning("Height {Height}m exceeds max {Max}m, clamping",
            specs.Height, MaxHeightMeters);
        specs.Height = MaxHeightMeters;
    }

    if (specs.Weight > MaxWeightKg)
    {
        _logger.LogWarning("Weight {Weight}kg exceeds max {Max}kg, clamping",
            specs.Weight, MaxWeightKg);
        specs.Weight = MaxWeightKg;
    }

    if (specs.Length > MaxLengthMeters)
    {
        _logger.LogWarning("Length {Length}m exceeds max {Max}m, clamping",
            specs.Length, MaxLengthMeters);
        specs.Length = MaxLengthMeters;
    }

    // Step 3: Derive clearance category
    _logger.LogInformation("Clearance: {Category}, Permit required: {Permit}",
        GetClearanceCategory(specs.Height),
        specs.Weight > PermitWeightThresholdKg);

    return specs;
}

private static string GetClearanceCategory(double heightMeters) =>
    heightMeters switch
    {
        < 2.0 => "low",
        < 3.0 => "standard",
        _ => "oversized",
    };
```

---

### Example 1C: Java — Vehicle-Aware Directions (`backend-java/.../service/MapboxService.java`)

**CORE Prompt:**
```
Context: In the Java backend MapboxService.java, the getDirections method calls
Mapbox Directions API at /directions/v5/mapbox/{profile}/{coords} with WebClient.
Current profiles are 'driving', 'walking', 'cycling'. The method returns a
DirectionsResponse(distance, duration, geometry, legs) record.

Objective: Add support for vehicle-specific routing profiles that map vehicle
types to Mapbox profiles and include dimension annotations.

Requirements:
- Map vehicle types to Mapbox profiles: car→driving, rv/truck→driving (with
  annotations for max_height, max_weight, max_width via query params)
- Add exclude parameter for truck routes (exclude=ferry when weight > 10000kg)
- Use @Value for any configurable thresholds
- Maintain backward compatibility — default to "driving" when no vehicle params

Examples:
- Input: coords="lng,lat;lng,lat", profile="driving", vehicleHeight=null → standard call
- Input: coords="lng,lat;lng,lat", profile="driving", vehicleHeight=3.5,
         vehicleWeight=8000 → add max_height=3.5&max_weight=8000&exclude=ferry

Chain of thought:
Step 1: Add optional vehicle parameters to method signature
Step 2: Build base URI the same as existing code
Step 3: Conditionally append vehicle dimension query params
Step 4: If weight > 10000kg, add exclude=ferry
Step 5: Parse response same as existing, return DirectionsResponse

Now implement:
```

**Expected Copilot Output:**
```java
// In backend-java/.../service/MapboxService.java

private static final double HEAVY_VEHICLE_THRESHOLD_KG = 10000.0;

public DirectionsResponse getDirections(
        String coords, String profile,
        Double vehicleHeight, Double vehicleWeight, Double vehicleWidth) {
    validateToken();

    Map<String, Object> data = webClient.get()
            .uri(uriBuilder -> {
                var builder = uriBuilder
                        .path("/directions/v5/mapbox/{profile}/{coords}")
                        .queryParam("geometries", "geojson")
                        .queryParam("overview", "full")
                        .queryParam("steps", true)
                        .queryParam("access_token", mapboxToken);

                // Step 3: Conditionally append vehicle dimensions
                if (vehicleHeight != null) {
                    builder.queryParam("max_height", vehicleHeight);
                }
                if (vehicleWeight != null) {
                    builder.queryParam("max_weight", vehicleWeight / 1000.0); // kg to tonnes
                }
                if (vehicleWidth != null) {
                    builder.queryParam("max_width", vehicleWidth);
                }

                // Step 4: Exclude ferries for heavy vehicles
                if (vehicleWeight != null && vehicleWeight > HEAVY_VEHICLE_THRESHOLD_KG) {
                    builder.queryParam("exclude", "ferry");
                }

                return builder.build(profile, coords);
            })
            .retrieve()
            .bodyToMono(Map.class)
            .block();

    // ... existing response parsing ...
}
```

---

### Teaching Points

| Chain-of-Thought Formula | Python Example | C# Example | Java Example |
|-------------------------|----------------|------------|--------------|
| Step 1: Requirements | Fuel stop inputs/outputs | Validation constraints | Vehicle query params |
| Step 2: Data model | `VehicleSpecsResponse` | `VehicleSpecs` record | `DirectionsResponse` DTO |
| Step 3: Business logic | Range × 0.8 safety | Clamp to max values | Profile mapping |
| Step 4: Integration | Dict lookup | Azure OpenAI fallback | Mapbox WebClient |
| Step 5: Response | Structured dict | Enriched specs | Unchanged DTO |

**When to Use**: Multi-step features, unfamiliar APIs, complex business rules  
**Avoid**: Simple CRUD, trivial getters/setters

---

## Demo 2: Instruction Files (10 min)

### Objective
Customize `.github/copilot-instructions.md` with project-specific rules that Copilot automatically applies across all three backends.

### Scenario
Add rules that enforce our polyglot project conventions across Python, C#, and Java.

### Live Coding Steps

**Step 1: Add coordinate format rule (applies to all backends)**
```markdown
<!-- In .github/copilot-instructions.md -->

### 🚨 CRITICAL: Coordinate Format (All Backends)

**ALWAYS use GeoJSON format: `[longitude, latitude]` — NOT `[lat, lng]`**

```python
# ❌ WRONG (Python)
coordinates = (37.7749, -122.4194)  # lat, lng

# ✅ CORRECT (Python — see schemas.py POIResponse)
coordinates: Tuple[float, float] = (-122.4194, 37.7749)  # lng, lat
```

```csharp
// ❌ WRONG (C#)
var coords = new { Lat = 37.7749, Lng = -122.4194 };

// ✅ CORRECT (C# — match GeoJSON spec)
var coords = new double[] { -122.4194, 37.7749 }; // [lng, lat]
```

```java
// ❌ WRONG (Java)
List.of(lat, lon)

// ✅ CORRECT (Java — see GeocodeResponse record)
return new GeocodeResponse(List.of(longitude, latitude), placeName);
```
```

**Step 2: Add service boundary rules**
```markdown
### 🚨 Service Boundaries — Who Does What

| Responsibility | Backend | DO NOT put in |
|-------------- |---------|---------------|
| Auth & Trips CRUD | Python (`backend/`) | C# or Java |
| AI Parsing (Azure OpenAI) | C# (`backend-csharp/`) | Python or Java |
| Geospatial (Mapbox, Azure Maps) | Java (`backend-java/`) | Python or C# |
| Routing/Proxying | BFF (`bff/`) | Any backend |

```python
# ❌ WRONG — geocoding in Python backend
@app.get("/api/geocode")
def geocode(q: str):
    response = httpx.get(f"https://api.mapbox.com/geocoding/...")

# ✅ CORRECT — geocoding is handled by Java backend GeospatialController
# BFF routes /api/geocode → backend-java:8082
```

```csharp
// ❌ WRONG — trip CRUD in C# backend
[HttpPost("trips")]
public async Task<ActionResult> CreateTrip(Trip trip) { ... }

// ✅ CORRECT — C# only handles AI parsing
[HttpPost("parse-vehicle")]
public async Task<ActionResult<ParseVehicleResponse>> ParseVehicle(...)
```

```java
// ❌ WRONG — auth in Java backend
@PostMapping("/api/auth/login")
public ResponseEntity<?> login(...) { ... }

// ✅ CORRECT — Java only handles geospatial
@GetMapping("/api/directions")
public ResponseEntity<DirectionsResponse> getDirections(...)
```
```

**Step 3: Add error handling pattern per language**
```markdown
### 🚨 Error Handling Patterns (Per Language)

```python
# Python — use HTTPException with Pydantic validation
from fastapi import HTTPException
raise HTTPException(status_code=404, detail="Trip not found")
```

```csharp
// C# — use ActionResult with typed error responses
return BadRequest(new { error = "description is required" });
```

```java
// Java — use ResponseStatusException from Spring
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found");
```
```

### Teaching Points

| Instruction Rule | Format | Scope |
|-----------------|--------|-------|
| Coordinate format | `[lng, lat]` with ❌/✅ | All backends |
| Service boundaries | Table + anti-patterns | Architecture |
| Error patterns | Language-specific with imports | Per backend |
| API proxy rule | BFF-first routing | Frontend → BFF |

---

## Demo 3: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files with CORE framework for consistent code generation in each language.

### Scenario
Create prompt files for C# controller, Python endpoint, and Java service patterns.

---

### Step 1: Create C# Controller Prompt

```markdown
<!-- .github/prompts/csharp-controller.prompt.md -->

# C# ASP.NET Controller Generator (CORE Framework)

## Context
You are generating an ASP.NET Web API controller for the Road Trip Planner C# backend
(`backend-csharp/`). The service uses dependency injection via `IAiParsingService`,
`ILogger<T>`, and follows the existing `VehicleController.cs` pattern.

## Objective
Generate a new API controller with proper DI, request validation, XML docs, and
error handling.

## Requirements
- Inherit from `ControllerBase` with `[ApiController]` attribute
- Use `[Route("api/v1")]` base route (matching existing controllers)
- Inject services via constructor (interface-based DI)
- Validate request bodies — return `BadRequest` for invalid input
- Include `<summary>` XML doc comments on all public methods
- Use `ActionResult<T>` return types with typed response models
- Models go in `Models/` directory (see `AiModels.cs` pattern)
- Log operations via `ILogger<T>`
- No hardcoded strings — use constants or configuration

## Examples

### Input
"Create a controller for trip estimation that accepts origin, destination,
and vehicle type, then returns estimated fuel cost and travel time."

### Expected Output
```csharp
using Microsoft.AspNetCore.Mvc;
using RoadTrip.AiService.Models;
using RoadTrip.AiService.Services;

namespace RoadTrip.AiService.Controllers;

[ApiController]
[Route("api/v1")]
public class EstimationController : ControllerBase
{
    private readonly IAiParsingService _aiService;
    private readonly ILogger<EstimationController> _logger;

    public EstimationController(IAiParsingService aiService,
        ILogger<EstimationController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Estimate fuel cost and travel time for a trip.
    /// </summary>
    [HttpPost("estimate-trip")]
    public async Task<ActionResult<TripEstimateResponse>> EstimateTrip(
        [FromBody] TripEstimateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Origin)
            || string.IsNullOrWhiteSpace(request.Destination))
        {
            return BadRequest(new { error = "origin and destination are required" });
        }

        _logger.LogInformation("Estimating trip: {Origin} → {Destination}",
            request.Origin, request.Destination);
        // Implementation ...
    }
}
```

## Checklist
- [ ] `[ApiController]` and `[Route("api/v1")]` attributes
- [ ] Constructor injection with interfaces
- [ ] Input validation with `BadRequest` responses
- [ ] XML doc `<summary>` on all public methods
- [ ] `ActionResult<T>` typed responses
- [ ] `ILogger` for observability
```

---

### Step 2: Create Python FastAPI Endpoint Prompt

```markdown
<!-- .github/prompts/fastapi-endpoint.prompt.md -->

# FastAPI Endpoint Generator (CORE Framework)

## Context
You are generating a FastAPI endpoint for the Road Trip Planner Python backend
(`backend/`). The backend uses SQLAlchemy for ORM, Pydantic schemas in `schemas.py`,
service modules for business logic (e.g., `vehicle_service.py`, `ai_service.py`),
and `httpx` for calling external APIs.

## Objective
Generate a new API endpoint following existing patterns from `main.py`.

## Requirements
- Define Pydantic request/response models in `schemas.py` or inline
- Use service layer for business logic (NOT inline in route handler)
- Protected endpoints use `Depends(get_current_user)` (see `main.py` line 30)
- Database access via `db: Session = Depends(get_db)`
- Use `HTTPException` with clear status codes (400, 401, 404, 500)
- External APIs must go through backend services — never call Mapbox/Azure directly
- No hardcoded strings — define constants in a constants module
- Include type hints on all function parameters and returns

## Examples

### Input
"Create an endpoint POST /api/trip-stats that accepts a trip_id,
calculates statistics (total distance, fuel cost, estimated time),
and returns them."

### Expected Output
```python
class TripStatsRequest(BaseModel):
    trip_id: int

class TripStatsResponse(BaseModel):
    trip_id: int
    total_distance_miles: float
    estimated_fuel_cost: float
    estimated_hours: float
    fuel_stops_needed: int

@app.post("/api/trip-stats", response_model=TripStatsResponse)
async def get_trip_stats(
    request: TripStatsRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate statistics for a saved trip."""
    trip = db.query(models.Trip).filter(
        models.Trip.id == request.trip_id,
        models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    stats = vehicle_service.calculate_trip_stats(trip)
    return TripStatsResponse(**stats)
```

## Checklist
- [ ] Pydantic model for request and response
- [ ] Auth dependency (`get_current_user`) on protected routes
- [ ] Database via `Depends(get_db)` — never create sessions manually
- [ ] Service layer for logic — route handler is thin
- [ ] `HTTPException` with specific status codes
- [ ] Type hints everywhere
```

---

### Step 3: Create Java Spring Boot Service Prompt

```markdown
<!-- .github/prompts/spring-service.prompt.md -->

# Spring Boot Service Generator (CORE Framework)

## Context
You are generating a Spring Boot 3 service for the Road Trip Planner Java backend
(`backend-java/`). The backend uses `WebClient` for external API calls (Mapbox,
Azure Maps), `@Value` for configuration injection, DTOs as Java records, and
`ResponseStatusException` for error handling.

## Objective
Generate a new service class following the existing `MapboxService.java` and
`AzureMapsService.java` patterns.

## Requirements
- Annotate with `@Service`
- Use constructor injection (no `@Autowired` on fields)
- Configuration via `@Value("${geospatial.xxx}")` from application.yml
- HTTP calls via `WebClient` (not RestTemplate — it's deprecated)
- DTOs as Java `record` types in `dto/` directory
- Use `ResponseStatusException` for errors (not custom exception classes)
- Log with SLF4J `LoggerFactory.getLogger()`
- Coordinates in [lng, lat] GeoJSON order
- Validate API keys before making external calls

## Examples

### Input
"Create a service that calls Azure Maps Route API to get route summaries
with traffic awareness."

### Expected Output
```java
@Service
public class AzureRouteService {

    private static final Logger log = LoggerFactory.getLogger(AzureRouteService.class);

    private final WebClient webClient;
    private final String azureMapsKey;

    public AzureRouteService(
            WebClient.Builder webClientBuilder,
            @Value("${geospatial.azure-maps.base-url}") String baseUrl,
            @Value("${geospatial.azure-maps.key}") String key) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.azureMapsKey = key;
    }

    public RouteResponse getRoute(String origin, String destination) {
        validateKey();
        // Implementation using WebClient...
    }

    private void validateKey() {
        if (azureMapsKey == null || azureMapsKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Azure Maps key not configured");
        }
    }
}
```

## Checklist
- [ ] `@Service` annotation
- [ ] Constructor injection (no field `@Autowired`)
- [ ] `@Value` for configuration
- [ ] `WebClient` for HTTP (not RestTemplate)
- [ ] DTOs as `record` types
- [ ] `ResponseStatusException` for errors
- [ ] SLF4J logging
- [ ] API key validation
```

---

### Step 4: Use a Prompt File in Chat

```
# In Copilot Chat (using the C# prompt):
#file:.github/prompts/csharp-controller.prompt.md

Create a HealthAnalysisController that accepts a list of coordinates
and returns elevation changes, road conditions, and weather warnings
for the route segment.
```

### Teaching Points

| Prompt File Element | Python | C# | Java |
|--------------------|--------|-----|------|
| **C**ontext | `backend/`, FastAPI, SQLAlchemy | `backend-csharp/`, ASP.NET, DI | `backend-java/`, Spring Boot, WebClient |
| **O**bjective | Endpoint + Pydantic models | Controller + ActionResult | Service + DTO records |
| **R**equirements | `HTTPException`, service layer | `BadRequest`, XML docs | `ResponseStatusException`, `@Value` |
| **E**xamples | Request/Response models | Full controller class | Full service class |

---

## Demo 4: Copilot Code Review (10 min)

### Objective
Use Copilot to review pull requests across all three backends, identifying language-specific issues.

### Scenario
Review a PR that adds route caching logic across C#, Python, and Java backends.

### Live Coding Steps

**Step 1: Invoke Copilot Code Review with CORE Prompt**
```
Context: A PR adds Redis-based route caching to all three backends:
- Python: backend/main.py — caches trip queries
- C#: backend-csharp/Services/AiParsingService.cs — caches AI responses
- Java: backend-java/.../service/MapboxService.java — caches directions

The project uses:
- Python: FastAPI, httpx, SQLAlchemy
- C#: ASP.NET 8, Azure OpenAI SDK, dependency injection
- Java: Spring Boot 3, WebClient, @Value config

Objective: Review all changes for security, correctness, and pattern adherence.

Requirements: Check for
1. Security vulnerabilities (cache poisoning, sensitive data in cache)
2. Service boundary violations (see copilot-instructions.md)
3. Error handling patterns per language
4. Coordinate format compliance ([lng, lat])
5. Missing test coverage

Examples of issues to flag:
- Redis connection strings hardcoded instead of env vars
- Cache keys including user tokens (sensitive data leak)
- Missing cache TTL (stale data)
```

**Step 2: Expected Copilot Review Output**
```markdown
## Code Review: Route Caching Feature

### 🔴 Critical Issues

**1. Hardcoded Redis URL (Python — backend/main.py:89)**
```python
# ❌ Current code
redis_client = redis.Redis(host="redis-prod.internal", port=6379)

# ✅ Fix: Use environment variable
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(redis_url)
```

**2. Auth Token in Cache Key (C# — AiParsingService.cs:45)**
```csharp
// ❌ Current — leaks auth tokens into cache
var cacheKey = $"vehicle:{request.Description}:{authToken}";

// ✅ Fix — cache by content hash only
var cacheKey = $"vehicle:{ComputeHash(request.Description)}";
```

**3. No Cache TTL (Java — MapboxService.java:112)**
```java
// ❌ Current — cache never expires
redisTemplate.opsForValue().set(cacheKey, response);

// ✅ Fix — add 1-hour TTL
redisTemplate.opsForValue().set(cacheKey, response, Duration.ofHours(1));
```

### 🟡 Warnings

**4. Service Boundary Violation (Python — main.py:95)**
```python
# ❌ Python backend caching geocode results — belongs in Java backend
@app.get("/api/geocode")
def geocode_cached(q: str):
    cached = redis_client.get(f"geocode:{q}")

# ✅ Geocoding cache should be in backend-java MapboxService
# Python backend should not handle geocoding at all
```

**5. Missing Error Handling on Cache Failure (C#)**
```csharp
// ❌ Current — exception if Redis is down
var cached = await _cache.GetStringAsync(cacheKey);

// ✅ Fix — graceful degradation
try {
    var cached = await _cache.GetStringAsync(cacheKey);
} catch (Exception ex) {
    _logger.LogWarning(ex, "Cache unavailable, proceeding without cache");
}
```

### 🟢 Suggestions

**6. Use Consistent Cache Key Prefixes**
| Backend | Current | Recommended |
|---------|---------|-------------|
| Python | `trip:{id}` | `py:trip:{id}` |
| C# | `vehicle:{hash}` | `cs:vehicle:{hash}` |
| Java | `mapbox:{coords}` | `java:mapbox:{coords}` |

**7. Add Cache Hit/Miss Metrics Logging**
All three backends should log cache hits/misses for observability.

### Summary
- 3 critical issues (must fix before merge)
- 2 warnings (should fix)
- 2 suggestions (nice to have)
```

### Teaching Points

| Review Focus | Python Check | C# Check | Java Check |
|-------------|-------------|----------|------------|
| Security | `os.getenv()` for secrets | No tokens in cache keys | `@Value` for config |
| Patterns | `HTTPException` | `ActionResult` | `ResponseStatusException` |
| Boundaries | No geocoding logic | No trip CRUD | No auth logic |
| Testing | pytest fixtures | xUnit/Moq | JUnit + MockWebServer |

---

## Demo 5: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect multi-step solutions before implementation.

### Scenario
Create a comprehensive plan to mock external APIs in **both** the Python backend tests and add integration tests for the Java backend (Issue #4).

### Live Coding Steps

**Step 1: Invoke Plan Mode with CORE prompt**
```
Context: The Road Trip Planner has three backends. Currently:
- Python tests (backend/tests/) partially mock external APIs using conftest.py fixtures
  and JSON files in tests/fixtures/. Some tests still hit real Mapbox/Azure APIs.
- Java backend (backend-java/) has NO tests for MapboxService or AzureMapsService.
- C# backend has no test project yet.
- CI pipeline (.github/workflows/backend.yml) has continueOnError: true.

Key files:
- backend/tests/conftest.py — existing pytest fixtures
- backend/tests/fixtures/ — JSON response mocks
- backend-java/src/main/java/.../service/MapboxService.java — needs tests
- backend-java/src/main/java/.../service/AzureMapsService.java — needs tests
- backend-csharp/Services/AiParsingService.cs — needs tests

Objective: Create a phased plan to achieve 100% mocked tests across all backends.

Requirements:
- Python: Use unittest.mock.patch with httpx (existing pattern in conftest.py)
- Java: Use MockWebServer or WireMock for WebClient testing
- C#: Use Moq or NSubstitute for interface-based mocking
- All tests must pass without network calls
- Remove continueOnError from CI after verification

Examples of existing Python test pattern:
  def test_geocode_success(mock_httpx_geocode_success):
      response = client.get("/api/geocode?q=San Francisco")
      assert response.status_code == 200
      assert data["coordinates"] == [-122.4194, 37.7749]
```

**Step 2: Review generated plan**
```markdown
## Plan: Mock External APIs Across All Backends

### Phase 1: Complete Python Mocking (30 min)
☐ 1.1 Audit existing `conftest.py` fixtures — verify all 5 endpoints mocked
☐ 1.2 Add missing fixture: `mock_httpx_directions_error` for 400 responses
☐ 1.3 Verify: `cd backend && pytest tests/ -v` (all green, no network)

### Phase 2: Java Backend Tests (45 min)
☐ 2.1 Add test dependencies to `pom.xml`:
```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>mockwebserver</artifactId>
    <scope>test</scope>
</dependency>
```

☐ 2.2 Create `MapboxServiceTest.java`:
```java
@SpringBootTest
class MapboxServiceTest {
    private MockWebServer mockServer;

    @BeforeEach
    void setUp() throws IOException {
        mockServer = new MockWebServer();
        mockServer.start();
    }

    @Test
    void geocode_validAddress_returnsCoordinates() {
        mockServer.enqueue(new MockResponse()
            .setBody(GEOCODE_RESPONSE_JSON)
            .setHeader("Content-Type", "application/json"));
        // ...
    }
}
```

☐ 2.3 Create `AzureMapsServiceTest.java` with similar pattern
☐ 2.4 Create `GeospatialControllerTest.java` for integration tests
☐ 2.5 Verify: `cd backend-java && ./mvnw test`

### Phase 3: C# Backend Tests (30 min)
☐ 3.1 Create test project:
```bash
dotnet new xunit -n RoadTrip.AiService.Tests
dotnet add reference ../backend-csharp/RoadTrip.AiService.csproj
dotnet add package Moq
```

☐ 3.2 Create `AiParsingServiceTests.cs`:
```csharp
public class AiParsingServiceTests
{
    [Fact]
    public async Task ParseVehicle_WithRvDescription_ReturnsRvSpecs()
    {
        var service = new AiParsingService(Mock.Of<ILogger<AiParsingService>>());
        var result = await service.ParseVehicleAsync("2024 Winnebago View 24D");
        Assert.Equal("rv", result.Specs.VehicleType);
    }

    [Fact]
    public async Task ParseVehicle_FallbackWhenAiUnavailable_ReturnsDefaultCar()
    {
        var service = new AiParsingService(Mock.Of<ILogger<AiParsingService>>());
        var result = await service.ParseVehicleAsync("some car");
        Assert.Equal("car", result.Specs.VehicleType);
        Assert.Equal(1500, result.Specs.Weight);
    }
}
```

☐ 3.3 Create `VehicleControllerTests.cs` for endpoint tests
☐ 3.4 Verify: `cd backend-csharp && dotnet test`

### Phase 4: CI Cleanup (10 min)
☐ 4.1 Remove `continueOnError: true` from `.github/workflows/backend.yml`
☐ 4.2 Add Java test step: `./mvnw test`
☐ 4.3 Add C# test step: `dotnet test`
☐ 4.4 Push and verify CI passes

### Phase 5: Documentation (10 min)
☐ 5.1 Add `backend/tests/README.md` with Python mocking guide
☐ 5.2 Add `backend-java/src/test/README.md` with Java testing guide
☐ 5.3 Update ROADMAP.md — close Issue #4

**Success Criteria**:
✅ Python: All 14 tests pass without network (currently 10/14)
✅ Java: 8+ new tests for MapboxService and AzureMapsService
✅ C#: 6+ tests for AiParsingService (fallback behavior)
✅ CI pipeline has no continueOnError
✅ Total test runtime < 15 seconds across all backends
```

### Teaching Points

| Plan Mode Element | Purpose |
|------------------|---------|
| Multi-phase by backend | Clear ownership per language |
| Specific file paths | No ambiguity on what to create |
| Code snippets per language | Immediate implementation reference |
| Verification commands | Per-backend test runners |
| Success criteria | Measurable definition of done |

---

## Demo 6: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file tasks to Copilot's coding agent across all three backends.

### Scenario
Use the coding agent to standardize error handling across the Python, C#, and Java backends.

### Live Coding Steps

**Step 1: Invoke Copilot Agent with CORE prompt**
```
Context: The Road Trip Planner has three backends with inconsistent error responses:
- Python (backend/main.py): Uses HTTPException with varying detail formats
- C# (backend-csharp/Controllers/VehicleController.cs): Returns anonymous objects
  e.g., return BadRequest(new { error = "description is required" })
- Java (backend-java/.../service/MapboxService.java): Uses ResponseStatusException
  e.g., throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found")

Objective: Standardize all error responses to return a consistent JSON envelope:
{ "error": "<ERROR_CODE>", "message": "<human-readable>", "statusCode": <int> }

Requirements:
1. Python: Create a custom exception handler in main.py using @app.exception_handler
2. C#: Create an ErrorResponse record in Models/AiModels.cs
3. Java: Create a GlobalExceptionHandler with @ControllerAdvice
4. Update all existing error responses to use the new format
5. Keep each change within the correct service boundary
6. Do NOT change test assertions — only production error paths

Examples:
- Python before: raise HTTPException(status_code=404, detail="Trip not found")
  Python after:  raise AppError(404, "TRIP_NOT_FOUND", "Trip not found")

- C# before: return BadRequest(new { error = "description is required" })
  C# after:  return BadRequest(new ErrorResponse("VALIDATION_ERROR",
             "description is required", 400))

- Java before: throw new ResponseStatusException(HttpStatus.NOT_FOUND,
               "Address not found")
  Java after:  throw new AppException("GEOCODE_NOT_FOUND",
               "Address not found", 404)

Report progress after completing each backend.
```

**Step 2: Agent executes autonomously**
```markdown
## Agent Progress Report

### Backend 1: Python (backend/)

**Created** `backend/errors.py`:
```python
from fastapi.responses import JSONResponse

class AppError(Exception):
    def __init__(self, status_code: int, error: str, message: str):
        self.status_code = status_code
        self.error = error
        self.message = message
```

**Updated** `backend/main.py` — Added exception handler:
```python
from errors import AppError

@app.exception_handler(AppError)
async def app_error_handler(request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error,
            "message": exc.message,
            "statusCode": exc.status_code,
        }
    )
```

**Updated** 6 error sites in `main.py`
**Status**: ✅ Complete

---

### Backend 2: C# (backend-csharp/)

**Added to** `Models/AiModels.cs`:
```csharp
public record ErrorResponse(string Error, string Message, int StatusCode);
```

**Updated** `Controllers/VehicleController.cs`:
```csharp
// Before
return BadRequest(new { error = "description is required" });

// After
return BadRequest(new ErrorResponse("VALIDATION_ERROR",
    "description is required", 400));
```

**Updated** 3 error sites across controller
**Status**: ✅ Complete

---

### Backend 3: Java (backend-java/)

**Created** `config/GlobalExceptionHandler.java`:
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleStatusException(
            ResponseStatusException ex) {
        var error = new ErrorResponse(
            ex.getReason(),
            ex.getReason(),
            ex.getStatusCode().value()
        );
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }
}
```

**Created** `dto/ErrorResponse.java`:
```java
public record ErrorResponse(String error, String message, int statusCode) {}
```

**Updated** 5 error sites across `MapboxService.java` and `AzureMapsService.java`
**Status**: ✅ Complete

---

### Summary
| Backend | Files Modified | Files Created | Error Sites Updated |
|---------|---------------|---------------|-------------------|
| Python | `main.py` | `errors.py` | 6 |
| C# | `VehicleController.cs`, `AiModels.cs` | — | 3 |
| Java | `MapboxService.java`, `AzureMapsService.java` | `GlobalExceptionHandler.java`, `ErrorResponse.java` | 5 |

**Verification**:
```bash
cd backend && pytest tests/ -v
cd backend-csharp && dotnet build
cd backend-java && ./mvnw compile
```
```

### Teaching Points

| Agent Capability | Polyglot Use Case |
|-----------------|-------------------|
| Multi-file edits | Consistent patterns across Python/C#/Java |
| Autonomous execution | Refactoring 14 error sites across 3 backends |
| Progress reporting | Per-backend completion tracking |
| Verification steps | Language-specific build/test commands |

**Agent Prompt Best Practices (CORE)**:
```
Context:  List all affected files, current patterns, and tech stacks
Objective: Clear deliverable (what the codebase should look like after)
Requirements: Per-language constraints and patterns to follow
Examples: Before/after for each language showing exact transformation
```

---

## Demo 7: Copilot Agent HQ (10 min)

### Objective
Manage and orchestrate custom agents for specialized workflows using Agent HQ.

### Scenario
Create a custom `@api-contract-checker` agent that validates API contract consistency across all three backends and the BFF proxy configuration.

### Live Coding Steps

**Step 1: Create custom agent definition**
```markdown
<!-- .github/copilot-agents/api-contract-checker.agent.md -->

# API Contract Checker Agent

## Identity
You are a specialized agent for validating API contract consistency across the
Road Trip Planner's polyglot microservices (Python, C#, Java, Node.js BFF).

## Expertise
- REST API design patterns
- BFF proxy routing (see bff/src/routes/proxy.ts)
- FastAPI endpoint definitions (backend/main.py)
- ASP.NET controller routes (backend-csharp/Controllers/)
- Spring Boot request mappings (backend-java/.../controller/)
- Request/response schema compatibility

## Rules
1. Every backend endpoint MUST have a corresponding BFF proxy route
2. Request/response schemas must be compatible across calling services
3. Python backend: auth + trips + public-trips + vehicle-specs (fallback)
4. C# backend: /api/v1/parse-vehicle + /api/v1/generate-trip
5. Java backend: /api/geocode + /api/directions + /api/search + /api/optimize
6. Coordinate format MUST be [lng, lat] in all DTOs and schemas

## Behaviors
When asked to validate contracts:
1. Scan BFF proxy.ts for all registered pathFilter routes
2. Verify each route has a matching backend endpoint (controller method)
3. Check request/response schema compatibility between services
4. Report orphaned routes (BFF routes with no backend handler)
5. Report unproxied endpoints (backend endpoints missing from BFF)
6. Verify ai_service.py calls match C# VehicleController endpoints

## Example Invocation
```
@api-contract-checker Validate all API contracts between BFF and backends
```

## Output Format
```
## API Contract Validation Report

### ✅ Valid Routes (matched)
| BFF Route | Backend | Controller/Handler | Status |
|-----------|---------|-------------------|--------|

### ❌ Contract Mismatches
### ⚠️ Orphaned BFF Routes (no backend handler)
### ⚠️ Unproxied Backend Endpoints
```
```

**Step 2: Register in Agent HQ**
```yaml
# .github/copilot-agents/agents.yaml

agents:
  - name: api-contract-checker
    file: api-contract-checker.agent.md
    description: Validates API contracts across Python/C#/Java/BFF services
    triggers:
      - "check api contracts"
      - "validate routes"
      - "contract mismatch"

  - name: coordinate-validator
    file: coordinate-validator.agent.md
    description: Validates GeoJSON coordinate format [lng, lat] across all code
    triggers:
      - "check coords"
      - "coordinate format"
      - "geojson validation"
```

**Step 3: Invoke custom agent**
```
@api-contract-checker Validate all API contracts between the BFF and all three backends.

Cross-reference:
- bff/src/routes/proxy.ts (route table)
- backend/main.py (Python endpoints)
- backend-csharp/Controllers/VehicleController.cs (C# endpoints)
- backend-java/.../controller/GeospatialController.java (Java endpoints)
```

**Step 4: Agent response**
```markdown
## API Contract Validation Report

### Files Analyzed
| File | Endpoints Found |
|------|----------------|
| `bff/src/routes/proxy.ts` | 10 proxy routes |
| `backend/main.py` | 8 endpoints |
| `backend-csharp/Controllers/VehicleController.cs` | 2 endpoints |
| `backend-java/.../GeospatialController.java` | 4 endpoints |

### ✅ Valid Routes (12 matched)
| BFF Route | Backend | Handler | Schema Match |
|-----------|---------|---------|--------------|
| `/api/v1/parse-vehicle` | C# | `VehicleController.ParseVehicle` | ✅ `ParseVehicleRequest` → `ParseVehicleResponse` |
| `/api/v1/generate-trip` | C# | `VehicleController.GenerateTrip` | ✅ `GenerateTripRequest` → `GenerateTripResponse` |
| `/api/geocode` | Java | `GeospatialController.geocode` | ✅ `q` param → `GeocodeResponse` |
| `/api/directions` | Java | `GeospatialController.getDirections` | ✅ `coords,profile` → `DirectionsResponse` |
| `/api/search` | Java | `GeospatialController.searchPlaces` | ✅ `query,proximity` → `SearchResponse` |
| `/api/auth/google` | Python | `google_login` | ✅ `GoogleAuthRequest` → `Token` |
| `/api/trips*` | Python | Trip CRUD endpoints | ✅ Multiple schemas |
| `/api/vehicle-specs` | Python | `get_vehicle_specs_endpoint` | ✅ `VehicleTypeRequest` → `VehicleSpecsResponse` |

### ❌ Contract Issues (2 found)

**1. Missing BFF route for Java optimize endpoint**
```
Java:  @GetMapping("/api/optimize")  ← EXISTS in GeospatialController
BFF:   No matching pathFilter found in proxy.ts for /api/optimize
Fix:   Add '/api/optimize' to the Java pathFilter array in proxy.ts
```

**2. Response schema mismatch: Python vs C# vehicle specs**
```
Python VehicleSpecsResponse: { height, width, weight, fuelType, range, mpg }
C#     ParseVehicleResponse: { status, specs: { vehicleType, height, width, ... } }

Issue: C# wraps specs in a nested 'specs' object; Python returns flat
ai_service.py normalizes this in get_vehicle_specs_from_ai() but
the formats diverge if called directly
```

### Summary
- 12 routes matched ✅
- 2 issues found ❌
- 0 orphaned routes
```

### Teaching Points

| Agent HQ Feature | Purpose |
|-----------------|---------|
| Cross-service validation | Catch mismatches before runtime |
| Schema comparison | Detect format inconsistencies |
| Trigger keywords | Natural language activation |
| Structured output | Actionable table format |

**Custom Agent Structure (CORE-aligned)**:
```markdown
# Agent Name

## Identity  — **C**ontext (who the agent is)
## Expertise — **C**ontext (what it knows)
## Rules     — **R**equirements (what it enforces)
## Behaviors — **O**bjective (how it acts)
## Examples  — **E**xamples (how to use it)
## Output    — **E**xamples (what it returns)
```

---

## Demo 8: Architecture & Tech Stack Generation (10 min)

### Objective
Use Copilot to generate project scaffolding, architecture decisions, and tech stack recommendations using real project context.

### Scenario
Generate a test infrastructure module for the Java backend and an ADR for adding WebSocket support.

---

### Step 1: Generate Java Test Infrastructure with CORE Prompt

```
Context: The Road Trip Planner Java backend (backend-java/) uses:
- Spring Boot 3 with WebClient for HTTP calls
- MapboxService.java: geocode(), getDirections(), optimizeRoute()
- AzureMapsService.java: searchPlaces()
- DTOs as Java records: GeocodeResponse, DirectionsResponse, SearchResponse
- No tests exist yet — need complete test setup

Objective: Generate the complete test infrastructure for the Java backend.

Requirements:
- Use JUnit 5 + Spring Boot Test + MockWebServer
- Mirror the Python test pattern with JSON fixtures
- Test both success and error scenarios
- One test class per service
- Use @SpringBootTest with custom properties to point at MockWebServer

Examples:
- Python pattern (to adapt for Java):
  def test_geocode_success(mock_httpx_geocode_success):
      response = client.get("/api/geocode?q=San Francisco")
      assert data["coordinates"] == [-122.4194, 37.7749]
- Equivalent Java pattern expected:
  @Test
  void geocode_validAddress_returnsCoordinates() {
      mockServer.enqueue(new MockResponse().setBody(GEOCODE_JSON));
      GeocodeResponse result = mapboxService.geocode("San Francisco");
      assertEquals(-122.4194, result.coordinates().get(0));
  }
```

**Expected Copilot Output — Project Structure:**
```
backend-java/src/test/
├── java/com/roadtrip/geospatial/
│   ├── service/
│   │   ├── MapboxServiceTest.java
│   │   └── AzureMapsServiceTest.java
│   └── controller/
│       └── GeospatialControllerTest.java
└── resources/
    └── fixtures/
        ├── mapbox_geocode.json
        ├── mapbox_directions.json
        ├── mapbox_optimize.json
        └── azure_maps_search.json
```

**Generated Test Class:**
```java
package com.roadtrip.geospatial.service;

import com.roadtrip.geospatial.dto.GeocodeResponse;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.file.*;

import static org.junit.jupiter.api.Assertions.*;

class MapboxServiceTest {

    private MockWebServer mockServer;
    private MapboxService mapboxService;

    @BeforeEach
    void setUp() throws IOException {
        mockServer = new MockWebServer();
        mockServer.start();

        String baseUrl = mockServer.url("/").toString();
        mapboxService = new MapboxService(
                WebClient.builder(), baseUrl, "test-token");
    }

    @AfterEach
    void tearDown() throws IOException {
        mockServer.shutdown();
    }

    @Test
    void geocode_validAddress_returnsCoordinates() throws Exception {
        String json = Files.readString(
                Path.of("src/test/resources/fixtures/mapbox_geocode.json"));
        mockServer.enqueue(new MockResponse()
                .setBody(json)
                .setHeader("Content-Type", "application/json"));

        GeocodeResponse result = mapboxService.geocode("San Francisco");

        assertNotNull(result);
        assertEquals(-122.4194, result.coordinates().get(0), 0.001); // lng
        assertEquals(37.7749, result.coordinates().get(1), 0.001);   // lat
        assertEquals("San Francisco, California, United States",
                result.placeName());
    }

    @Test
    void geocode_emptyResult_throwsNotFound() {
        String emptyJson = """
                {"type": "FeatureCollection", "features": []}
                """;
        mockServer.enqueue(new MockResponse()
                .setBody(emptyJson)
                .setHeader("Content-Type", "application/json"));

        assertThrows(Exception.class,
                () -> mapboxService.geocode("xyznonexistent"));
    }

    @Test
    void getDirections_validCoords_returnsRoute() throws Exception {
        String json = Files.readString(
                Path.of("src/test/resources/fixtures/mapbox_directions.json"));
        mockServer.enqueue(new MockResponse()
                .setBody(json)
                .setHeader("Content-Type", "application/json"));

        var result = mapboxService.getDirections(
                "-122.4194,37.7749;-122.0838,37.3861", "driving");

        assertTrue(result.distance() > 0);
        assertTrue(result.duration() > 0);
        assertNotNull(result.geometry());
    }
}
```

**Generated C# Test (parallel example):**
```csharp
// backend-csharp-tests/AiParsingServiceTests.cs

using Moq;
using Microsoft.Extensions.Logging;
using RoadTrip.AiService.Services;
using Xunit;

public class AiParsingServiceTests
{
    private readonly AiParsingService _service;

    public AiParsingServiceTests()
    {
        _service = new AiParsingService(
            Mock.Of<ILogger<AiParsingService>>());
    }

    [Fact]
    public async Task ParseVehicle_RvDescription_ReturnsRvSpecs()
    {
        // Fallback mode (no Azure OpenAI configured in test)
        var result = await _service.ParseVehicleAsync("2024 Winnebago View 24D");

        Assert.Equal("success", result.Status);
        Assert.Equal("rv", result.Specs.VehicleType);
        Assert.Equal(3.5, result.Specs.Height);
    }

    [Fact]
    public async Task ParseVehicle_TruckDescription_ReturnsTruckSpecs()
    {
        var result = await _service.ParseVehicleAsync("Ford F-250 Super Duty truck");

        Assert.Equal("truck", result.Specs.VehicleType);
        Assert.True(result.Specs.Weight > 2000);
    }

    [Fact]
    public async Task ParseVehicle_UnknownVehicle_DefaultsToCar()
    {
        var result = await _service.ParseVehicleAsync("some vehicle");

        Assert.Equal("car", result.Specs.VehicleType);
        Assert.Equal(1500, result.Specs.Weight);
    }

    [Fact]
    public async Task GenerateTrip_ValidInput_ReturnsSuggestions()
    {
        var result = await _service.GenerateTripAsync(
            "San Francisco", "Los Angeles",
            new List<string> { "beaches", "food" });

        Assert.Equal("success", result.Status);
        Assert.NotEmpty(result.Suggestions);
    }
}
```

---

### Step 2: Generate Architecture Decision Record (ADR)

```
Context: The Road Trip Planner currently uses REST APIs between all services:
- Frontend → BFF (Express) → Python/C#/Java backends
- No real-time features exist
- Trip collaboration is a roadmap item
- The BFF already handles CORS and auth header forwarding (see proxy.ts)
- Python manages trip CRUD in PostgreSQL

Objective: Generate an ADR for adding WebSocket support to enable real-time
trip collaboration (multiple users editing the same trip).

Requirements:
- Consider which service layer handles WebSockets (BFF vs backend)
- Evaluate Socket.IO vs native WebSocket vs Azure SignalR
- Must work with existing Docker Compose setup
- Must not break existing REST API routing in the BFF
- Include implications for each backend language

Examples of ADR format (see docs/adr/ for existing ADRs):
- Title, Status, Context, Decision, Alternatives, Consequences
```

**Expected Copilot Output:**
```markdown
<!-- docs/adr/003-websocket-trip-collaboration.md -->

# ADR 003: WebSocket Architecture for Real-Time Trip Collaboration

## Status
Proposed

## Context
The Road Trip Planner needs real-time collaboration so multiple users can edit
a trip simultaneously (add/remove stops, reorder, see cursor positions).

Current architecture is fully REST-based:
- Frontend (React) → BFF (Express :3000) → Python (:8000) / C# (:8081) / Java (:8082)
- No persistent connections exist between services
- Trip state is stored in PostgreSQL via Python backend

## Decision
Use **Socket.IO in the BFF (Node.js)** as the WebSocket gateway because:

1. **BFF is the natural gateway**: Already handles CORS, auth forwarding, and routing
2. **Socket.IO**: Built-in reconnection, rooms, namespaces, and fallback to polling
3. **No backend changes**: Python/C#/Java remain REST-only; BFF manages WS state
4. **Room per trip**: `room:trip:{tripId}` — users join when opening a trip

### Architecture
```
Frontend (React) ←— Socket.IO —→ BFF (Express + Socket.IO)
                                      │
                    ┌─────────────────┼─────────────────┐
                    ↓ REST            ↓ REST             ↓ REST
              Python :8000      C# :8081           Java :8082
              (trip CRUD)       (AI parsing)       (directions)
```

### Per-Backend Impact
| Backend | Change Required | Reason |
|---------|----------------|--------|
| **BFF (Node.js)** | Add Socket.IO server | WebSocket gateway |
| **Python** | None | Trip CRUD remains REST |
| **C#** | None | AI parsing is request/response |
| **Java** | None | Geospatial queries are stateless |
| **Frontend** | Add Socket.IO client | Real-time updates |

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| **Socket.IO in BFF** ✅ | No backend changes, proven lib | Extra state in BFF |
| Native WebSocket in Python | Closer to trip data | FastAPI async complexity |
| Azure SignalR Service | Managed, scalable | Cost, vendor lock-in |
| Server-Sent Events (SSE) | Simpler than WS | One-directional only |

## Consequences
- BFF gains state (connected clients per room) — need Redis adapter for scaling
- Frontend needs Socket.IO client (~50KB gzipped)
- Docker Compose: No changes (BFF port 3000 already exposed)
- Testing: Need Socket.IO test client in BFF integration tests
```

---

### Teaching Points

| Generation Type | CORE Element | Example |
|----------------|-------------|---------|
| Test infrastructure | **C**: Existing services, DTOs, no tests | Java MockWebServer setup |
| ADR generation | **C**: Current REST architecture | WebSocket decision document |
| Project scaffolding | **O**: Complete test directory structure | Test files + fixtures |
| Tech evaluation | **R**: Docker Compose compatibility | Alternatives table |

---

## Workshop Summary

### 8 Advanced Techniques Mastered (with CORE Framework)

| # | Technique | CORE Focus | Languages Used |
|---|-----------|-----------|----------------|
| 1 | **Chain-of-Thought** | Numbered steps as **R**equirements | Python, C#, Java |
| 2 | **Instruction Files** | **R**ules with ❌/✅ per language | All |
| 3 | **Prompt Files** | Full **CORE** templates per language | Python, C#, Java |
| 4 | **Code Review** | **C**ontext of PR, **R**eview criteria | All |
| 5 | **Plan Mode** | Phased **O**bjectives with verification | Python, Java, C# |
| 6 | **Coding Agent** | **E**xamples showing before/after per language | Python, C#, Java |
| 7 | **Agent HQ** | **R**ules for cross-service validation | All (BFF included) |
| 8 | **Architecture Gen** | **C**ontext of existing stack, **E**xample ADR format | Java, C#, All |

### CORE Quick Reference

```markdown
# CORE Prompt Template

Context: [Tech stack, relevant files, current state]
Objective: [What you want Copilot to produce]
Requirements: [Constraints, patterns, rules per language]
Examples: [Input/output, before/after, code snippets]
```

### Technique Quick Reference

```
# Chain-of-Thought (Python / C# / Java)
"""
Step 1: [requirement]
Step 2: [schema/model]
Step 3: [logic]
Step 4: [integration]
Step 5: [response]
Now implement:
"""

# Instruction File (.github/copilot-instructions.md)
### 🚨 CRITICAL: [Rule Name]
// ❌ WRONG (Python/C#/Java examples)
// ✅ CORRECT (Python/C#/Java examples)

# Prompt File (.github/prompts/[name].prompt.md)
## Context — tech stack & patterns
## Objective — what to generate
## Requirements — constraints per language
## Examples — expected output

# Code Review
Context: [PR files across backends]
Objective: [Review for security, types, patterns, boundaries]
Requirements: [Per-language checks]
Examples: [Issues to flag]

# Plan Mode
Context: [current state per backend]
Objective: [phased plan]
Requirements: [per-language test/build patterns]
Examples: [existing test patterns to mimic]

# Coding Agent
Context: [files across backends]
Objective: [transformation to apply]
Requirements: [per-language constraints]
Examples: [before/after for each language]

# Agent HQ
@[custom-agent] [cross-service validation task]

# Architecture Generation
Context: [existing architecture]
Objective: [new capability]
Requirements: [compatibility constraints]
Examples: [ADR format, test patterns]
```

### Next Workshop Preview

**Workshop 4: Expert Web Development**
- MCP Servers for live documentation
- Spec Kit for feature specifications
- Terraform planning agents
- Full production deployment workflow

---

## Resources

- **Instruction File**: `.github/copilot-instructions.md`
- **Prompt Files**: `.github/prompts/`
- **Agent Definitions**: `.github/copilot-agents/`
- **ROADMAP**: Issue references for all demos
- **ADR Template**: `docs/adr/template.md`

### Project File Reference (Used in This Workshop)

| File | Language | Used In Demos |
|------|----------|--------------|
| `backend/vehicle_service.py` | Python | 1A, 5, 6 |
| `backend/main.py` | Python | 2, 3, 4, 6 |
| `backend/schemas.py` | Python | 1A, 3 |
| `backend/tests/test_main.py` | Python | 5 |
| `backend/tests/conftest.py` | Python | 5, 8 |
| `backend/ai_service.py` | Python | 6 |
| `backend-csharp/Services/AiParsingService.cs` | C# | 1B, 4, 5, 6 |
| `backend-csharp/Controllers/VehicleController.cs` | C# | 3, 4, 6, 7 |
| `backend-csharp/Models/AiModels.cs` | C# | 1B, 3 |
| `backend-java/.../service/MapboxService.java` | Java | 1C, 4, 6, 8 |
| `backend-java/.../service/AzureMapsService.java` | Java | 4, 7, 8 |
| `backend-java/.../controller/GeospatialController.java` | Java | 7, 8 |
| `backend-java/.../dto/DirectionsResponse.java` | Java | 1C, 8 |
| `bff/src/routes/proxy.ts` | TypeScript | 2, 7 |
| `.github/copilot-instructions.md` | Markdown | 2 |
| `.github/prompts/*.prompt.md` | Markdown | 3 |
