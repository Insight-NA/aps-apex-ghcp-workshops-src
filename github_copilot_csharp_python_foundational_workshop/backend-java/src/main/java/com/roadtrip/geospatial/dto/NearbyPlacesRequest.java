package com.roadtrip.geospatial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record NearbyPlacesRequest(
        @NotEmpty List<List<Double>> routeCoordinates,
        @Positive int searchRadiusMeters,
        @NotBlank String category,
        @Positive int maxResults
) {}
