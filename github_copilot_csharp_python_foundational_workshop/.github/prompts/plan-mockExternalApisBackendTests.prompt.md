## Plan: Mock External APIs in Backend Tests (Issue #4) - Final

Mock 5 httpx-based external API endpoints using `unittest.mock.patch`, with JSON fixtures in separate files, keeping tests in `test_main.py`, and including error response test cases.

### Steps

1. **Create fixture directory and JSON files** in `backend/tests/fixtures/`:
   - `mapbox_geocode.json` + `mapbox_geocode_error.json`
   - `mapbox_directions.json` + `mapbox_directions_error.json`
   - `mapbox_optimize.json` + `mapbox_optimize_error.json`
   - `azure_maps_search.json` + `azure_maps_search_error.json`
   - `ai_service_vehicle.json` + `ai_service_vehicle_error.json`

2. **Create [backend/tests/conftest.py](backend/tests/conftest.py)** with:
   - Fixture loader helper to read JSON files
   - `@pytest.fixture` for each mock response (success + error variants)
   - Shared `httpx.AsyncClient` patching utilities following [test_ai_service.py](backend/tests/test_ai_service.py) pattern

3. **Update [backend/tests/test_main.py](backend/tests/test_main.py)** with mocked tests:
   - `test_geocode_success` + `test_geocode_error`
   - `test_directions_success` + `test_directions_error`
   - `test_optimize_success` + `test_optimize_error`
   - `test_search_success` + `test_search_error`
   - `test_vehicle_specs_success` + `test_vehicle_specs_error`

4. **Remove `continue-on-error: true`** from [.github/workflows/backend.yml](.github/workflows/backend.yml#L44)

5. **Verify locally** with `pytest -v` (ensure all tests pass without network)

### Files to Create
| File | Purpose |
|------|---------|
| `backend/tests/fixtures/mapbox_geocode.json` | Success response for geocoding |
| `backend/tests/fixtures/mapbox_geocode_error.json` | 429 rate limit response |
| `backend/tests/fixtures/mapbox_directions.json` | Success response for directions |
| `backend/tests/fixtures/mapbox_directions_error.json` | 400 bad request response |
| `backend/tests/fixtures/mapbox_optimize.json` | Success response for optimization |
| `backend/tests/fixtures/mapbox_optimize_error.json` | 422 validation error response |
| `backend/tests/fixtures/azure_maps_search.json` | Success response for POI search |
| `backend/tests/fixtures/azure_maps_search_error.json` | 401 unauthorized response |
| `backend/tests/fixtures/ai_service_vehicle.json` | Success response for vehicle parsing |
| `backend/tests/fixtures/ai_service_vehicle_error.json` | 500 service unavailable response |
| `backend/tests/conftest.py` | Shared fixtures and mock utilities |

### Files to Modify
| File | Change |
|------|--------|
| `backend/tests/test_main.py` | Add ~10 new tests with mocked external calls |
| `.github/workflows/backend.yml` | Remove `continue-on-error: true` at line 44 |

### Scope Excluded (Future Work)
- Google OAuth mocking (`/auth/google`) - uses library call, not httpx
- Splitting tests into separate files - keep in `test_main.py` until it grows
