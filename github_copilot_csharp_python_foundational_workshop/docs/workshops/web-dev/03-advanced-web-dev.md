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

---

## Workshop Agenda

| Time | Demo | Topic | Focus Files |
|------|------|-------|-------------|
| 0-10 min | Demo 1 | Chain-of-Thought Prompting | `backend/main.py` |
| 10-20 min | Demo 2 | Instruction Files | `.github/copilot-instructions.md` |
| 20-30 min | Demo 3 | Prompt Files | `.github/prompts/*.prompt.md` |
| 30-40 min | Demo 4 | Copilot Code Review | Pull Request review |
| 40-55 min | Demo 5 | Copilot Plan Mode | `backend/tests/` |
| 55-70 min | Demo 6 | Copilot Coding Agent | Multi-file refactoring |
| 70-80 min | Demo 7 | Copilot Agent HQ | Custom agent creation |
| 80-90 min | Demo 8 | Architecture & Tech Stack Generation | New project scaffolding |

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex features into step-by-step reasoning chains that guide Copilot toward correct solutions.

### Scenario
Implement vehicle-aware routing by adding a vehicle type parameter to the `/api/directions` endpoint.

### Live Coding Steps

**Step 1: Write chain-of-thought prompt**
```python
# In backend/main.py, before the endpoint:

"""
CHAIN OF THOUGHT: Add vehicle-aware routing

Step 1: Identify requirements
- Accept vehicle_type parameter: 'car' | 'rv' | 'truck'
- Map vehicle_type to Mapbox profile

Step 2: Update schema
- Add vehicle_type: Optional[str] = 'car'
- Add vehicle_specs: Optional[dict]

Step 3: Implement mapping
- 'car' → 'driving' profile
- 'rv'/'truck' → 'truck' profile

Step 4: Build API request
- Convert imperial units to metric for Mapbox
- height_ft → meters (×0.3048)
- weight_tons → kg (×907.185)

Step 5: Return response with metadata
- Include vehicle_type and profile_used

Now implement:
"""
```

**Step 2: Accept Copilot suggestions following the chain**
```python
# Copilot should generate based on each step:
def get_mapbox_profile(vehicle_type: str) -> str:
    """Step 3: Map vehicle type to Mapbox profile."""
    if vehicle_type in ['rv', 'truck']:
        return 'mapbox/truck'
    return 'mapbox/driving'
```

### Teaching Points

| Chain-of-Thought Formula | Example |
|-------------------------|---------|
| Step 1: Requirements | Identify inputs, outputs, constraints |
| Step 2: Data model | Schema/type changes |
| Step 3: Business logic | Mapping, validation |
| Step 4: Integration | API calls, external services |
| Step 5: Response | Format output, add metadata |

**When to Use**: Multi-step features, unfamiliar APIs, complex algorithms  
**Avoid**: Simple CRUD operations, straightforward implementations

---

## Demo 2: Instruction Files (10 min)

### Objective
Customize `.github/copilot-instructions.md` with project-specific rules that Copilot automatically follows.

### Scenario
Add rules to prevent common mistakes: coordinate format, `any` types, and API proxy pattern.

### Live Coding Steps

**Step 1: Add coordinate format rule**
```markdown
<!-- In .github/copilot-instructions.md -->

### 🚨 CRITICAL: Coordinate Format

**ALWAYS use GeoJSON: `[longitude, latitude]` - NOT `[lat, lng]`**

```typescript
// ❌ WRONG
const coords = [37.7749, -122.4194];  // [lat, lng]

// ✅ CORRECT  
const coords: [number, number] = [-122.4194, 37.7749];  // [lng, lat]
```
```

**Step 2: Add TypeScript `any` prohibition**
```markdown
### 🚨 TypeScript: No `any` Types

**Rule**: Never use `any` type. Use `unknown` or create interfaces.

```typescript
// ❌ NEVER
function handleData(data: any) { }

// ✅ CORRECT
interface TripData { id: number; name: string; }
function handleData(data: TripData) { }
```
```

**Step 3: Add API proxy rule**
```markdown
### 🚨 API Proxy Pattern - MANDATORY

External APIs (Mapbox, Gemini) MUST go through backend:

```typescript
// ❌ WRONG - Frontend calling API directly
fetch(`https://api.mapbox.com?token=${VITE_TOKEN}`)

// ✅ CORRECT - Proxy through backend
fetch('/api/directions', { method: 'POST' })
```
```

### Verification
```bash
# Create test file and type: "Create coords for SF"
# Expected: Copilot suggests [-122.4194, 37.7749] (lng, lat)
```

### Teaching Points

| Instruction Rule | Format |
|-----------------|--------|
| Critical rule | Use 🚨 emoji prefix |
| Examples | Show ❌ WRONG and ✅ CORRECT |
| Specificity | Include exact values/patterns |
| Rationale | Link to issues (e.g., "Issue #3") |

---

## Demo 3: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files for consistent code generation patterns across the team.

### Scenario
Create a prompt file for generating typed React components that follow project conventions.

### Live Coding Steps

**Step 1: Create prompt file directory**
```bash
mkdir -p .github/prompts
```

**Step 2: Create component generation prompt**
```markdown
<!-- .github/prompts/react-component.prompt.md -->

# React Component Generator

Generate a typed React functional component following Road Trip Planner conventions.

## Requirements
- Define props interface (exported)
- Use TypeScript strict types (NO `any`)
- Follow GeoJSON coordinate format: [lng, lat]
- Include JSDoc comments
- Use Zustand for state (NOT useState for global state)

## Template
```typescript
import type { /* relevant types */ } from '../types';

/**
 * [Component description]
 * @param props - Component props
 */
export interface {{ComponentName}}Props {
  // Define typed props here
}

export function {{ComponentName}}({ prop1, prop2 }: {{ComponentName}}Props) {
  // Implementation
  return (
    <div className="[tailwind-classes]">
      {/* JSX */}
    </div>
  );
}

export default {{ComponentName}};
```

## Checklist
- [ ] Props interface is exported
- [ ] All props have explicit types
- [ ] No `any` types
- [ ] JSDoc documentation added
- [ ] Tailwind CSS for styling
```

**Step 3: Create API endpoint prompt**
```markdown
<!-- .github/prompts/fastapi-endpoint.prompt.md -->

# FastAPI Endpoint Generator

Generate a FastAPI endpoint following Road Trip Planner conventions.

## Requirements
- Use Pydantic models for request/response
- Follow API proxy pattern for external services
- Use HTTPException with clear status codes
- Include docstring with OpenAPI description

## Template
```python
from pydantic import BaseModel
from fastapi import HTTPException

class {{EndpointName}}Request(BaseModel):
    """Request schema for {{endpoint_path}}."""
    # Define fields with types

class {{EndpointName}}Response(BaseModel):
    """Response schema for {{endpoint_path}}."""
    # Define fields with types

@app.post("/api/{{endpoint_path}}")
async def {{function_name}}(request: {{EndpointName}}Request) -> {{EndpointName}}Response:
    """
    {{Description for OpenAPI docs}}
    """
    try:
        # Implementation
        return {{EndpointName}}Response(...)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```
```

**Step 4: Use prompt file in Copilot Chat**
```
# In Copilot Chat:
@workspace /file:.github/prompts/react-component.prompt.md

Create a TripCard component that displays trip name, distance, and duration.
Props: trip (Trip type), onClick callback
```

### Teaching Points

| Prompt File Element | Purpose |
|--------------------|---------|
| Requirements section | Enforces project rules |
| Template section | Provides code structure |
| Checklist section | Verification criteria |
| Placeholders `{{}}` | Dynamic substitution |

**Benefits**:
- Consistency across team
- Onboarding new developers
- Reusable patterns
- Version-controlled prompts

---

## Demo 4: Copilot Code Review (10 min)

### Objective
Use Copilot to review pull requests, identify issues, and suggest improvements.

### Scenario
Review a PR that adds a new API endpoint for trip sharing functionality.

### Live Coding Steps

**Step 1: Open PR diff in VS Code**
```bash
# Fetch the PR branch
git fetch origin feature/trip-sharing
git diff main..feature/trip-sharing -- backend/main.py
```

**Step 2: Invoke Copilot Code Review**
```
# In Copilot Chat:
@workspace Review the changes in this PR for:
1. Security vulnerabilities (OWASP Top 10)
2. TypeScript `any` violations
3. Missing error handling
4. API proxy pattern compliance
5. Test coverage gaps

Files changed:
- backend/main.py (new /api/share-trip endpoint)
- frontend/src/components/ShareDialog.tsx
- backend/tests/test_sharing.py
```

**Step 3: Copilot Review Output**
```markdown
## Code Review: Trip Sharing Feature

### 🔴 Critical Issues

**1. SQL Injection Risk** (backend/main.py:145)
```python
# ❌ Current code
query = f"SELECT * FROM trips WHERE id = {trip_id}"

# ✅ Fix: Use parameterized query
query = "SELECT * FROM trips WHERE id = :trip_id"
db.execute(query, {"trip_id": trip_id})
```

**2. Missing Authentication** (backend/main.py:142)
```python
# ❌ Current: No auth check
@app.post("/api/share-trip")
async def share_trip(trip_id: int):

# ✅ Fix: Add dependency
@app.post("/api/share-trip")
async def share_trip(trip_id: int, user = Depends(get_current_user)):
```

### 🟡 Warnings

**3. TypeScript `any` Violation** (ShareDialog.tsx:27)
```typescript
// ❌ Current
const handleShare = (data: any) => { }

// ✅ Fix
interface ShareData { tripId: number; isPublic: boolean; }
const handleShare = (data: ShareData) => { }
```

### 🟢 Suggestions

**4. Add Error Boundary** (ShareDialog.tsx)
- Consider wrapping in ErrorBoundary for graceful failure

**5. Test Coverage** (test_sharing.py)
- Missing test for unauthorized access (401)
- Missing test for non-existent trip (404)

### Summary
- 2 critical issues (must fix before merge)
- 1 warning (should fix)
- 2 suggestions (nice to have)
```

**Step 4: Apply fixes with Copilot**
```
# In Copilot Chat:
@workspace Fix the SQL injection vulnerability in backend/main.py:145
Use SQLAlchemy ORM query instead of raw SQL.
```

### Teaching Points

| Review Category | What to Check |
|----------------|---------------|
| 🔴 Critical | Security, data loss, crashes |
| 🟡 Warning | Performance, maintainability |
| 🟢 Suggestion | Best practices, improvements |

**Copilot Review Prompts**:
```
# Security-focused review
Review for OWASP Top 10 vulnerabilities

# Performance review
Review for N+1 queries, missing indexes, unnecessary re-renders

# Architecture review
Review for SOLID principles, separation of concerns

# Test review
Review test coverage and edge cases
```

---

## Demo 5: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect multi-step solutions before implementation.

### Scenario
Create a comprehensive plan to mock external APIs in backend tests (Issue #4).

### Live Coding Steps

**Step 1: Invoke Plan Mode**
```
# In Copilot Chat, click "Plan" button or type:
@plan Create plan to mock external APIs in pytest

Context:
- Tests currently hit real Mapbox/Gemini APIs
- CI has continueOnError: true (tests fail silently)
- Need pytest-httpx for async httpx mocking

Goals:
1. Install mocking library
2. Create API response fixtures
3. Update tests to use mocks
4. Remove continueOnError from CI
5. Document patterns
```

**Step 2: Review generated plan**
```markdown
## Plan: Mock External APIs

### Phase 1: Setup (5 min)
☐ 1.1 Add `pytest-httpx==0.21.0` to requirements.txt
☐ 1.2 Install: `pip install pytest-httpx`

### Phase 2: Create Fixtures (10 min)
☐ 2.1 Create `tests/fixtures/api_responses.py`
```python
MAPBOX_DIRECTIONS_RESPONSE = {
    "routes": [{"geometry": {...}, "distance": 615000}],
    "code": "Ok"
}
```

☐ 2.2 Create `tests/conftest.py` fixture
```python
@pytest.fixture
def mock_mapbox(httpx_mock):
    httpx_mock.add_response(
        url="https://api.mapbox.com/directions/.*",
        json=MAPBOX_DIRECTIONS_RESPONSE
    )
```

### Phase 3: Update Tests (15 min)
☐ 3.1 Update `test_main.py` to use fixtures
☐ 3.2 Update `test_trips.py` to use fixtures
☐ 3.3 Verify: `pytest tests/ -v`

### Phase 4: CI Cleanup (5 min)
☐ 4.1 Remove `continueOnError: true` from workflow
☐ 4.2 Push and verify CI passes

### Phase 5: Documentation (5 min)
☐ 5.1 Add mocking guide to `tests/README.md`

**Success Criteria**:
✅ Tests pass without network calls
✅ CI pipeline has no continueOnError
✅ Test runtime < 5 seconds (was 30+ seconds)
```

**Step 3: Execute plan step-by-step**
```bash
# Phase 1.1
echo "pytest-httpx==0.21.0" >> backend/requirements.txt

# Phase 2.1 - Use Copilot to generate
# Type: "Create Mapbox mock response fixture"
```

### Teaching Points

| Plan Mode Element | Purpose |
|------------------|---------|
| Phases | Logical groupings |
| Checkboxes ☐ | Track progress |
| Code snippets | Specific implementation |
| Time estimates | Set expectations |
| Success criteria | Definition of done |

**When to Use Plan Mode**:
- Complex refactoring (multi-file changes)
- New feature architecture
- Migration strategies
- Team collaboration (share plan for review)

---

## Demo 6: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file tasks to Copilot's coding agent for complex refactoring.

### Scenario
Use the coding agent to fix all TypeScript `any` violations across the codebase (Issue #2).

### Live Coding Steps

**Step 1: Invoke Copilot Agent**
```
# In Copilot Chat:
@agent Fix all TypeScript `any` type violations in the frontend

Context:
- 20 instances of `any` found in codebase
- Each violation needs: interface definition, type replacement
- Follow patterns in .github/copilot-instructions.md

Files to check:
- frontend/src/components/*.tsx
- frontend/src/views/*.tsx
- frontend/src/store/*.ts

For each violation:
1. Identify the `any` type
2. Analyze usage to determine correct type
3. Create interface if needed (in src/types/)
4. Replace `any` with proper type
5. Verify TypeScript compiles

Report progress after each file.
```

**Step 2: Agent executes autonomously**
```markdown
## Agent Progress Report

### File 1: FloatingPanel.tsx
**Found**: Line 27 - `function FloatingPanel({ trip, onSave }: any)`
**Fix**: Created `FloatingPanelProps` interface
```typescript
interface FloatingPanelProps {
  trip: Trip;
  onSave: (trip: Trip) => void;
}
```
**Status**: ✅ Fixed

### File 2: ExploreView.tsx  
**Found**: Line 35 - `const trips: any[] = data`
**Fix**: Used existing `Trip` type
```typescript
const trips: Trip[] = data;
```
**Status**: ✅ Fixed

### File 3: MapComponent.tsx
**Found**: Line 32 - `const handleMapClick = (e: any) =>`
**Fix**: Used Mapbox event type
```typescript
import type { MapMouseEvent } from 'react-map-gl';
const handleMapClick = (e: MapMouseEvent) =>
```
**Status**: ✅ Fixed

### Summary
- Files processed: 8
- Violations fixed: 20
- New interfaces created: 5
- TypeScript errors: 0

Run `npm run typecheck` to verify.
```

**Step 3: Verify agent work**
```bash
cd frontend
npm run typecheck

# Expected: No errors
# Previous: 20 `any` violations
```

### Teaching Points

| Agent Capability | Use Case |
|-----------------|----------|
| Multi-file edits | Refactoring patterns |
| Autonomous execution | Repetitive tasks |
| Progress reporting | Track complex changes |
| Verification steps | Quality assurance |

**Agent Prompt Best Practices**:
```
# Structure your agent prompt:
1. Clear objective (what to accomplish)
2. Context (project rules, patterns)
3. Scope (which files/directories)
4. Steps (how to approach each case)
5. Reporting (what to communicate back)
```

---

## Demo 7: Copilot Agent HQ (10 min)

### Objective
Manage and orchestrate custom agents for specialized workflows using Agent HQ.

### Scenario
Create and configure a custom `@coordinate-validator` agent for the Road Trip Planner.

### Live Coding Steps

**Step 1: Create custom agent definition**
```markdown
<!-- .github/copilot-agents/coordinate-validator.agent.md -->

# Coordinate Validator Agent

## Identity
You are a specialized agent for validating GeoJSON coordinates in the Road Trip Planner codebase.

## Expertise
- GeoJSON specification (RFC 7946)
- Mapbox coordinate requirements
- Road Trip Planner coordinate conventions

## Rules
1. Coordinates MUST be [longitude, latitude] format
2. Longitude range: -180 to 180
3. Latitude range: -90 to 90
4. TypeScript type: `[number, number]` tuple

## Behaviors
When asked to validate coordinates:
1. Check format: [lng, lat] not [lat, lng]
2. Check bounds: valid longitude and latitude ranges
3. Check type: tuple not array
4. Report violations with line numbers
5. Suggest fixes with correct format

## Example Invocation
```
@coordinate-validator Scan frontend/src/components for coordinate issues
```

## Output Format
```
## Coordinate Validation Report

### ✅ Valid
- file.tsx:25 - [-122.4194, 37.7749] ✓

### ❌ Invalid  
- file.tsx:42 - [37.7749, -122.4194] 
  Fix: Reverse to [-122.4194, 37.7749]
```
```

**Step 2: Register agent in Agent HQ**
```yaml
# .github/copilot-agents/agents.yaml

agents:
  - name: coordinate-validator
    file: coordinate-validator.agent.md
    description: Validates GeoJSON coordinate format
    triggers:
      - "validate coordinates"
      - "check coords"
      - "coordinate format"
    
  - name: tdd-red
    file: tdd-red.agent.md
    description: Writes failing tests
    
  - name: tdd-green
    file: tdd-green.agent.md
    description: Implements code to pass tests
```

**Step 3: Invoke custom agent**
```
# In Copilot Chat:
@coordinate-validator Scan the entire frontend for coordinate format issues

Focus on:
- MapComponent.tsx
- useTripStore.ts
- Any file with Mapbox integration
```

**Step 4: Agent response**
```markdown
## Coordinate Validation Report

### Files Scanned: 12
### Total Coordinates Found: 34

### ✅ Valid Coordinates (31)
- MapComponent.tsx:45 - `[-122.4194, 37.7749]` ✓
- useTripStore.ts:78 - `defaultCenter: [-98.5795, 39.8283]` ✓
...

### ❌ Invalid Coordinates (3)

**1. StartTripView.tsx:156**
```typescript
// Current (WRONG - reversed)
const defaultLocation = [37.7749, -122.4194];

// Fix
const defaultLocation: [number, number] = [-122.4194, 37.7749];
```

**2. ExploreView.tsx:89**
```typescript
// Current (WRONG - object format)
const coords = { lat: 37.7749, lng: -122.4194 };

// Fix
const coords: [number, number] = [-122.4194, 37.7749];
```

**3. FloatingPanel.tsx:234**
```typescript
// Current (WRONG - missing type)
const center = [-122.4194, 37.7749];

// Fix (add tuple type)
const center: [number, number] = [-122.4194, 37.7749];
```

### Summary
- 3 violations found
- All fixable with format correction
- Run `@coordinate-validator --fix` to auto-correct
```

### Teaching Points

| Agent HQ Feature | Purpose |
|-----------------|---------|
| Agent definitions | Custom specialized behaviors |
| Registration | Discoverability and triggers |
| Orchestration | Combine multiple agents |
| Invocation patterns | Consistent interface |

**Custom Agent Structure**:
```markdown
# Agent Name

## Identity - Who the agent is
## Expertise - What it knows
## Rules - What it enforces
## Behaviors - How it acts
## Example - How to use it
## Output Format - What it returns
```

---

## Demo 8: Architecture & Tech Stack Generation (10 min)

### Objective
Use Copilot to generate project scaffolding, architecture decisions, and tech stack recommendations.

### Scenario
Generate a new microservice architecture for the AI service extraction (Issue #22).

### Live Coding Steps

**Step 1: Request architecture generation**
```
# In Copilot Chat:
@workspace Generate architecture for a new Go microservice

Context:
- Extracting AI service from FastAPI monolith
- Service: Vehicle specification parsing with Azure OpenAI
- Deployment: Azure Container Apps
- Communication: REST API called by FastAPI BFF

Requirements:
1. Project structure for Go service
2. Dockerfile (multi-stage build)
3. API contract (OpenAPI spec)
4. Infrastructure as Code (Terraform)
5. CI/CD pipeline (GitHub Actions)

Generate complete scaffolding with all files.
```

**Step 2: Copilot generates project structure**
```
## Generated Architecture: AI Service (Go)

### Project Structure
```
ai-service/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── handlers/
│   │   └── vehicle.go        # HTTP handlers
│   ├── services/
│   │   └── openai.go         # Azure OpenAI client
│   └── models/
│       └── vehicle.go        # Domain models
├── api/
│   └── openapi.yaml          # API specification
├── Dockerfile                 # Multi-stage build
├── go.mod                     # Dependencies
├── go.sum
└── README.md
```

### API Contract (api/openapi.yaml)
```yaml
openapi: 3.0.3
info:
  title: AI Service - Vehicle Parser
  version: 1.0.0
paths:
  /api/v1/parse-vehicle:
    post:
      summary: Parse vehicle specifications from text
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                text:
                  type: string
                  example: "2024 Winnebago View 24D"
      responses:
        '200':
          description: Parsed vehicle specs
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VehicleSpec'
components:
  schemas:
    VehicleSpec:
      type: object
      properties:
        height:
          type: number
          description: Height in meters
        weight:
          type: number
          description: Weight in tonnes
        fuelType:
          type: string
          enum: [gas, diesel, electric]
```

### Dockerfile
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /ai-service ./cmd/server

# Runtime stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
COPY --from=builder /ai-service /ai-service
EXPOSE 8080
CMD ["/ai-service"]
```

### Terraform Module (infrastructure/terraform/modules/ai-service/)
```hcl
# main.tf
resource "azurerm_container_app" "ai_service" {
  name                         = "ai-service-${var.environment}"
  container_app_environment_id = var.container_app_env_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  template {
    container {
      name   = "ai-service"
      image  = "${var.container_registry}/ai-service:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "AZURE_OPENAI_ENDPOINT"
        secret_name = "openai-endpoint"
      }
    }
  }
}
```

**Step 3: Generate tech stack decision document**
```
# In Copilot Chat:
@workspace Generate ADR (Architecture Decision Record) for Go microservice choice
```

**Copilot generates ADR**:
```markdown
<!-- docs/adr/002-go-ai-service.md -->

# ADR 002: Go for AI Service Microservice

## Status
Proposed

## Context
The AI service needs to be extracted from the FastAPI monolith for:
- Independent scaling during high AI usage
- Potential performance improvements
- Team specialization

## Decision
Use **Go** for the AI microservice because:
1. **Performance**: 10x faster than Python for CPU-bound tasks
2. **Concurrency**: Goroutines handle parallel AI requests efficiently
3. **Deployment**: Single binary, small container images (~20MB)
4. **Azure SDK**: First-class Go SDK for Azure OpenAI

## Alternatives Considered
| Language | Pros | Cons |
|----------|------|------|
| Python | Existing AI code, team familiarity | Slower, GIL limitations |
| Rust | Maximum performance | Steep learning curve |
| Node.js | Fast development | Not ideal for CPU-bound |

## Consequences
- Team needs Go training
- Initial development slower than Python rewrite
- Long-term performance and cost benefits
```

### Teaching Points

| Generation Type | Use Case |
|----------------|----------|
| Project structure | New services, microservices |
| API contracts | Service interfaces |
| Infrastructure | Terraform, Kubernetes |
| CI/CD | GitHub Actions, Azure Pipelines |
| ADRs | Architecture decisions |

**Architecture Prompts**:
```
# Full project scaffolding
Generate [language] project structure for [description]

# API design
Generate OpenAPI spec for [service] with [endpoints]

# Infrastructure
Generate Terraform for [resource] in [cloud]

# Decision records
Generate ADR for choosing [technology] over [alternatives]
```

---

## Workshop Summary

### 8 Advanced Techniques Mastered

| # | Technique | Key Takeaway |
|---|-----------|--------------|
| 1 | **Chain-of-Thought** | Break complex features into numbered steps |
| 2 | **Instruction Files** | Project rules with 🚨 critical markers |
| 3 | **Prompt Files** | Reusable templates in `.github/prompts/` |
| 4 | **Code Review** | Security, performance, and pattern checks |
| 5 | **Plan Mode** | Multi-phase architecture before coding |
| 6 | **Coding Agent** | Autonomous multi-file refactoring |
| 7 | **Agent HQ** | Custom agents for specialized tasks |
| 8 | **Architecture Gen** | Scaffolding, ADRs, tech stack decisions |

### Quick Reference

```
# Chain-of-Thought
"""
Step 1: [requirement]
Step 2: [schema]
Step 3: [logic]
Now implement:
"""

# Instruction File
### 🚨 CRITICAL: [Rule Name]
// ❌ WRONG
// ✅ CORRECT

# Prompt File
<!-- .github/prompts/[name].prompt.md -->
## Requirements
## Template
## Checklist

# Code Review
@workspace Review for security, types, patterns

# Plan Mode
@plan Create plan for [complex task]

# Coding Agent
@agent Fix all [violations] in [directory]

# Agent HQ
@[custom-agent] [task description]

# Architecture
Generate [language] project structure for [description]
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
