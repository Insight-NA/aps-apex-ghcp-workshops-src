# Java Geospatial Service (Spring Boot)

Handles all geospatial operations: geocoding, directions, POI search, and route optimization.
Ported from the Python FastAPI backend to enable the polyglot microservices architecture.

## Endpoints

| Method | Path             | External API       | Description                              |
|--------|------------------|--------------------|------------------------------------------|
| GET    | `/api/geocode`   | Mapbox Geocoding   | Address → coordinates                    |
| GET    | `/api/directions`| Mapbox Directions  | Route between coordinates                |
| GET    | `/api/search`    | Azure Maps Fuzzy   | POI/place search (GeoJSON compatible)    |
| GET    | `/api/optimize`  | Mapbox Optimization| Optimize stop order                      |
| GET    | `/health`        | —                  | Health check                             |

## Query Parameters

### `/api/geocode`
- `q` (required): Address search string

### `/api/directions`
- `coords` (required): `"lng,lat;lng,lat"` format
- `profile` (optional): `driving` (default), `walking`, `cycling`, `driving-traffic`

### `/api/search`
- `query` (required): Search text
- `proximity` (optional): `"lng,lat"` for proximity bias

### `/api/optimize`
- `coords` (required): `"lng,lat;lng,lat;..."` format

## Environment Variables

| Variable          | Required | Description              |
|-------------------|----------|--------------------------|
| `MAPBOX_TOKEN`    | Yes      | Mapbox API access token  |
| `AZURE_MAPS_KEY`  | Yes      | Azure Maps subscription key |
| `PORT`            | No       | Listen port (default: 8082) |

## Local Development

```bash
./mvnw spring-boot:run
```

## Docker

```bash
docker build -t roadtrip-geospatial .
docker run -p 8082:8082 -e MAPBOX_TOKEN=xxx -e AZURE_MAPS_KEY=xxx roadtrip-geospatial
```
