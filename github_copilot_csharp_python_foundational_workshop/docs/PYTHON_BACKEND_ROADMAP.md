# Python Backend — Architecture Remediation & TDD Roadmap

**Created**: March 20, 2026  
**Last Updated**: March 20, 2026  
**Service**: `backend/` — FastAPI + SQLAlchemy (Python 3.11+)  
**Current State**: Build verified, 45 tests passing, external APIs mocked  
**Deficiencies**: 0 auth tests, 6 SOLID violations, 5 security gaps, 16+ hardcoded strings, no constants.py, no rate limiting, Dockerfile runs as root  
**Total Effort**: 28-40 hours across 7 epics, 25 tasks  
**TDD Mandate**: Red → Green → Refactor for every code change

> **Parent Roadmap**: [ROADMAP.md](./ROADMAP.md) — Phase 2 (Python Backend) remaining work  
> **Project Standards**: [python.instructions.md](../.github/instructions/python.instructions.md)

---

## Current File Inventory

| # | File | Lines | Purpose | Issues Found |
|---|------|-------|---------|-------------|
| 1 | `main.py` | ~450 | Route definitions, business logic | 18 issues: hardcoded strings, god functions, missing type hints, exceeds 400-line limit |
| 2 | `auth.py` | ~65 | OAuth + JWT helpers | 5 issues: insecure SECRET_KEY fallback, MOCK_TOKEN bypass, uses `print()` not logger |
| 3 | `ai_service.py` | ~55 | AI vehicle parsing proxy | 3 issues: minimal logging, no timeout config |
| 4 | `vehicle_service.py` | ~70 | Vehicle specs + fallback | 3 issues: OCP violation (dict modification for new types) |
| 5 | `database.py` | ~23 | SQLAlchemy engine setup | 2 issues: no connection pooling config, missing pool_recycle |
| 6 | `models.py` | ~48 | SQLAlchemy ORM models | 2 issues: missing indexes, no updated_at timestamps |
| 7 | `schemas.py` | ~110 | Pydantic request/response models | 5 issues: no length constraints, no email validation, no URL validation |
| 8 | `Dockerfile` | ~13 | Container build | 4 issues: runs as root, no .dockerignore, no healthcheck, copies .env |
| 9 | `requirements.txt` | ~12 | Dependencies | 2 issues: unpinned versions, no security scanning packages |
| 10 | `constants.py` | ❌ missing | — | **Required per python.instructions.md** — must contain error messages, vehicle types, config keys |
| 11 | `auth_service.py` | ❌ missing | — | Business logic should be extracted from main.py |
| 12 | `geocode_service.py` | ❌ missing | — | Geocode/directions logic should be extracted from main.py |
| 13 | `search_service.py` | ❌ missing | — | Azure Maps search logic should be extracted from main.py |
| 14 | `security.py` | ❌ missing | — | Rate limiting, input sanitization middleware |
| 15 | `logging_config.py` | ❌ missing | — | Centralized logging configuration |
| 16 | `.dockerignore` | ❌ missing | — | Should exclude .env, venv/, __pycache__/, tests/ |
| 17 | `tests/test_auth.py` | ❌ missing | — | **Zero auth tests. Critical security gap.** |
| 18 | `tests/test_schemas.py` | ❌ missing | — | No validation edge case tests |

---

## SOLID Violations Identified

### SRP — Single Responsibility Principle

| Violation | File | Lines | Description |
|-----------|------|-------|-------------|
| SRP-1 | `main.py` | 88-130 | `google_login()` handles: token validation, user lookup, user creation, JWT generation, DB commit — 4 responsibilities |
| SRP-2 | `main.py` | 177-217 | `refresh_token()` handles: validation, token rotation, DB update — 3 responsibilities |
| SRP-3 | `main.py` | 298-360 | `search_places()` handles: param parsing, API call, response transformation — 3 responsibilities |
| SRP-4 | `main.py` | 30-45 | `get_current_user()` authentication logic mixed in route file — should be in auth_service |

### OCP — Open/Closed Principle

| Violation | File | Lines | Description |
|-----------|------|-------|-------------|
| OCP-1 | `vehicle_service.py` | 7-40 | `DEFAULT_VEHICLE_SPECS` dict requires modification to add new vehicle types |

### DIP — Dependency Inversion Principle

| Violation | File | Lines | Description |
|-----------|------|-------|-------------|
| DIP-1 | `main.py` | 10 | Direct imports of concrete modules (`ai_service`, `vehicle_service`) — no abstractions/protocols |
| DIP-2 | `vehicle_service.py` | 3 | `ai_service` imported directly — cannot substitute mock without patching |

---

## Security Gaps Identified

| # | Gap | File | Lines | Severity | Description |
|---|-----|------|-------|----------|-------------|
| SEC-1 | Insecure SECRET_KEY default | `auth.py` | 14 | **Critical** | Falls back to `"dev-secret-key-change-in-production"` if env var missing |
| SEC-2 | MOCK_TOKEN bypass | `main.py` | 91 | **Critical** | `"MOCK_TOKEN"` string bypasses authentication — active in production |
| SEC-3 | No rate limiting | `main.py` | all | **High** | External APIs have costs — no protection against abuse |
| SEC-4 | No input length limits | `schemas.py` | all | **Medium** | Unbounded strings sent to external APIs (Mapbox, Azure Maps) |
| SEC-5 | CORS wildcard methods | `main.py` | 52-53 | **Medium** | `allow_methods=["*"]` overly permissive |
| SEC-6 | API key in URL params | `main.py` | 323 | **Medium** | Azure Maps key passed as query param (logged in server access logs) |
| SEC-7 | Raw SQL in health check | `main.py` | 69 | **Low** | `db.execute("SELECT 1")` — should use `text()` wrapper |
| SEC-8 | Dockerfile runs as root | `Dockerfile` | all | **High** | No `USER` directive — container runs as root user |

---

## Testing Gaps Identified

| Category | Status | Missing Tests |
|----------|--------|---------------|
| **Authentication** | ❌ No tests | Token expiration, refresh rotation, invalid JWT signatures, guest cleanup |
| **Schema Validation** | ❌ No tests | Pydantic field validators, edge cases (empty strings, nulls, max lengths) |
| **Error Paths** | ⚠️ Partial | Database connection failures, timeout handling |
| **Security** | ❌ No tests | SQL injection attempts, XSS in inputs |
| **Edge Cases** | ⚠️ Partial | Max pagination limits, special characters in queries |

**Current Test Coverage**: ~45 tests passing, but 0 auth tests and 0 validation tests.

---

## TDD Workflow Standard

Every task in this roadmap follows **strict TDD**:

```
1. RED   — Write a failing test that defines the expected behavior
2. GREEN — Write the minimum code to make the test pass
3. REFACTOR — Clean up without changing behavior, tests still pass
```

**Verification commands after each task:**
```bash
cd backend
pytest tests/ -v                          # Run all tests
pytest tests/test_auth.py -v              # Run specific test file
pytest --cov=. --cov-report=html          # Coverage report
```

**Target**: ≥ 80% line coverage on all non-generated code

---

## Epic 1: Critical Security Fixes

**Priority**: Critical — Security vulnerabilities in production  
**Effort**: 2-3 hours  
**Dependencies**: None

### Task 1.1: Remove MOCK_TOKEN Authentication Bypass

**Type**: Security fix (TDD)  
**Addresses**: SEC-2 — `"MOCK_TOKEN"` bypasses authentication in production

**Current vulnerability** (`main.py` line 91):
```python
# ❌ SECURITY VULNERABILITY — bypasses all auth in production
if token == "MOCK_TOKEN":
    # ... returns mock user without validation
```

**TDD Workflow**:

**RED** — Write `tests/test_auth.py`:
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_mock_token_rejected_in_production():
    """MOCK_TOKEN should not be accepted as valid authentication"""
    response = client.get(
        "/api/trips",
        headers={"Authorization": "Bearer MOCK_TOKEN"}
    )
    # Should return 401, not 200
    assert response.status_code == 401


def test_mock_token_rejected_for_protected_routes():
    """All protected routes should reject MOCK_TOKEN"""
    protected_routes = [
        ("GET", "/api/trips"),
        ("POST", "/api/trips"),
        ("GET", "/api/auth/me"),
    ]
    for method, path in protected_routes:
        response = client.request(
            method, path,
            headers={"Authorization": "Bearer MOCK_TOKEN"}
        )
        assert response.status_code == 401, f"{method} {path} accepted MOCK_TOKEN"
```

**GREEN** — Remove the MOCK_TOKEN bypass from `main.py`:
```python
# ✅ CORRECT — Remove this entire block
# Delete lines 91-95 that check for "MOCK_TOKEN"
```

**REFACTOR** — Update any tests that relied on MOCK_TOKEN to use proper JWT fixtures from `conftest.py`.

**Acceptance Criteria**:
- [ ] `MOCK_TOKEN` string removed from codebase entirely
- [ ] `grep -r "MOCK_TOKEN" backend/` returns no matches
- [ ] All protected routes return 401 for `MOCK_TOKEN`
- [ ] Existing tests updated to use proper JWT test fixtures

---

### Task 1.2: Fix SECRET_KEY to Fail-Fast if Not Configured

**Type**: Security fix (TDD)  
**Addresses**: SEC-1 — Insecure default SECRET_KEY fallback

**Current vulnerability** (`auth.py` line 14):
```python
# ❌ SECURITY VULNERABILITY — predictable secret in production
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
```

**TDD Workflow**:

**RED** — Write test in `tests/test_auth.py`:
```python
import os
import pytest
from unittest.mock import patch

def test_missing_secret_key_raises_on_import():
    """Application should fail to start if SECRET_KEY is not set"""
    with patch.dict(os.environ, {}, clear=True):
        # Remove SECRET_KEY from environment
        if "SECRET_KEY" in os.environ:
            del os.environ["SECRET_KEY"]
        
        # Re-importing auth should raise
        with pytest.raises(ValueError, match="SECRET_KEY.*required"):
            import importlib
            import auth
            importlib.reload(auth)


def test_weak_secret_key_raises_warning():
    """SECRET_KEY shorter than 32 characters should raise warning"""
    with patch.dict(os.environ, {"SECRET_KEY": "tooshort"}):
        with pytest.raises(ValueError, match="at least 32 characters"):
            import importlib
            import auth
            importlib.reload(auth)
```

**GREEN** — Update `auth.py`:
```python
import os
import logging

logger = logging.getLogger(__name__)

def _get_secret_key() -> str:
    """Get SECRET_KEY with validation. Fails fast if not configured properly."""
    secret = os.getenv("SECRET_KEY")
    
    if not secret:
        raise ValueError(
            "SECRET_KEY environment variable is required. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )
    
    if len(secret) < 32:
        raise ValueError(
            "SECRET_KEY must be at least 32 characters for security. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )
    
    return secret

SECRET_KEY = _get_secret_key()
```

**Acceptance Criteria**:
- [ ] `"dev-secret-key-change-in-production"` removed from codebase
- [ ] App fails to start with clear error if `SECRET_KEY` not set
- [ ] App fails to start if `SECRET_KEY` is less than 32 characters
- [ ] Error message includes command to generate secure key

---

### Task 1.3: Create Comprehensive Auth Test Suite

**Type**: Test coverage (TDD)  
**Addresses**: Zero auth tests — critical coverage gap

**TDD Workflow**:

Create `tests/test_auth.py` with these test cases:

```python
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from jose import jwt

from main import app
from auth import SECRET_KEY, ALGORITHM, create_access_token, create_refresh_token

client = TestClient(app)


class TestTokenGeneration:
    """Tests for JWT token creation"""
    
    def test_access_token_contains_required_claims(self):
        """Access token should contain sub, exp, type claims"""
        token = create_access_token({"sub": "user@example.com", "user_id": 1})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        assert "sub" in payload
        assert "exp" in payload
        assert payload["sub"] == "user@example.com"
    
    def test_access_token_expires_in_configured_time(self):
        """Access token should expire within expected timeframe"""
        token = create_access_token({"sub": "user@example.com"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        exp_time = datetime.fromtimestamp(payload["exp"])
        now = datetime.utcnow()
        
        # Should expire within 15-30 minutes (depending on config)
        assert (exp_time - now) < timedelta(hours=1)
        assert (exp_time - now) > timedelta(minutes=5)
    
    def test_refresh_token_has_longer_expiry(self):
        """Refresh token should have longer expiry than access token"""
        access = create_access_token({"sub": "user@example.com"})
        refresh = create_refresh_token({"sub": "user@example.com"})
        
        access_payload = jwt.decode(access, SECRET_KEY, algorithms=[ALGORITHM])
        refresh_payload = jwt.decode(refresh, SECRET_KEY, algorithms=[ALGORITHM])
        
        assert refresh_payload["exp"] > access_payload["exp"]


class TestTokenValidation:
    """Tests for JWT token validation"""
    
    def test_expired_token_returns_401(self):
        """Expired tokens should be rejected"""
        expired_token = jwt.encode(
            {"sub": "user@example.com", "exp": datetime.utcnow() - timedelta(hours=1)},
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        response = client.get(
            "/api/trips",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == 401
    
    def test_invalid_signature_returns_401(self):
        """Tokens signed with wrong key should be rejected"""
        bad_token = jwt.encode(
            {"sub": "user@example.com", "exp": datetime.utcnow() + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm=ALGORITHM
        )
        
        response = client.get(
            "/api/trips",
            headers={"Authorization": f"Bearer {bad_token}"}
        )
        assert response.status_code == 401
    
    def test_malformed_token_returns_401(self):
        """Malformed tokens should be rejected"""
        response = client.get(
            "/api/trips",
            headers={"Authorization": "Bearer not.a.valid.jwt"}
        )
        assert response.status_code == 401
    
    def test_missing_auth_header_returns_401(self):
        """Missing Authorization header should return 401"""
        response = client.get("/api/trips")
        assert response.status_code == 401


class TestRefreshTokenFlow:
    """Tests for token refresh mechanism"""
    
    def test_refresh_with_valid_token_returns_new_tokens(self, db_session, test_user):
        """Valid refresh token should return new access and refresh tokens"""
        # This test requires fixtures for db_session and test_user
        pass  # Implement with proper fixtures
    
    def test_refresh_with_expired_token_returns_401(self):
        """Expired refresh token should be rejected"""
        expired_refresh = jwt.encode(
            {"sub": "user@example.com", "exp": datetime.utcnow() - timedelta(days=1)},
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": expired_refresh}
        )
        assert response.status_code == 401
    
    def test_refresh_token_rotation_invalidates_old_token(self, db_session, test_user):
        """Used refresh token should be invalidated after rotation"""
        pass  # Implement with proper fixtures


class TestGoogleOAuth:
    """Tests for Google OAuth flow"""
    
    @patch('auth.verify_google_token')
    def test_valid_google_token_creates_user(self, mock_verify, db_session):
        """Valid Google token should create new user if not exists"""
        mock_verify.return_value = {
            "email": "newuser@gmail.com",
            "name": "New User",
            "picture": "https://example.com/photo.jpg"
        }
        
        response = client.post(
            "/api/auth/google",
            json={"token": "valid-google-token"}
        )
        
        assert response.status_code == 200
        assert "access_token" in response.json()
    
    @patch('auth.verify_google_token')
    def test_invalid_google_token_returns_401(self, mock_verify):
        """Invalid Google token should be rejected"""
        mock_verify.side_effect = ValueError("Invalid token")
        
        response = client.post(
            "/api/auth/google",
            json={"token": "invalid-google-token"}
        )
        
        assert response.status_code == 401


class TestGuestAuth:
    """Tests for guest authentication"""
    
    def test_guest_login_creates_temporary_user(self, db_session):
        """Guest login should create a temporary user account"""
        response = client.post("/api/auth/guest")
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data.get("is_guest") == True
```

**Acceptance Criteria**:
- [ ] `tests/test_auth.py` created with 15+ test cases
- [ ] All token generation tests pass
- [ ] All token validation tests pass
- [ ] All refresh flow tests pass
- [ ] OAuth mock tests pass
- [ ] `pytest tests/test_auth.py -v` shows all green

---

## Epic 2: Constants & Magic String Externalization

**Priority**: High — Required by project coding standards  
**Effort**: 3-4 hours  
**Dependencies**: None (can run parallel with Epic 1)
**Standards**: [python.instructions.md](../.github/instructions/python.instructions.md)

### Task 2.1: Create Constants Module (TDD)

**Type**: Scaffolding + TDD  
**Addresses**: Missing `constants.py` required by coding standards

**TDD Workflow**:

**RED** — Write `tests/test_constants.py`:
```python
import pytest
from constants import ErrorMessages, VehicleTypes, ConfigKeys, HttpStatus


class TestErrorMessages:
    """Verify all error messages are defined and non-empty"""
    
    def test_trip_not_found_message(self):
        assert ErrorMessages.TRIP_NOT_FOUND == "Trip not found"
    
    def test_unauthorized_message(self):
        assert ErrorMessages.UNAUTHORIZED == "Authentication required"
    
    def test_invalid_token_message(self):
        assert ErrorMessages.INVALID_TOKEN == "Invalid or expired token"
    
    def test_mapbox_not_configured(self):
        assert ErrorMessages.MAPBOX_NOT_CONFIGURED == "Mapbox token not configured"
    
    def test_azure_maps_not_configured(self):
        assert ErrorMessages.AZURE_MAPS_NOT_CONFIGURED == "Azure Maps key not configured"


class TestVehicleTypes:
    """Verify vehicle type constants"""
    
    def test_all_vehicle_types_lowercase(self):
        types = [VehicleTypes.CAR, VehicleTypes.TRUCK, VehicleTypes.RV, 
                 VehicleTypes.SUV, VehicleTypes.VAN, VehicleTypes.MOTORCYCLE]
        for t in types:
            assert t == t.lower(), f"{t} should be lowercase"
    
    def test_default_vehicle_type(self):
        assert VehicleTypes.DEFAULT == VehicleTypes.CAR


class TestConfigKeys:
    """Verify config key constants"""
    
    def test_secret_key_name(self):
        assert ConfigKeys.SECRET_KEY == "SECRET_KEY"
    
    def test_mapbox_token_name(self):
        assert ConfigKeys.MAPBOX_TOKEN == "MAPBOX_TOKEN"
```

**GREEN** — Create `constants.py`:
```python
"""
Centralized constants for the Road Trip Planner backend.
All magic strings, error messages, and configuration keys should be defined here.

Usage:
    from constants import ErrorMessages, VehicleTypes
    raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
"""


class ErrorMessages:
    """Standard error messages for API responses"""
    
    # Authentication
    UNAUTHORIZED = "Authentication required"
    FORBIDDEN = "Insufficient permissions"
    INVALID_TOKEN = "Invalid or expired token"
    INVALID_GOOGLE_TOKEN = "Invalid Google Token"
    INVALID_REFRESH_TOKEN = "Invalid refresh token"
    REFRESH_TOKEN_EXPIRED = "Refresh token expired"
    
    # Resources
    TRIP_NOT_FOUND = "Trip not found"
    USER_NOT_FOUND = "User not found"
    ADDRESS_NOT_FOUND = "Address not found"
    
    # External Services
    MAPBOX_NOT_CONFIGURED = "Mapbox token not configured"
    AZURE_MAPS_NOT_CONFIGURED = "Azure Maps key not configured"
    AI_SERVICE_UNAVAILABLE = "AI service temporarily unavailable"
    GEOCODING_FAILED = "Geocoding failed"
    
    # Validation
    INVALID_PROXIMITY_FORMAT = "Invalid proximity format. Use 'longitude,latitude'"
    DESCRIPTION_REQUIRED = "Vehicle description is required"


class VehicleTypes:
    """Supported vehicle type identifiers"""
    
    CAR = "car"
    TRUCK = "truck"
    RV = "rv"
    SUV = "suv"
    VAN = "van"
    MOTORCYCLE = "motorcycle"
    
    DEFAULT = CAR
    
    @classmethod
    def all(cls) -> list[str]:
        """Return all valid vehicle types"""
        return [cls.CAR, cls.TRUCK, cls.RV, cls.SUV, cls.VAN, cls.MOTORCYCLE]


class ConfigKeys:
    """Environment variable names"""
    
    SECRET_KEY = "SECRET_KEY"
    GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID"
    MAPBOX_TOKEN = "MAPBOX_TOKEN"
    AZURE_MAPS_KEY = "AZURE_MAPS_KEY"
    DATABASE_URL = "DATABASE_URL"
    AI_SERVICE_URL = "AI_SERVICE_URL"


class HttpStatus:
    """HTTP status code constants for consistency"""
    
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    UNPROCESSABLE_ENTITY = 422
    TOO_MANY_REQUESTS = 429
    INTERNAL_ERROR = 500
    SERVICE_UNAVAILABLE = 503


class ApiRoutes:
    """API route path constants"""
    
    HEALTH = "/health"
    API_HEALTH = "/api/health"
    AUTH_GOOGLE = "/api/auth/google"
    AUTH_GUEST = "/api/auth/guest"
    AUTH_REFRESH = "/api/auth/refresh"
    AUTH_LOGOUT = "/api/auth/logout"
    TRIPS = "/api/trips"
    PUBLIC_TRIPS = "/api/public-trips"
    GEOCODE = "/api/geocode"
    DIRECTIONS = "/api/directions"
    SEARCH = "/api/search"
    VEHICLE_SPECS = "/api/vehicle-specs"
```

**Acceptance Criteria**:
- [ ] `constants.py` created with all classes
- [ ] All tests in `test_constants.py` pass
- [ ] Zero hardcoded strings in new code going forward

---

### Task 2.2: Refactor main.py Hardcoded Strings (TDD)

**Type**: Refactoring  
**Addresses**: 16 hardcoded error message strings in `main.py`

**Hardcoded strings to replace:**

| Line | Current | Replacement |
|------|---------|-------------|
| 97 | `"Invalid Google Token"` | `ErrorMessages.INVALID_GOOGLE_TOKEN` |
| 191 | `"Invalid refresh token"` | `ErrorMessages.INVALID_REFRESH_TOKEN` |
| 195 | `"Refresh token expired"` | `ErrorMessages.REFRESH_TOKEN_EXPIRED` |
| 248 | `"Mapbox token not configured"` | `ErrorMessages.MAPBOX_NOT_CONFIGURED` |
| 255 | `"Geocoding failed"` | `ErrorMessages.GEOCODING_FAILED` |
| 259 | `"Address not found"` | `ErrorMessages.ADDRESS_NOT_FOUND` |
| 275 | `"Mapbox token not configured"` | `ErrorMessages.MAPBOX_NOT_CONFIGURED` |
| 305 | `"Azure Maps key not configured"` | `ErrorMessages.AZURE_MAPS_NOT_CONFIGURED` |
| 315 | `"Invalid proximity format"` | `ErrorMessages.INVALID_PROXIMITY_FORMAT` |
| 369 | `"Mapbox token not configured"` | `ErrorMessages.MAPBOX_NOT_CONFIGURED` |
| 408 | `"Trip not found"` | `ErrorMessages.TRIP_NOT_FOUND` |
| 415 | `"Trip not found"` | `ErrorMessages.TRIP_NOT_FOUND` |
| 435 | `"Trip not found"` | `ErrorMessages.TRIP_NOT_FOUND` |

**TDD Workflow**:

**RED** — Existing tests already verify error responses. Add assertion for exact message:
```python
def test_geocode_without_mapbox_token_returns_configured_error():
    """Error message should use constant"""
    with patch.dict(os.environ, {"MAPBOX_TOKEN": ""}):
        response = client.get("/api/geocode?q=test")
        assert response.json()["detail"] == "Mapbox token not configured"
```

**GREEN** — Update imports and replace strings:
```python
# main.py - Add import at top
from constants import ErrorMessages, ConfigKeys, VehicleTypes

# Replace each hardcoded string
# Before:
raise HTTPException(status_code=404, detail="Trip not found")
# After:
raise HTTPException(status_code=404, detail=ErrorMessages.TRIP_NOT_FOUND)
```

**REFACTOR** — Run `grep -n "HTTPException.*detail=" main.py` to verify no hardcoded strings remain.

**Acceptance Criteria**:
- [ ] All 16 hardcoded strings replaced with constants
- [ ] `grep -E '"Trip not found"|"Mapbox token"|"Invalid"' main.py` returns no matches
- [ ] All existing tests still pass
- [ ] Import statement added at top of main.py

---

### Task 2.3: Refactor auth.py Hardcoded Strings

**Type**: Refactoring  
**Addresses**: 2 hardcoded strings in `auth.py`

| Line | Current | Replacement |
|------|---------|-------------|
| 14 | `"dev-secret-key-change-in-production"` | Removed in Task 1.2 |
| 24 | `"your-google-client-id"` | `ConfigKeys.GOOGLE_CLIENT_ID` (with proper validation) |

**Implementation**:
```python
# auth.py
from constants import ConfigKeys, ErrorMessages

GOOGLE_CLIENT_ID = os.getenv(ConfigKeys.GOOGLE_CLIENT_ID)

def verify_google_token(token: str) -> dict:
    if not GOOGLE_CLIENT_ID:
        raise ValueError("Google Client ID not configured")
    # ... rest of function
```

**Acceptance Criteria**:
- [ ] No hardcoded credential placeholders in auth.py
- [ ] All config accessed via `ConfigKeys` constants
- [ ] Tests pass with mocked config values

---

## Epic 3: Service Layer Extraction

**Priority**: High — Required by python.instructions.md (main.py < 400 lines)  
**Effort**: 5-7 hours  
**Dependencies**: Epic 2 (constants must exist first)

### Task 3.1: Create auth_service.py (TDD)

**Type**: Service extraction  
**Addresses**: SRP-1, SRP-2 — Business logic in route handlers

**Extract from main.py:**
- `google_login()` lines 88-130 → `auth_service.authenticate_google_user()`
- `refresh_token()` lines 177-217 → `auth_service.refresh_tokens()`
- `guest_login()` lines 132-173 → `auth_service.create_guest_user()`

**TDD Workflow**:

**RED** — Write `tests/test_auth_service.py`:
```python
import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from auth_service import AuthService
from models import User


class TestAuthService:
    
    @pytest.fixture
    def auth_service(self):
        return AuthService()
    
    @pytest.fixture
    def mock_db(self):
        return MagicMock(spec=Session)
    
    def test_authenticate_google_user_creates_new_user(self, auth_service, mock_db):
        """Should create user if email not found"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with patch('auth_service.verify_google_token') as mock_verify:
            mock_verify.return_value = {
                "email": "new@example.com",
                "name": "New User"
            }
            
            result = auth_service.authenticate_google_user(
                db=mock_db,
                google_token="valid-token"
            )
            
            assert result.access_token is not None
            assert result.user.email == "new@example.com"
            mock_db.add.assert_called_once()
    
    def test_authenticate_google_user_returns_existing_user(self, auth_service, mock_db):
        """Should return existing user if email found"""
        existing_user = User(id=1, email="existing@example.com", name="Existing")
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        with patch('auth_service.verify_google_token') as mock_verify:
            mock_verify.return_value = {"email": "existing@example.com"}
            
            result = auth_service.authenticate_google_user(
                db=mock_db,
                google_token="valid-token"
            )
            
            assert result.user.id == 1
            mock_db.add.assert_not_called()
    
    def test_refresh_tokens_validates_token(self, auth_service, mock_db):
        """Should validate refresh token before issuing new tokens"""
        with pytest.raises(ValueError, match="Invalid refresh token"):
            auth_service.refresh_tokens(
                db=mock_db,
                refresh_token="invalid-token"
            )
    
    def test_create_guest_user_sets_is_guest_flag(self, auth_service, mock_db):
        """Guest users should have is_guest=True"""
        result = auth_service.create_guest_user(db=mock_db)
        
        assert result.user.is_guest == True
        assert result.access_token is not None
```

**GREEN** — Create `auth_service.py`:
```python
"""
Authentication service layer.
Handles user authentication, token management, and session handling.
"""
import uuid
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    create_refresh_token,
    verify_google_token,
    decode_token,
    SECRET_KEY,
    ALGORITHM,
)
from constants import ErrorMessages
from models import User
from schemas import TokenResponse

logger = logging.getLogger(__name__)


@dataclass
class AuthResult:
    """Result of authentication operation"""
    user: User
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthService:
    """Service for authentication operations"""
    
    def authenticate_google_user(
        self,
        db: Session,
        google_token: str
    ) -> AuthResult:
        """
        Authenticate user via Google OAuth token.
        Creates new user if email not found.
        
        Args:
            db: Database session
            google_token: Google OAuth token from frontend
            
        Returns:
            AuthResult with user and tokens
            
        Raises:
            ValueError: If Google token is invalid
        """
        # Verify Google token
        google_data = verify_google_token(google_token)
        email = google_data.get("email")
        
        if not email:
            raise ValueError(ErrorMessages.INVALID_GOOGLE_TOKEN)
        
        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            user = User(
                email=email,
                name=google_data.get("name", ""),
                picture=google_data.get("picture"),
                is_guest=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user: {email}")
        
        # Generate tokens
        token_data = {"sub": email, "user_id": user.id}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Store refresh token
        user.refresh_token = refresh_token
        db.commit()
        
        return AuthResult(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
        )
    
    def refresh_tokens(
        self,
        db: Session,
        refresh_token: str
    ) -> AuthResult:
        """
        Refresh access token using refresh token.
        Implements token rotation for security.
        
        Args:
            db: Database session
            refresh_token: Current refresh token
            
        Returns:
            AuthResult with new tokens
            
        Raises:
            ValueError: If refresh token is invalid or expired
        """
        try:
            payload = decode_token(refresh_token)
        except Exception:
            raise ValueError(ErrorMessages.INVALID_REFRESH_TOKEN)
        
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user or user.refresh_token != refresh_token:
            raise ValueError(ErrorMessages.INVALID_REFRESH_TOKEN)
        
        # Generate new tokens (rotation)
        token_data = {"sub": user.email, "user_id": user.id}
        new_access = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)
        
        # Update stored refresh token
        user.refresh_token = new_refresh
        db.commit()
        
        return AuthResult(
            user=user,
            access_token=new_access,
            refresh_token=new_refresh,
        )
    
    def create_guest_user(self, db: Session) -> AuthResult:
        """
        Create a temporary guest user account.
        
        Args:
            db: Database session
            
        Returns:
            AuthResult with guest user and tokens
        """
        guest_id = str(uuid.uuid4())[:8]
        guest_email = f"guest_{guest_id}@roadtrip.local"
        
        user = User(
            email=guest_email,
            name=f"Guest {guest_id}",
            is_guest=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        token_data = {"sub": guest_email, "user_id": user.id, "is_guest": True}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        user.refresh_token = refresh_token
        db.commit()
        
        logger.info(f"Created guest user: {guest_email}")
        
        return AuthResult(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
        )
    
    def logout(self, db: Session, user: User) -> None:
        """
        Logout user by clearing refresh token.
        
        Args:
            db: Database session
            user: User to logout
        """
        user.refresh_token = None
        db.commit()
        logger.info(f"User logged out: {user.email}")


# Singleton instance
auth_service = AuthService()
```

**REFACTOR** — Update `main.py` to use service:
```python
from auth_service import auth_service

@app.post("/api/auth/google")
async def google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.authenticate_google_user(db, request.token)
        return {
            "access_token": result.access_token,
            "refresh_token": result.refresh_token,
            "token_type": result.token_type,
            "user": {"email": result.user.email, "name": result.user.name}
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
```

**Acceptance Criteria**:
- [ ] `auth_service.py` created with AuthService class
- [ ] All 4 methods implemented and tested
- [ ] `main.py` routes delegate to auth_service
- [ ] ~80 lines removed from main.py
- [ ] All existing auth tests still pass

---

### Task 3.2: Create geocode_service.py (TDD)

**Type**: Service extraction  
**Addresses**: SRP-3 — External API logic in route handlers

**Extract from main.py:**
- `geocode_address()` lines 241-265 → `geocode_service.geocode()`
- `get_directions()` lines 268-295 → `geocode_service.get_directions()`
- `optimize_route()` lines 362-390 → `geocode_service.optimize()`

**TDD Workflow**:

**RED** — Write `tests/test_geocode_service.py`:
```python
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from geocode_service import GeocodeService


class TestGeocodeService:
    
    @pytest.fixture
    def service(self):
        return GeocodeService(mapbox_token="test-token")
    
    @pytest.mark.asyncio
    async def test_geocode_returns_coordinates(self, service):
        """Should return [lon, lat] coordinates"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "features": [{"center": [-122.4194, 37.7749]}]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            result = await service.geocode("San Francisco, CA")
            
            assert result["coordinates"] == [-122.4194, 37.7749]
    
    @pytest.mark.asyncio
    async def test_geocode_not_found_raises_error(self, service):
        """Should raise ValueError when address not found"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"features": []}
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            with pytest.raises(ValueError, match="Address not found"):
                await service.geocode("nonexistent-place-12345")
    
    @pytest.mark.asyncio
    async def test_directions_returns_route(self, service):
        """Should return route with geometry and duration"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "routes": [{
                "geometry": "encoded_polyline",
                "duration": 3600,
                "distance": 50000
            }]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            result = await service.get_directions("-122.4,37.7;-121.9,37.3")
            
            assert "routes" in result
            assert result["routes"][0]["duration"] == 3600
```

**GREEN** — Create `geocode_service.py`:
```python
"""
Geospatial service layer.
Handles geocoding, directions, and route optimization via Mapbox API.
"""
import logging
from typing import Optional

import httpx

from constants import ErrorMessages

logger = logging.getLogger(__name__)


class GeocodeService:
    """Service for geospatial operations via Mapbox API"""
    
    MAPBOX_BASE_URL = "https://api.mapbox.com"
    TIMEOUT_SECONDS = 30
    
    def __init__(self, mapbox_token: str):
        self.mapbox_token = mapbox_token
    
    async def geocode(self, query: str) -> dict:
        """
        Convert address to coordinates.
        
        Args:
            query: Address or place name to geocode
            
        Returns:
            Dict with coordinates [lon, lat] and place name
            
        Raises:
            ValueError: If address not found
            httpx.HTTPError: If API call fails
        """
        url = f"{self.MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/{query}.json"
        params = {
            "access_token": self.mapbox_token,
            "limit": 1,
        }
        
        async with httpx.AsyncClient(timeout=self.TIMEOUT_SECONDS) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        features = data.get("features", [])
        if not features:
            raise ValueError(ErrorMessages.ADDRESS_NOT_FOUND)
        
        feature = features[0]
        return {
            "coordinates": feature["center"],
            "place_name": feature.get("place_name", ""),
        }
    
    async def get_directions(
        self,
        coordinates: str,
        profile: str = "driving",
        alternatives: bool = False,
    ) -> dict:
        """
        Get driving directions between coordinates.
        
        Args:
            coordinates: Semicolon-separated coordinate pairs (lon,lat;lon,lat)
            profile: Routing profile (driving, walking, cycling)
            alternatives: Whether to return alternative routes
            
        Returns:
            Mapbox directions response with routes
            
        Raises:
            httpx.HTTPError: If API call fails
        """
        url = f"{self.MAPBOX_BASE_URL}/directions/v5/mapbox/{profile}/{coordinates}"
        params = {
            "access_token": self.mapbox_token,
            "geometries": "geojson",
            "overview": "full",
            "alternatives": str(alternatives).lower(),
        }
        
        async with httpx.AsyncClient(timeout=self.TIMEOUT_SECONDS) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
    
    async def optimize_route(
        self,
        coordinates: str,
        source: str = "first",
        destination: str = "last",
    ) -> dict:
        """
        Optimize waypoint order for most efficient route.
        
        Args:
            coordinates: Semicolon-separated coordinate pairs
            source: Starting point constraint
            destination: Ending point constraint
            
        Returns:
            Optimized route with reordered waypoints
            
        Raises:
            httpx.HTTPError: If API call fails
        """
        url = f"{self.MAPBOX_BASE_URL}/optimized-trips/v1/mapbox/driving/{coordinates}"
        params = {
            "access_token": self.mapbox_token,
            "geometries": "geojson",
            "overview": "full",
            "source": source,
            "destination": destination,
        }
        
        async with httpx.AsyncClient(timeout=self.TIMEOUT_SECONDS) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()


def create_geocode_service(mapbox_token: Optional[str]) -> GeocodeService:
    """
    Factory function to create GeocodeService with validation.
    
    Raises:
        ValueError: If Mapbox token not configured
    """
    if not mapbox_token:
        raise ValueError(ErrorMessages.MAPBOX_NOT_CONFIGURED)
    return GeocodeService(mapbox_token)
```

**Acceptance Criteria**:
- [ ] `geocode_service.py` created with GeocodeService class
- [ ] 3 methods implemented: geocode, get_directions, optimize_route
- [ ] Factory function validates token configuration
- [ ] ~60 lines removed from main.py
- [ ] All existing geocode tests still pass

---

### Task 3.3: Create search_service.py (TDD)

**Type**: Service extraction  
**Addresses**: SRP-3 — Azure Maps search logic in route handler

**Extract from main.py:**
- `search_places()` lines 298-360 → `search_service.search_nearby()`
- Response transformation logic → `search_service.transform_to_geojson()`

**TDD Workflow**:

**RED** — Write `tests/test_search_service.py`:
```python
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from search_service import SearchService


class TestSearchService:
    
    @pytest.fixture
    def service(self):
        return SearchService(azure_maps_key="test-key")
    
    @pytest.mark.asyncio
    async def test_search_nearby_returns_geojson(self, service):
        """Should transform Azure Maps response to GeoJSON"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [{
                "poi": {"name": "Coffee Shop"},
                "position": {"lat": 37.7749, "lon": -122.4194},
                "address": {"freeformAddress": "123 Main St"}
            }]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            result = await service.search_nearby(
                query="coffee",
                lat=37.7749,
                lon=-122.4194
            )
            
            assert result["type"] == "FeatureCollection"
            assert len(result["features"]) == 1
            assert result["features"][0]["properties"]["name"] == "Coffee Shop"
    
    def test_transform_to_geojson_format(self, service):
        """Should correctly transform Azure Maps format to Mapbox GeoJSON"""
        azure_result = {
            "poi": {"name": "Test Place", "categories": ["restaurant"]},
            "position": {"lat": 37.7, "lon": -122.4},
            "address": {"freeformAddress": "123 Test St"}
        }
        
        feature = service._transform_result(azure_result)
        
        assert feature["type"] == "Feature"
        assert feature["geometry"]["type"] == "Point"
        assert feature["geometry"]["coordinates"] == [-122.4, 37.7]
        assert feature["properties"]["name"] == "Test Place"
```

**GREEN** — Create `search_service.py`:
```python
"""
Search service layer.
Handles POI search via Azure Maps API with response transformation.
"""
import logging
from typing import Optional

import httpx

from constants import ErrorMessages

logger = logging.getLogger(__name__)


class SearchService:
    """Service for POI search operations via Azure Maps API"""
    
    AZURE_MAPS_BASE_URL = "https://atlas.microsoft.com"
    TIMEOUT_SECONDS = 30
    
    def __init__(self, azure_maps_key: str):
        self.azure_maps_key = azure_maps_key
    
    async def search_nearby(
        self,
        query: str,
        lat: float,
        lon: float,
        radius: int = 5000,
        limit: int = 10,
    ) -> dict:
        """
        Search for POIs near a location.
        
        Args:
            query: Search query (e.g., "coffee", "gas station")
            lat: Latitude of center point
            lon: Longitude of center point
            radius: Search radius in meters (default 5km)
            limit: Maximum results to return
            
        Returns:
            GeoJSON FeatureCollection with POI results
            
        Raises:
            httpx.HTTPError: If API call fails
        """
        url = f"{self.AZURE_MAPS_BASE_URL}/search/poi/json"
        params = {
            "subscription-key": self.azure_maps_key,
            "api-version": "1.0",
            "query": query,
            "lat": lat,
            "lon": lon,
            "radius": radius,
            "limit": limit,
        }
        
        async with httpx.AsyncClient(timeout=self.TIMEOUT_SECONDS) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        # Transform to GeoJSON format (Mapbox compatible)
        features = [
            self._transform_result(result)
            for result in data.get("results", [])
        ]
        
        return {
            "type": "FeatureCollection",
            "features": features,
        }
    
    def _transform_result(self, result: dict) -> dict:
        """
        Transform Azure Maps result to GeoJSON Feature.
        
        Args:
            result: Single Azure Maps search result
            
        Returns:
            GeoJSON Feature dict
        """
        poi = result.get("poi", {})
        position = result.get("position", {})
        address = result.get("address", {})
        
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    position.get("lon", 0),
                    position.get("lat", 0),
                ],
            },
            "properties": {
                "name": poi.get("name", "Unknown"),
                "categories": poi.get("categories", []),
                "address": address.get("freeformAddress", ""),
                "phone": poi.get("phone"),
                "url": poi.get("url"),
            },
        }


def create_search_service(azure_maps_key: Optional[str]) -> SearchService:
    """
    Factory function to create SearchService with validation.
    
    Raises:
        ValueError: If Azure Maps key not configured
    """
    if not azure_maps_key:
        raise ValueError(ErrorMessages.AZURE_MAPS_NOT_CONFIGURED)
    return SearchService(azure_maps_key)
```

**Acceptance Criteria**:
- [ ] `search_service.py` created with SearchService class
- [ ] Response transformation produces valid GeoJSON
- [ ] ~60 lines removed from main.py
- [ ] Existing search tests pass with service layer

---

### Task 3.4: Slim Down main.py to Routes Only

**Type**: Refactoring  
**Addresses**: main.py exceeds 400-line limit per python.instructions.md

**Goal**: Reduce main.py from ~450 lines to <400 lines by:
1. Using auth_service (Task 3.1)
2. Using geocode_service (Task 3.2)
3. Using search_service (Task 3.3)

**Updated main.py structure**:
```python
"""
Road Trip Planner API — Route Definitions Only
Business logic delegated to service modules.
"""
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from constants import ErrorMessages, HttpStatus
from database import get_db
from auth_service import auth_service
from geocode_service import create_geocode_service
from search_service import create_search_service
from schemas import (
    GoogleAuthRequest,
    RefreshTokenRequest,
    TripCreate,
    TripUpdate,
)

app = FastAPI(title="Road Trip Planner API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Service instances (lazy initialization)
_geocode_service = None
_search_service = None


def get_geocode_service():
    global _geocode_service
    if _geocode_service is None:
        _geocode_service = create_geocode_service(os.getenv("MAPBOX_TOKEN"))
    return _geocode_service


def get_search_service():
    global _search_service
    if _search_service is None:
        _search_service = create_search_service(os.getenv("AZURE_MAPS_KEY"))
    return _search_service


# === HEALTH ROUTES ===

@app.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}


# === AUTH ROUTES ===

@app.post("/api/auth/google")
async def google_login(
    request: GoogleAuthRequest,
    db: Session = Depends(get_db)
) -> dict:
    try:
        result = auth_service.authenticate_google_user(db, request.token)
        return {
            "access_token": result.access_token,
            "refresh_token": result.refresh_token,
            "token_type": result.token_type,
        }
    except ValueError as e:
        raise HTTPException(status_code=HttpStatus.UNAUTHORIZED, detail=str(e))


# ... remaining routes follow same pattern ...
```

**Acceptance Criteria**:
- [ ] `main.py` reduced to <400 lines
- [ ] `wc -l main.py` returns less than 400
- [ ] All routes delegate to service modules
- [ ] Route handlers are 5-15 lines each (no business logic)
- [ ] All existing tests pass

---

## Epic 4: Input Validation & Security

**Priority**: High — Security vulnerabilities  
**Effort**: 4-5 hours  
**Dependencies**: Epic 1 (security fixes first)

### Task 4.1: Add Pydantic Validators to schemas.py (TDD)

**Type**: Security enhancement  
**Addresses**: SEC-4 — No input length limits

**Missing validators to add:**

| Schema | Field | Validator |
|--------|-------|-----------|
| `TripCreate` | `name` | `min_length=1, max_length=200` |
| `TripCreate` | `stops` | `max_length=50` (max 50 stops) |
| `TripUpdate` | `image_url` | URL format validation |
| `TripUpdate` | `name` | `max_length=200` |
| `UserBase` | `email` | Email format validation |
| `VehicleTypeRequest` | `type` | Enum validation (allowed values) |
| `GoogleAuthRequest` | `token` | `min_length=10, max_length=5000` |

**TDD Workflow**:

**RED** — Write `tests/test_schemas.py`:
```python
import pytest
from pydantic import ValidationError

from schemas import TripCreate, TripUpdate, UserBase, VehicleTypeRequest


class TestTripCreateValidation:
    
    def test_name_required(self):
        """Trip name is required"""
        with pytest.raises(ValidationError) as exc_info:
            TripCreate(stops=[])
        assert "name" in str(exc_info.value)
    
    def test_name_max_length(self):
        """Trip name must be <= 200 characters"""
        with pytest.raises(ValidationError) as exc_info:
            TripCreate(name="a" * 201, stops=[])
        assert "200" in str(exc_info.value)
    
    def test_stops_max_length(self):
        """Trips can have max 50 stops"""
        too_many_stops = [{"lat": 0, "lon": 0}] * 51
        with pytest.raises(ValidationError) as exc_info:
            TripCreate(name="Test Trip", stops=too_many_stops)
        assert "50" in str(exc_info.value)
    
    def test_valid_trip_passes(self):
        """Valid trip should pass validation"""
        trip = TripCreate(
            name="Road Trip 2026",
            stops=[{"lat": 37.7, "lon": -122.4}]
        )
        assert trip.name == "Road Trip 2026"


class TestUserBaseValidation:
    
    def test_email_format_validation(self):
        """Email must be valid format"""
        with pytest.raises(ValidationError) as exc_info:
            UserBase(email="not-an-email", name="Test")
        assert "email" in str(exc_info.value).lower()
    
    def test_valid_email_passes(self):
        """Valid email should pass"""
        user = UserBase(email="test@example.com", name="Test User")
        assert user.email == "test@example.com"


class TestVehicleTypeValidation:
    
    def test_invalid_vehicle_type_rejected(self):
        """Only allowed vehicle types accepted"""
        with pytest.raises(ValidationError):
            VehicleTypeRequest(type="spaceship")
    
    def test_valid_vehicle_types_accepted(self):
        """Valid vehicle types should pass"""
        for vtype in ["car", "truck", "rv", "suv", "van", "motorcycle"]:
            req = VehicleTypeRequest(type=vtype)
            assert req.type == vtype
```

**GREEN** — Update `schemas.py`:
```python
from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator
from typing import Optional, List
from enum import Enum

from constants import VehicleTypes


class VehicleTypeEnum(str, Enum):
    """Valid vehicle types"""
    car = VehicleTypes.CAR
    truck = VehicleTypes.TRUCK
    rv = VehicleTypes.RV
    suv = VehicleTypes.SUV
    van = VehicleTypes.VAN
    motorcycle = VehicleTypes.MOTORCYCLE


class TripCreate(BaseModel):
    """Request schema for creating a trip"""
    
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Trip name"
    )
    stops: List[dict] = Field(
        default_factory=list,
        max_length=50,
        description="Trip stops (max 50)"
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Trip description"
    )
    is_public: bool = Field(default=False)


class TripUpdate(BaseModel):
    """Request schema for updating a trip"""
    
    name: Optional[str] = Field(None, max_length=200)
    stops: Optional[List[dict]] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=2000)
    
    @field_validator('image_url')
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.startswith(('http://', 'https://')):
            raise ValueError('image_url must be a valid HTTP(S) URL')
        return v


class UserBase(BaseModel):
    """Base user schema with validation"""
    
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=1, max_length=100)


class VehicleTypeRequest(BaseModel):
    """Request for vehicle type"""
    
    type: VehicleTypeEnum = Field(
        default=VehicleTypeEnum.car,
        description="Vehicle type"
    )


class GoogleAuthRequest(BaseModel):
    """Google OAuth token request"""
    
    token: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Google OAuth token"
    )


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    
    refresh_token: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="JWT refresh token"
    )
```

**Acceptance Criteria**:
- [ ] All request schemas have length constraints
- [ ] Email validation uses `EmailStr`
- [ ] Vehicle type uses enum validation
- [ ] URL fields validated for format
- [ ] All tests in `test_schemas.py` pass

---

### Task 4.2: Add Rate Limiting with SlowAPI (TDD)

**Type**: Security enhancement  
**Addresses**: SEC-3 — No rate limiting

**TDD Workflow**:

**RED** — Write test:
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_rate_limit_exceeded_returns_429():
    """Should return 429 when rate limit exceeded"""
    # Make many requests quickly
    for _ in range(100):
        response = client.get("/api/geocode?q=test")
    
    # Eventually should hit rate limit
    assert response.status_code == 429
```

**GREEN** — Create `security.py` and update `main.py`:

```python
# security.py
"""
Security middleware and utilities.
Rate limiting, input sanitization, and security headers.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

from constants import HttpStatus


# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded
) -> JSONResponse:
    """Custom handler for rate limit exceeded"""
    return JSONResponse(
        status_code=HttpStatus.TOO_MANY_REQUESTS,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": exc.detail,
        }
    )
```

```python
# main.py - Add rate limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

from security import limiter, rate_limit_exceeded_handler

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.get("/api/geocode")
@limiter.limit("30/minute")
async def geocode_address(
    request: Request,
    q: str,
):
    # ... existing implementation
```

**Update requirements.txt**:
```
slowapi>=0.1.9
```

**Acceptance Criteria**:
- [ ] `slowapi` added to requirements.txt
- [ ] Rate limiter configured in `security.py`
- [ ] External API routes rate limited (30/minute default)
- [ ] Auth routes rate limited (10/minute)
- [ ] 429 response returns retry-after info

---

### Task 4.3: Add Input Sanitization for External APIs (TDD)

**Type**: Security enhancement  
**Addresses**: Potential injection in external API calls

**TDD Workflow**:

**RED** — Write test in `security.py`:
```python
def test_sanitize_removes_control_characters():
    from security import sanitize_input
    
    malicious = "test\x00\x01injection"
    result = sanitize_input(malicious)
    assert "\x00" not in result
    assert "\x01" not in result


def test_sanitize_truncates_long_input():
    from security import sanitize_input
    
    long_input = "a" * 10000
    result = sanitize_input(long_input, max_length=500)
    assert len(result) == 500
```

**GREEN** — Add to `security.py`:
```python
import re
import logging

logger = logging.getLogger(__name__)

# Control character pattern (except newline, tab)
CONTROL_CHARS = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')


def sanitize_input(
    value: str,
    max_length: int = 2000,
    allow_newlines: bool = True
) -> str:
    """
    Sanitize user input before sending to external APIs.
    
    Args:
        value: Input string to sanitize
        max_length: Maximum allowed length
        allow_newlines: Whether to preserve newlines
        
    Returns:
        Sanitized string
    """
    if not value:
        return ""
    
    # Remove control characters
    cleaned = CONTROL_CHARS.sub('', value)
    
    # Truncate to max length
    if len(cleaned) > max_length:
        logger.warning(f"Input truncated from {len(cleaned)} to {max_length} chars")
        cleaned = cleaned[:max_length]
    
    return cleaned.strip()
```

**Apply to services**:
```python
# geocode_service.py
from security import sanitize_input

async def geocode(self, query: str) -> dict:
    safe_query = sanitize_input(query, max_length=500)
    # ... use safe_query
```

**Acceptance Criteria**:
- [ ] `sanitize_input()` function in security.py
- [ ] Control characters removed
- [ ] Long inputs truncated with logging
- [ ] Applied to all external API query parameters

---

## Epic 5: Logging & Production Readiness

**Priority**: Medium — Operations requirement  
**Effort**: 3-4 hours  
**Dependencies**: None

### Task 5.1: Create Centralized Logging Configuration

**Type**: Infrastructure  
**Addresses**: No centralized logging, inconsistent log formats

**Create** `logging_config.py`:
```python
"""
Centralized logging configuration.
Produces JSON-structured logs for Azure Monitor compatibility.
"""
import logging
import sys
import json
from datetime import datetime
from typing import Any


class JsonFormatter(logging.Formatter):
    """JSON log formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "extra"):
            log_data.update(record.extra)
        
        return json.dumps(log_data)


def setup_logging(level: str = "INFO") -> None:
    """
    Configure application logging.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    
    # Console handler with JSON formatting
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    
    # Clear existing handlers
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    
    # Reduce noise from third-party loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the given name"""
    return logging.getLogger(name)
```

**Update main.py startup**:
```python
from logging_config import setup_logging, get_logger

# At app startup
setup_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = get_logger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Road Trip API starting", extra={"version": "1.0.0"})
```

**Acceptance Criteria**:
- [ ] `logging_config.py` created
- [ ] JSON structured logs produced
- [ ] All services use `get_logger()` instead of `print()`
- [ ] Log level configurable via `LOG_LEVEL` env var

---

### Task 5.2: Secure Dockerfile

**Type**: Security hardening  
**Addresses**: SEC-8 — Dockerfile runs as root

**TDD Workflow** — Verification test:
```bash
# Test that container doesn't run as root
docker build -t backend-test backend/
docker run --rm backend-test whoami
# Should output: appuser, NOT root
```

**Updated Dockerfile**:
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim AS base

# Security: Don't run as root
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create** `.dockerignore`:
```
# .dockerignore
.env
.env.*
*.pyc
__pycache__/
.pytest_cache/
.mypy_cache/
.coverage
htmlcov/
venv/
venv_test/
.git/
.github/
tests/
*.md
*.json
!package.json
```

**Acceptance Criteria**:
- [ ] Container runs as non-root user
- [ ] `.dockerignore` excludes sensitive files
- [ ] Healthcheck included
- [ ] `.env` never copied to image
- [ ] `docker build` succeeds

---

### Task 5.3: Add Database Connection Pooling

**Type**: Performance/Reliability  
**Addresses**: Missing connection pooling in database.py

**Update** `database.py`:
```python
"""
Database configuration with connection pooling.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./trips.db"  # SQLite fallback for local dev
)

# Connection pooling configuration
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # 1 hour

# Engine configuration differs for SQLite vs PostgreSQL
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=POOL_SIZE,
        max_overflow=MAX_OVERFLOW,
        pool_recycle=POOL_RECYCLE,
        pool_pre_ping=True,  # Verify connections before use
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Acceptance Criteria**:
- [ ] Connection pooling configured for PostgreSQL
- [ ] Pool size configurable via environment
- [ ] `pool_pre_ping=True` for connection health
- [ ] SQLite fallback still works for local dev

---

## Epic 6: Testing Expansion

**Priority**: Medium — Quality assurance  
**Effort**: 4-5 hours  
**Dependencies**: Epics 3, 4

### Task 6.1: Add Database Failure Tests

**Type**: Test coverage
**Create tests for error scenarios**:

```python
# tests/test_error_handling.py
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from main import app

client = TestClient(app)


class TestDatabaseErrors:
    
    def test_db_connection_failure_returns_503(self):
        """Database connection failure should return 503"""
        with patch('database.SessionLocal') as mock_session:
            mock_session.side_effect = OperationalError("Connection refused", None, None)
            
            response = client.get("/api/health")
            
            assert response.status_code == 503
    
    def test_db_timeout_handled_gracefully(self):
        """Database timeout should not crash the app"""
        with patch('database.SessionLocal') as mock_session:
            mock_session.return_value.execute.side_effect = TimeoutError()
            
            response = client.get("/api/trips")
            
            assert response.status_code in [503, 500]


class TestExternalApiTimeouts:
    
    @pytest.mark.asyncio
    async def test_mapbox_timeout_returns_504(self):
        """Mapbox API timeout should return 504"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = TimeoutError()
            
            response = client.get("/api/geocode?q=test")
            
            assert response.status_code == 504
```

---

### Task 6.2: Add Security Edge Case Tests

**Type**: Security testing

```python
# tests/test_security.py
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestInputSanitization:
    
    def test_sql_injection_in_query_params(self):
        """SQL injection attempts should be handled safely"""
        malicious = "'; DROP TABLE trips; --"
        response = client.get(f"/api/geocode?q={malicious}")
        
        # Should not crash, should return error or sanitized response
        assert response.status_code in [200, 400, 422]
    
    def test_xss_in_trip_name(self):
        """XSS attempts in trip name should be escaped"""
        malicious_name = "<script>alert('xss')</script>"
        
        # Create trip with malicious name
        # Verify response properly escapes or rejects
    
    def test_path_traversal_rejected(self):
        """Path traversal attempts should be rejected"""
        response = client.get("/api/../../../etc/passwd")
        assert response.status_code == 404


class TestAuthenticationEdgeCases:
    
    def test_jwt_with_none_algorithm_rejected(self):
        """JWT with 'none' algorithm should be rejected"""
        # Attack: Forge token with alg=none
        forged_token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9."
        
        response = client.get(
            "/api/trips",
            headers={"Authorization": f"Bearer {forged_token}"}
        )
        assert response.status_code == 401
```

---

### Task 6.3: Achieve 80% Test Coverage

**Type**: Coverage target

**Add coverage configuration** to `pytest.ini`:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts = -v --cov=. --cov-report=html --cov-report=term-missing --cov-fail-under=80

[coverage:run]
omit = 
    tests/*
    venv/*
    venv_test/*
    alembic/*
    */migrations/*
```

**Acceptance Criteria**:
- [ ] `pytest --cov=.` shows ≥80% coverage
- [ ] All critical paths tested
- [ ] HTML coverage report generated

---

## Epic 7: Type Safety & Code Quality

**Priority**: Low — Quality improvement  
**Effort**: 2-3 hours  
**Dependencies**: None

### Task 7.1: Add Return Type Hints to Route Handlers

**Type**: Code quality
**Addresses**: ~40% type hint coverage in main.py

**Add return type hints**:
```python
# Before
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# After
from typing import Dict, Any

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "healthy"}
```

**Functions needing type hints** (from analysis):
- `health_check()` → `Dict[str, str]`
- `api_health_check()` → `Dict[str, Any]`
- `google_login()` → `Dict[str, Any]`
- `guest_login()` → `Dict[str, Any]`
- `refresh_token()` → `Dict[str, Any]`
- `logout()` → `Dict[str, str]`
- `geocode_address()` → `Dict[str, Any]`
- `get_directions()` → `Dict[str, Any]`
- `search_places()` → `Dict[str, Any]`
- All CRUD operations

---

### Task 7.2: Enable Strict mypy Checking

**Type**: Static analysis

**Create** `mypy.ini`:
```ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
show_error_codes = True

[mypy-tests.*]
ignore_errors = True

[mypy-alembic.*]
ignore_errors = True
```

**Update requirements.txt**:
```
mypy>=1.8.0
types-requests
```

**Add to CI**:
```yaml
- name: Type checking
  run: |
    cd backend
    mypy *.py --ignore-missing-imports
```

**Acceptance Criteria**:
- [ ] `mypy *.py` passes with zero errors
- [ ] All public functions have type hints
- [ ] Type checking in CI pipeline

---

## Summary

### Effort by Epic

| Epic | Effort | Priority | Dependencies |
|------|--------|----------|--------------|
| 1. Critical Security Fixes | 2-3 hrs | Critical | None |
| 2. Constants Externalization | 3-4 hrs | High | None |
| 3. Service Layer Extraction | 5-7 hrs | High | Epic 2 |
| 4. Input Validation & Security | 4-5 hrs | High | Epic 1 |
| 5. Logging & Production Readiness | 3-4 hrs | Medium | None |
| 6. Testing Expansion | 4-5 hrs | Medium | Epics 3, 4 |
| 7. Type Safety | 2-3 hrs | Low | None |

### Critical Path

```
Epic 1 (Security) ─────────────────────────> Epic 4 (Validation)
       │                                           │
       └──> Epic 2 (Constants) ──> Epic 3 (Services) ──> Epic 6 (Testing)
                                                                │
Epic 5 (Production) ─────────────────────────────────────────────┘
                                                                │
Epic 7 (Types) ─────────────────────────────────────────────────┘
```

### Files to Create

| File | Epic | Priority |
|------|------|----------|
| `constants.py` | 2 | High |
| `auth_service.py` | 3 | High |
| `geocode_service.py` | 3 | High |
| `search_service.py` | 3 | High |
| `security.py` | 4 | High |
| `logging_config.py` | 5 | Medium |
| `.dockerignore` | 5 | Medium |
| `tests/test_auth.py` | 1 | Critical |
| `tests/test_schemas.py` | 4 | High |
| `tests/test_auth_service.py` | 3 | High |
| `tests/test_security.py` | 6 | Medium |
| `mypy.ini` | 7 | Low |

### Verification Commands

```bash
# After each task
cd backend
pytest tests/ -v

# Coverage check
pytest --cov=. --cov-report=term-missing --cov-fail-under=80

# Security scan
bandit -r . -ll

# Type checking
mypy *.py --ignore-missing-imports

# Dockerfile security
docker build -t backend-test .
docker run --rm backend-test whoami  # Should output: appuser
```

---

**Next Steps**:
1. Start with Epic 1, Task 1.1 (Remove MOCK_TOKEN bypass)
2. Create `tests/test_auth.py` as first deliverable
3. Progress through Critical Path in order

**Review Schedule**:
- After Epic 1: Security review checkpoint
- After Epic 3: Architecture review checkpoint  
- After Epic 6: Coverage and quality gate
