import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from main import app, get_db, get_current_user
import models

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_user():
    return models.User(id=1, email="test@example.com")

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

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
    assert data["name"] == "Test Trip"
    assert data["id"] is not None

def test_read_trips(setup_db):
    response = client.get("/api/trips")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0


# Issue #5: Route GeoJSON Storage Tests

def test_create_trip_with_route_geojson(setup_db):
    """Test that route_geojson is properly stored when creating a trip"""
    route_geojson = {
        "type": "LineString",
        "coordinates": [
            [-122.4194, 37.7749],  # San Francisco
            [-122.4084, 37.7849],
            [-122.3974, 37.7949]
        ],
        "properties": {
            "distance": 1234.5,
            "duration": 600
        }
    }
    
    response = client.post(
        "/api/trips",
        json={
            "name": "SF Bay Tour",
            "stops": [
                {"id": "1", "name": "Start", "coordinates": [-122.4194, 37.7749], "type": "start"},
                {"id": "2", "name": "End", "coordinates": [-122.3974, 37.7949], "type": "end"}
            ],
            "vehicle_specs": {"height": 1.5, "weight": 1.5},
            "route_geojson": route_geojson
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SF Bay Tour"
    assert data["route_geojson"] is not None
    assert data["route_geojson"]["type"] == "LineString"
    assert len(data["route_geojson"]["coordinates"]) == 3
    assert data["route_geojson"]["coordinates"][0] == [-122.4194, 37.7749]
    assert data["route_geojson"]["properties"]["distance"] == 1234.5


def test_create_trip_without_route_geojson(setup_db):
    """Test that route_geojson can be null when not provided"""
    response = client.post(
        "/api/trips",
        json={
            "name": "Trip Without Route",
            "stops": [{"id": "1", "name": "Start", "coordinates": [0, 0], "type": "start"}],
            "vehicle_specs": {"height": 3.5}
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["route_geojson"] is None


def test_retrieve_trip_with_route_geojson(setup_db):
    """Test that stored route_geojson is correctly retrieved"""
    # Create trip with route
    route_geojson = {
        "type": "LineString",
        "coordinates": [[-118.2437, 34.0522], [-117.1611, 32.7157]],  # LA to SD
    }
    
    create_response = client.post(
        "/api/trips",
        json={
            "name": "LA to SD",
            "stops": [
                {"id": "1", "name": "LA", "coordinates": [-118.2437, 34.0522], "type": "start"},
                {"id": "2", "name": "SD", "coordinates": [-117.1611, 32.7157], "type": "end"}
            ],
            "vehicle_specs": {"height": 1.8},
            "route_geojson": route_geojson
        },
    )
    
    trip_id = create_response.json()["id"]
    
    # Retrieve the trip
    get_response = client.get(f"/api/trips/{trip_id}")
    assert get_response.status_code == 200
    
    data = get_response.json()
    assert data["route_geojson"] is not None
    assert data["route_geojson"]["type"] == "LineString"
    assert data["route_geojson"]["coordinates"] == route_geojson["coordinates"]


def test_complex_geojson_with_multiple_segments(setup_db):
    """Test complex GeoJSON with multiple route segments"""
    complex_route = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[-122.4, 37.8], [-122.3, 37.9]]
                },
                "properties": {"segment": 1, "distance": 500}
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[-122.3, 37.9], [-122.2, 38.0]]
                },
                "properties": {"segment": 2, "distance": 600}
            }
        ]
    }
    
    response = client.post(
        "/api/trips",
        json={
            "name": "Multi-Segment Trip",
            "stops": [
                {"id": "1", "name": "A", "coordinates": [-122.4, 37.8], "type": "start"},
                {"id": "2", "name": "B", "coordinates": [-122.3, 37.9], "type": "stop"},
                {"id": "3", "name": "C", "coordinates": [-122.2, 38.0], "type": "end"}
            ],
            "vehicle_specs": {"height": 2.0},
            "route_geojson": complex_route
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["route_geojson"]["type"] == "FeatureCollection"
    assert len(data["route_geojson"]["features"]) == 2
    assert data["route_geojson"]["features"][0]["properties"]["segment"] == 1


def test_route_geojson_persists_across_retrieval(setup_db):
    """Test that route_geojson data integrity is maintained"""
    original_geojson = {
        "type": "LineString",
        "coordinates": [
            [-122.4194, 37.7749],
            [-122.4084, 37.7849],
            [-122.3974, 37.7949],
            [-122.3864, 37.8049]
        ],
        "properties": {
            "distance": 2500.75,
            "duration": 1200,
            "traffic": "moderate",
            "waypoints": ["A", "B", "C", "D"]
        }
    }
    
    # Create
    create_resp = client.post(
        "/api/trips",
        json={
            "name": "Data Integrity Test",
            "stops": [{"id": "1", "name": "S", "coordinates": [0, 0], "type": "start"}],
            "vehicle_specs": {"height": 1.5},
            "route_geojson": original_geojson
        },
    )
    trip_id = create_resp.json()["id"]
    
    # Retrieve
    get_resp = client.get(f"/api/trips/{trip_id}")
    retrieved_geojson = get_resp.json()["route_geojson"]
    
    # Verify exact match
    assert retrieved_geojson == original_geojson
    assert retrieved_geojson["properties"]["waypoints"] == ["A", "B", "C", "D"]
    assert retrieved_geojson["properties"]["distance"] == 2500.75
