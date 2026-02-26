package com.roadtrip.geospatial.dto;

import java.util.List;
import java.util.Map;

public record SearchResponse(
        List<Map<String, Object>> features
) {}
