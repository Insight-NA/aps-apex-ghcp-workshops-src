package com.roadtrip.geospatial.dto;

import java.util.List;
import java.util.Map;

public record DirectionsResponse(
        double distance,
        double duration,
        Map<String, Object> geometry,
        List<Map<String, Object>> legs
) {}
