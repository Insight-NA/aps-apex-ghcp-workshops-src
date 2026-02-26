# Workshop 1: Foundational Web Development with GitHub Copilot

**Duration**: 60 minutes  
**Format**: Live coding demonstrations  
**Audience**: Web developers familiar with React, TypeScript, Python, and REST APIs  
**Prerequisites**: Completed `setup/00-setup-instructions.md`, Copilot activated in VS Code

---

## Learning Objectives

By the end of this workshop, you will:
1. Use inline suggestions to add TypeScript interfaces to React components
2. Generate FastAPI endpoints using comment-based prompts
3. Debug coordinate format bugs with Copilot Chat
4. Understand API proxy security patterns for hiding tokens

---

## Workshop Agenda

| Time | Demo | Topic | File |
|------|------|-------|------|
| 0-15 min | Demo 1 | Inline Suggestions: Adding TypeScript Props | `frontend/src/components/MapComponent.tsx` |
| 15-30 min | Demo 2 | Comment-Based Generation: FastAPI Endpoint | `backend/main.py` |
| 30-45 min | Demo 3 | Chat Debugging: Coordinate Format Bug | `frontend/src/components/MapMarkers.tsx` (new) |
| 45-60 min | Demo 4 | Security Pattern: API Proxy vs Direct Calls | `backend/.env` + `backend/main.py` |

---

## Demo 1: Inline Suggestions for TypeScript Props (15 min)

### Objective
Learn how Copilot provides context-aware inline suggestions when defining React component props.

### Scenario
The `MapComponent.tsx` needs a new prop `vehicleType` to display different map styles based on vehicle (RV, car, truck). We'll let Copilot suggest the TypeScript interface.

### Before Demo: Setup
```bash
# 1. Close all open files (Cmd+K W)
# 2. Open file
code frontend/src/components/MapComponent.tsx

# 3. Navigate to line 15 (where component is defined)
# Current code:
export default function MapComponent() {
  const { stops, routeGeoJSON } = useTripStore();
  // ... rest of component
}
```

### Live Coding Steps

**Step 1: Start typing interface** (Line 14, above component)
```typescript
// Type slowly to see Copilot suggestions appear:
interface MapComponentProps {
  // Cursor here - wait for Copilot
```

**Expected Copilot Suggestion #1**:
```typescript
interface MapComponentProps {
  vehicleType?: 'RV' | 'car' | 'truck' | 'SUV';
  mapStyle?: string;
  showTraffic?: boolean;
}
```

**Decision Point**: Review suggestion
- ✅ Good: `vehicleType` union type matches project patterns
- ✅ Good: Optional props (`?`) appropriate for gradual adoption
- ⚠️ Check: `mapStyle` and `showTraffic` - do we need these now?

**Action**: Accept line-by-line with `Tab`

**Step 2: Update component signature**
```typescript
// Type:
export default function MapComponent({ vehicleType }: MapComponentProps) {
  // Copilot should suggest destructuring
```

**Expected Copilot Suggestion #2**:
```typescript
export default function MapComponent({ vehicleType = 'car', mapStyle, showTraffic }: MapComponentProps) {
  const { stops, routeGeoJSON } = useTripStore();
```

**Step 3: Use the prop in component logic**
```typescript
// Inside component, type comment:
// Set map style based on vehicle type

// Copilot suggests:
const currentMapStyle = vehicleType === 'RV' 
  ? 'mapbox://styles/mapbox/outdoors-v12'  // Better for large vehicles
  : 'mapbox://styles/mapbox/streets-v12';
```

**Step 4: Pass to Map component**
```typescript
// Update <Map> component:
<Map
  mapStyle={currentMapStyle}  // Copilot suggests this
  // ... rest of props
>
```

### Common Copilot Mistakes (What to Watch For)

**Mistake #1: Suggesting `any` type**
```typescript
// ❌ Copilot might suggest:
interface MapComponentProps {
  vehicleType: any;  // WRONG - violates project standards
}

// ✅ Correction: Reject and re-prompt
// Type comment above interface:
// Props for MapComponent - vehicleType must be 'RV', 'car', 'truck', or 'SUV' (no any types)
```

**Mistake #2: Suggesting non-Tailwind styling**
```typescript
// ❌ Copilot might suggest CSS-in-JS:
const styles = {
  map: { width: '100%', height: '600px' }
};

// ✅ Correction: Instruction file should enforce Tailwind
// If this happens, reject and type:
<Map className="w-full h-[600px]" />  // Tailwind classes
```

**Mistake #3: Forgetting optional vs required**
```typescript
// ❌ Copilot might make all props required:
interface MapComponentProps {
  vehicleType: string;  // Required - breaks existing usage!
}

// ✅ Correction: Make optional with default
vehicleType?: 'RV' | 'car' | 'truck';
```

### Teaching Points

1. **Context Awareness**: Copilot analyzed:
   - Existing `useTripStore()` usage → Knows about trip state
   - `MapComponent` name → Suggests map-related props
   - Project uses TypeScript → Provides typed suggestions

2. **Iterative Acceptance**: 
   - Don't blindly accept entire block
   - Accept line-by-line (`Tab`) to verify each suggestion
   - Reject bad suggestions (`Esc`), re-prompt with clarifying comment

3. **Type Safety**:
   - Union types (`'RV' | 'car'`) better than strings
   - Optional props (`?`) for backward compatibility
   - Default values in destructuring

### Verification
```bash
# Run TypeScript type checker
cd frontend
npm run typecheck

# Expected: No errors related to MapComponent
# If errors, review accepted suggestions
```

---

## Demo 2: Comment-Based Generation - FastAPI Endpoint (15 min)

### Objective
Use descriptive comments to generate complete FastAPI route handlers following project patterns.

### Scenario
Create a new endpoint `/api/trips/user` that returns all trips for the authenticated user, following existing patterns in `backend/main.py`.

### Before Demo: Setup
```bash
# 1. Open backend/main.py
code backend/main.py

# 2. Navigate to line 150 (after existing /api/trips endpoints)
# 3. Ensure backend is running in terminal:
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Live Coding Steps

**Step 1: Write descriptive comment**
```python
# Line 150 in main.py, after existing endpoints

# Create endpoint to fetch all trips for the current authenticated user
# GET /api/trips/user
# Requires authentication (use get_current_user dependency)
# Returns list of trips sorted by created_at descending
# Response model: List[Trip]
```

**Expected Copilot Suggestion #1** (Full endpoint):
```python
@app.get("/api/trips/user", response_model=List[Trip])
async def get_user_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all trips for authenticated user."""
    trips = db.query(models.Trip)\
        .filter(models.Trip.user_id == current_user.id)\
        .order_by(models.Trip.created_at.desc())\
        .all()
    return trips
```

**Decision Point**: Review suggestion
- ✅ Good: Uses `Depends(get_current_user)` for auth
- ✅ Good: Filters by `user_id`
- ✅ Good: Orders by `created_at.desc()`
- ⚠️ Check: Should we add pagination? (for now, no)

**Action**: Accept entire suggestion (`Tab` through each line)

**Step 2: Test the endpoint**
```bash
# In terminal, make request (requires valid JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/trips/user

# Expected response:
[
  {
    "id": 1,
    "name": "San Francisco to LA",
    "stops": [...],
    "user_id": 1,
    "created_at": "2026-01-20T10:30:00Z"
  }
]
```

**Step 3: Add error handling (optional enhancement)**
```python
# Type comment below the query:
# Add error handling for database errors

# Copilot suggests:
try:
    trips = db.query(models.Trip)\
        .filter(models.Trip.user_id == current_user.id)\
        .order_by(models.Trip.created_at.desc())\
        .all()
    return trips
except SQLAlchemyError as e:
    raise HTTPException(
        status_code=500,
        detail="Failed to fetch user trips"
    )
```

### Common Copilot Mistakes

**Mistake #1: Using generic Exception instead of HTTPException**
```python
# ❌ Copilot might suggest:
except Exception as e:
    return {"error": "Something went wrong"}  # WRONG - not FastAPI pattern

# ✅ Correction: Instruction file should enforce HTTPException
raise HTTPException(status_code=500, detail="Database error")
```

**Mistake #2: Forgetting authentication dependency**
```python
# ❌ Copilot might suggest:
@app.get("/api/trips/user")
async def get_user_trips(db: Session = Depends(get_db)):
    # Missing authentication! Anyone can call this

# ✅ Correction: Add to comment prompt
# "Requires authentication with get_current_user dependency"
```

**Mistake #3: Direct database queries (not using service layer)**
```python
# ⚠️ Acceptable for demo, but in production:

# Better pattern (service module):
# services/trip_service.py
def get_user_trips(db: Session, user_id: int):
    return db.query(Trip).filter(Trip.user_id == user_id).all()

# main.py
@app.get("/api/trips/user")
async def get_user_trips(user = Depends(get_current_user), db = Depends(get_db)):
    return trip_service.get_user_trips(db, user.id)
```

### Teaching Points

1. **Comment Prompting Best Practices**:
   - Be specific: "GET /api/trips/user" not "create trips endpoint"
   - Mention dependencies: "Requires authentication"
   - Specify return type: "Returns list of trips"
   - Reference patterns: "Following pattern in /api/trips endpoint"

2. **FastAPI Patterns Copilot Learns**:
   - Route decorators (`@app.get`)
   - Dependency injection (`Depends(get_db)`)
   - Response models (`response_model=List[Trip]`)
   - HTTPException for errors

3. **Iterative Enhancement**:
   - Start with basic endpoint
   - Add error handling with follow-up comment
   - Add pagination later if needed

### Verification
```bash
# Test endpoint in browser or curl
curl http://localhost:8000/api/trips/user \
  -H "Authorization: Bearer $(python -c "from auth import create_access_token; print(create_access_token({'sub': 'test@example.com'}))")"

# Check FastAPI auto-docs
open http://localhost:8000/docs
# New endpoint should appear in Swagger UI
```

---

## Demo 3: Chat Debugging - Coordinate Format Bug (15 min)

### Objective
Use Copilot Chat to debug a common bug: map markers appearing in the wrong location due to reversed coordinates.

### Scenario
Map markers for stops are showing in the middle of the ocean instead of on land. The bug is in coordinate format: `[lat, lng]` instead of `[lng, lat]`.

### Before Demo: Setup
```bash
# 1. Create new file with intentional bug
code frontend/src/components/MapMarkers.tsx

# 2. Copy demo template with buggy code
cp docs/workshops/web-dev/setup/demo-templates/demo-03-debug.tsx \
   frontend/src/components/MapMarkers.tsx
```

**Buggy Code** (demo-03-debug.tsx):
```typescript
import { Marker } from 'react-map-gl';

const stops = [
  { name: 'San Francisco', coordinates: [37.7749, -122.4194] },  // BUG: [lat, lng]
  { name: 'Los Angeles', coordinates: [34.0522, -118.2437] }     // BUG: [lat, lng]
];

export function MapMarkers() {
  return (
    <>
      {stops.map((stop, index) => (
        <Marker key={index} longitude={stop.coordinates[0]} latitude={stop.coordinates[1]}>
          <div className="marker-pin">{stop.name}</div>
        </Marker>
      ))}
    </>
  );
}
```

### Live Coding Steps

**Step 1: Open Copilot Chat** (`Cmd+I` or `Ctrl+I`)

**Step 2: Describe the problem**
```
Prompt in Chat:
"The map markers in MapMarkers.tsx are showing in the wrong location. 
They should appear in San Francisco and Los Angeles, but they're rendering 
in the middle of the ocean. What's wrong with the coordinate format?"
```

**Expected Copilot Chat Response**:
```
The issue is with coordinate order. You're using [latitude, longitude] format:
{ coordinates: [37.7749, -122.4194] }  // [lat, lng]

But Mapbox GL JS and the <Marker> component expect GeoJSON format, 
which is [longitude, latitude]:
{ coordinates: [-122.4194, 37.7749] }  // [lng, lat]

When you pass coordinates[0] to longitude and coordinates[1] to latitude,
you're assigning:
- longitude = 37.7749 (this is latitude!)
- latitude = -122.4194 (this is longitude!)

This flips the coordinates, placing markers in the wrong hemisphere.

Fix: Reverse the coordinate arrays:
const stops = [
  { name: 'San Francisco', coordinates: [-122.4194, 37.7749] },
  { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] }
];
```

**Step 3: Apply the fix**
```typescript
// Copilot Chat should offer "Apply Fix" button
// Or manually update:
const stops = [
  { name: 'San Francisco', coordinates: [-122.4194, 37.7749] },  // ✅ [lng, lat]
  { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] }
];
```

**Step 4: Ask follow-up question**
```
Chat Prompt:
"How can I prevent this bug in the future? Should I create a type to enforce this?"
```

**Expected Response**:
```typescript
Yes! Create a type alias to make coordinate order explicit:

// types/coordinates.ts
export type GeoJSONCoordinate = [longitude: number, latitude: number];

// Usage:
const sanFrancisco: GeoJSONCoordinate = [-122.4194, 37.7749];  // ✅ Enforced!

// Error if reversed:
const wrong: GeoJSONCoordinate = [37.7749, -122.4194];  
// TypeScript error: "Type 'number' is not assignable to type labeled 'longitude'"

// Update interface:
interface Stop {
  name: string;
  coordinates: GeoJSONCoordinate;  // ✅ Type-safe
}
```

**Step 5: Implement type safety**
```typescript
// Create types/coordinates.ts
export type GeoJSONCoordinate = [longitude: number, latitude: number];

// Update MapMarkers.tsx
import { GeoJSONCoordinate } from '../types/coordinates';

interface Stop {
  name: string;
  coordinates: GeoJSONCoordinate;
}

const stops: Stop[] = [
  { name: 'San Francisco', coordinates: [-122.4194, 37.7749] },
  { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] }
];
```

### Common Copilot Mistakes

**Mistake #1: Suggesting wrong fix (swap parameters instead of data)**
```typescript
// ❌ Copilot might suggest (WRONG):
<Marker latitude={stop.coordinates[0]} longitude={stop.coordinates[1]}>
// This just swaps parameter names, doesn't fix data

// ✅ Correct fix: Change coordinate data order
const stops = [
  { coordinates: [-122.4194, 37.7749] }  // [lng, lat] data format
];
```

**Mistake #2: Not explaining root cause**
```
// ❌ Vague response:
"Change the coordinates."

// ✅ Good response:
"GeoJSON spec requires [longitude, latitude] order. Mapbox follows GeoJSON. 
Google Maps uses [lat, lng], which is why this is a common bug."
```

**Mistake #3: Over-engineering the solution**
```typescript
// ❌ Copilot might suggest complex validation:
function validateCoordinates(coords: [number, number]): GeoJSONCoordinate {
  if (coords[0] < -180 || coords[0] > 180) throw new Error("Invalid longitude");
  // ... 20 more lines
}

// ✅ For this workshop, simple type alias is enough
type GeoJSONCoordinate = [longitude: number, latitude: number];
```

### Teaching Points

1. **Effective Chat Prompts**:
   - Describe symptoms: "Markers in wrong location"
   - Provide context: "Should be San Francisco/LA, appearing in ocean"
   - Ask specific question: "What's wrong with coordinate format?"

2. **Copilot Chat vs Inline Suggestions**:
   - **Chat**: Best for debugging, explanations, "why" questions
   - **Inline**: Best for code completion, "what" to write next

3. **Follow-up Questions**:
   - Don't stop at first fix
   - Ask: "How can I prevent this in future?"
   - Copilot suggests type safety, linting rules, etc.

### Verification
```bash
# Run TypeScript type checker
npm run typecheck

# Start dev server and check map
npm run dev
# Open http://localhost:5173
# Markers should now appear in correct locations
```

---

## Demo 4: Security Pattern - API Proxy vs Direct Calls (15 min)

### Objective
Understand why external API calls must be proxied through the backend and how to implement the pattern securely.

### Scenario
Show the security vulnerability of calling Mapbox directly from frontend, then demonstrate the correct proxy pattern.

### Before Demo: Setup
```bash
# 1. Open both .env files side-by-side
code backend/.env
code frontend/.env.local

# 2. Have terminal ready to show API call logs
# Terminal 1: Backend logs
cd backend && source venv/bin/activate
uvicorn main:app --reload --log-level debug

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Live Coding Steps

**Part 1: Demonstrate the Vulnerability (5 min)**

**Step 1: Show wrong approach**
```typescript
// ❌ WRONG - Direct call from frontend exposes secret token
// File: frontend/src/utils/directMapboxCall.ts (create new file)

const MAPBOX_SECRET_TOKEN = 'sk.ey1234567890_SECRET_TOKEN';  // ⚠️ EXPOSED!

export async function getDirectionsUnsafe(coordinates: number[][]) {
  const coordString = coordinates.map(c => c.join(',')).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}`;
  
  const response = await fetch(`${url}?access_token=${MAPBOX_SECRET_TOKEN}`);
  return response.json();
}
```

**Step 2: Show in browser DevTools**
```bash
# Open browser DevTools (F12)
# Go to Network tab
# Call the function
# Show: Token visible in Network request URL!

# Anyone can:
# 1. Right-click → Inspect → Network
# 2. Copy your Mapbox secret token
# 3. Use it for their own projects (drain your quota)
```

**Step 3: Check JavaScript bundle**
```bash
# Build production bundle
npm run build

# Search for token in built files
grep -r "sk.ey1234" dist/

# Result: Token is embedded in JavaScript!
# ⚠️ Even minified/obfuscated, still extractable
```

**Part 2: Demonstrate Correct Pattern (10 min)**

**Step 4: Backend proxy endpoint**
```python
# File: backend/main.py (around line 200)

import httpx
import os

@app.post("/api/directions")
async def get_directions(request: DirectionsRequest):
    """
    Proxy to Mapbox Directions API.
    Hides MAPBOX_TOKEN from frontend.
    """
    # Get token from environment (server-side only)
    mapbox_token = os.getenv("MAPBOX_TOKEN")
    if not mapbox_token:
        raise HTTPException(500, "Mapbox token not configured")
    
    # Build coordinate string
    coords = ";".join([f"{c[0]},{c[1]}" for c in request.coordinates])
    
    # Call Mapbox API with server-side token
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.mapbox.com/directions/v5/mapbox/driving/{coords}",
            params={
                "access_token": mapbox_token,
                "geometries": "geojson"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(response.status_code, "Mapbox API error")
        
        return response.json()
```

**Step 5: Frontend calls backend (safe)**
```typescript
// File: frontend/src/utils/routingService.ts

export async function getDirectionsSafe(coordinates: number[][]) {
  // ✅ CORRECT - Calls our backend, which has the secret token
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/directions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates })
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch directions');
  }
  
  return response.json();
}
```

**Step 6: Environment variable setup**
```bash
# backend/.env (server-side, gitignored)
MAPBOX_TOKEN=sk.ey1234567890_SECRET_TOKEN  # Secret token (sk.xxx)

# frontend/.env.local (build-time, gitignored)
VITE_API_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=pk.ey9876543210_PUBLIC  # Public token (pk.xxx) - only for map display
```

**Step 7: Show in browser DevTools**
```bash
# Open DevTools → Network tab
# Call getDirectionsSafe()
# Show:
# ✅ Request goes to localhost:8000/api/directions (our backend)
# ✅ No Mapbox token visible in frontend request
# ✅ Backend makes the Mapbox call with secret token
# ✅ Frontend only receives GeoJSON response
```

### Common Copilot Mistakes

**Mistake #1: Suggesting to use public token for API calls**
```typescript
// ❌ Copilot might suggest (WRONG for Directions API):
const MAPBOX_PUBLIC_TOKEN = 'pk.xxx';  // Public token
const response = await fetch(
  `https://api.mapbox.com/directions/v5/...?access_token=${MAPBOX_PUBLIC_TOKEN}`
);

// ⚠️ This works, but has limitations:
// - Public tokens have strict rate limits
// - Can be abused if embedded in frontend
// - Some APIs (like Optimization API) require secret token

// ✅ Always proxy through backend for API calls
```

**Mistake #2: Not using environment variables**
```python
# ❌ Copilot might hardcode:
MAPBOX_TOKEN = "sk.ey1234567890"  # WRONG - committed to Git!

# ✅ Always use environment variables:
mapbox_token = os.getenv("MAPBOX_TOKEN")
```

**Mistake #3: Exposing backend .env in frontend**
```typescript
// ❌ WRONG - Vite doesn't have access to backend .env
const token = import.meta.env.MAPBOX_TOKEN;  // undefined!

// ✅ CORRECT - Use VITE_ prefix for frontend env vars
const apiUrl = import.meta.env.VITE_API_URL;
```

### Teaching Points

1. **API Key Types**:
   - **Secret tokens** (`sk.xxx`): Full API access, server-side ONLY
   - **Public tokens** (`pk.xxx`): Limited access, safe for frontend (map display only)
   - **Temporary tokens** (SAS, presigned URLs): Time-limited access

2. **Security Principles**:
   - **Never trust the client**: All secrets stay on server
   - **Defense in depth**: Environment variables + .gitignore + Key Vault
   - **Least privilege**: Frontend gets minimal access (public token for map rendering)

3. **Real-World Cost Impact**:
   - Exposed Mapbox token → 10,000 unauthorized requests → $500 bill
   - Exposed AWS credentials → Crypto mining on your account → $10,000+ bill
   - Always monitor usage, set billing alerts

### Verification
```bash
# Check .gitignore includes .env files
cat .gitignore | grep ".env"

# Expected:
# .env
# .env.local
# backend/.env
# frontend/.env.local

# Verify backend token works
curl -X POST http://localhost:8000/api/directions \
  -H "Content-Type: application/json" \
  -d '{"coordinates": [[-122.4194, 37.7749], [-118.2437, 34.0522]]}'

# Should return GeoJSON route (not error)
```

---

## Workshop Summary & Key Takeaways

### What We Learned

1. **Inline Suggestions** (Demo 1):
   - Copilot analyzes context (file name, imports, existing code)
   - Accept line-by-line to verify suggestions
   - Use union types for restricted values (`'RV' | 'car'`)

2. **Comment-Based Generation** (Demo 2):
   - Descriptive comments → complete code blocks
   - Mention dependencies, return types, patterns
   - Follow project conventions (Pydantic, HTTPException)

3. **Chat Debugging** (Demo 3):
   - Describe symptoms + expected behavior
   - Copilot explains root cause (coordinate format)
   - Ask follow-up: "How to prevent this bug?"

4. **Security Patterns** (Demo 4):
   - External APIs must be proxied through backend
   - Secret tokens (`sk.xxx`) NEVER in frontend
   - Public tokens (`pk.xxx`) for display only

### Common Pitfalls (Recap)

| Pitfall | How to Avoid |
|---------|-------------|
| Accepting `any` types | Instruction file rule: "NO `any` allowed" |
| Direct API calls from frontend | Proxy pattern in instruction file |
| Wrong coordinate format | Type alias: `GeoJSONCoordinate = [lng, lat]` |
| Hardcoding secrets | Use `.env` files, add to `.gitignore` |
| Not verifying suggestions | Accept line-by-line, run type checker |

### Next Workshop Preview

**Workshop 2: Intermediate Web Development**
- **Prompting techniques**: Explicit vs implicit prompts
- **Zustand patterns**: Immutable state updates
- **Code refactoring**: Extract duplicate logic
- **Few-shot prompting**: Show examples, generate similar code

**Preparation**:
- Review `docs/PROJECT_INSTRUCTIONS.md` sections on:
  - State Management Rules
  - Pydantic Schema Patterns
  - SQLAlchemy Relationship Patterns
- Read `frontend/src/store/useTripStore.ts` (Zustand example)
- Read `backend/schemas.py` (Pydantic examples)

---

## Hands-On Exercise (Optional - 10 min)

**Task**: Create a `VehicleSelector` component using techniques from Demo 1-3

**Requirements**:
1. TypeScript interface with props: `vehicleType`, `onChange`
2. Dropdown with options: RV, Car, Truck, SUV
3. Use Tailwind CSS for styling
4. Call `useTripStore` to save selected vehicle

**Starting Point**:
```typescript
// frontend/src/components/VehicleSelector.tsx

// Step 1: Let Copilot suggest interface
interface VehicleSelectorProps {
  // Cursor here - wait for suggestion
}

// Step 2: Comment-based generation
// Create dropdown component with vehicle options
export function VehicleSelector() {
  // Let Copilot generate component
}
```

**Solution** (reveal after 5 minutes):
```typescript
import { useTripStore } from '../store/useTripStore';

interface VehicleSelectorProps {
  vehicleType?: 'RV' | 'car' | 'truck' | 'SUV';
  onChange?: (type: string) => void;
}

export function VehicleSelector({ vehicleType = 'car', onChange }: VehicleSelectorProps) {
  const { setVehicleType } = useTripStore();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setVehicleType(newType);
    onChange?.(newType);
  };
  
  return (
    <select 
      value={vehicleType}
      onChange={handleChange}
      className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
    >
      <option value="RV">RV (Class A/C)</option>
      <option value="car">Car</option>
      <option value="truck">Truck</option>
      <option value="SUV">SUV</option>
    </select>
  );
}
```

---

## Resources

- **Project Documentation**: `docs/PROJECT_INSTRUCTIONS.md`
- **Instruction File**: `.github/copilot-instructions.md`
- **Key Definitions**: `docs/workshops/web-dev/00-key-definitions-best-practices.md`
- **Copilot Docs**: https://docs.github.com/copilot

**Questions?** Continue to Workshop 2 or ask instructor for clarification.
