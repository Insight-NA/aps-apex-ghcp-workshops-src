"""Shared test fixtures and utilities for backend tests"""
import json
import pytest
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch
import httpx


# Fixture directory path
FIXTURES_DIR = Path(__file__).parent / "fixtures"


def load_fixture(filename: str) -> dict:
    """Load JSON fixture file from tests/fixtures/ directory"""
    fixture_path = FIXTURES_DIR / filename
    if not fixture_path.exists():
        raise FileNotFoundError(f"Fixture file not found: {fixture_path}")
    
    with open(fixture_path, 'r') as f:
        return json.load(f)


# ============================================================================
# Mapbox Geocode Fixtures
# ============================================================================

@pytest.fixture
def mapbox_geocode_success():
    """Mock successful Mapbox geocoding API response"""
    return load_fixture("mapbox_geocode.json")


@pytest.fixture
def mapbox_geocode_error():
    """Mock error Mapbox geocoding API response (429 rate limit)"""
    return load_fixture("mapbox_geocode_error.json")


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


@pytest.fixture
def mock_httpx_geocode_error(mapbox_geocode_error):
    """Mock httpx.AsyncClient for geocode error (429)"""
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_response.json.return_value = mapbox_geocode_error
    mock_response.text = json.dumps(mapbox_geocode_error)
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


# ============================================================================
# Mapbox Directions Fixtures
# ============================================================================

@pytest.fixture
def mapbox_directions_success():
    """Mock successful Mapbox directions API response"""
    return load_fixture("mapbox_directions.json")


@pytest.fixture
def mapbox_directions_error():
    """Mock error Mapbox directions API response (400 bad request)"""
    return load_fixture("mapbox_directions_error.json")


@pytest.fixture
def mock_httpx_directions_success(mapbox_directions_success):
    """Mock httpx.AsyncClient for successful directions request"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mapbox_directions_success
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


@pytest.fixture
def mock_httpx_directions_error(mapbox_directions_error):
    """Mock httpx.AsyncClient for directions error (400)"""
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.json.return_value = mapbox_directions_error
    mock_response.text = json.dumps(mapbox_directions_error)
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


# ============================================================================
# Mapbox Optimize Fixtures
# ============================================================================

@pytest.fixture
def mapbox_optimize_success():
    """Mock successful Mapbox optimization API response"""
    return load_fixture("mapbox_optimize.json")


@pytest.fixture
def mapbox_optimize_error():
    """Mock error Mapbox optimization API response (422 validation)"""
    return load_fixture("mapbox_optimize_error.json")


@pytest.fixture
def mock_httpx_optimize_success(mapbox_optimize_success):
    """Mock httpx.AsyncClient for successful optimize request"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mapbox_optimize_success
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


@pytest.fixture
def mock_httpx_optimize_error(mapbox_optimize_error):
    """Mock httpx.AsyncClient for optimize error (422)"""
    mock_response = MagicMock()
    mock_response.status_code = 422
    mock_response.json.return_value = mapbox_optimize_error
    mock_response.text = json.dumps(mapbox_optimize_error)
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


# ============================================================================
# Azure Maps Search Fixtures
# ============================================================================

@pytest.fixture
def azure_maps_search_success():
    """Mock successful Azure Maps search API response"""
    return load_fixture("azure_maps_search.json")


@pytest.fixture
def azure_maps_search_error():
    """Mock error Azure Maps search API response (401 unauthorized)"""
    return load_fixture("azure_maps_search_error.json")


@pytest.fixture
def mock_httpx_search_success(azure_maps_search_success):
    """Mock httpx.AsyncClient for successful Azure Maps search request"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = azure_maps_search_success
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


@pytest.fixture
def mock_httpx_search_error(azure_maps_search_error):
    """Mock httpx.AsyncClient for Azure Maps search error (401)"""
    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.json.return_value = azure_maps_search_error
    mock_response.text = json.dumps(azure_maps_search_error)
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


# ============================================================================
# AI Service Vehicle Specs Fixtures
# ============================================================================

@pytest.fixture
def ai_service_vehicle_success():
    """Mock successful AI service vehicle specs response"""
    return load_fixture("ai_service_vehicle.json")


@pytest.fixture
def ai_service_vehicle_error():
    """Mock error AI service response (503 service unavailable)"""
    return load_fixture("ai_service_vehicle_error.json")


@pytest.fixture
def mock_httpx_ai_success(ai_service_vehicle_success):
    """Mock httpx.AsyncClient for successful AI service request"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = ai_service_vehicle_success
    mock_response.raise_for_status = MagicMock()
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            return_value=mock_response
        )
        yield mock_client


@pytest.fixture
def mock_httpx_ai_error():
    """Mock httpx.AsyncClient for AI service error (503)"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            side_effect=httpx.HTTPStatusError(
                "503 Service Unavailable",
                request=MagicMock(),
                response=MagicMock(status_code=503)
            )
        )
        yield mock_client
