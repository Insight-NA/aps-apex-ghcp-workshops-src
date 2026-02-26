import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Road Trip Planner API"}

def test_get_vehicle_specs():
    response = client.post("/api/vehicle-specs", json={"type": "rv_large"})
    assert response.status_code == 200
    data = response.json()
    assert data["height"] == 3.8
    assert data["fuelType"] == "diesel"

def test_get_vehicle_specs_invalid():
    # Should return default car specs for unknown type
    response = client.post("/api/vehicle-specs", json={"type": "spaceship"})
    assert response.status_code == 200
    data = response.json()
    assert data["height"] == 1.5 # Car default


# ============================================================================
# External API Mocked Tests (Issue #4)
# ============================================================================

def test_geocode_success(mock_httpx_geocode_success):
    """Should successfully geocode an address using mocked Mapbox API"""
    response = client.get("/api/geocode?q=San Francisco")
    assert response.status_code == 200
    data = response.json()
    assert "coordinates" in data
    assert "place_name" in data
    assert data["coordinates"] == [-122.4194, 37.7749]
    assert "San Francisco" in data["place_name"]


def test_geocode_error(mock_httpx_geocode_error):
    """Should handle geocode API error (429 rate limit)"""
    response = client.get("/api/geocode?q=San Francisco")
    assert response.status_code == 429


def test_directions_success(mock_httpx_directions_success):
    """Should successfully get directions using mocked Mapbox API"""
    coords = "-122.4194,37.7749;-122.0838,37.3861"
    response = client.get(f"/api/directions?coords={coords}&profile=driving")
    assert response.status_code == 200
    data = response.json()
    assert "distance" in data
    assert "duration" in data
    assert "geometry" in data
    assert data["distance"] == 48762.3
    assert data["duration"] == 2698.5


def test_directions_error(mock_httpx_directions_error):
    """Should handle directions API error (400 bad request)"""
    coords = "-122.4194,91.7749;-122.0838,37.3861"  # Invalid latitude
    response = client.get(f"/api/directions?coords={coords}")
    assert response.status_code == 400


def test_optimize_success(mock_httpx_optimize_success):
    """Should successfully optimize route using mocked Mapbox API"""
    coords = "-122.4194,37.7749;-122.1598,37.4419;-122.0838,37.3861"
    response = client.get(f"/api/optimize?coords={coords}")
    assert response.status_code == 200
    data = response.json()
    assert "trips" in data
    assert "waypoints" in data
    assert len(data["trips"]) > 0
    assert data["code"] == "Ok"


def test_optimize_error(mock_httpx_optimize_error):
    """Should handle optimize API error (422 validation)"""
    # Single coordinate (invalid - needs at least 2)
    coords = "-122.4194,37.7749"
    response = client.get(f"/api/optimize?coords={coords}")
    assert response.status_code == 422


def test_search_success(mock_httpx_search_success):
    """Should successfully search POIs using mocked Azure Maps API"""
    response = client.get("/api/search?query=coffee&proximity=-122.4094,37.7819")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert len(data["features"]) == 3
    # Verify GeoJSON transformation
    first_feature = data["features"][0]
    assert first_feature["type"] == "Feature"
    assert first_feature["text"] == "Blue Bottle Coffee"
    assert first_feature["geometry"]["type"] == "Point"
    # Verify coordinate order (lng, lat per GeoJSON spec)
    assert first_feature["geometry"]["coordinates"] == [-122.4094, 37.7819]


def test_search_error(mock_httpx_search_error):
    """Should handle search API error (401 unauthorized)"""
    response = client.get("/api/search?query=coffee")
    assert response.status_code == 401


def test_vehicle_specs_with_ai_success(mock_httpx_ai_success):
    """Should get vehicle specs from AI service successfully"""
    response = client.post("/api/vehicle-specs", json={"type": "Class A Motorhome 40ft"})
    assert response.status_code == 200
    data = response.json()
    # Should use AI-parsed specs
    assert data["height"] == pytest.approx(3.8)
    assert data["width"] == pytest.approx(2.6)
    assert data["weight"] == pytest.approx(12.0)  # Converted to tonnes


def test_vehicle_specs_with_ai_error(mock_httpx_ai_error):
    """Should fallback to defaults when AI service fails (503)"""
    response = client.post("/api/vehicle-specs", json={"type": "unknown custom vehicle"})
    assert response.status_code == 200
    data = response.json()
    # Should return default car specs as fallback
    assert data["height"] == 1.5
    assert data["fuelType"] == "gas"

