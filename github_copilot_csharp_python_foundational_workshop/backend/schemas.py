from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import List, Optional, Any, Tuple
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    google_id: str

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserInfo(BaseModel):
    id: str
    email: str
    name: str
    is_guest: bool = False
    picture: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    user: Optional[UserInfo] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TripBase(BaseModel):
    name: str
    stops: List[Any]
    vehicle_specs: Any

class TripCreate(TripBase):
    is_public: Optional[bool] = False
    description: Optional[str] = None
    image_url: Optional[str] = None
    distance_miles: Optional[int] = None
    route_geojson: Optional[dict] = None

class TripUpdate(BaseModel):
    is_public: Optional[bool] = None
    is_featured: Optional[bool] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class Trip(TripBase):
    id: int
    user_id: int
    is_public: bool = False
    is_featured: bool = False
    created_at: Optional[datetime] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    distance_miles: Optional[int] = None
    route_geojson: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

class VehicleSpecBase(BaseModel):
    vehicle_type: str
    height: float
    width: float
    weight: float
    range: int
    fuel_type: str
    mpg: int

class VehicleSpecCreate(VehicleSpecBase):
    pass

class VehicleSpec(VehicleSpecBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class VehicleSpecsResponse(BaseModel):
    """Response model for /api/vehicle-specs endpoint matching AI service output"""
    height: float          # meters
    width: float           # meters
    length: Optional[float] = None  # meters (AI returns this, fallback may not have it)
    weight: float          # tonnes
    fuelType: str          # "gas" | "diesel" | "electric" (camelCase to match frontend)
    range: int             # miles
    mpg: float             # miles per gallon (or MPGe for electric)

class POIResponse(BaseModel):
    """Response model for Point of Interest from Azure Maps API"""
    name: str = Field(..., max_length=200, description="POI name")
    category: str = Field(..., description="POI category (e.g., gas_station, restaurant)")
    address: Optional[str] = Field(None, description="Street address")
    coordinates: Tuple[float, float] = Field(..., description="(longitude, latitude) tuple")
    distance: Optional[float] = Field(None, ge=0, description="Distance in meters from user")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Rating from 0.0 to 5.0")
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, v: Tuple[float, float]) -> Tuple[float, float]:
        """Validate longitude and latitude ranges"""
        longitude, latitude = v
        if not -180 <= longitude <= 180:
            raise ValueError(f"Longitude must be between -180 and 180, got {longitude}")
        if not -90 <= latitude <= 90:
            raise ValueError(f"Latitude must be between -90 and 90, got {latitude}")
        return v
