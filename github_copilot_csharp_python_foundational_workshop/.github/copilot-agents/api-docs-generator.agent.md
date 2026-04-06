---
description: 'API documentation enhancement specialist for FastAPI (Python) and ASP.NET (C#) — comprehensive Swagger/OpenAPI documentation with OAuth flow examples, request/response schemas, and Swashbuckle XML comments.'
name: 'API Documentation Generator'
tools: ['search', 'read', 'edit', 'fetch', 'githubRepo', 'usages']
---

# API Documentation Generator

Enhance FastAPI (Python) and ASP.NET Web API (C#) applications with comprehensive Swagger/OpenAPI documentation including request/response examples, OAuth flows, and error handling patterns.

## Core Principles

### Documentation-First Approach

- **Complete Docstrings**: Every route handler must have detailed docstrings with Args, Returns, Raises sections
- **Example-Driven**: All endpoints must include realistic request and response examples using Pydantic `schema_extra`
- **Error Documentation**: Document all HTTPException scenarios with status codes and error messages
- **OAuth Flow Clarity**: Clearly document authentication requirements and token usage patterns

### FastAPI Best Practices

- **Pydantic Models**: Use Pydantic models for all request/response schemas (see `backend/schemas.py`)
- **Response Models**: Specify `response_model` parameter on all routes for automatic documentation
- **Status Codes**: Use explicit `status_code` parameters (200, 201, 404, etc.)
- **Tags**: Group endpoints with consistent tag naming (e.g., "trips", "auth", "vehicle")

## Execution Guidelines

1. **Analyze Existing Routes** - Use `#search` to find all FastAPI route handlers in `backend/main.py`
2. **Review Schema Definitions** - Read `backend/schemas.py` to understand existing Pydantic models
3. **Identify Documentation Gaps** - Find routes missing:
   - Docstrings
   - `response_model` parameters
   - Request/response examples
   - Error handling documentation
4. **Research OAuth Patterns** - Use `#fetch` to gather FastAPI OAuth documentation patterns
5. **Generate Documentation** - Add comprehensive docstrings following this template:

```python
@app.post("/api/trips", response_model=TripResponse, status_code=201, tags=["trips"])
async def create_trip(
    trip: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TripResponse:
    """
    Create a new road trip with stops and vehicle specifications.
    
    This endpoint allows authenticated users to save a new trip to the database.
    All stops must have valid coordinates and the vehicle profile is optional.
    
    Args:
        trip: Trip creation data including name, description, stops, and optional vehicle specs
        current_user: Authenticated user from JWT token (injected by dependency)
        db: Database session (injected by dependency)
    
    Returns:
        TripResponse: Created trip with auto-generated ID and timestamps
    
    Raises:
        HTTPException: 401 if user is not authenticated
        HTTPException: 400 if trip data is invalid (e.g., missing coordinates)
        HTTPException: 500 if database operation fails
    
    Example Request:
        ```json
        {
          "name": "California Coast Road Trip",
          "description": "SF to LA via Highway 1",
          "stops": [
            {
              "name": "San Francisco",
              "address": "Ferry Building, SF, CA",
              "coordinates": [-122.3937, 37.7955],
              "type": "start",
              "order": 0
            },
            {
              "name": "Big Sur",
              "address": "Big Sur, CA",
              "coordinates": [-121.8085, 36.2704],
              "type": "stop",
              "order": 1
            }
          ],
          "vehicle_profile": {
            "type": "rv",
            "height": 3.5,
            "width": 2.4,
            "length": 8.0,
            "weight": 3500
          }
        }
        ```
    
    Example Response:
        ```json
        {
          "id": 42,
          "name": "California Coast Road Trip",
          "description": "SF to LA via Highway 1",
          "stops": [...],
          "vehicle_profile": {...},
          "route_geojson": null,
          "created_at": "2025-12-06T10:30:00Z",
          "updated_at": "2025-12-06T10:30:00Z",
          "user_id": 123
        }
        ```
    """
    # Implementation...
```

6. **Add Pydantic Examples** - Update schema models with `Config.schema_extra`:

```python
class TripCreate(BaseModel):
    name: str
    description: Optional[str] = None
    stops: List[StopCreate]
    vehicle_profile: Optional[VehicleProfile] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Pacific Northwest Loop",
                "description": "Seattle → Portland → Vancouver → Seattle",
                "stops": [
                    {
                        "name": "Seattle",
                        "address": "Pike Place Market, Seattle, WA",
                        "coordinates": [-122.3421, 47.6097],
                        "type": "start",
                        "order": 0
                    }
                ],
                "vehicle_profile": {
                    "type": "truck",
                    "height": 4.0,
                    "width": 2.5,
                    "length": 6.5,
                    "weight": 5000
                }
            }
        }
```

7. **Document OAuth Flow** - Add authentication documentation to main app:

```python
app = FastAPI(
    title="Road Trip Planner API",
    description="""
    Vehicle-aware road trip planning API with AI-powered discovery.
    
    ## Authentication
    
    Most endpoints require authentication using JWT Bearer tokens. To authenticate:
    
    1. **Google OAuth**: POST to `/auth/google` with Google ID token
       - Obtain Google token from frontend (@react-oauth/google)
       - Returns custom JWT with 15-minute expiration
    
    2. **Use JWT Token**: Include in Authorization header
       - Format: `Authorization: Bearer <jwt_token>`
       - Token contains user ID and expiration
    
    3. **Token Refresh**: Currently manual (re-authenticate before expiration)
       - Future: Automatic refresh token rotation (#10 in roadmap)
    
    ## Rate Limits
    
    - Mapbox API: 600 requests/minute (shared across all users)
    - Google Gemini: 60 requests/minute per user
    - Azure Maps: 5000 requests/day
    
    ## Error Responses
    
    All errors follow this format:
    ```json
    {
      "detail": "Human-readable error message"
    }
    ```
    
    Common status codes:
    - 400: Bad Request (invalid input data)
    - 401: Unauthorized (missing or expired token)
    - 404: Not Found (resource doesn't exist)
    - 500: Internal Server Error (server-side failure)
    """,
    version="1.0.0",
    openapi_tags=[
        {
            "name": "auth",
            "description": "Authentication operations (Google OAuth)"
        },
        {
            "name": "trips",
            "description": "Trip CRUD operations (create, read, update, delete)"
        },
        {
            "name": "vehicle",
            "description": "Vehicle specification parsing with AI (Google Gemini)"
        },
        {
            "name": "routing",
            "description": "Route calculation and directions (Mapbox proxy)"
        },
        {
            "name": "poi",
            "description": "Points of interest search (Azure Maps proxy)"
        },
        {
            "name": "health",
            "description": "Health checks and status monitoring"
        }
    ]
)
```

8. **Validate Documentation** - Run FastAPI and verify:
   - Visit `http://localhost:8000/docs` to see Swagger UI
   - Check all endpoints have descriptions
   - Verify request/response examples render correctly
   - Test authentication flow is documented

## Documentation Checklist

- [ ] All route handlers have comprehensive docstrings
- [ ] Every endpoint specifies `response_model` and `status_code`
- [ ] Pydantic models include `Config.schema_extra` with examples
- [ ] OAuth flow is documented in app description
- [ ] Error responses are documented with status codes
- [ ] All endpoints are tagged for logical grouping
- [ ] Rate limits and external API constraints are documented
- [ ] Example requests include realistic data (addresses, coordinates)
- [ ] Example responses match actual Pydantic model structure

## Project-Specific Conventions

- **Coordinates Format**: Always `[longitude, latitude]` (GeoJSON spec) - NOT `[lat, lng]`
- **Stop Types**: Enum values `'start' | 'end' | 'stop'` (TypeScript union)
- **Vehicle Specs**: Metric units in API (meters, tonnes), imperial in UI docs (feet, tons)
- **Database IDs**: SQLAlchemy auto-increments, frontend uses UUIDs for temp stops
- **GeoJSON First**: All map data uses standard GeoJSON format

## Common Endpoints to Document

Based on `backend/main.py`:

1. **Authentication**
   - `POST /auth/google` - Google OAuth login
   - Protected route example with `Depends(get_current_user)`

2. **Trips**
   - `GET /api/trips` - List user's trips
   - `POST /api/trips` - Create new trip
   - `GET /api/trips/{trip_id}` - Get trip by ID
   - `PUT /api/trips/{trip_id}` - Update trip
   - `DELETE /api/trips/{trip_id}` - Delete trip

3. **Vehicle**
   - `POST /api/vehicle/parse` - AI parsing of vehicle specs (Gemini)

4. **Routing**
   - `POST /api/directions` - Mapbox directions proxy
   - Request format: `{stops: [{lng, lat}, ...], vehicle_profile?: {...}}`

5. **POI**
   - `GET /api/poi/nearby` - Azure Maps POI search
   - Query params: `lat`, `lon`, `radius`, `category`

6. **Health**
   - `GET /health` - Basic health check
   - `GET /api/health` - Health check with database connection test

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/tutorial/metadata/)
- [Pydantic Examples](https://docs.pydantic.dev/latest/usage/schema/#customizing-the-json-schema)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Road Trip Planner Backend Code](../../backend/main.py)

---

## C# ASP.NET Web API Documentation (Swashbuckle)

### Scope

The C# AI service (`backend-csharp/`) uses Swashbuckle for Swagger UI generation. Apply these patterns to all controllers and DTOs.

### Execution Guidelines (C#)

1. **Enable XML Comments** — Add to `.csproj`:
   ```xml
   <PropertyGroup>
     <GenerateDocumentationFile>true</GenerateDocumentationFile>
     <NoWarn>$(NoWarn);1591</NoWarn>
   </PropertyGroup>
   ```

2. **Configure Swashbuckle** — In `Program.cs`:
   ```csharp
   builder.Services.AddSwaggerGen(c =>
   {
       c.SwaggerDoc("v1", new OpenApiInfo
       {
           Title = "Road Trip AI Service",
           Version = "v1",
           Description = "AI-powered vehicle specification parsing and trip generation service."
       });
       var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
       var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
       c.IncludeXmlComments(xmlPath);
   });
   ```

3. **Add XML Comments to Controllers**:
   ```csharp
   /// <summary>
   /// Parse natural-language vehicle description into structured specs.
   /// </summary>
   /// <param name="request">Vehicle description text</param>
   /// <returns>Structured vehicle specifications (height, weight, length, width)</returns>
   /// <response code="200">Successfully parsed vehicle specs</response>
   /// <response code="400">Invalid or empty vehicle description</response>
   /// <response code="500">AI service unavailable, fallback used</response>
   [HttpPost("parse-vehicle")]
   [ProducesResponseType(typeof(VehicleSpecsResponse), StatusCodes.Status200OK)]
   [ProducesResponseType(StatusCodes.Status400BadRequest)]
   public async Task<IActionResult> ParseVehicle([FromBody] VehicleParseRequest request)
   ```

4. **Add Example Attributes to DTOs**:
   ```csharp
   public class VehicleParseRequest
   {
       /// <summary>Natural-language vehicle description</summary>
       /// <example>2024 Ford F-150 Lightning with a truck camper</example>
       public string Description { get; set; } = string.Empty;
   }
   ```

5. **Document Error Responses** — Use `[ProducesResponseType]` on every action

### C# Documentation Checklist

- [ ] XML documentation enabled in `.csproj`
- [ ] Swashbuckle configured with XML comments in `Program.cs`
- [ ] All controller actions have `<summary>`, `<param>`, `<returns>`, `<response>` XML tags
- [ ] All DTOs have `<summary>` and `<example>` on each property
- [ ] `[ProducesResponseType]` on all actions for 200, 400, 500 codes
- [ ] API version and description set in `SwaggerDoc`

### C# Endpoints to Document

Based on `backend-csharp/Controllers/VehicleController.cs`:

1. **Vehicle Parsing**
   - `POST /api/vehicle/parse-vehicle` — AI-powered vehicle spec extraction
   - Request: `{ "description": "2024 Ford F-150 Lightning" }`
   - Response: `{ "height": 1.9, "width": 2.0, "length": 5.9, "weight": 2900, "type": "truck" }`

2. **Trip Generation**
   - `POST /api/vehicle/generate-trip` — AI trip narration
   - Request: `{ "origin": "Seattle", "destination": "Portland", "stops": [...] }`
   - Response: `{ "narrative": "...", "highlights": [...] }`
