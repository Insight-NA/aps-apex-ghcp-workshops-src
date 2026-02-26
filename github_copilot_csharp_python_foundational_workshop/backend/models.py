from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    is_guest = Column(Boolean, default=False)
    guest_id = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    refresh_token = Column(String, nullable=True)  # Hashed refresh token
    refresh_token_expires = Column(DateTime, nullable=True)  # Expiry timestamp
    
    trips = relationship("Trip", back_populates="owner")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    stops = Column(JSON)
    vehicle_specs = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    distance_miles = Column(Integer, nullable=True)
    route_geojson = Column(JSON, nullable=True)

    owner = relationship("User", back_populates="trips")

class VehicleSpec(Base):
    __tablename__ = "vehicle_specs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_type = Column(String, unique=True, index=True)
    height = Column(Float)
    width = Column(Float)
    weight = Column(Float)
    range = Column(Integer)
    fuel_type = Column(String)
    mpg = Column(Integer)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
