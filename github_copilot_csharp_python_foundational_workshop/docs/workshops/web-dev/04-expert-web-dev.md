# Workshop 4: Expert Web Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Advanced developers with TDD/agent experience (completed Workshops 1-3)  
**Prerequisites**: Proficiency with chain-of-thought, instruction files, coding agents, Plan Mode

---

## Learning Objectives

By the end of this workshop, you will:
1. **Copilot Extensions → MCP Servers**: Understand the evolution from Copilot Extensions to Model Context Protocol (MCP) servers and configure live documentation fetching
2. **MCP Servers**: Configure and use MCP servers (@context7, @azure) to fetch real-time external documentation and execute cloud operations
3. **Enterprise Policy Management**: Configure organization-wide Copilot policies, content exclusions, and audit settings for governance
4. **Model Selection & Cost Optimization**: Choose appropriate models (GPT-4.1, Claude Sonnet 4, Opus 4, o3-mini) based on task complexity and manage premium request allocation
5. **GitHub Copilot Certification**: Review certification domains and practice exam-style scenarios
6. **Copilot Spec Kit**: Use the full Spec Kit workflow (@speckit.specify → @speckit.plan → @speckit.tasks → @speckit.implement) for feature development
7. **Copilot Metrics**: Configure and interpret Copilot usage metrics, acceptance rates, and productivity dashboards

---

## Workshop Agenda

| Time | Demo | Topic | Key Concept |
|------|------|-------|-------------|
| 0-12 min | Demo 1 | Copilot Extensions → MCP Servers Evolution | Extensions architecture, MCP migration |
| 12-24 min | Demo 2 | MCP Servers: @context7 & @azure Integration | Live docs, cloud operations |
| 24-36 min | Demo 3 | Enterprise Policy Management | Org policies, content exclusions |
| 36-48 min | Demo 4 | Model Selection & Cost Optimization | Model comparison, premium requests |
| 48-60 min | Demo 5 | GitHub Copilot Certification Prep | Exam domains, practice scenarios |
| 60-75 min | Demo 6 | Copilot Spec Kit Full Workflow | specify → plan → tasks → implement |
| 75-90 min | Demo 7 | Copilot Metrics & Productivity Dashboard | Usage analytics, ROI measurement |

---

## Demo 1: Copilot Extensions → MCP Servers Evolution (12 min)

### Objective
Understand how GitHub Copilot Extensions have evolved into the Model Context Protocol (MCP) standard, enabling richer integrations with external tools and services.

### Background: The Evolution

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GitHub Copilot Extension Evolution                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  2023: Copilot Extensions (v1)          2024-2025: MCP Servers (v2)     │
│  ─────────────────────────────          ─────────────────────────────   │
│                                                                          │
│  • Custom chat participants             • Standardized protocol          │
│  • Limited to GitHub ecosystem          • Cross-IDE compatible           │
│  • Proprietary API format               • Open specification             │
│  • Single-turn interactions             • Stateful sessions              │
│  • Manual tool definitions              • Auto-discovered tools          │
│                                                                          │
│  @extension-name prompt                 @mcp-server prompt               │
│         ↓                                       ↓                        │
│  [Extension-specific API]               [MCP JSON-RPC Protocol]          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Differences: Extensions vs MCP Servers

| Aspect | Copilot Extensions (Legacy) | MCP Servers (Current) |
|--------|----------------------------|----------------------|
| **Protocol** | Proprietary GitHub API | Open JSON-RPC 2.0 standard |
| **Portability** | GitHub Copilot only | VS Code, JetBrains, Cursor, etc. |
| **Tool Discovery** | Manual registration | Auto-discovery via manifest |
| **State Management** | Stateless per-request | Persistent session context |
| **Authentication** | GitHub OAuth only | Flexible (OAuth, API keys, etc.) |
| **Ecosystem** | GitHub Marketplace | npm, local servers, cloud services |

### Live Demo: Configuring MCP Servers

MCP servers are configured in two ways in VS Code:
1. **Copilot Agent files** (`.github/copilot-agents/*.agent.md`) — recommended for team sharing
2. **VS Code settings** (`settings.json`) — for personal/local servers
3. **GitHub MCP Registry** ([github.com/mcp](https://github.com/mcp)) — discover and install community servers

**Step 1: Review Agent-Based MCP Configuration (Real Example)**
```yaml
# File: .github/copilot-agents/context7.agent.md (from this repo)
---
name: Context7-Expert
description: Expert in latest library versions using up-to-date documentation
argument-hint: 'Ask about specific libraries/frameworks'
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
    prompt: Implement the solution using the Context7 best practices.
    send: false
---
```

> **Note**: This repo has **15+ agent files** in `.github/copilot-agents/` including `tdd-red.agent.md`, `tdd-green.agent.md`, `debug.agent.md`, `terraform-azure-planning.agent.md`, and more.

**Step 1b: VS Code settings.json (alternative for local servers)**
```json
// Open VS Code settings.json (Cmd+,)
// Search: "mcp"

{
  "mcp": {
    "servers": {
      // Local MCP server example
      "my-local-tools": {
        "command": "npx",
        "args": ["-y", "@my-org/mcp-server"],
        "env": {}
      }
    }
  }
}
```

**Step 2: Understanding MCP Server Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                     Copilot Chat                             │
│            (VS Code / JetBrains / GitHub.com)                │
└─────────────────────┬───────────────────────────────────────┘
                      │ JSON-RPC 2.0 / HTTP (Streamable)
         ┌────────────┼────────────┬────────────┐
         ▼            ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │@context7 │ │ @azure   │ │@github   │ │ @custom  │
   │ (Docs)   │ │ (Cloud)  │ │(Registry)│ │ (Agents) │
   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
        │            │            │            │
   ┌────▼────┐ ┌─────▼────┐ ┌─────▼────┐ ┌─────▼────────┐
   │ Mapbox  │ │  Azure   │ │  GitHub  │ │ .github/     │
   │ Stripe  │ │  Portal  │ │  MCP     │ │ copilot-     │
   │ React   │ │  CLI     │ │  Servers │ │ agents/*.md  │
   └─────────┘ └──────────┘ └──────────┘ └──────────────┘
```

**Step 3: MCP Tool Discovery**
```bash
# In Copilot Chat, MCP servers auto-register their tools
# Type @ to see all available agents/MCP servers

@context7    - Fetch live documentation for any library
@azure       - Azure resource operations
@github      - GitHub MCP Registry servers
@tdd-red     - Write failing tests (TDD Red phase)
@tdd-green   - Write passing implementation (TDD Green)
@debug       - Debug and diagnose issues
@terraform-azure-planning - Plan Terraform infrastructure

# Discover more servers at: https://github.com/mcp
```

> **GitHub MCP Registry**: Browse community MCP servers at [github.com/mcp](https://github.com/mcp). For Business/Enterprise orgs, admins must enable MCP policies in org settings before developers can use them.

### Migration Path: Extension → MCP

**Before (Copilot Extension)**:
```typescript
// Old: Custom extension with proprietary API
// File: extension/src/chat-participant.ts

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    'road-trip.validator',
    async (request, context, response, token) => {
      // Extension-specific handler
      const result = await validateCoordinates(request.prompt);
      response.markdown(result);
    }
  );
  
  participant.iconPath = vscode.Uri.file('icon.png');
  context.subscriptions.push(participant);
}
```

**After (MCP Agent File)**:
```yaml
# New: Standardized agent file with MCP server
# File: .github/copilot-agents/road-trip-validator.agent.md
---
name: Road-Trip-Validator
description: Validates GeoJSON coordinates and route data
tools: ['read', 'search']
mcp-servers:
  road-trip-tools:
    type: http
    url: "http://localhost:3001/mcp"
    tools: ["validate_coordinates", "check_route"]
---

# Road Trip Validator Agent

You are a coordinate validation assistant.

## Rules
- Validate all coordinates are in [longitude, latitude] format
- Longitude range: -180 to 180
- Latitude range: -90 to 90
- Use the validate_coordinates tool for checking files
```

> **Key Difference**: Agent files combine instructions + MCP config + handoff rules in one portable markdown file that works across VS Code, JetBrains, and GitHub.com.

### Teaching Points

1. **Why MCP Matters**:
   - **Standardization**: One protocol, many IDEs (VS Code, Cursor, JetBrains)
   - **Ecosystem**: Reuse servers across projects and organizations
   - **Discoverability**: Tools auto-register, no manual configuration

2. **When to Use MCP vs Custom Agents**:
   - **MCP Servers**: External integrations, documentation, cloud ops
   - **Custom Agent Files** (`.github/copilot-agents/`): Project-specific validation, TDD workflows, code generation rules
   - **Reusable Prompts** (`.github/prompts/`): Repeated prompt templates

3. **MCP Server Types**:
   ```
   Agent Files       → .github/copilot-agents/*.agent.md (team-shared)
   VS Code Settings  → settings.json mcp config (personal)
   GitHub Registry   → github.com/mcp (community servers)
   Cloud Servers     → Azure, AWS, GCP integrations
   Documentation     → @context7, library docs
   ```

4. **This Repo's Agent Files** (15+ agents):
   ```
   .github/copilot-agents/
   ├── context7.agent.md          # Live documentation fetching
   ├── tdd-red.agent.md           # TDD: Write failing tests  
   ├── tdd-green.agent.md         # TDD: Write passing code
   ├── tdd-refactor.agent.md      # TDD: Refactor phase
   ├── debug.agent.md             # Debugging assistant
   ├── accessibility.agent.md     # A11y auditing
   ├── terraform-azure-planning.agent.md
   ├── playwright-tester.agent.md # E2E testing
   ├── janitor.agent.md           # Code cleanup
   ├── pre-commit-enforcer.agent.md
   └── ... and more
   ```

### Verification
```bash
# List configured MCP servers
# In Copilot Chat: @
# Should see: @context7, @azure, etc.

# Test tool discovery
@context7 list available tools

# Verify server health
# VS Code Output panel → GitHub Copilot Chat
# Look for: "MCP server 'context7' connected"
```

---

## Demo 2: MCP Servers - @context7 & @azure Integration (12 min)

### Objective
Use MCP servers to fetch live external documentation (@context7) and execute Azure cloud operations (@azure) directly from Copilot Chat.

### Scenario
Update `/api/directions` endpoint using live Mapbox documentation, then deploy infrastructure using Azure MCP server.

### Part A: @context7 for Live Documentation

**Step 1: Fetch Mapbox API documentation**
```python
# In Copilot Chat (Cmd+Shift+I):

@context7 Fetch Mapbox Directions API truck profile documentation

Topic: truck routing with vehicle restrictions (height, weight, width)
Focus on: query parameters, units, API endpoint format
```

**Expected @context7 Response** (Live documentation):
```
📚 Context7: Mapbox Directions API - Truck Profile

Source: https://docs.mapbox.com/api/navigation/directions/
Updated: 2 days ago

## Truck Profile Parameters

**Endpoint**: 
GET https://api.mapbox.com/directions/v5/mapbox/driving-traffic/{coordinates}

**Vehicle Restriction Parameters** (all optional):
- `height`: Maximum vehicle height in **meters** (float)
- `weight`: Maximum vehicle weight in **kilograms** (float)
- `width`: Maximum vehicle width in **meters** (float)
- `length`: Maximum vehicle length in **meters** (float)
- `axle_count`: Number of axles (integer)
- `hazmat`: Hazardous materials flag (boolean)

**Example Request**:
```
https://api.mapbox.com/directions/v5/mapbox/driving-traffic/-122.4194,37.7749;-118.2437,34.0522
  ?access_token=YOUR_TOKEN
  &height=4.11    # 13.5 ft in meters
  &weight=10886   # 12 tons in kg
  &width=2.59     # 8.5 ft in meters
```

**Response**: Standard GeoJSON with route avoiding low bridges, weight restrictions

**Important**: Truck profile requires **Mapbox Premium** (not available in free tier)
For free tier: Use `mapbox/driving` and ignore restrictions
```

**Decision Point**: Review documentation accuracy
- ✅ Units confirmed: meters (not feet), kilograms (not tons)
- ✅ Profile name: `mapbox/driving-traffic` (real-time traffic with restrictions)
- ⚠️ Pricing note: Truck profile requires premium account

**Step 2: Use @context7 output to update endpoint**
```python
# Copy context7 output to editor as comment for reference
# Then prompt Copilot:

# Update /api/directions endpoint following Mapbox truck profile docs from @context7
# Requirements:
# - Accept vehicle_type: 'car' | 'rv' | 'truck'
# - If rv/truck: use mapbox/driving-traffic profile with restrictions
# - Convert vehicle_specs from imperial (ft, tons) to metric (m, kg)
# - Conversion factors (from @context7):
#   - 1 ft = 0.3048 m
#   - 1 ton = 907.185 kg
```

**Expected Copilot Suggestion** (Using @context7 context):
```python
from typing import Optional
from pydantic import BaseModel, Field

class VehicleSpecs(BaseModel):
    """Vehicle specifications for routing restrictions."""
    height_ft: Optional[float] = Field(None, description="Height in feet")
    weight_tons: Optional[float] = Field(None, description="Weight in US tons")
    width_ft: Optional[float] = Field(None, description="Width in feet")
    length_ft: Optional[float] = Field(None, description="Length in feet")

# Note: In this repo, /api/directions is a GET endpoint.
# The BFF proxies to Java backend: GET /api/directions?coords=lng,lat;lng,lat&profile=driving
# The existing Python endpoint signature is:
#   @app.get("/api/directions")
#   async def get_directions(coords: str, profile: str = "driving")
# 
# For vehicle-aware routing, we'd extend the Java backend's GeospatialController:

@app.get("/api/directions")
async def get_directions(
    coords: str,
    profile: str = "driving",
    vehicle_type: str = "car",
    height_ft: Optional[float] = None,
    weight_tons: Optional[float] = None,
    width_ft: Optional[float] = None,
    length_ft: Optional[float] = None
):
    """Calculate route with vehicle-aware routing using Mapbox API.
    
    Args:
        coords: Semicolon-separated coordinates "lng,lat;lng,lat"
        profile: Mapbox profile - 'driving', 'driving-traffic'
        vehicle_type: 'car' | 'rv' | 'truck'
    """
    
    # Determine Mapbox profile
    if vehicle_type in ['rv', 'truck']:
        profile = 'driving-traffic'  # ✅ From @context7 docs!
    
    # Build URL
    mapbox_token = os.getenv("MAPBOX_TOKEN")
    url = f"https://api.mapbox.com/directions/v5/mapbox/{profile}/{coords}"
    
    # Base parameters
    params = {
        "access_token": mapbox_token,
        "geometries": "geojson",
        "overview": "full",
        "steps": "true"
    }
    
    # Add vehicle restrictions (convert imperial to metric)
    if vehicle_type in ['rv', 'truck']:
        # ✅ Correct conversions from @context7:
        if height_ft:
            params['height'] = round(height_ft * 0.3048, 2)  # ft → m
        if weight_tons:
            params['weight'] = round(weight_tons * 907.185, 2)  # tons → kg
        if width_ft:
            params['width'] = round(width_ft * 0.3048, 2)  # ft → m
        if length_ft:
            params['length'] = round(length_ft * 0.3048, 2)  # ft → m
    
    # Make API call
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Mapbox API error: {response.text}"
            )
        
        data = response.json()
    
    if 'routes' not in data or len(data['routes']) == 0:
        raise HTTPException(status_code=404, detail="No route found")
    
    route = data['routes'][0]
    
    return {
        "routeGeoJSON": route['geometry'],
        "distance": route['distance'],
        "duration": route['duration'],
        "vehicle_type": vehicle_type,
        "profile_used": f"mapbox/{profile}",
        "restrictions_applied": vehicle_type in ['rv', 'truck']
    }
```

**Step 3: Test with real vehicle specs**
```bash
# Test truck routing with height restriction (GET with query params)
curl "http://localhost:3000/api/directions?coords=-122.4194,37.7749;-118.2437,34.0522&vehicle_type=truck&height_ft=13.5&weight_tons=12.0&width_ft=8.5&length_ft=35.0"

# Note: Requests go through the BFF (port 3000) which proxies to:
#   Java backend (port 8082) for /api/directions

# Expected response:
# {
#   "routeGeoJSON": {...},
#   "distance": 620000,  # May differ from car route (avoids low bridges)
#   "profile_used": "mapbox/driving-traffic",
#   "restrictions_applied": true
# }
```
```

### Common Copilot Mistakes

**Mistake #1: Using outdated documentation**
```python
# ❌ Without @context7, Copilot might suggest (outdated):
params['max_height'] = specs.height_ft  # Wrong parameter name!
# Mapbox changed to 'height' in 2023

# ✅ With @context7 (always current):
params['height'] = specs.height_ft * 0.3048  # Current parameter
```

**Mistake #2: Wrong unit conversions**
```python
# ❌ Copilot might guess wrong conversion factors:
params['weight'] = specs.weight_tons * 1000  # Pounds, not kg!

# ✅ @context7 provides accurate conversions:
params['weight'] = specs.weight_tons * 907.185  # 1 US ton = 907.185 kg
```

**Mistake #3: Not using @context7 for complex APIs**
```python
# ⚠️ Developer prompts Copilot without @context7:
# "Add Mapbox truck routing"
# → Copilot hallucinates parameters based on training data (may be wrong)

# ✅ Always use @context7 for external APIs:
@context7 Fetch Mapbox truck routing parameters
# → Copilot uses LIVE documentation (always accurate)
```

### Teaching Points

1. **When to Use @context7**:
   - ✅ **External APIs**: Mapbox, Stripe, AWS SDK
   - ✅ **Library upgrades**: Check for breaking changes
   - ✅ **New features**: APIs you've never used before
   - ❌ **Internal code**: Use `@workspace` instead

2. **MCP vs @workspace**:
   ```
   @context7 → External documentation (Mapbox, React docs)
   @workspace → Internal codebase (your project files)
   ```

3. **@context7 Best Practices**:
   - Be specific: "Fetch Mapbox Directions API **truck profile** parameters"
   - Include version if known: "Mapbox API v5 documentation"
   - Focus topic: "Focus on query parameters, not authentication"

### Verification
```bash
# Test endpoint with various vehicle types
pytest tests/test_main.py::test_directions_with_vehicle_type -v

# Check Mapbox API documentation manually
# Compare @context7 output with official docs
# https://docs.mapbox.com/api/navigation/directions/

# Verify unit conversions
python -c "print(13.5 * 0.3048)"  # Should match params['height']
```

### Part B: @azure MCP for Cloud Operations

**Step 1: List Azure resources**
```bash
# In Copilot Chat:

@azure List all resource groups in my subscription

# Response shows available resource groups:
# - rg-roadtrip-dev
# - rg-roadtrip-prod
```

**Step 2: Query App Service configuration**
```bash
# In Copilot Chat:

@azure Get app settings for roadtrip-api-hl in rg-roadtrip-dev

# Response includes current environment variables
# (without exposing secret values)
```

**Step 3: Execute Azure CLI via MCP**
```bash
# In Copilot Chat:

@azure Run az webapp list --query "[].{name:name, state:state}" --output table

# Copilot executes via Azure MCP server, returns formatted output
```

### Teaching Points

1. **MCP Server Security**:
   - Credentials managed via environment variables
   - MCP servers run locally (no cloud proxy)
   - Audit log available in VS Code output panel

2. **@context7 vs @azure**:
   ```
   @context7 → Read-only documentation fetching
   @azure    → Read/write Azure resource operations
   ```

---

## Demo 3: Enterprise Policy Management (12 min)

### Objective
Configure organization-wide GitHub Copilot policies for governance, content exclusions, and security compliance.

### Enterprise Policy Locations

```
┌─────────────────────────────────────────────────────────────┐
│        GitHub Copilot Governance Hierarchy                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Enterprise Policies (GitHub.com → Enterprise Settings)    │
│     └── Feature toggles (Copilot Chat, CLI, etc.)             │
│     └── MCP server policy (allow/deny)                       │
│                                                              │
│  2. Organization Policies (GitHub.com → Org Settings)         │
│     └── Content exclusions (file patterns)                   │
│     └── Seat management                                     │
│                                                              │
│  3. Repository Custom Instructions (in-repo files)            │
│     └── .github/copilot-instructions.md (repo-wide)           │
│     └── .github/instructions/*.instructions.md (path-scoped)  │
│     └── AGENTS.md (coding agent instructions)                │
│                                                              │
│  4. User Settings (VS Code / IDE)                             │
│     └── Personal preferences, model selection                │
│                                                              │
│  ⚠️  Higher levels restrict; lower levels cannot override      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

> **Important**: There is NO `copilot-policies.yml` file. GitHub Copilot policies are configured via the GitHub.com web UI at org/enterprise level. Content exclusions are set in **Organization Settings → Copilot → Content exclusions**.

### Policy Configuration Files

**Enterprise/Organization Policy (GitHub.com Settings)**:
```
Settings → Copilot → Policies

✅ Copilot in GitHub.com
✅ Copilot Chat in IDEs  
✅ Copilot CLI
✅ Copilot for Pull Requests
✅ Copilot Extensions & MCP

Content Exclusions (Org Settings → Copilot → Content exclusions):
├── **/secrets/**
├── **/.env*
├── **/credentials/**
└── **/private/**
```

> **Note**: Content exclusions are configured in the GitHub.com web UI, NOT in a YAML file. Paths use fnmatch syntax and are applied at the organization or repository level.

**Repository-Level Custom Instructions** (`.github/copilot-instructions.md`):
```markdown
# File: .github/copilot-instructions.md (from this repo - 471 lines!)
# This file gives Copilot context about your project

## Architecture Overview
This is a polyglot microservices road trip planning app with a 
Node.js BFF routing to Python, C#, and Java backends.

## Code Standards (Strictly Enforced)
- Frontend: React 18+ with TypeScript
- State Management: Zustand ONLY (NOT Redux)
- Map Library: React Map GL ONLY (NOT Leaflet)
- AI Provider: Azure OpenAI (in C# backend, NOT Google Gemini)
- ORM: SQLAlchemy ONLY in Python

## BFF Route Table
| Frontend Path | Backend | Service |
|---|---|---|
| /api/auth/* | backend-python:8000 | Python |
| /api/directions* | backend-java:8082 | Java |
| /api/v1/parse-vehicle | backend-csharp:8081 | C# |
```

**Path-Scoped Instructions** (`.github/instructions/*.instructions.md`):
```markdown
# File: .github/instructions/frontend.instructions.md
---
applyTo: "frontend/**"
---

# Frontend Development Standards
- Use TypeScript strict mode
- All components must have prop interfaces
- Use Zustand for global state, React hooks for local state
```

**Coding Agent Instructions** (`AGENTS.md`):
```markdown
# File: AGENTS.md (root of repo)
# Instructions specifically for the GitHub Copilot coding agent

## Testing Requirements
- Run `docker compose up` before integration tests
- Always run `npm test` in frontend/ before committing
- Check all backends start without errors
```

### Live Demo: Configure Content Exclusions

**Step 1: Configure exclusions in GitHub.com UI**
```
# Navigate to: GitHub.com → Organization Settings → Copilot → Content exclusions
# (or Repository Settings → Copilot → Content exclusions)

# Add exclusion patterns:
Paths to exclude:
  "**/.env*"           # Environment files with secrets
  "**/secrets/**"      # Secrets directory
  "**/*.pem"           # Certificate files  
  "**/*.key"           # Private key files
  "**/alembic/versions/**"  # Database migrations
  "**/node_modules/**"  # Dependencies
  "**/venv/**"          # Python virtual env
  "**/__pycache__/**"   # Python cache
  "**/dist/**"          # Build outputs
  "**/fixtures/**"      # Test data
```

**Step 2: Create custom instructions file (repo-level)**
```bash
# This file already exists in the repo!
cat .github/copilot-instructions.md | head -20

# To create one for a new repo:
mkdir -p .github
cat > .github/copilot-instructions.md << 'EOF'
# Project Name - AI Coding Guide

## Architecture
Describe your architecture here so Copilot understands your project.

## Code Standards
- List your coding conventions
- Technology choices and constraints
EOF
```
```bash
# Create a file that should be excluded
mkdir -p secrets
echo "API_KEY=super_secret_123" > secrets/api_keys.txt

# In Copilot Chat:
@workspace What's in the secrets folder?

# Expected: Copilot should NOT have access to excluded files
# Response: "I don't have access to files in the secrets folder"
```

**Step 3: Test content exclusion**
```python
# In backend/main.py, try to reference excluded file:

# Type: "Read the API key from secrets/"
# Copilot should NOT suggest reading from excluded paths
```

### Enterprise Audit Dashboard

**GitHub Enterprise Settings → Copilot → Usage**:
```
┌────────────────────────────────────────────────────────────┐
│                  Copilot Usage Dashboard                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Organization: road-trip-team                               │
│  Period: Last 30 days                                       │
│                                                             │
│  ┌──────────────────┬───────────────────────────────────┐  │
│  │ Metric           │ Value                              │  │
│  ├──────────────────┼───────────────────────────────────┤  │
│  │ Active Users     │ 12 / 15 seats (80%)               │  │
│  │ Suggestions      │ 45,230 total                       │  │
│  │ Acceptance Rate  │ 34.2%                              │  │
│  │ Chat Messages    │ 2,890                              │  │
│  │ Files Excluded   │ 1,245 (policy enforced)           │  │
│  └──────────────────┴───────────────────────────────────┘  │
│                                                             │
│  Policy Violations: 0                                       │
│  Content Exclusion Hits: 234                                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Teaching Points

1. **Custom Instructions Hierarchy**: Enterprise policies (UI) > Org exclusions (UI) > Repo instructions (`.github/copilot-instructions.md`) > Path-scoped (`.github/instructions/`) > User settings (IDE)
2. **Content Exclusions**: Configured in GitHub.com org/repo settings UI — **not** in a YAML file. Copilot will not read or suggest from excluded paths.
3. **Three Instruction File Types**:
   - `.github/copilot-instructions.md` — repo-wide context (architecture, standards)
   - `.github/instructions/*.instructions.md` — path-scoped with `applyTo` frontmatter
   - `AGENTS.md` — instructions for the Copilot coding agent
4. **Privacy**: GitHub, its affiliates, and third parties **do not** use your code for AI model training. This cannot be enabled. Enterprise customers get additional data protection.
5. **Audit**: GitHub provides a Copilot audit log for Enterprise organizations

### Verification
```bash
# Test content exclusion
echo "secret_password=12345" > .env.local

# In Copilot Chat:
@workspace Show me the contents of .env.local

# Should be blocked by policy

# Check VS Code Output panel for policy enforcement logs
# Output → GitHub Copilot → Look for "Policy: content excluded"
```

---

## Demo 4: Model Selection & Cost Optimization (12 min)

### Objective
Choose the right AI model for each task and understand premium request allocation for cost management.

### Available Models in GitHub Copilot (2025)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    GitHub Copilot Model Selection (2025)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Model            │ Best For                     │ Speed   │ Request Type    │
│  ─────────────────┼──────────────────────────────┼─────────┼─────────────────│
│  GPT-4.1          │ General coding, chat         │ Fast    │ Base            │
│  Claude Sonnet 4  │ Complex reasoning, docs      │ Fast    │ Base            │
│  Gemini 2.5 Pro   │ Large context, multimodal    │ Fast    │ Base            │
│  Claude Opus 4    │ Expert analysis, refactoring │ Slower  │ Premium (×1)    │
│  o3-mini          │ Math reasoning, algorithms   │ Medium  │ Premium (×1)    │
│  o4-mini          │ Complex reasoning, lower cost│ Medium  │ Premium (×1)    │
│                                                                               │
│  Note: Base models are included in your seat. Premium models consume          │
│  premium requests from your monthly allocation.                               │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Model Selection Strategy

**Live Demo: Choose Model Based on Task**

```python
# Scenario 1: Simple code completion (use GPT-4.1 — base model)
# Task: Add a type hint to a function
def calculate_distance(lat1, lng1, lat2, lng2):  # Add type hints

# In VS Code:
# Click model dropdown in Copilot Chat panel → GPT-4.1
# → Fast base model, no premium request cost


# Scenario 2: Complex refactoring (use Claude Sonnet 4 or Opus 4)
# Task: Refactor entire module to use async/await pattern

# In Copilot Chat:
# Model selector (dropdown) → Claude Sonnet 4
# "Refactor backend/main.py to use async database connections"
# → Best for understanding complex code structure


# Scenario 3: Algorithm design (use o3-mini or o4-mini)
# Task: Implement Haversine distance with optimizations

# In Copilot Chat:
# Model selector (dropdown) → o3-mini
# "Implement optimized Haversine formula for batch coordinate distance calculations"
# → Best for mathematical reasoning
```

### Premium Request Billing Model

**Understanding GitHub Copilot Billing**:
```
┌─────────────────────────────────────────────────────────────┐
│              Premium Request Billing Model                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GitHub Copilot uses SEAT-BASED pricing, NOT per-token.      │
│                                                              │
│  Plan         │ Price      │ Premium Requests/mo             │
│  ─────────────┼────────────┼─────────────────────────────────│
│  Free         │ $0         │ Limited (2,000 completions +    │
│               │            │   50 chat messages/mo)          │
│  Pro          │ $10/mo     │ Unlimited base + premium pool   │
│  Pro+         │ $39/mo     │ Unlimited base + larger pool    │
│  Business     │ $19/seat   │ Unlimited base + premium pool   │
│  Enterprise   │ $39/seat   │ Unlimited base + premium pool   │
│                                                              │
│  Base models (GPT-4.1, Claude Sonnet 4): No premium cost    │
│  Premium models (Opus 4, o3-mini, o4-mini): 1 premium req   │
│                                                              │
│  No per-token billing. No surprise overages.                 │
│  Premium requests reset monthly.                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Cost Optimization Strategies

**Strategy 1: Model Routing by Task Complexity**
```yaml
# Recommended model by task type:

Simple Tasks (GPT-4.1 / Claude Sonnet 4 — base, no premium cost):
  - Type hints
  - Import statements
  - Simple completions
  - Variable naming

Standard Tasks (GPT-4.1 / Gemini 2.5 Pro — base, no premium cost):
  - Function implementation
  - Bug fixes
  - Unit tests
  - Documentation

Complex Tasks (Claude Opus 4 / o3-mini / o4-mini):
  - Architecture decisions
  - Multi-file refactoring
  - Algorithm optimization
  - Security review
```

**Strategy 2: Context Window Management**
```python
# ❌ Expensive: Large context, simple question
# Sends entire 1000-line file + question

@workspace Explain line 45 of main.py  # Bad: reads whole file

# ✅ Efficient: Minimal context with #file reference
# Only sends the specified file as context

#file:backend/main.py Explain the get_directions function  # Good: specific file
```

> **Note**: The `#file:path:line-range` syntax (e.g., `#file:backend/main.py:40-50`) is NOT supported. Use `#file:path` to reference an entire file, or select specific lines in the editor before prompting.

**Strategy 3: Use Base Models for Routine Work**
```
# Instead of always using premium models:

✅ GPT-4.1 / Claude Sonnet 4 (base, no premium cost):
  - Code completions, unit tests, documentation
  - Bug fixes, simple refactoring
  - Most day-to-day development

💠 Claude Opus 4 / o4-mini (premium requests):
  - Complex multi-file refactoring
  - Architecture design decisions
  - Security analysis
  - Reserve for high-value tasks
```

### Live Demo: Monitor Premium Request Usage

**Step 1: Check usage in GitHub.com**
```bash
# Navigate to: GitHub.com → Settings → Copilot → Usage
# Shows: Premium requests used / total allocation
# Resets monthly
```

**Step 2: View model in Copilot Chat**
```bash
# In Copilot Chat:
# Click the model name dropdown at the top of the chat panel
# See which model is currently selected
# Switch models based on task complexity
```

**Step 3: Estimate team costs**
```python
# Quick cost calculator for team planning
team_size = 15
plan = "Business"  # $19/seat/month
monthly_seat_cost = 19

monthly_cost = team_size * monthly_seat_cost
annual_cost = monthly_cost * 12

print(f"Monthly team cost: ${monthly_cost:,.2f}")  # $285.00
print(f"Annual team cost: ${annual_cost:,.2f}")    # $3,420.00

# Note: Premium requests are included in seat cost.
# No per-token billing. No surprise overages.
```

### Teaching Points

1. **Model Selection Heuristic**:
   - Start with the default model (GPT-4.1 or Claude Sonnet 4)
   - Switch to premium models only for complex reasoning tasks
   - Use the model dropdown in Copilot Chat to switch

2. **Billing Model**:
   - Copilot uses **premium requests** per seat, NOT per-token billing
   - Base models (GPT-4.1, Sonnet 4, Gemini 2.5 Pro) — effectively unlimited
   - Premium models (Opus 4, o4-mini) — consume premium request quota
   - No surprise overages or usage-based billing

3. **Optimization Levers**:
   - Use `#file:path` to limit context to relevant files
   - Use base models for routine coding tasks
   - Reserve premium models for complex reasoning
   - Select relevant code in the editor before prompting

---

## Demo 5: GitHub Copilot Certification Prep (12 min)

### Objective
Review certification domains and practice with exam-style scenarios for the GitHub Copilot certification exam.

### Certification Overview

```
┌─────────────────────────────────────────────────────────────┐
│              GitHub Copilot Certification                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Exam Format:                                                │
│  • 60 multiple choice questions                              │
│  • 120 minutes                                               │
│  • Passing score: 70%                                        │
│  • Online proctored                                          │
│  • Valid for 2 years                                         │
│                                                              │
│  Domains:                                                    │
│  ├── Domain 1: Copilot Features (25%)                        │
│  ├── Domain 2: Prompt Engineering (25%)                      │
│  ├── Domain 3: Developer Workflows (25%)                     │
│  └── Domain 4: Enterprise & Privacy (25%)                    │
│                                                              │
│  Cost: $99 USD                                               │
│  Prep: 10-20 hours recommended                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Domain 1: Copilot Features (25%)

**Practice Question 1**:
```
Q: Which GitHub Copilot feature allows fetching live documentation 
   from external sources like Mapbox or Stripe APIs?

A) @workspace
B) @context7 (MCP Server)
C) #file reference
D) Inline completions

Answer: B - @context7 is an MCP server that fetches live external documentation
```

**Practice Question 2**:
```
Q: What is the correct order of the Spec Kit workflow?

A) plan → specify → tasks → implement
B) specify → plan → tasks → implement  
C) tasks → plan → specify → implement
D) implement → tasks → plan → specify

Answer: B - specify → plan → tasks → implement
```

### Domain 2: Prompt Engineering (25%)

**Practice Question 3**:
```
Q: Which prompting technique provides the MOST accurate code generation 
   for a complex algorithm?

A) Single-line prompt: "Write sorting algorithm"
B) Chain-of-thought: "Step 1: Parse input. Step 2: Compare elements..."
C) Zero-shot: "Sort this array"
D) Few-shot: Provide 1 example

Answer: B - Chain-of-thought prompting breaks complex tasks into steps
```

**Live Demo: Effective Prompting**
```python
# ❌ Weak prompt (vague, no context):
# "Write a function to calculate distance"

# ✅ Strong prompt (specific, contextual):
# "Write a Python function that:
#  - Calculates Haversine distance between two GPS coordinates
#  - Input: lat1, lng1, lat2, lng2 (all floats, degrees)
#  - Output: distance in miles (float)
#  - Handle edge cases: same point (return 0), antipodal points
#  - Use math library only (no external dependencies)"
```

### Domain 3: Developer Workflows (25%)

**Practice Question 4**:
```
Q: In TDD with Copilot, which agent should you invoke FIRST?

A) @tdd-green (write implementation)
B) @tdd-red (write failing test)
C) @tdd-refactor (optimize code)
D) @debug (fix errors)

Answer: B - TDD workflow starts with @tdd-red to write failing tests first
```

**Practice Question 5**:
```
Q: What are the four chat modes available in GitHub Copilot Chat?

A) Chat, Complete, Review, Fix
B) Ask, Edit, Agent, Plan
C) Prompt, Generate, Refactor, Test
D) Simple, Advanced, Expert, Auto

Answer: B - The four official modes are:
  - Ask: Quick questions and answers (read-only)
  - Edit: Modify code in the editor
  - Agent: Autonomous multi-step task execution
  - Plan: Create execution plans before implementing
  
  Select via the mode dropdown at the top of the Chat panel.
```

### Domain 4: Enterprise & Privacy (25%)

**Practice Question 6**:
```
Q: Where should you define project context and coding standards for 
   GitHub Copilot at the repository level?

A) .gitignore
B) .github/copilot-instructions.md
C) copilot.config.json
D) .vscode/settings.json

Answer: B - .github/copilot-instructions.md provides repo-wide custom 
            instructions. For path-scoped instructions, use 
            .github/instructions/*.instructions.md with applyTo frontmatter.
            Content exclusions are configured separately in the GitHub.com UI.
```

**Practice Question 7**:
```
Q: By default, does GitHub Copilot store or train on your private code?

A) Yes, all code is used for training
B) No, Copilot does not retain prompts or suggestions, and your code is 
   never used for training AI models
C) Only if you opt-in to telemetry
D) Only code from public repositories

Answer: B - GitHub, its affiliates, and third parties will NOT use your 
            data to train AI models. This is not configurable — it cannot 
            be enabled. Copilot does not retain prompts or suggestions.
            Enterprise customers have additional data protection guarantees
            including SOC 2 Type II compliance.
```

**Practice Question 8** (NEW):
```
Q: What is the GitHub Copilot coding agent?

A) A VS Code extension for pair programming
B) An autonomous agent that works on GitHub Issues in the background,
   creating PRs from its own branch
C) A CLI tool for generating code
D) A marketplace extension for code review

Answer: B - The Copilot coding agent (powered by Copilot agent mode) can be 
            assigned to GitHub Issues. It creates a branch, makes changes, 
            runs CI, and opens a PR — all autonomously. Configure with 
            AGENTS.md in your repo root.
```

**Practice Question 9** (NEW):
```
Q: What is the correct way to share MCP server configuration with your team?

A) Each developer configures settings.json manually
B) Use .github/copilot-agents/*.agent.md files with mcp-servers frontmatter
C) Create a shared VS Code profile
D) Use .github/copilot-policies.yml

Answer: B - Agent files in .github/copilot-agents/ are committed to the repo 
            and shared with the team. They support MCP server configuration 
            via inline YAML frontmatter with HTTP transport.
```

### Exam Tips

1. **Study Resources**:
   - GitHub Copilot documentation
   - Microsoft Learn Copilot modules
   - Hands-on practice (most important!)

2. **Key Topics to Master**:
   - MCP servers and agent files (`.github/copilot-agents/`)
   - Prompt engineering techniques
   - Custom instructions (`.github/copilot-instructions.md`)
   - Content exclusions (GitHub.com org settings)
   - Model selection and premium requests
   - Chat modes: Ask, Edit, Agent, Plan
   - TDD workflow with agents
   - Copilot coding agent and AGENTS.md
   - GitHub MCP Registry

3. **Practice Strategy**:
   - Use Copilot daily for 2+ weeks
   - Try all features (Chat, CLI, PR summaries)
   - Review enterprise settings

---

## Demo 6: Copilot Spec Kit Full Workflow (15 min)

### Objective
Use the complete Spec Kit workflow (`@speckit.specify` → `@speckit.plan` → `@speckit.tasks` → `@speckit.implement`) to develop a feature from concept to implementation.

### Scenario
Implement ROADMAP Issue #14: AI Trip Generation feature. The "AI Trip Planner" button exists but doesn't work.

### Spec Kit Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Spec Kit Agent Workflow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: @speckit.specify                                               │
│  ───────────────────────                                                │
│  Input:  Natural language feature description                            │
│  Output: specs/feature-name/spec.md                                      │
│  • User stories with acceptance criteria                                 │
│  • Technical requirements                                                │
│  • Success metrics                                                       │
│                                                                          │
│          ↓                                                               │
│                                                                          │
│  Step 2: @speckit.plan                                                  │
│  ──────────────────────                                                 │
│  Input:  spec.md                                                         │
│  Output: specs/feature-name/plan.md                                      │
│  • Architecture decisions                                                │
│  • File changes required                                                 │
│  • Implementation phases                                                 │
│                                                                          │
│          ↓                                                               │
│                                                                          │
│  Step 3: @speckit.tasks                                                 │
│  ───────────────────────                                                │
│  Input:  spec.md + plan.md                                               │
│  Output: specs/feature-name/tasks.md                                     │
│  • Ordered task list with estimates                                      │
│  • Dependencies between tasks                                            │
│  • Checkboxes for tracking                                               │
│                                                                          │
│          ↓                                                               │
│                                                                          │
│  Step 4: @speckit.implement                                             │
│  ──────────────────────────                                             │
│  Input:  tasks.md                                                        │
│  Output: Actual code changes                                             │
│  • Executes tasks in order                                               │
│  • Creates/modifies files                                                │
│  • Marks tasks complete                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Live Coding Steps

**Step 1: Create feature specification with @speckit.specify**
```markdown
<!-- In Copilot Chat: -->

@speckit.specify Generate feature specification for AI Trip Generation

Feature Request:
- User clicks "AI Trip Planner" button in StartTripView.tsx
- Modal opens with inputs: duration, interests, start location, destination
- Backend calls Azure OpenAI API via C# backend with structured prompt
- Azure OpenAI returns suggested stops with descriptions
- Backend geocodes locations using Azure Maps API
- Frontend displays generated trip in itinerary view

Acceptance Criteria:
- User can generate trip from natural language
- AI suggests 3-5 stops based on interests (via Azure OpenAI)
- All locations have valid coordinates
- Route displays on map
- User can edit AI-generated trip before saving
```

**Expected Output**: `specs/ai-trip-generation/spec.md`
```markdown
# Feature Specification: AI Trip Generation

**Feature ID**: ROADMAP-14
**Status**: Draft

## User Stories

### Story 1: Generate Trip from Prompt
**As a** road trip planner
**I want to** describe my ideal trip in natural language
**So that** I can quickly get a customized itinerary

**Acceptance Criteria**:
- [ ] Modal opens when "AI Trip Planner" button clicked
- [ ] User inputs: duration, interests, start, destination
- [ ] System generates 3-5 stops matching interests
- [ ] Route displays on map within 10 seconds
```

**Step 2: Generate implementation plan with @speckit.plan**
```markdown
<!-- In Copilot Chat: -->

@speckit.plan Create implementation plan for specs/ai-trip-generation/spec.md

Focus on:
- Backend API endpoint design
- Frontend component architecture
- Integration with existing services
```

**Expected Output**: `specs/ai-trip-generation/plan.md`
```markdown
# Implementation Plan: AI Trip Generation

**Estimate**: 16-20 hours

## Phase 1: Backend API (8 hours)
- Create `/api/v1/generate-trip` endpoint in C# backend
- Implement Azure OpenAI prompt template
- Add geocoding via Java backend's Azure Maps integration
- Add validation logic

## Phase 2: Frontend Modal (4 hours)
- Create AITripModal.tsx
- Add form inputs
- Implement loading state

## Phase 3: Integration (4 hours)
- Wire up to useTripStore
- Navigate to ItineraryView
```

**Step 3: Generate tasks with @speckit.tasks**
```markdown
<!-- In Copilot Chat: -->

@speckit.tasks Generate actionable tasks from specs/ai-trip-generation/
```

**Expected Output**: `specs/ai-trip-generation/tasks.md`
```markdown
# Tasks: AI Trip Generation

## Task 1: Create Pydantic schemas (1 hour)
- [ ] Add AITripGenerateRequest schema
- [ ] Add AIGeneratedStop schema
- [ ] Add AITripGenerateResponse schema
**File**: backend/schemas.py

## Task 2: Implement Azure OpenAI prompt (2 hours)
- [ ] Create GenerateTripItinerary() method
- [ ] Design prompt template  
- [ ] Parse AI response
**File**: backend-csharp/Services/AiParsingService.cs

## Task 3: Add geocoding (2 hours)
- [ ] Call Java backend's geocoding endpoint
- [ ] Proxy through BFF: POST /api/geocode
- [ ] Handle errors
**File**: backend-csharp/Services/TripGenerationService.cs

## Task 4: Create API endpoint (2 hours)
- [ ] Add POST /api/v1/generate-trip
- [ ] Orchestrate AI + geocoding + routing
- [ ] Return complete trip
**File**: backend-csharp/Controllers/TripController.cs
```

**Step 4: Execute implementation with @speckit.implement**
```markdown
<!-- In Copilot Chat: -->

@speckit.implement Execute tasks from specs/ai-trip-generation/tasks.md

Start with Task 1: Create Pydantic schemas
```

**Expected Behavior**:
- Agent reads tasks.md
- Creates/modifies files as specified
- Marks tasks complete
- Reports progress

### Spec Kit Supporting Commands

```bash
# Analyze consistency across spec artifacts
@speckit.analyze Check consistency in specs/ai-trip-generation/

# Clarify underspecified requirements
@speckit.clarify Ask clarification questions for spec.md

# Generate custom checklist
@speckit.checklist Create QA checklist for feature
```

### Teaching Points

1. **Spec Kit Benefits**:
   - Structured feature development
   - Traceable requirements → implementation
   - Consistent documentation

2. **When to Use Each Agent**:
   - `@speckit.specify`: Starting new feature
   - `@speckit.plan`: After spec approved
   - `@speckit.tasks`: Ready for implementation
   - `@speckit.implement`: Execute tasks

3. **Best Practices**:
   - Review each artifact before proceeding
   - Iterate on spec before plan
   - Keep tasks small (< 2 hours each)

---

## Demo 7: Copilot Metrics & Productivity Dashboard (15 min)

### Objective
Configure and interpret GitHub Copilot metrics to measure productivity, ROI, and identify optimization opportunities.

### Metrics Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│              GitHub Copilot Metrics Dashboard                            │
│              (github.com/organizations/ORG/settings/copilot/metrics)    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ORGANIZATION SUMMARY (Last 30 days)                             │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  Active Users      │ 45 / 50 seats (90%)                         │    │
│  │  Suggestions       │ 125,450 total                               │    │
│  │  Acceptance Rate   │ 31.2% (industry avg: 28%)                   │    │
│  │  Lines Accepted    │ 89,340 lines of code                        │    │
│  │  Chat Messages     │ 8,920 conversations                         │    │
│  │  Time Saved (est.) │ 1,240 hours                                 │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ACCEPTANCE RATE BY LANGUAGE                                     │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  Python      ████████████████████████░░░░░░  38%                 │    │
│  │  TypeScript  ███████████████████████░░░░░░░  35%                 │    │
│  │  JavaScript  █████████████████████░░░░░░░░░  32%                 │    │
│  │  Go          ██████████████████░░░░░░░░░░░░  28%                 │    │
│  │  Terraform   █████████████████░░░░░░░░░░░░░  26%                 │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Metrics Explained

| Metric | Definition | Target | Interpretation |
|--------|------------|--------|----------------|
| **Acceptance Rate** | % of suggestions accepted by developers | >25% | Higher = better suggestion quality |
| **Active Users** | Users who accepted 1+ suggestion | >80% seats | Low = onboarding/training needed |
| **Lines Accepted** | Total LOC from accepted suggestions | N/A | Volume indicator |
| **Suggestions/Day** | Average suggestions per user per day | >50 | Low = may not be using Copilot |
| **Chat Messages** | Copilot Chat interactions | N/A | Usage of conversational AI |
| **Time Saved** | Estimated hours saved (LOC × avg time) | N/A | ROI calculation input |

### Live Demo: Accessing Metrics

**Step 1: Navigate to Metrics Dashboard**
```bash
# GitHub.com → Your Organization → Settings → Copilot → Metrics

# URL pattern:
# https://github.com/organizations/YOUR_ORG/settings/copilot/metrics
```

**Step 2: Review Key Metrics**
```
Dashboard Sections:
├── Overview (30-day summary)
├── Usage Over Time (trend graphs)
├── By Language (acceptance rates)
├── By Repository (top repos)
├── By User (individual metrics - admin only)
└── Export (CSV download)
```

**Step 3: Export Data for Analysis**
```bash
# Click "Export" → Select date range → Download CSV

# CSV includes:
# - date, user_id, repository, language
# - suggestions_shown, suggestions_accepted
# - lines_suggested, lines_accepted
# - chat_turns, chat_code_accepted
```

### ROI Calculation Framework

**Formula**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Copilot ROI Formula                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Time Saved = Lines Accepted × Avg Time per Line             │
│                                                              │
│  Example:                                                    │
│  • Lines Accepted/Month: 89,340                              │
│  • Avg Time per Line: 30 seconds (research suggests)         │
│  • Time Saved: 89,340 × 0.5 min = 44,670 minutes            │
│  • Hours Saved: 744.5 hours/month                            │
│                                                              │
│  Cost Savings:                                               │
│  • Avg Developer Hourly Rate: $75                            │
│  • Value Created: 744.5 × $75 = $55,837/month               │
│  • Copilot Cost: 50 seats × $19 = $950/month                │
│  • ROI: ($55,837 - $950) / $950 = 5,778%                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Metrics API (Programmatic Access)

**GitHub API for Copilot Metrics**:
```bash
# Get organization Copilot usage
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/orgs/YOUR_ORG/copilot/usage"

# Response:
{
  "total_seats": 50,
  "seats_used": 45,
  "day_breakdown": [
    {
      "date": "2026-01-20",
      "total_suggestions_count": 4230,
      "total_acceptances_count": 1318,
      "total_lines_suggested": 12500,
      "total_lines_accepted": 3890,
      "total_chat_turns": 298
    }
  ]
}
```

**Build Custom Dashboard**:
```python
# Example: Python script to analyze Copilot metrics
import requests
import pandas as pd

def fetch_copilot_metrics(org: str, token: str) -> dict:
    """Fetch Copilot usage metrics from GitHub API."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }
    response = requests.get(
        f"https://api.github.com/orgs/{org}/copilot/usage",
        headers=headers
    )
    return response.json()

def calculate_acceptance_rate(metrics: dict) -> float:
    """Calculate overall acceptance rate."""
    total_suggestions = sum(d['total_suggestions_count'] for d in metrics['day_breakdown'])
    total_acceptances = sum(d['total_acceptances_count'] for d in metrics['day_breakdown'])
    return (total_acceptances / total_suggestions * 100) if total_suggestions > 0 else 0

# Usage
metrics = fetch_copilot_metrics("road-trip-team", os.getenv("GITHUB_TOKEN"))
rate = calculate_acceptance_rate(metrics)
print(f"30-day acceptance rate: {rate:.1f}%")
```

### Optimizing Based on Metrics

**Low Acceptance Rate (<20%)**:
```
Diagnosis: Copilot suggestions not matching developer needs

Actions:
1. ✅ Add .github/copilot-instructions.md with project context
2. ✅ Create coding standards documentation
3. ✅ Train developers on effective prompting
4. ✅ Review model selection (try different models)
```

**Low Active Users (<60%)**:
```
Diagnosis: Developers not using Copilot

Actions:
1. ✅ Run onboarding workshops (like this one!)
2. ✅ Share success stories from high-usage developers
3. ✅ Check for technical blockers (proxy, firewall)
4. ✅ Create team-specific custom agents
```

**High Suggestions, Low Chat (<10% chat ratio)**:
```
Diagnosis: Underutilizing Copilot Chat capabilities

Actions:
1. ✅ Demo Copilot Chat for code review
2. ✅ Show @workspace for codebase questions
3. ✅ Introduce Plan Mode for complex tasks
4. ✅ Create custom agents for common workflows
```

### Metrics Best Practices

1. **Review Weekly**: Track trends, not just snapshots
2. **Segment by Team**: Different teams have different needs
3. **Set Targets**: Aim for 25-35% acceptance rate
4. **Correlate with Velocity**: Does Copilot usage → faster delivery?
5. **Share Transparently**: Help teams learn from each other

### Teaching Points

1. **Metrics Location**: GitHub.com → Org Settings → Copilot → Metrics
2. **Key Metric**: Acceptance Rate (target >25%)
3. **ROI Formula**: Lines Accepted × Time/Line × Hourly Rate
4. **API Access**: GitHub REST API for programmatic access
5. **Optimization**: Use metrics to guide training and tooling

---

## Workshop Summary

### Learning Objectives Achieved

| Objective | Demo | Key Takeaway |
|-----------|------|--------------|
| Copilot Extensions → MCP | Demo 1 | Extensions evolved to standardized MCP protocol |
| MCP Servers | Demo 2 | @context7 for docs, @azure for cloud ops |
| Enterprise Policy Management | Demo 3 | Content exclusions, audit, feature toggles |
| Model Selection & Cost | Demo 4 | Match model to task complexity |
| Copilot Certification | Demo 5 | 4 domains, 60 questions, 70% passing |
| Spec Kit Workflow | Demo 6 | specify → plan → tasks → implement |
| Copilot Metrics | Demo 7 | Track acceptance rate, calculate ROI |

### Next Steps

1. **Practice**: Use each feature in your daily workflow
2. **Certify**: Schedule GitHub Copilot certification exam
3. **Measure**: Review your team's Copilot metrics
4. **Optimize**: Create custom agents for your workflows
5. **Share**: Teach these techniques to your team

### Resources

- [GitHub Copilot Documentation](https://docs.github.com/copilot)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Copilot Certification](https://examregistration.github.com/certification/GHCP)
- [Context7 MCP Server](https://github.com/upstage/context7)
- [Spec Kit Agents](https://github.com/hlucianojr1/copilot-spec-kit)

---

## Appendix: Quick Reference

### MCP Server Commands
```bash
# List available MCP servers
@  # In Copilot Chat, shows all available @ mentions

# Common MCP servers
@context7    # Fetch external documentation
@azure       # Azure resource operations
@workspace   # Search project files
```

### Spec Kit Workflow
```bash
@speckit.specify  # Create feature spec from description
@speckit.plan     # Generate implementation plan
@speckit.tasks    # Create task list with estimates
@speckit.implement # Execute tasks
@speckit.analyze  # Check consistency across artifacts
@speckit.clarify  # Ask clarifying questions
```

### Model Selection Guide
```
Base models (included in seat, no premium cost):
  Simple + standard tasks → GPT-4.1 / Claude Sonnet 4
  Large context work      → Gemini 2.5 Pro

Premium models (consume premium requests):
  Complex refactoring     → Claude Opus 4
  Math / algorithm design → o3-mini / o4-mini
```

### Custom Instruction Files
```
.github/copilot-instructions.md              # Repo-wide instructions (always active)
.github/instructions/*.instructions.md       # Path-scoped instructions (applyTo frontmatter)
.github/copilot-agents/*.agent.md            # Agent files (MCP servers, custom agents)
.github/prompts/*.prompt.md                  # Reusable prompt templates
AGENTS.md                                    # Coding agent instructions (any directory)

Note: Policies are configured via GitHub.com UI, NOT via YAML files.
```

### Metrics API
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/orgs/ORG/copilot/usage"
```

### Certification Study Topics
1. Copilot Features (25%) - MCP, Chat modes (Ask/Edit/Agent/Plan), completions
2. Prompt Engineering (25%) - Chain-of-thought, few-shot, custom instructions
3. Developer Workflows (25%) - TDD, agent files, coding agent, spec kits
4. Enterprise & Privacy (25%) - Premium requests, content exclusions, privacy

---


*Workshop 4 Complete - Expert Web Development with GitHub Copilot*
