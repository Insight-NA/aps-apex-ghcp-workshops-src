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
4. **Model Selection & Cost Optimization**: Choose appropriate models (GPT-4o, Claude, o1) based on task complexity and manage API costs
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
| 36-48 min | Demo 4 | Model Selection & Cost Optimization | Model comparison, token economics |
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

**Step 1: Review VS Code MCP Configuration**
```json
// Open VS Code settings.json (Cmd+,)
// Search: "github.copilot.chat.mcp"

{
  "github.copilot.chat.mcp.servers": {
    // Context7 - External documentation fetching
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstage/context7-mcp"],
      "env": {}
    },
    
    // Azure MCP - Cloud resource operations
    "azure": {
      "command": "npx", 
      "args": ["-y", "@azure/mcp-server"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": "${env:AZURE_SUBSCRIPTION_ID}"
      }
    },
    
    // Custom MCP Server (local development)
    "road-trip-tools": {
      "command": "node",
      "args": ["./tools/mcp-server/index.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

**Step 2: Understanding MCP Server Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                     Copilot Chat                             │
│                   (VS Code / IDE)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ JSON-RPC 2.0
         ┌────────────┼────────────┬────────────┐
         ▼            ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │@context7 │ │ @azure   │ │@blender  │ │ @custom  │
   │ (Docs)   │ │ (Cloud)  │ │ (3D)     │ │ (Local)  │
   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
        │            │            │            │
   ┌────▼────┐ ┌─────▼────┐ ┌─────▼────┐ ┌─────▼────┐
   │ Mapbox  │ │  Azure   │ │ Blender  │ │ Your     │
   │ Stripe  │ │  Portal  │ │  Python  │ │ Tools    │
   │ React   │ │  CLI     │ │  API     │ │          │
   └─────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Step 3: MCP Tool Discovery**
```bash
# In Copilot Chat, MCP servers auto-register their tools
# Type @ to see all available MCP servers

@context7 - Fetch live documentation for any library
@azure - Execute Azure CLI commands and resource operations
@blender - Control Blender 3D modeling (if installed)
```

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

**After (MCP Server)**:
```typescript
// New: Standardized MCP server
// File: tools/mcp-server/index.js

import { MCPServer } from '@modelcontextprotocol/server';

const server = new MCPServer({
  name: 'road-trip-tools',
  version: '1.0.0',
  description: 'Road Trip Planner development tools'
});

// Tools auto-discovered by Copilot
server.registerTool({
  name: 'validate_coordinates',
  description: 'Validate GeoJSON coordinate format [lng, lat]',
  parameters: {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: 'Path to file to validate' }
    }
  },
  handler: async ({ file_path }) => {
    return await validateCoordinates(file_path);
  }
});

server.start();
```

### Teaching Points

1. **Why MCP Matters**:
   - **Standardization**: One protocol, many IDEs (VS Code, Cursor, JetBrains)
   - **Ecosystem**: Reuse servers across projects and organizations
   - **Discoverability**: Tools auto-register, no manual configuration

2. **When to Use MCP vs Extensions**:
   - **MCP Servers**: External integrations, documentation, cloud ops
   - **Custom Agents**: Project-specific validation, code generation rules

3. **MCP Server Types**:
   ```
   Local Servers    → npm packages, local scripts
   Cloud Servers    → Azure, AWS, GCP integrations  
   Documentation    → @context7, @docs
   Specialized      → @blender, @figma, @database
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

class DirectionsRequest(BaseModel):
    coordinates: List[List[float]]
    vehicle_type: str = 'car'  # 'car' | 'rv' | 'truck'
    vehicle_specs: Optional[VehicleSpecs] = None

@app.post("/api/directions")
async def get_directions(request: DirectionsRequest):
    """Calculate route with vehicle-aware routing using Mapbox API."""
    
    # Determine Mapbox profile
    if request.vehicle_type in ['rv', 'truck']:
        profile = 'mapbox/driving-traffic'  # ✅ From @context7 docs!
    else:
        profile = 'mapbox/driving'
    
    # Build coordinates string
    coords_str = ';'.join([f"{lon},{lat}" for lon, lat in request.coordinates])
    
    # Build URL
    mapbox_token = os.getenv("MAPBOX_TOKEN")
    url = f"https://api.mapbox.com/directions/v5/{profile}/{coords_str}"
    
    # Base parameters
    params = {
        "access_token": mapbox_token,
        "geometries": "geojson",
        "overview": "full"
    }
    
    # Add vehicle restrictions (convert imperial to metric)
    if request.vehicle_specs and request.vehicle_type in ['rv', 'truck']:
        specs = request.vehicle_specs
        
        # ✅ Correct conversions from @context7:
        if specs.height_ft:
            params['height'] = round(specs.height_ft * 0.3048, 2)  # ft → m
        if specs.weight_tons:
            params['weight'] = round(specs.weight_tons * 907.185, 2)  # tons → kg
        if specs.width_ft:
            params['width'] = round(specs.width_ft * 0.3048, 2)  # ft → m
        if specs.length_ft:
            params['length'] = round(specs.length_ft * 0.3048, 2)  # ft → m
    
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
        "vehicle_type": request.vehicle_type,
        "profile_used": profile,
        "restrictions_applied": request.vehicle_specs is not None
    }
```

**Step 3: Test with real vehicle specs**
```bash
# Test truck routing with height restriction
curl -X POST http://localhost:8000/api/directions \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [[-122.4194, 37.7749], [-118.2437, 34.0522]],
    "vehicle_type": "truck",
    "vehicle_specs": {
      "height_ft": 13.5,
      "weight_tons": 12.0,
      "width_ft": 8.5,
      "length_ft": 35.0
    }
  }'

# Expected response:
# {
#   "routeGeoJSON": {...},
#   "distance": 620000,  # May differ from car route (avoids low bridges)
#   "profile_used": "mapbox/driving-traffic",
#   "restrictions_applied": true
# }
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
│              GitHub Copilot Policy Hierarchy                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Enterprise Level (github.com/enterprises/ENTERPRISE/settings)
│  └── Organization Level (github.com/orgs/ORG/settings)       │
│      └── Repository Level (.github/copilot-policies.yml)     │
│          └── User Level (VS Code settings.json)              │
│                                                              │
│  Higher levels override lower levels                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Policy Configuration Files

**Enterprise/Organization Policy (GitHub.com Settings)**:
```
Settings → Copilot → Policies

✅ Copilot in GitHub.com
✅ Copilot Chat in IDEs  
✅ Copilot CLI
☐ Copilot for Pull Requests (Disabled)
☐ Copilot Workspace (Disabled)

Content Exclusions:
├── **/secrets/**
├── **/.env*
├── **/credentials/**
└── **/private/**
```

**Repository-Level Policy** (`.github/copilot-policies.yml`):
```yaml
# File: .github/copilot-policies.yml
# Repository-specific Copilot configuration

version: 1

# Content exclusions - files Copilot won't read or suggest from
content_exclusions:
  - "**/.env*"
  - "**/secrets/**"
  - "**/credentials/**"
  - "backend/alembic/versions/**"
  - "**/node_modules/**"
  - "**/*.pem"
  - "**/*.key"

# Model preferences (when available)
model_preferences:
  default: "gpt-4o"
  complex_tasks: "o1-preview"
  
# Feature toggles
features:
  code_completions: true
  chat: true
  cli: true
  workspace: false  # Disabled for this repo
  
# Audit settings
audit:
  log_prompts: true
  log_completions: false  # Don't log generated code
  retention_days: 90
```

### Live Demo: Configure Content Exclusions

**Step 1: Create policy file**
```bash
mkdir -p .github
cat > .github/copilot-policies.yml << 'EOF'
version: 1

content_exclusions:
  # Secrets and credentials
  - "**/.env*"
  - "**/secrets/**"
  - "**/*.pem"
  - "**/*.key"
  
  # Generated files
  - "**/node_modules/**"
  - "**/venv/**"
  - "**/__pycache__/**"
  - "**/dist/**"
  - "**/build/**"
  
  # Database migrations (often contain sensitive schema)
  - "**/alembic/versions/**"
  - "**/migrations/**"
  
  # Test fixtures with sensitive data
  - "**/fixtures/**"
  - "**/test_data/**"
EOF
```

**Step 2: Test exclusion**
```bash
# Create a file that should be excluded
mkdir -p secrets
echo "API_KEY=super_secret_123" > secrets/api_keys.txt

# In Copilot Chat:
@workspace What's in the secrets folder?

# Expected: Copilot should NOT have access to excluded files
# Response: "I don't have access to files in the secrets folder"
```

**Step 3: Verify exclusion in completions**
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

1. **Policy Hierarchy**: Enterprise > Org > Repo > User
2. **Content Exclusions**: Protect secrets, credentials, sensitive IP
3. **Audit Trail**: Log prompts for compliance (HIPAA, SOC2)
4. **Feature Toggles**: Enable/disable Copilot features per repo

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
Choose the right AI model for each task and understand token economics for cost management.

### Available Models in GitHub Copilot

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GitHub Copilot Model Selection                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Model          │ Best For                    │ Speed   │ Cost/1K tokens│
│  ───────────────┼─────────────────────────────┼─────────┼───────────────│
│  GPT-4o         │ General coding, chat        │ Fast    │ $0.005        │
│  GPT-4o-mini    │ Simple completions          │ Fastest │ $0.00015      │
│  Claude 3.5     │ Complex reasoning, docs     │ Medium  │ $0.003        │
│  Claude Opus 4  │ Expert analysis, refactoring│ Slower  │ $0.015        │
│  o1-preview     │ Complex algorithms, math    │ Slowest │ $0.015        │
│  o1-mini        │ Reasoning tasks, lower cost │ Medium  │ $0.003        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Model Selection Strategy

**Live Demo: Choose Model Based on Task**

```python
# Scenario 1: Simple code completion (use GPT-4o-mini)
# Task: Add a type hint to a function
def calculate_distance(lat1, lng1, lat2, lng2):  # Add type hints

# In VS Code settings:
# "github.copilot.advanced.model": "gpt-4o-mini"
# → Fastest, cheapest for simple tasks


# Scenario 2: Complex refactoring (use Claude Opus 4)
# Task: Refactor entire module to use async/await pattern

# In Copilot Chat:
# Model selector → Claude Opus 4.5
# "Refactor backend/main.py to use async database connections"
# → Best for understanding complex code structure


# Scenario 3: Algorithm design (use o1-preview)
# Task: Implement Haversine distance with optimizations

# In Copilot Chat:
# Model selector → o1-preview
# "Implement optimized Haversine formula for batch coordinate distance calculations"
# → Best for mathematical reasoning
```

### Token Economics

**Understanding Token Costs**:
```
┌─────────────────────────────────────────────────────────────┐
│                     Token Calculation                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Example Prompt:                                             │
│  "Write a FastAPI endpoint that validates coordinates"       │
│  └── ~12 tokens (input)                                      │
│                                                              │
│  Generated Code Response:                                    │
│  @app.post("/api/validate")                                 │
│  async def validate_coordinates(coords: List[float]):        │
│      if len(coords) != 2:                                    │
│          raise HTTPException(400, "Invalid coordinates")     │
│      return {"valid": True}                                  │
│  └── ~45 tokens (output)                                     │
│                                                              │
│  Total: 57 tokens                                            │
│  Cost (GPT-4o): 57 × $0.005/1K = $0.000285                  │
│  Cost (Claude Opus): 57 × $0.015/1K = $0.000855             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Cost Optimization Strategies

**Strategy 1: Model Routing by Task Complexity**
```yaml
# Recommended model by task type:

Simple Tasks (GPT-4o-mini - cheapest):
  - Type hints
  - Import statements
  - Simple completions
  - Variable naming

Standard Tasks (GPT-4o - balanced):
  - Function implementation
  - Bug fixes
  - Unit tests
  - Documentation

Complex Tasks (Claude Opus 4 / o1):
  - Architecture decisions
  - Multi-file refactoring
  - Algorithm optimization
  - Security review
```

**Strategy 2: Context Window Management**
```python
# ❌ Expensive: Large context, simple question
# Sends entire 1000-line file + question = ~20K tokens

@workspace Explain line 45 of main.py  # Bad: reads whole file

# ✅ Efficient: Minimal context
# Only send relevant code snippet = ~200 tokens

@workspace #file:backend/main.py:40-50 Explain this code  # Good: specific range
```

**Strategy 3: Caching Repeated Queries**
```bash
# VS Code settings for response caching
{
  "github.copilot.advanced.cacheResponses": true,
  "github.copilot.advanced.cacheTTLSeconds": 3600
}

# Identical prompts within 1 hour use cached response (0 tokens)
```

### Live Demo: Monitor Token Usage

**Step 1: Enable token logging**
```json
// VS Code settings.json
{
  "github.copilot.advanced.debug.showTokenCount": true
}
```

**Step 2: View token count in output**
```bash
# VS Code Output panel → GitHub Copilot
# Look for: "Prompt tokens: 234, Completion tokens: 156"
```

**Step 3: Estimate monthly cost**
```python
# Quick cost calculator
daily_prompts = 200
avg_tokens_per_prompt = 300  # input + output
model_cost_per_1k = 0.005  # GPT-4o

monthly_cost = (daily_prompts * avg_tokens_per_prompt * 30 * model_cost_per_1k) / 1000
print(f"Estimated monthly cost: ${monthly_cost:.2f}")
# Output: Estimated monthly cost: $0.90
```

### Teaching Points

1. **Model Selection Heuristic**:
   - Start with GPT-4o-mini for speed
   - Upgrade to GPT-4o if quality insufficient
   - Use o1/Claude only for complex reasoning

2. **Cost Factors**:
   - Input tokens (your prompt + context)
   - Output tokens (generated code)
   - Model selection (3-10x cost difference)

3. **Optimization Levers**:
   - Reduce context window size
   - Cache repeated queries
   - Use cheaper models for simple tasks

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
Q: When should you use Plan Mode vs Ask Mode in Copilot Chat?

A) Plan Mode for questions, Ask Mode for multi-file changes
B) Plan Mode for multi-step tasks, Ask Mode for quick questions
C) They are identical, just different names
D) Plan Mode is deprecated

Answer: B - Plan Mode creates execution plans for complex tasks, 
            Ask Mode for direct Q&A
```

### Domain 4: Enterprise & Privacy (25%)

**Practice Question 6**:
```
Q: Which file should contain repository-level Copilot content exclusions?

A) .gitignore
B) .github/copilot-policies.yml
C) copilot.config.json
D) .vscode/settings.json

Answer: B - Repository policies go in .github/copilot-policies.yml
```

**Practice Question 7**:
```
Q: By default, does GitHub Copilot store or train on your private code?

A) Yes, all code is used for training
B) No, Copilot does not retain prompts or suggestions
C) Only if you opt-in to telemetry
D) Only code from public repositories

Answer: B - Copilot does not retain prompts or suggestions by default.
            Enterprise customers have additional data protection guarantees.
```

### Exam Tips

1. **Study Resources**:
   - GitHub Copilot documentation
   - Microsoft Learn Copilot modules
   - Hands-on practice (most important!)

2. **Key Topics to Master**:
   - MCP servers vs Extensions
   - Prompt engineering techniques
   - Content exclusion policies
   - Model selection criteria
   - TDD workflow with agents

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
- Backend calls Google Gemini API with structured prompt
- Gemini returns suggested stops with descriptions
- Backend geocodes locations using Azure Maps API
- Frontend displays generated trip in itinerary view

Acceptance Criteria:
- User can generate trip from natural language
- AI suggests 3-5 stops based on interests
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
- Create `/api/ai/generate-trip` endpoint
- Implement Gemini prompt template
- Add geocoding with Azure Maps
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

## Task 2: Implement Gemini prompt (2 hours)
- [ ] Create generate_trip_itinerary() function
- [ ] Design prompt template
- [ ] Parse AI response
**File**: backend/ai_service.py

## Task 3: Add geocoding (2 hours)
- [ ] Create geocode_location() function
- [ ] Call Azure Maps API
- [ ] Handle errors
**File**: backend/main.py

## Task 4: Create API endpoint (2 hours)
- [ ] Add POST /api/ai/generate-trip
- [ ] Orchestrate AI + geocoding + routing
- [ ] Return complete trip
**File**: backend/main.py
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
Simple tasks (completions, type hints) → GPT-4o-mini
Standard tasks (functions, tests)     → GPT-4o
Complex tasks (refactoring, arch)     → Claude Opus 4
Algorithm design (math, logic)        → o1-preview
```

### Policy Files
```
.github/copilot-policies.yml    # Repository-level policies
.github/copilot-instructions.md # Coding standards for Copilot
```

### Metrics API
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/orgs/ORG/copilot/usage"
```

### Certification Study Topics
1. Copilot Features (25%) - MCP, Chat, completions
2. Prompt Engineering (25%) - Chain-of-thought, few-shot
3. Developer Workflows (25%) - TDD, Plan Mode
4. Enterprise & Privacy (25%) - Policies, exclusions

---


*Workshop 4 Complete - Expert Web Development with GitHub Copilot*
