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

## Workshop Agenda

| Time | Demo | Learning Objective | File(s) |
|------|------|-------------------|---------|
| 0-10 min | Demo 1 | **Inline Code Suggestions** | `backend/vehicle_service.py` |
| 10-20 min | Demo 2 | **Prompting** (Explicit) | `backend/schemas.py` |
| 20-30 min | Demo 3 | **Comment-Based Generation** | `backend/main.py` |
| 30-40 min | Demo 4 | **Code Explanations** | `backend/auth.py` |
| 40-50 min | Demo 5 | **Code Refactoring** + **Copilot Chat** | `AllTripsView.tsx`, `ExploreView.tsx` |
| 50-60 min | Demo 6 | **Few-Shot Prompting** | `backend/models.py` |
| 60-75 min | Demo 7 | **Unit Testing & Debugging** | `useTripStore.test.ts`, `test_trips.py` |
| 75-90 min | Demo 8 | **Copilot CLI** | Terminal / `deploy-ai-service.sh` |

---

## Demo 1: Inline Code Suggestions (10 min)

### Learning Objective
Accept and modify Copilot's real-time code completions as you type, using pattern recognition.

### Scenario
Add a new vehicle type to `vehicle_service.py`. Copilot will recognize the dictionary pattern and suggest the complete structure.

### Before Demo: Setup
```bash
# Open vehicle_service.py
code backend/vehicle_service.py

# Review existing DEFAULT_VEHICLE_SPECS dictionary (lines 7-44)
```

### Live Coding Steps

**Step 1: Position cursor after last vehicle type**
```python
# Navigate to line 42, after "ev_truck" entry
DEFAULT_VEHICLE_SPECS = {
    "car": {...},
    "suv": {...},
    # ... existing entries ...
    "ev_truck": {
        "height": 1.8, "width": 2.1, "length": 5.8, "weight": 3.5,
        "fuelType": "electric", "range": 320, "mpg": 70.0
    },
    # ← Position cursor here, press Enter
```

**Step 2: Type the beginning of a new entry**
```python
    "motorcycle": {
```

**Expected Copilot Inline Suggestion** (appears as ghost text):
```python
    "motorcycle": {
        "height": 1.2, "width": 0.9, "length": 2.2, "weight": 0.3,
        "fuelType": "gas", "range": 250, "mpg": 50.0
    },
```

**Step 3: Accept with Tab key**
- Press `Tab` to accept the entire suggestion
- Or use `Ctrl+→` (Windows) / `Cmd+→` (Mac) to accept word-by-word

**Step 4: Try partial acceptance**
```python
    "bus": {
```

**Copilot suggests** (accept partially, then modify):
```python
    "bus": {
        "height": 3.5, "width": 2.6, "length": 12.0, "weight": 15.0,
        "fuelType": "diesel", "range": 500, "mpg": 6.0
    },
```

### Teaching Points

> 💡 **Key Insight**: Inline suggestions work best when Copilot has context. The existing dictionary pattern teaches Copilot the structure.

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See alternatives | `Alt+]` / `Alt+[` | `Alt+]` / `Alt+[` |

### Common Mistakes
- ❌ **Accepting without review**: Always verify values make sense (e.g., motorcycle shouldn't have "weight": 15.0)
- ❌ **Ignoring alternatives**: Press `Alt+]` to cycle through multiple suggestions

---

## Demo 2: Prompting - Explicit Prompt Technique (10 min)

### Learning Objective
Write detailed, explicit prompts that generate accurate Pydantic schemas with proper validation.

### Scenario
Create a POI (Point of Interest) schema for Azure Maps API responses. The explicit prompt technique specifies requirements, types, and validation rules upfront.

### Before Demo: Setup
```bash
code backend/schemas.py
# Navigate to end of file (after VehicleSpecsResponse class)
```

### Live Coding Steps

**Step 1: Write an explicit prompt as a docstring**
```python
# Line 80+, write this multi-line comment:

"""
Create Pydantic schema for POI (Point of Interest) response from Azure Maps API.

Requirements:
- name: string, required, max 200 characters
- category: string (e.g., "gas_station", "restaurant"), required
- address: string, optional
- coordinates: tuple of (longitude, latitude), both floats, required
- distance: float (meters from user), optional
- rating: float 0.0-5.0, optional

Validation rules:
- Coordinates: longitude [-180, 180], latitude [-90, 90]
- Rating: between 0.0 and 5.0 if provided
- Use Field() for validation constraints
- Follow project pattern: ConfigDict(from_attributes=True)
"""
```

**Step 2: Press Enter and let Copilot generate**

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

### Prompting Formula

> 📝 **Explicit Prompting Formula**:
> ```
> 1. TASK: "Create [type] for [purpose]"
> 2. REQUIREMENTS: List all fields with types
> 3. VALIDATION: Constraints, ranges, formats
> 4. PATTERN: "Follow [existing pattern]"
> ```

### Teaching Points

| Prompt Quality | Example | Result |
|----------------|---------|--------|
| ❌ Vague | "Create POI schema" | Missing validation, wrong types |
| ✅ Explicit | "POI schema with name (max 200), coordinates (lng/lat tuple), rating (0-5)..." | Precise, validated schema |

---

## Demo 3: Comment-Based Generation (10 min)

### Learning Objective
Generate complete functions from descriptive comments placed directly above code.

### Scenario
Add a new API endpoint in `main.py` by writing a descriptive comment, then letting Copilot generate the implementation.

### Before Demo: Setup
```bash
code backend/main.py
# Navigate to line ~120 (after existing health check endpoints)
```

### Live Coding Steps

**Step 1: Write descriptive comment**
```python
# Add endpoint to geocode an address using Mapbox Geocoding API
# Parameters: q (string) - the address to geocode
# Returns: GeoJSON FeatureCollection with location results
# Uses MAPBOX_TOKEN from environment variables
# Proxies request through backend (never expose token to frontend)
```

**Step 2: Press Enter and type function signature**
```python
@app.get("/api/geocode")
async def geocode_address(q: str):
```

**Expected Copilot Suggestion** (completes the function):
```python
@app.get("/api/geocode")
async def geocode_address(q: str):
    """
    Geocode an address using Mapbox Geocoding API.
    
    Args:
        q: Address query string to geocode
        
    Returns:
        GeoJSON FeatureCollection with matching locations
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

### Teaching Points

> 💡 **Comment-Based Generation Best Practices**:
> 1. Be specific about parameters and return types
> 2. Mention external services (Mapbox, Azure Maps)
> 3. Include security requirements (proxy pattern, token handling)
> 4. Reference project patterns ("never expose token to frontend")

### Comparison: Comment Quality

```python
# ❌ Too vague - Copilot may generate incorrect implementation
# Geocode address

# ✅ Detailed - Copilot generates complete, correct implementation
# Add endpoint to geocode an address using Mapbox Geocoding API
# Parameters: q (string) - the address to geocode
# Returns: GeoJSON FeatureCollection with location results
# Uses MAPBOX_TOKEN from environment variables
```

---

## Demo 4: Code Explanations (10 min)

### Learning Objective
Use Copilot Chat to understand complex authentication and security logic.

### Scenario
Understand the JWT token creation and refresh logic in `auth.py`.

### Before Demo: Setup
```bash
code backend/auth.py
# Select lines 36-60 (create_access_token and related functions)
```

### Live Coding Steps

**Step 1: Select the complex code block**
```python
# Select these lines (36-60):
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
    """Generate a cryptographically secure refresh token"""
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    """Hash a token for secure storage in database"""
    return hashlib.sha256(token.encode()).hexdigest()

def verify_refresh_token(token: str, hashed_token: str) -> bool:
    """Verify a refresh token against its hashed version"""
    return hash_token(token) == hashed_token
```

**Step 2: Open Copilot Chat and ask for explanation**
Press `Cmd+I` (Mac) or `Ctrl+I` (Windows) to open inline chat, then type:

```
/explain What is the security flow here? Why do we hash refresh tokens but not access tokens?
```

**Expected Copilot Explanation**:
```
This code implements a dual-token authentication system:

**Access Tokens (JWT)**:
- Short-lived (30 minutes by default)
- Contain user data (`data` parameter)
- Self-verifying (signature check)
- NOT stored in database (stateless)
- Used for API authentication

**Refresh Tokens**:
- Long-lived (7 days)
- Cryptographically random (no user data)
- HASHED before database storage (security)
- Used to obtain new access tokens

**Why hash refresh tokens?**
If database is compromised, attackers get hashed tokens which are useless.
They can't reverse SHA-256 to get the original token.

**Why NOT hash access tokens?**
Access tokens are JWTs - they're verified by signature, not database lookup.
Hashing would break the JWT verification process.
```

**Step 3: Ask follow-up questions**
```
/explain What happens if SECRET_KEY changes? How does token rotation work?
```

### Teaching Points

> 🔍 **Code Explanation Commands**:
> - `/explain` - Detailed explanation of selected code
> - `/explain security` - Focus on security implications
> - `/explain simply` - ELI5 explanation for beginners
> - `Cmd+I` then just ask a question - Contextual Q&A

### Alternative: Hover Explanation
- Hover over `jwt.encode` → See inline explanation
- Hover over `secrets.token_urlsafe` → Understand the function

---

## Demo 5: Code Refactoring + Copilot Chat (10 min)

### Learning Objective
Use Copilot Chat to identify and refactor duplicate code across multiple files.

### Scenario
`AllTripsView.tsx` and `ExploreView.tsx` both contain identical `getDefaultImage()` functions. Extract to a shared utility.

### Before Demo: Setup
```bash
# Open both files side by side
code frontend/src/views/AllTripsView.tsx
code frontend/src/views/ExploreView.tsx

# Note identical code at:
# - AllTripsView.tsx lines 56-66
# - ExploreView.tsx lines 67-74
```

### The Duplicate Code (in both files)
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

### Live Coding Steps

**Step 1: Open Copilot Chat panel**
Press `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows)

**Step 2: Use @workspace to find duplicates**
```
@workspace Find duplicate code patterns in the frontend/src/views directory
```

**Expected Response**:
```
I found duplicate code in:
- AllTripsView.tsx (lines 56-66): getDefaultImage function
- ExploreView.tsx (lines 67-74): getDefaultImage function

Both contain identical image arrays and logic.
```

**Step 3: Ask Copilot to refactor**
```
/refactor Extract getDefaultImage to a new file frontend/src/utils/images.ts and update both views to import it
```

**Expected Copilot Actions** (creates 3 file changes):

**New file: `frontend/src/utils/images.ts`**
```typescript
/**
 * Default trip images for cards without custom images
 */
const DEFAULT_TRIP_IMAGES = [
  'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop',
];

/**
 * Get a default trip image by index (cycles through available images)
 * @param index - Index to select image (wraps around)
 * @returns Unsplash image URL
 */
export function getDefaultImage(index: number): string {
  return DEFAULT_TRIP_IMAGES[index % DEFAULT_TRIP_IMAGES.length];
}

/**
 * Get trip image with fallback to default
 * @param imageUrl - Custom image URL (may be null/undefined)
 * @param index - Fallback index for default image
 * @returns Image URL
 */
export function getTripImage(imageUrl: string | null | undefined, index: number): string {
  return imageUrl || getDefaultImage(index);
}
```

**Updated: `AllTripsView.tsx`**
```typescript
import { getDefaultImage } from '../utils/images';

// Remove local getDefaultImage function
// Use imported function: getDefaultImage(index)
```

**Updated: `ExploreView.tsx`**
```typescript
import { getDefaultImage } from '../utils/images';

// Remove local getDefaultImage function
```

### Teaching Points

> 🔧 **Copilot Chat Refactoring Commands**:
> - `/refactor` - General refactoring
> - `/refactor extract` - Extract to function/file
> - `/refactor rename` - Rename with all references
> - `@workspace` - Search across entire codebase

### Verification
```bash
# Verify no duplicate code remains
grep -r "unsplash.com/photo-1501466044931" frontend/src/views/
# Should return: nothing (code moved to utils/)

grep -r "unsplash.com/photo-1501466044931" frontend/src/utils/
# Should return: images.ts

npm run build  # Verify no TypeScript errors
```

---

## Demo 6: Few-Shot Prompting (10 min)

### Learning Objective
Teach Copilot project-specific patterns by showing 2-3 examples, then asking it to generate similar code.

### Scenario
Create a new `Comment` model with a relationship to `Trip`, using existing relationships as examples.

### Before Demo: Setup
```bash
code backend/models.py
# Review existing User → Trip relationship (lines 7-25)
```

### Live Coding Steps

**Step 1: Show Copilot the existing pattern**
```python
# At the end of models.py, write this few-shot prompt:

"""
PATTERN EXAMPLES (Few-Shot Learning):

Example 1: User has many Trips (one-to-many)
- Parent: User has `trips = relationship("Trip", back_populates="owner")`
- Child: Trip has `user_id = Column(Integer, ForeignKey("users.id"))`
- Child: Trip has `owner = relationship("User", back_populates="trips")`

Example 2: Existing VehicleSpec model (reference)
- Has: id, vehicle_type, height, width, weight, range, fuel_type, mpg
- Has: created_at, updated_at timestamps

NOW CREATE: Comment model (Trip has many Comments)
- Fields: id, trip_id (FK), user_id (FK), content (Text), rating (1-5), created_at
- Relationships: 
  - Trip has many comments
  - User has many comments
  - Comment belongs to Trip and User
"""
```

**Step 2: Press Enter and let Copilot generate**

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

**Step 3: Copilot should also suggest updating existing models**
```python
# Add to User class:
comments = relationship("Comment", back_populates="author")

# Add to Trip class:
comments = relationship("Comment", back_populates="trip")
```

### Teaching Points

> 📚 **Few-Shot Prompting Formula**:
> ```
> Example 1: [Existing pattern with details]
> Example 2: [Another existing pattern]
> NOW CREATE: [New thing following same pattern]
> ```

### Why Few-Shot Works

| Approach | Prompt | Result |
|----------|--------|--------|
| Zero-shot | "Create Comment model" | May miss relationships, wrong patterns |
| Few-shot (2 examples) | "Example 1: User→Trip... Example 2: VehicleSpec... NOW CREATE: Comment" | Follows project conventions exactly |

### Verification
```bash
# Create migration
alembic revision --autogenerate -m "Add Comment model"

# Apply migration
alembic upgrade head

# Test relationship
python -c "from models import Comment, Trip, User; print('✓ Models imported')"
```

---

## Demo 7: Unit Testing & Debugging (15 min)

### Learning Objective
Generate test cases with Copilot and debug failing tests using Copilot Chat.

### Scenario
Part A: Generate frontend tests for Zustand store  
Part B: Debug a failing backend test

### Part A: Frontend Tests (Vitest)

**Setup:**
```bash
code frontend/src/store/useTripStore.test.ts
# Review existing test patterns
```

**Step 1: Ask Copilot to generate a new test**
Write comment and let Copilot complete:

```typescript
// Test that updating vehicle specs preserves other values (immutability)
it('should update vehicle specs without losing existing values', () => {
```

**Expected Copilot Suggestion**:
```typescript
it('should update vehicle specs without losing existing values', () => {
  // Set initial state
  useTripStore.setState({
    vehicleSpecs: {
      height: 3.5,
      weight: 10,
      width: 2.5,
      length: 12,
      fuelType: 'diesel',
      range: 500,
      mpg: 10,
    }
  });
  
  // Update only height
  useTripStore.getState().setVehicleSpecs({ height: 4.0 });
  
  // Verify height updated
  expect(useTripStore.getState().vehicleSpecs.height).toBe(4.0);
  
  // Verify other values preserved (immutability check)
  expect(useTripStore.getState().vehicleSpecs.weight).toBe(10);
  expect(useTripStore.getState().vehicleSpecs.fuelType).toBe('diesel');
});
```

**Step 2: Run the test**
```bash
cd frontend
npm test -- useTripStore.test.ts
```

### Part B: Backend Tests (Pytest) - Debugging

**Setup:**
```bash
code backend/tests/test_trips.py
```

**Step 1: Introduce a "bug" for demo**
```python
# Intentionally break a test assertion
def test_create_trip(setup_db):
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
    assert data["name"] == "Wrong Name"  # ← This will fail
```

**Step 2: Run test and see failure**
```bash
cd backend
pytest tests/test_trips.py::test_create_trip -v

# Output:
# FAILED - AssertionError: assert 'Test Trip' == 'Wrong Name'
```

**Step 3: Use Copilot to debug**
Select the failing test, open Copilot Chat (`Cmd+I`):

```
/fix This test is failing. The API returns "Test Trip" but we're asserting "Wrong Name". Fix the assertion.
```

**Copilot Fix**:
```python
assert data["name"] == "Test Trip"  # ✓ Matches the input
```

### Teaching Points

> 🧪 **Testing Commands**:
> - `/tests` - Generate tests for selected code
> - `/fix` - Fix failing test or code
> - `@workspace /tests` - Generate tests based on project patterns

### Test Generation Prompt Tips

```typescript
// ❌ Vague - generates generic tests
// Test the store

// ✅ Specific - generates targeted tests
// Test that removing a stop by ID filters it from the stops array
// and doesn't affect other stops
```

---

## Demo 8: Copilot CLI (15 min)

### Learning Objective
Use GitHub Copilot CLI to generate shell commands and scripts from natural language.

### Scenario
Generate Azure deployment commands without memorizing complex `az` CLI syntax.

### Prerequisites
```bash
# Verify Copilot CLI is installed
gh copilot --version

# If not installed:
gh extension install github/gh-copilot
```

### Live Coding Steps

**Step 1: Ask Copilot CLI to explain a command**
```bash
gh copilot explain "az containerapp env create --name roadtrip-env --resource-group aps-demo-rg --location westus2"
```

**Expected Explanation**:
```
This command creates an Azure Container Apps environment:

- `az containerapp env`: Azure Container Apps environment commands
- `create`: Create a new environment
- `--name roadtrip-env`: Name of the environment
- `--resource-group aps-demo-rg`: Resource group to create in
- `--location westus2`: Azure region

Container Apps environments provide the network boundary for 
your container apps and are required before deploying apps.
```

**Step 2: Generate a command from natural language**
```bash
gh copilot suggest "deploy a docker image to azure container apps with environment variables for API keys"
```

**Expected Suggestion**:
```bash
az containerapp create \
  --name roadtrip-ai-service \
  --resource-group aps-demo-rg \
  --environment roadtrip-env \
  --image roadtripacr.azurecr.io/ai-service:latest \
  --target-port 8080 \
  --ingress external \
  --env-vars "AZURE_OPENAI_KEY=secretref:openai-key" \
             "AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com"
```

**Step 3: Generate a complete script**
```bash
gh copilot suggest "create a bash script that builds a docker image, pushes to azure container registry, and deploys to container apps"
```

**Expected Script** (similar to `infrastructure/deploy-ai-service.sh`):
```bash
#!/bin/bash
set -e

# Configuration
RESOURCE_GROUP="${RESOURCE_GROUP:-aps-demo-rg}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-roadtripacr}"
IMAGE_NAME="ai-service:latest"

# Login to ACR
az acr login --name $CONTAINER_REGISTRY

# Build and push
docker build -t ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE_NAME} .
docker push ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE_NAME}

# Deploy to Container Apps
az containerapp update \
  --name roadtrip-ai-service \
  --resource-group $RESOURCE_GROUP \
  --image ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE_NAME}

echo "✓ Deployment complete"
```

### Teaching Points

> 💻 **Copilot CLI Commands**:
> - `gh copilot suggest "..."` - Generate command from description
> - `gh copilot explain "..."` - Explain what a command does
> - `ghcs` - Shortcut for `gh copilot suggest`
> - `ghce` - Shortcut for `gh copilot explain`

### Practical Examples

| Natural Language | Generated Command |
|-----------------|-------------------|
| "List all azure resource groups" | `az group list --output table` |
| "Create postgres database in azure" | `az postgres flexible-server create --name mydb --resource-group rg --admin-user admin` |
| "Find large files in git history" | `git rev-list --objects --all \| git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)'` |
| "Docker remove all stopped containers" | `docker container prune -f` |

---

## Workshop Summary & Key Takeaways

### Techniques Comparison Matrix

| Technique | When to Use | Trigger | Example |
|-----------|-------------|---------|---------|
| **Inline Suggestions** | Pattern-based code | Just type | Dictionary entries, function params |
| **Prompting** | Complex requirements | Docstring/comment | Pydantic schemas with validation |
| **Comment-Based** | New functions/endpoints | `# Description` + Enter | API endpoints, utility functions |
| **Code Explanations** | Understanding code | `/explain` or `Cmd+I` | Auth logic, complex algorithms |
| **Refactoring** | Duplicate/messy code | `/refactor` in Chat | Extract utilities, rename |
| **Copilot Chat** | Questions, debugging | `Cmd+Shift+I` | "@workspace find...", "/fix" |
| **Few-Shot** | Project patterns | 2-3 examples + request | SQLAlchemy models, API patterns |
| **Testing** | Test generation | `/tests` or comments | Unit tests, integration tests |
| **CLI** | Shell commands | `gh copilot suggest` | Azure CLI, Docker, Git |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                  COPILOT QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab          Accept full suggestion                        │
│   Cmd+→        Accept word-by-word                          │
│   Alt+]        Next suggestion                               │
│   Esc          Dismiss                                       │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT                                                 │
│   Cmd+I        Inline chat (quick question)                  │
│   Cmd+Shift+I  Chat panel (longer conversations)             │
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
| Accepting suggestions blindly | Always review for correctness |
| Vague prompts | Be explicit: list fields, types, validation |
| Ignoring alternatives | Press `Alt+]` to see other options |
| Not using few-shot for patterns | Show 2-3 examples for project-specific code |
| Skipping test verification | Always run tests after generation |

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
- Explore Copilot Edits panel (`Cmd+Shift+I` → Edits tab)
- Read `ROADMAP.md` for project context

---

## Hands-On Exercise (Optional - 15 min)

**Challenge**: Use ALL techniques from this workshop to add a "Bookmark" feature.

1. **Inline Suggestions**: Add `"bookmarked": boolean` to vehicle specs dictionary
2. **Comment-Based**: Create `/api/bookmarks` endpoint with comment
3. **Few-Shot**: Create `Bookmark` model using User/Trip relationship examples
4. **Refactoring**: Extract common API response formatting
5. **Testing**: Generate test for bookmark creation
6. **CLI**: Generate command to query bookmarks in production database

**Verification**:
```bash
pytest tests/test_bookmarks.py -v
npm test -- bookmark.test.ts
```

---

## Resources

- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Copilot CLI**: https://githubnext.com/projects/copilot-cli
- **Project Documentation**: `docs/PROJECT_INSTRUCTIONS.md`
- **ROADMAP**: `ROADMAP.md` (Issue #20 - refactoring task)
- **Vitest Docs**: https://vitest.dev/
- **Pytest Docs**: https://docs.pytest.org/

**Questions?** Proceed to Workshop 3 or ask for clarification.
