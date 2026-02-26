import httpx
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# AI Service URL - points to the C# ASP.NET Web API service (replaced Go service)
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://backend-csharp:8081")


async def get_vehicle_specs_from_ai(description: str) -> Optional[Dict[str, Any]]:
    """
    Calls the C# AI microservice to parse vehicle specifications using Azure OpenAI.

    The C# service replaced the original Go ai-service. When the C# service
    is unavailable, this returns None and the caller falls back to the
    rule-based vehicle_service.py parser.

    Args:
        description: Natural language description of the vehicle

    Returns:
        Dictionary containing vehicle specs or None if service unavailable
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{AI_SERVICE_URL}/api/v1/parse-vehicle",
                json={"description": description},
            )
            response.raise_for_status()

            data = response.json()
            specs = data.get("specs", {})

            # Convert C# response format to legacy format for backward compatibility
            return {
                "height": specs.get("height", 1.5),
                "width": specs.get("width", 1.8),
                "length": specs.get("length", 4.5),
                "weight": specs.get("weight", 1500) / 1000,  # kg to tonnes
                "fuelType": "gas",  # Default for now
                "range": 400,  # Default for now
                "mpg": 25.0,  # Default for now
            }

    except httpx.HTTPError as e:
        logger.warning(f"C# AI service unavailable: {e}")
        return None
    except Exception as e:
        logger.warning(f"Unexpected error calling C# AI service: {e}")
        return None

