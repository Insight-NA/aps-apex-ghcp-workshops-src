---
applyTo: "backend-java/**/*.java,backend-java/**/pom.xml"
---
# Java / Spring Boot 3 — Geospatial Service Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these Java-specific rules.

## Stack (Non-Negotiable)
- **Framework**: Spring Boot 3 — no Quarkus, Micronaut, or Jakarta EE
- **Build**: Maven (mvnw wrapper included) — do not switch to Gradle
- **Java version**: 21 (LTS)
- **Responsible for**: Geocoding, directions, POI search, route optimisation — **nothing else**
- **External proxies**: Mapbox API and Azure Maps — always server-side, never expose tokens to frontend

## Project Structure
```
backend-java/src/main/java/com/roadtrip/geospatial/
  controller/   # REST controllers (@RestController)
  service/      # Business logic — Mapbox & Azure Maps proxy services
  dto/          # Data Transfer Objects (request/response POJOs)
  config/       # Spring config (@Configuration, @Value properties)
  exception/    # Custom exceptions + @ControllerAdvice handler
```
- **Do NOT** add trip CRUD or auth logic here — those belong in the Python backend

## Code Documentation Standards

Every Java file Copilot generates or modifies **must** include documentation. No exceptions.

### Class / Record / Interface level (mandatory)
Every type must open with a Javadoc block describing:
- **What it is** — one-sentence summary
- **Responsibility** — what it does, carries, or transforms
- **Context** — which endpoint(s) or use-case it serves

```java
// ❌ WRONG — no documentation
public record GeocodeResponse(List<Double> coordinates, String placeName) {}

// ✅ CORRECT — class-level Javadoc with @param for each record component
/**
 * Response payload for the geocoding endpoint ({@code GET /api/geocode}).
 *
 * <p>Wraps the first Mapbox Places result, normalised to GeoJSON coordinate
 * order so the frontend Mapbox GL layer can consume it directly.
 *
 * @param coordinates geographic position as {@code [longitude, latitude]} (GeoJSON order)
 * @param placeName   human-readable display name returned by Mapbox
 */
public record GeocodeResponse(
        List<Double> coordinates, // [longitude, latitude] — GeoJSON order, never [lat, lng]
        String placeName
) {}
```

### Method level (mandatory for all public methods)
Every public method must have a Javadoc block with:
- One-sentence summary on the first line
- `@param` for every parameter
- `@return` unless the return type is `void`
- `@throws` for every declared exception or explicitly thrown `ResponseStatusException`

```java
// ❌ WRONG — no documentation
public GeocodeResponse geocode(String query) { ... }

// ✅ CORRECT
/**
 * Geocodes a free-text address query via the Mapbox Geocoding API.
 *
 * @param query free-text address or place name (e.g. {@code "Eiffel Tower, Paris"})
 * @return resolved coordinates and display name for the first result
 * @throws ResponseStatusException {@code 404} if no result is found;
 *                                 {@code 502} if Mapbox returns no response
 */
public GeocodeResponse geocode(String query) { ... }
```

### Inline comments (mandatory for non-obvious logic)
Add inline `//` comments wherever logic is not self-evident — API response parsing,
coordinate transforms, error-code mapping, and domain rules:

```java
// Parse proximity: frontend sends "lng,lat" — split in GeoJSON order
String[] parts = proximity.split(",");
double lon = Double.parseDouble(parts[0]); // longitude first (GeoJSON spec)
double lat = Double.parseDouble(parts[1]); // latitude second

// Azure Maps ranks by relevance; cap at 10 to match the Mapbox parity contract
List<Map<String, Object>> results = rawResults.subList(0, Math.min(10, rawResults.size()));
```

### Constants (mandatory — no magic strings)
Every repeated string literal must be a named `private static final` constant:

```java
// ❌ WRONG
if ("driving".equals(profile)) { ... }

// ✅ CORRECT
private static final String DEFAULT_DRIVING_PROFILE = "driving";
private static final String GEOJSON_FEATURE_TYPE    = "Feature";
private static final String GEOJSON_POINT_TYPE      = "Point";
```

## Controller Rules
```java
// ❌ WRONG — business logic in controller
@GetMapping("/directions")
public ResponseEntity<DirectionsResponse> getDirections(@RequestParam String origin) {
    // 60 lines of Mapbox call + parsing
}

// ✅ CORRECT — thin controller with Javadoc, delegates to service
/**
 * REST controller for turn-by-turn driving directions.
 *
 * <p>All routing logic is delegated to {@link DirectionsService}; this class
 * handles only request validation and HTTP response wrapping.
 */
@RestController
@RequestMapping("/api/directions")
@RequiredArgsConstructor
public class DirectionsController {

    private final DirectionsService directionsService;

    /**
     * Returns driving directions between two or more waypoints.
     *
     * @param request validated request containing coordinate string and driving profile
     * @return route with distance, duration, GeoJSON geometry, and leg details
     */
    @GetMapping
    public ResponseEntity<DirectionsResponse> getDirections(
            @Valid @ModelAttribute DirectionsRequest request) {
        return ResponseEntity.ok(directionsService.getDirections(request));
    }
}
```
- All controllers must use constructor injection (`@RequiredArgsConstructor`)
- Validate all input with Bean Validation (`@Valid`, `@NotBlank`, `@NotNull`)
- Return `ResponseEntity<T>` — never raw objects
- Every controller class and public method **must** have a Javadoc block — see [Code Documentation Standards](#code-documentation-standards)

## Service Rules
- External API calls belong exclusively in service classes
- Prefer `WebClient` (reactive, non-blocking) over `RestTemplate` — **never** `HttpURLConnection`
- Read tokens from `@Value("${geospatial.mapbox.token}")` — never hardcode API keys
- Handle API errors gracefully; map external HTTP status codes to Spring `ResponseStatusException`
- Every service class **must** carry a class-level Javadoc describing which external API it wraps and what it transforms
- Every public method **must** carry a method-level Javadoc — see [Code Documentation Standards](#code-documentation-standards)

## DTOs

### Rules
- Use **Java Records** for immutable DTOs (Java 21) — prefer records over mutable classes
- All coordinates: `[longitude, latitude]` — **GeoJSON order** — never `[lat, lng]`
- Every DTO record or class **must** have a class-level Javadoc explaining:
  - What data it carries
  - Which endpoint(s) use it and whether it is a request payload, response payload, or internal transfer
  - Any normalisation or transformation applied to the raw external API data
- Validation annotations (`@NotBlank`, `@NotEmpty`, `@Positive`) are mandatory on **request** DTOs
- Non-obvious record components must carry an inline `//` comment

### Request DTO example (with validation + Javadoc)
```java
/**
 * Query parameters for the directions endpoint ({@code GET /api/directions}).
 *
 * <p>Coordinates are passed as a semicolon-separated string in
 * {@code "lng,lat;lng,lat"} format to match the Mapbox Directions API v5 convention.
 *
 * @param coords  semicolon-separated waypoints as {@code lng,lat} pairs (GeoJSON order)
 * @param profile Mapbox routing profile; the controller defaults this to {@code "driving"}
 */
public record DirectionsRequest(
        @NotBlank String coords,  // e.g. "-0.1278,51.5074;2.3522,48.8566"
        @NotBlank String profile  // "driving" | "walking" | "cycling" | "driving-traffic"
) {}
```

### Response DTO example (GeoJSON-compatible)
```java
/**
 * Route result returned by the directions endpoint ({@code GET /api/directions}).
 *
 * <p>Fields mirror the Mapbox Directions API v5 route object so the frontend
 * Mapbox GL layer can consume the response without client-side transformation.
 *
 * @param distance total route distance in metres
 * @param duration estimated travel time in seconds
 * @param geometry GeoJSON LineString geometry object for map polyline rendering
 * @param legs     individual route segments between consecutive waypoints
 */
public record DirectionsResponse(
        double distance,                      // metres
        double duration,                      // seconds
        Map<String, Object> geometry,         // GeoJSON LineString
        List<Map<String, Object>> legs        // one entry per waypoint pair
) {}
```

### Nested DTO container (group tightly-coupled types in one file)
```java
/**
 * Consolidated DTOs for the route-optimisation endpoint ({@code POST /api/optimize}).
 *
 * <p>Groups {@link WaypointDto} and {@link RouteOptimizationRequest} together so
 * imports stay clean. Use this pattern when request/response types are tightly
 * coupled and would not be reused independently across packages.
 */
public final class RouteOptimizationDto {

    private RouteOptimizationDto() {} // utility container — not instantiable

    /**
     * A single geographic stop on an optimised route.
     * Coordinates follow the GeoJSON convention: longitude before latitude.
     *
     * @param longitude WGS-84 longitude (x axis, range −180 to +180)
     * @param latitude  WGS-84 latitude  (y axis, range −90 to +90)
     * @param name      optional human-readable label displayed in the UI
     */
    public record WaypointDto(
            double longitude, // GeoJSON order: longitude before latitude
            double latitude,
            String name
    ) {}
}
```

## Error Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(GeocodingException.class)
    public ResponseEntity<ErrorResponse> handle(GeocodingException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```
- Define custom exceptions in `exception/` package
- Use `@ControllerAdvice` for centralised error handling — no try/catch in controllers

## Configuration
- All secrets and URLs in `application.properties` / environment variables:
  ```properties
  mapbox.token=${MAPBOX_TOKEN}
  azure.maps.key=${AZURE_MAPS_KEY}
  ```
- Never hardcode API keys or URLs in Java source files

## Testing

### TDD Mandate — Write the Test First
Follow **Red → Green → Refactor** strictly:
1. **Red** — write a failing test that names the expected behaviour before writing any production code
2. **Green** — write the minimum implementation to make the test pass
3. **Refactor** — improve the code while keeping all tests green

Tests are first-class code: they require the same Javadoc and comment standards as production code.

### BDD Structure — Given / When / Then
All tests must use the **Given-When-Then** narrative, encoded with `@Nested` + `@DisplayName`:

| Phase | Responsibility |
|---|---|
| **Given** | set up preconditions, inputs, and mocked dependencies |
| **When**  | invoke the method or HTTP endpoint under test |
| **Then**  | assert the expected outcome with AssertJ |

### Test Naming Convention
```
should_[expectedBehaviour]_when_[stateUnderTest]

// Examples:
should_returnGeocodeResponse_when_validQueryProvided()
should_throw404_when_addressNotFound()
should_throw502_when_mapboxReturnsNullBody()
should_return400_when_queryParamIsMissing()
```

### Required Libraries (all bundled in `spring-boot-starter-test`)
| Library | Mandatory use |
|---|---|
| JUnit 5 (`@Test`, `@Nested`, `@DisplayName`) | test structure |
| `BDDMockito` (`given`, `then`, `willReturn`) | stubbing and verification |
| AssertJ (`assertThat`, `assertThatThrownBy`) | fluent assertions |
| `@WebMvcTest` + `MockMvc` | controller slice tests |
| `@ExtendWith(MockitoExtension.class)` | service unit tests |

**Never** use JUnit `assertEquals`/`assertTrue` — always AssertJ.  
**Never** use `Mockito.when()`/`Mockito.verify()` — always `BDDMockito.given()`/`BDDMockito.then()`.

### Service Unit Test — BDD Pattern
```java
/**
 * BDD unit tests for {@link MapboxService}.
 *
 * <p>All external HTTP interactions are mocked — no real Mapbox API calls are made.
 */
@ExtendWith(MockitoExtension.class)
class MapboxServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @InjectMocks
    private MapboxService mapboxService;

    @Nested
    @DisplayName("Given a valid address query")
    class GivenValidAddressQuery {

        @Test
        @DisplayName("When geocode() is called, Then it returns coordinates and place name")
        void should_returnGeocodeResponse_when_validQueryProvided() {
            // Given
            GeocodeResponse expected = new GeocodeResponse(List.of(-0.1278, 51.5074), "London, UK");
            given(mapboxService.geocode("London")).willReturn(expected);

            // When
            GeocodeResponse result = mapboxService.geocode("London");

            // Then — AssertJ only, no JUnit assertions
            assertThat(result.coordinates()).containsExactly(-0.1278, 51.5074);
            assertThat(result.placeName()).isEqualTo("London, UK");
            then(mapboxService).should(times(1)).geocode("London");
        }
    }

    @Nested
    @DisplayName("Given Mapbox returns an empty feature list")
    class GivenEmptyFeatureList {

        @Test
        @DisplayName("When geocode() is called, Then it throws 404 ResponseStatusException")
        void should_throw404_when_addressNotFound() {
            // Given — configure WebClient mock to return empty features
            // (use MockWebServer or mock the WebClient chain as appropriate)

            // When / Then
            assertThatThrownBy(() -> mapboxService.geocode("xyzUnknown999"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                            .isEqualTo(HttpStatus.NOT_FOUND));
        }
    }
}
```

### Controller Integration Test — BDD Pattern
```java
/**
 * BDD slice tests for {@link GeospatialController}.
 *
 * <p>Uses {@code @WebMvcTest} to load only the web layer — service beans are replaced
 * with {@code @MockBean} stubs so no real Mapbox or Azure Maps calls are made.
 */
@WebMvcTest(GeospatialController.class)
class GeospatialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    /** Stubbed Mapbox proxy — no real HTTP calls. */
    @MockBean
    private MapboxService mapboxService;

    /** Stubbed Azure Maps proxy — no real HTTP calls. */
    @MockBean
    private AzureMapsService azureMapsService;

    @Nested
    @DisplayName("Given GET /api/geocode")
    class GivenGeocodeEndpoint {

        @Test
        @DisplayName("When a valid 'q' param is supplied, Then 200 OK with coordinates is returned")
        void should_return200_when_validQueryParam() throws Exception {
            // Given
            GeocodeResponse stub = new GeocodeResponse(List.of(-0.1278, 51.5074), "London, UK");
            given(mapboxService.geocode("London")).willReturn(stub);

            // When / Then
            mockMvc.perform(get("/api/geocode").param("q", "London"))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.placeName").value("London, UK"))
                   .andExpect(jsonPath("$.coordinates[0]").value(-0.1278))
                   .andExpect(jsonPath("$.coordinates[1]").value(51.5074));

            then(mapboxService).should(times(1)).geocode("London");
        }

        @Test
        @DisplayName("When 'q' param is missing, Then 400 Bad Request is returned")
        void should_return400_when_queryParamMissing() throws Exception {
            // When / Then — no Given needed; invalid input is the precondition itself
            mockMvc.perform(get("/api/geocode"))
                   .andExpect(status().isBadRequest());
        }
    }
}
```

### Mocking Rules
- **Never** hit real Mapbox or Azure Maps APIs in any test
- Use `MockWebServer` (OkHttp) to mock `WebClient` HTTP responses in service unit tests
- Use `@MockBean` to replace services in `@WebMvcTest` controller tests
- Stub with `BDDMockito.given(mock.method(arg)).willReturn(value)`
- Verify with `BDDMockito.then(mock).should(times(n)).method(arg)`

### AssertJ — Fluent Assertion Rules
```java
// ❌ WRONG — JUnit assertions
assertEquals("London, UK", result.placeName());
assertTrue(result.coordinates().size() == 2);
assertNotNull(result);

// ✅ CORRECT — AssertJ
assertThat(result.placeName()).isEqualTo("London, UK");
assertThat(result.coordinates()).hasSize(2);
assertThat(result).isNotNull();
```

### Maven Test Commands
```bash
cd backend-java
./mvnw test                                        # All tests
./mvnw test -Dtest=MapboxServiceTest               # Single class
./mvnw test -Dtest=GeospatialControllerTest        # Controller slice
./mvnw test -Dtest="*ServiceTest,*ControllerTest"  # Pattern match
```
