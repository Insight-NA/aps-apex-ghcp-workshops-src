"""Service module for vehicle specifications management"""
from typing import Optional
from schemas import VehicleSpecsResponse
import ai_service

# Default vehicle specifications (fallback when AI unavailable)
DEFAULT_VEHICLE_SPECS = {
    "car": {
        "height": 1.5, "width": 1.8, "length": 4.5, "weight": 1.5,
        "fuelType": "gas", "range": 400, "mpg": 30.0
    },
    "suv": {
        "height": 1.7, "width": 2.0, "length": 4.8, "weight": 2.0,
        "fuelType": "gas", "range": 350, "mpg": 22.0
    },
    "mini_van": {
        "height": 1.8, "width": 2.0, "length": 5.1, "weight": 2.1,
        "fuelType": "gas", "range": 400, "mpg": 24.0
    },
    "van": {
        "height": 2.5, "width": 2.2, "length": 5.5, "weight": 3.0,
        "fuelType": "gas", "range": 300, "mpg": 18.0
    },
    "truck": {
        "height": 3.5, "width": 2.5, "length": 8.0, "weight": 8.0,
        "fuelType": "diesel", "range": 600, "mpg": 8.0
    },
    "rv_small": {
        "height": 3.2, "width": 2.4, "length": 7.0, "weight": 5.0,
        "fuelType": "gas", "range": 250, "mpg": 12.0
    },
    "rv_large": {
        "height": 3.8, "width": 2.6, "length": 10.0, "weight": 12.0,
        "fuelType": "diesel", "range": 400, "mpg": 6.0
    },
    "ev_sedan": {
        "height": 1.5, "width": 1.9, "length": 4.7, "weight": 2.2,
        "fuelType": "electric", "range": 300, "mpg": 110.0
    },
    "ev_truck": {
        "height": 1.8, "width": 2.1, "length": 5.8, "weight": 3.5,
        "fuelType": "electric", "range": 320, "mpg": 70.0
    },
}


def get_vehicle_specs(vehicle_type: str) -> VehicleSpecsResponse:
    """
    Get vehicle specifications with AI-first approach and fallback to defaults.
    
    Args:
        vehicle_type: Vehicle type identifier (e.g., 'car', 'rv_large', 'ev_sedan')
    
    Returns:
        VehicleSpecsResponse with specifications
    """
    # Try AI first (NOTE: AI service call is now async but we need sync for this endpoint)
    # TODO: Refactor this endpoint to be async or use asyncio.run()
    # For now, use default specs - full async implementation needed
    import asyncio
    
    try:
        # Run async function in sync context
        ai_specs = asyncio.run(ai_service.get_vehicle_specs_from_ai(vehicle_type))
        if ai_specs:
            return VehicleSpecsResponse(**ai_specs)
    except Exception as e:
        print(f"AI service call failed: {e}")
    
    # Fallback to default specs
    v_type = vehicle_type.lower()
    specs_dict = DEFAULT_VEHICLE_SPECS.get(v_type, DEFAULT_VEHICLE_SPECS["car"])
    
    return VehicleSpecsResponse(**specs_dict)
