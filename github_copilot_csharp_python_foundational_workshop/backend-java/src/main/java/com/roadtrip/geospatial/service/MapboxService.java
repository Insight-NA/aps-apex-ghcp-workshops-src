package com.roadtrip.geospatial.service;

import com.roadtrip.geospatial.dto.DirectionsResponse;
import com.roadtrip.geospatial.dto.GeocodeResponse;
import com.roadtrip.geospatial.dto.SearchResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class MapboxService {

    private static final Logger log = LoggerFactory.getLogger(MapboxService.class);

    private final WebClient webClient;
    private final String mapboxToken;

    public MapboxService(
            WebClient.Builder webClientBuilder,
            @Value("${geospatial.mapbox.base-url}") String baseUrl,
            @Value("${geospatial.mapbox.token}") String token) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.mapboxToken = token;
    }

    /**
     * Geocode an address query using Mapbox Geocoding API.
     *
     * @param query address search string
     * @return coordinates [lng, lat] and place name
     */
    public GeocodeResponse geocode(String query) {
        validateToken();

        Map<String, Object> data = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/geocoding/v5/mapbox.places/{query}.json")
                        .queryParam("access_token", mapboxToken)
                        .queryParam("limit", 1)
                        .build(query))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (data == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No response from Mapbox");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) data.get("features");
        if (features == null || features.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found");
        }

        Map<String, Object> feature = features.get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> geometry = (Map<String, Object>) feature.get("geometry");
        @SuppressWarnings("unchecked")
        List<Double> coordinates = (List<Double>) geometry.get("coordinates");
        String placeName = (String) feature.get("place_name");

        return new GeocodeResponse(coordinates, placeName);
    }

    /**
     * Get driving directions between coordinates via Mapbox Directions API.
     *
     * @param coords semicolon-separated "lng,lat;lng,lat" string
     * @param profile driving profile (driving, walking, cycling, driving-traffic)
     * @return route with distance, duration, geometry, and legs
     */
    @SuppressWarnings("unchecked")
    public DirectionsResponse getDirections(String coords, String profile) {
        validateToken();

        Map<String, Object> data = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/directions/v5/mapbox/{profile}/{coords}")
                        .queryParam("geometries", "geojson")
                        .queryParam("overview", "full")
                        .queryParam("steps", true)
                        .queryParam("access_token", mapboxToken)
                        .build(profile, coords))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (data == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No response from Mapbox");
        }

        List<Map<String, Object>> routes = (List<Map<String, Object>>) data.get("routes");
        if (routes == null || routes.isEmpty()) {
            return new DirectionsResponse(0, 0, null, List.of());
        }

        Map<String, Object> route = routes.get(0);
        double distance = ((Number) route.get("distance")).doubleValue();
        double duration = ((Number) route.get("duration")).doubleValue();
        Map<String, Object> geometry = (Map<String, Object>) route.get("geometry");
        List<Map<String, Object>> legs = (List<Map<String, Object>>) route.get("legs");

        return new DirectionsResponse(distance, duration, geometry, legs != null ? legs : List.of());
    }

    /**
     * Optimize a route using Mapbox Optimization API.
     *
     * @param coords semicolon-separated "lng,lat;lng,lat;..." string
     * @return raw Mapbox optimization response
     */
    public Map<String, Object> optimizeRoute(String coords) {
        validateToken();

        Map<String, Object> data = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/optimized-trips/v1/mapbox/driving/{coords}")
                        .queryParam("access_token", mapboxToken)
                        .queryParam("source", "first")
                        .queryParam("destination", "last")
                        .queryParam("roundtrip", false)
                        .queryParam("geometries", "geojson")
                        .build(coords))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (data == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No response from Mapbox");
        }

        return data;
    }

    private void validateToken() {
        if (mapboxToken == null || mapboxToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Mapbox token not configured");
        }
    }
}
