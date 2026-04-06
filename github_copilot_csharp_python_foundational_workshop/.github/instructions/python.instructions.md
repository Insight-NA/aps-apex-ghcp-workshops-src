---
applyTo: "backend/**/*.py"
---
# Python / FastAPI — Backend Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these Python-specific rules.

## Stack (Non-Negotiable)
- **Framework**: FastAPI — no Flask, Django, or Express
- **ORM**: SQLAlchemy — no Django ORM, Prisma, or raw SQL
- **Schema validation**: Pydantic v2 for all request/response models
- **Auth**: Custom JWT via `python-jose` + Google OAuth — no Auth0 or Cognito
- **Database**: PostgreSQL in Docker; SQLite fallback for local non-Docker dev

## Project Structure
```
backend/
  main.py           # Route definitions only — keep under 400 lines
  *_service.py      # Business logic (ai_service.py, vehicle_service.py …)
  models.py         # SQLAlchemy ORM models (DB schema)
  schemas.py        # Pydantic models (API validation)
  auth.py           # OAuth + JWT helpers
  database.py       # SQLAlchemy engine setup (dual-mode)
  constants.py      # All string/enum constants — create if missing
```

## No Hardcoded Strings
```python
# ❌ WRONG
raise HTTPException(status_code=404, detail="Trip not found")
if vehicle_type == "rv":

# ✅ CORRECT — use constants.py
from constants import ErrorMessages, VehicleTypes
raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
if vehicle_type == VehicleTypes.RV:
```
`backend/constants.py` must define class-based constant groups:
```python
class ErrorMessages:
    TRIP_NOT_FOUND = "Trip not found"
    UNAUTHORIZED = "Authentication required"
    FORBIDDEN = "Insufficient permissions"

class VehicleTypes:
    RV = "rv"
    TRUCK = "truck"
    CAR = "car"
```

## Service Layer Pattern
```python
# ❌ WRONG — business logic inline in route handler
@app.get("/trips/{trip_id}")
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    # 50 lines of business logic here
    ...

# ✅ CORRECT — delegate to service module
from trip_service import get_trip_by_id

@app.get("/trips/{trip_id}")
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    return get_trip_by_id(db, trip_id)
```

## Pydantic Models
- Every API request body and response must use a Pydantic schema from `schemas.py`
- Use `model_config = ConfigDict(from_attributes=True)` for ORM-mapped schemas
- Never return raw SQLAlchemy model instances — always convert to schema

## Error Handling
- Use `HTTPException` with explicit status codes — never generic `Exception`
- `404` → resource not found; `403` → forbidden; `401` → not authenticated; `422` → validation error
- Add contextual detail to every `HTTPException` using constants

## Database Dual-Mode
```python
# database.py — always use this pattern
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./trips.db"  # non-Docker local dev fallback
)
# Docker: DATABASE_URL=postgresql://roadtrip:roadtrip_dev@postgres:5432/roadtrip
```
- Migrations (PostgreSQL): `alembic revision --autogenerate -m "description"` + `alembic upgrade head`
- SQLite: tables auto-created via `models.Base.metadata.create_all()` in `main.py`

## Testing
```bash
cd backend
pytest tests/ -v
pytest tests/test_main.py::test_health_check   # single test
pytest --cov=. --cov-report=html               # coverage
```
- Use `TestClient` from `fastapi.testclient`
- **Always mock** external APIs (Mapbox, Azure Maps, Azure OpenAI) — never hit real APIs in tests
- Follow existing patterns in `backend/tests/`
