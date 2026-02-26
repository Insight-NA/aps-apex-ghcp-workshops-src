#!/usr/bin/env python3
"""
Test script to explore Azure Maps Search API responses
and validate assumptions before implementing the POI search feature.
"""

import os
import httpx
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AZURE_MAPS_KEY = os.getenv("AZURE_MAPS_KEY")

if not AZURE_MAPS_KEY:
    print("❌ ERROR: AZURE_MAPS_KEY not found in environment")
    exit(1)

print(f"✅ Azure Maps Key loaded: {AZURE_MAPS_KEY[:20]}...")
print("\n" + "="*80)
print("AZURE MAPS API EXPLORATION")
print("="*80 + "\n")


async def test_fuzzy_search(query: str, lat: float, lon: float, test_name: str):
    """Test Azure Maps Fuzzy Search API"""
    print(f"\n📍 TEST: {test_name}")
    print(f"   Query: '{query}' near ({lat}, {lon})")
    print("-" * 80)
    
    # Azure Maps Fuzzy Search endpoint
    url = f"https://atlas.microsoft.com/search/fuzzy/json"
    
    params = {
        "api-version": "1.0",
        "query": query,
        "lat": lat,
        "lon": lon,
        "limit": 10,
        "subscription-key": AZURE_MAPS_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params)
            
            print(f"   Status Code: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                
                # Print summary
                summary = data.get("summary", {})
                print(f"   Results Found: {summary.get('numResults', 0)}")
                print(f"   Query: {summary.get('query', 'N/A')}")
                
                # Print first 3 results
                results = data.get("results", [])
                if results:
                    print(f"\n   📋 First {min(3, len(results))} Results:")
                    for i, result in enumerate(results[:3], 1):
                        poi = result.get("poi", {})
                        address = result.get("address", {})
                        position = result.get("position", {})
                        
                        print(f"\n   Result #{i}:")
                        print(f"      ID: {result.get('id', 'N/A')}")
                        print(f"      Type: {result.get('type', 'N/A')}")
                        print(f"      POI Name: {poi.get('name', 'N/A')}")
                        print(f"      Categories: {poi.get('categories', [])}")
                        print(f"      Category Set: {poi.get('categorySet', [])}")
                        print(f"      Address: {address.get('freeformAddress', 'N/A')}")
                        print(f"      Position: lat={position.get('lat')}, lon={position.get('lon')}")
                        print(f"      Score: {result.get('score', 'N/A')}")
                
                # Save full response for inspection
                filename = f"azure_maps_{test_name.replace(' ', '_').lower()}.json"
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
                print(f"\n   💾 Full response saved to: {filename}")
                
                return data
            else:
                print(f"   ❌ Error: {resp.status_code}")
                print(f"   Response: {resp.text}")
                return None
                
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return None


async def test_category_search(category_code: str, lat: float, lon: float, test_name: str):
    """Test Azure Maps POI Category Search"""
    print(f"\n📍 TEST: {test_name}")
    print(f"   Category Code: {category_code} near ({lat}, {lon})")
    print("-" * 80)
    
    # Azure Maps POI Category Search endpoint
    url = f"https://atlas.microsoft.com/search/poi/category/json"
    
    params = {
        "api-version": "1.0",
        "query": category_code,
        "lat": lat,
        "lon": lon,
        "limit": 10,
        "subscription-key": AZURE_MAPS_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params)
            
            print(f"   Status Code: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                
                summary = data.get("summary", {})
                print(f"   Results Found: {summary.get('numResults', 0)}")
                
                results = data.get("results", [])
                if results:
                    print(f"\n   📋 First {min(3, len(results))} Results:")
                    for i, result in enumerate(results[:3], 1):
                        poi = result.get("poi", {})
                        position = result.get("position", {})
                        
                        print(f"\n   Result #{i}:")
                        print(f"      POI Name: {poi.get('name', 'N/A')}")
                        print(f"      Categories: {poi.get('categories', [])}")
                        print(f"      Position: lat={position.get('lat')}, lon={position.get('lon')}")
                
                filename = f"azure_maps_category_{test_name.replace(' ', '_').lower()}.json"
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
                print(f"\n   💾 Full response saved to: {filename}")
                
                return data
            else:
                print(f"   ❌ Error: {resp.status_code}")
                print(f"   Response: {resp.text}")
                return None
                
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return None


async def test_nearby_search(lat: float, lon: float, radius: int, test_name: str):
    """Test Azure Maps Nearby Search"""
    print(f"\n📍 TEST: {test_name}")
    print(f"   Location: ({lat}, {lon}), Radius: {radius}m")
    print("-" * 80)
    
    url = f"https://atlas.microsoft.com/search/nearby/json"
    
    params = {
        "api-version": "1.0",
        "lat": lat,
        "lon": lon,
        "radius": radius,
        "limit": 10,
        "subscription-key": AZURE_MAPS_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params)
            
            print(f"   Status Code: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                summary = data.get("summary", {})
                print(f"   Results Found: {summary.get('numResults', 0)}")
                
                results = data.get("results", [])
                if results:
                    print(f"\n   📋 POI Types Found:")
                    poi_types = {}
                    for result in results:
                        poi = result.get("poi", {})
                        categories = poi.get("categories", [])
                        for cat in categories:
                            poi_types[cat] = poi_types.get(cat, 0) + 1
                    
                    for cat, count in sorted(poi_types.items(), key=lambda x: x[1], reverse=True)[:10]:
                        print(f"      {cat}: {count}")
                
                filename = f"azure_maps_nearby_{test_name.replace(' ', '_').lower()}.json"
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
                print(f"\n   💾 Full response saved to: {filename}")
                
                return data
            else:
                print(f"   ❌ Error: {resp.status_code}")
                print(f"   Response: {resp.text}")
                return None
                
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return None


async def main():
    """Run all tests"""
    
    # Test location: Kansas City (central US)
    test_lat = 39.0997
    test_lon = -94.5786
    
    print("🧪 Testing Azure Maps Search APIs\n")
    
    # Test 1: Fuzzy search with text queries (current frontend approach)
    await test_fuzzy_search("gas station", test_lat, test_lon, "Gas Station Fuzzy")
    await test_fuzzy_search("restaurant", test_lat, test_lon, "Restaurant Fuzzy")
    await test_fuzzy_search("hotel", test_lat, test_lon, "Hotel Fuzzy")
    
    # Test 2: Category codes (if available)
    print("\n" + "="*80)
    print("TESTING CATEGORY CODES")
    print("="*80)
    
    # Common category codes from Azure Maps documentation
    # 7311 - Petrol Station / Gas Station
    # 7315 - Restaurant
    # 7314 - Hotel/Motel
    await test_category_search("7311", test_lat, test_lon, "Gas Station Category")
    await test_category_search("7315", test_lat, test_lon, "Restaurant Category")
    await test_category_search("7314", test_lat, test_lon, "Hotel Category")
    
    # Test 3: Nearby search (alternative approach)
    print("\n" + "="*80)
    print("TESTING NEARBY SEARCH")
    print("="*80)
    
    await test_nearby_search(test_lat, test_lon, 5000, "Nearby 5km")
    
    # Test 4: Test coordinate order assumption
    print("\n" + "="*80)
    print("TESTING COORDINATE ORDER")
    print("="*80)
    print("\n📍 Validating coordinate order in response:")
    print("   Input: lat=39.0997, lon=-94.5786 (Kansas City)")
    print("   Expected GeoJSON: [lng, lat] = [-94.5786, 39.0997]")
    print("   Azure Maps returns: {lat: ..., lon: ...}")
    print("   ⚠️  Transformation needed: position.lon → coords[0], position.lat → coords[1]")
    
    print("\n" + "="*80)
    print("SUMMARY OF FINDINGS")
    print("="*80)
    print("""
📊 Key Observations to Document:
   
   1. Response Structure:
      - Root: {summary, results[]}
      - Each result has: {id, type, poi, address, position, score}
      
   2. POI Data:
      - poi.name: Business name
      - poi.categories[]: Array of category names
      - poi.categorySet[]: Array of category codes
      
   3. Position Format:
      - Azure Maps: {lat: number, lon: number}
      - GeoJSON needs: [lon, lat] (SWAP REQUIRED)
      
   4. Address:
      - address.freeformAddress: Full formatted address
      
   5. Best API Choice:
      - Fuzzy Search: Works with text queries (current frontend approach)
      - Category Search: More precise but requires category codes
      - Nearby Search: Returns all POIs (requires filtering)
      
   6. Frontend Compatibility:
      - Frontend sends: query='gas station', proximity='lng,lat'
      - Need to: Split proximity → lat, lon
      - Need to: Transform response to Mapbox format
   
✅ Check generated JSON files for complete response structures
    """)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
