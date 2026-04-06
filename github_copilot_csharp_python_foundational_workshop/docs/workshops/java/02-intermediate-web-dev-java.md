# Workshop 2: Intermediate Web Development with GitHub Copilot — Java Edition

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Java/Spring Boot developers with Copilot foundational knowledge (completed Workshop 1)  
**Prerequisites**: VS Code with GitHub Copilot extension, GitHub Copilot CLI installed, JDK 21, Maven wrapper (`./mvnw`), familiarity with Spring Boot 3

> **Architecture context**: The Java backend (`backend-java/`) is a Spring Boot 3 geospatial service
> that proxies requests to Mapbox and Azure Maps APIs. It runs on port 8082 and provides geocoding,
> directions, POI search, and route optimization endpoints. All examples in this workshop target
> real files in this service.

---

## Learning Objectives

By the end of this workshop, you will be able to:

1. [**Inline Code Suggestions**](#demo-1-inline-code-suggestions-10-min) - Accept and modify Copilot's real-time code completions
2. [**Prompting**](#demo-2-prompting--core-framework-10-min) - Write effective prompts that generate accurate, project-specific code
3. [**Code Explanations**](#demo-4-code-explanations-10-min) - Use Copilot to understand complex authentication and database logic
4. [**Comment-Based Generation**](#demo-3-comment-based-generation-10-min) - Generate complete functions from descriptive comments
5. [**Code Refactoring**](#demo-5-code-refactoring--copilot-chat-10-min) - Extract duplicate code using Copilot's refactoring capabilities
6. [**Copilot Chat**](#demo-5-code-refactoring--copilot-chat-10-min) - Interact with Copilot for code questions, improvements, and debugging
7. [**Few-Shot Prompting**](#demo-6-few-shot-prompting-10-min) - Teach Copilot patterns by showing examples before requesting new code
8. [**Unit Testing & Debugging**](#demo-7-unit-testing--debugging-15-min) - Generate test cases and debug failing tests with Copilot
9. [**Copilot CLI**](#demo-8-copilot-cli-15-min) - Generate shell commands and scripts using natural language

---

## The CORE Prompting Framework

All prompts in this workshop follow the **CORE** framework for maximum effectiveness:

| Letter | Element | Description |
|--------|---------|-------------|
| **C** | **Context** | Background information — Spring Boot 3, service layer, controller, DTO package |
| **O** | **Objective** | What you want Copilot to do — create, explain, refactor, test |
| **R** | **Requirements** | Constraints, types, annotations, validation rules, patterns to follow |
| **E** | **Examples** | Existing record patterns, existing `@GetMapping` signatures, sample data |

> 📝 **CORE Formula Template (Java)**:
> ```
> Context:      "In this Spring Boot @Service / @RestController, working with [class/package]..."
> Objective:    "Create / Explain / Refactor / Test [specific thing]..."
> Requirements: "Must include [annotations, types, validation, WebClient patterns]..."
> Examples:     "Follow the pattern in GeocodeResponse record / MapboxService.geocode()..."
> ```

---

## Workshop Agenda

| Time | Demo | Learning Objective | File(s) |
|------|------|-------------------|---------|
| 0-10 min | Demo 1 | **Inline Code Suggestions** | `HealthController.java`, `MapboxService.java` |
| 10-20 min | Demo 2 | **Prompting** (CORE Framework) | New DTOs in `dto/` package |
| 20-30 min | Demo 3 | **Comment-Based Generation** | `GeospatialController.java` |
| 30-40 min | Demo 4 | **Code Explanations** | `MapboxService.java`, `AzureMapsService.java`, `CorsConfig.java` |
| 40-50 min | Demo 5 | **Code Refactoring** + **Copilot Chat** | Cross-service refactoring |
| 50-60 min | Demo 6 | **Few-Shot Prompting** | New records in `dto/` package |
| 60-75 min | Demo 7 | **Unit Testing & Debugging** | `GeospatialControllerTest.java`, `MapboxServiceTest.java` |
| 75-90 min | Demo 8 | **Copilot CLI** | Terminal / Maven / Dockerfile |

---

## Java Backend File Reference

Before starting, familiarize yourself with the project structure:

```
backend-java/
├── pom.xml                              # Maven config — Spring Boot 3.3.0, Java 21
├── Dockerfile                           # Multi-stage: maven:3.9.6-eclipse-temurin-21 → JRE
├── src/main/java/com/roadtrip/geospatial/
│   ├── GeospatialApplication.java       # @SpringBootApplication entry point
│   ├── config/
│   │   ├── CorsConfig.java              # @Configuration — CORS with @Value
│   │   └── WebClientConfig.java         # @Configuration — WebClient.Builder bean
│   ├── controller/
│   │   ├── HealthController.java        # GET /health — returns Map.of(...)
│   │   └── GeospatialController.java    # GET /api/geocode, /api/directions, /api/search, /api/optimize
│   ├── dto/
│   │   ├── GeocodeResponse.java         # record(List<Double> coordinates, String placeName)
│   │   ├── DirectionsResponse.java      # record(double distance, double duration, Map geometry, List legs)
│   │   └── SearchResponse.java          # record(List<Map<String, Object>> features)
│   └── service/
│       ├── MapboxService.java           # @Service — WebClient calls to Mapbox APIs
│       └── AzureMapsService.java        # @Service — WebClient calls to Azure Maps APIs
├── src/main/resources/
│   └── application.yml                  # Port, API keys, Actuator config
└── src/test/java/com/roadtrip/geospatial/
    └── GeospatialApplicationTests.java  # @SpringBootTest context load test
```

---

## Demo 1: Inline Code Suggestions (10 min)

### Learning Objective
Accept and modify Copilot's real-time code completions as you type, using pattern recognition.

### Scenario
Add new entries and methods to existing Java code. Copilot recognizes the patterns in your open file and suggests complete structures.

---

### Exercise 1A — Add a Detailed Health Endpoint to `HealthController.java`

**Setup**: Open `backend-java/src/main/java/com/roadtrip/geospatial/controller/HealthController.java` and view the existing `health()` method.

**Existing code:**
```java
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "geospatial-service",
                "runtime", "java"
        ));
    }
}
```

**Step 1: Position cursor after the `health()` method closing brace and type:**
```java
    @GetMapping("/health/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        return ResponseEntity.ok(Map.of(
```

**Expected Copilot Inline Suggestion** (ghost text):
```java
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "geospatial-service",
            "runtime", "java",
            "version", System.getProperty("java.version"),
            "timestamp", java.time.Instant.now().toString()
        ));
```

> 💡 **Why it works**: Copilot sees the existing `health()` method returning `Map.of(...)` and extends the pattern with additional metadata fields. It recognizes this is a health endpoint and adds `version` and `timestamp` — common fields in health check responses.

**Step 2: Accept with `Tab`, then try a readiness endpoint. Type:**
```java
    @GetMapping("/health/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
```

**Expected Copilot Suggestion** (use `Ctrl+→` to accept word-by-word, then modify):
```java
    @GetMapping("/health/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
        return ResponseEntity.ok(Map.of(
            "status", "ready",
            "service", "geospatial-service",
            "checks", Map.of(
                "mapbox", "configured",
                "azureMaps", "configured"
            )
        ));
    }
```

---

### Exercise 1B — Add a New Profile Constant in `MapboxService.java`

**Setup**: Open `backend-java/src/main/java/com/roadtrip/geospatial/service/MapboxService.java` and examine the `getDirections` method that accepts a `profile` parameter.

**Step 1: Above the `getDirections` method, type a list of constants:**
```java
    private static final String PROFILE_DRIVING = "driving";
    private static final String PROFILE_WALKING = "walking";
```

**Expected Copilot Inline Suggestion** (Copilot continues the pattern):
```java
    private static final String PROFILE_CYCLING = "cycling";
    private static final String PROFILE_DRIVING_TRAFFIC = "driving-traffic";
```

**Step 2: Accept with `Tab`, then type a validation method:**
```java
    private String validateProfile(String profile) {
```

**Expected Copilot Suggestion**:
```java
    private String validateProfile(String profile) {
        return switch (profile) {
            case "driving", "walking", "cycling", "driving-traffic" -> profile;
            default -> PROFILE_DRIVING;
        };
    }
```

> 💡 **Key Insight**: Copilot used a Java 21 pattern-matching `switch` expression — it detected the project's `java.version` is 21 from the POM context.

---

### Teaching Points

> 💡 **Key Insight**: Inline suggestions work best when Copilot has **context from existing patterns**. The existing `Map.of(...)` structure, `@GetMapping` annotations, and method signatures teach Copilot the exact shape to follow.

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See alternatives | `Alt+]` / `Alt+[` | `Alt+]` / `Alt+[` |

### Common Mistakes
- ❌ **Accepting without review**: Always verify — `Map.of()` is limited to 10 entries; for more, use `Map.ofEntries()`
- ❌ **Ignoring alternatives**: Press `Alt+]` to cycle through multiple suggestions — one may use `LinkedHashMap` for ordered keys
- ❌ **Fighting Copilot**: If the suggestion is wrong, type more characters to steer it (e.g., type `"uptime"` to make Copilot add an uptime field)
- ❌ **Missing `Map.of()` immutability**: `Map.of()` returns an unmodifiable map — don't try to `.put()` later

---

## Demo 2: Prompting — CORE Framework (10 min)

### Learning Objective
Write effective prompts using the **CORE** framework (Context, Objective, Requirements, Examples) that generate accurate, project-specific code.

### Scenario
Create new data transfer objects (DTOs) using Java records, following the existing project conventions.

---

### Exercise 2A — Route Optimization DTOs

**Setup**: Create a new file `backend-java/src/main/java/com/roadtrip/geospatial/dto/RouteOptimizationDto.java`.

**CORE Prompt** (write as a Javadoc comment at the top of the file):
```java
package com.roadtrip.geospatial.dto;

import java.util.List;
import java.util.Map;

/**
 * Context: In this Spring Boot geospatial service, we use Java record types
 *     for immutable DTOs. Existing records (GeocodeResponse, DirectionsResponse,
 *     SearchResponse) use Maps and Lists for flexible JSON structures.
 *     The Jackson library auto-serializes record components to JSON.
 *
 * Objective: Create request/response records for a route optimization endpoint
 *     that accepts waypoints and returns an optimized travel order.
 *
 * Requirements:
 *     - WaypointDto: record with double longitude, double latitude, String name
 *     - RouteOptimizationRequest: record with List<WaypointDto> waypoints,
 *       String vehicleType (default via compact canonical constructor),
 *       boolean avoidTolls, boolean avoidHighways
 *     - RouteOptimizationResponse: record with List<WaypointDto> optimizedOrder,
 *       double totalDistanceKm, double totalDurationMinutes, Map geometry
 *
 * Examples: Follow the existing record pattern:
 *     public record DirectionsResponse(double distance, double duration,
 *         Map<String, Object> geometry, List<Map<String, Object>> legs) {}
 */
```

**Expected Copilot Suggestion**:
```java
public record WaypointDto(double longitude, double latitude, String name) {}

public record RouteOptimizationRequest(
    List<WaypointDto> waypoints,
    String vehicleType,
    boolean avoidTolls,
    boolean avoidHighways
) {
    public RouteOptimizationRequest {
        if (vehicleType == null || vehicleType.isBlank()) {
            vehicleType = "car";
        }
    }
}

public record RouteOptimizationResponse(
    List<WaypointDto> optimizedOrder,
    double totalDistanceKm,
    double totalDurationMinutes,
    Map<String, Object> geometry
) {}
```

> 💡 **Java Record Insight**: The compact canonical constructor (`public RouteOptimizationRequest { ... }`) is Java 16+ syntax that validates/normalizes parameters before assignment. Copilot generates this because the CORE prompt mentioned "compact canonical constructor."

---

### Exercise 2B — POI Search DTOs

**Setup**: Create a new file `backend-java/src/main/java/com/roadtrip/geospatial/dto/PoiSearchDto.java`.

**CORE Prompt:**
```java
package com.roadtrip.geospatial.dto;

import java.util.List;

/**
 * Context: Spring Boot geospatial service using Java records as DTOs.
 *     The existing SearchResponse record wraps Azure Maps results as
 *     GeoJSON-compatible features using List<Map<String, Object>>.
 *
 * Objective: Create strongly typed POI (Point of Interest) DTOs that replace
 *     the untyped Map structure with proper domain objects.
 *
 * Requirements:
 *     - PoiCoordinates: record with double longitude, double latitude
 *     - PoiResult: record with String id, String name, String category,
 *       String address, PoiCoordinates coordinates, double distanceMeters
 *     - PoiSearchResponse: record with List<PoiResult> results, int totalCount,
 *       String query
 *     - Validate: longitude [-180, 180], latitude [-90, 90] in PoiCoordinates
 *
 * Examples: Follow GeocodeResponse pattern — simple, flat records
 */
```

**Expected Copilot Suggestion**:
```java
public record PoiCoordinates(double longitude, double latitude) {
    public PoiCoordinates {
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
    }
}

public record PoiResult(
    String id,
    String name,
    String category,
    String address,
    PoiCoordinates coordinates,
    double distanceMeters
) {}

public record PoiSearchResponse(
    List<PoiResult> results,
    int totalCount,
    String query
) {}
```

---

### CORE vs. Vague Prompting Comparison

| Prompt Quality | Prompt | Result |
|----------------|--------|--------|
| ❌ Vague | `"Create POI class"` | POJO with getters/setters, misses records pattern |
| ❌ No context | `"Create a route DTO"` | Wrong — may generate Lombok `@Data` or mutable class |
| ✅ CORE | `"Context: Spring Boot + Java records... Objective: Route optimization DTOs... Requirements: WaypointDto, compact constructor... Examples: like DirectionsResponse record"` | Precise, immutable, matches project conventions |

---

## Demo 3: Comment-Based Generation (10 min)

### Learning Objective
Generate complete methods from descriptive comments placed directly above code.

### Scenario
Add new API endpoints to `GeospatialController.java` by writing descriptive comments, then letting Copilot generate the implementation.

---

### Exercise 3A — Reverse Geocode Endpoint

**Setup**: Open `backend-java/src/main/java/com/roadtrip/geospatial/controller/GeospatialController.java` and navigate after the `optimizeRoute` method.

**Write the CORE-structured comment, then the method signature:**
```java
    // Context: Spring Boot REST controller with constructor-injected MapboxService
    //     and AzureMapsService. Existing endpoints use @GetMapping with @RequestParam
    //     and return ResponseEntity<T>.
    // Objective: Add endpoint that reverse-geocodes coordinates to an address
    // Requirements:
    //     - GET /api/reverse-geocode
    //     - Parameters: lng (double), lat (double)
    //     - Returns: ResponseEntity with place name and formatted address
    //     - Delegates to mapboxService.reverseGeocode(lng, lat)
    //     - Follow the same error-handling pattern as geocode()
    // Examples: Follow the geocode() method pattern above
    @GetMapping("/reverse-geocode")
    public ResponseEntity<GeocodeResponse> reverseGeocode(
            @RequestParam("lng") double lng,
            @RequestParam("lat") double lat) {
```

**Expected Copilot Suggestion** (completes the method body):
```java
    @GetMapping("/reverse-geocode")
    public ResponseEntity<GeocodeResponse> reverseGeocode(
            @RequestParam("lng") double lng,
            @RequestParam("lat") double lat) {
        GeocodeResponse result = mapboxService.reverseGeocode(lng, lat);
        return ResponseEntity.ok(result);
    }
```

> 💡 **Notice**: Copilot matches the exact single-line delegation pattern from `geocode()`. The response type `GeocodeResponse` is reused because reverse geocoding also returns coordinates + place name.

---

### Exercise 3B — Nearby Search Endpoint with Radius Parameter

**Write the CORE-structured comment for a more complex endpoint:**
```java
    // Context: This controller already has a /api/search endpoint that delegates
    //     to azureMapsService.searchPlaces(query, proximity). The proximity parameter
    //     is optional and in "lng,lat" format.
    // Objective: Add endpoint to find nearby places within a radius of a point
    // Requirements:
    //     - GET /api/nearby
    //     - Parameters: lng (double), lat (double), radius (int, default 5000 meters),
    //       category (String, optional — e.g., "gas_station", "restaurant")
    //     - Constructs proximity as "lng,lat" string from the double params
    //     - Delegates to azureMapsService.searchPlaces(category, proximity)
    //     - Returns ResponseEntity<SearchResponse>
    // Examples: Follow the searchPlaces() controller method pattern
    @GetMapping("/nearby")
    public ResponseEntity<SearchResponse> nearbySearch(
            @RequestParam("lng") double lng,
            @RequestParam("lat") double lat,
            @RequestParam(value = "radius", defaultValue = "5000") int radius,
            @RequestParam(value = "category", required = false) String category) {
```

**Expected Copilot Suggestion**:
```java
    @GetMapping("/nearby")
    public ResponseEntity<SearchResponse> nearbySearch(
            @RequestParam("lng") double lng,
            @RequestParam("lat") double lat,
            @RequestParam(value = "radius", defaultValue = "5000") int radius,
            @RequestParam(value = "category", required = false) String category) {
        String proximity = lng + "," + lat;
        String query = category != null ? category : "point of interest";
        SearchResponse result = azureMapsService.searchPlaces(query, proximity);
        return ResponseEntity.ok(result);
    }
```

---

### Exercise 3C — Batch Geocode Endpoint (POST)

**Write a comment for a POST endpoint — a different pattern from the existing GETs:**
```java
    // Context: All existing endpoints are @GetMapping. This is the first POST endpoint.
    //     Spring Boot uses @RequestBody for JSON deserialization.
    // Objective: Add batch geocode endpoint that accepts multiple addresses at once
    // Requirements:
    //     - POST /api/batch-geocode
    //     - Body: List<String> addresses (JSON array)
    //     - Returns: ResponseEntity<List<GeocodeResponse>>
    //     - Iterates addresses, calls mapboxService.geocode() for each
    //     - Collects results into a list; skips failures (log and continue)
    // Examples: Uses same mapboxService.geocode(query) as the GET /api/geocode endpoint
    @PostMapping("/batch-geocode")
    public ResponseEntity<List<GeocodeResponse>> batchGeocode(
            @RequestBody List<String> addresses) {
```

**Expected Copilot Suggestion**:
```java
    @PostMapping("/batch-geocode")
    public ResponseEntity<List<GeocodeResponse>> batchGeocode(
            @RequestBody List<String> addresses) {
        List<GeocodeResponse> results = new ArrayList<>();
        for (String address : addresses) {
            try {
                results.add(mapboxService.geocode(address));
            } catch (Exception e) {
                log.warn("Failed to geocode address: {}", address, e);
            }
        }
        return ResponseEntity.ok(results);
    }
```

---

### Teaching Points

> 💡 **Comment-Based Generation Best Practices (CORE)**:
> 1. **Context** — Mention Spring Boot, the service layer, and DI patterns (`constructor-injected MapboxService`)
> 2. **Objective** — Be specific about the endpoint purpose and HTTP method
> 3. **Requirements** — List `@RequestParam` vs `@RequestBody`, default values, return types
> 4. **Examples** — Reference existing methods: "Follow the `geocode()` method pattern"

### Comparison: Comment Quality

```java
// ❌ Too vague — Copilot may generate incorrect implementation
// Add reverse geocode

// ⚠️ Partial — missing service delegation and pattern context
// Add endpoint for reverse geocoding with lng and lat parameters

// ✅ CORE — Copilot generates complete, correct implementation
// Context: Spring Boot REST controller with constructor-injected MapboxService
//     and AzureMapsService. Existing endpoints use @GetMapping with @RequestParam...
// Objective: Add endpoint that reverse-geocodes coordinates to an address
// Requirements: GET /api/reverse-geocode, params lng/lat, delegates to mapboxService...
// Examples: Follow the geocode() method pattern above
```

---

## Demo 4: Code Explanations (10 min)

### Learning Objective
Use Copilot Chat to understand complex integration logic — WebClient reactive chains, API response transformations, and Spring configuration patterns.

### Scenario
Understand the architecture of the Java geospatial service: how it proxies external APIs, transforms responses, and configures CORS.

---

### Exercise 4A — MapboxService WebClient Chain

**Setup**: Open `backend-java/src/main/java/com/roadtrip/geospatial/service/MapboxService.java` and select the entire `getDirections` method (lines ~75-115).

**Selected Code:**
```java
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
```

**Copilot Chat CORE Prompt** (press `Ctrl+I` or `Ctrl+Shift+I`):
```
Context: This Spring Boot service uses WebClient to proxy Mapbox Directions API requests.
    The frontend never calls Mapbox directly — all requests go through this Java backend.
    WebClient comes from spring-boot-starter-webflux but is used in a Spring MVC (servlet) app.
Objective: Explain how the URI builder constructs the Mapbox API call, why we use .block(),
    and how the response is transformed from raw JSON to type-safe DTOs.
Requirements: Cover the WebClient chain (uri → retrieve → bodyToMono → block),
    the GeoJSON geometry extraction, @SuppressWarnings usage, and why .block() is needed.
Examples: Trace a request from "coords='-122.4,37.8;-118.2,34.1'&profile=driving"
    to the final DirectionsResponse record.
```

**Expected Copilot Explanation**:
```
The Mapbox Directions proxy works as follows:

1. **Token Validation**: validateToken() is called first — throws
   ResponseStatusException(500) if the MAPBOX_TOKEN env var is missing.

2. **URI Construction**: UriBuilder creates:
   GET /directions/v5/mapbox/driving/-122.4,37.8;-118.2,34.1
   With query params: geometries=geojson, overview=full, steps=true, access_token=...
   The {profile} and {coords} template variables are resolved by .build(profile, coords).

3. **WebClient Chain**:
   - .get()                → Starts an HTTP GET request builder
   - .uri(uriBuilder -> ...) → Builds the URL with path variables and query params
   - .retrieve()           → Executes the request and accesses the response
   - .bodyToMono(Map.class) → Deserializes JSON response body to a Map (reactive Mono)
   - .block()              → Blocks the current thread to get the synchronous result

4. **Why .block()?**
   This is a Spring MVC (servlet) app, NOT a WebFlux reactive app. The controller
   methods return ResponseEntity<T>, not Mono<T>. .block() converts the reactive
   Mono into a synchronous value. In a WebFlux app, you would return the Mono directly.

5. **Response Transformation**:
   - Extracts routes[0] from Mapbox response (first route)
   - Pulls distance (meters), duration (seconds), geometry (GeoJSON LineString), and legs
   - Wraps in DirectionsResponse record — immutable snapshot with only the fields
     the frontend needs (discarding Mapbox-specific metadata)

6. **@SuppressWarnings("unchecked")**:
   Required because bodyToMono(Map.class) returns raw Map, and casting to
   List<Map<String, Object>> generates an unchecked cast warning.
   This is a deliberate trade-off: using Map.class keeps the code flexible
   without creating a full Mapbox response POJO.
```

---

### Exercise 4B — Azure Maps Response Transformation

**Setup**: Open `backend-java/src/main/java/com/roadtrip/geospatial/service/AzureMapsService.java` and select the `searchPlaces` method (the full method including the response transformation loop).

**Copilot Chat CORE Prompt**:
```
Context: This Spring Boot service proxies Azure Maps Fuzzy Search API, then transforms
    the Azure Maps JSON format into a Mapbox-compatible GeoJSON structure. The frontend
    was originally built against Mapbox's API format, so this service acts as an adapter.
Objective: Explain the Azure Maps → GeoJSON transformation step by step. Why do we use
    LinkedHashMap? Why is the proximity parameter parsed manually?
Requirements: Cover the proximity "lng,lat" parsing, the Azure Maps response structure
    (results → poi, address, position), the GeoJSON feature construction, and the
    SearchResponse record wrapper.
Examples: Trace a search for "gas station" near proximity "-122.4,37.8" through the
    full transformation pipeline.
```

**Expected Copilot Explanation**:
```
The Azure Maps adapter transforms external API responses for frontend compatibility:

1. **Proximity Parsing**:
   - Input: "lng,lat" string (e.g., "-122.4,37.8") from the frontend
   - Split by comma: parts[0] = longitude, parts[1] = latitude
   - Azure Maps API wants separate lat/lon query params, not a combined string
   - Manual parsing with try/catch handles NumberFormatException gracefully

2. **Azure Maps Response Structure**:
   {
     "results": [{
       "poi": { "name": "Shell Gas Station" },
       "address": { "freeformAddress": "123 Main St" },
       "position": { "lat": 37.78, "lon": -122.41 }
     }]
   }

3. **GeoJSON Transformation** (per result):
   - LinkedHashMap preserves insertion order for predictable JSON output
   - "type": "Point" + "coordinates": [lon, lat] follows GeoJSON spec (longitude first!)
   - Each result becomes a GeoJSON Feature with id, type, text, place_name, geometry
   - This matches the Mapbox Geocoding response format the frontend expects

4. **Why LinkedHashMap?**
   Regular HashMap provides no ordering guarantee. LinkedHashMap ensures
   "id" → "type" → "text" → "place_name" → "geometry" order in JSON output,
   making debugging and testing predictable.

5. **SearchResponse Wrapper**:
   The record SearchResponse(List<Map<String, Object>> features) wraps the
   transformed features list — Jackson serializes it as {"features": [...]}.
```

---

### Exercise 4C — CORS Configuration Pattern

**Setup**: Open `backend-java/src/main/java/com/roadtrip/geospatial/config/CorsConfig.java` and select the full class.

**Copilot Chat CORE Prompt**:
```
Context: Spring Boot 3 CORS configuration using @Configuration and WebMvcConfigurer.
    The allowed origins come from an environment variable (ALLOWED_ORIGINS) with a default
    of http://localhost:3000. In production, this would be set to the frontend domain.
Objective: Explain how @Value injection works in a @Configuration class, why we use
    an anonymous inner class for WebMvcConfigurer, and what each CORS setting does.
Requirements: Cover @Value default syntax, addCorsMappings registry, allowedOrigins
    split pattern, and allowCredentials implications.
Examples: Explain what happens when ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

**Expected Copilot Explanation**:
```
CORS Configuration breakdown:

1. **@Value("${ALLOWED_ORIGINS:http://localhost:3000}")**:
   - Injects the ALLOWED_ORIGINS environment variable
   - The ":http://localhost:3000" after the colon is the default value
   - This maps to docker-compose.yml: ALLOWED_ORIGINS=http://localhost:3000

2. **WebMvcConfigurer anonymous class**:
   - Spring MVC provides the WebMvcConfigurer interface for customizing MVC config
   - We override addCorsMappings() to register CORS rules
   - Using an anonymous class (lambda-compatible) is Spring's idiomatic pattern

3. **CORS Settings**:
   - registry.addMapping("/**")        → Apply to ALL endpoints
   - .allowedOrigins(split by comma)   → Only these domains can call the API
   - .allowedMethods("GET", "POST"...) → Permitted HTTP methods
   - .allowedHeaders("*")              → Accept all request headers
   - .allowCredentials(true)           → Allow cookies/auth headers (requires explicit origins, not "*")

4. **Split pattern**:
   When ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173":
   - allowedOrigins.split(",") → ["http://localhost:3000", "http://localhost:5173"]
   - Both origins can now make cross-origin requests to this service
```

---

### Teaching Points

> 🔍 **Code Explanation CORE Prompts**:
> - Always provide **Context** specifying Spring Boot version, MVC vs WebFlux, and service role
> - The **Objective** should specify the *angle* (architecture flow, security, performance)
> - **Requirements** tell Copilot what depth to cover (WebClient chain, annotations, patterns)
> - **Examples** give Copilot concrete data to trace through the code

| Command | Usage |
|---------|-------|
| `/explain` or `Ctrl+I` | Explain selected code in detail |
| `/explain simply` | ELI5 explanation for beginners |
| `Ctrl+Shift+I` | Open Chat panel for follow-up questions |

---

## Demo 5: Code Refactoring + Copilot Chat (10 min)

### Learning Objective
Use Copilot Chat to identify duplicate code patterns and refactor them into shared utilities.

### Scenario
Find and eliminate duplicate patterns within the Java geospatial service.

---

### Exercise 5A — Extract Duplicate API Key Validation

**Setup**: Both `MapboxService.java` and `AzureMapsService.java` have identical validation methods.

**MapboxService.java:**
```java
private void validateToken() {
    if (mapboxToken == null || mapboxToken.isBlank()) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Mapbox token not configured");
    }
}
```

**AzureMapsService.java:**
```java
private void validateKey() {
    if (azureMapsKey == null || azureMapsKey.isBlank()) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Azure Maps key not configured");
    }
}
```

**Step 1: Use `@workspace` in Copilot Chat to confirm the duplication**

```
Context: This is a Spring Boot geospatial service with two @Service classes
    (MapboxService and AzureMapsService), each calling an external API.
Objective: Find duplicate API key validation logic across all service files.
Requirements: Show each validation method side by side and suggest a shared utility.
Examples: The shared utility should follow Spring conventions — either a @Component
    or a static utility class.
```

**Expected Response** (Copilot finds the duplication):
```
Duplicate validation found in two services:

MapboxService.validateToken():   null/blank check → throw ResponseStatusException(500)
AzureMapsService.validateKey():  null/blank check → throw ResponseStatusException(500)

Both do the same thing — only the field name and error message differ.
```

**Step 2: Ask Copilot to refactor**

```
Context: Two Spring Boot @Service classes with duplicate API key validation.
Objective: Extract a shared utility method that both services can use.
Requirements:
    - Create a static utility class ApiKeyValidator in the config package
    - Method: requireNonBlank(String value, String serviceName) that throws
      ResponseStatusException(500) with a descriptive message
    - Update both services to use the shared method
Examples: Target usage: ApiKeyValidator.requireNonBlank(mapboxToken, "Mapbox");
```

**Expected Result — New file `config/ApiKeyValidator.java`:**
```java
package com.roadtrip.geospatial.config;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ApiKeyValidator {

    private ApiKeyValidator() {} // Prevent instantiation

    public static void requireNonBlank(String value, String serviceName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    serviceName + " key not configured");
        }
    }
}
```

**Updated services:**
```java
// MapboxService.java — before each API call
ApiKeyValidator.requireNonBlank(mapboxToken, "Mapbox");

// AzureMapsService.java — before each API call
ApiKeyValidator.requireNonBlank(azureMapsKey, "Azure Maps");
```

---

### Exercise 5B — Standardize Health Check Responses

**Setup**: The `HealthController` returns `Map<String, String>`, but the Spring Boot Actuator at `/actuator/health` returns a different format. Open Copilot Chat.

**Copilot Chat CORE Prompt**:
```
Context: The Java service has TWO health endpoints:
    1. Custom: GET /health → returns Map.of("status", "healthy", "service", ...)
    2. Actuator: GET /actuator/health → Spring Boot default format {"status": "UP"}
    The BFF aggregates health from all backends — inconsistent formats cause problems.
Objective: Refactor the custom health endpoint to include all fields the BFF needs while
    keeping the Actuator endpoint for Kubernetes probes.
Requirements:
    - Return: status, service name, runtime (java), version (from pom), uptime
    - Create a HealthResponse record instead of using raw Map.of()
    - Keep the Actuator endpoint unchanged for container orchestration
Examples: Target format: {"status":"healthy","service":"geospatial-service",
    "runtime":"java","version":"1.0.0","uptimeSeconds":12345}
```

**Expected Result — New DTO:**
```java
public record HealthResponse(
    String status,
    String service,
    String runtime,
    String version,
    long uptimeSeconds
) {}
```

**Updated Controller:**
```java
@RestController
public class HealthController {

    private final Instant startTime = Instant.now();

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        long uptime = Duration.between(startTime, Instant.now()).getSeconds();
        return ResponseEntity.ok(new HealthResponse(
            "healthy",
            "geospatial-service",
            "java",
            "1.0.0",
            uptime
        ));
    }
}
```

---

### Teaching Points

> 🔧 **Copilot Chat Refactoring Commands**:
> - `@workspace` — Search across all Java files for duplicate patterns
> - `/refactor` — Extract, rename, restructure selected code
> - `Ctrl+Shift+I` — Open Chat panel for multi-step refactoring conversations

### Verification
```bash
# Verify no duplicate validation remains
grep -rn "isBlank()" backend-java/src/main/java/ --include="*.java"
# Should show ApiKeyValidator.java and references, not duplicates

# Run tests
cd backend-java && ./mvnw test
```

---

## Demo 6: Few-Shot Prompting (10 min)

### Learning Objective
Teach Copilot project-specific patterns by showing 2-3 examples from the existing codebase, then asking it to generate similar code.

### Scenario
Create new Java record DTOs by first showing Copilot the existing records in this project, then requesting new ones that follow the same conventions.

---

### Exercise 6A — Nearby Places DTOs

**Setup**: Open or create a new DTO file in the Java backend.

**Few-Shot CORE Prompt:**
```java
/**
 * Context: Spring Boot geospatial service using Java records as immutable DTOs.
 *     Records auto-generate constructors, getters, equals(), hashCode(), and toString().
 *     Jackson automatically serializes record components to JSON fields.
 *
 * Objective: Create DTOs for a "nearby places" endpoint that finds POIs
 *     along a route corridor.
 *
 * Requirements:
 *     - NearbyPlacesRequest: list of coordinate pairs (as List<List<Double>>),
 *       search radius in meters (int), category filter (String), max results (int)
 *     - NearbyPlace: name, category, coordinates (List<Double> as [lng,lat]),
 *       distanceFromRoute (double, in meters)
 *     - NearbyPlacesResponse: list of NearbyPlace, total count, search radius used
 *
 * Examples (existing patterns in this project):
 *
 *     Example 1 — GeocodeResponse:
 *     public record GeocodeResponse(List<Double> coordinates, String placeName) {}
 *
 *     Example 2 — DirectionsResponse:
 *     public record DirectionsResponse(double distance, double duration,
 *             Map<String, Object> geometry, List<Map<String, Object>> legs) {}
 *
 *     Example 3 — SearchResponse:
 *     public record SearchResponse(List<Map<String, Object>> features) {}
 *
 * NOW CREATE: NearbyPlaces DTOs following these exact record patterns
 */
```

**Expected Copilot Suggestion**:
```java
public record NearbyPlacesRequest(
    List<List<Double>> coordinates,
    int radiusMeters,
    String category,
    int maxResults
) {}

public record NearbyPlace(
    String name,
    String category,
    List<Double> coordinates,
    double distanceFromRoute
) {}

public record NearbyPlacesResponse(
    List<NearbyPlace> places,
    int totalCount,
    int radiusMeters
) {}
```

> 💡 **Why it works**: By showing Copilot three real record patterns from the project, it learns:
> - Use `List<Double>` for coordinates (not `double[]`)
> - Use `List<Map<String, Object>>` for flexible JSON structures
> - Keep records flat and simple — no inheritance, no Lombok

---

### Exercise 6B — Trip Summary DTOs

**Few-Shot CORE Prompt:**
```java
/**
 * Context: Same Spring Boot geospatial service. We need DTOs for a trip summary
 *     feature that aggregates data from multiple API calls.
 *
 * Objective: Create DTOs for a trip summary that combines directions, geocoding,
 *     and POI data into a single response.
 *
 * Requirements:
 *     - TripLeg: record with String origin, String destination, double distanceKm,
 *       double durationMinutes, List<Double> startCoordinates, List<Double> endCoordinates
 *     - TripSummary: record with List<TripLeg> legs, double totalDistanceKm,
 *       double totalDurationMinutes, int totalStops, List<NearbyPlace> fuelStops
 *
 * Examples (existing patterns — note how records compose):
 *
 *     Example 1 — Simple record:
 *     public record GeocodeResponse(List<Double> coordinates, String placeName) {}
 *
 *     Example 2 — Record with nested collections:
 *     public record DirectionsResponse(double distance, double duration,
 *             Map<String, Object> geometry, List<Map<String, Object>> legs) {}
 *
 * NOW CREATE: TripSummary DTOs composing TripLeg records
 */
```

**Expected Copilot Suggestion**:
```java
public record TripLeg(
    String origin,
    String destination,
    double distanceKm,
    double durationMinutes,
    List<Double> startCoordinates,
    List<Double> endCoordinates
) {}

public record TripSummary(
    List<TripLeg> legs,
    double totalDistanceKm,
    double totalDurationMinutes,
    int totalStops,
    List<NearbyPlace> fuelStops
) {}
```

---

### Why Few-Shot Works

| Approach | Prompt Style | Result |
|----------|-------------|--------|
| ❌ Zero-shot | `"Create trip summary DTO"` | Generates POJO with getters/setters, misses records |
| ❌ One-shot | Shows one example | Better, but may not capture `List<Double>` coordinate pattern |
| ✅ Few-shot (CORE) | Context + 2-3 Examples + NOW CREATE | Follows project conventions exactly — records, `List<Double>`, flat structure |

### Java Record Pitfalls to Watch For
- ❌ Copilot may generate `class` instead of `record` → reject and re-prompt with examples
- ❌ Copilot may add Lombok `@Data` → reject; records don't need Lombok
- ❌ Copilot may use `double[]` instead of `List<Double>` → Jackson serializes arrays differently
- ✅ Records are immutable by default — no `.set()` methods, which is correct for DTOs

---

## Demo 7: Unit Testing & Debugging (15 min)

### Learning Objective
Generate test cases with Copilot using CORE prompts and debug failing tests using Copilot Chat.

### Scenario
Generate and debug tests for the Java Spring Boot geospatial service using JUnit 5, MockMvc, and Mockito.

---

### Exercise 7A — Controller Tests with `@WebMvcTest`

**Step 1: Generate tests with CORE prompt (Copilot Chat)**

Open `GeospatialController.java`, select the `geocode` method, then press `Ctrl+Shift+I`:

```
Context: Spring Boot 3 REST controller with MapboxService and AzureMapsService
    injected via constructor. We use JUnit 5 with @WebMvcTest and @MockBean
    for controller-layer tests. The project uses spring-boot-starter-test
    which includes MockMvc, Mockito, and AssertJ.

Objective: Generate unit tests for the geocode endpoint (GET /api/geocode?q=...).

Requirements:
    - Test 1: Valid query returns 200 with coordinates and placeName
    - Test 2: Missing query parameter returns 400
    - Test 3: Service throws ResponseStatusException(404) → returns 404
    - Mock MapboxService.geocode() to return a known GeocodeResponse
    - Use MockMvc for HTTP assertions with jsonPath

Examples:
    @Test
    void healthCheck_returnsHealthy() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("healthy"));
    }
```

**Expected Copilot Suggestion**:
```java
package com.roadtrip.geospatial.controller;

import com.roadtrip.geospatial.dto.GeocodeResponse;
import com.roadtrip.geospatial.service.AzureMapsService;
import com.roadtrip.geospatial.service.MapboxService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GeospatialController.class)
class GeospatialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MapboxService mapboxService;

    @MockBean
    private AzureMapsService azureMapsService;

    @Test
    void geocode_validQuery_returnsCoordinates() throws Exception {
        var response = new GeocodeResponse(
            List.of(-122.4194, 37.7749), "San Francisco, CA");
        when(mapboxService.geocode("San Francisco")).thenReturn(response);

        mockMvc.perform(get("/api/geocode").param("q", "San Francisco"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.placeName").value("San Francisco, CA"))
            .andExpect(jsonPath("$.coordinates[0]").value(-122.4194))
            .andExpect(jsonPath("$.coordinates[1]").value(37.7749));
    }

    @Test
    void geocode_missingQuery_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/geocode"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void geocode_addressNotFound_returns404() throws Exception {
        when(mapboxService.geocode("xyznoplace"))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        mockMvc.perform(get("/api/geocode").param("q", "xyznoplace"))
            .andExpect(status().isNotFound());
    }
}
```

---

### Exercise 7B — Service Tests with Mockito

**Step 1: Generate a unit test for MapboxService**

Open `MapboxService.java`, select the `geocode` method, then use Copilot Chat:

```
Context: Spring Boot @Service that uses WebClient to call Mapbox Geocoding API.
    The service is constructor-injected with WebClient.Builder and @Value token/baseUrl.
    We need pure unit tests with @ExtendWith(MockitoExtension.class), NOT @SpringBootTest.

Objective: Generate unit tests for MapboxService.geocode() without starting Spring context.

Requirements:
    - Test 1: Valid query returns GeocodeResponse with coordinates and placeName
    - Test 2: Null/blank token throws ResponseStatusException(500)
    - Test 3: Mapbox returns empty features → throws ResponseStatusException(404)
    - Mock the WebClient chain: get() → uri() → retrieve() → bodyToMono() → block()
    - Use @InjectMocks for MapboxService, @Mock for WebClient

Examples:
    // Mocking a WebClient chain:
    when(webClient.get()).thenReturn(requestHeadersUriSpec);
    when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
    when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockData));
```

**Expected Copilot Suggestion**:
```java
@ExtendWith(MockitoExtension.class)
class MapboxServiceTest {

    @Mock private WebClient webClient;
    @Mock private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock private WebClient.RequestHeadersSpec requestHeadersSpec;
    @Mock private WebClient.ResponseSpec responseSpec;

    private MapboxService mapboxService;

    @BeforeEach
    void setUp() {
        WebClient.Builder builder = mock(WebClient.Builder.class);
        when(builder.baseUrl(anyString())).thenReturn(builder);
        when(builder.build()).thenReturn(webClient);
        mapboxService = new MapboxService(builder, "https://api.mapbox.com", "test-token");
    }

    @Test
    void geocode_validQuery_returnsGeocodeResponse() {
        Map<String, Object> geometry = Map.of("coordinates", List.of(-122.4194, 37.7749));
        Map<String, Object> feature = Map.of(
            "geometry", geometry,
            "place_name", "San Francisco, CA"
        );
        Map<String, Object> mockData = Map.of("features", List.of(feature));

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class)))
            .thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockData));

        GeocodeResponse result = mapboxService.geocode("San Francisco");

        assertNotNull(result);
        assertEquals("San Francisco, CA", result.placeName());
        assertEquals(-122.4194, result.coordinates().get(0));
    }

    @Test
    void geocode_blankToken_throwsServerError() {
        WebClient.Builder builder = mock(WebClient.Builder.class);
        when(builder.baseUrl(anyString())).thenReturn(builder);
        when(builder.build()).thenReturn(webClient);
        MapboxService serviceNoToken = new MapboxService(builder, "https://api.mapbox.com", "");

        assertThrows(ResponseStatusException.class,
            () -> serviceNoToken.geocode("test"));
    }
}
```

---

### Exercise 7C — Debug a Failing Test

**Step 1: Introduce a deliberate bug in a test:**
```java
@Test
void geocode_validQuery_returnsCoordinates() throws Exception {
    var response = new GeocodeResponse(
        List.of(-122.4194, 37.7749), "San Francisco, CA");
    when(mapboxService.geocode("San Francisco")).thenReturn(response);

    mockMvc.perform(get("/api/geocode").param("q", "San Francisco"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.placeName").value("Los Angeles, CA"));  // ← BUG!
}
```

**Step 2: Run the test and see the failure:**
```bash
cd backend-java && ./mvnw test -Dtest=GeospatialControllerTest#geocode_validQuery_returnsCoordinates
```

**Step 3: Select the failing test and use Copilot Chat (`Ctrl+I`):**
```
Context: This MockMvc test is failing with:
    java.lang.AssertionError: JSON path "$.placeName"
    Expected: Los Angeles, CA
    Actual: San Francisco, CA
Objective: Fix the assertion to match the actual mock data.
Requirements: The assertion should match the GeocodeResponse we set up in the mock.
Examples: We mocked geocode() to return placeName "San Francisco, CA",
    so the assertion should expect "San Francisco, CA".
```

**Copilot fixes the line:**
```java
.andExpect(jsonPath("$.placeName").value("San Francisco, CA"));  // ← FIXED
```

---

### Testing Commands Summary

| Command | What It Does |
|---------|-------------|
| `./mvnw test` | Run all tests |
| `./mvnw test -Dtest=GeospatialControllerTest` | Run one test class |
| `./mvnw test -Dtest=GeospatialControllerTest#geocode_validQuery_returnsCoordinates` | Run one test method |
| `./mvnw test -Dtest='!*IntegrationTest'` | Exclude integration tests |
| `./mvnw test -pl backend-java` | Run tests for a specific module |
| `/tests` (Copilot Chat) | Generate tests for selected code |
| `/fix` (Copilot Chat) | Fix a failing test or broken code |
| `@workspace /tests` | Generate tests based on project-wide patterns |

### Test Prompt Tips (CORE)

```java
// ❌ Vague — generates generic tests with wrong annotations
// Test the geocode endpoint

// ✅ CORE — generates targeted, Spring-specific tests
// Context: Spring Boot 3 REST controller with @WebMvcTest and @MockBean.
//     MapboxService injected via constructor.
// Objective: Test geocode endpoint with MockMvc
// Requirements: Success case (200), missing param (400), not found (404)
// Examples: Follow healthCheck_returnsHealthy() pattern with jsonPath assertions
```

---

## Demo 8: Copilot CLI (15 min)

### Learning Objective
Use GitHub Copilot CLI to generate shell commands and scripts from natural language.

### Scenario
Generate Maven, Docker, and Azure deployment commands specific to the Java backend without memorizing CLI syntax.

### Prerequisites
```bash
# Verify Copilot CLI is installed
gh copilot --version

# If not installed:
gh extension install github/gh-copilot
```

---

### Step 1: Explain the Java Dockerfile

```bash
gh copilot explain "docker build -f backend-java/Dockerfile -t roadtrip-java:latest ./backend-java"
```

**Expected Explanation**:
```
This command builds a Docker image from the Java backend:

- docker build: Build an image from a Dockerfile
- -f backend-java/Dockerfile: Path to the Dockerfile (multi-stage Maven + JRE)
- -t roadtrip-java:latest: Tag the image as roadtrip-java:latest
- ./backend-java: Build context directory (where files are sent to Docker daemon)

The Dockerfile uses multi-stage build:
  Stage 1 (maven:3.9.6-eclipse-temurin-21): Compiles Java source and packages JAR
  Stage 2 (eclipse-temurin:21-jre): Copies only the JAR for a smaller runtime image
```

---

### Step 2: Explain the multi-stage Dockerfile content

```bash
gh copilot explain "FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY pom.xml ./
RUN mvn dependency:go-offline -B
COPY src/ ./src/
RUN mvn package -DskipTests -B
FROM eclipse-temurin:21-jre
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]"
```

**Expected Explanation**:
```
This multi-stage Dockerfile optimizes Java builds:

Stage 1 — Build:
- Uses Maven 3.9.6 with Eclipse Temurin JDK 21
- Copies pom.xml FIRST for dependency layer caching
- mvn dependency:go-offline downloads all deps (cached unless pom.xml changes)
- Then copies source code and builds the JAR
- -DskipTests skips test execution during Docker build
- -B runs Maven in non-interactive (batch) mode

Stage 2 — Runtime:
- Uses eclipse-temurin:21-jre (JRE only, ~150MB smaller than JDK)
- Copies only the built JAR from stage 1
- ENTRYPOINT runs the Spring Boot fat JAR

Key benefit: Source code and Maven cache are NOT in the final image.
```

---

### Step 3: Generate Maven and Docker commands

**Build and test:**
```bash
gh copilot suggest "run Spring Boot Java tests with Maven wrapper, show test names, and skip integration tests"
```

**Expected:**
```bash
cd backend-java && ./mvnw test -Dtest='!*IntegrationTest' -Dsurefire.printSummary=true
```

**Run with a profile:**
```bash
gh copilot suggest "start the Spring Boot app from backend-java with the 'dev' profile on port 8082 using Maven wrapper"
```

**Expected:**
```bash
cd backend-java && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments="--server.port=8082"
```

**Build Docker image and deploy:**
```bash
gh copilot suggest "build the Java backend Docker image from backend-java, tag for Azure Container Registry roadtripacr, push it, and deploy to Container App roadtrip-java in resource group aps-demo-rg"
```

**Expected:**
```bash
# Build and push
docker build -t roadtripacr.azurecr.io/java-backend:latest ./backend-java
az acr login --name roadtripacr
docker push roadtripacr.azurecr.io/java-backend:latest

# Deploy to Container Apps
az containerapp update \
  --name roadtrip-java \
  --resource-group aps-demo-rg \
  --image roadtripacr.azurecr.io/java-backend:latest \
  --set-env-vars "MAPBOX_TOKEN=secretref:mapbox-token" "AZURE_MAPS_KEY=secretref:azure-maps-key"
```

---

### Step 4: Generate a deployment script

```bash
gh copilot suggest "create a bash script that builds the backend-java Docker image with the current git commit as tag, pushes to ACR, and deploys to Azure Container Apps with environment variables for MAPBOX_TOKEN and AZURE_MAPS_KEY from Azure Key Vault"
```

**Expected Script:**
```bash
#!/bin/bash
set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-aps-demo-rg}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-roadtripacr}"
APP_NAME="${APP_NAME:-roadtrip-java}"
GIT_TAG=$(git rev-parse --short HEAD)

echo "Building Java backend with tag: ${GIT_TAG}"
docker build -t ${CONTAINER_REGISTRY}.azurecr.io/java-backend:${GIT_TAG} ./backend-java

echo "Pushing to ACR..."
az acr login --name ${CONTAINER_REGISTRY}
docker push ${CONTAINER_REGISTRY}.azurecr.io/java-backend:${GIT_TAG}

echo "Deploying to Container Apps..."
az containerapp update \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --image ${CONTAINER_REGISTRY}.azurecr.io/java-backend:${GIT_TAG}

echo "✓ Deployed java-backend:${GIT_TAG}"
```

---

### Step 5: Docker Compose for the Java service

```bash
gh copilot suggest "start only the Java backend from docker-compose, rebuild the image, and tail its logs"
```

```bash
gh copilot explain "docker compose up --build backend-java -d && docker compose logs --tail=50 -f backend-java"
```

---

### Teaching Points

> 💻 **Copilot CLI Commands**:
> - `gh copilot suggest "..."` — Generate command from description
> - `gh copilot explain "..."` — Explain what a command does
> - `ghcs` / `ghce` — Shortcuts for suggest/explain

### Practical Examples (Java-Focused)

| Natural Language | Generated Command |
|-----------------|-------------------|
| "Run all Java tests with verbose output" | `cd backend-java && ./mvnw test -Dsurefire.useFile=false` |
| "Run Spring Boot with debug logging" | `cd backend-java && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--logging.level.com.roadtrip=DEBUG"` |
| "Package the JAR skipping tests" | `cd backend-java && ./mvnw package -DskipTests` |
| "Check Maven dependency tree for conflicts" | `cd backend-java && ./mvnw dependency:tree` |
| "Run a specific test class" | `cd backend-java && ./mvnw test -Dtest=GeospatialControllerTest` |
| "Check which process is using port 8082" | `lsof -i :8082` |
| "Tail Spring Boot logs for errors only" | `docker compose logs -f backend-java 2>&1 \| grep -i error` |

---

## Workshop Summary & Key Takeaways

### CORE Framework Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PROMPT FRAMEWORK                     │
├─────────────────────────────────────────────────────────────┤
│  C = Context      Spring Boot, @Service, @RestController     │
│  O = Objective    Create, explain, refactor, test, fix       │
│  R = Requirements Annotations, types, WebClient, records     │
│  E = Examples     Existing records, existing controllers     │
├─────────────────────────────────────────────────────────────┤
│  TEMPLATE:                                                   │
│  "Context:      In this Spring Boot @Service, working with   │
│                 WebClient and MapboxService..."               │
│  "Objective:    Create / Explain / Test [specific thing]"    │
│  "Requirements: Must include [@GetMapping, @RequestParam,    │
│                 ResponseEntity<T>]..."                        │
│  "Examples:     Follow GeocodeResponse / geocode() pattern"  │
└─────────────────────────────────────────────────────────────┘
```

### Techniques Comparison Matrix (Java)

| # | Technique | When to Use | Trigger | Java File(s) |
|---|-----------|-------------|---------|--------------|
| 1 | **Inline Suggestions** | Pattern-based code (Map.of, @GetMapping) | Just type | `HealthController.java`, `MapboxService.java` |
| 2 | **Prompting** | Complex record DTOs with validation | Javadoc `/** ... */` | `dto/RouteOptimizationDto.java` |
| 3 | **Comment-Based** | New controller endpoints | `// CORE comment` + method signature | `GeospatialController.java` |
| 4 | **Code Explanations** | Understanding WebClient chains, configs | `/explain` + CORE prompt | `MapboxService.java`, `CorsConfig.java` |
| 5 | **Refactoring** | Duplicate validation, inconsistent patterns | `/refactor` + `@workspace` | `MapboxService.java`, `AzureMapsService.java` |
| 6 | **Copilot Chat** | Architecture questions, debugging | `Ctrl+Shift+I` + CORE | Any file |
| 7 | **Few-Shot** | New records matching project conventions | 2-3 Examples + NOW CREATE | `dto/` package |
| 8 | **Testing** | JUnit 5 + MockMvc + Mockito | `/tests` + CORE | `GeospatialControllerTest.java` |
| 9 | **CLI** | Maven/Docker/Azure commands | `gh copilot suggest` | Terminal |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                  COPILOT QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab          Accept full suggestion                        │
│   Ctrl+→       Accept word-by-word (Cmd+→ on Mac)           │
│   Alt+]        Next suggestion                               │
│   Esc          Dismiss                                       │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT                                                 │
│   Ctrl+I       Inline chat (quick question)                  │
│   Ctrl+Shift+I Chat panel (longer conversations)             │
│   /explain     Explain selected code                         │
│   /fix         Fix errors in selection                       │
│   /tests       Generate tests                                │
│   /refactor    Refactor selected code                        │
│   @workspace   Search/query entire codebase                  │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CLI                                                  │
│   gh copilot suggest "..."    Generate command               │
│   gh copilot explain "..."    Explain command                │
│   ghcs / ghce                 Shortcuts                      │
└─────────────────────────────────────────────────────────────┘
```

### Java-Specific Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Copilot generates POJO instead of `record` | Show existing records as examples in prompt |
| Copilot adds Lombok `@Data` annotations | Records don't need Lombok — reject and re-prompt |
| `Map.of()` limited to 10 entries | Use `Map.ofEntries(Map.entry(...), ...)` for larger maps |
| `.block()` in a WebFlux reactive app | Only use `.block()` in Spring MVC servlet apps — never in WebFlux |
| Accepting `@Autowired` on fields | Project uses constructor injection — reject field injection |
| Raw types without `@SuppressWarnings` | Add `@SuppressWarnings("unchecked")` for `Map` casts from Jackson |
| Copilot uses `double[]` for coordinates | Project uses `List<Double>` — Jackson handles lists better |
| Missing `@MockBean` in `@WebMvcTest` | All Spring beans used by controller must be mocked |
| Accepting without running tests | Always verify: `./mvnw test` after every code change |

---

## Hands-On Exercise (Optional - 15 min)

**Challenge**: Use ALL 9 techniques with CORE prompts to add a "Bookmark" feature to the Java geospatial service.

1. **Inline Suggestions**: Open `HealthController.java`, type a new endpoint `@GetMapping("/health/bookmarks")` and let Copilot suggest a response with `Map.of("bookmarkService", "active")`

2. **Prompting (CORE)**: Create `dto/BookmarkDto.java` with:
   - `BookmarkRequest` record: `double longitude, double latitude, String name, String category`
   - `BookmarkResponse` record: `String id, BookmarkRequest bookmark, Instant createdAt`
   - Write a full Javadoc CORE prompt referencing existing record patterns

3. **Comment-Based Generation**: In `GeospatialController.java`, write a CORE comment and create:
   - `POST /api/bookmarks` — accepts `BookmarkRequest`, returns `BookmarkResponse`
   - `GET /api/bookmarks/nearby` — accepts `lng`, `lat`, `radius` params

4. **Code Explanations**: Select `AzureMapsService.searchPlaces()` and ask Copilot to explain the Azure Maps → GeoJSON transformation — trace a "restaurant" query with proximity bias

5. **Refactoring**: Use `@workspace` to find all `ResponseEntity.ok(...)` calls in the controller and ask Copilot to extract a shared response builder utility

6. **Copilot Chat**: Ask `@workspace` where bookmark data should persist — Copilot should note there's no database in the Java service (it's a proxy), so bookmarks need an in-memory cache or a new datastore

7. **Few-Shot Prompting**: Show `GeocodeResponse` and `DirectionsResponse` as examples, then create `BookmarkListResponse` record with `List<BookmarkResponse> bookmarks, int totalCount`

8. **Unit Testing**: Generate `@WebMvcTest` tests for the bookmark endpoints:
   - `POST /api/bookmarks` returns 200 with valid request
   - `POST /api/bookmarks` returns 400 with missing coordinates
   - `GET /api/bookmarks/nearby` returns 200 with mock data

9. **Copilot CLI**: Generate commands:
   ```bash
   gh copilot suggest "run only bookmark-related Java tests with Maven"
   gh copilot suggest "rebuild the Java backend Docker container and restart it with docker compose"
   ```

**Verification**:
```bash
# Run all tests
cd backend-java && ./mvnw test

# Run bookmark tests only
cd backend-java && ./mvnw test -Dtest='*Bookmark*'

# Rebuild and restart the Java service
docker compose up --build backend-java -d && docker compose logs -f backend-java
```

---

## Next Workshop Preview

**Workshop 3: Advanced Web Development**
- **Copilot Edits**: Multi-file changes in one operation
- **Custom Instructions**: Project-specific `.github/copilot-instructions.md`
- **Agent Mode**: Autonomous multi-step workflows
- **Workspace Agents**: `@workspace`, `@vscode`, `@terminal`
- **MCP Servers**: Connecting to external tools and APIs

**Preparation**:
- Review `.github/copilot-instructions.md`
- Explore Copilot Edits panel (`Ctrl+Shift+I` → Edits tab)
- Read `ROADMAP.md` for project context
- Ensure you can run: `cd backend-java && ./mvnw spring-boot:run`

---

## Resources

- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Copilot CLI**: https://githubnext.com/projects/copilot-cli
- **Spring Boot 3 Reference**: https://docs.spring.io/spring-boot/docs/current/reference/html/
- **Spring WebClient Guide**: https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html
- **JUnit 5 User Guide**: https://junit.org/junit5/docs/current/user-guide/
- **MockMvc Testing**: https://docs.spring.io/spring-framework/reference/testing/spring-mvc-test-framework.html
- **Java Records**: https://docs.oracle.com/en/java/javase/21/language/records.html
- **Maven Wrapper**: https://maven.apache.org/wrapper/
- **Project Documentation**: `docs/PROJECT_INSTRUCTIONS.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **ROADMAP**: `ROADMAP.md`

**Questions?** Proceed to Workshop 3 or ask for clarification.
