package com.roadtrip.geospatial.dto;

import java.util.List;
import java.util.Map;

public record GeocodeResponse(
        List<Double> coordinates,
        String placeName
) {}
