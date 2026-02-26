"""Comprehensive test suite for AI service module (Phase 2)"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
from ai_service import get_vehicle_specs_from_ai, AI_SERVICE_URL


class TestAIServiceIntegration:
    """Test suite for AI service integration with Go microservice"""

    @pytest.mark.asyncio
    async def test_successful_ai_response(self):
        """Should parse valid AI service response correctly"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {
                "height": 2.5,
                "width": 2.2,
                "length": 6.0,
                "weight": 3500  # kg - should convert to tonnes
            },
            "confidence": 0.95
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("large SUV")

            assert result is not None
            assert result["height"] == pytest.approx(2.5)
            assert result["width"] == pytest.approx(2.2)
            assert result["length"] == pytest.approx(6.0)
            assert result["weight"] == pytest.approx(3.5)  # Converted to tonnes
            assert result["fuelType"] == "gas"  # Default
            assert result["range"] == 400  # Default
            assert result["mpg"] == pytest.approx(25.0)  # Default

    @pytest.mark.asyncio
    async def test_ai_service_timeout(self):
        """Should handle timeout gracefully"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.TimeoutException("Request timed out")
            )

            result = await get_vehicle_specs_from_ai("any description")

            assert result is None

    @pytest.mark.asyncio
    async def test_ai_service_connection_error(self):
        """Should handle connection errors gracefully"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.ConnectError("Connection refused")
            )

            result = await get_vehicle_specs_from_ai("any description")

            assert result is None

    @pytest.mark.asyncio
    async def test_ai_service_http_error(self):
        """Should handle HTTP errors (4xx, 5xx) gracefully"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Server error",
                    request=MagicMock(),
                    response=MagicMock(status_code=500)
                )
            )

            result = await get_vehicle_specs_from_ai("any description")

            assert result is None

    @pytest.mark.asyncio
    async def test_malformed_ai_response(self):
        """Should handle malformed JSON response"""
        mock_response = MagicMock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("any description")

            assert result is None

    @pytest.mark.asyncio
    async def test_missing_specs_field(self):
        """Should handle response missing 'specs' field"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "error": "Failed to parse",
            "confidence": 0.1
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("gibberish")

            # Should still return with defaults when specs is missing
            assert result is not None
            assert result["height"] == pytest.approx(1.5)  # Default
            assert result["weight"] == pytest.approx(1.5)  # 1500kg -> 1.5 tonnes

    @pytest.mark.asyncio
    async def test_partial_specs_data(self):
        """Should handle partial specs data with defaults"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {
                "height": 3.0,
                # Missing width, length, weight
            }
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("tall vehicle")

            assert result is not None
            assert result["height"] == pytest.approx(3.0)  # From AI
            assert result["width"] == pytest.approx(1.8)  # Default
            assert result["length"] == pytest.approx(4.5)  # Default
            assert result["weight"] == pytest.approx(1.5)  # Default (1500kg)

    @pytest.mark.asyncio
    async def test_correct_api_endpoint_called(self):
        """Should call correct API endpoint with proper payload"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"specs": {}}
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            await get_vehicle_specs_from_ai("2023 Ford F-150")

            mock_post.assert_called_once()
            call_args = mock_post.call_args

            # Verify endpoint
            assert call_args[0][0] == f"{AI_SERVICE_URL}/api/v1/parse-vehicle"

            # Verify payload
            assert call_args[1]["json"] == {"description": "2023 Ford F-150"}

    @pytest.mark.asyncio
    async def test_timeout_configuration(self):
        """Should configure appropriate timeout for AI service calls"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"specs": {}}
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            await get_vehicle_specs_from_ai("test")

            # Verify AsyncClient was created with timeout
            mock_client.assert_called_once_with(timeout=30.0)

    @pytest.mark.asyncio
    async def test_weight_conversion_edge_cases(self):
        """Should handle weight conversion edge cases"""
        test_cases = [
            (0, 0.0),  # Zero weight
            (1000, 1.0),  # Exactly 1 tonne
            (500, 0.5),  # Half tonne
            (5500, 5.5),  # Fractional tonnes
        ]

        for kg_weight, expected_tonnes in test_cases:
            mock_response = MagicMock()
            mock_response.json.return_value = {
                "specs": {"weight": kg_weight}
            }
            mock_response.raise_for_status = MagicMock()

            with patch('httpx.AsyncClient') as mock_client:
                mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                    return_value=mock_response
                )

                result = await get_vehicle_specs_from_ai("test vehicle")

                assert result["weight"] == pytest.approx(expected_tonnes)

    @pytest.mark.asyncio
    async def test_empty_description_handling(self):
        """Should handle empty description string"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"specs": {}}
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("")

            assert result is not None
            # Should still call the service and return defaults


class TestAIServiceConfiguration:
    """Test AI service configuration and environment variables"""

    def test_default_ai_service_url(self):
        """Should use correct default AI service URL"""
        # Note: AI_SERVICE_URL is module-level constant
        import ai_service
        # In tests, it should be the default from the module
        assert ai_service.AI_SERVICE_URL in [
            "http://localhost:8080",
            "http://ai-service:8080"
        ]

    @pytest.mark.asyncio
    async def test_ai_service_url_from_env(self, monkeypatch):
        """Should read AI service URL from environment"""
        custom_url = "http://custom-ai-service:9000"
        monkeypatch.setenv("AI_SERVICE_URL", custom_url)

        # Re-import to pick up new env var
        import importlib
        import ai_service
        importlib.reload(ai_service)

        mock_response = MagicMock()
        mock_response.json.return_value = {"specs": {}}
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value.post = mock_post

            await ai_service.get_vehicle_specs_from_ai("test")

            call_args = mock_post.call_args
            assert custom_url in call_args[0][0]


class TestAIServiceErrorLogging:
    """Test error logging behavior"""

    @pytest.mark.asyncio
    async def test_logs_http_errors(self, caplog):
        """Should log HTTP errors appropriately"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Not Found",
                    request=MagicMock(),
                    response=MagicMock(status_code=404)
                )
            )

            await get_vehicle_specs_from_ai("test")

            # Check that error was logged
            assert any("Error calling AI service" in record.message for record in caplog.records)

    @pytest.mark.asyncio
    async def test_logs_unexpected_errors(self, caplog):
        """Should log unexpected errors"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=Exception("Unexpected error")
            )

            await get_vehicle_specs_from_ai("test")

            assert any("Unexpected error in AI service call" in record.message for record in caplog.records)


class TestAIServiceDataValidation:
    """Test data validation and sanitization"""

    @pytest.mark.asyncio
    async def test_handles_negative_dimensions(self):
        """Should handle negative dimension values"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {
                "height": -2.0,  # Invalid negative
                "width": 2.0,
                "length": 5.0,
                "weight": 2000
            }
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("test")

            # Currently accepts negative values - this documents current behavior
            assert result["height"] == pytest.approx(-2.0)

    @pytest.mark.asyncio
    async def test_handles_string_dimensions(self):
        """Should handle non-numeric dimension values gracefully"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {
                "height": "two meters",  # Invalid string
                "width": 2.0,
                "length": 5.0,
                "weight": 2000
            }
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("test")

            # Currently passes through string values without validation
            # This documents actual behavior - validation could be added in future
            assert result["height"] == "two meters"

    @pytest.mark.asyncio
    async def test_handles_extremely_large_values(self):
        """Should handle unrealistically large dimension values"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {
                "height": 999999,
                "width": 999999,
                "length": 999999,
                "weight": 999999999
            }
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("test")

            # Documents current behavior - accepts large values
            assert result["height"] == pytest.approx(999999)
            assert result["weight"] == pytest.approx(999999.999)  # kg to tonnes


class TestAIServiceBackwardCompatibility:
    """Test backward compatibility with legacy response format"""

    @pytest.mark.asyncio
    async def test_response_format_compatibility(self):
        """Should maintain backward compatible response format"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {
                "height": 2.0,
                "width": 1.9,
                "length": 5.0,
                "weight": 2500
            }
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("test")

            # Verify all expected legacy fields are present
            required_fields = ["height", "width", "length", "weight", "fuelType", "range", "mpg"]
            for field in required_fields:
                assert field in result, f"Missing required field: {field}"

    @pytest.mark.asyncio
    async def test_default_values_for_missing_fields(self):
        """Should provide sensible defaults for missing optional fields"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "specs": {}  # Empty specs
        }
        mock_response.raise_for_status = MagicMock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await get_vehicle_specs_from_ai("test")

            # Verify defaults
            assert result["fuelType"] == "gas"
            assert result["range"] == 400
            assert result["mpg"] == pytest.approx(25.0)
