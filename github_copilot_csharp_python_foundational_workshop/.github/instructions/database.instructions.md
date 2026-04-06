---
applyTo: "backend/models.py,backend/schemas.py,backend/database.py,backend/alembic/**/*.py,backend/**/*repository*.py,backend/**/*migration*.py"
---
# Database — SQLAlchemy, Pydantic, Alembic Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these database-specific rules.

## Tech Stack (Non-Negotiable)
- **ORM**: SQLAlchemy (sync) — no raw SQL, no Django ORM, no Peewee
- **Schema validation**: Pydantic v2 — no Marshmallow, no dataclasses-json
- **Migrations**: Alembic (PostgreSQL) — never `CREATE TABLE` or `ALTER TABLE` raw SQL in production
- **Dev/test database**: SQLite — same models, different connection string
- **Production database**: PostgreSQL 15

## Database Configuration (`database.py`)

### Dual-Mode Connection (Required Pattern)
```python
# ✅ CORRECT — auto-selects SQLite or PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trips.db")

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
```

### Session Dependency (Always Use This Pattern)
```python
# ✅ CORRECT — generator closes session after every request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

```python
# ❌ WRONG — session never closed on exception
def get_db():
    return SessionLocal()
```

- `SessionLocal` must be configured with **`autocommit=False, autoflush=False`**
- Inject via `db: Session = Depends(get_db)` — never instantiate sessions inline in route handlers

## SQLAlchemy Models (`models.py`)

### Naming Conventions
- Table names: **snake_case plural** (`users`, `trips`, `vehicle_specs`)
- Column names: **snake_case**
- Relationship names: singular for many-to-one, plural for one-to-many

### JSON Columns for Nested Data
Complex nested objects are stored as JSON columns — do NOT normalise into separate tables unless query performance demands it:
```python
# ✅ CORRECT — stops, vehicle_specs, route_geojson are JSON
stops = Column(JSON, nullable=True)
vehicle_specs = Column(JSON, nullable=True)
route_geojson = Column(JSON, nullable=True)
```

### Timestamps
Use timezone-aware UTC — `datetime.utcnow()` is deprecated:
```python
# ✅ CORRECT
from datetime import datetime, UTC
created_at = Column(DateTime, default=lambda: datetime.now(UTC))

# ❌ WRONG — naive datetime, deprecated
created_at = Column(DateTime, default=datetime.utcnow)
```

### Relationships
Always use `back_populates` (not `backref`):
```python
# In User model:
trips = relationship("Trip", back_populates="owner")

# In Trip model:
owner = relationship("User", back_populates="trips")
```

### Foreign Keys & Integrity
```python
# ✅ CORRECT — always define ondelete for FK columns
user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
```

## Pydantic Schemas (`schemas.py`)

### Three-Tier Schema Pattern
Every entity needs three schemas — do NOT combine them:
```python
class TripBase(BaseModel):
    """Fields shared between create and response"""
    name: str
    stops: list | None = None

class TripCreate(TripBase):
    """Fields required only at creation — no id, no created_at"""
    vehicle_specs: dict | None = None

class Trip(TripBase):
    """Full response — includes DB-assigned fields"""
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)  # ← Pydantic v2 only
```

### Pydantic v2 Required Syntax
```python
# ✅ CORRECT — Pydantic v2
from pydantic import BaseModel, ConfigDict
model_config = ConfigDict(from_attributes=True)

# ❌ WRONG — Pydantic v1 syntax (removed)
class Config:
    orm_mode = True
```

### Coordinate Validation
All coordinate fields must be validated at the schema layer:
```python
from pydantic import field_validator

@field_validator("longitude")
@classmethod
def validate_longitude(cls, v: float) -> float:
    if not -180 <= v <= 180:
        raise ValueError("Longitude must be between -180 and 180")
    return v

@field_validator("latitude")
@classmethod
def validate_latitude(cls, v: float) -> float:
    if not -90 <= v <= 90:
        raise ValueError("Latitude must be between -90 and 90")
    return v
```

### Units in Schemas
- Backend stores and returns **metric** (metres, kilograms, km)
- UI-facing responses convert to imperial via the frontend layer
- Document units in field descriptions: `Field(..., description="Height in metres")`

## Alembic Migrations

### When to Create a Migration
Create an Alembic revision for **every** schema change in PostgreSQL:
```bash
alembic revision --autogenerate -m "Add refresh_token to users"
alembic upgrade head
```

### Migration File Rules
- Keep revisions **linear** — one `down_revision` chain, no branches
- Always implement `downgrade()` to reverse the change
- Never DROP a column in production without a multi-step deprecation:
  1. Stop writing the column
  2. Deploy
  3. Add migration to drop it
- Review autogenerated migrations before committing — `autogenerate` can miss type changes

### SQLite Auto-Schema (Dev/Test Only)
```python
# ✅ CORRECT — only for dev/test; never skip Alembic for PostgreSQL
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    models.Base.metadata.create_all(bind=engine)
```

## CRUD Patterns

### Create
```python
# ✅ CORRECT — add → commit → refresh
db_trip = models.Trip(**trip.model_dump(), user_id=current_user.id)
db.add(db_trip)
db.commit()
db.refresh(db_trip)  # loads DB-assigned id, created_at, etc.
return db_trip
```

### Read (Auth-Gated)
```python
# ✅ CORRECT — always include user_id filter to prevent IDOR
trip = db.query(models.Trip).filter(
    models.Trip.id == trip_id,
    models.Trip.user_id == current_user.id
).first()
if not trip:
    raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
```

### Update (Selective Fields)
```python
# ✅ CORRECT — only commit fields that were actually provided
update_data = trip_update.model_dump(exclude_unset=True)  # exclude_unset is key
for field, value in update_data.items():
    setattr(db_trip, field, value)
db.commit()
db.refresh(db_trip)
```

### Delete
```python
# ✅ CORRECT — verify ownership before delete
db.delete(db_trip)
db.commit()
```

## Security Rules

### Prevent IDOR — Always Filter by `user_id`
Every mutation (UPDATE, DELETE) on user-owned resources **must** include `user_id == current_user.id` in its query:
```python
# ❌ WRONG — allows any user to delete any trip
db.query(models.Trip).filter(models.Trip.id == trip_id).first()

# ✅ CORRECT
db.query(models.Trip).filter(
    models.Trip.id == trip_id,
    models.Trip.user_id == current_user.id
).first()
```

### Hashed Refresh Tokens
Refresh tokens must be hashed before storage — never store plaintext:
```python
# ✅ CORRECT
user.refresh_token = auth.hash_token(refresh_token)
user.refresh_token_expires = datetime.now(UTC) + timedelta(days=30)
db.commit()
```

### Public Endpoints — No PII
Queries for `is_public=True` trips must not return `user_id`, email, or other PII in the response schema. Use a dedicated public response schema.

## Testing Database

### Test Session Override
```python
# ✅ CORRECT — override get_db in every test module
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
```

### Never Hit Real PostgreSQL in Tests
- Tests must run with SQLite — no connection to production or staging DB
- Mock all external services (Azure Maps, Mapbox) with `httpx.MockTransport` or `pytest-mock`
- Use `scope="module"` for the DB fixture (one setup/teardown per test file)
