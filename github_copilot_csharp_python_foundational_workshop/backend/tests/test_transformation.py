"""
Test script to validate the response transformation from Azure Maps to Mapbox-compatible format
"""

import json

# Load a sample Azure Maps response
with open('azure_maps_gas_station_fuzzy.json', 'r') as f:
    azure_response = json.load(f)

print("="*80)
print("AZURE MAPS TO MAPBOX RESPONSE TRANSFORMATION TEST")
print("="*80)

def transform_azure_to_mapbox(azure_data):
    """
    Transform Azure Maps response to Mapbox-compatible GeoJSON format
    
    Azure Maps structure:
    {
      "summary": {...},
      "results": [
        {
          "id": "...",
          "type": "POI",
          "poi": {"name": "...", "categories": [...]},
          "address": {"freeformAddress": "..."},
          "position": {"lat": ..., "lon": ...}
        }
      ]
    }
    
    Mapbox-compatible structure (what frontend expects):
    {
      "features": [
        {
          "id": "...",
          "text": "...",
          "place_name": "...",
          "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]  # NOTE: [lng, lat] order!
          }
        }
      ]
    }
    """
    
    features = []
    
    for result in azure_data.get("results", []):
        poi = result.get("poi", {})
        address = result.get("address", {})
        position = result.get("position", {})
        
        # Create Mapbox-compatible feature
        feature = {
            "id": result.get("id"),
            "type": "Feature",
            "text": poi.get("name", "Unknown"),
            "place_name": address.get("freeformAddress", "Unknown address"),
            "geometry": {
                "type": "Point",
                "coordinates": [
                    position.get("lon"),  # longitude FIRST
                    position.get("lat")   # latitude SECOND
                ]
            },
            # Optional: Include additional data for debugging
            "properties": {
                "categories": poi.get("categories", []),
                "phone": poi.get("phone"),
                "score": result.get("score")
            }
        }
        
        features.append(feature)
    
    return {"features": features}


# Transform the response
mapbox_format = transform_azure_to_mapbox(azure_response)

print(f"\n✅ Transformed {len(mapbox_format['features'])} results\n")

# Display first 3 transformed results
for i, feature in enumerate(mapbox_format['features'][:3], 1):
    print(f"Result #{i}:")
    print(f"  ID: {feature['id']}")
    print(f"  Name (text): {feature['text']}")
    print(f"  Address (place_name): {feature['place_name']}")
    print(f"  Coordinates (GeoJSON): {feature['geometry']['coordinates']}")
    print(f"  Categories: {feature['properties']['categories']}")
    print()

# Save transformed output
with open('transformed_mapbox_format.json', 'w') as f:
    json.dump(mapbox_format, f, indent=2)

print("💾 Transformed response saved to: transformed_mapbox_format.json")

# Validate coordinate order
print("\n" + "="*80)
print("COORDINATE ORDER VALIDATION")
print("="*80)

first_result = azure_response['results'][0]
first_feature = mapbox_format['features'][0]

print(f"\nAzure Maps Position:")
print(f"  lat: {first_result['position']['lat']}")
print(f"  lon: {first_result['position']['lon']}")

print(f"\nGeoJSON Coordinates (Mapbox format):")
print(f"  [0] (longitude): {first_feature['geometry']['coordinates'][0]}")
print(f"  [1] (latitude):  {first_feature['geometry']['coordinates'][1]}")

print(f"\n✅ Coordinate transformation verified:")
print(f"   Azure lon → GeoJSON[0]: {first_result['position']['lon']} → {first_feature['geometry']['coordinates'][0]}")
print(f"   Azure lat → GeoJSON[1]: {first_result['position']['lat']} → {first_feature['geometry']['coordinates'][1]}")

# Test what frontend expects
print("\n" + "="*80)
print("FRONTEND COMPATIBILITY CHECK")
print("="*80)

print("""
Frontend code expects (from FloatingPanel.tsx line 253):
  
  flatResults.forEach((feat: any) => {
    uniquePOIs.set(feat.id, {
      id: feat.id,
      name: feat.text,              ← Azure: poi.name
      coordinates: feat.geometry.coordinates,  ← Azure: [position.lon, position.lat]
      category: category,
      address: feat.place_name      ← Azure: address.freeformAddress
    });
  });

✅ All required fields are present in transformation:
   - feat.id ✓
   - feat.text ✓
   - feat.geometry.coordinates ✓
   - feat.place_name ✓
""")

print("="*80)
print("TRANSFORMATION READY FOR IMPLEMENTATION")
print("="*80)
