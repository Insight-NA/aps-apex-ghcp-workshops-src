"""Tests for vehicle_service module"""
import pytest
from unittest.mock import patch
from vehicle_service import get_vehicle_specs, DEFAULT_VEHICLE_SPECS
from schemas import VehicleSpecsResponse


class TestGetVehicleSpecs:
    """Test suite for get_vehicle_specs function"""

    def test_returns_known_vehicle_type(self):
        """Should return specs for known vehicle type when AI unavailable"""
        with patch('vehicle_service.ai_service.get_vehicle_specs_from_ai', return_value=None):
            result = get_vehicle_specs("rv_large")

            assert isinstance(result, VehicleSpecsResponse)
            assert result.height == pytest.approx(3.8)
            assert result.width == pytest.approx(2.6)
            assert result.length == pytest.approx(10.0)
            assert result.weight == pytest.approx(12.0)
            assert result.fuelType == "diesel"
            assert result.range == 400
            assert result.mpg == pytest.approx(6.0)

    def test_returns_car_specs_for_unknown_type(self):
        """Should fallback to 'car' specs for unknown vehicle types"""
        with patch('vehicle_service.ai_service.get_vehicle_specs_from_ai', return_value=None):
            result = get_vehicle_specs("spaceship")

            assert isinstance(result, VehicleSpecsResponse)
            assert result.height == pytest.approx(1.5)  # car specs
            assert result.fuelType == "gas"
            assert result.mpg == pytest.approx(30.0)

    def test_uses_ai_response_when_available(self):
        """Should prefer AI-generated specs over fallback"""
        ai_response = {
            "height": 2.0,
            "width": 2.1,
            "length": 5.5,
            "weight": 3.2,
            "fuelType": "electric",
            "range": 350,
            "mpg": 95.0
        }

        with patch('vehicle_service.ai_service.get_vehicle_specs_from_ai', return_value=ai_response):
            result = get_vehicle_specs("tesla_model_x")

            assert isinstance(result, VehicleSpecsResponse)
            assert result.height == pytest.approx(2.0)
            assert result.fuelType == "electric"
            assert result.mpg == pytest.approx(95.0)

    def test_handles_case_insensitive_lookup(self):
        """Should handle uppercase vehicle types correctly"""
        with patch('vehicle_service.ai_service.get_vehicle_specs_from_ai', return_value=None):
            result = get_vehicle_specs("EV_SEDAN")

            assert isinstance(result, VehicleSpecsResponse)
            assert result.fuelType == "electric"
            assert result.range == 300

    def test_all_default_specs_have_required_fields(self):
        """All entries in DEFAULT_VEHICLE_SPECS should have complete data"""
        required_fields = ["height", "width", "length", "weight", "fuelType", "range", "mpg"]

        for vehicle_type, specs in DEFAULT_VEHICLE_SPECS.items():
            for field in required_fields:
                assert field in specs, f"{vehicle_type} missing {field}"

            # Validate data types
            assert isinstance(specs["height"], (int, float))
            assert isinstance(specs["mpg"], (int, float))
            assert specs["fuelType"] in ["gas", "diesel", "electric"]
