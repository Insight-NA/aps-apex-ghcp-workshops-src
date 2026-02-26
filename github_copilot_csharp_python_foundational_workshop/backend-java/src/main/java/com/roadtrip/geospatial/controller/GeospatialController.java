package com.roadtrip.geospatial.controller;

import com.roadtrip.geospatial.dto.DirectionsResponse;
import com.roadtrip.geospatial.dto.GeocodeResponse;
import com.roadtrip.geospatial.dto.SearchResponse;
import com.roadtrip.geospatial.service.AzureMapsService;
import com.roadtrip.geospatial.service.MapboxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class GeospatialController {

    private final MapboxService mapboxService;
    private final AzureMapsService azureMapsService;

    public GeospatialController(MapboxService mapboxService, AzureMapsService azureMapsService) {
        this.mapboxService = mapboxService;
        this.azureMapsService = azureMapsService;
    }

    /**
     * Geocode an address using Mapbox Geocoding API.
     * Ported from Python backend main.py geocode_address().
     *
     * @param q address query string
     * @return coordinates [lng, lat] and place name
     */
    @GetMapping("/geocode")
    public ResponseEntity<GeocodeResponse> geocode(@RequestParam("q") String q) {
        GeocodeResponse result = mapboxService.geocode(q);
        return ResponseEntity.ok(result);
    }

    /**
     * Get driving directions via Mapbox Directions API.
     * Ported from Python backend main.py get_directions().
     *
     * @param coords "lng,lat;lng,lat" format
     * @param profile driving profile (default: "driving")
     * @return route with distance, duration, geometry, and legs
     */
    @GetMapping("/directions")
    public ResponseEntity<DirectionsResponse> getDirections(
            @RequestParam("coords") String coords,
            @RequestParam(value = "profile", defaultValue = "driving") String profile) {
        DirectionsResponse result = mapboxService.getDirections(coords, profile);
        return ResponseEntity.ok(result);
    }

    /**
     * Search for places/POIs using Azure Maps Fuzzy Search.
     * Ported from Python backend main.py search_places().
     * Transforms Azure Maps response to Mapbox-compatible GeoJSON format.
     *
     * @param query search query
     * @param proximity optional "lng,lat" proximity bias
     * @return GeoJSON-compatible features list
     */
    @GetMapping("/search")
    public ResponseEntity<SearchResponse> searchPlaces(
            @RequestParam("query") String query,
            @RequestParam(value = "proximity", required = false) String proximity) {
        SearchResponse result = azureMapsService.searchPlaces(query, proximity);
        return ResponseEntity.ok(result);
    }

    /**
     * Optimize a route using Mapbox Optimization API.
     * Ported from Python backend main.py optimize_route().
     *
     * @param coords semicolon-separated "lng,lat;lng,lat;..." string
     * @return raw optimization response
     */
    @GetMapping("/optimize")
    public ResponseEntity<Map<String, Object>> optimizeRoute(
            @RequestParam("coords") String coords) {
        Map<String, Object> result = mapboxService.optimizeRoute(coords);
        return ResponseEntity.ok(result);
    }
}
