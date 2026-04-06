# Workshop 1: Foundational Web Development with GitHub Copilot — Python Focus

**Duration**: 60 minutes  
**Format**: Live demos + hands-on exercises (balanced)  
**Audience**: Developers familiar with Python (FastAPI) who are **brand new to GitHub Copilot**  
**Prerequisites**: Completed [setup-workshop-env.sh](../web-dev/setup/setup-workshop-env.sh), Copilot activated in VS Code  
**Reference**: [Key Definitions & Best Practices](00-key-definitions-best-practices.md) (read before attending)

> **Scope**: This workshop focuses exclusively on the **Python/FastAPI backend** (`backend/`, port 8000).  
> Separate workshops exist for [C# / ASP.NET](../csharp/02-intermediate-csharp-web-dev.md), [Java / Spring Boot](../java/01-foundational-web-dev-java.md), and [React / TypeScript](../react/01-foundational-react-dev.md).  
> Cross-stack comparisons appear as brief reference tables, not full walkthroughs.

---

## Learning Objectives

By the end of this workshop, you will:
1. **Understand Copilot's Role** — see how Copilot acts as a context-aware pair programmer, not an autocomplete engine
2. **Choose the Right Tool** — know when to use inline suggestions vs Chat vs inline chat (`Ctrl+I`)
3. **Provide Clear Context** — write prompts that give Copilot the right signal: framework, dependencies, and constraints
4. **Use Iterative Acceptance** — review and accept suggestions line-by-line; never blindly accept a block
5. **Customize Copilot** — understand how `.github/copilot-instructions.md` shapes every suggestion
6. **Leverage Chat for Debugging** — use Copilot Chat to diagnose bugs you can describe but can't locate
7. **Be Mindful of Security** — keep secrets in environment variables, never in code or completions

---

## Workshop Agenda

| Time | Section | Topic | Files |
|------|---------|-------|-------|
| 0–10 min | Quick-Start | Your First Copilot Interaction in VS Code | `backend/schemas.py` |
| 10–22 min | Demo 1 + Exercise | Inline Suggestions: Adding a Pydantic Field | `backend/schemas.py` |
| 22–34 min | Demo 2 + Exercise | Comment-Driven Generation: New FastAPI Endpoint | `backend/main.py` |
| 34–46 min | Demo 3 + Exercise | Chat Debugging: Coordinate Parsing Bug | `backend/main.py` |
| 46–58 min | Demo 4 + Exercise | Security: How Python Hides API Tokens | `backend/main.py`, `backend/auth.py` |
| 58–60 min | Summary | Key Takeaways + Next Steps | — |

---

## Copilot Quick-Start: Your First 10 Minutes (10 min)

> **Goal**: Every attendee triggers their first Copilot suggestion and sends their first Chat message before the demos begin.

### Step 1 — Verify Copilot Is Active

Look at the bottom-right of VS Code. You should see the **Copilot icon** (sparkle/circle). If it shows a line through it, Copilot is disabled — click it and select **Enable Completions**.

### Step 2 — Your First Inline Suggestion

1. Open `backend/schemas.py`
2. Place your cursor at the end of line 38 (after `vehicle_specs: Any`)
3. Press `Enter` to create a new line and type:
   ```python
   description: Optional[str] = None
   ```
4. **Before you finish typing**, Copilot will show grey "ghost text" — this is an inline suggestion
5. Press `Tab` to accept, or `Esc` to reject

**What just happened?** Copilot read the entire `schemas.py` file — the imports (`Optional` from `typing`), the existing Pydantic field patterns, and the `BaseModel` inheritance — then predicted what you were likely to type next. This is **context-aware completion**, not simple autocomplete.

### Step 3 — Meet Copilot Chat

| Action | Shortcut (Windows) | What It Does |
|--------|-------------------|--------------|
| Open Chat Panel | `Ctrl+Alt+I` | Full chat in the sidebar — for conversations, debugging, exploration |
| Inline Chat | `Ctrl+I` | Ask a quick question about selected code — stays in the editor |
| Quick Chat | `Ctrl+Shift+I` | Lightweight floating chat — for one-off questions |

**Try it now**: Open the Chat Panel (`Ctrl+Alt+I`) and type:
```
What does the TripBase class in schemas.py do?
```

Copilot answers using the file context. Now try with a **chat participant** for broader context:
```
@workspace What Pydantic models exist in the backend?
```

The `@workspace` participant searches your entire project, not just the open file.

### Step 4 — Essential Slash Commands

Type `/` in the Chat panel to see available commands. The most important ones for this workshop:

| Command | Purpose | Example |
|---------|---------|---------|
| `/explain` | Explain selected code in plain language | Select `get_current_user`, type `/explain` |
| `/fix` | Suggest a fix for selected broken code | Select buggy code, type `/fix` |
| `/tests` | Generate test scaffolds | Select a function, type `/tests` |
| `/doc` | Generate docstrings | Select a function, type `/doc` |

**Try it now**: In `backend/schemas.py`, select the entire `POIResponse` class (lines 95–110), then use inline chat (`Ctrl+I`) and type `/explain`. Read the explanation.

### Step 5 — Choose the Right Tool

This is from [GitHub's official best practices](https://docs.github.com/en/copilot/get-started/best-practices#choose-the-right-copilot-tool-for-the-job):

| Situation | Best Tool | Why |
|-----------|-----------|-----|
| Completing code as you type | **Inline suggestions** (automatic) | Fast, low-friction, stays in flow |
| Quick question about selected code | **Inline chat** (`Ctrl+I`) | Stays in the editor, context-rich |
| Debugging, exploring, multi-file questions | **Chat panel** (`Ctrl+Alt+I`) | Full conversation history, persistent |
| Understanding unfamiliar code | `/explain` in Chat or inline | Purpose-built for explanations |
| Generating a test scaffold | `/tests` in Chat | Purpose-built for test generation |

**Key insight**: Inline suggestions and Chat complement each other. Use inline for *writing*, Chat for *thinking*.

---

## Demo 1: Inline Suggestions — Adding a Field to a Pydantic Model (12 min)

> **Capabilities in focus**: Understand Copilot's Role · Provide Clear Context · Iterative Acceptance · Understand Limitations

### Objective

See how Copilot reads your file's existing patterns to suggest new code. Practise **line-by-line acceptance** and learn where Copilot predictably gets Python/Pydantic wrong.

### How Copilot Reads Context

Copilot does not just autocomplete syntax. Before suggesting, it reads:
- **Imports** at the top of the file (`from pydantic import BaseModel, Field, field_validator`)
- **Existing patterns** directly above the cursor (field naming, type annotations, defaults)
- **Open files** in adjacent tabs (the instruction file, related modules)

This means **code organisation matters for AI assistance** — consistent, pattern-rich files produce better suggestions than sprawling, inconsistent ones.

### Scenario

Product wants to add a `waypoint_notes` field to trips — a list of per-stop text notes that users can attach. We need to add it to the `TripBase` schema in `backend/schemas.py`.

### Before Demo: Setup

Open these files side-by-side:
```bash
code backend/schemas.py
code backend/models.py       # for reference — SQLAlchemy model
```

### The Existing Code

**`backend/schemas.py` — `TripBase` (lines 35–38)**:
```python
class TripBase(BaseModel):
    name: str
    stops: List[Any]
    vehicle_specs: Any
```

Note: the file already imports `Optional`, `List`, `Field`, and `field_validator` at line 1. Copilot will use these.

**Also in the same file — `VehicleSpecsResponse` (lines 87–93)** — shows the project's field convention:
```python
class VehicleSpecsResponse(BaseModel):
    """Response model for /api/vehicle-specs endpoint matching AI service output"""
    height: float          # meters
    width: float           # meters
    length: Optional[float] = None  # meters
    weight: float          # tonnes
    fuelType: str          # camelCase to match frontend
    range: int             # miles
    mpg: float             # miles per gallon
```

### Live Coding: Add `waypoint_notes` to `TripBase`

**Step 1 — Type a descriptive comment** (this is the prompt):
Position your cursor after `vehicle_specs: Any` on line 38 and press Enter. Type:
```python
    # Add optional waypoint_notes field: list of per-stop text notes, default empty list
```

**Step 2 — Watch the inline suggestion appear**:

Expected Copilot suggestion (ghost text):
```python
    waypoint_notes: Optional[List[str]] = Field(default_factory=list)
```

**Step 3 — Review before accepting**:

| Check | Pass? | Notes |
|-------|-------|-------|
| Uses `Optional` with `Field(default_factory=list)` | ✅ | Correct Pydantic v2 pattern |
| Uses typed `List[str]` — not `Any` | ✅ | Specific type avoids runtime surprises |
| Uses `Field()` from pydantic | ✅ | Already imported at line 1 |
| Default is mutable-safe | ✅ | `default_factory` avoids shared mutable default |

Press `Tab` to accept.

### What If Copilot Suggests the Wrong Pattern?

Copilot's most common Python mistake: **mutable default `= []`** instead of `Field(default_factory=list)`.

```python
# ❌ WRONG — Copilot may suggest this (trained on Pydantic v1 examples):
waypoint_notes: Optional[List[str]] = []

# ✅ CORRECT — Pydantic v2 pattern:
waypoint_notes: Optional[List[str]] = Field(default_factory=list)
```

**If you see `= []`**: Press `Esc` to reject. Then retype the comment with more context:
```python
    # Add optional waypoint_notes: List[str], use Field(default_factory=list) for safe default
```

This is **iterative prompting** — when the first suggestion is wrong, add more context to the comment and try again. GitHub's official docs call this [experiment and iterate](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering#experiment-and-iterate).

### Keyboard Shortcuts for Inline Suggestions

```
Tab            — Accept the entire suggestion
Ctrl+→         — Accept one word at a time
Esc            — Reject the current suggestion  
Alt+]          — Show next alternative suggestion
Alt+[          — Show previous alternative suggestion
```

**Rule of thumb**: If a suggestion introduces a new import or pattern you didn't expect, press `Esc` and re-prompt with more specific context.

### Teaching Points

**Capability 1 — Understand Copilot's Role**: Copilot produced `Field(default_factory=list)` because it saw the existing `Field(...)` usage in `POIResponse` (lines 95–100) in the same file. If that class weren't there, the suggestion would likely be the inferior `= []` pattern. **Open related pattern-rich code** before asking Copilot to generate new code.

**Capability 7 — Understand Limitations**: Copilot is trained on millions of public Python repos, many using Pydantic v1 where `= []` was acceptable. When your project uses Pydantic v2 patterns, Copilot's training data creates a bias toward the older style. Always verify defaults on list/dict fields.

### Verification

```bash
cd backend
python -c "from schemas import TripBase; print(TripBase.model_fields.keys())"
# Expected: dict_keys(['name', 'stops', 'vehicle_specs', 'waypoint_notes'])
```

### 🏋️ Try It Yourself (5 min)

**Task**: Add an `estimated_duration_hours` field to the `TripCreate` schema (lines 40–45 in `schemas.py`).

Requirements:
- Type: `Optional[float]`
- Default: `None`
- Must follow the existing field pattern in `TripCreate`

**Steps**:
1. Position cursor after `route_geojson: Optional[dict] = None` (line 45)
2. Type a descriptive comment as the prompt
3. Review the inline suggestion — check the type, the default, and the import
4. Accept or reject and re-prompt

**Verify**:
```bash
python -c "from schemas import TripCreate; print('estimated_duration_hours' in TripCreate.model_fields)"
# Expected: True
```

**Common mistake to watch for**: Copilot may suggest `float` instead of `Optional[float]`, making the field required. Since trips don't always have a pre-calculated duration, it should be optional.

---

## Demo 2: Comment-Based Generation — New FastAPI Endpoint (12 min)

> **Capabilities in focus**: Provide Clear Context · Customize Copilot · Iterative Acceptance · Understand Limitations

### Objective

Use structured comment prompts to generate a complete FastAPI endpoint. Learn the **comment anatomy** pattern that consistently produces correct results, and see how the project's instruction file constrains Copilot's output.

### The Instruction File: Your Team's Rules for Copilot

Before writing any code, open [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) (pin this tab — it matters).

Key rules that affect every Python suggestion:
```markdown
# From .github/copilot-instructions.md:
- Use HTTPException with clear status codes (not generic Exception)
- Business logic belongs in *_service.py, NOT in main.py route handlers
- No hardcoded strings — use constants files
```

**Ask the group**: *"If the instruction file says 'use HTTPException with clear status codes', what happens when Copilot generates an endpoint with a bare `except Exception`?"*

Answer: Copilot reads the instruction file and biases away from generic exceptions. But it's not perfect — Capability 7 (Limitations) means you must still review. The instruction file is a **guardrail**, not a guarantee.

### Prompt Engineering: The Comment Anatomy

From [GitHub's prompt engineering guide](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering): *"Start general, then get specific."*

A good endpoint comment prompt has **four parts**:

```python
# [HTTP METHOD + PATH]    →  GET /api/trips/recent
# [BEHAVIOUR]             →  Returns the 5 most recent trips, sorted by created_at desc
# [DEPENDENCIES]          →  Requires: get_current_user dependency, get_db dependency
# [RETURN CONTRACT]       →  Response model: list[schemas.Trip]
```

**Remove any one part and the suggestion degrades predictably**:
- Missing `[DEPENDENCIES]` → Copilot omits `Depends(get_current_user)` — endpoint is unauthenticated!
- Missing `[RETURN CONTRACT]` → Copilot guesses the response model, often incorrectly
- Missing `[HTTP METHOD + PATH]` → Copilot generates a plain function, not a route

### Side-by-Side: Vague Prompt vs Specific Prompt

**Vague prompt** (try this first to show the difference):
```python
# Add a recent trips endpoint
```

**Likely result** — missing auth, wrong response model, uncertain limit:
```python
@app.get("/api/recent-trips")  # wrong path convention
def get_recent_trips(db: Session = Depends(get_db)):  # no auth!
    return db.query(models.Trip).limit(10).all()  # wrong limit, unscoped
```

**Specific prompt** (the correct way):
```python
# GET /api/trips/recent
# Returns the 5 most recent trips for the authenticated user, sorted by created_at descending
# Requires: get_current_user dependency, get_db dependency
# Response model: list[schemas.Trip]
```

### Scenario

The app needs `GET /api/trips/recent`: the last 5 trips for the current user, sorted newest-first.

### The Existing Pattern to Model

**`backend/main.py` — `read_trips` endpoint** (the existing handler Copilot will learn from):
```python
@app.get("/api/trips", response_model=list[schemas.Trip])
def read_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    trips = db.query(models.Trip).filter(
        models.Trip.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return trips
```

### Live Coding

**Step 1** — Navigate below `read_trips` in `backend/main.py`. Type the four-part comment:
```python
# GET /api/trips/recent
# Returns the 5 most recent trips for the authenticated user, sorted by created_at descending
# Requires: get_current_user dependency, get_db dependency
# Response model: list[schemas.Trip]
```

**Step 2** — Watch Copilot generate:
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

**Step 3** — Review checklist:

| Check | Pass? | Notes |
|-------|-------|-------|
| `Depends(get_current_user)` present | ✅ | Auth required — matches our comment |
| `response_model=list[schemas.Trip]` | ✅ | Typed return contract |
| `.order_by(models.Trip.created_at.desc())` | ✅ | Correct sort direction |
| `.limit(5)` hardcoded | ✅ | Fixed limit per spec (no pagination params) |
| No `skip`/`offset` params | ✅ | "Recent 5" is intentionally fixed |

**Step 4** — Check for common mistakes:

| What Copilot gets wrong | Why | How to fix |
|------------------------|-----|------------|
| Adds `skip: int = 0` pagination | Copied from nearby `read_trips` | Delete the parameter — recent-5 is fixed |
| Uses `except Exception` | Generic handlers dominate training data | Re-prompt: "use HTTPException" |
| Omits `get_current_user` | Comment didn't mention auth explicitly | Always include `# Requires authentication` |
| Invents non-existent column name | Plausible-sounding but fictional | Always check `models.py` before accepting |

### Verification

```bash
cd backend && uvicorn main:app --reload
# Open http://localhost:8000/docs — GET /api/trips/recent should appear in Swagger
```

### 🏋️ Try It Yourself (5 min)

**Task**: Generate a `GET /api/trips/count` endpoint that returns the count of trips for the authenticated user.

**Write this four-part comment in `backend/main.py`**:
```python
# GET /api/trips/count
# Returns the count of trips for the authenticated user
# Requires: get_current_user dependency, get_db dependency
# Response: {"count": <integer>}
```

**Expected result** (what Copilot should generate):
```python
@app.get("/api/trips/count")
def count_trips(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    count = db.query(models.Trip).filter(
        models.Trip.user_id == current_user.id
    ).count()
    return {"count": count}
```

**Verify**:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/trips/count
# Expected: {"count": 3}  (or whatever number of trips exist)
```

**Watch for**: Copilot may suggest `response_model=dict` or invent a `CountResponse` schema. Since the response is a simple dict, no response model is needed — but if Copilot creates one, that's actually a good practice (just verify it matches the contract).

---

## Demo 3: Chat Debugging — Coordinate Parsing Bug (12 min)

> **Capabilities in focus**: Chat for Debugging · Provide Clear Context · Understand Limitations

### Objective

Use Copilot Chat to diagnose a real coordinate-format bug. Learn the **three-step debug workflow** and see why Copilot's first answer sometimes fixes the *symptom* instead of the *root cause*.

### The Three-Step Debug Workflow

From [GitHub's best practices](https://docs.github.com/en/copilot/get-started/best-practices): *"Be specific about your requirements."*

```
Step 1 — Describe the SYMPTOM (not your guess)
  ✅ "POI search results appear in the wrong city"
  ❌ "I think the coordinates are swapped — fix them"

Step 2 — Provide the RELEVANT CODE
  Paste or reference the exact function and lines (#file:main.py)

Step 3 — Ask for ROOT CAUSE, then PREVENTION
  "What is the root cause?"
  "How can we prevent this class of bug?"
```

The third question — *prevention* — is where Chat provides the most value. It will suggest type aliases, named tuples, or validator functions.

### Background: The Coordinate Convention Problem

| Source | Convention | Example for San Francisco |
|--------|-----------|---------------------------|
| GeoJSON / Mapbox | `[longitude, latitude]` | `[-122.4194, 37.7749]` |
| Google Maps | `LatLng(latitude, longitude)` | `LatLng(37.7749, -122.4194)` |
| Azure Maps REST | `{ lat: ..., lon: ... }` | `{ lat: 37.7749, lon: -122.4194 }` |

The frontend sends proximity as `"lng,lat"` (e.g., `"-122.4194,37.7749"`). The Python backend must parse this correctly for Azure Maps.

### The Real Code

**`backend/main.py` — `search_places()` proximity parsing**:
```python
@app.get("/api/search")
async def search_places(query: str, proximity: str = None):
    azure_key = os.getenv("AZURE_MAPS_KEY")
    if not azure_key:
        raise HTTPException(status_code=500, detail="Azure Maps key not configured")
    
    # Parse proximity parameter (lng,lat → lat, lon for Azure Maps)
    lat, lon = None, None
    if proximity:
        try:
            coords = proximity.split(',')
            lon = float(coords[0])  # Longitude first in input
            lat = float(coords[1])  # Latitude second in input
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="Invalid proximity format")
    
    if lat and lon:
        params["lat"] = lat
        params["lon"] = lon
```

### Live Demo: Introduce the Bug

Temporarily swap the coordinate assignments:
```python
    # ❌ BUGGY VERSION — swap lon and lat:
    lat = float(coords[0])  # WRONG: -122.4194 is longitude, not latitude
    lon = float(coords[1])  # WRONG: 37.7749 is latitude, not longitude
```

### The Symptom Fix Trap (Show This First)

Open Copilot Chat (`Ctrl+Alt+I`) and type a **vague prompt**:
```
The search_places endpoint in main.py is returning POIs in the wrong location. How do I fix it?
```

Copilot's likely response: a generic suggestion to "check the coordinate order" or to swap variable names — **a symptom fix** that may not identify the actual root cause.

### The Root Cause Prompt (Show This Second)

Now try a **specific prompt** with data:
```
In backend/main.py search_places(), the proximity parameter comes from the 
frontend as "lng,lat" (e.g., "-122.4194,37.7749"). 

The current code does:
  lat = float(coords[0])  # assigns -122.4194 to lat
  lon = float(coords[1])  # assigns 37.7749 to lon

POI search results are clustered in the wrong city. What is the root cause?
```

**Expected Copilot response** (key points):
- `coords[0]` is `"-122.4194"` — this is the **longitude**, not latitude
- Assigning it to `lat` sends `-122.4194` as latitude to Azure Maps (valid range: -90 to 90)
- Azure Maps will either reject it or return results from the wrong hemisphere
- Fix: `lon = float(coords[0])` and `lat = float(coords[1])`

### The Correct Code (already in the repo)

```python
    coords = proximity.split(',')
    lon = float(coords[0])  # ✅ Longitude is index 0 ("lng,lat" format)
    lat = float(coords[1])  # ✅ Latitude is index 1
```

### Ask the Prevention Question

```
How can we make the proximity parsing in search_places() self-documenting 
so this coordinate swap bug cannot be introduced silently?
```

Copilot will suggest approaches like:
- A `NamedTuple` with `lng` and `lat` fields instead of index-based parsing
- A validator function: `parse_proximity(proximity: str) -> tuple[float, float]`
- Type alias: `LngLat = tuple[float, float]` with doc comments

**Key teaching point**: The quality of Chat's diagnosis is proportional to prompt specificity.

| Prompt quality | Result quality |
|---------------|---------------|
| Vague: "results wrong, fix it" | Symptom fix — may swap wrong things |
| Specific: code + data + expected vs actual | Root cause + prevention |

### 🏋️ Try It Yourself (5 min)

**Task**: Use Copilot Chat to diagnose this bug in the `geocode_address` endpoint.

**The scenario**: You modified `geocode_address` to return coordinates, but frontends receive `[lat, lng]` instead of `[lng, lat]`:

```python
# Imagine this buggy return:
return {
    "coordinates": [feature['geometry']['coordinates'][1],  # lat first — WRONG
                    feature['geometry']['coordinates'][0]],  # lng second — WRONG
    "place_name": feature['place_name']
}
```

**Steps**:
1. Open Chat (`Ctrl+Alt+I`)
2. Write a specific prompt: describe the symptom, paste the code, provide expected data
3. Ask for root cause
4. Ask: "How does GeoJSON specify coordinate order?"

**Expected answer**: GeoJSON always uses `[longitude, latitude]`. The fix is to return `feature['geometry']['coordinates']` directly without reordering.

---

## Demo 4: Security Pattern — How Python Hides API Tokens (12 min)

> **Capabilities in focus**: Security & Privacy · Provide Clear Context · Customize Copilot · Understand Limitations

### Objective

Understand the Python secret-injection pattern (`os.getenv()` + `python-dotenv`). Learn why Copilot itself is a security risk vector if used carelessly with `.env` files open. See how the project's instruction file enforces this.

### Three Security Risks from Copilot

**Risk 1 — Copilot reads open files, including `.env`**
If you open `.env` in VS Code while Copilot is active, secrets may leak into suggestions for other files. **Never open `.env` files while screen-sharing or pair-programming with Copilot.**

**Risk 2 — Copilot suggests hardcoded secrets when it lacks context**
Without `main.py` open showing the `os.getenv()` pattern, Copilot may suggest:
```python
# ❌ Copilot may suggest this when it has no env-var context:
MAPBOX_TOKEN = "pk.eyJ1IjoiZXhhbXBsZSI..."  # placeholder users might replace with real tokens
```

The instruction file at [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) blocks this:
```markdown
# From copilot-instructions.md — Pitfalls:
# 7. Hardcoding API tokens: Use environment variables + .env files (never commit!)
```

**Risk 3 — Copilot may suggest real-looking token strings**
Copilot was trained on public code that once contained real (now-revoked) API keys. **Never copy a token string from a Copilot suggestion** — always generate credentials from your provider's console.

### Pattern A — `os.getenv()` Per Request (Mapbox, Azure Maps)

**Real code in `backend/main.py` — `geocode_address`**:
```python
@app.get("/api/geocode")
async def geocode_address(q: str):
    token = os.getenv("MAPBOX_TOKEN")      # ✅ Read from environment at request time
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{q}.json"
          f"?access_token={token}&limit=1"
```

**Real code — `search_places`**:
```python
@app.get("/api/search")
async def search_places(query: str, proximity: str = None):
    azure_key = os.getenv("AZURE_MAPS_KEY")  # ✅ Different key for Azure Maps
    if not azure_key:
        raise HTTPException(status_code=500, detail="Azure Maps key not configured")
```

**Why per-request instead of module-level?**
- Module-level constants evaluate at import time — in tests, `.env` may not be loaded yet
- Per-request means the `HTTPException(500)` fires at the right moment with a clear message
- `load_dotenv()` is called at the top of `main.py` (line 13) — it reads `.env` into the environment

### Pattern B — Startup Validation with Warnings (Auth)

**Real code in `backend/auth.py` (lines 12–15)**:
```python
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    print("WARNING: SECRET_KEY not set. Using insecure default for development only.",
          file=sys.stderr)
    SECRET_KEY = "dev-secret-key-change-in-production"
```

**Why this is different from Pattern A**:
- The `SECRET_KEY` is used in JWT signing — it must be available at import time (before any request)
- A **warning + fallback** is used because local development must work without full env setup
- The fallback value is **intentionally insecure** — it will never be mistaken for production

### Copilot Chat: Explore the Pattern

Ask Chat:
```
In backend/main.py, MAPBOX_TOKEN is read inside each endpoint handler using 
os.getenv(). But in auth.py, SECRET_KEY is read at module level. 
Why are these two patterns different?
```

Expected answer: Mapbox token is optional per-endpoint (can fail gracefully with a 500); SECRET_KEY is required for all JWT operations (must be available before any auth request). Both use `os.getenv()` but at different lifecycle stages.

### Cross-Stack Comparison (Brief Reference)

The same secret-hiding pattern looks different in each language:

| Concern | Python (`main.py`) | C# (`AiParsingService.cs`) | Java (`MapboxService.java`) |
|---------|-------------------|--------------------------|----------------------------|
| How secret is read | `os.getenv()` per request | `Environment.GetEnvironmentVariable()` in constructor | `@Value("${property}")` via Spring |
| Failure mode | `HTTPException(500)` at request time | `LogWarning` + graceful fallback | `BeanCreationException` at startup |
| Local config | `.env` + `python-dotenv` | OS env / `launchSettings.json` | `.env` via docker-compose |
| Production | Azure Key Vault via App Service | Key Vault references | Spring Cloud Azure Key Vault |

### Never Do This

```python
# ❌ WRONG — hardcoded token committed to Git:
MAPBOX_TOKEN = "sk.eyJ1IjoiYWN0dWFsLXRva2VuIiwiYSI6...}"

# ❌ WRONG — default value that looks like a real token:
token = os.getenv("MAPBOX_TOKEN", "pk.eyJ1IjoibXlhcHAiLCJhIjoiY2x...")

# ✅ CORRECT — fail explicitly, no fallback for API keys:
token = os.getenv("MAPBOX_TOKEN")
if not token:
    raise HTTPException(status_code=500, detail="Mapbox token not configured")
```

### Verification

```bash
# Confirm no hardcoded tokens in Python backend
grep -rn "sk\.\|pk\.eyJ" backend/ --include="*.py"
# Expected: no results (only test fixtures or comments)

# Confirm os.getenv is used for all API keys
grep -n "os.getenv" backend/main.py
# Expected: MAPBOX_TOKEN, AZURE_MAPS_KEY, and others
```

### 🏋️ Try It Yourself (5 min)

**Task**: Ask Copilot to generate a new endpoint that calls an external API, then verify it uses `os.getenv()` correctly.

**Steps**:
1. In `backend/main.py`, type this comment below the existing endpoints:
```python
# GET /api/weather
# Returns current weather for given coordinates using OpenWeatherMap API
# Requires: lat and lon query parameters
# Uses OPENWEATHER_API_KEY environment variable
```

2. Let Copilot generate the endpoint
3. **Review the security pattern**:
   - Does it use `os.getenv("OPENWEATHER_API_KEY")`? ✅
   - Does it validate with `if not key: raise HTTPException(500)`? ✅
   - Does it hardcode a fallback key? ❌ Reject if so
   - Does the URL contain a literal API key? ❌ Reject if so

4. If Copilot generated a hardcoded key, delete it and re-prompt with:
```python
# GET /api/weather — read OPENWEATHER_API_KEY from os.getenv(), no fallback, raise 500 if missing
```

**Teaching moment**: The instruction file should block hardcoded keys, but Copilot's suggestion quality depends on context. Having `main.py` open (with its `os.getenv()` pattern) gives Copilot the right signal.

---

## Workshop Summary & Key Takeaways (2 min)

### The 7 Capabilities — What Each Section Taught

| Capability | Where You Saw It | Key Takeaway |
|-----------|-----------------|--------------|
| **1. Copilot's Role** | Demo 1 | Copilot reads your file patterns. Open well-structured code before asking for new code. |
| **2. Choose the Right Tool** | Quick-Start | Inline for writing, Chat for thinking, `/explain` for understanding. |
| **3. Clear Context** | Demo 2 | Four-part comment anatomy: METHOD + BEHAVIOUR + DEPENDENCIES + RETURN. |
| **4. Iterative Acceptance** | Demo 1 | `Tab` to accept, `Esc` to reject, `Alt+]` for alternatives. Never accept blindly. |
| **5. Customize Copilot** | Demo 2 | `.github/copilot-instructions.md` constrains suggestions. Pin it as an open tab. |
| **6. Chat for Debugging** | Demo 3 | Symptom → code → root cause → prevention. Specific prompts get root causes. |
| **7. Security** | Demo 4 | `os.getenv()` always. Never hardcode. Never open `.env` during pairing. |

### Python-Specific Pitfalls — Quick Reference

| Pitfall | What Copilot Suggests | Correct Pattern |
|---------|----------------------|-----------------|
| Mutable default | `waypoint_notes: List[str] = []` | `Field(default_factory=list)` |
| Missing auth | No `Depends(get_current_user)` | Add `# Requires authentication` to comment |
| Generic exception | `except Exception` | `raise HTTPException(status_code=..., detail=...)` |
| Hardcoded token | `MAPBOX_TOKEN = "pk.eyJ..."` | `os.getenv("MAPBOX_TOKEN")` + validation |
| Wrong coordinate | `lat = coords[0]` | `lon = coords[0]` (GeoJSON: index 0 = longitude) |
| Pydantic v1 style | bare `class Config:` | `model_config = ConfigDict(from_attributes=True)` |

### Prompt Engineering Quick Reference

From [GitHub's official guide](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering):

| Strategy | Example |
|----------|---------|
| **Start general, then specific** | "Add a field" → "Add Optional[float] field with Field(ge=0)" |
| **Give examples** | "Like the existing VehicleSpecsResponse height field" |
| **Break complex tasks down** | "First add the schema, then add the endpoint, then add the test" |
| **Avoid ambiguity** | "the TripBase class in schemas.py" — not "this class" |
| **Indicate relevant code** | `#file:schemas.py` or `@workspace` in Chat |
| **Iterate** | If wrong, `Esc` and add more context to the comment |

### Next Workshop Preview

**Workshop 2: Intermediate Web Development (Python Focus)**
- **Prompting techniques**: Explicit vs implicit prompts, few-shot prompting
- **Testing with Copilot**: Using `/tests` to generate `pytest` test scaffolds
- **Refactoring**: Extract business logic from `main.py` to service modules
- **Database migrations**: Alembic workflow with Copilot assistance

**Preparation**:
- Read `backend/vehicle_service.py` — understand the AI-first + fallback pattern
- Read `backend/tests/test_main.py` — understand the TestClient + mock fixture pattern
- Skim `backend/ai_service.py` — understand how the Python backend calls the C# service

---

## Resources

- **Copilot Quickstart**: https://docs.github.com/en/copilot/get-started/quickstart
- **Best Practices**: https://docs.github.com/en/copilot/get-started/best-practices
- **Prompt Engineering**: https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering
- **Chat Cheat Sheet**: https://docs.github.com/en/copilot/reference/chat-cheat-sheet
- **Project Architecture**: `docs/ARCHITECTURE.md`
- **Full Project Instructions**: `docs/PROJECT_INSTRUCTIONS.md`
- **Copilot Instruction File**: `.github/copilot-instructions.md`
- **GeoJSON Spec**: https://geojson.org (coordinates are always `[longitude, latitude]`)
- **Key Definitions**: [00-key-definitions-best-practices.md](00-key-definitions-best-practices.md)

---

## Appendix: Cross-Stack Comparison Tables

These tables are for reference only — each language has its own dedicated workshop.

### How Each Stack Adds a Typed Field (Demo 1 Pattern)

| Language | File | Pattern | Common Copilot Mistake |
|----------|------|---------|----------------------|
| **Python** | `backend/schemas.py` | `Field(default_factory=list)` | Suggests `= []` (Pydantic v1 style) |
| **TypeScript** | `frontend/src/store/useTripStore.ts` | Typed interface field | Suggests `any` type |
| **C#** | `backend-csharp/Models/AiModels.cs` | `public int MaxStops { get; set; } = 5;` | Omits XML `<summary>` doc |
| **Java** | `backend-java/.../dto/GeocodeResponse.java` | Java `record` field | Suggests POJO class instead of record |

### How Each Stack Hides Secrets (Demo 4 Pattern)

| Concern | Python | C# | Java |
|---------|--------|-----|------|
| Read mechanism | `os.getenv()` per request | `Environment.GetEnvironmentVariable()` in constructor | `@Value("${prop}")` via Spring |
| Failure mode | `HTTPException(500)` | `LogWarning` + fallback | `BeanCreationException` at startup |
| Local config | `.env` + `python-dotenv` | OS env / `launchSettings.json` | `application.properties` + docker-compose |
| Production | Azure Key Vault via App Service settings | Key Vault references | Spring Cloud Azure Key Vault |

### Coordinate Convention Reference

| Source | Format | San Francisco Example |
|--------|--------|----------------------|
| GeoJSON / Mapbox | `[longitude, latitude]` | `[-122.4194, 37.7749]` |
| Google Maps JS | `LatLng(lat, lng)` | `LatLng(37.7749, -122.4194)` |
| Azure Maps REST | `{ lat, lon }` named fields | `{ lat: 37.7749, lon: -122.4194 }` |
| Python `proximity` param | `"lng,lat"` string | `"-122.4194,37.7749"` |
