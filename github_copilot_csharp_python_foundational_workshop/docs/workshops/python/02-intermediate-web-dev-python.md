# Workshop 2: Intermediate Python Web Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations with hands-on exercises  
**Audience**: Python developers with Copilot foundational knowledge (completed Workshop 1)  
**Prerequisites**: VS Code with GitHub Copilot extension, GitHub Copilot CLI installed, Python 3.10+  
**Project**: Road Trip Planner — FastAPI backend (`backend/`)

---

## Learning Objectives

By the end of this workshop, you will be able to:

1. **Inline Code Suggestions** — Accept and modify Copilot's real-time code completions
2. **Prompting** — Write effective prompts using the CORE framework that generate accurate, project-specific code
3. **Code Explanations** — Use Copilot to understand complex authentication and database logic
4. **Comment-Based Generation** — Generate complete functions from descriptive comments
5. **Code Refactoring** — Extract duplicate code using Copilot's refactoring capabilities
6. **Copilot Chat** — Interact with Copilot for code questions, improvements, and debugging
7. **Few-Shot Prompting** — Teach Copilot patterns by showing examples before requesting new code
8. **Unit Testing & Debugging** — Generate test cases and debug failing tests with Copilot
9. **Copilot CLI** — Generate shell commands and scripts using natural language

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

**Why CORE?** GitHub's official prompt engineering guidance recommends: start general then get specific, give examples, break complex tasks into simpler tasks, and avoid ambiguity. The CORE framework structures these principles into a repeatable formula.

> 📚 **Reference**: [Prompt engineering for GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot)

---

## Project Overview — Python Backend

All demos use the **FastAPI backend** in `backend/`. Here's the key file structure:

```
backend/
├── main.py              # FastAPI endpoints (geocode, directions, trips, auth)
├── models.py            # SQLAlchemy ORM models (User, Trip, VehicleSpec)
├── schemas.py           # Pydantic request/response schemas
├── auth.py              # JWT authentication (access + refresh tokens)
├── ai_service.py        # Proxy to C# AI microservice for vehicle parsing
├── vehicle_service.py   # Vehicle specs with AI-first + fallback logic
├── database.py          # SQLAlchemy engine + session setup
├── azure_maps_explore.py# Azure Maps API exploration script
├── tests/
│   ├── conftest.py      # Shared pytest fixtures (mocked httpx, DB setup)
│   ├── test_main.py     # API endpoint tests with mocked external APIs
│   ├── test_trips.py    # Trip CRUD + GeoJSON storage tests
│   ├── test_vehicle_service.py  # Vehicle specs AI + fallback tests
│   └── fixtures/        # JSON mock responses (Mapbox, Azure Maps, AI)
└── requirements.txt     # Dependencies (FastAPI, SQLAlchemy, httpx, etc.)
```

**Tech stack**: FastAPI, SQLAlchemy, Pydantic, httpx, pytest, python-jose (JWT)

---

## Workshop Agenda

| Time | Demo | Learning Objective | File(s) |
|------|------|-------------------|---------|
| 0–10 min | Demo 1 | **Inline Code Suggestions** | `vehicle_service.py` |
| 10–20 min | Demo 2 | **Prompting** (CORE Framework) | `schemas.py` |
| 20–30 min | Demo 3 | **Comment-Based Generation** | `main.py` |
| 30–40 min | Demo 4 | **Code Explanations** | `auth.py`, `ai_service.py` |
| 40–50 min | Demo 5 | **Code Refactoring** + **Copilot Chat** | `main.py` |
| 50–60 min | Demo 6 | **Few-Shot Prompting** | `models.py` |
| 60–75 min | Demo 7 | **Unit Testing & Debugging** | `tests/` |
| 75–90 min | Demo 8 | **Copilot CLI** | Terminal |

---

## Demo 1: Inline Code Suggestions (10 min)

### Learning Objective

Accept and modify Copilot's real-time code completions as you type, using pattern recognition.

### What Are Inline Suggestions?

Inline suggestions are the **ghost text** (grayed-out) that Copilot shows as you type. Copilot analyzes your current file, open tabs, and surrounding code patterns to predict what you'll type next. This is the most natural way to work with Copilot — just keep typing and let it complete your thoughts.

> 📚 **Reference**: [Getting code suggestions in your IDE](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot)

### Scenario

Add new vehicle type entries to the `DEFAULT_VEHICLE_SPECS` dictionary in `vehicle_service.py`. Copilot recognizes the existing dictionary pattern and suggests complete, correctly-shaped entries.

---

### Step-by-Step: Add a "motorcycle" vehicle type

**Step 1**: Open `backend/vehicle_service.py` in VS Code.

**Step 2**: Navigate to the `DEFAULT_VEHICLE_SPECS` dictionary (lines 7–44). Review the existing pattern — each entry is a string key mapping to a dict with keys: `height`, `width`, `length`, `weight`, `fuelType`, `range`, `mpg`.

**Step 3**: Position your cursor after the last entry (`"ev_truck": {...},`) on a new line inside the dictionary. Type:

```python
    "motorcycle": {
```

**Step 4**: Watch for the **ghost text** — Copilot should suggest something like:

```python
    "motorcycle": {
        "height": 1.2, "width": 0.9, "length": 2.2, "weight": 0.3,
        "fuelType": "gas", "range": 250, "mpg": 50.0
    },
```

**Step 5**: Press `Tab` to **accept the full suggestion**.

**Step 6**: Review the values — do they make sense for a motorcycle? (Height ~1.2m, weight 0.3 tonnes = 300kg — reasonable!)

---

### Step-by-Step: Add a "bus" vehicle type with partial acceptance

**Step 1**: On the next line, type:

```python
    "bus": {
```

**Step 2**: Copilot suggests the full entry. This time, use `Cmd+→` (Mac) or `Ctrl+→` (Windows) to accept **word by word**. This lets you:
- Accept `"height": 3.5,` ✓ (reasonable for a bus)
- Modify values you disagree with as you go

```python
    "bus": {
        "height": 3.5, "width": 2.6, "length": 12.0, "weight": 15.0,
        "fuelType": "diesel", "range": 500, "mpg": 6.0
    },
```

**Step 3**: Press `Esc` to dismiss if the suggestion doesn't look right, then type more characters to steer Copilot.

---

### Keyboard Shortcuts Reference

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See next alternative | `Option+]` | `Alt+]` |
| See previous alternative | `Option+[` | `Alt+[` |
| Open all suggestions in new tab | `Ctrl+Enter` | `Ctrl+Enter` |

---

### Teaching Points

> 💡 **Key Insight**: Inline suggestions work best when Copilot has **context from existing patterns**. The existing dictionary structure teaches Copilot the exact shape (`height`, `width`, `length`, `weight`, `fuelType`, `range`, `mpg`) to follow for new entries.

### Common Mistakes to Avoid

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| ❌ Accepting without review | Copilot may guess wrong values (e.g., motorcycle `weight: 15.0`) | Always verify numeric values make sense |
| ❌ Ignoring alternatives | First suggestion isn't always best | Press `Option+]` / `Alt+]` to cycle through options |
| ❌ Fighting Copilot | Deleting and retyping the same thing | Type more characters to steer, or `Esc` and start fresh |
| ❌ No surrounding context | Copilot can't predict patterns in an empty file | Keep related code visible; open relevant files in adjacent tabs |

---

## Demo 2: Prompting — CORE Framework (10 min)

### Learning Objective

Write effective prompts using the **CORE** framework (Context, Objective, Requirements, Examples) that generate accurate, project-specific code.

### What Makes a Good Prompt?

GitHub's official guidance recommends:
1. **Start general, then get specific** — give the big picture first, then list details
2. **Give examples** — show Copilot what the output should look like
3. **Avoid ambiguity** — mention the exact framework, library, and patterns
4. **Indicate relevant code** — reference existing files and classes by name

The CORE framework bundles all of this into a repeatable structure.

> 📚 **Reference**: [Prompt engineering for GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot)

### Scenario

Create a new Pydantic schema (`RouteOptimizationRequest`) in `backend/schemas.py` using a CORE prompt.

---

### Step-by-Step: Create a RouteOptimizationRequest schema

**Step 1**: Open `backend/schemas.py` in VS Code.

**Step 2**: Navigate to the end of the file, after the existing `POIResponse` class.

**Step 3**: Write the following CORE prompt as a multi-line docstring. This is **not** code — it's a structured comment that tells Copilot exactly what to generate:

```python
"""
Context: In this FastAPI backend, we use Pydantic BaseModel classes for API
    request/response validation. Existing schemas use ConfigDict(from_attributes=True)
    for ORM compatibility and Field() for validation constraints. See
    VehicleSpecsResponse and POIResponse above for the project pattern.

Objective: Create request and response schemas for a route optimization endpoint
    that accepts a list of waypoints and returns an optimized travel order.

Requirements:
    - WaypointInput: nested model with longitude (float, -180 to 180),
      latitude (float, -90 to 90), and optional name (str, max 100 chars)
    - RouteOptimizationRequest: list of WaypointInput (min 2 items),
      vehicle_type (str, default "car"), avoid_tolls (bool, default False),
      avoid_highways (bool, default False), max_detour_minutes (int, default 30,
      range 0–120)
    - RouteOptimizationResponse: optimized_waypoints (list of WaypointInput),
      total_distance_km (float), total_duration_minutes (float),
      status (str, default "success")
    - Use Field() for validation constraints on all fields

Examples: Follow the POIResponse pattern above with field_validator for
    coordinate validation and ConfigDict(from_attributes=True)
"""
```

**Step 4**: Press `Enter` after the closing `"""` and start typing:

```python
class WaypointInput(BaseModel):
```

**Step 5**: Copilot should suggest the complete class. Accept with `Tab`:

```python
class WaypointInput(BaseModel):
    """A single waypoint with coordinates and optional name."""
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude (-90 to 90)")
    name: Optional[str] = Field(None, max_length=100, description="Optional waypoint name")
```

**Step 6**: Press `Enter` and type:

```python
class RouteOptimizationRequest(BaseModel):
```

**Step 7**: Copilot suggests the request schema. Accept:

```python
class RouteOptimizationRequest(BaseModel):
    """Request for route optimization with waypoints and preferences."""
    waypoints: List[WaypointInput] = Field(..., min_length=2, description="At least 2 waypoints")
    vehicle_type: str = Field("car", description="Vehicle type for optimization")
    avoid_tolls: bool = Field(False, description="Avoid toll roads")
    avoid_highways: bool = Field(False, description="Avoid highways")
    max_detour_minutes: int = Field(30, ge=0, le=120, description="Max detour in minutes")
```

**Step 8**: Type the response class, and Copilot completes it:

```python
class RouteOptimizationResponse(BaseModel):
    """Response with optimized waypoint order and trip metrics."""
    optimized_waypoints: List[WaypointInput] = Field(..., description="Waypoints in optimized order")
    total_distance_km: float = Field(..., ge=0, description="Total distance in kilometers")
    total_duration_minutes: float = Field(..., ge=0, description="Total duration in minutes")
    status: str = Field("success", description="Optimization status")

    model_config = ConfigDict(from_attributes=True)
```

---

### CORE vs. Vague Prompting Comparison

| Prompt Quality | Prompt | What Copilot Generates |
|----------------|--------|------------------------|
| ❌ Vague | `# Create route schema` | Missing validation, no Field() constraints, wrong types |
| ⚠️ Partial | `# Create a route optimization request with waypoints` | May include some fields but misses project patterns |
| ✅ CORE | Full Context + Objective + Requirements + Examples (above) | Precise, validated, matches project conventions exactly |

> 💡 **Key Insight**: The **E (Examples)** element is often the difference between generic code and project-specific code. By referencing `POIResponse` and `VehicleSpecsResponse`, Copilot mimics those patterns exactly.

---

## Demo 3: Comment-Based Generation (10 min)

### Learning Objective

Generate complete functions from descriptive comments placed directly above code.

### How Comment-Based Generation Works

When you write a detailed comment and then start a function signature, Copilot uses the comment as a prompt to generate the complete function body. The more specific the comment, the more accurate the generated code.

### Scenario

Add a new API endpoint to `backend/main.py` that reverse-geocodes coordinates (latitude/longitude) into a human-readable address using the Mapbox Geocoding API.

---

### Step-by-Step: Add a reverse geocode endpoint

**Step 1**: Open `backend/main.py` in VS Code.

**Step 2**: Navigate to after the existing `geocode_address` endpoint (~line 265). This is where API endpoints are grouped.

**Step 3**: Write this CORE-structured comment above a new function:

```python
# Context: FastAPI backend that proxies external API calls through the server
#     to protect API tokens. Uses httpx for async HTTP requests and os.getenv
#     for environment configuration. See geocode_address() above for the pattern.
# Objective: Add endpoint to reverse-geocode coordinates into an address using
#     Mapbox Geocoding API (reverse geocoding endpoint).
# Requirements:
#     - GET /api/reverse-geocode
#     - Parameters: lng (float) - longitude, lat (float) - latitude
#     - Validate: lng must be -180 to 180, lat must be -90 to 90
#     - Uses MAPBOX_TOKEN from environment variables
#     - Mapbox reverse geocode URL: https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json
#     - Raise HTTPException(500) if token missing
#     - Raise HTTPException(400) if coordinates out of range
#     - Raise HTTPException(404) if no results found
#     - Return: { "coordinates": [lng, lat], "place_name": "..." }
# Examples: Follow the geocode_address() pattern above with error handling
```

**Step 4**: Type the function signature and let Copilot complete the body:

```python
@app.get("/api/reverse-geocode")
async def reverse_geocode(lng: float, lat: float):
```

**Step 5**: Copilot should suggest the complete function. Accept with `Tab`:

```python
@app.get("/api/reverse-geocode")
async def reverse_geocode(lng: float, lat: float):
    """
    Reverse-geocode coordinates into a human-readable address.
    Uses Mapbox Geocoding API (proxied to protect API token).
    """
    # Validate coordinate ranges
    if not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    if not (-90 <= lat <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")

    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")

    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json?access_token={token}&limit=1"

    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Reverse geocoding failed")

        data = resp.json()
        if not data.get("features") or len(data["features"]) == 0:
            raise HTTPException(status_code=404, detail="No address found for coordinates")

        feature = data["features"][0]
        return {
            "coordinates": [lng, lat],
            "place_name": feature["place_name"]
        }
```

---

### Step-by-Step: Add a nearby POI search endpoint

**Step 1**: After the reverse geocode endpoint, write another CORE comment:

```python
# Context: FastAPI backend using httpx to proxy Azure Maps Fuzzy Search API.
#     The AZURE_MAPS_KEY environment variable stores the API subscription key.
#     See the existing search_places() endpoint above for the Azure Maps pattern.
# Objective: Add endpoint to find nearby POIs (gas stations, restaurants, hotels)
#     within a radius of given coordinates.
# Requirements:
#     - GET /api/nearby
#     - Parameters: lat (float), lng (float), category (str), radius_km (int, default 5)
#     - Uses Azure Maps Nearby Search API: https://atlas.microsoft.com/search/nearby/json
#     - Returns list of POIs in GeoJSON-like format matching search_places() output
#     - Raise HTTPException(500) if Azure Maps key missing
#     - Limit results to 10
# Examples: Follow search_places() response format: {"features": [{"type": "Feature", ...}]}
```

**Step 2**: Type the signature:

```python
@app.get("/api/nearby")
async def search_nearby(lat: float, lng: float, category: str, radius_km: int = 5):
```

**Step 3**: Accept Copilot's generated implementation.

---

### Teaching Points

> 💡 **Comment-Based Generation Best Practices (CORE)**:
> 1. **Context** — Mention FastAPI, httpx, the specific service pattern, and DI (Depends)
> 2. **Objective** — Be specific: "Add endpoint to reverse-geocode" not just "reverse geocode"
> 3. **Requirements** — List HTTP method, path, parameters, return types, error handling
> 4. **Examples** — Reference existing methods: "Follow the `geocode_address()` pattern"

### Comparison: Comment Quality

```python
# ❌ Too vague — Copilot may generate incorrect implementation
# Reverse geocode

# ⚠️ Partial — missing security and pattern context
# Add reverse geocode endpoint with lng and lat parameters

# ✅ CORE — Copilot generates complete, correct implementation
# Context: FastAPI backend that proxies external API calls...
# Objective: Add endpoint to reverse-geocode coordinates using Mapbox API
# Requirements: GET /api/reverse-geocode, params lng/lat, uses MAPBOX_TOKEN...
# Examples: Follow the geocode_address() pattern above with error handling
```

---

## Demo 4: Code Explanations (10 min)

### Learning Objective

Use Copilot Chat to understand complex authentication, AI integration, and database logic in the Python backend.

### How Code Explanations Work

You can select code in your editor and ask Copilot Chat to explain it. Copilot uses the selected code plus surrounding file context to generate detailed explanations. Use the **CORE** framework in your explanation prompts to get targeted, useful answers.

> 📚 **Reference**: [Asking GitHub Copilot questions in your IDE](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide)

### Scenario A: Understand the JWT authentication flow

---

### Step-by-Step: Explain the dual-token auth system

**Step 1**: Open `backend/auth.py` in VS Code.

**Step 2**: Select lines 36–60 (the `create_access_token`, `create_refresh_token`, `hash_token`, and `verify_refresh_token` functions):

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

**Step 3**: Open Copilot Chat (`Cmd+Shift+I` on Mac / `Ctrl+Shift+I` on Windows) and type this CORE prompt:

```
Context: This is a FastAPI auth module using python-jose for JWT and hashlib
    for token hashing. The backend stores refresh tokens hashed in SQLAlchemy.

Objective: Explain the security flow — why do we hash refresh tokens but NOT
    access tokens?

Requirements: Cover token lifetimes, storage strategy, and what happens if
    the database is breached. Explain at a level suitable for a developer
    who understands HTTP but is new to JWT.

Examples: Walk through the full flow: user logs in → gets both tokens →
    uses access token for API calls → access token expires → uses refresh
    token to get a new one.
```

**Step 4**: Read Copilot's explanation. It should cover:

> **Expected Copilot Explanation:**
>
> This implements a dual-token authentication system:
>
> **Access Tokens (JWT):**
> - Short-lived (30 minutes by default from `ACCESS_TOKEN_EXPIRE_MINUTES`)
> - Self-verifying via cryptographic signature (HS256)
> - NOT stored in database (stateless)
> - Contain user data in the `"sub"` claim (email)
>
> **Refresh Tokens:**
> - Long-lived (7 days from `REFRESH_TOKEN_EXPIRE_DAYS`)
> - Cryptographically random (`secrets.token_urlsafe(32)`) — contain NO user data
> - HASHED with SHA-256 before database storage
> - Used only to obtain new access tokens
>
> **Why hash refresh tokens but not access tokens?**
> - Refresh tokens are stored in the DB. If the DB is breached, attackers get only irreversible SHA-256 hashes.
> - Access tokens are JWTs verified by signature, never stored. Hashing would break JWT verification.
> - This follows OWASP token storage best practices.

---

### Scenario B: Understand the AI-first with fallback pattern

### Step-by-Step: Explain the vehicle specs service

**Step 1**: Open `backend/vehicle_service.py` in VS Code.

**Step 2**: Select the entire `get_vehicle_specs` function (lines 52–76).

**Step 3**: Open Copilot Chat and type this CORE prompt:

```
Context: This FastAPI backend has a vehicle_service.py that calls a C# AI
    microservice via ai_service.py (using httpx). If the AI service is
    unavailable, it falls back to a DEFAULT_VEHICLE_SPECS dictionary.

Objective: Explain the AI-first with fallback pattern — how does the
    try/except flow work, and why does it use asyncio.run()?

Requirements: Cover these three scenarios:
    1. AI service is available and returns valid specs
    2. AI service is available but fails (timeout, error)
    3. AI service is not configured / unreachable
    Also explain why asyncio.run() is used in a sync function.

Examples: Trace a request for vehicle_type="rv_large" through each scenario.
```

**Step 4**: Read Copilot's explanation, which should describe:

> **Expected Copilot Explanation:**
>
> **Scenario 1: AI service succeeds**
> 1. `asyncio.run()` calls `ai_service.get_vehicle_specs_from_ai("rv_large")`
> 2. httpx POSTs to `http://backend-csharp:8081/api/v1/parse-vehicle`
> 3. C# service uses Azure OpenAI to parse the description
> 4. Returns `VehicleSpecsResponse(**ai_specs)` with AI-generated values
>
> **Scenario 2: AI service fails**
> 1. `asyncio.run()` calls the AI service, which throws (timeout, 503, etc.)
> 2. Exception caught in the `try/except` block
> 3. Falls through to `DEFAULT_VEHICLE_SPECS.get("rv_large")` → returns default dict
> 4. Returns `VehicleSpecsResponse(**specs_dict)` with fallback values
>
> **Scenario 3: AI service unreachable**
> 1. `ai_service.get_vehicle_specs_from_ai()` catches `httpx.HTTPError`
> 2. Returns `None` → `if ai_specs:` is falsy
> 3. Falls through to default specs
>
> **Why `asyncio.run()`?** The endpoint `get_vehicle_specs_endpoint` is a sync FastAPI function (no `async def`), but `ai_service.get_vehicle_specs_from_ai` is async. `asyncio.run()` bridges the sync/async gap.

---

### Copilot Chat Commands Reference

| Command | Usage |
|---------|-------|
| `Cmd+I` / `Ctrl+I` | Open inline chat (quick question about selected code) |
| `Cmd+Shift+I` / `Ctrl+Shift+I` | Open Chat panel (longer conversations) |
| `/explain` | Explain selected code |
| `/fix` | Fix errors in selected code |
| `/tests` | Generate tests for selected code |
| `@workspace` | Search across entire codebase |

---

## Demo 5: Code Refactoring + Copilot Chat (10 min)

### Learning Objective

Use Copilot Chat to identify duplicate code patterns and refactor them into shared utilities.

### How Copilot Helps with Refactoring

Copilot Chat's `@workspace` participant can search your entire project to find patterns. Combined with the `/refactor` command on selected code, you can systematically eliminate duplication.

### Scenario

The `backend/main.py` file has multiple endpoints that follow the same pattern: check for an API key env var, raise `HTTPException(500)` if missing. This is duplicated across `geocode_address`, `get_directions`, `search_places`, and `optimize_route`.

---

### Step-by-Step: Find duplicate patterns

**Step 1**: Open Copilot Chat (`Cmd+Shift+I` / `Ctrl+Shift+I`).

**Step 2**: Use `@workspace` to find duplication. Type this CORE prompt:

```
Context: This is a FastAPI backend in backend/main.py with multiple endpoints
    that proxy external APIs (Mapbox and Azure Maps). Each endpoint checks for
    an API key from environment variables and raises HTTPException if missing.

Objective: Find all instances of duplicated API key checking logic in main.py
    and show them side by side.

Requirements: List each endpoint name, the env var it checks, and the exact
    error handling code. Identify what's repeated.

Examples: Show the pattern like:
    geocode_address → MAPBOX_TOKEN → HTTPException(500, "Mapbox token not configured")
    get_directions  → MAPBOX_TOKEN → HTTPException(500, "Mapbox token not configured")
```

**Step 3**: Copilot should identify 4+ endpoints with the same pattern.

---

### Step-by-Step: Extract a shared dependency

**Step 1**: Select one of the duplicated token-check blocks in `main.py`, for example:

```python
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
```

**Step 2**: Press `Cmd+I` (inline chat) and type this CORE prompt:

```
Context: FastAPI backend with multiple endpoints that check for API keys.
    FastAPI supports Depends() for dependency injection at the endpoint level.

Objective: Refactor the duplicated API key checking into reusable FastAPI
    dependency functions.

Requirements:
    - Create a get_mapbox_token() dependency that returns the token or raises HTTPException(500)
    - Create a get_azure_maps_key() dependency that returns the key or raises HTTPException(500)
    - Both should use os.getenv() and raise HTTPException with descriptive messages
    - Show how to use them with Depends() in endpoint signatures

Examples: FastAPI dependency pattern:
    def get_mapbox_token() -> str:
        token = os.getenv("MAPBOX_TOKEN")
        if not token:
            raise HTTPException(status_code=500, detail="...")
        return token
    
    @app.get("/api/geocode")
    async def geocode_address(q: str, token: str = Depends(get_mapbox_token)):
```

**Step 3**: Copilot generates the refactored code. Apply it:

```python
# --- API Key Dependencies (add near the top of main.py, after get_db) ---

def get_mapbox_token() -> str:
    """Dependency: returns Mapbox API token or raises 500 if missing."""
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    return token

def get_azure_maps_key() -> str:
    """Dependency: returns Azure Maps API key or raises 500 if missing."""
    key = os.getenv("AZURE_MAPS_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Azure Maps key not configured")
    return key
```

**Step 4**: Update each endpoint to use the dependency. For example:

```python
# Before (duplicated):
@app.get("/api/geocode")
async def geocode_address(q: str):
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    ...

# After (refactored):
@app.get("/api/geocode")
async def geocode_address(q: str, token: str = Depends(get_mapbox_token)):
    ...
```

---

### Step-by-Step: Refactor error response pattern

**Step 1**: Ask Copilot Chat to find another pattern:

```
Context: FastAPI backend in main.py. Multiple endpoints call external APIs
    with httpx and raise HTTPException when the response status is not 200.

Objective: Create a shared async helper function for making proxied API calls
    that handles common error patterns.

Requirements:
    - Function: async_api_get(url: str, params: dict = None) -> dict
    - Uses httpx.AsyncClient with timeout=30.0
    - Raises HTTPException with the upstream status code on failure
    - Returns parsed JSON on success
    - Handles httpx.HTTPError exceptions gracefully

Examples: Replace this repeated pattern in geocode_address, get_directions, etc.:
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="...")
        return resp.json()
```

**Step 2**: Apply the generated helper and update endpoints.

---

### Teaching Points

> 🔧 **Copilot Chat Refactoring Commands**:
> - `@workspace` — Search across the entire codebase for patterns
> - `/refactor` — Extract, rename, restructure selected code
> - `Cmd+I` — Quick inline refactoring on selected code

### Before/After Verification

```bash
# Run tests to verify refactoring didn't break anything
cd backend && python -m pytest tests/test_main.py -v
```

---

## Demo 6: Few-Shot Prompting (10 min)

### Learning Objective

Teach Copilot project-specific patterns by showing 2–3 examples from the existing codebase, then asking it to generate similar code.

### What Is Few-Shot Prompting?

Few-shot prompting means you provide Copilot with concrete examples from your project before asking it to generate something new. This is especially powerful for ORM models, serializers, and other structured code where patterns are consistent.

> 📚 **Reference**: GitHub's prompt engineering docs recommend "Give examples" — few-shot takes this to the next level by embedding real code from your project.

### Scenario

Create a new `Comment` SQLAlchemy model in `backend/models.py` for trip reviews.

---

### Step-by-Step: Create a Comment model using few-shot

**Step 1**: Open `backend/models.py` in VS Code.

**Step 2**: Navigate to the end of the file, after the `VehicleSpec` class.

**Step 3**: Write this few-shot CORE prompt, which **shows 2 existing examples** before the request:

```python
"""
Context: SQLAlchemy ORM models for a FastAPI backend. This file defines the
    database schema with relationships. Uses declarative_base() from database.py.

Objective: Create a Comment model for trip reviews (a Trip has many Comments,
    a User has many Comments).

Requirements:
    - Table name: "comments"
    - Fields: id (Integer PK), trip_id (FK to trips.id), user_id (FK to users.id),
      content (String, not nullable), rating (Integer, nullable, 1-5),
      created_at (DateTime with UTC default)
    - Bidirectional relationships with Trip and User
    - Follow existing column patterns: Integer PKs, DateTime defaults with UTC

Examples (existing patterns to follow):

    Example 1 — User model (parent side of one-to-many):
        class User(Base):
            __tablename__ = "users"
            id = Column(Integer, primary_key=True, index=True)
            email = Column(String, unique=True, index=True)
            created_at = Column(DateTime, default=lambda: datetime.now(UTC))
            trips = relationship("Trip", back_populates="owner")

    Example 2 — Trip model (child side of one-to-many):
        class Trip(Base):
            __tablename__ = "trips"
            id = Column(Integer, primary_key=True, index=True)
            name = Column(String, index=True)
            user_id = Column(Integer, ForeignKey("users.id"))
            created_at = Column(DateTime, default=lambda: datetime.now(UTC))
            owner = relationship("User", back_populates="trips")

NOW CREATE: Comment model following these exact patterns.
"""
```

**Step 4**: Press `Enter` and type:

```python
class Comment(Base):
```

**Step 5**: Copilot should suggest the complete model. Accept with `Tab`:

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

**Step 6**: Note you also need to add the `back_populates` relationships to the existing `User` and `Trip` models. Add:

```python
# In User class, add:
comments = relationship("Comment", back_populates="author")

# In Trip class, add:
comments = relationship("Comment", back_populates="trip")
```

---

### Step-by-Step: Create a matching Pydantic schema with few-shot

**Step 1**: Open `backend/schemas.py`.

**Step 2**: Write a few-shot prompt at the end:

```python
"""
Context: Pydantic schemas for FastAPI request/response validation.

Objective: Create schemas for the Comment model (CRUD operations).

Requirements:
    - CommentBase: content (str), rating (Optional[int], 1-5)
    - CommentCreate(CommentBase): trip_id (int)
    - Comment(CommentBase): id, trip_id, user_id, created_at
    - Use ConfigDict(from_attributes=True) for ORM compatibility

Examples (existing patterns):

    Example 1 — TripBase / TripCreate / Trip:
        class TripBase(BaseModel):
            name: str
            stops: List[Any]
            vehicle_specs: Any

        class TripCreate(TripBase):
            is_public: Optional[bool] = False

        class Trip(TripBase):
            id: int
            user_id: int
            created_at: Optional[datetime] = None
            model_config = ConfigDict(from_attributes=True)

NOW CREATE: CommentBase, CommentCreate, Comment schemas.
"""
```

**Step 3**: Type `class CommentBase(BaseModel):` and let Copilot generate all three classes.

---

### Why Few-Shot Works

| Approach | Prompt Style | Result |
|----------|-------------|--------|
| ❌ Zero-shot | `"Create Comment model"` | May miss relationships, wrong column types, no `back_populates` |
| ⚠️ One-shot (CORE without examples) | CORE prompt with requirements only | Gets the fields right but may not match project conventions |
| ✅ Few-shot (CORE) | Context + Objective + Requirements + **2 real examples** → NOW CREATE | Follows project conventions exactly: column naming, relationship patterns, DateTime defaults |

---

## Demo 7: Unit Testing & Debugging (15 min)

### Learning Objective

Generate test cases with Copilot using CORE prompts, and debug failing tests using Copilot Chat.

### How Copilot Helps with Testing

Copilot can:
- Generate complete test files from CORE prompts
- Use the `/tests` command on selected code to auto-generate tests
- Debug failing tests by explaining the error and suggesting fixes

### Scenario

Generate tests for the vehicle service and debug a deliberate test failure.

---

### Step-by-Step: Generate tests for reverse-geocode endpoint

**Step 1**: Open `backend/tests/test_main.py` in VS Code.

**Step 2**: Navigate to the end of the file, after the existing tests.

**Step 3**: Write a CORE prompt as a comment:

```python
# Context: FastAPI backend with pytest. Using TestClient for HTTP tests.
#     External APIs (Mapbox, Azure Maps) are mocked using fixtures from conftest.py.
#     Existing tests follow the pattern: client.get/post → assert status_code → assert json fields.
#     The MAPBOX_TOKEN env var must be set for Mapbox endpoints to work.
#
# Objective: Test the reverse-geocode endpoint (GET /api/reverse-geocode?lng=...&lat=...).
#
# Requirements:
#     - test_reverse_geocode_success: mock httpx, return place_name and coordinates
#     - test_reverse_geocode_invalid_longitude: lng=200 should return 400
#     - test_reverse_geocode_invalid_latitude: lat=-100 should return 400
#     - test_reverse_geocode_no_results: mock empty features array, expect 404
#     - Use unittest.mock.patch and MagicMock/AsyncMock for httpx mocking
#     - Set MAPBOX_TOKEN env var in the test
#
# Examples:
#     def test_geocode_success(mock_httpx_geocode_success):
#         response = client.get("/api/geocode?q=San Francisco")
#         assert response.status_code == 200
#         data = response.json()
#         assert "coordinates" in data
#         assert "place_name" in data
```

**Step 4**: Type the first test function signature:

```python
def test_reverse_geocode_success():
```

**Step 5**: Accept Copilot's suggestion:

```python
def test_reverse_geocode_success():
    """Should successfully reverse-geocode coordinates"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "features": [
            {
                "place_name": "123 Main St, San Francisco, CA 94102",
                "geometry": {"type": "Point", "coordinates": [-122.4194, 37.7749]}
            }
        ]
    }

    with patch("httpx.AsyncClient") as mock_client, \
         patch.dict(os.environ, {"MAPBOX_TOKEN": "test-token"}):
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        response = client.get("/api/reverse-geocode?lng=-122.4194&lat=37.7749")
        assert response.status_code == 200
        data = response.json()
        assert "place_name" in data
        assert "coordinates" in data
        assert data["coordinates"] == [-122.4194, 37.7749]
```

**Step 6**: Continue typing function signatures and let Copilot generate each test:

```python
def test_reverse_geocode_invalid_longitude():
    """Should reject longitude out of range"""
    with patch.dict(os.environ, {"MAPBOX_TOKEN": "test-token"}):
        response = client.get("/api/reverse-geocode?lng=200&lat=37.7749")
        assert response.status_code == 400
        assert "Longitude" in response.json()["detail"]


def test_reverse_geocode_invalid_latitude():
    """Should reject latitude out of range"""
    with patch.dict(os.environ, {"MAPBOX_TOKEN": "test-token"}):
        response = client.get("/api/reverse-geocode?lng=-122.4194&lat=-100")
        assert response.status_code == 400
        assert "Latitude" in response.json()["detail"]


def test_reverse_geocode_no_results():
    """Should return 404 when no address found"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"features": []}

    with patch("httpx.AsyncClient") as mock_client, \
         patch.dict(os.environ, {"MAPBOX_TOKEN": "test-token"}):
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        response = client.get("/api/reverse-geocode?lng=0&lat=0")
        assert response.status_code == 404
```

---

### Step-by-Step: Debug a failing test with Copilot

**Step 1**: Introduce a **deliberate bug** in one of the tests:

```python
def test_reverse_geocode_success():
    ...
    assert data["place_name"] == "Wrong Place Name"  # ← Intentional bug
```

**Step 2**: Run the test and observe the failure:

```bash
cd backend && python -m pytest tests/test_main.py::test_reverse_geocode_success -v
```

**Step 3**: You'll see output like:

```
FAILED tests/test_main.py::test_reverse_geocode_success - AssertionError:
    assert '123 Main St, San Francisco, CA 94102' == 'Wrong Place Name'
```

**Step 4**: Select the failing test in VS Code and open Copilot Chat (`Cmd+I`):

```
Context: This pytest test for the FastAPI reverse-geocode endpoint is failing
    with an AssertionError on the place_name comparison.

Objective: Fix the assertion to match the actual mock data.

Requirements: The assertion should match the place_name from the mock_response
    fixture we defined in the test.

Examples: We mocked the response with place_name="123 Main St, San Francisco, CA 94102",
    so the assertion should expect that exact string.
```

**Step 5**: Copilot identifies the bug:

> The assertion expects `"Wrong Place Name"` but the mock returns `"123 Main St, San Francisco, CA 94102"`. Change the assertion to match the mock data:
> ```python
> assert data["place_name"] == "123 Main St, San Francisco, CA 94102"
> ```

---

### Step-by-Step: Generate tests using the /tests command

**Step 1**: Open `backend/vehicle_service.py`.

**Step 2**: Select the entire `get_vehicle_specs` function.

**Step 3**: Open Copilot Chat and type `/tests`.

**Step 4**: Copilot generates a complete test class. Review and save to `tests/test_vehicle_service.py`.

---

### Testing Commands Summary

| Command / Shortcut | What It Does |
|---------------------|-------------|
| `/tests` | Generate tests for selected code |
| `/fix` | Fix a failing test or broken code |
| `@workspace /tests` | Generate tests based on project-wide patterns |
| `Cmd+I` → "Why is this test failing?" | Debug test failures with context |

### Running Tests

```bash
# Run all tests
cd backend && python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_main.py -v

# Run specific test
python -m pytest tests/test_main.py::test_reverse_geocode_success -v

# Run with coverage
python -m pytest tests/ -v --cov=. --cov-report=html
```

---

## Demo 8: Copilot CLI (15 min)

### Learning Objective

Use GitHub Copilot CLI to generate shell commands and scripts from natural language — without memorizing CLI syntax.

### What Is Copilot CLI?

GitHub Copilot CLI (`gh copilot`) lets you describe what you want in plain English, and it generates the terminal command for you. Two main subcommands:
- `gh copilot suggest "..."` — Generate a command from a natural language description
- `gh copilot explain "..."` — Explain what an existing command does

> 📚 **Reference**: [Using GitHub Copilot in the CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli/using-github-copilot-in-the-cli)

### Prerequisites

```bash
# Verify Copilot CLI is installed
gh copilot --version

# If not installed:
gh extension install github/gh-copilot
```

---

### Step-by-Step: Explain a command

**Step 1**: Run this command to understand what a Docker Compose command does:

```bash
gh copilot explain "docker compose -f docker-compose.dev.yml up --build backend -d"
```

**Step 2**: Read the explanation:

```
This command:
- docker compose: Docker Compose tool for multi-container apps
- -f docker-compose.dev.yml: Uses the development compose file
- up: Create and start containers
- --build: Rebuild images before starting
- backend: Only start the 'backend' service (not all services)
- -d: Run in detached/background mode
```

---

### Step-by-Step: Generate Python backend commands

**Step 1**: Generate a command to run tests with coverage:

```bash
gh copilot suggest "run Python pytest tests in the backend directory with verbose output and HTML coverage report"
```

**Expected output**:

```bash
cd backend && python -m pytest tests/ -v --cov=. --cov-report=html
```

**Step 2**: Generate a command to find all TODO comments in Python files:

```bash
gh copilot suggest "find all TODO and FIXME comments in Python files in the backend directory"
```

**Expected output**:

```bash
grep -rn "TODO\|FIXME" backend/ --include="*.py"
```

**Step 3**: Generate database migration commands:

```bash
gh copilot suggest "create an alembic database migration named 'add comments table' for the backend"
```

**Expected output**:

```bash
cd backend && alembic revision --autogenerate -m "add comments table"
```

---

### Step-by-Step: Generate a Docker build and deploy script

**Step 1**: Ask Copilot to generate a build command:

```bash
gh copilot suggest "build the Python FastAPI backend Docker image from ./backend, tag it as roadtripacr.azurecr.io/python-backend:latest, and push to Azure Container Registry"
```

**Expected output**:

```bash
docker build -t roadtripacr.azurecr.io/python-backend:latest ./backend && \
az acr login --name roadtripacr && \
docker push roadtripacr.azurecr.io/python-backend:latest
```

**Step 2**: Generate a health check command:

```bash
gh copilot suggest "curl the health endpoint of a FastAPI app running on localhost port 8000 and pretty-print the JSON response"
```

**Expected output**:

```bash
curl -s http://localhost:8000/health | python -m json.tool
```

---

### Step-by-Step: Generate environment setup commands

```bash
gh copilot suggest "create a Python virtual environment in the backend directory, activate it, and install requirements from requirements.txt"
```

**Expected output**:

```bash
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

---

### Practical Examples for Python Development

| Natural Language | Generated Command |
|-----------------|-------------------|
| "Run Python backend tests with coverage" | `cd backend && pytest tests/ -v --cov=. --cov-report=html` |
| "Start FastAPI with hot reload on port 8000" | `cd backend && uvicorn main:app --reload --port 8000` |
| "Check which process is using port 8000" | `lsof -i :8000` (Mac) / `netstat -tlnp \| grep 8000` (Linux) |
| "Create alembic migration for new model" | `cd backend && alembic revision --autogenerate -m "description"` |
| "List all Python files with import httpx" | `grep -rl "import httpx" backend/ --include="*.py"` |
| "Run only tests matching 'vehicle'" | `cd backend && pytest tests/ -v -k "vehicle"` |
| "Format all Python files with black" | `cd backend && black . --line-length 100` |

---

### Teaching Points

> 💻 **Copilot CLI Quick Reference**:
> - `gh copilot suggest "..."` — Generate a command from description
> - `gh copilot explain "..."` — Explain what a command does
> - `ghcs` / `ghce` — Shortcuts for suggest / explain (if aliases are configured)

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
│  "Context:      In this FastAPI backend, working with..."    │
│  "Objective:    Create / Explain / Test [specific thing]"    │
│  "Requirements: Must include [types, validation]..."         │
│  "Examples:     Follow [existing pattern] / like [sample]"   │
└─────────────────────────────────────────────────────────────┘
```

### Techniques Comparison Matrix

| # | Technique | When to Use | How to Trigger | CORE Focus |
|---|-----------|-------------|----------------|------------|
| 1 | **Inline Suggestions** | Adding entries to existing patterns (dicts, lists) | Just type — Copilot auto-suggests | Context (existing file) |
| 2 | **Prompting (CORE)** | Complex schemas, models with validation | Write `"""CORE prompt"""` then code | All four elements |
| 3 | **Comment-Based** | New API endpoints, utility functions | Write `# CORE comment` → function signature | O + R strongest |
| 4 | **Code Explanations** | Understanding auth, AI, or database logic | Select code → Chat `/explain` + CORE | C + O strongest |
| 5 | **Refactoring** | Duplicate code, long functions | Select code → Chat `/refactor` or `@workspace` | C + R strongest |
| 6 | **Copilot Chat** | Questions, debugging, architecture advice | `Cmd+Shift+I` + CORE prompt | All four elements |
| 7 | **Few-Shot** | ORM models, schemas, serializers | Show 2–3 examples → "NOW CREATE" | E strongest |
| 8 | **Testing** | Test generation and debugging | `/tests` on selection or CORE comment | C + E strongest |
| 9 | **Copilot CLI** | Shell commands you can't remember | `gh copilot suggest "..."` | O + R strongest |

### Python-Specific Pattern Summary

| Technique | Python File | What You'll Build |
|-----------|------------|-------------------|
| Inline Suggestions | `vehicle_service.py` | New entries in `DEFAULT_VEHICLE_SPECS` dict |
| Prompting (CORE) | `schemas.py` | `WaypointInput`, `RouteOptimizationRequest/Response` |
| Comment-Based | `main.py` | `/api/reverse-geocode` and `/api/nearby` endpoints |
| Explanations | `auth.py`, `vehicle_service.py` | JWT dual-token flow, AI-first with fallback |
| Refactoring | `main.py` | Extract `get_mapbox_token()` dependency, shared `async_api_get()` |
| Few-Shot | `models.py`, `schemas.py` | `Comment` SQLAlchemy model + Pydantic schemas |
| Testing | `tests/test_main.py` | Reverse geocode tests + deliberate bug debugging |
| Copilot CLI | Terminal | pytest, Docker, alembic, uvicorn commands |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              COPILOT QUICK REFERENCE (VS Code)               │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab               Accept full suggestion                   │
│   Cmd+→ / Ctrl+→    Accept word-by-word                     │
│   Option+] / Alt+]  Next suggestion                          │
│   Option+[ / Alt+[  Previous suggestion                      │
│   Esc               Dismiss                                  │
│   Ctrl+Enter        Open all suggestions in new tab          │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT                                                 │
│   Cmd+I / Ctrl+I          Inline chat (quick question)       │
│   Cmd+Shift+I / Ctrl+Shift+I  Chat panel (conversations)    │
│   /explain                Explain selected code              │
│   /fix                    Fix errors in selection             │
│   /tests                  Generate tests                     │
│   /refactor               Refactor selected code             │
│   @workspace              Search entire codebase             │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CLI                                                  │
│   gh copilot suggest "..." Generate command                  │
│   gh copilot explain "..." Explain command                   │
│   ghcs / ghce              Shortcuts                         │
└─────────────────────────────────────────────────────────────┘
```

### Common Pitfalls to Avoid

| Pitfall | Why It's Bad | Fix |
|---------|-------------|-----|
| Accepting suggestions blindly | Values may be wrong (e.g., motorcycle weight = 15 tonnes) | Always review generated code before committing |
| Vague prompts without CORE | Copilot guesses wrong framework patterns | Use all four CORE elements every time |
| Skipping the "E" (Examples) | Generic code that doesn't match your project | Reference existing classes/functions by name |
| Not using `@workspace` | Missing cross-file context for refactoring | Use `@workspace` to let Copilot see the full project |
| Forgetting to run tests | Copilot's code may compile but have logic bugs | Always `pytest` after accepting generated code |
| Overly complex prompts | Too many requirements confuses Copilot | Break into smaller tasks; one prompt per function |

---

## Hands-On Exercise (Optional — 15 min)

**Challenge**: Use ALL 9 techniques with CORE prompts to add a "Bookmark" feature to the Python backend.

### Exercise Steps

1. **Inline Suggestions** (`vehicle_service.py`): Add `"hybrid_suv"` as a new vehicle type entry in the `DEFAULT_VEHICLE_SPECS` dictionary. Let Copilot auto-complete the values.

2. **Prompting** (`schemas.py`): Create `BookmarkCreate` and `BookmarkResponse` Pydantic schemas using a full CORE prompt with Field() validation.

3. **Comment-Based** (`main.py`): Write a CORE comment and generate `POST /api/bookmarks` endpoint that saves a bookmarked trip for the current user.

4. **Explanations** (`auth.py`): Select the `get_current_user` dependency in `main.py` and ask Copilot to explain how FastAPI's `Depends()` chain works with OAuth2.

5. **Refactoring** (`main.py`): Use `@workspace` to find all trip query patterns (`db.query(models.Trip).filter(...)`) and extract a shared `get_user_trip()` helper.

6. **Copilot Chat**: Ask `@workspace` where bookmark data should be stored — new table or existing Trip model?

7. **Few-Shot** (`models.py`): Create a `Bookmark` SQLAlchemy model using the User and Trip relationship examples as few-shot patterns.

8. **Testing** (`tests/`): Generate pytest tests for the bookmark endpoint — success (200), missing trip_id (422), duplicate bookmark (409).

9. **CLI** (Terminal): Generate the command to create an alembic migration for the new Bookmark table.

### Verification

```bash
# Run all backend tests including new bookmark tests
cd backend && python -m pytest tests/ -v

# Check for any import errors
cd backend && python -c "import models; import schemas; print('OK')"

# Run with coverage
cd backend && python -m pytest tests/ -v --cov=. --cov-report=term-missing
```

---

## Next Workshop Preview

**Workshop 3: Advanced Web Development with GitHub Copilot**
- **Copilot Edits**: Multi-file changes in one operation
- **Custom Instructions**: Project-specific `.github/copilot-instructions.md`
- **Agent Mode**: Autonomous multi-step workflows
- **Workspace Agents**: `@workspace`, `@vscode`, `@terminal`
- **MCP Servers**: Connecting to external tools and APIs

**Preparation**:
- Review `.github/copilot-instructions.md` (if it exists)
- Explore the Copilot Edits panel (`Cmd+Shift+I` → Edits tab)
- Read `docs/ROADMAP.md` for project context

---

## Resources

- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Prompt Engineering Guide**: https://docs.github.com/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot
- **Code Suggestions in IDE**: https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot
- **Copilot Chat in IDE**: https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide
- **Copilot CLI**: https://docs.github.com/en/copilot/github-copilot-in-the-cli/using-github-copilot-in-the-cli
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Pytest Docs**: https://docs.pytest.org/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Project Documentation**: `docs/PROJECT_INSTRUCTIONS.md`

---

