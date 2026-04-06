# Workshop 2: Intermediate Web Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Web developers with Copilot foundational knowledge (completed Workshop 1)  
**Prerequisites**: VS Code with GitHub Copilot extension, GitHub Copilot CLI installed

---

## Learning Objectives

By the end of this workshop, you will be able to:

1. **Inline Code Suggestions** - Accept and modify Copilot's real-time code completions
2. **Prompting** - Write effective prompts that generate accurate, project-specific code
3. **Code Explanations** - Use Copilot to understand complex authentication and database logic
4. **Comment-Based Generation** - Generate complete functions from descriptive comments
5. **Code Refactoring** - Extract duplicate code using Copilot's refactoring capabilities
6. **Copilot Chat** - Interact with Copilot for code questions, improvements, and debugging
7. **Few-Shot Prompting** - Teach Copilot patterns by showing examples before requesting new code
8. **Unit Testing & Debugging** - Generate test cases and debug failing tests with Copilot
9. **Copilot CLI** - Generate shell commands and scripts using natural language

---

## The CORE Prompting Framework

All prompts in this workshop follow the **CORE** framework for maximum effectiveness:

| Letter | Element | Description |
|--------|---------|-------------|
| **C** | **Context** | Background information — project, language, framework, file |
| **O** | **Objective** | What you want Copilot to do — create, explain, refactor, test |
| **R** | **Requirements** | Constraints, types, validation rules, patterns to follow |
| **E** | **Examples** | Expected output format, existing patterns to match, sample data |

> 📝 **CORE Formula Template**:
> ```
> Context:      "In this [framework] [service], working with [file/module]..."
> Objective:    "Create / Explain / Refactor / Test [specific thing]..."
> Requirements: "Must include [types, validation, patterns, constraints]..."
> Examples:     "Follow the pattern in [existing code] / Output should look like [sample]..."
> ```

---

## Workshop Agenda

| Time | Demo | Learning Objective | Languages | File(s) |
|------|------|-------------------|-----------|---------|
| 0-10 min | Demo 1 | **Inline Code Suggestions** | Python, C#, Java | `vehicle_service.py`, `AiParsingService.cs`, `HealthController.java` |
| 10-20 min | Demo 2 | **Prompting** (CORE Framework) | Python, C#, Java | `schemas.py`, `AiModels.cs`, DTOs |
| 20-30 min | Demo 3 | **Comment-Based Generation** | Python, C#, Java | `main.py`, `VehicleController.cs`, `GeospatialController.java` |
| 30-40 min | Demo 4 | **Code Explanations** | Python, C#, Java | `auth.py`, `AiParsingService.cs`, `MapboxService.java` |
| 40-50 min | Demo 5 | **Code Refactoring** + **Copilot Chat** | C#, Python, Java | Cross-service refactoring |
| 50-60 min | Demo 6 | **Few-Shot Prompting** | Python, C#, Java | `models.py`, `AiModels.cs`, DTOs |
| 60-75 min | Demo 7 | **Unit Testing & Debugging** | Python, C#, Java | Tests across all backends |
| 75-90 min | Demo 8 | **Copilot CLI** | Shell / All | Terminal / deployment scripts |

---

## Demo 1: Inline Code Suggestions (10 min)

### Learning Objective
Accept and modify Copilot's real-time code completions as you type, using pattern recognition.

### Scenario
Add new entries to existing data structures across all three backends. Copilot recognizes the pattern and suggests complete structures.

---

### 🐍 Python Example — `backend/vehicle_service.py`

**Setup**: Open `backend/vehicle_service.py` and navigate to the `DEFAULT_VEHICLE_SPECS` dictionary (lines 7-44).

**Step 1: Position cursor after the last vehicle type entry and type:**
```python
    "motorcycle": {
```

**Expected Copilot Inline Suggestion** (ghost text):
```python
    "motorcycle": {
        "height": 1.2, "width": 0.9, "length": 2.2, "weight": 0.3,
        "fuelType": "gas", "range": 250, "mpg": 50.0
    },
```

**Step 2: Accept with `Tab`, then try another entry with partial acceptance:**
```python
    "bus": {
```

**Copilot suggests** (use `Ctrl+→` to accept word-by-word, then modify values):
```python
    "bus": {
        "height": 3.5, "width": 2.6, "length": 12.0, "weight": 15.0,
        "fuelType": "diesel", "range": 500, "mpg": 6.0
    },
```

---

### 🔷 C# Example — `backend-csharp/Services/AiParsingService.cs`

**Setup**: Open `backend-csharp/Services/AiParsingService.cs` and navigate to the `GetFallbackSpecs()` method with its `if/else` chain.

**Step 1: After the last `if (lower.Contains(...))` block, type:**
```csharp
        if (lower.Contains("motorcycle"))
```

**Expected Copilot Inline Suggestion**:
```csharp
        if (lower.Contains("motorcycle"))
            return new VehicleSpecs
            {
                VehicleType = "motorcycle",
                Length = 2.2,
                Width = 0.9,
                Height = 1.2,
                Weight = 0.3,
                NumAxles = 2,
                IsCommercial = false
            };
```

**Step 2: Accept and try another:**
```csharp
        if (lower.Contains("bus"))
```

**Copilot suggests** (matching the existing pattern exactly):
```csharp
        if (lower.Contains("bus"))
            return new VehicleSpecs
            {
                VehicleType = "bus",
                Length = 12.0,
                Width = 2.6,
                Height = 3.5,
                Weight = 15.0,
                NumAxles = 3,
                IsCommercial = true
            };
```

---

### ☕ Java Example — `backend-java/.../controller/HealthController.java`

**Setup**: Open `HealthController.java` and view the existing health endpoint that returns a `Map.of(...)`.

**Step 1: After the existing `health()` method, type:**
```java
    @GetMapping("/health/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        return ResponseEntity.ok(Map.of(
```

**Expected Copilot Inline Suggestion**:
```java
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "geospatial-service",
            "runtime", "java",
            "version", System.getProperty("java.version"),
            "timestamp", java.time.Instant.now().toString()
        ));
```

---

### Teaching Points

> 💡 **Key Insight**: Inline suggestions work best when Copilot has **context from existing patterns**. The existing dictionary/object/map structure teaches Copilot the exact shape to follow.

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See alternatives | `Alt+]` / `Alt+[` | `Alt+]` / `Alt+[` |

### Common Mistakes
- ❌ **Accepting without review**: Always verify values make sense (e.g., motorcycle shouldn't have `"weight": 15.0`)
- ❌ **Ignoring alternatives**: Press `Alt+]` to cycle through multiple suggestions
- ❌ **Fighting Copilot**: If the suggestion is wrong, type more characters to steer it

---

## Demo 2: Prompting — CORE Framework (10 min)

### Learning Objective
Write effective prompts using the **CORE** framework (Context, Objective, Requirements, Examples) that generate accurate, project-specific code.

### Scenario
Create new data models/schemas across all three backends using structured CORE prompts.

---

### 🐍 Python Example — `backend/schemas.py`

**Setup**: Open `backend/schemas.py` and navigate to the end of the file.

**CORE Prompt** (write as a multi-line comment):
```python
"""
Context: In this FastAPI backend, we use Pydantic BaseModel classes for API
    request/response validation. Existing schemas use ConfigDict(from_attributes=True)
    for ORM compatibility and Field() for constraints.

Objective: Create a POI (Point of Interest) response schema for Azure Maps API results.

Requirements:
    - name: str, required, max 200 characters
    - category: str, required (e.g., "gas_station", "restaurant")
    - address: Optional[str]
    - coordinates: Tuple[float, float] as (longitude, latitude)
    - distance: Optional[float], must be >= 0 (meters from user)
    - rating: Optional[float], range 0.0 to 5.0
    - Validate: longitude [-180, 180], latitude [-90, 90]
    - Use Field() for validation constraints

Examples: Follow the VehicleSpecsResponse pattern above with ConfigDict(from_attributes=True)
"""
```

**Expected Copilot Suggestion**:
```python
class POIResponse(BaseModel):
    """Point of Interest response from Azure Maps API."""
    
    name: str = Field(..., max_length=200, description="POI name")
    category: str = Field(..., description="POI category")
    address: Optional[str] = Field(None, description="Full address")
    coordinates: Tuple[float, float] = Field(..., description="(longitude, latitude)")
    distance: Optional[float] = Field(None, ge=0, description="Distance in meters")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Rating 0-5")
    
    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, coords: Tuple[float, float]) -> Tuple[float, float]:
        lng, lat = coords
        if not (-180 <= lng <= 180):
            raise ValueError(f"Longitude {lng} must be between -180 and 180")
        if not (-90 <= lat <= 90):
            raise ValueError(f"Latitude {lat} must be between -90 and 90")
        return coords
    
    model_config = ConfigDict(from_attributes=True)
```

---

### 🔷 C# Example — `backend-csharp/Models/AiModels.cs`

**Setup**: Open `backend-csharp/Models/AiModels.cs` and navigate after the existing `GenerateTripResponse` class.

**CORE Prompt** (write as an XML doc comment):
```csharp
/// <summary>
/// Context: In this ASP.NET Web API service, we use plain C# classes as DTOs
///     with default values. Existing models (VehicleSpecs, ParseVehicleResponse)
///     follow a pattern of public properties with { get; set; } and
///     string.Empty defaults.
///
/// Objective: Create a RouteOptimizationRequest DTO for the route optimization feature.
///
/// Requirements:
///     - Waypoints: List of coordinate pairs (double Longitude, double Latitude)
///     - VehicleType: string, default "car"
///     - AvoidTolls: bool, default false
///     - AvoidHighways: bool, default false
///     - MaxDetourMinutes: int, default 30
///     - FuelLevel: double (0.0-1.0), default 1.0
///     - Create a nested Waypoint class with Longitude, Latitude, and optional Name
///
/// Examples: Follow the ParseVehicleRequest / GenerateTripRequest pattern above
/// </summary>
```

**Expected Copilot Suggestion**:
```csharp
public class Waypoint
{
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public string? Name { get; set; }
}

public class RouteOptimizationRequest
{
    public List<Waypoint> Waypoints { get; set; } = new();
    public string VehicleType { get; set; } = "car";
    public bool AvoidTolls { get; set; } = false;
    public bool AvoidHighways { get; set; } = false;
    public int MaxDetourMinutes { get; set; } = 30;
    public double FuelLevel { get; set; } = 1.0;
}

public class RouteOptimizationResponse
{
    public string Status { get; set; } = "success";
    public List<Waypoint> OptimizedWaypoints { get; set; } = new();
    public double TotalDistanceKm { get; set; }
    public double TotalDurationMinutes { get; set; }
}
```

---

### ☕ Java Example — `backend-java/.../dto/`

**Setup**: Create a new file `backend-java/src/main/java/com/roadtrip/geospatial/dto/RouteOptimizationDto.java`.

**CORE Prompt** (write as a Javadoc comment):
```java
/**
 * Context: In this Spring Boot geospatial service, we use Java record types
 *     for immutable DTOs. Existing records (GeocodeResponse, DirectionsResponse,
 *     SearchResponse) use Maps and Lists for flexible JSON structures.
 *
 * Objective: Create request/response records for a route optimization endpoint
 *     that accepts waypoints and returns an optimized travel order.
 *
 * Requirements:
 *     - WaypointDto: record with double longitude, double latitude, String name
 *     - RouteOptimizationRequest: record with List<WaypointDto> waypoints,
 *       String vehicleType, boolean avoidTolls, boolean avoidHighways
 *     - RouteOptimizationResponse: record with List<WaypointDto> optimizedOrder,
 *       double totalDistanceKm, double totalDurationMinutes, Map geometry
 *
 * Examples: Follow the existing record pattern: DirectionsResponse(double distance,
 *     double duration, Map<String, Object> geometry, List<Map<String, Object>> legs)
 */
```

**Expected Copilot Suggestion**:
```java
public record WaypointDto(double longitude, double latitude, String name) {}

public record RouteOptimizationRequest(
    List<WaypointDto> waypoints,
    String vehicleType,
    boolean avoidTolls,
    boolean avoidHighways
) {}

public record RouteOptimizationResponse(
    List<WaypointDto> optimizedOrder,
    double totalDistanceKm,
    double totalDurationMinutes,
    Map<String, Object> geometry
) {}
```

---

### CORE vs. Vague Prompting Comparison

| Prompt Quality | Prompt | Result |
|----------------|--------|--------|
| ❌ Vague | `"Create POI schema"` | Missing validation, wrong types |
| ❌ No context | `"Create a route DTO"` | Wrong framework patterns, no defaults |
| ✅ CORE | `"Context: FastAPI + Pydantic... Objective: POI schema... Requirements: coordinates [-180,180]... Examples: like VehicleSpecsResponse"` | Precise, validated, matches project |

---

## Demo 3: Comment-Based Generation (10 min)

### Learning Objective
Generate complete functions from descriptive comments placed directly above code.

### Scenario
Add new API endpoints across all three backends by writing descriptive comments, then letting Copilot generate the implementation.

---

### 🐍 Python Example — `backend/main.py`

**Setup**: Open `backend/main.py` and navigate after the existing health check endpoints (~line 120).

**Write the CORE-structured comment, then the function signature:**
```python
# Context: FastAPI backend that proxies external API calls through the server
#     to protect API tokens. Uses httpx for async HTTP and os.getenv for config.
# Objective: Add endpoint to geocode an address using Mapbox Geocoding API
# Requirements:
#     - Parameter: q (string) - the address to geocode
#     - Returns: GeoJSON FeatureCollection with location results
#     - Uses MAPBOX_TOKEN from environment variables
#     - Raise HTTPException(500) if token missing, proxy status on failure
# Examples: Similar to existing health check pattern with error handling
@app.get("/api/geocode")
async def geocode_address(q: str):
```

**Expected Copilot Suggestion** (completes the function):
```python
@app.get("/api/geocode")
async def geocode_address(q: str):
    """
    Geocode an address using Mapbox Geocoding API.
    Proxies request through backend to protect API token.
    """
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.mapbox.com/geocoding/v5/mapbox.places/{q}.json",
            params={"access_token": token, "limit": 5}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Geocoding failed")
        
        return response.json()
```

---

### 🔷 C# Example — `backend-csharp/Controllers/VehicleController.cs`

**Setup**: Open `VehicleController.cs` and navigate after the existing `GenerateTrip` action method.

**Write the CORE-structured comment, then the method signature:**
```csharp
    // Context: ASP.NET Web API controller with constructor-injected IAiParsingService.
    //     Existing endpoints use ActionResult<T> returns with structured logging
    //     and BadRequest validation at the top.
    // Objective: Add endpoint to compare two vehicle descriptions side by side
    // Requirements:
    //     - POST /api/v1/compare-vehicles
    //     - Body: CompareVehiclesRequest with Description1 and Description2 (both required)
    //     - Returns: CompareVehiclesResponse with Specs1, Specs2, and a Differences list
    //     - Uses _aiService.ParseVehicleAsync for each description
    //     - Log both descriptions with _logger
    // Examples: Follow ParseVehicle endpoint pattern above with BadRequest validation
    [HttpPost("compare-vehicles")]
    public async Task<ActionResult<CompareVehiclesResponse>> CompareVehicles(
        [FromBody] CompareVehiclesRequest request)
    {
```

**Expected Copilot Suggestion**:
```csharp
    [HttpPost("compare-vehicles")]
    public async Task<ActionResult<CompareVehiclesResponse>> CompareVehicles(
        [FromBody] CompareVehiclesRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Description1) || string.IsNullOrWhiteSpace(request.Description2))
            return BadRequest(new { error = "Both description1 and description2 are required" });

        _logger.LogInformation("Comparing vehicles: {Desc1} vs {Desc2}", 
            request.Description1, request.Description2);

        var result1 = await _aiService.ParseVehicleAsync(request.Description1);
        var result2 = await _aiService.ParseVehicleAsync(request.Description2);

        var differences = new List<string>();
        if (result1.Specs.Height != result2.Specs.Height)
            differences.Add($"Height: {result1.Specs.Height}m vs {result2.Specs.Height}m");
        if (result1.Specs.Weight != result2.Specs.Weight)
            differences.Add($"Weight: {result1.Specs.Weight}t vs {result2.Specs.Weight}t");
        if (result1.Specs.Length != result2.Specs.Length)
            differences.Add($"Length: {result1.Specs.Length}m vs {result2.Specs.Length}m");

        return Ok(new CompareVehiclesResponse
        {
            Specs1 = result1.Specs,
            Specs2 = result2.Specs,
            Differences = differences
        });
    }
```

---

### ☕ Java Example — `backend-java/.../controller/GeospatialController.java`

**Setup**: Open `GeospatialController.java` and navigate after the existing `optimizeRoute` method.

**Write the CORE-structured comment, then the method signature:**
```java
    // Context: Spring Boot REST controller with constructor-injected MapboxService
    //     and AzureMapsService. Existing endpoints use @GetMapping with @RequestParam
    //     and return ResponseEntity<T>.
    // Objective: Add endpoint that reverse-geocodes coordinates to an address
    // Requirements:
    //     - GET /api/reverse-geocode
    //     - Parameters: lng (double), lat (double)
    //     - Returns: ResponseEntity with place name and formatted address
    //     - Delegates to mapboxService.reverseGeocode(lng, lat)
    // Examples: Follow the geocode() method pattern above
    @GetMapping("/reverse-geocode")
    public ResponseEntity<GeocodeResponse> reverseGeocode(
            @RequestParam("lng") double lng,
            @RequestParam("lat") double lat) {
```

**Expected Copilot Suggestion**:
```java
    @GetMapping("/reverse-geocode")
    public ResponseEntity<GeocodeResponse> reverseGeocode(
            @RequestParam("lng") double lng,
            @RequestParam("lat") double lat) {
        return ResponseEntity.ok(mapboxService.reverseGeocode(lng, lat));
    }
```

---

### Teaching Points

> 💡 **Comment-Based Generation Best Practices (CORE)**:
> 1. **Context** — Mention the framework, service layer, and DI patterns
> 2. **Objective** — Be specific about the endpoint purpose
> 3. **Requirements** — List parameters, return types, error handling
> 4. **Examples** — Reference existing methods: "Follow the `ParseVehicle` pattern"

### Comparison: Comment Quality

```python
# ❌ Too vague — Copilot may generate incorrect implementation
# Geocode address

# ⚠️ Partial — missing security and pattern context
# Add geocode endpoint with query parameter

# ✅ CORE — Copilot generates complete, correct implementation
# Context: FastAPI backend that proxies external API calls...
# Objective: Add endpoint to geocode an address using Mapbox Geocoding API
# Requirements: Parameter q (string), returns GeoJSON, uses MAPBOX_TOKEN...
# Examples: Similar to existing health check pattern with error handling
```

---

## Demo 4: Code Explanations (10 min)

### Learning Objective
Use Copilot Chat to understand complex authentication, AI integration, and API proxy logic.

### Scenario
Understand security-critical and integration-heavy code across all three backends.

---

### 🐍 Python Example — `backend/auth.py`

**Setup**: Open `backend/auth.py` and select lines 36-60 (token creation and hashing functions).

**Selected Code:**
```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token() -> str:
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def verify_refresh_token(token: str, hashed_token: str) -> bool:
    return hash_token(token) == hashed_token
```

**Copilot Chat CORE Prompt** (press `Ctrl+I`):
```
Context: This is a FastAPI auth module using python-jose for JWT and hashlib for token hashing.
Objective: Explain the security flow — why we hash refresh tokens but not access tokens.
Requirements: Cover token lifetimes, storage strategy, and what happens if the database is breached.
Examples: Explain like a security architecture review for a team unfamiliar with this codebase.
```

**Expected Copilot Explanation**:
```
This implements a dual-token authentication system:

**Access Tokens (JWT):**
- Short-lived (30 min default)
- Self-verifying via cryptographic signature
- NOT stored in database (stateless)
- Contain user data (email in "sub" claim)

**Refresh Tokens:**
- Long-lived (7 days)
- Cryptographically random (no user data)
- HASHED (SHA-256) before database storage
- Used to obtain new access tokens

**Why hash refresh tokens but not access tokens?**
- Refresh tokens are stored in the DB. If the DB is breached, 
  attackers only get hashes — SHA-256 is irreversible.
- Access tokens are JWTs verified by signature, not DB lookup.
  Hashing would break the JWT verification process.
```

---

### 🔷 C# Example — `backend-csharp/Services/AiParsingService.cs`

**Setup**: Open `AiParsingService.cs` and select the `ParseVehicleAsync` and `ParseWithAzureOpenAI` methods.

**Copilot Chat CORE Prompt**:
```
Context: This C# service uses Azure OpenAI SDK to parse vehicle descriptions into structured specs.
Objective: Explain the AI-first with fallback pattern — how does the try/catch flow work?
Requirements: Cover the Azure OpenAI client setup, system prompts, JSON deserialization of AI responses, 
    and when the rule-based fallback triggers.
Examples: Walk through what happens when (1) Azure OpenAI is configured and succeeds,
    (2) Azure OpenAI fails, and (3) Azure OpenAI is not configured at all.
```

**Expected Copilot Explanation**:
```
This service implements a resilient AI-first + fallback pattern:

**Scenario 1: Azure OpenAI configured and succeeds**
1. _isConfigured = true (endpoint + key + deployment all set)
2. ParseWithAzureOpenAI() creates AzureOpenAIClient with URI + key
3. Sends system prompt (JSON schema) + user prompt (vehicle description)
4. Deserializes AI JSON response into VehicleSpecs
5. Returns parsed result with RawAiResponse for debugging

**Scenario 2: Azure OpenAI configured but fails**
1. _isConfigured = true, so AI path is attempted
2. Exception caught (timeout, rate limit, malformed response)
3. Logged as error, falls through to GetFallbackSpecs()
4. Rule-based fallback: string matching ("rv", "truck", etc.)

**Scenario 3: Azure OpenAI not configured**
1. _isConfigured = false (missing env vars)
2. AI path is skipped entirely
3. Goes directly to GetFallbackSpecs()
4. Returns default specs based on keyword matching
```

---

### ☕ Java Example — `backend-java/.../service/MapboxService.java`

**Setup**: Open `MapboxService.java` and select the `getDirections` method.

**Copilot Chat CORE Prompt**:
```
Context: This Spring Boot service uses WebClient to proxy Mapbox Directions API requests.
    The frontend never calls Mapbox directly — all requests go through this Java backend.
Objective: Explain how the URI builder constructs the Mapbox API call and how the response is transformed.
Requirements: Cover the WebClient chain (uri → retrieve → bodyToMono → block), 
    the GeoJSON geometry extraction, and why we use .block() for synchronous calls.
Examples: Trace a request from "coords='-122.4,37.8;-118.2,34.1'&profile=driving" 
    to the final DirectionsResponse.
```

**Expected Copilot Explanation**:
```
The Mapbox Directions proxy works as follows:

1. **URI Construction**: UriBuilder creates:
   /directions/v5/mapbox/driving/-122.4,37.8;-118.2,34.1
   With query params: geometries=geojson, overview=full, steps=true, access_token=...

2. **WebClient Chain**:
   - .get() → HTTP GET request
   - .uri(uriBuilder -> ...) → Template variables {profile} and {coords}
   - .retrieve() → Execute and get response
   - .bodyToMono(Map.class) → Deserialize JSON to Map
   - .block() → Synchronous wait (Spring MVC, not WebFlux)

3. **Response Transformation**:
   - Extracts routes[0] from Mapbox response
   - Pulls distance (meters), duration (seconds), geometry (GeoJSON LineString)
   - Returns DirectionsResponse record with only the fields frontend needs

4. **Why .block()?**
   This is a Spring MVC (servlet) app, not WebFlux reactive.
   .block() converts the async Mono to a synchronous result.
```

---

### Teaching Points

> 🔍 **Code Explanation CORE Prompts**:
> - Always provide **Context** so Copilot knows the framework
> - The **Objective** should specify the *angle* of explanation (security, architecture, flow)
> - **Requirements** tell Copilot what depth to cover
> - **Examples** give Copilot concrete scenarios to trace through

| Command | Usage |
|---------|-------|
| `/explain` or `Ctrl+I` | Explain selected code in detail |
| `/explain simply` | ELI5 explanation for beginners |
| `Ctrl+Shift+I` | Open Chat panel for follow-up questions |

---

## Demo 5: Code Refactoring + Copilot Chat (10 min)

### Learning Objective
Use Copilot Chat to identify duplicate code and refactor it into shared utilities across services.

### Scenario
Find and eliminate duplicate patterns across the polyglot microservices.

---

### 🔷 C# + 🐍 Python + ☕ Java Cross-Service Example — Health Check Pattern

**Setup**: All three backends have health check endpoints with inconsistent response formats. Open Copilot Chat (`Ctrl+Shift+I`).

**Step 1: Use `@workspace` to find duplicate patterns**

**Copilot Chat CORE Prompt**:
```
Context: This is a polyglot microservices app with Python (FastAPI), C# (ASP.NET), 
    and Java (Spring Boot) backends. Each has its own health endpoint.
Objective: Find all health check endpoint implementations across all backends and identify 
    inconsistent response formats.
Requirements: Compare response fields, status codes, and any missing service metadata.
Examples: Show me each health endpoint side by side.
```

**Expected Response** (Copilot finds inconsistencies):
```
Health endpoints found:

Python (backend/main.py):     {"status": "healthy"}
C# (Program.cs):              MapHealthChecks("/health") — default ASP.NET format
Java (HealthController.java): {"status": "healthy", "service": "geospatial-service", "runtime": "java"}

Issue: Python and C# are missing "service" and "runtime" fields that Java includes.
```

**Step 2: Ask Copilot to standardize**

**Copilot Chat CORE Prompt**:
```
Context: Three microservices with inconsistent health check responses that need 
    to be aggregated by the BFF.
Objective: Refactor all health endpoints to return a standardized format.
Requirements: Every health response must include: status, service name, runtime, and version.
    Follow each language's idiomatic patterns (Pydantic dict, C# anonymous object, Java Map.of).
Examples: Target format: {"status": "healthy", "service": "trips-service", "runtime": "python", "version": "1.0.0"}
```

---

### TypeScript Frontend Example — Extract Shared Utility

**Setup**: Open `frontend/src/views/AllTripsView.tsx` and `frontend/src/views/ExploreView.tsx` side by side.

Both files contain this identical function:
```typescript
const getDefaultImage = (index: number) => {
  const images = [
    'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  ];
  return images[index % images.length];
};
```

**Copilot Chat CORE Prompt**:
```
Context: Two React view components (AllTripsView.tsx and ExploreView.tsx) both contain 
    identical getDefaultImage() functions with hardcoded Unsplash URLs.
Objective: Extract getDefaultImage to a shared utility file and update both views.
Requirements: 
    - Create frontend/src/utils/images.ts with typed exports
    - Move the image URLs to a const array (no hardcoded strings in components)
    - Add a getTripImage(imageUrl, index) helper for the fallback pattern
    - Update both views to import from the new utility
Examples: Export pattern should match existing utils in the project.
```

**Expected Result — New file `frontend/src/utils/images.ts`:**
```typescript
const DEFAULT_TRIP_IMAGES = [
  'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
];

export function getDefaultImage(index: number): string {
  return DEFAULT_TRIP_IMAGES[index % DEFAULT_TRIP_IMAGES.length];
}

export function getTripImage(imageUrl: string | null | undefined, index: number): string {
  return imageUrl || getDefaultImage(index);
}
```

---

### Teaching Points

> 🔧 **Copilot Chat Refactoring Commands**:
> - `@workspace` — Search across entire codebase for patterns
> - `/refactor` — Extract, rename, restructure selected code
> - `Ctrl+Shift+I` — Open Chat panel for multi-step refactoring

### Verification
```bash
# Verify no duplicate code remains in views
grep -r "unsplash.com/photo-1501466044931" frontend/src/views/
# Should return: nothing (code moved to utils/)

npm run build  # Verify no TypeScript errors
```

---

## Demo 6: Few-Shot Prompting (10 min)

### Learning Objective
Teach Copilot project-specific patterns by showing 2-3 examples from the existing codebase, then asking it to generate similar code.

### Scenario
Create new models/DTOs across all three backends, teaching Copilot the pattern first.

---

### 🐍 Python Example — `backend/models.py`

**Setup**: Open `backend/models.py` and navigate to the end of the file.

**Few-Shot CORE Prompt:**
```python
"""
Context: SQLAlchemy ORM models for a FastAPI backend with PostgreSQL.
    This file defines the database schema with relationships.

Objective: Create a Comment model for trip reviews (Trip has many Comments).

Requirements:
    - Fields: id, trip_id (FK), user_id (FK), content (Text), rating (1-5), created_at
    - Bidirectional relationships with Trip and User
    - Follow existing column patterns (Integer PKs, DateTime defaults with UTC)

Examples (existing patterns to follow):

    Example 1 — User has many Trips (one-to-many):
    - Parent: User has `trips = relationship("Trip", back_populates="owner")`
    - Child: Trip has `user_id = Column(Integer, ForeignKey("users.id"))`
    - Child: Trip has `owner = relationship("User", back_populates="trips")`

    Example 2 — VehicleSpec model:
    - Has: id (PK), vehicle_type, height, width, weight, range, fuel_type, mpg
    - Has: created_at = Column(DateTime, default=lambda: datetime.now(UTC))

NOW CREATE: Comment model following these exact patterns
"""
```

**Expected Copilot Suggestion**:
```python
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    rating = Column(Integer, nullable=True)  # 1-5 rating
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Foreign Keys
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    trip = relationship("Trip", back_populates="comments")
    author = relationship("User", back_populates="comments")
```

---

### 🔷 C# Example — `backend-csharp/Models/AiModels.cs`

**Setup**: Open `AiModels.cs` and navigate after the existing classes.

**Few-Shot CORE Prompt:**
```csharp
/// <summary>
/// Context: C# DTO classes for an ASP.NET Web API service. Used for JSON
///     serialization in controller action methods.
///
/// Objective: Create request/response DTOs for a batch vehicle parsing endpoint
///     that processes multiple vehicle descriptions at once.
///
/// Requirements:
///     - Request: list of descriptions (strings)
///     - Response: status string, list of parsed VehicleSpecs, processing time
///     - Follow existing naming conventions and default values
///
/// Examples (existing patterns):
///
///     Example 1 — ParseVehicleRequest/Response:
///     - Request: public string Description { get; set; } = string.Empty;
///     - Response: public string Status { get; set; } = "success";
///                 public VehicleSpecs Specs { get; set; } = new();
///
///     Example 2 — GenerateTripRequest/Response:
///     - Request: public List&lt;string&gt; Interests { get; set; } = new();
///     - Response: public List&lt;string&gt; Suggestions { get; set; } = new();
///
/// NOW CREATE: BatchParseRequest/Response following these patterns
/// </summary>
```

**Expected Copilot Suggestion**:
```csharp
public class BatchParseRequest
{
    public List<string> Descriptions { get; set; } = new();
}

public class BatchParseResponse
{
    public string Status { get; set; } = "success";
    public List<VehicleSpecs> Results { get; set; } = new();
    public double ProcessingTimeMs { get; set; }
}
```

---

### ☕ Java Example — New DTO

**Setup**: Create a new file or open an existing DTO file in the Java backend.

**Few-Shot CORE Prompt:**
```java
/**
 * Context: Spring Boot geospatial service using Java records as immutable DTOs.
 *     Records auto-generate constructors, getters, equals, hashCode, and toString.
 *
 * Objective: Create DTOs for a "nearby places" endpoint that finds POIs
 *     along a route corridor.
 *
 * Requirements:
 *     - NearbyPlacesRequest: list of coordinates, search radius in meters,
 *       category filter (string), max results (int)
 *     - NearbyPlace: name, category, coordinates (lng/lat), distance from route
 *     - NearbyPlacesResponse: list of NearbyPlace, total count
 *
 * Examples (existing patterns):
 *
 *     Example 1 — GeocodeResponse:
 *     public record GeocodeResponse(List<Double> coordinates, String placeName) {}
 *
 *     Example 2 — DirectionsResponse:
 *     public record DirectionsResponse(double distance, double duration,
 *             Map<String, Object> geometry, List<Map<String, Object>> legs) {}
 *
 * NOW CREATE: NearbyPlaces DTOs following these record patterns
 */
```

**Expected Copilot Suggestion**:
```java
public record NearbyPlacesRequest(
    List<List<Double>> coordinates,
    int radiusMeters,
    String category,
    int maxResults
) {}

public record NearbyPlace(
    String name,
    String category,
    List<Double> coordinates,
    double distanceFromRoute
) {}

public record NearbyPlacesResponse(
    List<NearbyPlace> places,
    int totalCount
) {}
```

---

### Why Few-Shot Works

| Approach | Prompt Style | Result |
|----------|-------------|--------|
| ❌ Zero-shot | `"Create Comment model"` | May miss relationships, wrong patterns |
| ✅ Few-shot (CORE) | Context + Objective + Requirements + 2 Examples → NOW CREATE | Follows project conventions exactly |

---

## Demo 7: Unit Testing & Debugging (15 min)

### Learning Objective
Generate test cases with Copilot using CORE prompts and debug failing tests using Copilot Chat.

### Scenario
Generate and debug tests across all three backends.

---

### 🐍 Python Example — Pytest (`backend/tests/`)

**Step 1: Generate a test with CORE prompt**

```python
# Context: FastAPI backend with pytest. Using TestClient for HTTP tests.
#     Tests use a setup_db fixture that creates a clean SQLite database.
#     Existing tests follow the pattern: client.post/get → assert status → assert json fields.
#
# Objective: Test the trip creation endpoint with validation.
#
# Requirements:
#     - Test successful creation (200 with correct name)
#     - Test missing required field "name" (422 validation error)
#     - Test creating a trip with stops and vehicle_specs
#     - Use the existing client and setup_db fixtures
#
# Examples:
#     def test_health_check(setup_db):
#         response = client.get("/health")
#         assert response.status_code == 200
#         assert response.json()["status"] == "healthy"

def test_create_trip_success(setup_db):
```

**Expected Copilot Suggestion**:
```python
def test_create_trip_success(setup_db):
    response = client.post(
        "/api/trips",
        json={
            "name": "Test Trip",
            "stops": [{"id": "1", "name": "Start", "coordinates": [0, 0], "type": "start"}],
            "vehicle_specs": {"height": 3.5}
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Trip"
    assert len(data["stops"]) == 1


def test_create_trip_missing_name(setup_db):
    response = client.post(
        "/api/trips",
        json={"stops": [], "vehicle_specs": {}},
    )
    assert response.status_code == 422
```

**Step 2: Debug a failing test**

Introduce a deliberate bug:
```python
assert data["name"] == "Wrong Name"  # ← This will fail
```

Run `pytest tests/test_trips.py::test_create_trip_success -v` and see the failure.

Select the failing test and use Copilot Chat (`Ctrl+I`):
```
Context: This pytest test is failing with AssertionError: assert 'Test Trip' == 'Wrong Name'.
Objective: Fix the assertion to match the actual API response.
Requirements: The assertion should match the input data sent in the POST request.
Examples: We sent name="Test Trip", so the assertion should expect "Test Trip".
```

---

### 🔷 C# Example — xUnit + Moq

**Step 1: Generate a test with CORE prompt (Copilot Chat)**

Open `VehicleController.cs`, select the `ParseVehicle` method, then press `Ctrl+Shift+I`:

```
Context: ASP.NET Web API with a VehicleController that has a ParseVehicle endpoint.
    The controller uses IAiParsingService via constructor injection.
    We're using xUnit with Moq for testing.

Objective: Generate unit tests for the ParseVehicle endpoint.

Requirements:
    - Test 1: Successful parse returns 200 with VehicleSpecs
    - Test 2: Empty description returns 400 BadRequest
    - Test 3: Null description returns 400 BadRequest
    - Mock IAiParsingService to return known VehicleSpecs
    - Mock ILogger<VehicleController>

Examples:
    [Fact]
    public async Task HealthCheck_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
```

**Expected Copilot Suggestion**:
```csharp
public class VehicleControllerTests
{
    private readonly Mock<IAiParsingService> _mockAiService;
    private readonly Mock<ILogger<VehicleController>> _mockLogger;
    private readonly VehicleController _controller;

    public VehicleControllerTests()
    {
        _mockAiService = new Mock<IAiParsingService>();
        _mockLogger = new Mock<ILogger<VehicleController>>();
        _controller = new VehicleController(_mockAiService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task ParseVehicle_ValidDescription_ReturnsOk()
    {
        var expectedSpecs = new VehicleSpecs { VehicleType = "rv", Length = 10.0 };
        _mockAiService.Setup(s => s.ParseVehicleAsync("Class A RV"))
            .ReturnsAsync(new ParseVehicleResponse { Status = "success", Specs = expectedSpecs });

        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = "Class A RV" });

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ParseVehicleResponse>(okResult.Value);
        Assert.Equal("rv", response.Specs.VehicleType);
    }

    [Fact]
    public async Task ParseVehicle_EmptyDescription_ReturnsBadRequest()
    {
        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = "" });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task ParseVehicle_WhitespaceDescription_ReturnsBadRequest()
    {
        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = "   " });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
```

---

### ☕ Java Example — JUnit 5 + MockMvc

**Step 1: Generate a test with CORE prompt (Copilot Chat)**

Open `GeospatialController.java`, select the `geocode` method, then press `Ctrl+Shift+I`:

```
Context: Spring Boot 3 REST controller with MapboxService and AzureMapsService 
    injected via constructor. We use JUnit 5 with @WebMvcTest and @MockBean
    for controller-layer tests.

Objective: Generate unit tests for the geocode endpoint (GET /api/geocode?q=...).

Requirements:
    - Test 1: Valid query returns 200 with coordinates and placeName
    - Test 2: Missing query parameter returns 400
    - Mock MapboxService.geocode() to return a known GeocodeResponse
    - Use MockMvc for HTTP assertions

Examples:
    @Test
    void healthCheck_returnsHealthy() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("healthy"));
    }
```

**Expected Copilot Suggestion**:
```java
@WebMvcTest(GeospatialController.class)
class GeospatialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MapboxService mapboxService;

    @MockBean
    private AzureMapsService azureMapsService;

    @Test
    void geocode_validQuery_returnsCoordinates() throws Exception {
        var response = new GeocodeResponse(
            List.of(-122.4194, 37.7749), "San Francisco, CA");
        when(mapboxService.geocode("San Francisco")).thenReturn(response);

        mockMvc.perform(get("/api/geocode").param("q", "San Francisco"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.placeName").value("San Francisco, CA"))
            .andExpect(jsonPath("$.coordinates[0]").value(-122.4194))
            .andExpect(jsonPath("$.coordinates[1]").value(37.7749));
    }

    @Test
    void geocode_missingQuery_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/geocode"))
            .andExpect(status().isBadRequest());
    }
}
```

---

### Testing Commands Summary

| Command | What It Does |
|---------|-------------|
| `/tests` | Generate tests for selected code |
| `/fix` | Fix a failing test or broken code |
| `@workspace /tests` | Generate tests based on project-wide patterns |
| `Ctrl+I` → "Why is this test failing?" | Debug test failures with context |

### Test Prompt Tips (CORE)

```python
# ❌ Vague — generates generic tests
# Test the API

# ✅ CORE — generates targeted, framework-specific tests
# Context: FastAPI backend with pytest, TestClient, and setup_db fixture.
# Objective: Test trip creation with validation
# Requirements: Success case (200), missing name (422), with stops and vehicle_specs
# Examples: Follow test_health_check pattern above
```

---

## Demo 8: Copilot CLI (15 min)

### Learning Objective
Use GitHub Copilot CLI to generate shell commands and scripts from natural language.

### Scenario
Generate Azure deployment commands and Docker operations across all backend services without memorizing CLI syntax.

### Prerequisites
```bash
# Verify Copilot CLI is installed
gh copilot --version

# If not installed:
gh extension install github/gh-copilot
```

---

### Step 1: Explain a command

```bash
gh copilot explain "az containerapp env create --name roadtrip-env --resource-group aps-demo-rg --location westus2"
```

**Expected Explanation**:
```
This command creates an Azure Container Apps environment:

- az containerapp env: Azure Container Apps environment commands
- create: Create a new environment
- --name roadtrip-env: Name of the environment
- --resource-group aps-demo-rg: Resource group to create in
- --location westus2: Azure region

Container Apps environments provide the network boundary for 
your container apps and are required before deploying apps.
```

---

### Step 2: Generate commands for each backend service

**Python Backend:**
```bash
gh copilot suggest "build and deploy the Python FastAPI backend from ./backend to Azure Container Apps named roadtrip-python in resource group aps-demo-rg"
```

**C# Backend:**
```bash
gh copilot suggest "build a .NET 8 Docker image from ./backend-csharp, push to Azure Container Registry roadtripacr, and deploy to Container App roadtrip-csharp"
```

**Java Backend:**
```bash
gh copilot suggest "build a Spring Boot 3 Docker image from ./backend-java using multi-stage Maven build, push to ACR, and deploy to Container App roadtrip-java with MAPBOX_TOKEN env var"
```

**Expected Suggestions**:
```bash
# Python
docker build -t roadtripacr.azurecr.io/python-backend:latest ./backend
docker push roadtripacr.azurecr.io/python-backend:latest
az containerapp update --name roadtrip-python --resource-group aps-demo-rg \
  --image roadtripacr.azurecr.io/python-backend:latest

# C#
docker build -t roadtripacr.azurecr.io/csharp-backend:latest ./backend-csharp
docker push roadtripacr.azurecr.io/csharp-backend:latest
az containerapp update --name roadtrip-csharp --resource-group aps-demo-rg \
  --image roadtripacr.azurecr.io/csharp-backend:latest

# Java
docker build -t roadtripacr.azurecr.io/java-backend:latest ./backend-java
docker push roadtripacr.azurecr.io/java-backend:latest
az containerapp update --name roadtrip-java --resource-group aps-demo-rg \
  --image roadtripacr.azurecr.io/java-backend:latest \
  --set-env-vars "MAPBOX_TOKEN=secretref:mapbox-token"
```

---

### Step 3: Generate a multi-service deployment script

```bash
gh copilot suggest "create a bash script that builds all three backend Docker images (Python from ./backend, C# from ./backend-csharp, Java from ./backend-java), pushes to Azure Container Registry, and deploys to Container Apps"
```

**Expected Script**:
```bash
#!/bin/bash
set -e

RESOURCE_GROUP="${RESOURCE_GROUP:-aps-demo-rg}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-roadtripacr}"

echo "Logging into Azure Container Registry..."
az acr login --name $CONTAINER_REGISTRY

# Build and push all services
for service in backend:python-backend backend-csharp:csharp-backend backend-java:java-backend; do
  DIR="${service%%:*}"
  IMAGE="${service##*:}"
  echo "Building ${IMAGE} from ./${DIR}..."
  docker build -t ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE}:latest ./${DIR}
  docker push ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE}:latest
done

echo "✓ All images pushed. Deploy with az containerapp update."
```

---

### Step 4: Language-specific development commands

```bash
gh copilot suggest "start all services with docker-compose, rebuild only the Java backend, and tail its logs"
```

```bash
gh copilot explain "docker-compose up --build backend-java -d && docker-compose logs --tail=50 -f backend-java"
```

---

### Teaching Points

> 💻 **Copilot CLI Commands**:
> - `gh copilot suggest "..."` — Generate command from description
> - `gh copilot explain "..."` — Explain what a command does
> - `ghcs` / `ghce` — Shortcuts for suggest/explain

### Practical Examples (Polyglot)

| Natural Language | Generated Command |
|-----------------|-------------------|
| "Run Python backend tests with coverage" | `cd backend && pytest tests/ -v --cov=. --cov-report=html` |
| "Run C# backend with hot reload" | `cd backend-csharp && dotnet watch run` |
| "Run Java backend tests, skip integration" | `cd backend-java && ./mvnw test -Dtest='!*IntegrationTest'` |
| "List all Docker containers with ports" | `docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"` |
| "Check which process is using port 8082" | `netstat -ano \| findstr 8082` (Windows) |

---

## Workshop Summary & Key Takeaways

### CORE Framework Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PROMPT FRAMEWORK                     │
├─────────────────────────────────────────────────────────────┤
│  C = Context      Project, language, framework, file         │
│  O = Objective    Create, explain, refactor, test, fix       │
│  R = Requirements Types, validation, constraints, patterns   │
│  E = Examples     Existing code patterns, sample output      │
├─────────────────────────────────────────────────────────────┤
│  TEMPLATE:                                                   │
│  "Context:      In this [framework] [service]..."            │
│  "Objective:    Create / Explain / Test [specific thing]"    │
│  "Requirements: Must include [types, validation]..."         │
│  "Examples:     Follow [existing pattern] / like [sample]"   │
└─────────────────────────────────────────────────────────────┘
```

### Techniques Comparison Matrix

| # | Technique | When to Use | Trigger | CORE Focus |
|---|-----------|-------------|---------|------------|
| 1 | **Inline Suggestions** | Pattern-based code (dicts, objects, maps) | Just type | Context (existing file) |
| 2 | **Prompting** | Complex requirements | CORE comment/docstring | All four elements |
| 3 | **Comment-Based** | New functions/endpoints | `# CORE comment` + Enter | O + R strongest |
| 4 | **Code Explanations** | Understanding code | `/explain` + CORE prompt | C + O strongest |
| 5 | **Refactoring** | Duplicate/messy code | `/refactor` + `@workspace` | C + R strongest |
| 6 | **Copilot Chat** | Questions, debugging | `Ctrl+Shift+I` + CORE | All four elements |
| 7 | **Few-Shot** | Project patterns | 2-3 Examples + NOW CREATE | E strongest |
| 8 | **Testing** | Test generation/debugging | `/tests` + CORE | C + E strongest |
| 9 | **CLI** | Shell commands | `gh copilot suggest` | O + R strongest |

### Polyglot Pattern Summary

| Capability | 🐍 Python | 🔷 C# | ☕ Java |
|---|---|---|---|
| **1. Inline** | Dict entries in `vehicle_service.py` | `if/return` blocks in `AiParsingService.cs` | `Map.of()` entries in `HealthController.java` |
| **2. Prompting** | Pydantic `"""docstring"""` | XML doc `/// <summary>` | Javadoc `/** */` |
| **3. Comment-Based** | `# CORE comment` + `@app.get` | `// CORE comment` + `[HttpPost]` | `// CORE comment` + `@GetMapping` |
| **4. Explanations** | `auth.py` JWT/hashing | `AiParsingService.cs` AI+fallback | `MapboxService.java` WebClient |
| **5. Refactoring** | Health check standardization | Health check standardization | Health check standardization |
| **6. Copilot Chat** | `@workspace` cross-service search | `@workspace` cross-service search | `@workspace` cross-service search |
| **7. Few-Shot** | SQLAlchemy models | C# DTO classes | Java records |
| **8. Testing** | `pytest` + `TestClient` | `xUnit` + `Moq` | `JUnit 5` + `MockMvc` |
| **9. CLI** | `pytest --cov` commands | `dotnet watch run` | `./mvnw test` |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                  COPILOT QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab          Accept full suggestion                        │
│   Ctrl+→       Accept word-by-word (Cmd+→ on Mac)           │
│   Alt+]        Next suggestion                               │
│   Esc          Dismiss                                       │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT                                                 │
│   Ctrl+I       Inline chat (quick question)                  │
│   Ctrl+Shift+I Chat panel (longer conversations)             │
│   /explain     Explain selected code                         │
│   /fix         Fix errors in selection                       │
│   /tests       Generate tests                                │
│   /refactor    Refactor selected code                        │
│   @workspace   Search/query entire codebase                  │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CLI                                                  │
│   gh copilot suggest "..."    Generate command               │
│   gh copilot explain "..."    Explain command                │
│   ghcs / ghce                 Shortcuts                      │
└─────────────────────────────────────────────────────────────┘
```

### Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Accepting suggestions blindly | Always review for correctness across all languages |
| Vague prompts without CORE | Use all four elements: Context, Objective, Requirements, Examples |
| Only prompting in one language | Include framework-specific context (FastAPI vs ASP.NET vs Spring) |
| Ignoring alternatives | Press `Alt+]` to see other options |
| Not using few-shot for patterns | Show 2-3 examples for project-specific code |
| Skipping test verification | Always run tests: `pytest`, `dotnet test`, `./mvnw test` |
| Prompts missing Examples | The "E" in CORE is often what makes the difference |

---

## Hands-On Exercise (Optional - 15 min)

**Challenge**: Use ALL 9 techniques with CORE prompts to add a "Bookmark" feature across services.

1. **Inline Suggestions** (Python): Add `"bookmarked": boolean` to vehicle specs dictionary
2. **Prompting** (C#): Create `BookmarkRequest`/`BookmarkResponse` DTOs using CORE
3. **Comment-Based** (Java): Create `GET /api/bookmarks/nearby` endpoint with CORE comment
4. **Explanations** (Python): Explain the auth dependency injection pattern in `main.py`
5. **Refactoring** (All): Extract common response formatting across services
6. **Copilot Chat** (All): `@workspace` to find where bookmark data should be stored
7. **Few-Shot** (Python): Create `Bookmark` model using User/Trip relationship examples
8. **Testing** (C#): Generate xUnit tests for bookmark controller
9. **CLI**: Generate `docker-compose` command to restart only affected services

**Verification**:
```bash
# Python
cd backend && pytest tests/test_bookmarks.py -v

# C#
cd backend-csharp && dotnet test

# Java
cd backend-java && ./mvnw test

# Frontend
cd frontend && npm test -- bookmark.test.ts
```

---

## Next Workshop Preview

**Workshop 3: Advanced Web Development**
- **Copilot Edits**: Multi-file changes in one operation
- **Custom Instructions**: Project-specific `.github/copilot-instructions.md`
- **Agent Mode**: Autonomous multi-step workflows
- **Workspace Agents**: `@workspace`, `@vscode`, `@terminal`
- **MCP Servers**: Connecting to external tools and APIs

**Preparation**:
- Review `.github/copilot-instructions.md`
- Explore Copilot Edits panel (`Ctrl+Shift+I` → Edits tab)
- Read `ROADMAP.md` for project context

---

## Resources

- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Copilot CLI**: https://githubnext.com/projects/copilot-cli
- **Project Documentation**: `docs/PROJECT_INSTRUCTIONS.md`
- **ROADMAP**: `ROADMAP.md`
- **Vitest Docs**: https://vitest.dev/
- **Pytest Docs**: https://docs.pytest.org/
- **xUnit Docs**: https://xunit.net/docs/getting-started/netcore/cmdline
- **JUnit 5 Docs**: https://junit.org/junit5/docs/current/user-guide/

**Questions?** Proceed to Workshop 3 or ask for clarification.
