package com.roadtrip.geospatial.dto;

import java.util.List;

public record NearbyPlace(
        String name,
        String category,
        List<Double> coordinates,
        double distanceFromRoute
) {}
