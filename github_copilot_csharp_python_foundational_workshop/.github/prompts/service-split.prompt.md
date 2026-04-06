---
name: service-split
description: "Split a monolithic file into focused service modules following SRP. Specify the source file and target services. Includes characterization tests and safe extraction workflow."
---

## Context
The Road Trip Planner has monolithic files that violate SRP identified in the roadmaps:
- **Python**: `backend/main.py` (~450 lines) → `auth_service.py`, `geocode_service.py`, `search_service.py`
- **C#**: `backend-csharp/Services/AiParsingService.cs` (~214 lines) → `VehicleParsingService`, `TripGenerationService`, `FallbackParsingService`

## Objective
Safely decompose `{{ source_file }}` into focused service modules.

## Requirements

### Pre-Extraction Checklist
- [ ] All existing tests pass
- [ ] Characterization tests written for functions to extract
- [ ] `usages` tool run to find all callers of the functions

### Extraction Sequence
1. **Create the new service file** with the function/class moved over
2. **Register in DI** — Python: add `Depends()` / C#: add to `Program.cs` services
3. **Update source file** — Replace inline logic with service call
4. **Update imports** — Fix all `from source import X` → `from new_service import X`
5. **Run ALL tests** — Must be green before proceeding to next extraction

### Python Pattern
```python
# backend/auth_service.py (new)
from database import get_db
from models import User
from auth import create_access_token

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_google(self, id_token: str) -> tuple[User, str]:
        # Logic extracted from main.py google_login()
        ...

# backend/main.py (updated)
@app.post("/auth/google")
async def google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, token = service.authenticate_google(request.id_token)
    return {"access_token": token}
```

### C# Pattern
```csharp
// Services/IVehicleParsingService.cs (new)
public interface IVehicleParsingService
{
    Task<VehicleSpecs> ParseVehicleSpecsAsync(string description);
}

// Services/VehicleParsingService.cs (new)
public class VehicleParsingService : IVehicleParsingService
{
    // Logic extracted from AiParsingService
}

// Program.cs (updated)
builder.Services.AddScoped<IVehicleParsingService, VehicleParsingService>();
```

## Example
See `@service-decomposition` agent for the full extraction catalogue and safe extraction workflow.

Delegate to `@service-decomposition` for execution.
