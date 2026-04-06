# Workshop 3: Advanced Python Web Development with GitHub Copilot

**Duration**: 100 minutes  
**Format**: Live coding demonstrations  
**Audience**: Python developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, FastAPI/Pydantic patterns

---

## Learning Objectives

By the end of this workshop, you will master these **9 advanced Copilot techniques** — all demonstrated with real Python code from this repository:

1. **[Chain-of-Thought Prompting](#demo-1-chain-of-thought-prompting-10-min)** — Break complex features into logical reasoning steps
2. **[Tree of Thought Prompting](#demo-2-tree-of-thought-prompting-10-min)** — Explore multiple solution branches before selecting an approach
3. **[Instruction Files](#demo-3-instruction-files-10-min)** — Create path-specific `.instructions.md` files with `applyTo` targeting
4. **[Prompt Files](#demo-4-prompt-files-10-min)** — Build reusable `.prompt.md` templates for FastAPI, Pydantic, and pytest
5. **[Copilot Code Review](#demo-5-copilot-code-review-10-min)** — Review PRs for security, JWT patterns, and authentication flows
6. **[Copilot Plan Mode](#demo-6-copilot-plan-mode-15-min)** — Architect multi-step test coverage plans using real fixtures
7. **[Copilot Coding Agent](#demo-7-copilot-coding-agent-15-min)** — Delegate autonomous multi-file refactoring tasks
8. **[Copilot Agent HQ](#demo-8-copilot-agent-hq-10-min)** — Create custom agents for Python API auditing
9. **[Architecture & Tech Stack Generation](#demo-9-architecture--tech-stack-generation-10-min)** — Generate test infrastructure and ADRs

### CORE Prompt Framework

All prompts in this workshop follow the **CORE** framework:

| Element | Meaning | Example |
|---------|---------|---------|
| **C** – Context | Background, tech stack, relevant files | "In the FastAPI backend (`backend/`), `vehicle_service.py` has a `DEFAULT_VEHICLE_SPECS` dict..." |
| **O** – Objective | What you want Copilot to produce | "Add a function `calculate_fuel_stops()` that determines required fuel stops" |
| **R** – Requirements | Constraints, rules, patterns to follow | "Use `VehicleSpecsResponse` from `schemas.py`, handle EVs differently" |
| **E** – Examples | Expected inputs/outputs, code patterns | "Input: `vehicle_type='rv_large'`, `route_distance=1200` → Output: `[320, 640, 960]`" |

---

## Workshop Agenda

| Time | Demo | Topic | Focus Files |
|------|------|-------|-------------|
| 0-10 min | Demo 1 | Chain-of-Thought Prompting | `vehicle_service.py`, `ai_service.py`, `main.py` |
| 10-20 min | Demo 2 | Tree of Thought Prompting | `ai_service.py`, `vehicle_service.py`, `auth.py` |
| 20-30 min | Demo 3 | Instruction Files | `.github/instructions/backend.instructions.md` |
| 30-40 min | Demo 4 | Prompt Files | `.github/prompts/*.prompt.md` |
| 40-50 min | Demo 5 | Copilot Code Review | `auth.py`, `main.py` (PR review) |
| 50-65 min | Demo 6 | Copilot Plan Mode | `tests/conftest.py`, `tests/fixtures/` |
| 65-80 min | Demo 7 | Copilot Coding Agent | `main.py`, new `constants.py` |
| 80-90 min | Demo 8 | Copilot Agent HQ | `.github/agents/python-api-auditor.md` |
| 90-100 min | Demo 9 | Architecture & Tech Stack Generation | `tests/`, `docs/adr/` |

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex features into step-by-step reasoning chains that guide Copilot toward correct solutions.

### Scenario
Add vehicle-aware logic across three Python modules: the vehicle service, the AI service client, and the Azure Maps search endpoint.

---

### Example 1A: Vehicle Fuel Range Calculation (`backend/vehicle_service.py`)

**CORE Prompt:**
```
Context: In backend/vehicle_service.py, we have a DEFAULT_VEHICLE_SPECS dictionary
with 9 vehicle types (car, suv, mini_van, van, truck, rv_small, rv_large, ev_sedan,
ev_truck). Each entry has height, width, length, weight, fuelType, range (miles),
and mpg. The function get_vehicle_specs() returns a VehicleSpecsResponse from
schemas.py.

Objective: Add a function calculate_fuel_stops() that determines required fuel
stops for a given route distance.

Requirements:
- Use VehicleSpecsResponse schema from schemas.py (fields: height, width, length,
  weight, fuelType, range, mpg)
- Include safety margin (refuel at 80% of max range)
- Return list of recommended fuel stop distances in miles
- Handle electric vehicles differently (charging time estimate)
- Look up specs from DEFAULT_VEHICLE_SPECS, fall back to "car" for unknown types

Examples:
- Input: vehicle_type='rv_large' (range=400mi), route_distance=1200mi
  Output: [320, 640, 960] (stops every 320mi = 400 × 0.8)
- Input: vehicle_type='ev_sedan' (range=300mi), route_distance=500mi
  Output: [240] (one charge stop at 240mi = 300 × 0.8)

Chain of thought:
Step 1: Look up vehicle specs from DEFAULT_VEHICLE_SPECS using vehicle_type key
Step 2: Calculate safe range (max_range × 0.8)
Step 3: Generate stop positions at each safe_range interval
Step 4: Handle EV differently — flag fuelType == "electric", estimate 30 min per stop
Step 5: Return structured dict with stop distances and metadata

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

### Example 1B: AI Service Retry with Backoff (`backend/ai_service.py`)

**CORE Prompt:**
```
Context: In backend/ai_service.py, the async function get_vehicle_specs_from_ai()
calls the C# AI microservice at AI_SERVICE_URL (default http://backend-csharp:8081).
It uses httpx.AsyncClient with a 30-second timeout and posts to /api/v1/parse-vehicle
with {"description": description}. On failure (httpx.HTTPError or any Exception), it
returns None, and the caller in vehicle_service.py falls back to DEFAULT_VEHICLE_SPECS.

Objective: Add retry logic with exponential backoff to get_vehicle_specs_from_ai()
before falling back to None.

Requirements:
- Retry up to 3 times on transient failures (httpx.HTTPError)
- Exponential backoff: 1s, 2s, 4s
- Do NOT retry on 400-level client errors (only 500+ and connection errors)
- Log each retry attempt with the logger
- Keep the same return type: Optional[Dict[str, Any]]
- Preserve the existing response transformation (specs.get, weight / 1000)

Examples:
- AI service returns 503 → retry after 1s → retry after 2s → success → return specs
- AI service returns 400 → do NOT retry → return None immediately
- AI service timeout on all 3 retries → return None

Chain of thought:
Step 1: Define retry configuration constants (MAX_RETRIES=3, BASE_DELAY=1.0)
Step 2: Wrap the httpx call in a retry loop
Step 3: On httpx.HTTPStatusError, check status code — skip retry for 4xx
Step 4: On retryable failure, asyncio.sleep with exponential delay
Step 5: After all retries exhausted, return None (existing fallback behavior)

Now implement:
```

**Expected Copilot Output:**
```python
# In backend/ai_service.py
import asyncio

MAX_RETRIES = 3
BASE_DELAY_SECONDS = 1.0

async def get_vehicle_specs_from_ai(description: str) -> Optional[Dict[str, Any]]:
    """Calls C# AI microservice with retry and exponential backoff."""
    for attempt in range(MAX_RETRIES):
        try:
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
                    "fuelType": "gas",
                    "range": 400,
                    "mpg": 25.0,
                }

        except httpx.HTTPStatusError as e:
            if e.response.status_code < 500:
                logger.warning(f"Client error (no retry): {e.response.status_code}")
                return None
            logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")

        except httpx.HTTPError as e:
            logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")

        except Exception as e:
            logger.warning(f"Unexpected error: {e}")
            return None

        if attempt < MAX_RETRIES - 1:
            delay = BASE_DELAY_SECONDS * (2 ** attempt)
            logger.info(f"Retrying in {delay}s...")
            await asyncio.sleep(delay)

    logger.warning("All retry attempts exhausted")
    return None
```

---

### Example 1C: Azure Maps POI Category Filtering (`backend/main.py`)

**CORE Prompt:**
```
Context: In backend/main.py, the /api/search endpoint calls Azure Maps Search API
and transforms the response into GeoJSON features. The transform maps each result's
"position" (with lon/lat fields) into GeoJSON coordinates [longitude, latitude].
Current code returns ALL results from Azure Maps without filtering.

Relevant code (main.py, /api/search):
    for result in data.get("results", []):
        position = result.get("position", {})
        feature = {
            "type": "Feature",
            "properties": {...},
            "geometry": {
                "type": "Point",
                "coordinates": [
                    position.get("lon"),  # Longitude first (GeoJSON spec)
                    position.get("lat")   # Latitude second (GeoJSON spec)
                ]
            }
        }
        features.append(feature)

Objective: Add optional category filtering to the search endpoint so the frontend
can request only specific POI types (gas stations, restaurants, hotels).

Requirements:
- Add optional query parameter "category" to /api/search
- Filter Azure Maps results by poi.categories field in the response
- Keep existing GeoJSON [lng, lat] coordinate format
- Use HTTPException(400) for invalid category values
- Maintain backward compatibility — return all results when no category specified

Examples:
- /api/search?query=food&lat=37.7&lon=-122.4 → all results (existing behavior)
- /api/search?query=food&lat=37.7&lon=-122.4&category=restaurant → only restaurants
- /api/search?query=gas&lat=37.7&lon=-122.4&category=gas_station → only gas stations

Chain of thought:
Step 1: Add Optional[str] category parameter to the search function signature
Step 2: Define allowed categories as a constant set
Step 3: Validate category if provided, raise HTTPException(400) for invalid values
Step 4: After fetching Azure Maps results, filter by poi.categories if category set
Step 5: Continue with existing GeoJSON transform on filtered results

Now implement:
```

**Expected Copilot Output:**
```python
# In backend/main.py

ALLOWED_CATEGORIES = {"gas_station", "restaurant", "hotel", "parking", "ev_charging"}

@app.get("/api/search")
async def search_places(
    query: str,
    lat: float,
    lon: float,
    category: Optional[str] = None,
):
    if category and category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Allowed: {', '.join(ALLOWED_CATEGORIES)}"
        )

    token = os.getenv("AZURE_MAPS_KEY")
    if not token:
        raise HTTPException(status_code=500, detail="Azure Maps key not configured")

    url = f"https://atlas.microsoft.com/search/fuzzy/json"
    params = {
        "api-version": "1.0",
        "subscription-key": token,
        "query": query,
        "lat": lat,
        "lon": lon,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        data = resp.json()

    # Step 4: Filter by category if specified
    results = data.get("results", [])
    if category:
        results = [
            r for r in results
            if category in [
                c.lower().replace(" ", "_")
                for c in r.get("poi", {}).get("categories", [])
            ]
        ]

    # Step 5: Transform to GeoJSON (existing pattern)
    features = []
    for result in results:
        position = result.get("position", {})
        feature = {
            "type": "Feature",
            "properties": {
                "name": result.get("poi", {}).get("name", "Unknown"),
                "address": result.get("address", {}).get("freeformAddress", ""),
                "category": ", ".join(result.get("poi", {}).get("categories", [])),
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    position.get("lon"),  # Longitude first (GeoJSON spec)
                    position.get("lat"),  # Latitude second (GeoJSON spec)
                ],
            },
        }
        features.append(feature)

    return {"features": features}
```

---

### Teaching Points

| Chain-of-Thought Formula | Example 1A (Vehicle Service) | Example 1B (AI Service) | Example 1C (Search Endpoint) |
|-------------------------|------------------------------|------------------------|------------------------------|
| Step 1: Inputs | `DEFAULT_VEHICLE_SPECS` lookup | Retry config constants | Category parameter |
| Step 2: Data model | `VehicleSpecsResponse` | `Optional[Dict]` return | GeoJSON feature |
| Step 3: Business logic | Range × 0.8 safety margin | Status code branching | Category filtering |
| Step 4: Edge cases | EV charging time | 4xx vs 5xx handling | Backward compatibility |
| Step 5: Response | Structured dict | Preserve transform | Existing GeoJSON format |

**When to Use**: Multi-step features, unfamiliar APIs, complex business rules  
**Avoid**: Simple CRUD, trivial getters/setters

---

## Demo 2: Tree of Thought Prompting (10 min)

### Objective
Learn to use Tree of Thought (ToT) prompting to explore multiple solution branches *before* committing to implementation — ideal for architectural decisions where the "right" answer depends on tradeoffs.

### Background: Chain-of-Thought vs. Tree of Thought

| Technique | Structure | Best For |
|-----------|-----------|----------|
| **Chain-of-Thought** | Linear steps → implementation | Known algorithm, complex steps |
| **Tree of Thought** | Branch A / B / C → evaluate → select → implement | Multiple valid approaches, design decisions |

ToT forces Copilot to reason through alternatives before committing to code. It prevents first-solution bias and produces justified architectural choices with explicit tradeoff documentation.

### Scenario
Apply ToT to two real decisions in this backend: (2A) designing a caching strategy for vehicle specs lookups, and (2B) choosing a token revocation approach — which also sets up the Code Review scenario in Demo 5.

---

### Example 2A: Vehicle Specs Caching Strategy (`ai_service.py` + `vehicle_service.py`)

**Context**: Every `POST /api/vehicle-specs` call triggers `get_vehicle_specs()` in `vehicle_service.py`, which calls `asyncio.run(ai_service.get_vehicle_specs_from_ai(vehicle_type))` to reach the C# microservice (30s timeout). There are exactly 9 vehicle types in `DEFAULT_VEHICLE_SPECS` — specs never change at runtime.

**CORE Prompt (Tree of Thought style):**
```
Context: In backend/vehicle_service.py, get_vehicle_specs() calls
asyncio.run(ai_service.get_vehicle_specs_from_ai(vehicle_type)) on every
POST /api/vehicle-specs request. The C# AI service has a 30s timeout.
There are exactly 9 vehicle types (car, suv, mini_van, van, truck, rv_small,
rv_large, ev_sedan, ev_truck) — specs are immutable at runtime.
In backend/ai_service.py, get_vehicle_specs_from_ai() is an async function
posting to {AI_SERVICE_URL}/api/v1/parse-vehicle.

Objective: Add caching so the C# AI service call happens at most once per
vehicle type per server lifetime.

Requirements: Evaluate exactly THREE branches before implementing:

Branch A — functools.lru_cache on get_vehicle_specs()
  Pros: One decorator, zero code change
  Cons: Does not work natively on async functions; asyncio.run() bridge
        inside the sync wrapper — evaluate whether this is reliable

Branch B — Module-level dict cache in vehicle_service.py
  Pros: Explicit, works with both sync/async, zero new dependencies
  Cons: In-process only (acceptable for immutable vehicle types)

Branch C — Redis cache via aioredis
  Pros: Cross-process, survives restarts, works in multi-replica deployments
  Cons: New infrastructure dependency; overkill for 9 static, immutable keys

Evaluate each branch. Select the best for this specific use case.
Then implement the selected approach in vehicle_service.py.
```

**Expected Copilot Output:**
```python
## Tree of Thought Evaluation

### Branch A: functools.lru_cache
❌ REJECTED — get_vehicle_specs() uses asyncio.run() internally. While
lru_cache can wrap it syntactically, this pattern is fragile: asyncio.run()
cannot be called when an event loop is already running (as in async FastAPI
routes during testing). The cache also doesn't persist across restarts.

### Branch B: Module-level dict cache
✅ SELECTED — Explicit, zero dependencies, directly fits the use case:
- 9 vehicle types is a small, bounded, immutable set
- Works regardless of sync/async context
- Easy to test (clear _vehicle_specs_cache in test setUp)
- Cache miss → AI call → populate; subsequent calls instant

### Branch C: Redis/aioredis
❌ REJECTED — Introduces Redis + aioredis for 9 keys that never change at
runtime. Complexity/benefit ratio is extremely unfavorable for this use case.

### Implementation (Branch B selected):

# In backend/vehicle_service.py

_vehicle_specs_cache: dict = {}

def get_vehicle_specs(vehicle_type: str) -> VehicleSpecsResponse:
    """
    Get vehicle specs, checking cache before calling the AI service.
    Cache is populated lazily per vehicle type on first request.
    """
    vehicle_key = vehicle_type.lower()
    if vehicle_key in _vehicle_specs_cache:
        return _vehicle_specs_cache[vehicle_key]

    # Try AI service first
    try:
        ai_result = asyncio.run(ai_service.get_vehicle_specs_from_ai(vehicle_key))
        if ai_result:
            response = VehicleSpecsResponse(**ai_result)
            _vehicle_specs_cache[vehicle_key] = response
            return response
    except Exception:
        pass

    # Fall back to DEFAULT_VEHICLE_SPECS
    specs = DEFAULT_VEHICLE_SPECS.get(vehicle_key, DEFAULT_VEHICLE_SPECS["car"])
    response = VehicleSpecsResponse(**specs)
    _vehicle_specs_cache[vehicle_key] = response
    return response
```

---

### Example 2B: Token Revocation Design (`auth.py`)

**Context**: `POST /api/auth/logout` clears `user.refresh_token` in the DB, but the 30-minute JWT access token remains usable until expiry. A team discussion is evaluating whether to add token blacklisting. Use ToT to evaluate the options *before* writing any code — this also sets up the security issues you will catch in Demo 5 (Code Review).

**CORE Prompt (Tree of Thought style):**
```
Context: In backend/auth.py, access tokens are 30-minute JWTs (HS256).
Refresh tokens are secrets.token_urlsafe(32), stored hashed (SHA256) in
User.refresh_token column. On /api/auth/logout, User.refresh_token is set
to None in the DB. However, the issued JWT access token remains valid until
its 30-minute expiry — get_current_user() in main.py decodes the JWT but
does NOT check any revocation list.

Objective: Evaluate THREE approaches to immediate token revocation on logout.
Do NOT implement yet — output the evaluation verdict and the selected
approach's data model only.

Branch A — In-memory Python set() in auth.py
  _blacklisted_tokens: set[str] = set()
  Consider: server restart behavior, multi-replica behavior, memory growth

Branch B — SQLAlchemy BlacklistedToken table (DB-persisted)
  Consider: fits existing models.py pattern? migration needed? cleanup?

Branch C — Accept the 30-minute access token window (no blacklist)
  Consider: refresh token IS wiped on logout — what is the actual risk window?
  Is 30-minute max exposure acceptable for this application?

Evaluate tradeoffs for: single FastAPI process, PostgreSQL in Docker,
SQLAlchemy ORM already in place.
```

**Expected Copilot Output:**
```python
## Tree of Thought Evaluation

### Branch A: In-memory set()
❌ REJECTED — Three critical failure modes:
1. Revocation list LOST on every server restart — revoked tokens become valid again
2. Does not work across multiple replicas (revoked in replica A, still valid in B)
3. Unbounded memory growth without TTL cleanup — storage leak over time

### Branch B: SQLAlchemy BlacklistedToken table
✅ SELECTED:
1. Persistent across restarts (stored in PostgreSQL)
2. Follows existing models.py SQLAlchemy pattern — zero new dependencies
3. Supports TTL via expires_at column → enables periodic cleanup
4. Reuses existing hash_token() from auth.py for consistent storage

### Branch C: Accept 30-min window
⚠️ ACCEPTABLE TRADEOFF for low-sensitivity use cases. The refresh token IS
already wiped on logout, preventing session continuation. Maximum exposure
window is 30 minutes.
Verdict: Use Branch B for production. Branch C is only appropriate for
demo/prototype environments where data is non-sensitive.

### Selected Data Model (Branch B):

# Add to backend/models.py

class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token_hash = Column(String, unique=True, index=True)  # SHA256 of token
    expires_at = Column(DateTime(timezone=True))           # Auto-cleanup boundary
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Required Alembic migration:
# alembic revision --autogenerate -m "Add blacklisted_tokens table"
```

> **Note**: This design decision is deliberately **not** implemented in the repo. Demo 5 (Code Review) reviews a PR that chose **Branch A** instead — you will catch the security flaw using Copilot Code Review.

---

### Teaching Points

| | **Tree of Thought** | **Chain-of-Thought** |
|---|---|---|
| **When to use** | Design decisions with multiple valid approaches | Known algorithm with complex implementation steps |
| **Prompt structure** | "Evaluate Branch A / B / C, select best, then implement" | "Step 1 → Step 2 → Step 3 → implement" |
| **Output** | Evaluation verdict + justified selection + scaffold | Direct implementation code |
| **Risk prevented** | First-solution bias, unexamined tradeoffs | Step omission, wrong assumptions |
| **Examples in this workshop** | Caching strategy (2A), token revocation (2B) | Fuel stops (1A), retry logic (1B), category filter (1C) |

**Key formula:**
```
Evaluate exactly THREE branches:
  Branch A — [Option]: Pros: [...] Cons: [...]
  Branch B — [Option]: Pros: [...] Cons: [...]
  Branch C — [Option]: Pros: [...] Cons: [...]
Select the best for [specific constraints].
Then implement the selected approach.
```

**When ToT vs CoT**: If you already know *what* to build → **Chain-of-Thought**. If you're uncertain *which* approach is best → **Tree of Thought** first.

---

## Demo 3: Instruction Files (10 min)

### Objective
Create path-specific instruction files using the `applyTo` frontmatter to enforce Python backend conventions automatically.

### Background: Instruction File Types (2025)
GitHub Copilot supports two levels of instruction files:

| Type | File Location | Scope |
|------|---------------|-------|
| **Repository-wide** | `.github/copilot-instructions.md` | All files in the repo |
| **Path-specific** | `.github/instructions/*.instructions.md` | Files matching `applyTo` glob pattern |

Path-specific instructions use YAML frontmatter with an `applyTo` field:
```yaml
---
applyTo: "backend/**/*.py"
---
```
This ensures the rules apply ONLY when Copilot is working on matching files.

### Scenario
Create a path-specific instruction file targeting the Python backend that enforces FastAPI, Pydantic, SQLAlchemy, and httpx conventions.

### Live Coding Steps

**Step 1: Create path-specific instruction file for the Python backend**

```markdown
<!-- .github/instructions/backend.instructions.md -->
---
applyTo: "backend/**/*.py"
---

# Python Backend Conventions (FastAPI + SQLAlchemy)

## Framework & Libraries
- **FastAPI** for all endpoints — define in `main.py` or extract to routers
- **Pydantic** for request/response validation — define models in `schemas.py`
- **SQLAlchemy** for ORM — define models in `models.py`, use `Session` via `Depends(get_db)`
- **httpx** for all external HTTP calls — always use `async with httpx.AsyncClient()`
- **python-jose** for JWT handling — see `auth.py` constants (ALGORITHM, SECRET_KEY)

## Endpoint Patterns
```python
# ✅ CORRECT — standard protected endpoint pattern
@app.post("/api/resource", response_model=schemas.ResourceResponse)
def create_resource(
    request: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Business logic in service module, NOT inline
    result = resource_service.create(request, current_user, db)
    return result

# ❌ WRONG — missing auth, inline business logic, no response_model
@app.post("/api/resource")
def create_resource(data: dict):
    db = database.SessionLocal()
    db.add(models.Resource(**data))
    db.commit()
```

## Error Handling
```python
# ✅ CORRECT — use HTTPException with specific status codes
from fastapi import HTTPException
raise HTTPException(status_code=404, detail="Trip not found")  # 404 for not found
raise HTTPException(status_code=400, detail="Invalid Google Token")  # 400 for bad input
raise HTTPException(status_code=500, detail="Mapbox token not configured")  # 500 for config

# ❌ WRONG — generic exceptions, bare raises
raise Exception("Something went wrong")
return {"error": "not found"}
```

## Coordinate Format (CRITICAL)
```python
# ✅ CORRECT — GeoJSON spec: [longitude, latitude]
coordinates = [position.get("lon"), position.get("lat")]
# See schemas.py POIResponse @field_validator: lng range -180..180, lat range -90..90

# ❌ WRONG — reversed order
coordinates = [position.get("lat"), position.get("lon")]
```

## Database Access
```python
# ✅ CORRECT — use Depends(get_db) for session injection
def read_trips(db: Session = Depends(get_db)):
    return db.query(models.Trip).all()

# ❌ WRONG — manual session management
def read_trips():
    db = database.SessionLocal()
    try:
        return db.query(models.Trip).all()
    finally:
        db.close()
```

## External API Calls
```python
# ✅ CORRECT — async httpx with context manager
async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.get(url, params=params)
    response.raise_for_status()

# ❌ WRONG — requests library or raw httpx without context manager
import requests
response = requests.get(url)
```

## Authentication
- Protected endpoints: `current_user: models.User = Depends(get_current_user)`
- Public endpoints: No `Depends(get_current_user)` parameter
- Token format: `Authorization: Bearer <JWT>` decoded with `python-jose`
- Refresh tokens: Generated via `secrets.token_urlsafe(32)`, stored hashed (SHA256) in DB
```

**Step 2: Create test-specific instruction file**

```markdown
<!-- .github/instructions/backend-tests.instructions.md -->
---
applyTo: "backend/tests/**/*.py"
---

# Python Backend Test Conventions (pytest)

## Fixture Pattern
- Load JSON fixtures from `tests/fixtures/` using `load_fixture()` from `conftest.py`
- Mock `httpx.AsyncClient` with `unittest.mock.patch` + `AsyncMock`
- Fixture names follow pattern: `mock_httpx_{service}_{scenario}` (e.g., `mock_httpx_geocode_success`)

## Mock Pattern for httpx
```python
# Standard pattern from conftest.py:
from unittest.mock import MagicMock, AsyncMock, patch

@pytest.fixture
def mock_httpx_example_success(fixture_data):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = fixture_data

    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client
```

## Test Structure
- One test file per module: `test_main.py`, `test_auth.py`, `test_vehicle_service.py`
- Use `TestClient` from `fastapi.testclient` for endpoint tests
- Assert on status codes, response structure, and specific field values
- Test both success AND error paths for every endpoint
```

### Teaching Points

| Feature | Repository-wide | Path-specific |
|---------|----------------|---------------|
| **File** | `.github/copilot-instructions.md` | `.github/instructions/*.instructions.md` |
| **Scope** | All files | Files matching `applyTo` glob |
| **Use case** | Coordinate format, architecture rules | Language-specific patterns |
| **Activation** | Always active | Only for matching files |
| **Example** | `[lng, lat]` everywhere | FastAPI `Depends()` in `backend/**/*.py` |

---

## Demo 4: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files with CORE framework for consistent Python code generation.

### Scenario
Create three prompt files: a FastAPI endpoint generator, a pytest test generator, and a Pydantic schema generator.

---

### Step 1: Create FastAPI Endpoint Prompt

```markdown
<!-- .github/prompts/fastapi-endpoint.prompt.md -->

# FastAPI Endpoint Generator (CORE Framework)

## Context
You are generating a FastAPI endpoint for the Road Trip Planner Python backend
(`backend/`). The backend uses:
- SQLAlchemy ORM with models in `models.py` (User, Trip, VehicleSpec)
- Pydantic schemas in `schemas.py` (TripCreate, TripUpdate, Trip, VehicleSpecsResponse, etc.)
- Service modules for business logic (`vehicle_service.py`, `ai_service.py`)
- `httpx.AsyncClient` for external API calls (Mapbox, Azure Maps)
- `get_db()` dependency for database sessions
- `get_current_user()` dependency for auth (decodes JWT, returns models.User)

## Objective
Generate a new API endpoint following the patterns in `main.py`.

## Requirements
- Define Pydantic request/response models in `schemas.py`
- Use service layer for business logic (NOT inline in route handler)
- Protected endpoints use `current_user: models.User = Depends(get_current_user)`
- Database access via `db: Session = Depends(get_db)`
- Use `HTTPException` with specific status codes (400, 401, 404, 500)
- External APIs go through httpx — never call Mapbox/Azure Maps directly from frontend
- Include `response_model` parameter on the decorator
- No hardcoded strings — define constants in a constants module
- All coordinates in GeoJSON format: [longitude, latitude]

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
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(models.Trip).filter(
        models.Trip.id == request.trip_id,
        models.Trip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    stats = vehicle_service.calculate_trip_stats(trip)
    return TripStatsResponse(**stats)
```

## Checklist
- [ ] Pydantic model for request and response
- [ ] `response_model=` on the route decorator
- [ ] Auth dependency (`get_current_user`) on protected routes
- [ ] Database via `Depends(get_db)` — never create sessions manually
- [ ] Service layer for logic — route handler is thin
- [ ] `HTTPException` with specific status codes
- [ ] Type hints on all parameters
```

---

### Step 2: Create pytest Test Prompt

```markdown
<!-- .github/prompts/pytest-test.prompt.md -->

# pytest Test Generator (CORE Framework)

## Context
You are generating pytest tests for the Road Trip Planner Python backend
(`backend/tests/`). The test infrastructure uses:
- `conftest.py` with shared fixtures: `load_fixture()` loads JSON from `tests/fixtures/`
- Mock pattern: `patch('httpx.AsyncClient')` with `MagicMock` + `AsyncMock`
- `TestClient` from `fastapi.testclient` for endpoint tests
- Fixture naming: `mock_httpx_{service}_{scenario}` (e.g., `mock_httpx_geocode_success`)
- Available JSON fixtures: `mapbox_geocode.json`, `mapbox_directions.json`,
  `mapbox_optimize.json`, `azure_maps_search.json`, `ai_service_vehicle.json`
  (each has a matching `*_error.json` variant)

## Objective
Generate pytest tests following the established patterns from `conftest.py` and
existing test files.

## Requirements
- Use existing `load_fixture()` helper for JSON response data
- Mock httpx using the established pattern from conftest.py:
  ```python
  mock_response = MagicMock()
  mock_response.status_code = 200
  mock_response.json.return_value = fixture_data
  with patch('httpx.AsyncClient') as mock_client:
      mock_client.return_value.__aenter__.return_value.get = AsyncMock(
          return_value=mock_response
      )
  ```
- Test both success (200) and error (4xx, 5xx) responses
- Use `TestClient(app)` for endpoint integration tests
- Assert on status codes, JSON structure, and specific field values
- NO real network calls — all external APIs must be mocked
- Name tests: `test_{endpoint}_{scenario}` (e.g., `test_geocode_success`)

## Examples

### Input
"Generate tests for the /api/geocode endpoint"

### Expected Output
```python
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock, patch
from main import app

client = TestClient(app)

def test_geocode_success(mock_httpx_geocode_success):
    response = client.get("/api/geocode?q=San Francisco")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data or "coordinates" in data

def test_geocode_missing_query():
    response = client.get("/api/geocode")
    assert response.status_code == 422  # FastAPI validation error

def test_geocode_api_error(mock_httpx_geocode_error):
    response = client.get("/api/geocode?q=test")
    assert response.status_code == 429
```

## Checklist
- [ ] Both success and error scenarios tested
- [ ] All external APIs mocked via `patch('httpx.AsyncClient')`
- [ ] JSON fixtures loaded via `load_fixture()` (from conftest.py)
- [ ] `TestClient(app)` for endpoint-level tests
- [ ] Meaningful assertion on response body, not just status code
- [ ] No network calls — tests run fully offline
```

---

### Step 3: Create Pydantic Schema Prompt

```markdown
<!-- .github/prompts/pydantic-schema.prompt.md -->

# Pydantic Schema Generator (CORE Framework)

## Context
You are generating Pydantic models for the Road Trip Planner Python backend
(`backend/schemas.py`). Existing schemas include:
- `VehicleSpecsResponse` — camelCase fields (fuelType, mpg) for frontend compatibility
- `POIResponse` — uses `@field_validator` for coordinate validation ([lng, lat] ranges)
- `Trip` / `TripCreate` / `TripUpdate` — CRUD pattern with `model_config = ConfigDict(from_attributes=True)` for ORM
- `Token` — auth response with nested `UserInfo`

## Objective
Generate new Pydantic models matching existing schema patterns.

## Requirements
- Import from `pydantic`: `BaseModel`, `ConfigDict`, `Field`, `field_validator`
- ORM-backed models: Add `model_config = ConfigDict(from_attributes=True)`
- Use `Field(...)` for required fields with descriptions
- Use `Optional[T] = None` for optional fields (not `T | None`)
- Coordinates always validated: longitude -180..180, latitude -90..90
- Use camelCase field names where frontend consumption requires it
- Include docstrings on complex models
- Create Base/Create/Update/Read variants for CRUD resources

## Examples

### Input
"Create schemas for a FuelStop resource with name, coordinates, fuel_type, price, and rating."

### Expected Output
```python
class FuelStopBase(BaseModel):
    """Base schema for fuel stop data"""
    name: str = Field(..., max_length=200, description="Station name")
    coordinates: Tuple[float, float] = Field(..., description="(longitude, latitude)")
    fuel_type: str = Field(..., description="gas, diesel, or electric")
    price_per_gallon: Optional[float] = Field(None, ge=0, description="Price in USD")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="User rating")

    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, v: Tuple[float, float]) -> Tuple[float, float]:
        longitude, latitude = v
        if not -180 <= longitude <= 180:
            raise ValueError(f"Longitude must be between -180 and 180, got {longitude}")
        if not -90 <= latitude <= 90:
            raise ValueError(f"Latitude must be between -90 and 90, got {latitude}")
        return v

class FuelStopCreate(FuelStopBase):
    pass

class FuelStop(FuelStopBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
```

## Checklist
- [ ] Base / Create / Read model variants
- [ ] `Field(...)` with descriptions on all fields
- [ ] `@field_validator` for coordinates (lng/lat ranges)
- [ ] `ConfigDict(from_attributes=True)` for ORM models
- [ ] `Optional[T] = None` pattern for optional fields
- [ ] Docstring on the base model
```

---

### Step 4: Use a Prompt File in Chat

```
# In Copilot Chat:
#file:.github/prompts/fastapi-endpoint.prompt.md

Create a GET /api/trips/{trip_id}/stops endpoint that returns
all stops for a given trip, enriched with distance-from-previous-stop
calculated from the route_geojson field.
```

### Teaching Points

| Prompt File | Target Pattern | Key Schema Reference |
|-------------|---------------|---------------------|
| `fastapi-endpoint.prompt.md` | Endpoint + `Depends()` DI | `get_db()`, `get_current_user()` |
| `pytest-test.prompt.md` | Tests + mocked httpx | `conftest.py`, `load_fixture()` |
| `pydantic-schema.prompt.md` | Schema + validators | `POIResponse`, `ConfigDict` |

---

## Demo 5: Copilot Code Review (10 min)

### Objective
Use Copilot to review pull requests focusing on Python security, authentication patterns, and JWT best practices.

### Scenario
Review a PR that adds a token blacklist feature to `auth.py` and updates the refresh token rotation logic in `main.py`.

### Live Coding Steps

**Step 1: Invoke Copilot Code Review with CORE Prompt**
```
Context: A PR adds token blacklisting to the Python backend's auth system:
- backend/auth.py — stores blacklisted JWTs in a set, adds check_blacklist()
- backend/main.py — updates /api/auth/logout to blacklist the current token,
  updates /api/auth/refresh to rotate tokens and blacklist the old one

Current auth architecture:
- auth.py: create_access_token() using python-jose (HS256), create_refresh_token()
  using secrets.token_urlsafe(32), hash_token() using SHA256,
  verify_refresh_token() compares hash
- main.py: get_current_user() decodes JWT, queries User by email
- Access tokens expire in 30 minutes, refresh tokens in 7 days
- Refresh tokens stored hashed in User.refresh_token column

Objective: Review for security vulnerabilities, correctness, and pattern adherence.

Requirements: Check for
1. In-memory blacklist won't survive restarts — needs persistence
2. Blacklist growth is unbounded — needs TTL cleanup
3. Refresh token rotation must invalidate the old token
4. Hash comparison must be timing-safe to prevent timing attacks
5. Missing test coverage for new auth flows
6. Hardcoded strings (should use constants)

Examples of issues to flag:
- Using a Python set() for blacklist (not persistent, lost on restart)
- Not cleaning up expired tokens from the blacklist
- Plain string comparison instead of hmac.compare_digest()
```

**Step 2: Expected Copilot Review Output**
```markdown
## Code Review: Token Blacklist Feature

### 🔴 Critical Issues

**1. In-memory blacklist is not persistent (auth.py:15)**
```python
# ❌ Current code
_blacklisted_tokens: set[str] = set()

def blacklist_token(token: str):
    _blacklisted_tokens.add(token)

# ✅ Fix: Store in database or Redis
# Option A — Database (matches existing pattern with User.refresh_token):
class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"
    id = Column(Integer, primary_key=True)
    token_hash = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)

# Option B — Use existing models.py pattern for consistency
```

**2. Timing-safe comparison missing (auth.py:42)**
```python
# ❌ Current — vulnerable to timing attacks
def verify_refresh_token(token: str, hashed_token: str) -> bool:
    return hash_token(token) == hashed_token

# ✅ Fix — use hmac.compare_digest for constant-time comparison
import hmac

def verify_refresh_token(token: str, hashed_token: str) -> bool:
    return hmac.compare_digest(hash_token(token), hashed_token)
```

**3. Unbounded blacklist growth (auth.py:18)**
```python
# ❌ Current — blacklist grows forever, memory leak
def blacklist_token(token: str):
    _blacklisted_tokens.add(token)

# ✅ Fix — store with expiry, clean up periodically
def blacklist_token(token: str, expires_at: datetime):
    db_token = BlacklistedToken(
        token_hash=hash_token(token),
        expires_at=expires_at,
    )
    db.add(db_token)
    db.commit()
```

### 🟡 Warnings

**4. Refresh token not blacklisted during rotation (main.py:135)**
```python
# ❌ Current — old refresh token still valid after rotation
@app.post("/api/auth/refresh")
def refresh_token(request: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    # ... generates new tokens but doesn't invalidate old refresh token

# ✅ Fix — invalidate old refresh token hash before storing new one
    user.refresh_token = auth.hash_token(new_refresh_token)
    # Old hash is overwritten → old token is implicitly invalidated ✅
    # But: add explicit blacklist of the access token too
```

**5. Hardcoded strings in error messages (main.py:140)**
```python
# ❌ Current — inline string
raise HTTPException(status_code=401, detail="Invalid refresh token")

# ✅ Fix — use constants (per copilot-instructions.md)
# backend/constants.py
class ErrorMessages:
    INVALID_REFRESH_TOKEN = "Invalid refresh token"
    TOKEN_EXPIRED = "Token has expired"
    TOKEN_BLACKLISTED = "Token has been revoked"
```

### 🟢 Suggestions

**6. Add test coverage for new auth flows**
Missing tests for:
- `test_logout_blacklists_token` — verify token rejected after logout
- `test_refresh_rotates_tokens` — old refresh token invalid after rotation
- `test_blacklisted_token_rejected` — get_current_user rejects blacklisted JWT

Use the existing mock pattern from `conftest.py`:
```python
def test_logout_blacklists_token():
    # Login → get token → logout → try using same token → 401
    ...
```

### Summary
- 3 critical issues (must fix before merge)
- 2 warnings (should fix)
- 1 suggestion (test coverage)
```

### Teaching Points

| Review Focus | What to Check | Reference |
|-------------|---------------|-----------|
| Token security | Timing-safe comparison, hash storage | `auth.py` `hash_token()`, `verify_refresh_token()` |
| Persistence | In-memory vs DB-backed storage | `models.py` SQLAlchemy pattern |
| Token lifecycle | Rotation, revocation, expiry | `create_access_token()`, `create_refresh_token()` |
| Constants | No hardcoded error strings | `.github/copilot-instructions.md` rules |
| Test coverage | Auth flows need tests | `conftest.py` mock patterns |

---

## Demo 6: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect a comprehensive test coverage strategy using real fixtures and mock patterns from the codebase.

### Scenario
Plan to achieve 100% mocked tests for ALL Python backend endpoints, eliminating any real API calls from the test suite (Issue #4: CI pipeline has `continueOnError: true` because tests hit real APIs).

### Live Coding Steps

**Step 1: Invoke Plan Mode with CORE prompt**
```
Context: The Python backend (backend/) has partial test coverage:
- backend/tests/conftest.py defines load_fixture() and 22 fixtures:
  - mock_httpx_geocode_success/error (Mapbox geocoding)
  - mock_httpx_directions_success/error (Mapbox directions)
  - mock_httpx_optimize_success/error (Mapbox optimization)
  - mock_httpx_search_success/error (Azure Maps search)
  - mock_httpx_ai_success/error (C# AI microservice via httpx)
- backend/tests/fixtures/ has 10 JSON files:
  mapbox_geocode.json, mapbox_geocode_error.json,
  mapbox_directions.json, mapbox_directions_error.json,
  mapbox_optimize.json, mapbox_optimize_error.json,
  azure_maps_search.json, azure_maps_search_error.json,
  ai_service_vehicle.json, ai_service_vehicle_error.json
- Some endpoints still hit real Mapbox/Azure APIs in tests
- CI pipeline (.github/workflows/backend.yml) has continueOnError: true

Key mock pattern from conftest.py:
  mock_response = MagicMock()
  mock_response.status_code = 200
  mock_response.json.return_value = load_fixture("mapbox_geocode.json")
  with patch('httpx.AsyncClient') as mock_client:
      mock_client.return_value.__aenter__.return_value.get = AsyncMock(
          return_value=mock_response
      )

Endpoints that need verified mock coverage:
1. GET /api/geocode?q= — calls Mapbox geocoding
2. GET /api/directions?coords=...&profile=... — calls Mapbox directions
3. GET /api/search?query=...&lat=...&lon=... — calls Azure Maps
4. GET /api/optimize?coords=... — calls Mapbox optimization
5. POST /api/vehicle-specs — calls ai_service → C# backend via httpx
6. POST /api/auth/google — calls Google OAuth token verification
7. POST /api/auth/refresh — reads User.refresh_token from DB
8. POST /api/trips — DB write (needs test DB session)
9. GET /api/trips — DB read (needs auth + test data)
10. GET /api/public-trips — public DB read (no auth needed)

Objective: Create a phased plan to achieve 100% mocked tests with zero network calls.

Requirements:
- Python: Use unittest.mock.patch with httpx (existing conftest.py pattern)
- Use load_fixture() for response data — no inline JSON blobs
- Test both success AND error for every endpoint
- Mock Google OAuth with patch on google.oauth2.id_token.verify_oauth2_token
- Use SQLite in-memory DB for trip CRUD tests (existing database.py pattern)
- After plan execution: remove continueOnError from CI

Examples of existing passing test:
  def test_geocode_success(mock_httpx_geocode_success):
      response = client.get("/api/geocode?q=San Francisco")
      assert response.status_code == 200
```

**Step 2: Review generated plan**
```markdown
## Plan: Complete Python Backend Test Coverage (Zero Network Calls)

### Phase 1: Audit Existing Coverage (10 min)
☐ 1.1 Run `pytest tests/ -v --tb=short` — catalog which tests pass/fail
☐ 1.2 Run `pytest tests/ -v --tb=short 2>&1 | grep "FAILED\|ERROR"` — identify tests hitting real APIs
☐ 1.3 Verify all 10 conftest.py fixtures work: `pytest tests/conftest.py --collect-only`

### Phase 2: Add Missing Auth Mocks (15 min)
☐ 2.1 Create `tests/fixtures/google_oauth_token.json` — mock Google id_info response:
```json
{
  "iss": "accounts.google.com",
  "sub": "google_user_123",
  "email": "test@example.com",
  "name": "Test User",
  "picture": "https://example.com/photo.jpg"
}
```

☐ 2.2 Add fixtures to `conftest.py`:
```python
@pytest.fixture
def mock_google_oauth_success():
    """Mock successful Google OAuth token verification"""
    id_info = load_fixture("google_oauth_token.json")
    with patch('auth.verify_google_token', return_value=id_info):
        yield id_info

@pytest.fixture
def mock_google_oauth_failure():
    """Mock failed Google OAuth verification"""
    with patch('auth.verify_google_token', return_value=None):
        yield
```

☐ 2.3 Add DB session fixture for trip CRUD tests:
```python
@pytest.fixture
def test_db():
    """In-memory SQLite database for isolated test runs"""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    engine = create_engine("sqlite:///:memory:")
    models.Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
```

### Phase 3: Write Missing Tests (30 min)

☐ 3.1 `test_auth.py` — Auth endpoint tests:
| Test | Fixture | Assertion |
|------|---------|-----------|
| `test_google_login_success` | `mock_google_oauth_success` | 200, Token with access_token + refresh_token |
| `test_google_login_invalid_token` | `mock_google_oauth_failure` | 400, "Invalid Google Token" |
| `test_guest_login_creates_user` | `test_db` | 200, Token with is_guest=True |
| `test_refresh_token_success` | `test_db` + valid refresh | 200, new Token pair |
| `test_refresh_token_expired` | `test_db` + expired token | 401 |
| `test_logout_clears_refresh` | `test_db` | 200, User.refresh_token = None |

☐ 3.2 Extend existing `test_trips.py` — Trip CRUD tests:
| Test | Fixture | Assertion |
|------|---------|-----------|
| `test_create_trip` | `test_db`, auth mock | 200, Trip with user_id |
| `test_read_trips_own_only` | `test_db`, 2 users | Only own trips returned |
| `test_update_trip_is_public` | `test_db` | is_public toggled |
| `test_delete_trip_not_found` | `test_db` | 404 |
| `test_public_trips_no_auth` | `test_db`, featured trips | 200, no auth required |

☐ 3.3 `test_external_apis.py` — All external API mocks:
| Test | Fixture | Assert |
|------|---------|--------|
| `test_geocode_success` | `mock_httpx_geocode_success` | 200, coordinates present |
| `test_geocode_rate_limited` | `mock_httpx_geocode_error` | 429 |
| `test_directions_success` | `mock_httpx_directions_success` | 200, routes in response |
| `test_directions_bad_coords` | `mock_httpx_directions_error` | 400 |
| `test_search_success` | `mock_httpx_search_success` | 200, features array |
| `test_search_api_error` | `mock_httpx_search_error` | Error status |
| `test_optimize_success` | `mock_httpx_optimize_success` | 200, trips in response |
| `test_optimize_error` | `mock_httpx_optimize_error` | Error status |
| `test_vehicle_specs_ai_success` | `mock_httpx_ai_success` | 200, VehicleSpecsResponse |
| `test_vehicle_specs_ai_fallback` | `mock_httpx_ai_error` | 200, DEFAULT_VEHICLE_SPECS |

### Phase 4: Verify & CI Cleanup (10 min)
☐ 4.1 Run full suite: `cd backend && pytest tests/ -v --tb=short`
☐ 4.2 Verify zero network calls: `pytest tests/ -v --timeout=5` (all must pass in <5s)
☐ 4.3 Run coverage: `pytest tests/ --cov=. --cov-report=html`
☐ 4.4 Remove `continueOnError: true` from `.github/workflows/backend.yml`
☐ 4.5 Push and verify CI passes

### Success Criteria
✅ All endpoints have both success and error test cases
✅ Zero network calls — all external APIs mocked via conftest.py fixtures
✅ Test runtime < 10 seconds total
✅ Coverage > 80% on main.py, auth.py, vehicle_service.py, ai_service.py
✅ CI pipeline runs without continueOnError
```

### Teaching Points

| Plan Mode Element | Purpose |
|------------------|---------|
| Phased by concern | Audit → mocks → tests → CI cleanup |
| Fixture tables | Clear mapping from test to mock to assertion |
| Real file references | `conftest.py`, `load_fixture()`, exact fixture filenames |
| Verification commands | `pytest -v`, `--cov`, `--timeout` |
| Success criteria | Measurable definition of done |

---

## Demo 7: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file refactoring tasks to Copilot's coding agent.

### Scenario
Use the coding agent to standardize error handling across the Python backend — create a missing `constants.py`, add a custom exception handler, and replace all hardcoded error strings in `main.py`.

> **Note**: The project's `.github/copilot-instructions.md` requires that all literal strings be externalized to constants files. The Python backend currently has no `backend/constants.py` file — this is known technical debt.

### Live Coding Steps

**Step 1: Invoke Copilot Coding Agent with CORE prompt**
```
Context: The Python backend (backend/) has inconsistent error handling:
- main.py uses HTTPException with inline string messages, e.g.:
  - raise HTTPException(status_code=404, detail="Trip not found")
  - raise HTTPException(status_code=400, detail="Invalid Google Token")
  - raise HTTPException(status_code=500, detail="Mapbox token not configured")
  - raise HTTPException(status_code=500, detail="Azure Maps key not configured")
- auth.py has hardcoded strings for token errors
- copilot-instructions.md requires: "All literal strings must be externalized"
- No backend/constants.py file exists yet

Key files:
- backend/main.py (~395 lines) — ~18 API endpoints with inline error strings
- backend/auth.py (~65 lines) — token creation/validation with inline strings
- backend/schemas.py — Pydantic models (do NOT modify)
- backend/vehicle_service.py — service module (do NOT modify)

Objective: Standardize all error handling with three changes:
1. Create backend/constants.py with all error message constants
2. Add a custom exception handler using @app.exception_handler in main.py
3. Replace all inline HTTPException detail strings with constants

Requirements:
1. Create backend/constants.py with an ErrorMessages class:
   - TRIP_NOT_FOUND, INVALID_GOOGLE_TOKEN, MAPBOX_TOKEN_MISSING,
     AZURE_MAPS_KEY_MISSING, INVALID_CREDENTIALS, INVALID_REFRESH_TOKEN
2. Add a custom AppError exception class in constants.py
3. Add @app.exception_handler(AppError) to main.py that returns consistent JSON:
   {"error": "<ERROR_CODE>", "message": "<detail>", "statusCode": <int>}
4. Replace inline strings in main.py with ErrorMessages.* constants
5. Do NOT modify schemas.py, models.py, or test files
6. Do NOT change existing response_model decorators or Depends() patterns

Examples:
- Before: raise HTTPException(status_code=404, detail="Trip not found")
  After:  raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)

- Before: raise HTTPException(status_code=500, detail="Mapbox token not configured")
  After:  raise HTTPException(status_code=500, detail=ErrorMessages.MAPBOX_TOKEN_MISSING)

Report progress after each file change.
```

**Step 2: Expected Agent Output**
```markdown
## Agent Progress Report

### File 1: Created `backend/constants.py`
```python
"""Centralized constants for the Python backend (per copilot-instructions.md)"""


class ErrorMessages:
    """Error message constants — externalized from inline strings"""
    TRIP_NOT_FOUND = "Trip not found"
    INVALID_GOOGLE_TOKEN = "Invalid Google Token"
    INVALID_CREDENTIALS = "Could not validate credentials"
    INVALID_REFRESH_TOKEN = "Invalid or expired refresh token"
    TOKEN_EXPIRED = "Token has expired"
    MAPBOX_TOKEN_MISSING = "Mapbox token not configured"
    AZURE_MAPS_KEY_MISSING = "Azure Maps key not configured"
    UNAUTHORIZED = "Authentication required"


class VehicleTypes:
    """Vehicle type constants matching DEFAULT_VEHICLE_SPECS keys"""
    CAR = "car"
    SUV = "suv"
    MINI_VAN = "mini_van"
    VAN = "van"
    TRUCK = "truck"
    RV_SMALL = "rv_small"
    RV_LARGE = "rv_large"
    EV_SEDAN = "ev_sedan"
    EV_TRUCK = "ev_truck"


class StopTypes:
    """Trip stop type constants"""
    START = "start"
    END = "end"
    WAYPOINT = "stop"


class FuelTypes:
    """Fuel type constants matching VehicleSpecsResponse.fuelType"""
    GAS = "gas"
    DIESEL = "diesel"
    ELECTRIC = "electric"
```

**Status**: ✅ Created

---

### File 2: Updated `backend/main.py` — Added exception handler + replaced 8 inline strings

```python
# Added import
from constants import ErrorMessages

# Added custom exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail.upper().replace(" ", "_") if isinstance(exc.detail, str) else "UNKNOWN_ERROR",
            "message": exc.detail,
            "statusCode": exc.status_code,
        },
    )

# Replaced inline strings:
# Line 35: detail="Could not validate credentials" → detail=ErrorMessages.INVALID_CREDENTIALS
# Line 98: detail="Invalid Google Token" → detail=ErrorMessages.INVALID_GOOGLE_TOKEN
# Line 175: detail="Mapbox token not configured" → detail=ErrorMessages.MAPBOX_TOKEN_MISSING
# Line 210: detail="Azure Maps key not configured" → detail=ErrorMessages.AZURE_MAPS_KEY_MISSING
# Line 280: detail="Trip not found" → detail=ErrorMessages.TRIP_NOT_FOUND (×3 occurrences)
# Line 345: detail="Invalid or expired refresh token" → detail=ErrorMessages.INVALID_REFRESH_TOKEN
```

**Status**: ✅ Updated (8 replacements)

---

### Summary
| File | Action | Changes |
|------|--------|---------|
| `backend/constants.py` | Created | 4 constant classes, 15 constants |
| `backend/main.py` | Updated | 1 exception handler, 8 string replacements |
| `backend/auth.py` | Not modified | String constants referenced from main.py |
| `backend/schemas.py` | Not modified | Per requirements |
| `backend/models.py` | Not modified | Per requirements |

**Verification**:
```bash
cd backend
python -c "from constants import ErrorMessages; print(ErrorMessages.TRIP_NOT_FOUND)"
pytest tests/ -v --tb=short
```
```

### Teaching Points

| Agent Capability | What It Did |
|-----------------|-------------|
| File creation | Created `constants.py` from scratch with typed constants |
| Multi-site edits | Replaced 8 inline strings across `main.py` |
| Pattern adherence | Followed `copilot-instructions.md` string externalization rule |
| Boundary respect | Did NOT modify `schemas.py`, `models.py`, or tests |

**Coding Agent Prompt Best Practices (CORE)**:
```
Context:  List ALL affected files with current patterns and line-level detail
Objective: Clear deliverable — what the codebase should look like after
Requirements: Explicit boundaries — what NOT to change is as important as what to change
Examples: Before/after for each transformation showing exact code
```

---

## Demo 8: Copilot Agent HQ (10 min)

### Objective
Create and use a custom agent specialized for auditing Python FastAPI endpoints.

### Scenario
Create a `@python-api-auditor` agent that validates endpoint patterns, schema consistency, and auth dependency usage across the Python backend.

### Live Coding Steps

**Step 1: Create custom agent definition**

```markdown
<!-- .github/agents/python-api-auditor.md -->

# Python API Auditor Agent

## Identity
You are a specialized agent for auditing the Road Trip Planner Python backend
(FastAPI + SQLAlchemy + Pydantic). You validate endpoint correctness, security,
and adherence to project conventions.

## Expertise
- FastAPI endpoint patterns: `@app.get/post/put/delete` with `response_model`
- Pydantic schema validation: request/response models in `schemas.py`
- SQLAlchemy ORM: dependency injection via `Depends(get_db)`
- Authentication: `Depends(get_current_user)` pattern from `main.py`
- External API calls: `httpx.AsyncClient` with proper error handling
- Coordinate format: GeoJSON `[longitude, latitude]` per `POIResponse` validator

## Rules
1. Every POST/PUT/DELETE endpoint MUST have `Depends(get_current_user)` unless explicitly public
2. Every endpoint MUST have a `response_model` parameter on its decorator
3. All error responses MUST use `HTTPException` with specific status codes (not generic 500)
4. Database access MUST use `Depends(get_db)` — never manual `SessionLocal()`
5. External API calls MUST use `async with httpx.AsyncClient()` — never `requests` library
6. All coordinates MUST follow `[longitude, latitude]` GeoJSON format
7. Business logic MUST be in service modules — route handlers should be thin
8. No hardcoded strings — error messages from constants

## Behaviors
When asked to audit:
1. Scan `main.py` for all `@app.get/post/put/delete` decorators
2. For each endpoint, check:
   a. `response_model=` present on decorator
   b. Auth dependency present (if not explicitly public)
   c. DB access via `Depends(get_db)` (if endpoint queries DB)
   d. Error handling uses `HTTPException` with specific codes
   e. External calls use httpx with error handling
3. Cross-reference schemas in `schemas.py` — every `response_model` must exist
4. Check Pydantic models have proper validators (coordinates, required fields)
5. Report findings in structured table format

## Example Invocation
```
@python-api-auditor Audit all endpoints in backend/main.py for security and pattern compliance
```

## Output Format
```
## Python API Audit Report

### Endpoint Inventory
| Method | Path | response_model | Auth | DB | Status |
|--------|------|---------------|------|-----|--------|

### 🔴 Critical Issues
### 🟡 Warnings
### 🟢 Suggestions
### Summary Statistics
```
```

**Step 2: Invoke the custom agent**
```
@python-api-auditor Audit all endpoints in backend/main.py.

Cross-reference:
- backend/main.py (all endpoint definitions)
- backend/schemas.py (Pydantic models used as response_model)
- backend/auth.py (authentication functions)
- backend/models.py (SQLAlchemy models)
```

**Step 3: Expected agent response**
```markdown
## Python API Audit Report

### Files Analyzed
| File | Items Found |
|------|------------|
| `backend/main.py` | 17 endpoints |
| `backend/schemas.py` | 13 Pydantic models |
| `backend/models.py` | 3 SQLAlchemy models |
| `backend/auth.py` | 6 auth functions |

### Endpoint Inventory

| Method | Path | response_model | Auth | DB | Status |
|--------|------|---------------|------|-----|--------|
| GET | `/health` | ❌ None | Public ✅ | No | 🟡 |
| GET | `/api/health` | ❌ None | Public ✅ | Yes | 🟡 |
| POST | `/api/auth/google` | `schemas.Token` ✅ | Public ✅ | Yes | ✅ |
| POST | `/api/auth/guest` | `schemas.Token` ✅ | Public ✅ | Yes | ✅ |
| POST | `/api/auth/refresh` | `schemas.Token` ✅ | Public ✅ | Yes | ✅ |
| POST | `/api/auth/logout` | ❌ None | Protected ✅ | Yes | 🟡 |
| POST | `/api/vehicle-specs` | `VehicleSpecsResponse` ✅ | Public ⚠️ | No | 🟡 |
| GET | `/api/geocode` | ❌ None | Public ✅ | No | 🟡 |
| GET | `/api/directions` | ❌ None | Public ✅ | No | 🟡 |
| GET | `/api/search` | ❌ None | Public ✅ | No | 🟡 |
| GET | `/api/optimize` | ❌ None | Public ✅ | No | 🟡 |
| POST | `/api/trips` | `schemas.Trip` ✅ | Protected ✅ | Yes | ✅ |
| GET | `/api/trips` | `list[schemas.Trip]` ✅ | Protected ✅ | Yes | ✅ |
| GET | `/api/trips/{trip_id}` | `schemas.Trip` ✅ | Protected ✅ | Yes | ✅ |
| PUT | `/api/trips/{trip_id}` | `schemas.Trip` ✅ | Protected ✅ | Yes | ✅ |
| DELETE | `/api/trips/{trip_id}` | ❌ None | Protected ✅ | Yes | 🟡 |
| GET | `/api/public-trips` | `list[schemas.Trip]` ✅ | Public ✅ | Yes | ✅ |

### 🔴 Critical Issues (0)
No critical security issues found.

### 🟡 Warnings (7)

**1. Missing `response_model` on 7 endpoints**
These endpoints return untyped responses — Copilot and API docs won't
know the response shape:
- `/health` — should return a health schema
- `/api/health` — should return a detailed health schema
- `/api/auth/logout` — returns `{"ok": True}`, needs schema
- `/api/geocode` — returns raw Mapbox JSON, needs schema
- `/api/directions` — returns raw Mapbox JSON, needs schema
- `/api/search` — returns GeoJSON features, needs schema
- `/api/optimize` — returns raw Mapbox JSON, needs schema

**Fix**: Add `response_model=` to each decorator:
```python
@app.get("/api/geocode", response_model=schemas.GeocodingResponse)
```

**2. `/api/vehicle-specs` has no auth protection**
```python
# Current — any unauthenticated user can query vehicle specs
@app.post("/api/vehicle-specs")
def get_vehicle_specs_endpoint(request: VehicleTypeRequest):

# Consider — should this be protected?
# Not critical (no user data), but could protect against abuse
```

### 🟢 Suggestions

**3. `DELETE /api/trips/{trip_id}` returns `{"ok": True}` — use 204 No Content**
```python
# Current
return {"ok": True}

# Suggested
from starlette.responses import Response
return Response(status_code=204)
```

**4. Health check endpoint uses raw SQL string**
```python
# Current (main.py)
db.execute("SELECT 1")

# Suggested — use SQLAlchemy text()
from sqlalchemy import text
db.execute(text("SELECT 1"))
```

### Summary Statistics
- 17 total endpoints scanned
- 8 with `response_model` ✅ (47%)
- 6 protected with auth ✅
- 10 public endpoints ✅ (appropriate for health/geo/auth)
- 7 missing `response_model` 🟡
- 0 critical security issues 🔴
```

### Teaching Points

| Agent Feature | Purpose |
|--------------|---------|
| Specialized expertise | Deep Python/FastAPI knowledge |
| Structured output | Endpoint inventory table + issue categories |
| Cross-file analysis | Validates `main.py` endpoints against `schemas.py` models |
| Actionable fixes | Code snippets showing exact changes |

**Custom Agent Structure (CORE-aligned):**
```markdown
# Agent Name

## Identity   — Context (who the agent is)
## Expertise  — Context (what it knows)
## Rules      — Requirements (what it enforces)
## Behaviors  — Objective (how it acts)
## Example    — Examples (how to invoke it)
## Output     — Examples (what it returns)
```

---

## Demo 9: Architecture & Tech Stack Generation (10 min)

### Objective
Use Copilot to generate test infrastructure and architectural decision records using real project context.

### Scenario
Generate a complete test file for `auth.py` token lifecycle, and an ADR for adding a background job to clean up guest users.

---

### Step 1: Generate Auth Test Infrastructure with CORE Prompt

```
Context: The Python backend auth system (backend/auth.py) has these functions:
- verify_google_token(token: str) — validates Google OAuth JWT, returns id_info or None
- create_access_token(data: dict, expires_delta: Optional[timedelta]) — creates JWT
  with HS256, SECRET_KEY, default 30-minute expiry
- create_refresh_token() — returns secrets.token_urlsafe(32)
- hash_token(token: str) -> str — SHA256 hex digest
- verify_refresh_token(token: str, hashed_token: str) -> bool — compares hash
- decode_token(token: str) -> Optional[dict] — decodes JWT, returns payload or None

Constants: SECRET_KEY (from env), ALGORITHM = "HS256",
  ACCESS_TOKEN_EXPIRE_MINUTES = 30, REFRESH_TOKEN_EXPIRE_DAYS = 7

The existing test infrastructure in conftest.py uses:
- load_fixture() for JSON test data
- MagicMock + AsyncMock for httpx mocks
- patch() context manager pattern

No test file for auth.py exists yet.

Objective: Generate backend/tests/test_auth.py with complete coverage of token
lifecycle: creation, validation, expiration, refresh, and hash verification.

Requirements:
- Use pytest (project standard — see pytest.ini)
- Mock Google OAuth: patch('google.oauth2.id_token.verify_oauth2_token')
- Test token creation with custom expiry and default expiry
- Test token expiration by setting expire to past datetime
- Test hash_token produces consistent SHA256 output
- Test verify_refresh_token with matching and non-matching hashes
- Test decode_token with valid, expired, and tampered tokens
- No network calls — all Google OAuth mocked

Examples:
- create_access_token({"sub": "user@test.com"}) → decodable JWT with "sub" claim
- hash_token("abc123") → SHA256 of "abc123"
- verify_refresh_token("abc", hash_token("abc")) → True
- verify_refresh_token("abc", hash_token("xyz")) → False
- decode_token(expired_jwt) → None
```

**Expected Copilot Output:**
```python
# backend/tests/test_auth.py

import pytest
from datetime import timedelta, datetime, UTC
from unittest.mock import patch, MagicMock
from jose import jwt

import auth


class TestCreateAccessToken:
    """Test JWT access token creation"""

    def test_creates_valid_jwt(self):
        token = auth.create_access_token({"sub": "user@test.com"})
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        assert payload["sub"] == "user@test.com"
        assert "exp" in payload

    def test_custom_expiry(self):
        token = auth.create_access_token(
            {"sub": "user@test.com"},
            expires_delta=timedelta(minutes=5),
        )
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
        assert exp > datetime.now(UTC)
        assert exp < datetime.now(UTC) + timedelta(minutes=6)

    def test_default_30_minute_expiry(self):
        token = auth.create_access_token({"sub": "user@test.com"})
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
        expected_max = datetime.now(UTC) + timedelta(minutes=31)
        assert exp < expected_max


class TestCreateRefreshToken:
    """Test refresh token generation"""

    def test_generates_url_safe_string(self):
        token = auth.create_refresh_token()
        assert isinstance(token, str)
        assert len(token) > 20  # secrets.token_urlsafe(32) produces ~43 chars

    def test_generates_unique_tokens(self):
        tokens = {auth.create_refresh_token() for _ in range(10)}
        assert len(tokens) == 10  # All unique


class TestHashToken:
    """Test SHA256 token hashing"""

    def test_consistent_hash(self):
        assert auth.hash_token("abc123") == auth.hash_token("abc123")

    def test_different_inputs_different_hashes(self):
        assert auth.hash_token("abc") != auth.hash_token("xyz")

    def test_returns_hex_string(self):
        result = auth.hash_token("test")
        assert len(result) == 64  # SHA256 hex digest is always 64 chars
        assert all(c in "0123456789abcdef" for c in result)


class TestVerifyRefreshToken:
    """Test refresh token verification"""

    def test_valid_token_matches(self):
        token = "test_refresh_token"
        hashed = auth.hash_token(token)
        assert auth.verify_refresh_token(token, hashed) is True

    def test_wrong_token_fails(self):
        hashed = auth.hash_token("correct_token")
        assert auth.verify_refresh_token("wrong_token", hashed) is False


class TestDecodeToken:
    """Test JWT decoding and validation"""

    def test_valid_token_decoded(self):
        token = auth.create_access_token({"sub": "user@test.com"})
        payload = auth.decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user@test.com"

    def test_expired_token_returns_none(self):
        token = auth.create_access_token(
            {"sub": "user@test.com"},
            expires_delta=timedelta(seconds=-1),
        )
        assert auth.decode_token(token) is None

    def test_tampered_token_returns_none(self):
        token = auth.create_access_token({"sub": "user@test.com"})
        tampered = token[:-5] + "XXXXX"
        assert auth.decode_token(tampered) is None

    def test_garbage_input_returns_none(self):
        assert auth.decode_token("not.a.jwt") is None


class TestVerifyGoogleToken:
    """Test Google OAuth token verification"""

    @patch("auth.id_token.verify_oauth2_token")
    def test_valid_google_token(self, mock_verify):
        mock_verify.return_value = {
            "iss": "accounts.google.com",
            "sub": "google_123",
            "email": "user@gmail.com",
        }
        result = auth.verify_google_token("valid_token")
        assert result["email"] == "user@gmail.com"
        assert result["sub"] == "google_123"

    @patch("auth.id_token.verify_oauth2_token")
    def test_invalid_google_token(self, mock_verify):
        mock_verify.side_effect = ValueError("Invalid token")
        result = auth.verify_google_token("invalid_token")
        assert result is None
```

---

### Step 2: Generate Architecture Decision Record (ADR)

```
Context: The Python backend supports guest users (see models.py User model:
is_guest=True, guest_id column). Guest users are created via POST /api/auth/guest
in main.py — they get a UUID guest_id and temporary access. However, there is no
cleanup mechanism: guest users and their trips accumulate in the database forever.

Current state:
- models.py: User has is_guest (Boolean), guest_id (String), created_at (DateTime)
- models.py: Trip has user_id (ForeignKey to User)
- main.py /api/auth/guest: creates User with is_guest=True
- Database: PostgreSQL (Docker), SQLite (local dev)
- No background job infrastructure exists in the Python backend
- FastAPI supports BackgroundTasks and lifespan events

Objective: Generate an ADR for adding a background task to clean up stale guest
users and their associated trip data.

Requirements:
- Consider FastAPI BackgroundTasks vs APScheduler vs Celery
- Must work with both SQLite (local dev) and PostgreSQL (Docker/prod)
- Must cascade-delete associated trips
- Must preserve non-guest users entirely
- Include implications for database migrations
- Follow existing ADR format in docs/adr/

Examples of ADR format:
- Title, Status, Context, Decision, Alternatives, Consequences
```

**Expected Copilot Output:**
```markdown
<!-- docs/adr/004-guest-user-cleanup.md -->

# ADR 004: Background Cleanup for Stale Guest Users

## Status
Proposed

## Context
The Python backend creates guest users via `POST /api/auth/guest` (see `main.py`).
These users have `is_guest=True` and a UUID `guest_id` in the `users` table
(`models.py`). Guest users can create trips that are stored in the `trips` table
with a `user_id` foreign key.

Currently, there is no mechanism to clean up guest users. Over time, the database
accumulates stale guest records and their orphaned trips, increasing storage and
slowing queries.

Key constraints:
- Must work with SQLite (local dev) and PostgreSQL (prod)
- Must cascade-delete trips owned by deleted guest users
- Must NOT affect real (Google-authenticated) users
- FastAPI has no built-in scheduler — needs a solution for periodic tasks

## Decision
Use **FastAPI lifespan events + asyncio background task** because:

1. **Zero new dependencies**: FastAPI's `lifespan` context manager + `asyncio.create_task()`
2. **Simple**: Runs inside the same process, no external scheduler service
3. **Sufficient**: Guest cleanup is not time-critical — hourly sweep is adequate

### Implementation

```python
# In backend/main.py
from contextlib import asynccontextmanager

GUEST_TTL_HOURS = 72  # Clean up guest users older than 72 hours

async def cleanup_stale_guests():
    """Periodic task to remove stale guest users and their trips"""
    while True:
        await asyncio.sleep(3600)  # Run every hour
        db = database.SessionLocal()
        try:
            cutoff = datetime.now(UTC) - timedelta(hours=GUEST_TTL_HOURS)
            stale_guests = db.query(models.User).filter(
                models.User.is_guest == True,
                models.User.created_at < cutoff,
            ).all()

            for guest in stale_guests:
                db.query(models.Trip).filter(
                    models.Trip.user_id == guest.id
                ).delete()
                db.delete(guest)

            db.commit()
            logger.info(f"Cleaned up {len(stale_guests)} stale guest users")
        except Exception as e:
            db.rollback()
            logger.error(f"Guest cleanup failed: {e}")
        finally:
            db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(cleanup_stale_guests())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)
```

### Database Migration
```python
# Alembic migration — add index for efficient guest cleanup queries
# alembic revision --autogenerate -m "Add index on users.is_guest and created_at"

op.create_index("ix_users_guest_cleanup", "users", ["is_guest", "created_at"])
```

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **FastAPI lifespan + asyncio** ✅ | Zero deps, simple, in-process | Dies with the app, single-instance |
| APScheduler | Mature, cron-like scheduling | Extra dependency, complex setup |
| Celery + Redis | Production-grade, distributed | Heavy: needs Redis + worker process |
| PostgreSQL pg_cron | Database-native, reliable | PostgreSQL only — breaks SQLite dev |
| Manual cron job | Decoupled from app | Needs separate script, deployment complexity |

## Consequences

### Positive
- Guest users cleaned up automatically after 72 hours
- Associated trips cascade-deleted — no orphaned data
- Zero new dependencies — uses only FastAPI + asyncio
- Works with both SQLite and PostgreSQL

### Negative
- Single-instance only — if app runs multiple replicas, cleanup runs in each
  (mitigate with advisory lock in PostgreSQL)
- Task dies if the app crashes (acceptable for non-critical cleanup)
- Need Alembic migration for the composite index

### Future Considerations
- If scaling to multiple replicas: migrate to Celery or pg_cron
- Could extend to clean up other ephemeral data (expired blacklisted tokens)
- Consider exposing a `/api/admin/cleanup` endpoint for manual triggers
```

---

### Teaching Points

| Generation Type | CORE Element | Example |
|----------------|-------------|---------|
| Test infrastructure | **C**: auth.py functions, conftest.py patterns | `test_auth.py` with 15 tests |
| ADR generation | **C**: models.py User.is_guest, no cleanup mechanism | Guest cleanup decision |
| Test classes | **O**: Complete coverage of token lifecycle | Create/hash/verify/decode tests |
| Tech evaluation | **R**: Zero new deps, SQLite + PostgreSQL compat | Alternatives table |

---

## Workshop Summary

### 9 Advanced Techniques Mastered (with CORE Framework)

| # | Technique | CORE Focus | Key Files Referenced |
|---|-----------|-----------|---------------------|
| 1 | **Chain-of-Thought** | Numbered steps as **R**equirements | `vehicle_service.py`, `ai_service.py`, `main.py` |
| 2 | **Tree of Thought** | Branch-select **O**bjective before coding | `ai_service.py`, `vehicle_service.py`, `auth.py` |
| 3 | **Instruction Files** | Path-specific **R**ules with `applyTo` | `.github/instructions/backend.instructions.md` |
| 4 | **Prompt Files** | Full **CORE** templates per pattern | `fastapi-endpoint`, `pytest-test`, `pydantic-schema` |
| 5 | **Code Review** | **C**ontext of PR + **R**eview criteria | `auth.py` JWT security, `main.py` token flows |
| 6 | **Plan Mode** | Phased **O**bjectives with verification | `conftest.py` fixtures, `tests/fixtures/*.json` |
| 7 | **Coding Agent** | **E**xamples showing before/after transforms | `main.py`, new `constants.py` |
| 8 | **Agent HQ** | **R**ules for endpoint validation | `.github/agents/python-api-auditor.md` |
| 9 | **Architecture Gen** | **C**ontext of existing stack + **E**xample format | `test_auth.py`, `docs/adr/004-guest-cleanup.md` |

### CORE Quick Reference

```markdown
# CORE Prompt Template

Context: [Tech stack, relevant files, current state]
Objective: [What you want Copilot to produce]
Requirements: [Constraints, patterns, rules]
Examples: [Input/output, before/after, code snippets]
```

### Technique Quick Reference

```
# Chain-of-Thought (Python)
"""
Step 1: [inputs / data lookup]
Step 2: [schema / data model]
Step 3: [business logic]
Step 4: [edge cases / error handling]
Step 5: [structured response]
Now implement:
"""

# Tree of Thought (Python)
"""
Evaluate exactly THREE branches:
  Branch A — [Option]: Pros: [...] Cons: [...]
  Branch B — [Option]: Pros: [...] Cons: [...]
  Branch C — [Option]: Pros: [...] Cons: [...]
Select the best for [specific constraints].
Then implement the selected approach.
"""

# Instruction File (.github/instructions/backend.instructions.md)
---
applyTo: "backend/**/*.py"
---
# ❌ WRONG — anti-pattern
# ✅ CORRECT — project convention

# Prompt File (.github/prompts/[name].prompt.md)
## Context — tech stack & dependencies
## Objective — what to generate
## Requirements — constraints & patterns
## Examples — expected output with real schemas

# Code Review
Context: [PR files, current auth.py patterns]
Objective: [Review for security, tokens, patterns]
Requirements: [Timing-safe comparison, hash storage, constants]
Examples: [Issues to flag with before/after fixes]

# Plan Mode
Context: [conftest.py fixtures, test coverage gaps]
Objective: [Phased plan with checkboxes]
Requirements: [load_fixture(), AsyncMock, no network calls]
Examples: [Existing passing test to mimic]

# Coding Agent
Context: [main.py inline strings, missing constants.py]
Objective: [Create constants, replace strings, add handler]
Requirements: [Do NOT modify schemas.py / models.py / tests]
Examples: [Before/after for each replacement]

# Custom Agent (.github/agents/[name].md)
## Identity — who the agent is
## Expertise — what it knows (FastAPI, Pydantic, SQLAlchemy)
## Rules — what it enforces (response_model, auth, httpx)
## Behaviors — how it audits (scan, check, cross-reference)

# Architecture Generation
Context: [auth.py functions, models.py schema, no existing tests/ADRs]
Objective: [Test file OR ADR document]
Requirements: [pytest patterns, ADR format, zero new deps]
Examples: [Existing conftest.py patterns, existing ADR format]
```

---

## Next Steps

After completing this workshop:
1. **Apply Instruction Files**: Create `.github/instructions/backend.instructions.md` with `applyTo: "backend/**/*.py"` to enforce Python conventions automatically
2. **Create Prompt Templates**: Add `fastapi-endpoint.prompt.md` and `pytest-test.prompt.md` to `.github/prompts/` for consistent code generation
3. **Register Custom Agent**: Add the `python-api-auditor` agent to `.github/agents/` for ongoing endpoint validation
4. **Run the Audit**: Use the agent to identify and fix the 7 endpoints missing `response_model`
5. **Create `constants.py`**: Address the known technical debt of inline strings in `main.py`
