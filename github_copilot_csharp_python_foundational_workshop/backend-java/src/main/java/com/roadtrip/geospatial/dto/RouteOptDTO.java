package com.roadtrip.geospatial.dto;

import java.util.List;
import java.util.Map;

/**
 * Typed response for the Mapbox Optimization API.
 * Models the top-level fields returned by /optimized-trips/v1/mapbox/driving/{coords}.
 */
public record RouteOptDTO(
        String code,
        List<Map<String, Object>> trips,
        List<Map<String, Object>> waypoints
) {}
