package com.roadtrip.geospatial.dto;

import java.util.List;

public record NearbyPlacesResponse(
        List<NearbyPlace> places,
        int totalCount,
        int searchRadiusMeters
) {}
