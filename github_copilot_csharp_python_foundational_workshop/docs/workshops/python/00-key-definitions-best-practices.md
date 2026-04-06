# GitHub Copilot: Key Definitions & Best Practices for Web Development

**Last Updated**: February 25, 2026  
**Workshop Series**: Road Trip Planner - GitHub Copilot for Web Developers  
**Reference Guide**: Read before attending workshops

---

## Table of Contents

1. [Key Definitions](#key-definitions)
2. [Prompting Techniques](#prompting-techniques)
3. [Best Practices for AI-Assisted Web Development](#best-practices-for-ai-assisted-web-development)
4. [Common Pitfalls & How to Avoid Them](#common-pitfalls--how-to-avoid-them)
5. [Quick Reference](#quick-reference)

---

## Key Definitions

### What is GitHub Copilot?

**GitHub Copilot** is an AI-powered coding assistant developed by GitHub and OpenAI that provides real-time code suggestions, completions, and explanations directly in your code editor.

**Core Capabilities**:
- **Inline Code Suggestions**: Autocomplete entire functions, classes, or code blocks as you type
- **Chat Interface**: Ask questions, debug code, explain functions, refactor logic
- **Multi-language Support**: Works with JavaScript/TypeScript, Python, Go, Java, C#, and 30+ languages
- **Context-Aware**: Analyzes your entire codebase, open files, and recent changes to provide relevant suggestions

**How It Works**:
1. Copilot analyzes your code context (current file, related files, comments)
2. Sends context to OpenAI's Codex model (GPT-4 based)
3. Returns suggestions based on patterns learned from billions of lines of public code
4. You accept, reject, or modify suggestions

**Example**:
```typescript
// You type this comment:
// Create a function that calculates total trip distance in miles

// Copilot suggests this code:
function calculateTripDistance(stops: Stop[]): number {
  let totalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    totalDistance += getDistanceBetweenPoints(
      stops[i].coordinates,
      stops[i + 1].coordinates
    );
  }
  return totalDistance;
}
```

---

### What is an MCP Server?

**MCP (Model Context Protocol) Server** is a standardized protocol for AI tools to access external data sources, APIs, and services to enhance their contextual understanding.

**Purpose**: Extends GitHub Copilot's knowledge beyond its training data by connecting to:
- **Documentation sources** (Microsoft Docs, library APIs, Stack Overflow)
- **Cloud services** (Azure resource introspection, AWS infrastructure)
- **Internal tools** (Company wikis, design systems, style guides)

**Real-World Example from Road Trip Planner**:

**Without MCP**:
```typescript
// Copilot suggests outdated Mapbox Directions API v4 (deprecated 2020)
const response = await fetch(`https://api.mapbox.com/v4/directions/...`);
```

**With `@context7` MCP Server**:
```typescript
// Instructor: @context7 Fetch latest Mapbox Directions API documentation

// Copilot suggests current Mapbox Directions API v5 with truck profile
// NOTE: This is server-side code (Java backend) — never call Mapbox from frontend
const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}`;
// Java backend uses MAPBOX_TOKEN env variable to proxy this request
```

**MCP Servers Used in Road Trip Planner**:
- `@context7`: Fetches up-to-date library documentation (Mapbox, React, FastAPI)
- `mcp_com_microsoft_*`: Azure resource introspection, best practices, Bicep schemas
- Custom MCP: Internal style guide enforcement, API contract validation

**When to Use MCP**:
- ✅ Need latest API documentation (libraries change frequently)
- ✅ Company-specific patterns (internal design systems)
- ✅ Cloud resource queries (list Azure subscriptions, resource groups)
- ❌ Basic language syntax (Copilot already knows JavaScript/Python)
- ❌ Public libraries with stable APIs (React fundamentals)

---

### What are Custom Agents?

**Custom Agents** are specialized AI assistants configured for specific tasks, created using `.agent.md` files with instructions, tools, and workflows.

**Structure of a Custom Agent**:
```markdown
# Agent Name
Your agent's purpose and expertise

## Instructions
- What this agent should do
- How it should behave
- Constraints and rules

## Tools
- read_file: Read project files
- grep_search: Search codebase
- run_in_terminal: Execute commands

## Example Usage
@agent-name "Task description"
```

**Road Trip Planner Custom Agents** (14 total):

**Testing & Quality (5 agents)**:
- `@tdd-red`: Write failing tests first (TDD Red phase)
- `@tdd-green`: Implement minimal code to pass tests (TDD Green phase)
- `@tdd-refactor`: Clean up code after tests pass (TDD Refactor phase)
- `@accessibility`: WCAG AA compliance audits
- `@playwright-tester`: E2E test generation with Playwright

**Planning & Research (3 agents)**:
- `@task-researcher`: Deep research with web access
- `@task-planner`: Create actionable implementation plans
- `@debug`: Systematic bug investigation

**Code Quality (2 agents)**:
- `@tech-debt-remediation-plan`: Analyze technical debt (read-only)
- `@janitor`: Code cleanup (remove unused imports, standardize errors)

**Infrastructure & Documentation (4 agents)**:
- `@terraform-azure-planning`: Azure IaC planning
- `@context7`: Library documentation expert (MCP integration)
- `@api-docs-generator`: Enhance FastAPI Swagger docs
- `@pre-commit-enforcer`: Configure Husky/lint-staged

**Example Workflow** (Fixing TypeScript `any` violations):
```bash
# Step 1: Research
@task-researcher "Research TypeScript strict mode best practices"

# Step 2: Analyze technical debt
@tech-debt-remediation-plan "Find all instances of 'any' type in src/"

# Step 3: Write tests first
@tdd-red "Write tests for FloatingPanel props interface"

# Step 4: Implement fix
@tdd-green "Replace 'any' with proper TypeScript interface"

# Step 5: Clean up
@tdd-refactor "Consolidate duplicate type definitions"
```

**Creating Your Own Agent**:
```markdown
<!-- .github/copilot-agents/coordinate-validator.agent.md -->
# Coordinate Validator Agent

Validates GeoJSON coordinate format in code suggestions.

## Instructions
- Check all coordinate arrays use [longitude, latitude] order
- Flag [lat, lng] as incorrect (common bug with Google Maps patterns)
- Reference Mapbox GL JS documentation for correct format
- Suggest fixes for coordinate order errors

## Rules
- NEVER suggest [lat, lng] format
- ALWAYS use [lng, lat] (GeoJSON spec)
- Example: San Francisco = [-122.4194, 37.7749]
```

Usage: `@coordinate-validator "Check if these map markers use correct format"`

---

### What are Prompt Files?

**Prompt Files** (`.prompt.md`) are reusable, team-wide templates for common tasks that ensure consistency across developers.

**Purpose**: 
- Standardize how team members ask Copilot for help
- Encode best practices into prompts
- Share domain knowledge (API patterns, architecture rules)

**Road Trip Planner Prompt Files** (12 total in `.github/prompts/`):
- `version-update.prompt.md`: Semantic versioning workflow
- `plan-azureIacRoadmapUpdate.prompt.md`: Azure infrastructure planning
- `plan-mockExternalApisBackendTests.prompt.md`: Mock external APIs for backend tests
- Spec Kit prompts (9 files): Feature specification, planning, task generation

**Example**: `version-update.prompt.md`
```markdown
# Semantic Version Update Prompt

Update version numbers following semantic versioning (MAJOR.MINOR.PATCH).

## Steps
1. Check ROADMAP.md for completed issues in current milestone
2. Determine version increment:
   - MAJOR: Breaking API changes (0.x → 1.0, 1.x → 2.0)
   - MINOR: New features, backward-compatible (1.0 → 1.1)
   - PATCH: Bug fixes only (1.0.0 → 1.0.1)
3. Update package.json files (frontend, bff), CHANGELOG.md
4. Create git tag: `git tag v1.2.0`

## Example
Current: 1.1.5
Completed: Issue #14 (AI trip generation feature)
New version: 1.2.0 (MINOR - new feature added)
```

**Using Prompt Files**:
```bash
# VS Code Command Palette (Cmd+Shift+P)
> GitHub Copilot: Use Prompt File

# Select: version-update.prompt.md
# Copilot executes the workflow automatically
```

**Benefits**:
- ✅ **Consistency**: All team members follow same process
- ✅ **Onboarding**: New developers learn patterns faster
- ✅ **Quality**: Encodes best practices (e.g., semantic versioning rules)
- ✅ **Efficiency**: No need to re-explain complex workflows

---

### What and Why is an Instruction File?

**Instruction File** (`.github/copilot-instructions.md`) is a project-specific rulebook that guides ALL Copilot suggestions for your codebase.

**Purpose**:
- Enforce architectural patterns (BFF, API proxy, state management)
- Prevent technology substitutions (e.g., Redux → Zustand)
- Define coding standards (TypeScript strict mode, no `any` types)
- Document project-specific conventions (coordinate format, file organization)

**Road Trip Planner Instruction File** (~390 lines):

**Architecture Adherence (CRITICAL)**:
```markdown
## Architecture Adherence
DO NOT override or replace existing technology choices:
- Frontend Framework: React 18+ with TypeScript (NOT Vue, Angular)
- State Management: Zustand ONLY (NOT Redux, MobX, Context API)
- Map Library: React Map GL ONLY (NOT Leaflet, Google Maps)
- Python Backend: FastAPI ONLY (NOT Flask, Django)
- C# Backend: ASP.NET Web API (.NET 8) for AI services (Azure OpenAI)
- Java Backend: Spring Boot 3 for geospatial (Mapbox, Azure Maps)
- BFF: Node.js + Express API gateway (NOT Fastify, Koa)
- Database ORM: SQLAlchemy ONLY in Python (NOT Django ORM, raw SQL)
```

**Coding Standards**:
```markdown
## TypeScript Standards
- No `any` types allowed - all props/state must have interfaces
- Component props: Define `interface ComponentProps` above component
- API responses: Use typed interfaces in `src/types/`

## Python Standards
- Pydantic models for all API schemas
- Business logic in `backend/*_service.py`, NOT in `main.py`
- Use `HTTPException` with clear status codes
```

**Project-Specific Conventions**:
```markdown
## Coordinate Format Convention
Always use GeoJSON format: [longitude, latitude]

✅ CORRECT:
const coords: [number, number] = [-122.4194, 37.7749];

❌ WRONG (Lat/Lng reversed):
const coords = [37.7749, -122.4194];
```

**Why Instruction Files Matter**:

**Without Instruction File**:
```typescript
// Developer: "Create a state store for trip data"

// Copilot suggests Redux (wrong for this project):
import { createStore } from 'redux';

const tripReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_STOP':
      return { ...state, stops: [...state.stops, action.payload] };
    default:
      return state;
  }
};
```

**With Instruction File**:
```typescript
// Developer: "Create a state store for trip data"

// Copilot suggests Zustand (correct per instructions):
import { create } from 'zustand';

interface TripStore {
  stops: Stop[];
  addStop: (stop: Stop) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  stops: [],
  addStop: (stop) => set((state) => ({ stops: [...state.stops, stop] }))
}));
```

**Best Practices for Instruction Files**:
1. **Be Explicit**: "Use Zustand ONLY (NOT Redux)" vs "Prefer Zustand"
2. **Show Examples**: Include ✅ CORRECT and ❌ WRONG code snippets
3. **Explain Why**: "All external APIs must go through backend to hide API keys"
4. **Update Frequently**: Add rules as patterns emerge (e.g., coordinate format bugs)
5. **Keep Organized**: Use headers, table of contents, clear sections

---

## Prompting Techniques

### What is Chain-of-Thought Prompting?

**Chain-of-Thought (CoT) Prompting** breaks complex problems into step-by-step reasoning, making AI show its work instead of jumping to solutions.

**How It Works**:
- Instead of: "Build a vehicle routing feature"
- Use: "Let's plan step-by-step: 1) Analyze Mapbox API truck profile docs, 2) Design endpoint parameters, 3) Update schema..."

**Example from Workshop 3** (Simplified Issue #6: Vehicle-Aware Routing):

**❌ Without Chain-of-Thought** (vague, risky):
```
Prompt: "Add vehicle type to routing API"

Copilot: *Generates 200 lines of code with unknown logic*
```

**✅ With Chain-of-Thought** (structured, verifiable):
```
Prompt: "Plan vehicle-aware routing feature step-by-step:

Step 1: Research - What Mapbox truck profile parameters exist?
Step 2: Design - How should /api/directions accept a profile parameter?
Step 3: Schema - Update Java DTO or add @RequestParam to GeospatialController
Step 4: Logic - Map vehicle_type to Mapbox profile (driving vs driving-traffic vs truck)
Step 5: Test - Verify RV vs car returns different routes"

Copilot: 
"Step 1: Mapbox supports these profiles:
- driving-traffic (cars, with live traffic)
- driving (no traffic data)
- walking, cycling
- truck (NEW - supports height, weight, hazmat restrictions)

Step 2: /api/directions already accepts a 'profile' @RequestParam.
Add vehicle_type mapping in the Java service layer:
GET /api/directions?coords=lng,lat;lng,lat&profile=truck

Step 3: Update GeospatialController.java:
@GetMapping("/directions")
public ResponseEntity<DirectionsResponse> getDirections(
        @RequestParam("coords") String coords,
        @RequestParam(value = "profile", defaultValue = "driving") String profile) {
    ...
}

..."
```

**When to Use CoT**:
- ✅ Complex features (routing logic, AI integration, multi-step migrations)
- ✅ Unfamiliar APIs (first time using Mapbox truck profile)
- ✅ Debugging (trace error from frontend → backend → database)
- ❌ Simple tasks (adding a prop to a component)
- ❌ Well-known patterns (creating a React component)

**Real Workshop Demo** (Advanced Workshop, Demo 1):
```
Instructor: "Let's use chain-of-thought to plan vehicle routing:

1. What Mapbox API parameters control vehicle restrictions?
2. How do we map our vehicle specs (height, weight) to Mapbox format?
3. What error handling do we need if vehicle can't fit route?
4. How do we display 'Route safe for RV' in the UI?"

[Copilot generates step-by-step plan with code examples]
```

---

### What is Few-Shot Prompting?

**Few-Shot Prompting** teaches Copilot by showing examples of desired output, then asking it to generate similar code.

**Pattern**: "Here are 2-3 examples... now create one for X"

**Example from Workshop 2** (SQLAlchemy Relationships):

```python
# Show existing pattern (1-2 examples) — based on actual backend/models.py:
"""
Example 1: User has many Trips (one-to-many)
class User(Base):
    trips = relationship("Trip", back_populates="owner")

class Trip(Base):
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="trips")

Example 2: Trip belongs to User (the back_populates side)
class Trip(Base):
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="trips")

Now create (hypothetical extension): Trip has one TripShare for public sharing (one-to-one)
"""

# Copilot generates following the pattern:
class TripShare(Base):
    __tablename__ = "trip_shares"
    
    trip_id = Column(Integer, ForeignKey("trips.id"), unique=True)
    trip = relationship("Trip", back_populates="share", uselist=False)
    share_token = Column(String, unique=True, index=True)

class Trip(Base):
    share = relationship("TripShare", back_populates="trip", uselist=False)
```

**When to Use Few-Shot**:
- ✅ Project-specific patterns (Zustand slice structure, Pydantic schemas)
- ✅ API conventions (all endpoints return `{"data": ..., "error": null}`)
- ✅ Repetitive tasks (create 5 similar React components)
- ❌ Standard library usage (Copilot already knows React hooks)
- ❌ Simple CRUD operations (basic patterns well-known)

**Real Workshop Demo** (Intermediate Workshop, Demo 4):
```typescript
// Show Copilot 2 existing Zustand slices:

// Example 1: addStop (actual useTripStore.ts)
addStop: (stop: Stop) => 
  set((state) => ({ stops: [...state.stops, stop] }))

// Example 2: removeStop (actual useTripStore.ts — note param name is `id`)
removeStop: (id: string) => 
  set((state) => ({ 
    stops: state.stops.filter((s) => s.id !== id) 
  }))

// Now ask: "Create updateStop following this pattern"

// Copilot generates:
updateStop: (id: string, updates: Partial<Stop>) =>
  set((state) => ({
    stops: state.stops.map(s => s.id === id ? { ...s, ...updates } : s)
  }))
```

---

### What is Tree-of-Thoughts Prompting?

**Tree-of-Thoughts (ToT) Prompting** explores multiple solution paths simultaneously, evaluates trade-offs, then selects the best approach.

**Pattern**: "Generate 3 different approaches to solve X, compare pros/cons, recommend best"

**Example** (Choosing state management for mobile app):

```
Prompt: "We need state management for React Native trip planner. 
Generate 3 different approaches:
1. Zustand
2. Redux Toolkit
3. React Context + useReducer

For each, analyze:
- Bundle size impact
- TypeScript support
- Debugging tools
- Learning curve
- Persistence strategy (AsyncStorage)

Recommend best option with justification."

Copilot Response:
"Option 1: Zustand
Pros:
- Smallest bundle (2.9kb gzipped)
- Excellent TypeScript inference
- Simple persistence: import { persist } from 'zustand/middleware'
- Minimal boilerplate

Cons:
- Smaller ecosystem than Redux
- No built-in DevTools (community plugin available)

Option 2: Redux Toolkit
Pros:
- Industry standard (large community)
- Best DevTools (Redux DevTools)
- Well-documented persistence (redux-persist)

Cons:
- Larger bundle (~45kb gzipped)
- More boilerplate (slices, actions, reducers)
- Steeper learning curve

Option 3: React Context + useReducer
Pros:
- Built-in (no dependencies)
- Full control over implementation

Cons:
- Manual persistence implementation
- Performance issues with frequent updates
- No DevTools
- More code to maintain

Recommendation: **Zustand**
Rationale: For a mobile app, bundle size is critical. Zustand's 2.9kb vs Redux's 45kb 
means faster app startup. TypeScript support is excellent. Persistence is one line of code.
Trade-off: Slightly less mature DevTools, but community plugin (zustand-devtools) works well."
```

**When to Use ToT**:
- ✅ Architecture decisions (BFF vs microservices, SQL vs NoSQL)
- ✅ Performance optimizations (caching strategy, state management)
- ✅ Trade-off analysis (TypeScript strict mode vs gradual adoption)
- ❌ Single-solution problems (fix a specific bug)
- ❌ Well-established patterns (use React Router for routing)

**Real Workshop Use Case** (Expert Workshop, Demo 3):
```
Spec Kit Workflow: "Generate 3 approaches for AI trip generation feature:
1. Azure OpenAI (current C# backend integration)
2. Direct OpenAI API (without Azure wrapper)
3. LangChain + multiple providers

Compare: Cost per request, latency, context window, Azure integration, vendor lock-in.
Recommend best for production deployment."
```

---

### What is Self-Consistency Prompting?

**Self-Consistency Prompting** generates multiple solutions to the same problem, identifies commonalities, and produces a more robust final answer.

**Pattern**: "Generate 5 different implementations, identify best practices across all, create final version"

**Example** (Error handling in FastAPI):

```python
Prompt: """Generate 3 different error handling approaches for this FastAPI endpoint:

@app.get("/api/trips/{trip_id}")
async def get_trip(trip_id: int):
    # Handle: trip not found, invalid ID, database error
    
Compare solutions and create final version using best practices from each."""

# Copilot generates 3 versions:

# Version 1: Try-catch with HTTPException
try:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
except SQLAlchemyError as e:
    raise HTTPException(status_code=500, detail="Database error")

# Version 2: Early returns with status codes
if trip_id < 1:
    raise HTTPException(status_code=400, detail="Invalid trip ID")
    
trip = db.query(Trip).filter(Trip.id == trip_id).first()
if not trip:
    raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
return trip

# Version 3: Dependency injection with error handling
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    if trip_id < 1:
        raise HTTPException(400, "Invalid ID")
    
    trip = db.query(Trip).get(trip_id)
    if not trip:
        raise HTTPException(404, f"Trip {trip_id} not found")
    return trip

# Final version (combines best practices from all 3):
@app.get("/api/trips/{trip_id}", response_model=schemas.Trip)
async def get_trip(
    trip_id: int = Path(..., gt=0, description="Trip ID must be positive"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Trip:
    """
    Retrieve a trip by ID.
    
    Raises:
        HTTPException 400: Invalid trip ID (negative or zero)
        HTTPException 404: Trip not found
        HTTPException 500: Database error
    """
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(
                status_code=404, 
                detail=f"Trip {trip_id} not found"
            )
        return trip
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching trip {trip_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Database error occurred"
        )
```

**What Self-Consistency Extracted**:
1. ✅ Path validation (from Version 2 & 3)
2. ✅ Descriptive error messages (from Version 2)
3. ✅ Dependency injection (from Version 3)
4. ✅ Try-catch for database errors (from Version 1)
5. ✅ Docstring with error documentation (new best practice)
6. ✅ Logging before re-raising errors (new best practice)

**When to Use Self-Consistency**:
- ✅ Critical code paths (authentication, payment processing)
- ✅ Security-sensitive logic (input validation, SQL injection prevention)
- ✅ Complex algorithms (route optimization, data transformations)
- ❌ Trivial functions (getters, setters)
- ❌ Well-tested patterns (standard React components)

---

## Best Practices for AI-Assisted Web Development

### 1. Provide Clear Context for Better Suggestions

**❌ Bad Context**:
```typescript
// Create component
```

**✅ Good Context**:
```typescript
// Create a TripCard component for AllTripsView.tsx
// Props: trip (Trip type), onClick (callback)
// Display: trip.name, trip.distance_miles, trip.image_url
// Style: Tailwind CSS card with hover effect
// Matches existing pattern in ExploreView.tsx
```

**Why**: Copilot analyzes surrounding code. More details = better suggestions.

**Techniques**:
1. **Reference existing files**: "Following pattern in MapComponent.tsx..."
2. **Specify tech stack**: "Using Zustand, not Redux"
3. **Include type hints**: "Props: trip (Trip interface from types/)"
4. **Mention style patterns**: "Use Tailwind CSS classes like AllTripsView"

---

### 2. Use Iterative Acceptance of Suggestions

**❌ Bad Practice**: Accept entire 200-line Copilot suggestion blindly

**✅ Good Practice**: Accept line-by-line or block-by-block, verifying logic

**Example** (FloatingPanel.tsx refactor):
```typescript
// Copilot suggests entire function...

// Step 1: Accept function signature (verify correct)
const saveTripHandler = async () => {
  ✓ ACCEPT

// Step 2: Accept validation logic (verify against schema)
  if (!tripName || stops.length < 2) {
    ✓ ACCEPT
    
// Step 3: Review API call (check endpoint matches backend)
  const response = await fetch(`${API_URL}/api/trips`, {
    ✗ REJECT - use axiosInstance.post('/api/trips', data) instead of raw fetch
    
// Step 4: Accept error handling (verify matches project pattern)
  } catch (error) {
    console.error('Failed to save trip:', error);
    ✓ ACCEPT
```

**Tips**:
- **Tab**: Accept current line only
- **Cmd/Ctrl + →**: Accept word-by-word
- **Esc**: Reject entire suggestion
- **Alt + ]**: Cycle to next suggestion

---

### 3. Be Mindful of Security and Privacy

**Critical Security Rules**:

**❌ NEVER expose secrets in frontend**:
```typescript
// WRONG - Exposes secret token in browser
const MAPBOX_SECRET_TOKEN = 'sk.ey1234...';
const response = await fetch(`https://api.mapbox.com/...?access_token=${MAPBOX_SECRET_TOKEN}`);
```

**✅ ALWAYS proxy through backend**:
```typescript
// CORRECT - Frontend uses axiosInstance (with auth interceptors), backend holds the secret
// axiosInstance is pre-configured with baseURL = import.meta.env.VITE_API_URL
const response = await axiosInstance.post('/api/directions', {
  coordinates: [...]
});

// Java backend (DirectionsController.java) uses server-side token
// /api/directions routes: Frontend → BFF (port 3000) → backend-java:8082 → Mapbox API
@PostMapping("/api/directions")
public ResponseEntity<Object> getDirections(@RequestBody DirectionsRequest request) {
    String mapboxUrl = "https://api.mapbox.com/directions/v5/mapbox/" + profile + "/...";
    // MAPBOX_TOKEN is an env variable — never exposed to the frontend
}
```

**API Key Checklist**:
- ✅ Backend `.env` file gitignored
- ✅ Frontend only has public tokens (VITE_MAPBOX_TOKEN = pk.xxx)
- ✅ No hardcoded credentials in docker-compose.yml (Issue #3)
- ✅ Azure Key Vault for production secrets
- ❌ NEVER commit API keys to Git

**Privacy Considerations**:
- **Be careful with Copilot's training**: Disable Copilot for files with sensitive data (PII, credentials)
- **Review suggestions**: Copilot may suggest patterns from public repos that violate your security policies
- **Sanitize logs**: Don't log user emails, passwords, tokens (Copilot learns from context)

---

### 4. Customize Copilot for Your Needs

**Instruction File Customization** (.github/copilot-instructions.md):

```markdown
## Road Trip Planner-Specific Rules

### State Management
- ALWAYS use Zustand for global state
- NEVER suggest Redux, MobX, or Context API
- Pattern: Immutable updates with `set((state) => ({ ...state, newValue }))`

### Coordinate Format
- ALWAYS use [longitude, latitude] (GeoJSON spec)
- NEVER use [latitude, longitude] (Google Maps format)
- Example: San Francisco = [-122.4194, 37.7749]

### API Integration
- ALWAYS proxy external APIs through backend
- NEVER call Mapbox/Azure OpenAI directly from frontend
- Pattern: Frontend → /api/directions → BFF → Java backend → Mapbox

### TypeScript Standards
- NO `any` types allowed
- ALL component props require interface definitions
- Use `unknown` for truly dynamic types
```

**VS Code Settings** (.vscode/settings.json):
```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    ".env": false  // Disable for sensitive files
  },
  "github.copilot.advanced": {
    "listCount": 10,  // Show more suggestions
    "inlineSuggestCount": 3  // More inline options
  }
}
```

**Per-File Disabling**:
```typescript
// copilot:disable
const API_KEY = process.env.SECRET_KEY;  // Copilot won't learn this
// copilot:enable
```

---

### 5. Copilot Chat for Debugging and Exploration

**Effective Chat Prompts**:

**❌ Vague**:
```
"Why doesn't my map work?"
```

**✅ Specific**:
```
"The Mapbox map in MapComponent.tsx shows markers in the wrong location. 
I'm passing coordinates as [lat, lng] but the map expects [lng, lat]. 
How do I fix the coordinate order in the stops array?"
```

**Chat Patterns**:

**1. Debugging**:
```
@workspace Why is the route not displaying on the map after I save a trip?

Context:
- useTripStore.ts saveTrip() sends trip data via axiosInstance to /api/trips
- BFF proxies to backend/main.py POST /api/trips which stores route_geojson
- AllTripsView.tsx loads trip from backend but map is blank

Expected: Route line should render on map
Actual: No route line, only markers
```

**2. Code Explanation**:
```
/explain this function

[Select complex code block in editor]

What does this authentication flow do step-by-step?
```

**3. Refactoring**:
```
/refactor Extract duplicate image URL logic to utils/images.ts

[Select code in AllTripsView.tsx]:
const imageUrl = trip.image_url || 'https://images.unsplash.com/...'

[Select similar code in ExploreView.tsx]:
const imageUrl = trip.image_url || 'https://images.unsplash.com/...'
```

**4. Test Generation**:
```
@workspace /tests Generate Vitest test for useTripStore.addStop function

Requirements:
- Test immutability (original state unchanged)
- Test stop is appended to array
- Test order is preserved
```

---

### 6. Understand Limitations

**What Copilot Can't Do**:

1. **❌ Access External APIs/Docs Without MCP**
   - Copilot's training data is static (cutoff date)
   - May suggest outdated API versions (Mapbox v4 instead of v5)
   - **Solution**: Use `@context7` MCP server for latest docs

2. **❌ Understand Your Full Architecture**
   - Doesn't know you use BFF pattern, Zustand, or specific project conventions
   - May suggest Redux even though you use Zustand
   - **Solution**: Comprehensive instruction file

3. **❌ Guarantee Security or Correctness**
   - May suggest insecure patterns (SQL injection, XSS vulnerabilities)
   - **Solution**: Always review suggestions, run tests

4. **❌ Replace Code Reviews**
   - AI can't catch business logic errors or architectural misalignment
   - **Solution**: Human review for critical code paths

5. **❌ Handle Breaking Changes Automatically**
   - If Mapbox API changes, Copilot won't auto-update your code
   - **Solution**: Integration tests, monitor changelogs

**When to Trust Copilot**:
- ✅ Boilerplate code (component scaffolding, CRUD endpoints)
- ✅ Common patterns (React hooks, FastAPI route handlers)
- ✅ Refactoring (extract functions, rename variables)
- ✅ Documentation (generate docstrings, comments)

**When to Be Skeptical**:
- ⚠️ Security-critical code (authentication, authorization)
- ⚠️ Performance-critical paths (database queries, loops)
- ⚠️ External API integrations (verify against official docs)
- ⚠️ Project-specific patterns (coordinate format, state management)

---

## Common Pitfalls & How to Avoid Them

### 1. Replacing Existing Tech Stack

**Pitfall**: Copilot suggests Redux when project uses Zustand

**Why It Happens**: Copilot defaults to popular patterns (Redux is more common than Zustand)

**How to Avoid**:
```markdown
# .github/copilot-instructions.md
## State Management
- ALWAYS use Zustand (NOT Redux, MobX, Context API)
- Pattern: create((set) => ({ ... }))
- File location: src/store/useTripStore.ts
```

**Example**:
```typescript
// Without instruction file:
// Developer: "Create state for user authentication"
// Copilot suggests:
import { createSlice } from '@reduxjs/toolkit';  // WRONG!

// With instruction file:
// Copilot suggests:
import { create } from 'zustand';  // CORRECT!
```

---

### 2. Forgetting to Proxy External APIs

**Pitfall**: Frontend calls Mapbox directly, exposing secret token in browser

**Security Impact**: High - API keys can be extracted from JavaScript, leading to quota abuse

**How to Avoid**:
```markdown
# .github/copilot-instructions.md
## Security: API Proxy Pattern
- ALL external API calls (Mapbox, Azure OpenAI, Azure Maps) MUST go through backend
- Frontend NEVER calls external APIs directly
- Pattern: Frontend → /api/directions → BFF → Java backend → Mapbox
```

---

### 3. Using `any` in TypeScript

**Pitfall**: Copilot suggests `any` type, breaking type safety

**Example**:
```typescript
// Copilot suggestion:
function calculateDistance(stops: any[]) {  // WRONG!
  return stops.reduce((total, stop) => total + stop.distance, 0);
}

// Correct (with instruction file) — matches actual frontend/src/types/Stop.ts:
import { Stop } from '../types/Stop';
// Stop interface: { id: string; name: string; coordinates: [number, number]; type: StopType; address?: string }

function calculateDistance(stops: Stop[]) {  // CORRECT!
  return stops.reduce((total, stop) => total + (stop.distance || 0), 0);
}
```

**Instruction File Rule**:
```markdown
## TypeScript Standards
- NO `any` types allowed
- Use `unknown` for truly dynamic types, then narrow with type guards
- All component props require interface definitions
```

---

### 4. Storing Derived State in Zustand

**Pitfall**: Storing calculated values (like total distance) in store instead of computing on-the-fly

**Example**:
```typescript
// ❌ WRONG - Storing derived state
interface TripStore {
  stops: Stop[];
  totalDistance: number;  // BAD - needs manual updates
  updateTotalDistance: () => void;
}

// ✅ CORRECT - Calculate on-the-fly
interface TripStore {
  stops: Stop[];
  // No totalDistance stored
}

// In component:
const totalDistance = useMemo(() => {
  return stops.reduce((sum, stop) => sum + (stop.distance || 0), 0);
}, [stops]);
```

**Why**: Derived state can become stale if you forget to update it when `stops` changes.

---

### 5. Direct Database Queries in Route Handlers

**Pitfall**: Putting business logic in FastAPI route handlers instead of service modules

**Example**:
```python
# ❌ WRONG - Logic in route handler
@app.post("/api/trips")
async def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    db_trip = Trip(
        name=trip.name,
        stops=trip.stops,
        user_id=1  # Complex user lookup logic here
    )
    db.add(db_trip)
    db.commit()
    return db_trip

# ✅ CORRECT - Logic in service module
# backend/trip_service.py (follows pattern of ai_service.py, vehicle_service.py)
def create_trip(db: Session, trip: TripCreate, user_id: int) -> Trip:
    db_trip = Trip(
        name=trip.name,
        stops=trip.stops,
        user_id=user_id
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

# main.py
@app.post("/api/trips")
async def create_trip(
    trip: TripCreate, 
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return trip_service.create_trip(db, trip, user.id)
```

**Instruction File Rule**:
```markdown
## Backend Architecture
- Route handlers in main.py: validation, auth, serialization ONLY
- Business logic in services/*_service.py
- Keep main.py under 400 lines
```

---

### 6. Hardcoding API Tokens

**Pitfall**: Committing `.env` files or hardcoding secrets in `docker-compose.yml`

**How to Avoid**:
1. Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.production
   backend/.env
   frontend/.env.local
   ```

2. Create `.env.example` templates:
   ```bash
   # backend/.env.example
   DATABASE_URL=sqlite:///./trips.db
   MAPBOX_TOKEN=your_token_here
   GOOGLE_CLIENT_ID=your_client_id_here
   ```

3. Use environment variables in CI/CD:
   ```yaml
   # .github/workflows/backend.yml
   env:
     MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
   ```

---

### 7. Coordinate Format Confusion

**Pitfall**: Using `[lat, lng]` instead of `[lng, lat]` (GeoJSON standard)

**Example**:
```typescript
// ❌ WRONG (Google Maps format)
const sanFrancisco = [37.7749, -122.4194];  // [lat, lng]

// Map renders in middle of ocean (coordinates reversed!)
<Marker latitude={sanFrancisco[0]} longitude={sanFrancisco[1]} />

// ✅ CORRECT (GeoJSON format)
const sanFrancisco = [-122.4194, 37.7749];  // [lng, lat]

<Marker longitude={sanFrancisco[0]} latitude={sanFrancisco[1]} />
```

**How to Avoid**:
```markdown
# .github/copilot-instructions.md
## Coordinate Format Convention
- ALWAYS use GeoJSON format: [longitude, latitude]
- NEVER use [latitude, longitude] (Google Maps format)
- Mapbox GL JS requires [lng, lat] order
- Example: San Francisco = [-122.4194, 37.7749]
```

---

## Quick Reference

### Copilot Keyboard Shortcuts (VS Code)

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| **Accept suggestion** | `Tab` | `Tab` |
| **Accept line** | `Cmd + →` | `Ctrl + →` |
| **Reject suggestion** | `Esc` | `Esc` |
| **Next suggestion** | `Alt + ]` | `Alt + ]` |
| **Previous suggestion** | `Alt + [` | `Alt + [` |
| **Open Chat** | `Cmd + I` | `Ctrl + I` |
| **Ask in Chat** | `Cmd + Shift + I` | `Ctrl + Shift + I` |

### Copilot Chat Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/explain` | Explain selected code | `/explain` (select function) |
| `/tests` | Generate tests | `/tests` (select function) |
| `/fix` | Fix errors | `/fix` (select buggy code) |
| `/doc` | Add documentation | `/doc` (select function) |
| `@workspace` | Search entire project | `@workspace where is routing logic?` |
| `@terminal` | Explain terminal errors | `@terminal why did npm install fail?` |

### Agent Invocation Patterns

| Agent | Purpose | Example Usage |
|-------|---------|---------------|
| `@tdd-red` | Write failing test | `@tdd-red Write test for FloatingPanel props` |
| `@tdd-green` | Implement to pass test | `@tdd-green Fix TypeScript any in props` |
| `@tdd-refactor` | Clean up code | `@tdd-refactor Extract duplicate logic` |
| `@debug` | Investigate bug | `@debug Why are map markers wrong location?` |
| `@context7` | Fetch library docs | `@context7 Mapbox Directions API truck profile` |
| `@terraform-azure-planning` | Plan infrastructure | `@terraform-azure-planning Create VNet module` |

### Prompting Template

```
Context: [Project name, tech stack, current file]
Goal: [What you want to achieve]
Constraints: [Architecture rules, tech choices]
Example: [Show similar existing code]
Request: [Specific task for Copilot]

Example:
Context: Road Trip Planner, React + TypeScript + Zustand
Goal: Create a vehicle selector dropdown component
Constraints: Use Tailwind CSS, no external UI libraries
Example: See FloatingPanel.tsx line 45-60 for similar dropdown
Request: Generate VehicleSelector component with props interface
```

---

**Next Steps**:
- ✅ Complete workshop setup: `setup/00-setup-instructions.md`
- ➡️ **Start Workshop 1**: `01-foundational-web-dev.md` (Inline suggestions, comment generation)
- 📚 Refer back to this guide during workshops for definitions and best practices

---

**Workshop Series Navigation**:
1. **Foundational** → Copilot basics, inline suggestions, security
2. **Intermediate** → Prompting, refactoring, state management
3. **Advanced** → Chain-of-thought, agents, TDD, instruction files
4. **Expert** → MCP servers, custom agents, Spec Kit, architecture generation
