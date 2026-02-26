# Workshop 1: Foundational Web Development with GitHub Copilot

**Duration**: 60 minutes  
**Format**: Live coding demonstrations  
**Audience**: Developers familiar with React/TypeScript, Python (FastAPI), C# (ASP.NET), and Java (Spring Boot)  
**Prerequisites**: Completed `setup/00-setup-instructions.md`, Copilot activated in VS Code

> **Architecture reminder**: This is a polyglot app. Every API feature exists in three backends:
> - **Python** (`backend/`) — Trips CRUD, auth (port 8000)
> - **C#** (`backend-csharp/`) — Azure OpenAI vehicle parsing and trip generation (port 8081)
> - **Java** (`backend-java/`) — Geocoding, directions, POI search via Mapbox/Azure Maps (port 8082)
>
> Each demo shows the same concept applied across all three backends and the React frontend.

---

## Learning Objectives

By the end of this workshop, you will:
1. **Understand Copilot's Role** — see how Copilot acts as a context-aware pair programmer, not an autocomplete engine
2. **Provide Clear Context** — write prompts that give Copilot the right signal: language, framework, dependencies, and constraints
3. **Use Iterative Acceptance** — review and accept suggestions line-by-line; never blindly accept a block
4. **Customize Copilot** — understand how `.github/copilot-instructions.md` shapes every suggestion in this project
5. **Leverage Chat for Debugging** — use Copilot Chat to diagnose bugs you can describe but can't immediately locate
6. **Be Mindful of Security and Privacy** — see why secrets must stay in environment variables and never enter completions
7. **Understand Limitations** — recognise the patterns where Copilot consistently gets it wrong and know how to correct it

---

## Workshop Agenda

| Time | Demo | Topic | Files |
|------|------|-------|-------|
| 0-15 min | Demo 1 | Inline Suggestions: Adding a typed field | `frontend/src/components/MapComponent.tsx`, `backend/schemas.py`, `backend-csharp/Models/AiModels.cs`, `backend-java/.../dto/` |
| 15-30 min | Demo 2 | Comment-Based Generation: New endpoints | `backend/main.py`, `backend-csharp/Controllers/VehicleController.cs`, `backend-java/.../controller/GeospatialController.java` |
| 30-45 min | Demo 3 | Chat Debugging: Coordinate Format Bug | `frontend/src/components/MapComponent.tsx`, `backend/main.py`, `backend-java/.../service/MapboxService.java` |
| 45-60 min | Demo 4 | Security Pattern: How each stack hides API tokens | `backend/main.py`, `backend-csharp/Services/AiParsingService.cs`, `backend-java/.../service/MapboxService.java` |

---

## The 7 Copilot Capabilities — Where Each Appears

Every demo in this workshop deliberately exercises one or more of the core Copilot capabilities. Use this map as a reference when watching or facilitating.

| Capability | Demo 1 | Demo 2 | Demo 3 | Demo 4 |
|-----------|--------|--------|--------|--------|
| **1. Understand Copilot's Role** | ✅ Context from imports/patterns drives suggestion | ✅ Comment style determines endpoint shape | | |
| **2. Provide Clear Context** | ✅ Comment precision changes suggestion quality | ✅ Javadoc vs inline comment comparison | ✅ Symptom-first prompts vs vague prompts | ✅ Pattern names in prompts unlock correct patterns |
| **3. Iterative Acceptance** | ✅ Line-by-line Tab vs bulk Accept | ✅ Review dependency injection order | | |
| **4. Customize Copilot** | ✅ Project rules block `any` types | ✅ `.github/copilot-instructions.md` enforces HTTPException, constructor injection | | ✅ Instructions file bans hardcoded secrets |
| **5. Chat for Debugging** | | | ✅ Full bug diagnosis workflow | ✅ Ask Chat to explain failure mode differences |
| **6. Security and Privacy** | | | | ✅ Env vars in all three stacks; Key Vault in prod |
| **7. Understand Limitations** | ✅ Mutable defaults; POJO vs record | ✅ Async sugar; wrong service injection | ✅ Copilot suggests symptom-fix, not root-cause fix | ✅ Copilot may suggest hardcoded fallback values |

---

## Demo 1: Inline Suggestions — Adding a Typed Field Across the Stack (15 min)

> **Copilot capabilities in focus**: Understand Copilot's Role · Provide Clear Context · Iterative Acceptance · Understand Limitations

### Objective
See how Copilot's inline suggestions adapt to each language's conventions when you add a new field. Practise line-by-line acceptance and learn where Copilot is reliably right — and where it predictably fails.

### Copilot's Role Here
Copilot does not just autocomplete syntax — it reads the **entire open file** before suggesting. In this demo you will see it:
- Mirror existing field naming conventions (e.g. `// gallons` comment style)
- Pick up the Pydantic v2 import style already used in `schemas.py`
- Follow the XML doc pattern already in `AiModels.cs`
- Match the Java `record` pattern already used in the `dto/` package

This only works when the file is **open and in context**. If Copilot's suggestion looks wrong, the first question is always: *what context is it missing?*

### Scenario
Product needs: trips should expose a `distanceMiles` field in every part of the stack. The Python backend already stores it in `schemas.py`; we want to thread it through the C# models, the Java DTOs, and the React frontend type.

### Before Demo: Setup
Open all four files side-by-side:
```bash
code frontend/src/store/useTripStore.ts
code backend/schemas.py
code backend-csharp/Models/AiModels.cs
# Java DTO is in backend-java/src/main/java/com/roadtrip/geospatial/dto/
```

---

### Part A — TypeScript (React / Zustand)

`frontend/src/store/useTripStore.ts` already defines `TripState`. The store's `vehicleSpecs` object uses metric units internally.

**Existing code (lines 55-64)**:
```typescript
// frontend/src/store/useTripStore.ts
export const useTripStore = create<TripState>((set, get) => ({
  vehicleSpecs: {
    height: 3.5, // meters
    weight: 10,  // tons
    width: 2.5,
    length: 12,
    fuelType: 'diesel',
    range: 500,  // miles
    mpg: 10,
  },
```

**Live coding step — type a comment above the interface declaration**:
```typescript
// Add a fuelCapacity field in gallons to vehicleSpecs; keep all existing fields
```

**Expected Copilot inline suggestion**:
```typescript
  vehicleSpecs: {
    height: 3.5,
    weight: 10,
    width: 2.5,
    length: 12,
    fuelType: 'diesel',
    range: 500,
    mpg: 10,
    fuelCapacity: 50, // gallons
  },
```

**Decision checklist**:
- ✅ New field uses the same comment-doc style as existing fields (`// gallons`)
- ✅ Default value (50) is reasonable for a road-trip vehicle
- ⚠️ Check that the corresponding `Vehicle` interface in `src/types/Vehicle.ts` is also updated

---

### Part B — Python (FastAPI / Pydantic)

`backend/schemas.py` holds the Pydantic response schema. The `TripBase` already has `stops`, `vehicle_specs`, etc.

**Existing code (lines 32-37)**:
```python
# backend/schemas.py
class TripBase(BaseModel):
    name: str
    stops: List[Any]
    vehicle_specs: Any
```

**Live coding step — position cursor after `vehicle_specs: Any` and type**:
```python
# Add optional waypoint_notes field: list of per-stop text notes, default empty list
```

**Expected Copilot suggestion**:
```python
class TripBase(BaseModel):
    name: str
    stops: List[Any]
    vehicle_specs: Any
    waypoint_notes: Optional[List[str]] = Field(default_factory=list)
```

**Decision checklist**:
- ✅ `Optional` with `Field(default_factory=list)` is the correct Pydantic v2 pattern (project uses `ConfigDict`)
- ✅ No `Any` — it's a typed `List[str]`
- ⚠️ If Copilot suggests `Optional[List[str]] = []` — **reject it**: mutable defaults break Pydantic

---

### Part C — C# (ASP.NET / Models)

`backend-csharp/Models/AiModels.cs` defines both request and response DTOs. The `GenerateTripRequest` currently has `Origin`, `Destination`, and `Interests`.

**Existing code**:
```csharp
// backend-csharp/Models/AiModels.cs
public class GenerateTripRequest
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public List<string> Interests { get; set; } = new();
}
```

**Live coding step — add a comment above the class closing brace**:
```csharp
// Add MaxStops property: maximum number of waypoints the user wants, default 5
```

**Expected Copilot suggestion**:
```csharp
public class GenerateTripRequest
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public List<string> Interests { get; set; } = new();
    /// <summary>Maximum number of waypoints to include in trip suggestions.</summary>
    public int MaxStops { get; set; } = 5;
}
```

**Decision checklist**:
- ✅ XML doc comment `<summary>` matches the existing style in `AiParsingService.cs`
- ✅ Default value of `5` is sensible
- ⚠️ If Copilot uses a nullable `int?` — accept only if the Azure OpenAI prompt tolerates null inputs

---

### Part D — Java (Spring Boot / DTO)

The Java backend's `GeocodeResponse` lives in `backend-java/src/main/java/com/roadtrip/geospatial/dto/`. The controller returns it from `mapboxService.geocode()`.

**Existing usage in `MapboxService.java` (line 65)**:
```java
return new GeocodeResponse(coordinates, placeName);
```

**Live coding step — open `GeocodeResponse.java` and type below the existing fields**:
```java
// Add a countryCode field: ISO 3166-1 alpha-2 country code parsed from place_name
```

**Expected Copilot suggestion**:
```java
public record GeocodeResponse(
    List<Double> coordinates,
    String placeName,
    String countryCode  // ISO 3166-1 alpha-2, e.g. "US"
) {}
```

**Decision checklist**:
- ✅ Java record syntax is idiomatic for Spring Boot 3 DTOs
- ✅ Comment explains the format (`"US"`) for future maintainers
- ⚠️ Adding a new record field is a breaking change — the constructor call in `MapboxService.java` must also be updated (Copilot will suggest this when you navigate to that file)

---

### Common Copilot Mistakes Across All Languages

| Language | Mistake | Correction |
|----------|---------|------------|
| TypeScript | Suggests `any` type for the new field | Comment: "no any types, use explicit union or primitive" |
| Python | Suggests `= []` mutable default for a list field | Reject; re-prompt: "use `Field(default_factory=list)`" |
| C# | Omits XML `<summary>` doc | Type `///` above the property to trigger doc suggestion |
| Java | Suggests a POJO class instead of a record | Reject; add comment "use Java record" |

### Teaching Points

**Capability 1 — Understand Copilot's Role**
- Copilot is a *context reader*. All four languages above produced better suggestions because the file already had matching patterns directly above the cursor. Moving the cursor to a blank line at the end of a file with no context would have produced a generic, unhelpful suggestion.
- This means **code organisation matters for AI assistance** — consistent, pattern-rich files produce better suggestions than sprawling, inconsistent ones.

**Capability 3 — Iterative Acceptance**
Never press `Accept All` (`Tab` to accept the whole block). Instead:
```
Tab          — accept one token / word
Ctrl+→       — accept one word at a time (VS Code)
Ctrl+Enter   — open Completions Panel to choose between suggestions
Esc          — reject current suggestion and re-prompt
```
In this demo, the critical rejected lines were:
- Python: `= []` → reject, re-prompt with `Field(default_factory=list)`
- Java: POJO class body → reject, add comment `// use Java record`
- C#: nullable `int?` → reject if Azure OpenAI prompt cannot handle null

**Capability 7 — Understand Limitations**

| Language | Where Copilot reliably fails | Why |
|----------|------------------------------|-----|
| Python | Mutable default `= []` on `List` fields | Trained on Pydantic v1 examples that allowed this |
| Java | Generates POJO + getters instead of `record` | `record` is newer; older patterns dominate training data |
| C# | Omits XML `<summary>` when the file has mixed doc styles | Picks the nearest doc style — open a well-documented file first |
| All | Invents plausible-looking but non-existent method names | Always compile-check before committing |

### Verification
```bash
# TypeScript
cd frontend && npm run typecheck

# Python
cd backend && python -c "from schemas import TripBase; print('OK')"

# C#
cd backend-csharp && dotnet build

# Java
cd backend-java && ./mvnw compile
```

---

## Demo 2: Comment-Based Generation — New Endpoints in All Three Backends (15 min)

> **Copilot capabilities in focus**: Provide Clear Context · Customize Copilot · Iterative Acceptance · Understand Limitations

### Objective
Use comment prompts to generate complete REST endpoints. Explore how prompt precision controls output quality, and see how the project's `.github/copilot-instructions.md` instruction file acts as a persistent set of constraints that narrows what Copilot will suggest.

### Capability 4 — Customize Copilot: The Instruction File

Before writing a single comment, open [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) and point out the rules that *directly affect all three demos today*:

```markdown
# From .github/copilot-instructions.md — enforced by Copilot in every suggestion:

## Python
- Use HTTPException with clear status codes (not generic Exception)
- Business logic belongs in *_service.py, NOT in main.py route handlers

## Java
- Constructor injection ONLY — never @Autowired field injection

## TypeScript
- No `any` types allowed
- HTTP Client: Axios via axiosInstance (not raw fetch)
```

Ask the group: *"If the instruction file says `no any types`, what happens when Copilot generates a response model without explicit types?"*

Answer: Copilot reads the instruction file at every completion — it will resist suggesting `any` and prefer typed alternatives. When it still suggests `any`, that is a case where Capability 7 (Limitations) applies: re-prompt or reject.

### Capability 2 — Provide Clear Context: Comment Anatomy

A comment prompt has four parts. All four are needed to consistently get correct results:

```
[HTTP METHOD + PATH]   # GET /api/trips/recent
[BEHAVIOUR]            # Returns the 5 most recent trips, sorted by created_at desc  
[DEPENDENCIES]         # Requires: get_current_user dependency, get_db dependency
[RETURN CONTRACT]      # Response model: list[schemas.Trip]
```

Remove any one part and show how the suggestion degrades:
- Remove `[DEPENDENCIES]` → Copilot omits `get_current_user`; the endpoint is unauthenticated
- Remove `[RETURN CONTRACT]` → Copilot guesses the response model, often incorrectly
- Remove `[HTTP METHOD + PATH]` → Copilot generates a function, not a FastAPI route decorator

### Scenario
The app needs a `/api/trips/recent` endpoint: the last 5 trips for the current user, sorted newest-first. We'll implement it in Python first, then generate the same feature in C# (as a trip-count summary endpoint) and Java (as a nearest-POI endpoint) to show the pattern for each stack.

---

### Part A — Python (FastAPI, `backend/main.py`)

The existing `GET /api/trips` endpoint (line ~380) already filters by `current_user.id`. We'll generate `GET /api/trips/recent`.

**Open `backend/main.py`. Navigate below the `read_trips` handler. Type these comments**:
```python
# GET /api/trips/recent
# Returns the 5 most recent trips for the authenticated user, sorted by created_at descending
# Requires: get_current_user dependency, get_db dependency
# Response model: list[schemas.Trip]
```

**Expected Copilot suggestion**:
```python
@app.get("/api/trips/recent", response_model=list[schemas.Trip])
def read_recent_trips(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Return the 5 most recent trips for the authenticated user."""
    trips = (
        db.query(models.Trip)
        .filter(models.Trip.user_id == current_user.id)
        .order_by(models.Trip.created_at.desc())
        .limit(5)
        .all()
    )
    return trips
```

**Compare with the existing `read_trips` handler**:
```python
# Existing read_trips (line ~380) — Copilot will model the new one after this:
@app.get("/api/trips", response_model=list[schemas.Trip])
def read_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    trips = db.query(models.Trip).filter(
        models.Trip.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return trips
```

**Decision checklist**:
- ✅ Uses `Depends(get_current_user)` — no unauthenticated access
- ✅ Hardcodes `limit(5)` — correct per the spec
- ⚠️ Copilot may add `skip: int = 0` pagination params — remove them; recent-5 is intentionally fixed

---

### Part B — C# (ASP.NET, `backend-csharp/Controllers/VehicleController.cs`)

The C# service handles AI-powered vehicle parsing and trip generation. We'll add a `GET /api/v1/vehicle-types` endpoint that returns the supported vehicle category list.

**Open `VehicleController.cs`. Navigate below `GenerateTrip`. Type this comment**:
```csharp
/// <summary>
/// Returns the list of supported vehicle types for the parse-vehicle endpoint.
/// GET /api/v1/vehicle-types
/// No authentication required.
/// </summary>
```

**Expected Copilot suggestion**:
```csharp
[HttpGet("vehicle-types")]
public ActionResult<IEnumerable<string>> GetVehicleTypes()
{
    var vehicleTypes = new[]
    {
        "car", "truck", "suv", "rv", "van", "motorcycle"
    };
    return Ok(vehicleTypes);
}
```

**Compare with VehicleSpecs model to validate the list**:
```csharp
// backend-csharp/Models/AiModels.cs — VehicleSpecs already uses these values:
public class VehicleSpecs
{
    public string VehicleType { get; set; } = "car";  // car|truck|suv|rv|van|motorcycle
    // ...
}
```

**The AiParsingService system prompt (line 23) enforces the same list**:
```csharp
// AiParsingService.cs — VehicleParsingSystemPrompt:
// "vehicleType": "car|truck|suv|rv|van|motorcycle"
```

**Decision checklist**:
- ✅ Values match the AI system prompt enum — consistency matters
- ✅ Returns `IEnumerable<string>` — lightweight, no DTO needed
- ⚠️ If Copilot suggests `Task<ActionResult<...>>` — the endpoint is synchronous; reject async sugar

---

### Part C — Java (Spring Boot, `backend-java/.../controller/GeospatialController.java`)

The Java backend handles geocoding and POI search. We'll add `GET /api/search/nearby` scoped to a lat/lon radius.

**Open `GeospatialController.java`. Navigate below the `searchPlaces` handler. Type this Javadoc comment**:
```java
/**
 * Search for POIs near a coordinate using Azure Maps.
 * GET /api/search/nearby
 *
 * @param lat  latitude of the center point
 * @param lon  longitude of the center point
 * @param query category to search (e.g. "gas station", "restaurant")
 * @param radiusMeters search radius in meters, default 5000
 * @return GeoJSON-compatible feature list via azureMapsService
 */
```

**Expected Copilot suggestion**:
```java
@GetMapping("/search/nearby")
public ResponseEntity<SearchResponse> searchNearby(
        @RequestParam("lat") double lat,
        @RequestParam("lon") double lon,
        @RequestParam("query") String query,
        @RequestParam(value = "radiusMeters", defaultValue = "5000") int radiusMeters) {
    String proximity = lon + "," + lat;
    SearchResponse result = azureMapsService.searchPlaces(query, proximity);
    return ResponseEntity.ok(result);
}
```

**Compare with the existing `searchPlaces` handler pattern**:
```java
// Existing (same file) — Copilot models the new handler after this:
@GetMapping("/search")
public ResponseEntity<SearchResponse> searchPlaces(
        @RequestParam("query") String query,
        @RequestParam(value = "proximity", required = false) String proximity) {
    SearchResponse result = azureMapsService.searchPlaces(query, proximity);
    return ResponseEntity.ok(result);
}
```

**Decision checklist**:
- ✅ Reuses `azureMapsService.searchPlaces()` — no code duplication
- ✅ Builds the `proximity` string as `"lon,lat"` — matches Azure Maps API format
- ⚠️ If Copilot injects `MapboxService` instead of `AzureMapsService` — nearby POI search routes through Azure Maps, not Mapbox

---

### Capability 7 — Understand Limitations in Comment-Based Generation

These are the patterns where Copilot gets it wrong in *this specific codebase*, not in general:

| Backend | What Copilot gets wrong | Why | Fix |
|---------|------------------------|-----|-----|
| Python | Omits `get_current_user` | Comment didn't mention auth | Add `# Requires authentication` explicitly |
| Python | `except Exception` instead of `HTTPException` | Generic exception handling is more common in training data | Instruction file should catch this; if not, re-prompt |
| C# | `Task<ActionResult<T>>` on a sync endpoint | Copilot defaults to async for all Web API endpoints | Only accept if the underlying service method is actually `async Task` |
| Java | `@Autowired` field injection | Field injection is the most common pattern in older Spring examples | Project uses constructor injection — the instruction file flags this; reject and re-prompt |
| All | Invents a service method that does not exist | Training data contains many plausible-but-fictional method names | Always check the service interface before accepting a call |

The instruction file at [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) is the first line of defence against several of these. When the instruction file is open in a pinned tab, Copilot consistently applies it. When it is closed, results drift.

### Verification
```bash
# Python — check new endpoint appears in Swagger
cd backend && uvicorn main:app --reload
open http://localhost:8000/docs  # GET /api/trips/recent should appear

# C# — run and test
cd backend-csharp && dotnet run
curl http://localhost:8081/api/v1/vehicle-types
# Expected: ["car","truck","suv","rv","van","motorcycle"]

# Java — run and test
cd backend-java && ./mvnw spring-boot:run
curl "http://localhost:8082/api/search/nearby?lat=37.77&lon=-122.42&query=gas+station"
```

---

## Demo 3: Chat Debugging — Coordinate Format Bug Across the Stack (15 min)

> **Copilot capabilities in focus**: Leverage Chat for Debugging and Exploration · Provide Clear Context · Understand Limitations

### Objective
Use Copilot Chat to diagnose the `[lat, lng]` vs `[lng, lat]` bug. Show how Chat's *explain* and *explore* modes make it a root-cause analysis tool, not just a code generator. Then show Chat's limits: its first suggestion sometimes fixes the symptom rather than the root cause.

### Capability 5 — Chat for Debugging: The Workflow

Copilot Chat is not just a code generator — it is a **reasoning tool**. For debugging, use this three-step workflow before asking for a fix:

```
Step 1 — Describe the symptom (not the guess)
  "Map markers appear in Africa instead of San Francisco."
  NOT: "I think the coordinates are swapped — how do I fix them?"

Step 2 — Provide the relevant code snippet
  Paste the exact lines that handle coordinates (Marker props, proximity parse, or geocode return).

Step 3 — Ask for root cause, then prevention
  "What is the root cause of this bug?"
  "How can we prevent this class of bug in the codebase?"
```

The third question — *how to prevent it* — is where Chat provides the most value beyond a search engine. It will suggest type aliases in TypeScript, named constants in Java, and validated parsing helpers in Python.

### Background: Why this bug is so common
- **GeoJSON spec**: `[longitude, latitude]` — what Mapbox and the Java backend use
- **Google Maps API**: `[latitude, longitude]` — the opposite convention
- **Azure Maps**: returns `{ lat, lon }` as separate fields — easy to swap when building a coordinate array

---

### Part A — Frontend (`frontend/src/components/MapComponent.tsx`)

**Buggy scenario** — introduce the bug into the `MapComponent.tsx` stop marker render (lines 78–92):

```typescript
// Current (correct) code in MapComponent.tsx — stops.map renders:
{stops.map((stop, index) => (
  <Marker
    key={stop.id}
    longitude={stop.coordinates[0]}   // ✅ correct: coordinates = [lng, lat]
    latitude={stop.coordinates[1]}
  >
```

**Introduce the bug by swapping indexes**:
```typescript
// ❌ Buggy version:
<Marker
  key={stop.id}
  longitude={stop.coordinates[1]}   // BUG: latitude value passed as longitude
  latitude={stop.coordinates[0]}    // BUG: longitude value passed as latitude
>
```

**Copilot Chat prompt**:
```
The stop markers in MapComponent.tsx render in the wrong location — they appear 
in Africa instead of the US. The stop for San Francisco has 
coordinates [-122.4194, 37.7749]. What is wrong and how do I fix it?
```

**Expected Chat response key points**:
- `coordinates[0]` is `-122.4194` which is the longitude, not latitude
- The `<Marker>` component follows GeoJSON: `longitude={coordinates[0]}`, `latitude={coordinates[1]}`
- Swapping the indexes puts longitude (-122) into `latitude`, which plots the point near Africa

**Fix**:
```typescript
longitude={stop.coordinates[0]}  // ✅ [lng, lat] — index 0 is longitude
latitude={stop.coordinates[1]}   // ✅ index 1 is latitude
```

---

### Part B — Python (`backend/main.py`) — Azure Maps proximity parameter

**Look at the `search_places` endpoint (lines ~330-340)**:
```python
# backend/main.py — search_places()
if proximity:
    try:
        coords = proximity.split(',')
        lon = float(coords[0])  # Longitude first in input  ← frontend sends "lng,lat"
        lat = float(coords[1])  # Latitude second in input
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid proximity format")

if lat and lon:
    params["lat"] = lat
    params["lon"] = lon
```

**Introduce the reading bug**:
```python
# ❌ Buggy version:
lon = float(coords[1])  # WRONG: reads the latitude value as longitude
lat = float(coords[0])  # WRONG: reads the longitude value as latitude
```

**Copilot Chat prompt**:
```
In backend/main.py search_places(), the proximity parameter comes from the 
frontend as "lng,lat" (e.g. "-122.4194,37.7749"). Inside the function coords[0] 
is being assigned to `lat` and coords[1] to `lon`. 
POI search results are clustered in the wrong city. What is the bug?
```

**Expected Chat response key points**:
- The frontend sends longitude first: `"-122.4194,37.7749"` → `coords[0] = -122.4194` (lng)
- Azure Maps `params["lat"]` must receive `37.7749` (latitude), not `-122.4194`
- The assignment is reversed: `lon = coords[0]` and `lat = coords[1]` is the correct read

**Correct code (already in the repo)**:
```python
lon = float(coords[0])  # ✅ Longitude is index 0 ("lng,lat" format)
lat = float(coords[1])  # ✅ Latitude is index 1
params["lat"] = lat
params["lon"] = lon
```

---

### Part C — Java (`backend-java/.../service/MapboxService.java`) — Geocode response

**Look at `MapboxService.geocode()` (lines ~64-66)**:
```java
// MapboxService.java — geocode()
List<Double> coordinates = (List<Double>) geometry.get("coordinates");
String placeName = (String) feature.get("place_name");
return new GeocodeResponse(coordinates, placeName);
```

Mapbox returns `"coordinates": [-122.4194, 37.7749]` — GeoJSON order (`[lng, lat]`).

**Introduce a consuming bug in a caller**:
```java
// ❌ Buggy consumer code:
GeocodeResponse r = mapboxService.geocode("San Francisco, CA");
double lat = r.coordinates().get(0);  // BUG: gets longitude (-122.4194), not latitude
double lon = r.coordinates().get(1);  // BUG: gets latitude (37.7749), not longitude
```

**Copilot Chat prompt**:
```
In MapboxService.geocode() the returned GeocodeResponse.coordinates() is 
a List<Double> from Mapbox. A caller does coordinates().get(0) and assigns it 
to a variable named `lat`. A marker drawn from that lat value appears in the 
Pacific Ocean. What is the bug and how should the caller read the coordinates?
```

**Expected Chat response key points**:
- Mapbox follows GeoJSON: `coordinates[0]` = longitude, `coordinates[1]` = latitude
- `get(0)` = `-122.4194` is the longitude; assigning it to `lat` is wrong
- A named accessor or record label would prevent this

**Fix**:
```java
double lon = r.coordinates().get(0);  // ✅ index 0 = longitude (GeoJSON)
double lat = r.coordinates().get(1);  // ✅ index 1 = latitude
```

---

### Capability 7 — Understand Limitations in Chat Debugging

Copilot Chat's **first response often fixes the symptom, not the root cause**. This is the single most important limitation to demonstrate live.

**Live demonstration — the symptom fix trap**:

Ask Chat this prompt first:
```
The <Marker> in MapComponent.tsx is rendering in the wrong location. How do I fix it?
```

Copilot's likely (wrong) first response:
```typescript
// ❌ Chat may suggest swapping the parameter names — symptom fix:
<Marker
  latitude={stop.coordinates[0]}   // renamed, data still wrong
  longitude={stop.coordinates[1]}
>
// This compiles and runs but the bug is still there.
```

Now ask the root-cause prompt:
```
The stop for San Francisco has coordinates [-122.4194, 37.7749]. The <Marker>
props are longitude={coordinates[0]} and latitude={coordinates[1]}. 
Markers appear in Africa. What is the root cause?
```

Copilot's corrected response correctly identifies the GeoJSON convention and fixes the *data*, not the *prop names*.

**Key teaching point**: The quality of Chat's diagnosis is directly proportional to the specificity of the prompt. Vague symptom → symptom fix. Specific code + specific expected value → root cause.

### Cross-Stack Teaching Points

| Layer | Convention | Common source of confusion |
|-------|-----------|---------------------------|
| Mapbox / GeoJSON | `[longitude, latitude]` | Feels backwards to GPS users |
| Google Maps JS | `LatLng(lat, lng)` | Opposite order from GeoJSON |
| Azure Maps REST | `{ lat: ..., lon: ... }` | Named fields — safe, but easy to swap when building arrays |
| Python `proximity` | `"lng,lat"` string | Backend must parse index 0 as lng |
| Java `List<Double>` | index 0 = lng, index 1 = lat | No field names — purely positional |

**Ask Copilot Chat follow-up (Capability 5 — Exploration)**:
```
How can we make the GeoJSONCoordinate type self-documenting in TypeScript, Python, 
and Java so this bug cannot be introduced silently?
```

This is an *exploration* prompt, not a debugging prompt. Chat will suggest:
- TypeScript: `type GeoJSONCoordinate = [longitude: number, latitude: number]` (labelled tuple)
- Python: a `NamedTuple` or dataclass with `lng` and `lat` named fields
- Java: a record `GeoCoordinate(double longitude, double latitude)` with named accessors

All three suggestions prevent the silent index swap. None are possible to generate from inline suggestions alone — Chat is the right tool for this cross-cutting design question.

---

## Demo 4: Security Pattern — How Each Stack Hides API Tokens (15 min)

> **Copilot capabilities in focus**: Be Mindful of Security and Privacy · Provide Clear Context · Understand Limitations · Customize Copilot

### Objective
Compare how Python, C#, and Java each inject secrets from the environment. Understand why this demo is primarily about developer habits, not Copilot features — and why Copilot itself is a risk vector if not used carefully.

### Capability 6 — Be Mindful of Security and Privacy

Copilot presents three distinct security risks that every developer on this project must understand:

**Risk 1 — Copilot learns from context, including secrets in open files**

If you open a `.env` file in VS Code while Copilot is active, there is no guarantee Copilot does not incorporate its content into suggestions for other files. **Never open `.env` files while actively pair-programming with Copilot on shared screens.**

**Risk 2 — Copilot will suggest hardcoded secrets when it cannot see environment configuration**

If `application.properties` is not open and Copilot is asked to write a `MapboxService`, it may suggest:
```java
// ❌ Copilot may suggest this when it has no context:
private final String mapboxToken = "pk.eyJ1IjoiZXhhbXBsZSI...";  // placeholder — but users replace with real tokens
```
The instruction file at [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) explicitly blocks this:
```markdown
# From copilot-instructions.md:
## Pitfalls
7. Hardcoding API tokens: Use environment variables + .env files (never commit!)
```

**Risk 3 — Copilot completions may include real-looking but invalid token strings**

Copilot is trained on public code that included real (now-revoked) API tokens. Never copy a token string from a Copilot suggestion — always generate new credentials from your own provider console.

### The three APIs being protected
- **Mapbox token** — used by Python (`backend/main.py`) and Java (`MapboxService.java`)
- **Azure Maps key** — used by Python (`main.py`) and Java (`AzureMapsService.java`)
- **Azure OpenAI credentials** — used by C# (`AiParsingService.cs`) only

---

### Part A — Python: `os.getenv()` with runtime validation

**Real code in `backend/main.py`**:
```python
@app.get("/api/geocode")
async def geocode_address(q: str):
    token = os.getenv("MAPBOX_TOKEN")      # ✅ Read at request time
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{q}.json?access_token={token}&limit=1"
    # ...

@app.get("/api/search")
async def search_places(query: str, proximity: str = None):
    azure_key = os.getenv("AZURE_MAPS_KEY")  # ✅ Different key for Azure Maps
    if not azure_key:
        raise HTTPException(status_code=500, detail="Azure Maps key not configured")
```

**Key points to highlight**:
- `os.getenv()` reads from the OS environment at call time — set via `.env` file + `load_dotenv()` at app start
- `load_dotenv()` is called at the top of `main.py` — the `.env` file is never committed (it's in `.gitignore`)
- Validation is explicit: `if not token: raise HTTPException(500, ...)` — fail fast, don't silently return wrong data

**Copilot Chat prompt (ask Copilot to explain the pattern)**:
```
In backend/main.py, MAPBOX_TOKEN is read inside each endpoint handler using 
os.getenv(). Why is this better than reading it once at module level as a 
module-level constant?
```

**Expected response**: Module-level constants are evaluated at import time — in testing or when the environment is not fully set up, the constant would be `None` and fail silently. Reading inside the handler means the exception is raised at the right time with a clear 500 message.

---

### Part B — C#: `Environment.GetEnvironmentVariable()` with graceful degradation

**Real code in `backend-csharp/Services/AiParsingService.cs`**:
```csharp
public AiParsingService(ILogger<AiParsingService> logger)
{
    _logger = logger;
    _endpoint   = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT");
    _apiKey     = Environment.GetEnvironmentVariable("AZURE_OPENAI_API_KEY");
    _deployment = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT");
    
    _isConfigured = !string.IsNullOrEmpty(_endpoint)
                 && !string.IsNullOrEmpty(_apiKey)
                 && !string.IsNullOrEmpty(_deployment);

    if (!_isConfigured)
    {
        _logger.LogWarning(
            "Azure OpenAI is not configured. Using rule-based fallback for vehicle parsing.");
    }
}

public async Task<ParseVehicleResponse> ParseVehicleAsync(string description)
{
    if (_isConfigured)
    {
        try { return await ParseWithAzureOpenAI(description); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure OpenAI call failed, using fallback");
        }
    }

    // Rule-based fallback when AI is unavailable
    return new ParseVehicleResponse
    {
        Status  = "success",
        Specs   = GetFallbackSpecs(description),
        RawAiResponse = null,
    };
}
```

**Key points to highlight**:
- `Environment.GetEnvironmentVariable()` is read in the constructor — the service is registered as a singleton in DI
- `_isConfigured` flag enables graceful degradation: the service still works without Azure OpenAI by using rule-based parsing
- `ILogger.LogWarning` rather than throwing — makes missing config observable in App Insights without breaking the app

**Contrast with the Python pattern**: Python fails fast with `HTTPException(500)` because geocoding *has* to work; C# degrades gracefully because vehicle parsing has a useful fallback.

**Copilot Chat prompt**:
```
In AiParsingService.cs, AZURE_OPENAI_ENDPOINT is read in the constructor and 
stored as a private field. The Python backend reads MAPBOX_TOKEN inside each 
request handler. What are the trade-offs of reading env vars at startup vs at 
request time?
```

---

### Part C — Java: `@Value` annotation + property injection

**Real code in `backend-java/.../service/MapboxService.java`**:
```java
@Service
public class MapboxService {

    private final WebClient webClient;
    private final String mapboxToken;

    public MapboxService(
            WebClient.Builder webClientBuilder,
            @Value("${geospatial.mapbox.base-url}") String baseUrl,
            @Value("${geospatial.mapbox.token}")    String token) {
        this.webClient   = webClientBuilder.baseUrl(baseUrl).build();
        this.mapboxToken = token;
    }

    private void validateToken() {
        if (mapboxToken == null || mapboxToken.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "Mapbox token not configured");
        }
    }
}
```

**`application.properties` (or `application.yml`) wires the env var**:
```properties
geospatial.mapbox.token=${MAPBOX_TOKEN}
geospatial.mapbox.base-url=https://api.mapbox.com
```

**Key points to highlight**:
- `@Value("${geospatial.mapbox.token}")` is Spring's property injection — it resolves via `application.properties` which in turn reads from the OS environment variable `MAPBOX_TOKEN`
- Two-level indirection: `MAPBOX_TOKEN` (env) → `geospatial.mapbox.token` (property) → `@Value` annotation
- `validateToken()` is called at the start of each service method — Spring will throw at startup if the `@Value` binding fails, giving an early error

**Copilot Chat prompt (live demo)**:
```
In MapboxService.java, @Value("${geospatial.mapbox.token}") injects the token 
via Spring properties. What happens at application startup if MAPBOX_TOKEN is 
not set in the environment? How does that compare to the Python and C# patterns?
```

---

### Security Pattern Comparison Table

| Concern | Python (`main.py`) | C# (`AiParsingService.cs`) | Java (`MapboxService.java`) |
|---------|-------------------|--------------------------|----------------------------|
| How secret is read | `os.getenv()` per request | `Environment.GetEnvironmentVariable()` in constructor | `@Value` via `application.properties` |
| When failure is detected | At request time → `HTTPException(500)` | At startup → `LogWarning`, degrades gracefully | At startup → Spring throws `BeanCreationException` |
| Fallback behaviour | No fallback — geocoding must work | Rule-based vehicle parsing | `validateToken()` throws `ResponseStatusException` |
| Local config mechanism | `.env` file + `python-dotenv` | OS environment / `launchSettings.json` | `.env` via docker-compose or `application-local.properties` |
| Production secret store | Azure Key Vault via App Service settings | Azure Key Vault via Key Vault references | Azure Key Vault via Spring Cloud Azure |

### Never do this (show in each language)

**Python**:
```python
# ❌ Hardcoded — token is committed to Git
MAPBOX_TOKEN = "sk.eyJ1IjoiYWN0dWFsLXRva2VuIiwiYSI6...}"
```

**C#**:
```csharp
// ❌ Hardcoded — visible in any decompiler
private const string ApiKey = "sk.eyJ1IjoiYWN0dWFsLXRva2VuIiwiYSI6...}";
```

**Java**:
```java
// ❌ Hardcoded — committed to repo
@Value("sk.eyJ1IjoiYWN0dWFsLXRva2VuIiwiYSI6...}")
private String mapboxToken;
```

### Verification
```bash
# Python — confirm token is read from environment, not code
grep -r "sk\." backend/main.py  # Should return nothing

# C# — confirm no hardcoded keys
grep -r "AZURE_OPENAI" backend-csharp/ --include="*.cs"
# Expected: only Environment.GetEnvironmentVariable() calls

# Java — confirm @Value uses property placeholder, not literal
grep -r "@Value" backend-java/src/ --include="*.java"
# Expected: @Value("${geospatial.mapbox.token}"), not a raw token
```

---

## Workshop Summary & Key Takeaways

### The 7 Capabilities — What Each Demo Taught

**Capability 1 — Understand Copilot's Role in Your Workflow** *(Demo 1)*
- Copilot is a *context-aware pair programmer*, not an autocomplete engine. It reads your open files, imports, and existing patterns before suggesting.
- File organisation directly affects suggestion quality: consistent, pattern-rich files → better suggestions.
- Practical habit: before starting a Copilot-assisted feature, open the most relevant existing file of the same type (e.g. open an existing Pydantic schema before adding a new one).

**Capability 2 — Provide Clear Context for Better Suggestions** *(All Demos)*
- Comment anatomy for endpoints: `[METHOD + PATH]` + `[BEHAVIOUR]` + `[DEPENDENCIES]` + `[RETURN CONTRACT]`
- Missing one part degrades the suggestion predictably — remove `[DEPENDENCIES]` → auth is dropped.
- Chat prompts: symptom + code snippet + expected value → root cause. Vague symptom → symptom fix only.

**Capability 3 — Use Iterative Acceptance of Suggestions** *(Demo 1)*
- `Tab` accepts line by line; `Ctrl+→` accepts word by word; `Esc` rejects entirely.
- Critical rejections from today: Python mutable default `= []`; Java POJO instead of record; C# async sugar on sync endpoint.
- Rule of thumb: if a suggestion introduces a new import you did not expect, stop and read the entire block before accepting.

**Capability 4 — Customize Copilot for Your Needs** *(Demo 2)*
- [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) sets project-wide conventions: no `any` types, `HTTPException` required, constructor injection for Java.
- Keep the instruction file open in a pinned tab — Copilot applies it more consistently when the file is in context.
- Anti-patterns blocked by the instruction file today: `@Autowired` injection, `raw fetch` in frontend, inline secrets.

**Capability 5 — Leverage Copilot's Chat for Debugging and Exploration** *(Demo 3)*
- Three-step debug workflow: describe symptom → paste relevant code → ask root cause then prevention.
- Chat is uniquely powerful for *exploration* questions ("how can this class of bug be prevented?") that span multiple files.
- Demo 3 showed Chat producing three cross-language type-safety suggestions (TypeScript labelled tuple, Python NamedTuple, Java record) in one response.

**Capability 6 — Be Mindful of Security and Privacy** *(Demo 4)*
- Three risks: open `.env` files contaminate suggestions; Copilot suggests hardcoded placeholders users sometimes use as real values; training data may include revoked-but-real token strings.
- All three stacks: env var → never source code. Failure mode differs: Python fails per-request, C# degrades gracefully, Java fails at startup.
- Production: Azure Key Vault for all three stacks.

**Capability 7 — Understand Limitations** *(All Demos)*

| Limitation | Observed in | Mitigation |
|-----------|------------|------------|
| Generates Pydantic v1 mutable defaults | Demo 1 Python | Keep Pydantic v2 examples at top of file |
| Generates POJO instead of Java record | Demo 1 Java | Add `// use Java record` comment |
| Omits auth dependency | Demo 2 Python | Always include `# Requires authentication` in comment |
| Async sugar on sync C# endpoints | Demo 2 C# | Check underlying service method signature first |
| `@Autowired` field injection | Demo 2 Java | Instruction file + active rejection |
| Symptom fix instead of root cause | Demo 3 Chat | Always ask for root cause *after* getting the fix |
| Suggests hardcoded secret placeholders | Demo 4 all | Instruction file; never copy token strings from suggestions |

### Common Pitfalls — Quick Reference

| Pitfall | Python | C# | Java |
|---------|--------|-----|------|
| Hardcoded secrets | `os.getenv()` required | `Environment.GetEnvironmentVariable()` | `@Value("${property}")` |
| Wrong coordinate index | `coords[0]` = longitude | n/a (DTOs use field names) | `coordinates.get(0)` = longitude |
| Missing auth | Add `Depends(get_current_user)` | Add `[Authorize]` attribute | Add Spring Security config |
| Mutable default | `Field(default_factory=list)` | `new List<string>()` in init | `new ArrayList<>()` in constructor |
| Wrong injection style | n/a | n/a | Constructor injection — not `@Autowired` |

### Next Workshop Preview

**Workshop 2: Intermediate Web Development**
- **Prompting techniques**: Explicit vs implicit prompts in a polyglot codebase
- **Zustand patterns**: Immutable state updates and offline sync (`syncManager.ts`)
- **Few-shot prompting**: Show one backend implementation, generate the others
- **Refactoring**: Extract duplicate proxy logic into shared services

**Preparation**:
- Read `frontend/src/store/useTripStore.ts` — understand the offline sync state fields
- Read `backend-csharp/Services/AiParsingService.cs` — understand the fallback pattern
- Read `backend-java/.../service/MapboxService.java` and `AzureMapsService.java` — understand the WebClient pattern

---

## Hands-On Exercise (Optional — 10 min)

**Task**: Add a `GET /api/trips/count` endpoint in all three backends that returns the number of trips owned by the current user.

**Python starting point** (`backend/main.py`):
```python
# GET /api/trips/count
# Returns the count of trips for the authenticated user
# Requires authentication
# Response: {"count": <integer>}
```

**C# starting point** (`backend-csharp/Controllers/VehicleController.cs`):
```csharp
/// <summary>
/// Returns metadata about AI service usage: total parse requests handled.
/// GET /api/v1/parse-stats
/// </summary>
```

**Java starting point** (`backend-java/.../controller/GeospatialController.java`):
```java
/**
 * GET /api/geocode/batch
 * Geocode multiple addresses in a single request.
 * @param addresses comma-separated list of address strings
 */
```

**Verification**:
```bash
# Python
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/trips/count
# Expected: {"count": 3}

# C# (no auth needed for stats)
curl http://localhost:8081/api/v1/parse-stats

# Java
curl "http://localhost:8082/api/geocode/batch?addresses=San+Francisco,Los+Angeles"
```

---

## Resources

- **Project Architecture**: `docs/ARCHITECTURE.md`
- **Full Project Instructions**: `docs/PROJECT_INSTRUCTIONS.md`
- **AI Coding Agent Guide**: `.github/copilot-instructions.md` (the instruction file Copilot reads)
- **Copilot Docs**: https://docs.github.com/copilot
- **GeoJSON Spec**: https://geojson.org (coordinates are always `[longitude, latitude]`)

**Questions?** Continue to Workshop 2 or ask the instructor for clarification.
