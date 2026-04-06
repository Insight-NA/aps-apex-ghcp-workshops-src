---
name: python-constants-extraction
description: "Extract all hardcoded strings from Python backend files into a centralized constants.py. Covers error messages, config keys, API defaults, and vehicle types."
---

## Context
The Python backend (`backend/`) has 16+ hardcoded strings across `main.py`, `auth.py`, `ai_service.py`, and `vehicle_service.py`. The `python.instructions.md` requires a `constants.py` module.

## Objective
Create `backend/constants.py` and extract all hardcoded strings from the Python backend.

## Requirements

### File Structure
```python
# backend/constants.py
"""Centralized constants for the Road Trip Planner Python backend."""

# Error Messages
ERROR_INVALID_TOKEN = "Invalid or expired token"
ERROR_USER_NOT_FOUND = "User not found"
ERROR_TRIP_NOT_FOUND = "Trip not found"
ERROR_MISSING_COORDINATES = "All stops must have valid coordinates"
ERROR_VEHICLE_PARSE_FAILED = "Failed to parse vehicle specifications"

# Config Keys
CONFIG_SECRET_KEY = "SECRET_KEY"
CONFIG_DATABASE_URL = "DATABASE_URL"
CONFIG_GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID"
CONFIG_MAPBOX_TOKEN = "MAPBOX_ACCESS_TOKEN"
CONFIG_AZURE_MAPS_KEY = "AZURE_MAPS_SUBSCRIPTION_KEY"
CONFIG_GEMINI_API_KEY = "GEMINI_API_KEY"

# API Defaults
DEFAULT_SEARCH_RADIUS = 5000  # meters
DEFAULT_SEARCH_LIMIT = 10
DEFAULT_TOKEN_EXPIRY_MINUTES = 15

# Vehicle Types
VEHICLE_TYPE_CAR = "car"
VEHICLE_TYPE_TRUCK = "truck"
VEHICLE_TYPE_RV = "rv"
VEHICLE_TYPE_MOTORCYCLE = "motorcycle"
VALID_VEHICLE_TYPES = {VEHICLE_TYPE_CAR, VEHICLE_TYPE_TRUCK, VEHICLE_TYPE_RV, VEHICLE_TYPE_MOTORCYCLE}

# Stop Types
STOP_TYPE_START = "start"
STOP_TYPE_END = "end"
STOP_TYPE_STOP = "stop"
VALID_STOP_TYPES = {STOP_TYPE_START, STOP_TYPE_END, STOP_TYPE_STOP}

# HTTP Headers
HEADER_AUTHORIZATION = "Authorization"
HEADER_BEARER_PREFIX = "Bearer "
```

### Extraction Rules
1. Search all `.py` files in `backend/` for string literals (exclude `tests/`)
2. Skip: empty strings, single characters, f-string templates (extract the static parts)
3. Group by purpose: errors, config keys, defaults, enums
4. Replace inline strings with constant imports
5. Run `pytest` after each file is updated

## Example
```python
# ❌ Before
raise HTTPException(status_code=404, detail="Trip not found")

# ✅ After
from constants import ERROR_TRIP_NOT_FOUND
raise HTTPException(status_code=404, detail=ERROR_TRIP_NOT_FOUND)
```

Use `@python-implementer` to execute this extraction with TDD (Red → Green → Refactor).
