# Backend Testing Memory
**Last Updated:** January 21, 2026  
**Issue**: #4 - Add Backend API Mocking for External Services

---

## Project Overview
This document tracks the implementation of comprehensive API mocking for the **Road Trip Planner** backend test suite. The primary goal was to eliminate network dependencies in tests by mocking all external API calls (Mapbox, Azure Maps, AI Service) and ensure CI/CD pipeline reliability.

---

## Recent Work

### 1. Test Infrastructure Setup ✅
- **Fixture Directory:** Created `backend/tests/fixtures/` with 10 JSON files
  - 5 success response fixtures (realistic API responses)
  - 5 error response fixtures (HTTP error codes: 400, 401, 422, 429, 503)
- **Shared Fixtures:** Created `backend/tests/conftest.py` with pytest fixtures
  - Fixture loader helper: `load_fixture(filename: str) -> dict`
  - Mock utilities using `unittest.mock.patch` for `httpx.AsyncClient`
  - 20+ pytest fixtures (10 data fixtures + 10 mock client fixtures)

### 2. External API Coverage ✅
Mocked all 5 external API integrations:

#### Mapbox Geocoding API
- **Endpoint**: `GET /api/geocode`
- **Success Test**: `test_geocode_success` - Returns San Francisco coordinates
- **Error Test**: `test_geocode_error` - Handles 429 rate limit
- **Fixtures**: `mapbox_geocode.json`, `mapbox_geocode_error.json`

#### Mapbox Directions API
- **Endpoint**: `GET /api/directions`
- **Success Test**: `test_directions_success` - Returns route from SF to San Jose
- **Error Test**: `test_directions_error` - Handles 400 invalid coordinates
- **Fixtures**: `mapbox_directions.json`, `mapbox_directions_error.json`

#### Mapbox Optimization API
- **Endpoint**: `GET /api/optimize`
- **Success Test**: `test_optimize_success` - Returns optimized waypoint order
- **Error Test**: `test_optimize_error` - Handles 422 validation error
- **Fixtures**: `mapbox_optimize.json`, `mapbox_optimize_error.json`

#### Azure Maps Search API
- **Endpoint**: `GET /api/search`
- **Success Test**: `test_search_success` - Returns coffee shops with GeoJSON transformation
- **Error Test**: `test_search_error` - Handles 401 unauthorized
- **Fixtures**: `azure_maps_search.json`, `azure_maps_search_error.json`
- **Key Validation**: Verifies Azure Maps → Mapbox GeoJSON transformation (coordinates in correct order)

#### AI Service (Vehicle Specs)
- **Endpoint**: `POST /api/vehicle-specs`
- **Success Test**: `test_vehicle_specs_with_ai_success` - Returns AI-parsed RV specs
- **Error Test**: `test_vehicle_specs_with_ai_error` - Fallbacks to defaults on 503 error
- **Fixtures**: `ai_service_vehicle.json`, `ai_service_vehicle_error.json`
- **Key Validation**: Verifies weight conversion (kg → tonnes)

### 3. CI/CD Pipeline Hardening ✅
- **File Modified**: `.github/workflows/backend.yml`
- **Change**: Removed `continue-on-error: true` from "Run tests" step (line 44)
- **Impact**: Test failures now **fail the build** (as they should)
- **Status**: All 45 tests pass without network calls

---

## Technical Implementation Details

### Mock Pattern (httpx.AsyncClient)
Following existing `test_ai_service.py` pattern:

```python
# conftest.py
@pytest.fixture
def mock_httpx_geocode_success(mapbox_geocode_success):
    """Mock httpx.AsyncClient for successful geocode request"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mapbox_geocode_success
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client
```

### Test Structure (test_main.py)
```python
def test_geocode_success(mock_httpx_geocode_success):
    """Should successfully geocode an address using mocked Mapbox API"""
    response = client.get("/api/geocode?q=San Francisco")
    assert response.status_code == 200
    data = response.json()
    assert data["coordinates"] == [-122.4194, 37.7749]
```

### Fixture File Structure
```json
// mapbox_geocode.json (Success - 200 OK)
{
  "type": "FeatureCollection",
  "features": [{
    "place_name": "San Francisco, California, United States",
    "center": [-122.4194, 37.7749],
    "geometry": { "type": "Point", "coordinates": [-122.4194, 37.7749] }
  }]
}

// mapbox_geocode_error.json (Error - 429 Rate Limit)
{
  "message": "Too Many Requests",
  "error": "rate_limit_exceeded"
}
```

---

## Test Results

### Final Test Suite Status
```bash
45 passed in 1.08s
```

**Test Breakdown:**
- `test_main.py`: 13 tests (3 original + **10 new mocked tests**)
- `test_ai_service.py`: 20 tests (existing AI service mocks)
- `test_trips.py`: 7 tests (database operations, no external calls)
- `test_vehicle_service.py`: 5 tests (vehicle specs with AI fallback)

**Zero Network Calls:** All external API calls successfully mocked

---

## Files Created/Modified

### Created (11 files)
```
backend/tests/fixtures/
├── mapbox_geocode.json
├── mapbox_geocode_error.json
├── mapbox_directions.json
├── mapbox_directions_error.json
├── mapbox_optimize.json
├── mapbox_optimize_error.json
├── azure_maps_search.json
├── azure_maps_search_error.json
├── ai_service_vehicle.json
└── ai_service_vehicle_error.json

backend/tests/
└── conftest.py (NEW - 280 lines of shared fixtures)
```

### Modified (2 files)
```
backend/tests/test_main.py
  - Added 10 new tests (lines 27-123)
  - All tests use shared fixtures from conftest.py

.github/workflows/backend.yml
  - Removed continue-on-error: true (line 44)
```

---

## Key Learnings

### 1. **Mock Pattern Consistency**
- Always follow existing patterns (`test_ai_service.py` as reference)
- Use `unittest.mock.patch` for `httpx.AsyncClient` (not `pytest-httpx` library)
- Separate data fixtures from mock client fixtures

### 2. **Realistic Fixtures Matter**
- Use actual API response structure (from API docs or captured responses)
- Include all required fields (geometry, coordinates, addresses)
- Test both success AND error responses

### 3. **GeoJSON Coordinate Order**
- **Critical**: GeoJSON spec is `[longitude, latitude]` NOT `[lat, lng]`
- Azure Maps returns `{lat, lon}` → Transform to `[lon, lat]` for frontend
- Test fixtures verify coordinate order transformation

### 4. **Error Code Coverage**
Each external API should have error test for common failures:
- **400 Bad Request**: Invalid input (coordinates, query params)
- **401 Unauthorized**: Missing/invalid API key
- **422 Unprocessable Entity**: Validation errors (e.g., too few coordinates)
- **429 Too Many Requests**: Rate limiting
- **503 Service Unavailable**: Backend service down

### 5. **CI/CD Safety**
- **Never** use `continue-on-error: true` for test steps
- Tests should **fail the build** when they fail
- Use mocks to ensure tests are deterministic (no flaky network failures)

---

## Future Maintenance

### Adding New External API Tests
1. **Create fixtures** in `backend/tests/fixtures/`:
   ```bash
   # Success response
   touch backend/tests/fixtures/new_api_success.json
   
   # Error response (choose appropriate HTTP code)
   touch backend/tests/fixtures/new_api_error.json
   ```

2. **Add fixtures in conftest.py**:
   ```python
   @pytest.fixture
   def new_api_success():
       return load_fixture("new_api_success.json")
   
   @pytest.fixture
   def mock_httpx_new_api_success(new_api_success):
       # Mock httpx.AsyncClient pattern
   ```

3. **Write tests in test_main.py**:
   ```python
   def test_new_api_success(mock_httpx_new_api_success):
       response = client.get("/api/new-endpoint")
       assert response.status_code == 200
       # Assert response data
   
   def test_new_api_error(mock_httpx_new_api_error):
       response = client.get("/api/new-endpoint")
       assert response.status_code == 503  # Or appropriate error code
   ```

### Updating Existing Fixtures
If external APIs change their response format:
1. Update JSON files in `backend/tests/fixtures/`
2. Run tests: `pytest tests/test_main.py -v`
3. Update assertions if response structure changed

### Running Tests Locally
```bash
cd backend
source venv/bin/activate
pip install pytest pytest-asyncio

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_main.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html
```

---

## Dependencies

### Required Python Packages
```txt
pytest>=7.0
pytest-asyncio>=0.21
httpx>=0.24  # For async HTTP client
```

### Mock Library
- `unittest.mock` (Python standard library - no extra install needed)
- **Not used**: pytest-httpx, responses (chose stdlib approach)

---

## Next Steps

### Immediate (Post-Merge)
- [ ] Verify CI/CD pipeline passes on GitHub Actions
- [ ] Monitor for any flaky tests in next 5 builds
- [ ] Update `docs/PROJECT_INSTRUCTIONS.md` testing section

### Future Enhancements
- [ ] Add coverage reporting to CI (pytest-cov)
- [ ] Mock Google OAuth tests (`/auth/google` endpoint)
- [ ] Split `test_main.py` into separate files when it grows beyond 200 lines
  - `tests/api/test_geocoding.py`
  - `tests/api/test_directions.py`
  - `tests/api/test_search.py`

### Related Issues
- **Issue #5**: Store Route GeoJSON (depends on working test suite)
- **Issue #10**: Monitoring & Health Checks (will add integration tests)

---

## References
- **GitHub Issue**: #4 - Add Backend API Mocking for External Services
- **Plan Document**: `untitled:plan-mockExternalApisBackendTests.prompt.md`
- **Test Files**: `backend/tests/test_main.py`, `backend/tests/conftest.py`
- **Fixtures**: `backend/tests/fixtures/*.json`
- **CI Config**: `.github/workflows/backend.yml`

---

**Status**: ✅ **COMPLETE** - All acceptance criteria met, 45/45 tests passing
