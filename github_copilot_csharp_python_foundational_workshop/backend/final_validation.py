#!/usr/bin/env python3
"""
Final validation: Test the exact implementation that will go into main.py
This simulates the /api/search endpoint with Azure Maps integration
"""

import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def search_places_azure(query: str, proximity: str = None):
    """
    Exact implementation that will replace the current /api/search endpoint.
    Tests the complete flow including proximity parsing and response transformation.
    """
    print(f"\n{'='*80}")
    print(f"Testing: query='{query}', proximity='{proximity}'")
    print('='*80)
    
    azure_key = os.getenv("AZURE_MAPS_KEY")
    if not azure_key:
        raise Exception("Azure Maps key not configured")
    
    # Parse proximity parameter (lng,lat format from frontend)
    lat, lon = None, None
    if proximity:
        try:
            coords = proximity.split(',')
            lon = float(coords[0])  # Longitude first in input
            lat = float(coords[1])  # Latitude second
            print(f"✅ Parsed proximity: lon={lon}, lat={lat}")
        except (ValueError, IndexError):
            raise Exception("Invalid proximity format")
    
    # Build Azure Maps Fuzzy Search URL
    url = "https://atlas.microsoft.com/search/fuzzy/json"
    params = {
        "api-version": "1.0",
        "query": query,
        "limit": 10,
        "subscription-key": azure_key
    }
    
    # Add proximity if provided
    if lat and lon:
        params["lat"] = lat
        params["lon"] = lon
    
    print(f"📡 Calling Azure Maps API...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params)
        
        if resp.status_code != 200:
            raise Exception(f"Azure Maps API error: {resp.status_code}")
        
        azure_data = resp.json()
        print(f"✅ Azure Maps returned {len(azure_data.get('results', []))} results")
        
        # Transform Azure Maps response to Mapbox-compatible format
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
                        position.get("lat")   # Latitude second
                    ]
                }
            }
            features.append(feature)
        
        response = {"features": features}
        print(f"✅ Transformed to Mapbox format with {len(features)} features")
        
        return response


async def test_all_scenarios():
    """Test all three POI categories that the frontend uses"""
    
    print("\n" + "="*80)
    print("FINAL VALIDATION: Testing Exact Implementation")
    print("="*80)
    
    # Test location: Kansas City (matches FloatingPanel.tsx usage)
    test_proximity = "-94.5786,39.0997"  # lng,lat format (as frontend sends)
    
    # Test 1: Gas Station (from FloatingPanel.tsx line 553)
    print("\n🔍 Test 1: Gas Station Search")
    result1 = await search_places_azure("gas station", test_proximity)
    assert len(result1["features"]) > 0, "No gas stations found!"
    print(f"   First result: {result1['features'][0]['text']}")
    print(f"   Address: {result1['features'][0]['place_name']}")
    print(f"   Coordinates: {result1['features'][0]['geometry']['coordinates']}")
    print("   ✅ PASS")
    
    # Test 2: Restaurant (from FloatingPanel.tsx line 561)
    print("\n🔍 Test 2: Restaurant Search")
    result2 = await search_places_azure("restaurant", test_proximity)
    assert len(result2["features"]) > 0, "No restaurants found!"
    print(f"   First result: {result2['features'][0]['text']}")
    print(f"   Address: {result2['features'][0]['place_name']}")
    print(f"   Coordinates: {result2['features'][0]['geometry']['coordinates']}")
    print("   ✅ PASS")
    
    # Test 3: Hotel (from FloatingPanel.tsx line 569)
    print("\n🔍 Test 3: Hotel Search")
    result3 = await search_places_azure("hotel", test_proximity)
    assert len(result3["features"]) > 0, "No hotels found!"
    print(f"   First result: {result3['features'][0]['text']}")
    print(f"   Address: {result3['features'][0]['place_name']}")
    print(f"   Coordinates: {result3['features'][0]['geometry']['coordinates']}")
    print("   ✅ PASS")
    
    # Test 4: Validate frontend compatibility
    print("\n🔍 Test 4: Frontend Compatibility Check")
    print("   Checking response structure matches FloatingPanel.tsx expectations...")
    
    sample_feature = result1["features"][0]
    
    # Frontend expects (FloatingPanel.tsx line 253-260):
    # - feat.id
    # - feat.text
    # - feat.geometry.coordinates
    # - feat.place_name
    
    assert "id" in sample_feature, "Missing 'id' field"
    assert "text" in sample_feature, "Missing 'text' field"
    assert "geometry" in sample_feature, "Missing 'geometry' field"
    assert "coordinates" in sample_feature["geometry"], "Missing 'coordinates' field"
    assert "place_name" in sample_feature, "Missing 'place_name' field"
    assert len(sample_feature["geometry"]["coordinates"]) == 2, "Coordinates should be [lon, lat]"
    
    print("   ✅ All required fields present")
    print("   ✅ Response structure matches frontend expectations")
    print("   ✅ PASS")
    
    # Test 5: Coordinate order validation
    print("\n🔍 Test 5: GeoJSON Coordinate Order")
    coords = sample_feature["geometry"]["coordinates"]
    print(f"   Coordinates: {coords}")
    print(f"   [0] (longitude): {coords[0]} (should be negative for Kansas City)")
    print(f"   [1] (latitude):  {coords[1]} (should be ~39)")
    
    assert coords[0] < 0, "Longitude should be negative (Kansas City is west)"
    assert 38 < coords[1] < 40, "Latitude should be ~39 for Kansas City"
    print("   ✅ Coordinate order is correct [lon, lat]")
    print("   ✅ PASS")
    
    print("\n" + "="*80)
    print("🎉 ALL TESTS PASSED!")
    print("="*80)
    print("""
✅ Implementation validated and ready for production!

Summary:
- Gas station search: WORKING ✅
- Restaurant search: WORKING ✅
- Hotel search: WORKING ✅
- Response format: COMPATIBLE ✅
- Coordinate order: CORRECT ✅

Next step: Replace /api/search endpoint in backend/main.py
    """)


if __name__ == "__main__":
    asyncio.run(test_all_scenarios())
