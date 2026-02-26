from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import models, schemas, database, auth, ai_service, vehicle_service

# Load environment variables
load_dotenv()

# Create Database Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# CORS configuration - support multiple origins for local dev and Azure deployment
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints for Azure App Service
@app.get("/health")
def health_check():
    """Basic health check endpoint for Azure App Service health probes"""
    return {"status": "healthy", "service": "road-trip-planner-api"}

@app.get("/api/health")
def api_health_check(db: Session = Depends(get_db)):
    """Detailed health check including database connectivity"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "road-trip-planner-api",
        "database": db_status,
        "version": "1.0.0"
    }

class VehicleTypeRequest(BaseModel):
    type: str

class GoogleAuthRequest(BaseModel):
    token: str

@app.post("/api/auth/google", response_model=schemas.Token)
def google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Verify Google Token
    # For development/demo purposes, if token is "MOCK_TOKEN", we create a mock user
    if request.token == "MOCK_TOKEN":
        email = "demo@example.com"
        google_id = "mock_google_id"
    else:
        id_info = auth.verify_google_token(request.token)
        if not id_info:
            raise HTTPException(status_code=400, detail="Invalid Google Token")
        email = id_info['email']
        google_id = id_info['sub']

    # Check if user exists
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(email=email, google_id=google_id, is_guest=False)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create Access Token and Refresh Token
    access_token = auth.create_access_token(data={"sub": user.email})
    refresh_token = auth.create_refresh_token()
    
    # Store hashed refresh token in database
    from datetime import datetime, timedelta, UTC
    user.refresh_token = auth.hash_token(refresh_token)
    user.refresh_token_expires = datetime.now(UTC) + timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": email.split("@")[0],
            "is_guest": False
        }
    }

@app.post("/api/auth/guest", response_model=schemas.Token)
def guest_login(db: Session = Depends(get_db)):
    """
    Create a guest user session without authentication.
    Guest users can use the app but data may be cleaned up after 48 hours.
    """
    import uuid
    
    # Generate unique guest ID
    guest_id = f"guest_{uuid.uuid4().hex[:12]}"
    guest_email = f"{guest_id}@guest.roadtrip.app"
    
    # Create guest user
    user = models.User(
        email=guest_email,
        google_id=None,
        is_guest=True,
        guest_id=guest_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create Access Token and Refresh Token
    access_token = auth.create_access_token(data={"sub": user.email})
    refresh_token = auth.create_refresh_token()
    
    # Store hashed refresh token in database
    from datetime import datetime, timedelta, UTC
    user.refresh_token = auth.hash_token(refresh_token)
    user.refresh_token_expires = datetime.now(UTC) + timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": guest_email,
            "name": "Guest User",
            "is_guest": True
        }
    }

@app.post("/api/auth/refresh", response_model=schemas.Token)
def refresh_token(request: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Exchange a refresh token for a new access token and refresh token.
    Implements token rotation for enhanced security.
    """
    from datetime import datetime, UTC
    
    # Find user with matching refresh token hash
    hashed_token = auth.hash_token(request.refresh_token)
    user = db.query(models.User).filter(
        models.User.refresh_token == hashed_token
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Check if refresh token is expired
    if not user.refresh_token_expires or user.refresh_token_expires < datetime.now(UTC):
        raise HTTPException(status_code=401, detail="Refresh token expired")
    
    # Create new access token and refresh token (token rotation)
    new_access_token = auth.create_access_token(data={"sub": user.email})
    new_refresh_token = auth.create_refresh_token()
    
    # Update user's refresh token in database
    user.refresh_token = auth.hash_token(new_refresh_token)
    user.refresh_token_expires = datetime.now(UTC) + timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.email.split("@")[0],
            "is_guest": user.is_guest
        }
    }

@app.post("/api/auth/logout")
def logout(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Logout user by revoking their refresh token.
    """
    current_user.refresh_token = None
    current_user.refresh_token_expires = None
    db.commit()
    
    return {"message": "Successfully logged out"}

@app.get("/")
def read_root():
    return {"message": "Road Trip Planner API"}

@app.post("/api/vehicle-specs", response_model=schemas.VehicleSpecsResponse)
def get_vehicle_specs_endpoint(request: VehicleTypeRequest):
    """
    Get vehicle specifications using AI with fallback to defaults.
    """
    return vehicle_service.get_vehicle_specs(request.type)

@app.get("/api/geocode")
async def geocode_address(q: str):
    """
    Geocode an address using Mapbox Geocoding API.
    q: address query string
    """
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{q}.json?access_token={token}&limit=1"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Geocoding failed")
        
        data = resp.json()
        if not data.get('features') or len(data['features']) == 0:
            raise HTTPException(status_code=404, detail="Address not found")
        
        feature = data['features'][0]
        return {
            "coordinates": feature['geometry']['coordinates'],
            "place_name": feature['place_name']
        }

@app.get("/api/directions")
async def get_directions(coords: str, profile: str = "driving"):
    """
    Proxy request to Mapbox Directions API.
    coords format: "lng,lat;lng,lat"
    """
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    
    # Mapbox Directions API
    url = f"https://api.mapbox.com/directions/v5/mapbox/{profile}/{coords}?geometries=geojson&overview=full&steps=true&access_token={token}"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code != 200:
             raise HTTPException(status_code=resp.status_code, detail=resp.text)
        
        data = resp.json()
        if not data.get('routes'):
             return {"distance": 0, "duration": 0, "geometry": None}
             
        route = data['routes'][0]
        return {
            "distance": route['distance'],
            "duration": route['duration'],
            "geometry": route['geometry'],
            "legs": route['legs']
        }

@app.get("/api/search")
async def search_places(query: str, proximity: str = None):
    """
    Proxy request to Azure Maps Fuzzy Search API for POI search.
    proximity: "lng,lat" format from frontend
    """
    azure_key = os.getenv("AZURE_MAPS_KEY")
    if not azure_key:
        raise HTTPException(status_code=500, detail="Azure Maps key not configured")
    
    # Parse proximity parameter (lng,lat → lat, lon for Azure Maps)
    lat, lon = None, None
    if proximity:
        try:
            coords = proximity.split(',')
            lon = float(coords[0])  # Longitude first in input
            lat = float(coords[1])  # Latitude second in input
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="Invalid proximity format")
    
    # Azure Maps Fuzzy Search API
    url = "https://atlas.microsoft.com/search/fuzzy/json"
    params = {
        "api-version": "1.0",
        "query": query,
        "limit": 10,
        "subscription-key": azure_key
    }
    
    if lat and lon:
        params["lat"] = lat
        params["lon"] = lon
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        
        azure_data = resp.json()
        
        # Transform Azure Maps response to Mapbox-compatible GeoJSON format
        features = []
        for result in azure_data.get("results", []):
            poi = result.get("poi", {})
            address = result.get("address", {})
            position = result.get("position", {})
            
            feature = {
                "id": result.get("id"),
                "type": "Feature",
                "text": poi.get("name", "Unknown"),
                "place_name": address.get("freeformAddress", "Unknown"),
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        position.get("lon"),  # Longitude first (GeoJSON spec)
                        position.get("lat")   # Latitude second (GeoJSON spec)
                    ]
                }
            }
            features.append(feature)
        
        return {"features": features}

@app.get("/api/optimize")
async def optimize_route(coords: str):
    """
    Proxy request to Mapbox Optimization API.
    coords: "lng,lat;lng,lat;..."
    """
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token not configured")
    
    # source=first, destination=last ensures start and end points remain fixed
    url = f"https://api.mapbox.com/optimized-trips/v1/mapbox/driving/{coords}?access_token={token}&source=first&destination=last&roundtrip=false&geometries=geojson"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        if resp.status_code != 200:
             raise HTTPException(status_code=resp.status_code, detail=resp.text)
        
        return resp.json()

@app.post("/api/trips", response_model=schemas.Trip)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_trip = models.Trip(
        name=trip.name, 
        stops=trip.stops, 
        vehicle_specs=trip.vehicle_specs,
        user_id=current_user.id,
        is_public=trip.is_public,
        description=trip.description,
        image_url=trip.image_url,
        distance_miles=trip.distance_miles,
        route_geojson=trip.route_geojson
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@app.get("/api/trips", response_model=list[schemas.Trip])
def read_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trips = db.query(models.Trip).filter(models.Trip.user_id == current_user.id).offset(skip).limit(limit).all()
    return trips

@app.get("/api/trips/{trip_id}", response_model=schemas.Trip)
def read_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.user_id == current_user.id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@app.put("/api/trips/{trip_id}", response_model=schemas.Trip)
def update_trip(trip_id: int, trip_update: schemas.TripUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.user_id == current_user.id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip_update.is_public is not None:
        trip.is_public = trip_update.is_public
    if trip_update.description is not None:
        trip.description = trip_update.description
    if trip_update.image_url is not None:
        trip.image_url = trip_update.image_url
    # Only admins can set is_featured - for now, we'll skip this check
    if trip_update.is_featured is not None:
        trip.is_featured = trip_update.is_featured
    
    db.commit()
    db.refresh(trip)
    return trip

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.user_id == current_user.id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"ok": True}

@app.get("/api/public-trips", response_model=list[schemas.Trip])
def read_public_trips(skip: int = 0, limit: int = 100, featured_only: bool = False, db: Session = Depends(get_db)):
    """Get public trips, optionally filtered to featured trips only."""
    query = db.query(models.Trip).filter(models.Trip.is_public == True)
    if featured_only:
        query = query.filter(models.Trip.is_featured == True)
    trips = query.order_by(models.Trip.created_at.desc()).offset(skip).limit(limit).all()
    return trips
