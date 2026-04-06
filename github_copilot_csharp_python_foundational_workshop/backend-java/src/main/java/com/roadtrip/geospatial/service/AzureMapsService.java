package com.roadtrip.geospatial.service;

import com.roadtrip.geospatial.dto.SearchResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.*;

@Service
public class AzureMapsService {

    private static final Logger log = LoggerFactory.getLogger(AzureMapsService.class);

    private final WebClient webClient;
    private final String azureMapsKey;

    public AzureMapsService(
            WebClient.Builder webClientBuilder,
            @Value("${geospatial.azure-maps.base-url}") String baseUrl,
            @Value("${geospatial.azure-maps.key}") String key) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.azureMapsKey = key;
    }

    /**
     * Fuzzy search for places/POIs using Azure Maps.
     * Transforms Azure Maps response to Mapbox-compatible GeoJSON format
     * for frontend compatibility.
     *
     * @param query   search query string
     * @param proximity optional "lng,lat" proximity bias
     * @return GeoJSON-like features list compatible with frontend
     */
    @SuppressWarnings("unchecked")
    public SearchResponse searchPlaces(String query, String proximity) {
        validateKey();

        // Parse proximity parameter (lng,lat format from frontend)
        Double lat = null;
        Double lon = null;
        if (proximity != null && !proximity.isBlank()) {
            try {
                String[] parts = proximity.split(",");
                lon = Double.parseDouble(parts[0]); // Longitude first in input
                lat = Double.parseDouble(parts[1]); // Latitude second in input
            } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid proximity format. Expected: lng,lat");
            }
        }

        final Double finalLat = lat;
        final Double finalLon = lon;

        log.debug("Searching Azure Maps for query='{}' proximity='{}'", query, proximity);

        Map<String, Object> data;
        try {
            data = webClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .path("/search/fuzzy/json")
                                .queryParam("api-version", "1.0")
                                .queryParam("query", query)
                                .queryParam("limit", 10)
                                .queryParam("subscription-key", azureMapsKey);
                        if (finalLat != null && finalLon != null) {
                            builder.queryParam("lat", finalLat);
                            builder.queryParam("lon", finalLon);
                        }
                        return builder.build();
                    })
                    .retrieve()
                    .onStatus(status -> status.value() == 401,
                            response -> Mono.error(
                                    new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                            "Azure Maps authentication failed: subscription key is invalid or expired")))
                    .onStatus(status -> status.value() == 403,
                            response -> Mono.error(
                                    new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                            "Azure Maps authorization failed: key does not have access to this resource")))
                    .onStatus(status -> status.is4xxClientError(),
                            response -> Mono.error(
                                    new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                            "Azure Maps request error: " + response.statusCode())))
                    .onStatus(status -> status.is5xxServerError(),
                            response -> Mono.error(
                                    new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                                            "Azure Maps service error: " + response.statusCode())))
                    .bodyToMono(Map.class)
                    .block();
        } catch (ResponseStatusException e) {
            log.error("Azure Maps search failed for query='{}': {}", query, e.getReason());
            throw e;
        }

        if (data == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "No response from Azure Maps");
        }

        // Transform Azure Maps response to Mapbox-compatible GeoJSON format
        List<Map<String, Object>> results = (List<Map<String, Object>>) data.getOrDefault("results", List.of());
        List<Map<String, Object>> features = new ArrayList<>();

        for (Map<String, Object> result : results) {
            Map<String, Object> poi = (Map<String, Object>) result.getOrDefault("poi", Map.of());
            Map<String, Object> address = (Map<String, Object>) result.getOrDefault("address", Map.of());
            Map<String, Object> position = (Map<String, Object>) result.getOrDefault("position", Map.of());

            Map<String, Object> geometry = new LinkedHashMap<>();
            geometry.put("type", "Point");
            geometry.put("coordinates", List.of(
                    position.getOrDefault("lon", 0.0),  // Longitude first (GeoJSON spec)
                    position.getOrDefault("lat", 0.0)   // Latitude second (GeoJSON spec)
            ));

            Map<String, Object> feature = new LinkedHashMap<>();
            feature.put("id", result.get("id"));
            feature.put("type", "Feature");
            feature.put("text", poi.getOrDefault("name", "Unknown"));
            feature.put("place_name", address.getOrDefault("freeformAddress", "Unknown"));
            feature.put("geometry", geometry);
            features.add(feature);
        }

        return new SearchResponse(features);
    }

    private void validateKey() {
        if (azureMapsKey == null || azureMapsKey.isBlank()) {
            log.error("AZURE_MAPS_KEY environment variable is not set or empty");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Azure Maps key not configured");
        }
    }
}
