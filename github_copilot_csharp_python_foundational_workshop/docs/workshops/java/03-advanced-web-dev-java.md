# Workshop 3: Advanced Java Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations with hands-on exercises  
**Audience**: Java/Spring Boot developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, Spring Boot 3, JUnit 5 fundamentals

---

## Learning Objectives

By the end of this workshop, you will master these **8 advanced Copilot techniques** — all applied to **Java testing and development** using real code from the Road Trip Planner's `backend-java/` geospatial service:

1. **[Chain-of-Thought Prompting](#demo-1-chain-of-thought-prompting-10-min)** — Break complex test scenarios into logical reasoning steps
2. **[Tree of Thought Prompting](#demo-2-tree-of-thought-prompting-10-min)** — Explore multiple test strategy branches simultaneously, evaluate tradeoffs, and converge on the optimal approach
3. **[Instruction Files](#demo-3-instruction-files-8-min)** — Customize `.github/instructions/java.instructions.md` with Java testing rules
4. **[Prompt Files](#demo-4-prompt-files-10-min)** — Create reusable `.prompt.md` files for consistent test generation
5. **[Copilot Code Review](#demo-5-copilot-code-review-10-min)** — Use Copilot to review code for SOLID violations and security issues
6. **[Copilot Plan Mode](#demo-6-copilot-plan-mode-12-min)** — Architect a complete test infrastructure from scratch
7. **[Copilot Coding Agent](#demo-7-copilot-coding-agent-15-min)** — Delegate autonomous multi-file test creation to Copilot
8. **[Architecture & Tech Stack Generation](#demo-8-architecture--tech-stack-generation-10-min)** — Generate test project scaffolding and ADRs

### CORE Prompt Framework

All prompts in this workshop follow the **CORE** framework:

| Element | Meaning | Example |
|---------|---------|---------|
| **C** – Context | Background, tech stack, relevant files | "In the Spring Boot geospatial service (`backend-java/`), `MapboxService.java` proxies to Mapbox API..." |
| **O** – Objective | What you want Copilot to produce | "Generate JUnit 5 tests for the geocoding fallback logic" |
| **R** – Requirements | Constraints, rules, patterns to follow | "Use Mockito for WebClient mocks, AssertJ assertions, `Method_Scenario_Expected` naming" |
| **E** – Examples | Expected inputs/outputs, code patterns | "Input: `geocode('Denver, CO')` → Output: `coordinates = [-104.99, 39.74]`" |

### Codebase Context — What We're Testing

The `backend-java/` service is a Spring Boot 3.3 WebFlux application (Java 21) that provides geospatial services via Mapbox and Azure Maps APIs. **It currently has minimal test coverage.**

| File | Purpose | Key Issues (from Review Plan) |
|------|---------|------------------------------|
| `GeospatialApplication.java` | Spring Boot entry point | Minimal — standard bootstrap |
| `controller/GeospatialController.java` | REST: `/api/geocode`, `/api/directions`, `/api/search`, `/api/optimize` | No input validation, missing `@Valid` |
| `service/MapboxService.java` | Mapbox API proxy (geocoding, directions, optimization) | Hardcoded strings, no error constants |
| `service/AzureMapsService.java` | Azure Maps proxy (POI search, GeoJSON transform) | Complex transform logic, error handling gaps |
| `dto/*.java` | Java records: `GeocodeResponse`, `DirectionsResponse`, `SearchResponse` | No validation annotations |
| `config/WebClientConfig.java` | WebClient configuration | Missing timeouts |
| `tests/` | **Only `contextLoads()` exists — must build from scratch** | Critical gap |

**Reference**: See [JAVA_BACKEND_REVIEW_PLAN.md](../../JAVA_BACKEND_REVIEW_PLAN.md) for the full deficiency analysis.

---

## Workshop Agenda

| Time | Demo | Topic | Testing Focus | Key Files |
|------|------|-------|---------------|-----------|
| 0–10 min | Demo 1 | Chain-of-Thought Prompting | Unit tests, integration tests, mock-based tests | `MapboxService.java`, `GeospatialController.java` |
| 10–20 min | Demo 2 | Tree of Thought Prompting | Test strategy selection, mock architecture decisions | `MapboxService.java`, `AzureMapsService.java` |
| 20–28 min | Demo 3 | Instruction Files | Java testing rules & conventions | `.github/instructions/java.instructions.md` |
| 28–38 min | Demo 4 | Prompt Files | Reusable test generation templates | `.github/prompts/*.prompt.md` |
| 38–48 min | Demo 5 | Copilot Code Review | Code quality review, SOLID analysis | `AzureMapsService.java`, `GeospatialController.java` |
| 48–60 min | Demo 6 | Copilot Plan Mode | Test infrastructure architecture | `tests/` project scaffolding |
| 60–75 min | Demo 7 | Copilot Coding Agent | Autonomous test suite creation | All `backend-java/` files |
| 75–85 min | Demo 8 | Architecture & Tech Stack Generation | Test project + ADR | `pom.xml`, `GlobalExceptionHandler.java` |
| 85–90 min | — | Q&A and Wrap-up | — | — |

---

## Testing Stack Reference

Before diving into demos, here is the Java testing stack used throughout this workshop:

| Package | Version | Purpose |
|---------|---------|---------|
| `spring-boot-starter-test` | 3.3.0 | JUnit 5, Mockito, AssertJ bundled |
| `junit-jupiter` | 5.10+ | Test framework (facts, parameterized tests) |
| `mockito-core` | 5.x | Mocking for dependency injection |
| `assertj-core` | 3.25+ | Fluent assertion syntax (`.assertThat().isEqualTo()`) |
| `spring-boot-starter-webflux` | 3.3.0 | `WebTestClient` for reactive endpoint tests |
| `okhttp3:mockwebserver` | 4.12+ | Mock external HTTP APIs (Mapbox, Azure Maps) |

### Key Testing Conventions

| Convention | Standard | Example |
|------------|----------|---------|
| **Test naming** | `methodName_scenario_expectedBehavior` | `geocode_validQuery_returnsCoordinates` |
| **Test structure** | Arrange-Act-Assert (AAA) | Three clearly separated sections with comments |
| **Assertions** | AssertJ over raw JUnit assertions | `assertThat(result).isNotNull().hasSize(2)` |
| **Mocking** | Mockito with `@Mock` / `@InjectMocks` | `when(webClient.get()).thenReturn(...)` |
| **Integration tests** | `@SpringBootTest` + `@AutoConfigureWebTestClient` | Full context with real DI |
| **Parameterized tests** | `@ParameterizedTest` + `@MethodSource` | One test method, multiple input/output pairs |
| **TDD workflow** | Red → Green → Refactor | Write failing test first, then implementation |

---

## Copilot Keyboard Shortcuts — Quick Reference

| Action | VS Code (macOS) | VS Code (Windows/Linux) | IntelliJ |
|--------|-----------------|-------------------------|----------|
| Accept full suggestion | `Tab` | `Tab` | `Tab` |
| Accept one word | `⌘→` | `Ctrl+→` | `⌥→` |
| Reject suggestion | `Esc` | `Esc` | `Esc` |
| Open Completions Panel | `⌘Enter` | `Ctrl+Enter` | `Alt+\` |
| Trigger suggestion manually | `⌥\` | `Alt+\` | `Alt+\` |
| Open Copilot Chat | `⌃⌘I` | `Ctrl+Shift+I` | via plugin |
| Open Inline Chat | `⌘I` | `Ctrl+I` | via plugin |

**Rule of thumb**: If a suggestion introduces an import you didn't expect, press `Esc` and review the entire block before accepting.

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex test scenarios into step-by-step reasoning chains that guide Copilot toward correct, comprehensive test implementations.

### Scenario
Create three types of tests for the Java geospatial service: a unit test for geocoding logic, an integration test for the controller endpoint, and a mock-based test for the WebClient service layer.

---

### Example 1A: Unit Test — Geocoding Response Parsing (`MapboxService.java`)

**CORE Prompt:**
```
Context: In backend-java/src/main/java/com/roadtrip/geospatial/service/MapboxService.java,
the geocode(String query) method calls Mapbox Geocoding API via WebClient and returns
a GeocodeResponse record with coordinates [lng, lat] and placeName. The method
validates the token, makes a reactive HTTP call, extracts features[0].geometry.coordinates
and features[0].place_name from the JSON response.

The GeocodeResponse record is defined in dto/GeocodeResponse.java as:
  public record GeocodeResponse(List<Double> coordinates, String placeName) {}

Objective: Write JUnit 5 unit tests that verify geocode() correctly parses Mapbox
responses and handles error cases.

Requirements:
- Use @ExtendWith(MockitoExtension.class) for Mockito setup
- Mock WebClient.Builder and the reactive chain (get → uri → retrieve → bodyToMono → block)
- Use AssertJ assertions (.assertThat().isEqualTo(), .isNotNull())
- Follow methodName_scenario_expectedBehavior naming convention
- Arrange-Act-Assert structure with // Arrange, // Act, // Assert comments
- Test both success path and error paths (null response, empty features)

Examples:
- Input: "Denver, CO" → Output: coordinates = [-104.9903, 39.7392], placeName = "Denver, Colorado"
- Input: "nonexistent12345" → Expected: ResponseStatusException with NOT_FOUND
- Input: (Mapbox returns null) → Expected: ResponseStatusException with BAD_GATEWAY

Chain of thought:
Step 1: Create test class with Mockito extension and mock WebClient components
Step 2: Set up mock chain for WebClient.get().uri().retrieve().bodyToMono().block()
Step 3: Test success case — mock returns valid Mapbox JSON structure, verify coordinates extracted
Step 4: Test empty features — mock returns {"features": []}, verify NOT_FOUND thrown
Step 5: Test null response — mock returns null, verify BAD_GATEWAY thrown
Step 6: Verify WebClient was called with correct URI and parameters

Now implement:
```

**Expected Copilot Output:**
```java
package com.roadtrip.geospatial.service;

import com.roadtrip.geospatial.dto.GeocodeResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MapboxServiceGeocodeTest {

    @Mock
    private WebClient.Builder webClientBuilder;
    @Mock
    private WebClient webClient;
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    @Mock
    private WebClient.ResponseSpec responseSpec;

    private MapboxService mapboxService;

    @BeforeEach
    void setUp() {
        // Arrange — set up mock chain
        when(webClientBuilder.baseUrl(any())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        mapboxService = new MapboxService(
            webClientBuilder,
            "https://api.mapbox.com",
            "test-token"
        );
    }

    @Test
    void geocode_validQuery_returnsCoordinates() {
        // Arrange
        Map<String, Object> geometry = Map.of("coordinates", List.of(-104.9903, 39.7392));
        Map<String, Object> feature = Map.of(
            "geometry", geometry,
            "place_name", "Denver, Colorado"
        );
        Map<String, Object> mapboxResponse = Map.of("features", List.of(feature));
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mapboxResponse));

        // Act
        GeocodeResponse result = mapboxService.geocode("Denver, CO");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.coordinates()).containsExactly(-104.9903, 39.7392);
        assertThat(result.placeName()).isEqualTo("Denver, Colorado");
    }

    @Test
    void geocode_emptyFeatures_throwsNotFound() {
        // Arrange
        Map<String, Object> mapboxResponse = Map.of("features", List.of());
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mapboxResponse));

        // Act & Assert
        assertThatThrownBy(() -> mapboxService.geocode("nonexistent12345"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting("status")
            .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void geocode_nullResponse_throwsBadGateway() {
        // Arrange
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.empty());

        // Act & Assert
        assertThatThrownBy(() -> mapboxService.geocode("any query"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting("status")
            .isEqualTo(HttpStatus.BAD_GATEWAY);
    }
}
```

---

### Example 1B: Integration Test — GeospatialController Endpoint

**CORE Prompt:**
```
Context: In backend-java/src/main/java/com/roadtrip/geospatial/controller/GeospatialController.java,
the geocode endpoint (GET /api/geocode?q=<query>) accepts a query parameter, delegates to
MapboxService.geocode(), and returns a GeocodeResponse as JSON. The controller uses
constructor-injected MapboxService.

The app bootstrap is in GeospatialApplication.java with @SpringBootApplication.
For integration tests, we need @SpringBootTest with @AutoConfigureWebTestClient,
replacing MapboxService with a mock to avoid hitting the real Mapbox API.

Objective: Write integration tests for the geocode endpoint covering:
success, missing query parameter, and service exception handling.

Requirements:
- Use @SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
- Use @AutoConfigureWebTestClient for WebTestClient injection
- Use @MockBean to replace MapboxService in Spring context
- Verify HTTP status codes (200, 400, 502) and JSON response body
- AssertJ-style WebTestClient assertions
- Arrange-Act-Assert pattern

Examples:
- GET /api/geocode?q=Denver → 200 + GeocodeResponse JSON
- GET /api/geocode (missing q) → 400 + error message
- GET /api/geocode?q=test (service throws) → 502 + error message

Chain of thought:
Step 1: Create test class with @SpringBootTest and @AutoConfigureWebTestClient
Step 2: Use @MockBean to inject mock MapboxService
Step 3: For success test: configure mock, call endpoint via WebTestClient, verify 200 and JSON
Step 4: For validation test: call without query param, verify 400
Step 5: For error test: configure mock to throw, verify 502

Now implement:
```

**Expected Copilot Output:**
```java
package com.roadtrip.geospatial.controller;

import com.roadtrip.geospatial.dto.GeocodeResponse;
import com.roadtrip.geospatial.service.MapboxService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class GeospatialControllerGeocodeTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private MapboxService mapboxService;

    @Test
    void geocode_validQuery_returnsOkWithCoordinates() {
        // Arrange
        GeocodeResponse mockResponse = new GeocodeResponse(
            List.of(-104.9903, 39.7392),
            "Denver, Colorado"
        );
        when(mapboxService.geocode("Denver")).thenReturn(mockResponse);

        // Act & Assert
        webTestClient.get()
            .uri("/api/geocode?q=Denver")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.coordinates[0]").isEqualTo(-104.9903)
            .jsonPath("$.coordinates[1]").isEqualTo(39.7392)
            .jsonPath("$.placeName").isEqualTo("Denver, Colorado");
    }

    @Test
    void geocode_missingQueryParam_returnsBadRequest() {
        // Act & Assert
        webTestClient.get()
            .uri("/api/geocode")
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void geocode_serviceThrows_returnsBadGateway() {
        // Arrange
        when(mapboxService.geocode(anyString()))
            .thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mapbox unavailable"));

        // Act & Assert
        webTestClient.get()
            .uri("/api/geocode?q=test")
            .exchange()
            .expectStatus().isEqualTo(HttpStatus.BAD_GATEWAY);
    }
}
```

---

### Example 1C: Mock-Based Test — Parameterized Profile Validation

**CORE Prompt:**
```
Context: In backend-java/src/main/java/com/roadtrip/geospatial/service/MapboxService.java,
the getDirections(String coords, String profile) method accepts a profile parameter
that should be one of: "driving", "walking", "cycling", "driving-traffic".

Currently the method passes any profile to Mapbox without validation. We need tests
that verify behavior for valid profiles and document what happens with invalid ones.

Objective: Write parameterized tests that verify getDirections handles all valid
Mapbox profiles and documents behavior for invalid profiles.

Requirements:
- Use @ParameterizedTest with @MethodSource for test data
- Test all 4 valid profiles return successfully
- Test invalid profile handling (current behavior vs expected)
- Use AssertJ assertions
- Include edge cases: null profile, empty string, "DRIVING" (case sensitivity)

Examples:
- Input: coords="lng,lat;lng,lat", profile="driving" → DirectionsResponse with routes
- Input: profile="invalid" → Current: passes to Mapbox (may error) | Expected: validate locally
- Input: profile=null → Current: NullPointerException | Expected: default to "driving"

Chain of thought:
Step 1: Create parameterized test with @MethodSource providing profile test cases
Step 2: Each test case has: profile string, expected behavior (success/error/default)
Step 3: For valid profiles: mock Mapbox success response, verify DirectionsResponse returned
Step 4: For invalid profiles: document current behavior (likely 400 from Mapbox)
Step 5: For null/empty: document current exception vs recommended default behavior

Now implement:
```

**Expected Copilot Output:**
```java
package com.roadtrip.geospatial.service;

import com.roadtrip.geospatial.dto.DirectionsResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MapboxServiceDirectionsProfileTest {

    // ... mock setup similar to Example 1A ...

    private MapboxService mapboxService;

    static Stream<Arguments> validProfiles() {
        return Stream.of(
            Arguments.of("driving", "Standard driving directions"),
            Arguments.of("walking", "Pedestrian directions"),
            Arguments.of("cycling", "Bicycle directions"),
            Arguments.of("driving-traffic", "Driving with live traffic")
        );
    }

    @ParameterizedTest(name = "{0} - {1}")
    @MethodSource("validProfiles")
    @DisplayName("getDirections returns routes for valid Mapbox profiles")
    void getDirections_validProfile_returnsRoutes(String profile, String description) {
        // Arrange
        Map<String, Object> route = Map.of(
            "distance", 15000.0,
            "duration", 900.0,
            "geometry", Map.of("type", "LineString", "coordinates", List.of()),
            "legs", List.of()
        );
        Map<String, Object> mapboxResponse = Map.of("routes", List.of(route));
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mapboxResponse));

        // Act
        DirectionsResponse result = mapboxService.getDirections("-104.99,39.74;-105.01,39.75", profile);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.distance()).isEqualTo(15000.0);
        assertThat(result.duration()).isEqualTo(900.0);
    }

    @ParameterizedTest
    @ValueSource(strings = {"invalid", "DRIVING", "drive", "car"})
    @DisplayName("getDirections with invalid profile - documents current behavior")
    void getDirections_invalidProfile_currentBehavior(String invalidProfile) {
        // NOTE: Current implementation passes invalid profiles to Mapbox
        // which returns 422 Unprocessable Entity
        // RECOMMENDED: Add local validation before API call

        // Arrange — mock Mapbox error response
        when(responseSpec.bodyToMono(Map.class))
            .thenReturn(Mono.error(new RuntimeException("Mapbox returned 422")));

        // Act & Assert — document current behavior
        assertThatThrownBy(() -> 
            mapboxService.getDirections("-104.99,39.74;-105.01,39.75", invalidProfile))
            .isInstanceOf(RuntimeException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("getDirections with null/empty profile - documents exception")
    void getDirections_nullOrEmptyProfile_throwsException(String profile) {
        // NOTE: Current implementation throws NullPointerException/empty string error
        // RECOMMENDED: Default to "driving" when profile is null/empty

        // Act & Assert — document current behavior
        assertThatThrownBy(() -> 
            mapboxService.getDirections("-104.99,39.74;-105.01,39.75", profile))
            .isInstanceOf(Exception.class);
    }
}
```

---

### Teaching Points

| Chain-of-Thought Element | Unit Test (1A) | Integration Test (1B) | Parameterized Test (1C) |
|-------------------------|----------------|----------------------|------------------------|
| Step 1: Setup | `@ExtendWith(MockitoExtension)` | `@SpringBootTest` + `@AutoConfigureWebTestClient` | `@MethodSource` data provider |
| Step 2: Mocking | Mock WebClient reactive chain | `@MockBean MapboxService` | Same as 1A + parameterized data |
| Step 3: Success path | Valid Mapbox JSON → coordinates | HTTP 200 + JSON body assertions | All 4 valid profiles succeed |
| Step 4: Error path | Empty features → NOT_FOUND | Missing param → 400 | Invalid profiles documented |
| Step 5: Edge cases | Null response → BAD_GATEWAY | Service throws → 502 | Null/empty profile behavior |

**When to Use**: Multi-path business logic, external API integration, profile/type validation  
**Avoid**: Simple DTO construction tests, trivial getters/setters

---

### Exercise 1: Try It Yourself

**Setup**: Open `backend-java/src/test/java/com/roadtrip/geospatial/` and create a new test class.

**Challenge 1A**: Write a Chain-of-Thought prompt to generate tests for `AzureMapsService.searchPlaces()`. Include:
- Success case with valid POI results
- Empty results handling
- Azure Maps API error handling (401, 403, 500)

**Challenge 1B**: Create an integration test for `GET /api/directions` endpoint with these scenarios:
- Valid coordinates and profile
- Invalid coordinate format
- Missing required parameters

**Expected Time**: 15-20 minutes

---

## Demo 2: Tree of Thought Prompting (10 min)

### Objective
Learn to prompt Copilot with branching "what-if" reasoning — exploring multiple test strategies simultaneously, evaluating their tradeoffs against real constraints, and converging on the optimal approach.

### Scenario
Three real design decisions from the `backend-java/` codebase where there is no single obvious answer: choosing a testing strategy for external API services, selecting a mock architecture for WebClient, and deciding how to structure test fixtures.

### How Tree of Thought Differs from Chain-of-Thought

| | Chain-of-Thought (Demo 1) | Tree of Thought (Demo 2) |
|--|--------------------------|--------------------------|
| **Structure** | Linear steps 1 → 2 → 3 → result | Branches A / B / C → evaluate each → select best |
| **Best for** | Known single path, decomposing test bodies | Ambiguous decisions with multiple valid approaches |
| **Copilot role** | Execute a pre-decided strategy | Evaluate alternatives and recommend with rationale |
| **Java testing use** | Writing a specific test method | Choosing test strategy, mock architecture, fixture approach |
| **CORE emphasis** | Strong **R**equirements + **E**xamples | Strong **O**bjective (decision) + **R**equirements (constraints) |

---

### Example 2A: Test Strategy Decision — How Should We Test External API Services?

**CORE Prompt:**
```
Context: In backend-java/service/, we have MapboxService.java and AzureMapsService.java
that make HTTP calls to external APIs using Spring WebClient. These services:
1. Construct URLs with query parameters
2. Send HTTP requests via WebClient
3. Parse JSON responses into DTOs (GeocodeResponse, DirectionsResponse, SearchResponse)
4. Handle errors (401, 404, 500) and transform to ResponseStatusException

The services use @Value for API tokens/keys from application.yml.
Tests must pass in CI without real API credentials.

Objective: Decide the optimal testing strategy for external API services by evaluating
three branches simultaneously. Pick the best approach and explain why.

Requirements:
- Tests must pass in CI with no Mapbox/Azure credentials
- Target ≥ 80% code coverage on service classes
- Must use JUnit 5 + Mockito + AssertJ (established stack)
- Should test URL construction, response parsing, and error handling
- CI should complete in < 30 seconds for service tests

Branch A — Mock WebClient at the reactive level:
  - Use Mockito to mock WebClient.Builder, WebClient, RequestHeadersUriSpec, etc.
  - Pro: Pure unit tests, no HTTP involved, very fast
  - Con: Complex mock setup (5+ layers of reactive chain), brittle if WebClient usage changes
  - Estimated coverage: ~90% on business logic, ~60% on HTTP handling

Branch B — Use MockWebServer (OkHttp) to mock HTTP responses:
  - Start MockWebServer in @BeforeEach, configure response JSON
  - Pro: Tests real HTTP, validates URL construction, simpler setup
  - Con: Slightly slower (real HTTP localhost), requires okhttp dependency
  - Estimated coverage: ~95% including HTTP layer

Branch C — Use WireMock for advanced HTTP mocking:
  - Configure WireMock stubs for Mapbox/Azure Maps endpoints
  - Pro: Most realistic, supports complex scenarios (delays, errors)
  - Con: Heaviest dependency, slowest startup, may be overkill
  - Estimated coverage: ~98% but slower test execution

Evaluate each branch against: coverage %, setup complexity, CI speed, maintenance burden,
realism of tests. Select the best branch and explain the rationale.
```

**Expected Copilot Output:**
```markdown
## Test Strategy Evaluation for External API Services

### Branch A — Mock WebClient at Reactive Level
| Criterion | Score | Detail |
|-----------|-------|--------|
| Coverage | ⚠️ ~75% | HTTP handling code not exercised |
| Setup complexity | ❌ High | 5+ mock objects per test, fragile chain |
| CI speed | ✅ < 5 sec | No network, pure unit tests |
| Maintenance | ❌ Poor | Any WebClient refactor breaks all tests |
| Realism | ❌ Low | Doesn't validate actual HTTP behavior |

### Branch B — MockWebServer (RECOMMENDED ✅)
| Criterion | Score | Detail |
|-----------|-------|--------|
| Coverage | ✅ ~95% | Full HTTP path tested |
| Setup complexity | ✅ Low | Single MockWebServer, queue responses |
| CI speed | ✅ < 15 sec | Localhost HTTP is fast |
| Maintenance | ✅ Good | Tests survive WebClient refactoring |
| Realism | ✅ High | Real HTTP validates URL construction |

### Branch C — WireMock
| Criterion | Score | Detail |
|-----------|-------|--------|
| Coverage | ✅ ~98% | Complete HTTP simulation |
| Setup complexity | ⚠️ Medium | Requires WireMock dependency and config |
| CI speed | ⚠️ 20-30 sec | Heavier JVM footprint on startup |
| Maintenance | ✅ Good | Declarative stubs are maintainable |
| Realism | ✅ Very High | Supports delays, fault injection |

### Recommendation: Branch B — MockWebServer

MockWebServer provides the best balance:
1. **Realistic HTTP tests** validate URL construction, headers, and response parsing
2. **Simple setup** — one MockWebServer instance, enqueue JSON responses
3. **Fast enough** — localhost HTTP adds ~10ms per test
4. **Maintainable** — tests don't break when WebClient internal calls change

WireMock (Branch C) is overkill for this service — we don't need fault injection
or complex routing. Save it for integration/E2E tests.

### Recommended Test Structure
```java
@ExtendWith(MockitoExtension.class)
class MapboxServiceTest {

    private MockWebServer mockWebServer;
    private MapboxService mapboxService;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        
        String baseUrl = mockWebServer.url("/").toString();
        mapboxService = new MapboxService(
            WebClient.builder(),
            baseUrl,
            "test-token"
        );
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void geocode_validQuery_parsesMapboxResponse() {
        // Arrange — queue mock response
        String responseJson = """
            {
              "features": [{
                "geometry": {"coordinates": [-104.99, 39.74]},
                "place_name": "Denver, CO"
              }]
            }
            """;
        mockWebServer.enqueue(new MockResponse()
            .setBody(responseJson)
            .setHeader("Content-Type", "application/json"));

        // Act
        GeocodeResponse result = mapboxService.geocode("Denver");

        // Assert
        assertThat(result.coordinates()).containsExactly(-104.99, 39.74);
        
        // Verify URL construction
        RecordedRequest request = mockWebServer.takeRequest();
        assertThat(request.getPath())
            .contains("/geocoding/v5/mapbox.places/Denver.json")
            .contains("access_token=test-token");
    }
}
```
```

---

### Example 2B: Mock Architecture Decision — WebClient Mock Scope

**CORE Prompt:**
```
Context: In our JUnit 5 tests for backend-java/ services, we need to mock WebClient.
WebClient is injected via WebClient.Builder in constructors:

```java
public MapboxService(
    WebClient.Builder webClientBuilder,
    @Value("${geospatial.mapbox.base-url}") String baseUrl,
    @Value("${geospatial.mapbox.token}") String token) {
    this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    this.mapboxToken = token;
}
```

There are two common architectures for managing mock WebClient in tests:

Branch A — Shared MockWebServer per test class:
  - Start MockWebServer in @BeforeAll, stop in @AfterAll
  - Each test enqueues responses, server persists across tests
  - Pro: Faster (one server startup per class)
  - Con: Tests may interfere if response queue not cleared

Branch B — Per-test MockWebServer instance:
  - Start MockWebServer in @BeforeEach, stop in @AfterEach
  - Each test gets isolated server instance
  - Pro: Perfect test isolation, no queue pollution
  - Con: Slightly slower (server start/stop per test)

Objective: Evaluate both branches and recommend the better architecture for
this project's test suite.

Requirements:
- CI must support parallel test execution without flakiness
- Tests should be independent and order-insensitive
- Setup should be simple and maintainable
- Target execution time: < 500ms per test

Evaluate: test isolation, parallel safety, execution speed, code clarity.
Select the better branch and provide implementation example.
```

**Expected Copilot Output:**
```markdown
## Mock Architecture Evaluation

### Branch A — Shared MockWebServer per Test Class
| Criterion | Assessment |
|-----------|-----------|
| Test isolation | ⚠️ Risk — queue state persists between tests |
| Parallel safety | ❌ Fragile — JUnit may run test methods in parallel |
| Execution speed | ✅ Fast — single server startup |
| Code clarity | ⚠️ Requires manual queue management |

**Verdict**: Fast but fragile. Queue pollution causes intermittent failures.

### Branch B — Per-Test MockWebServer (RECOMMENDED ✅)
| Criterion | Assessment |
|-----------|-----------|
| Test isolation | ✅ Perfect — fresh server per test |
| Parallel safety | ✅ Safe — each test owns its server port |
| Execution speed | ✅ Good — ~50ms overhead per test |
| Code clarity | ✅ Simple — standard @BeforeEach/@AfterEach lifecycle |

**Verdict**: Clean isolation outweighs minor speed cost.

### Recommended Implementation

```java
package com.roadtrip.geospatial.service;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class MapboxServiceWithMockWebServerTest {

    private MockWebServer mockWebServer;
    private MapboxService mapboxService;

    @BeforeEach
    void setUp() throws IOException {
        // Per-test isolation — fresh server for each test
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        // Configure service with mock server URL
        String baseUrl = mockWebServer.url("/").toString();
        mapboxService = new MapboxService(
            WebClient.builder(),
            baseUrl.substring(0, baseUrl.length() - 1), // Remove trailing slash
            "test-mapbox-token"
        );
    }

    @AfterEach
    void tearDown() throws IOException {
        // Clean shutdown — prevents port leaks
        mockWebServer.shutdown();
    }

    @Test
    void geocode_constructsCorrectUrl() throws InterruptedException {
        // Arrange
        mockWebServer.enqueue(new MockResponse()
            .setBody(VALID_GEOCODE_RESPONSE)
            .setHeader("Content-Type", "application/json"));

        // Act
        mapboxService.geocode("San Francisco, CA");

        // Assert — verify URL construction
        RecordedRequest request = mockWebServer.takeRequest();
        assertThat(request.getMethod()).isEqualTo("GET");
        assertThat(request.getPath())
            .startsWith("/geocoding/v5/mapbox.places/San%20Francisco")
            .contains("access_token=test-mapbox-token")
            .contains("limit=1");
    }

    private static final String VALID_GEOCODE_RESPONSE = """
        {
          "features": [{
            "geometry": {"coordinates": [-122.4194, 37.7749]},
            "place_name": "San Francisco, California"
          }]
        }
        """;
}
```

### Key Pattern: Test Fixtures as Constants

Extract JSON responses to constants or files for reusability:

```java
class MapboxTestFixtures {
    static final String GEOCODE_SUCCESS = """
        {"features": [{"geometry": {"coordinates": [-122.4194, 37.7749]}, "place_name": "SF"}]}
        """;
    
    static final String GEOCODE_EMPTY = """
        {"features": []}
        """;
    
    static final String DIRECTIONS_SUCCESS = """
        {"routes": [{"distance": 15000, "duration": 900, "geometry": {}, "legs": []}]}
        """;
}
```
```

---

### Teaching Points

| Tree of Thought Element | Strategy Decision (2A) | Architecture Decision (2B) |
|------------------------|------------------------|---------------------------|
| Branch count | 3 approaches | 2 approaches |
| Evaluation criteria | Coverage, speed, complexity, realism | Isolation, parallelism, speed, clarity |
| Recommendation | MockWebServer — best balance | Per-test instances — clean isolation |
| Key insight | WireMock is overkill for service tests | Queue pollution causes flaky tests |

**When to Use**: Choosing between test frameworks, mock strategies, fixture approaches  
**Avoid**: When there's an obvious single best practice

---

### Exercise 2: Try It Yourself

**Challenge 2A**: Write a Tree of Thought prompt to decide between these test fixture strategies:
- Inline JSON strings in each test
- Static constants in a Fixtures class
- External `.json` files in `src/test/resources/`

Evaluate against: readability, maintainability, IDE support, reusability.

**Challenge 2B**: Evaluate test organization strategies:
- One test class per service class
- One test class per endpoint
- Nested test classes by scenario

**Expected Time**: 10-15 minutes

---

## Demo 3: Instruction Files (8 min)

### Objective
Understand how `.github/instructions/java.instructions.md` encodes project-specific rules that Copilot automatically follows — and how to extend it for testing.

> **Key Insight**: This project already has Java-specific instructions. This demo shows the real file and adds testing rules.

### Scenario
Walk through the existing Java instruction file's key sections, then add new rules for test generation.

### Live Coding Steps

**Step 1: Open and explore the real instruction file**
```bash
# Open the existing Java instruction file
code .github/instructions/java.instructions.md
```

**Highlight these sections already in the file:**

1. **Stack (Non-Negotiable)**
```markdown
# Already present in java.instructions.md:

## Stack (Non-Negotiable)
- **Framework**: Spring Boot 3 only
- **Build**: Maven with mvnw wrapper (never Gradle)
- **Java version**: 17+ (LTS)
- **Responsibility**: Geocoding, directions, POI search, route optimization
- **External proxies**: Mapbox API & Azure Maps (always server-side, never expose tokens)
```

2. **Controller Standards**
```java
// Already present — constructor injection pattern:

@RestController
@RequestMapping("/api/directions")
@RequiredArgsConstructor
public class DirectionsController {
    private final DirectionsService directionsService;

    @GetMapping
    public ResponseEntity<DirectionsResponse> getDirections(
            @Valid @ModelAttribute DirectionsRequest request) {
        return ResponseEntity.ok(directionsService.getDirections(request));
    }
}
```

3. **DTO Standards**
```java
// Already present — Java records pattern:

public record DirectionsRequest(
    @NotBlank String origin,
    @NotBlank String destination
) {}
```

**Step 2: Add NEW rules for Java testing**
```markdown
<!-- Add to java.instructions.md under Testing section -->

## Testing Standards (CRITICAL)

### Test Framework Stack
- **Framework**: JUnit 5 (`org.junit.jupiter`)
- **Mocking**: Mockito 5+ (`@Mock`, `@InjectMocks`, `@ExtendWith(MockitoExtension.class)`)
- **Assertions**: AssertJ (`assertThat().isEqualTo()`) — NOT raw JUnit assertions
- **HTTP Mocking**: OkHttp MockWebServer for external API tests
- **Integration**: `@SpringBootTest` + `@AutoConfigureWebTestClient`

### Test Naming Convention
```java
// ✅ CORRECT - descriptive three-part name
@Test
void geocode_validAddress_returnsCoordinates() { }

@Test
void geocode_emptyQuery_throwsBadRequest() { }

// ❌ WRONG - vague or missing parts
@Test
void testGeocode() { }

@Test
void test1() { }
```

### Arrange-Act-Assert Structure (REQUIRED)
```java
@Test
void geocode_validAddress_returnsCoordinates() {
    // Arrange — set up test data and mocks
    String address = "Denver, CO";
    when(mapboxService.geocode(address)).thenReturn(expectedResponse);

    // Act — execute the method under test
    GeocodeResponse result = controller.geocode(address);

    // Assert — verify expected outcomes
    assertThat(result.coordinates()).containsExactly(-104.99, 39.74);
}
```

### External API Test Pattern
```java
// ✅ CORRECT — MockWebServer for HTTP isolation
private MockWebServer mockWebServer;

@BeforeEach
void setUp() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
}

@AfterEach
void tearDown() throws IOException {
    mockWebServer.shutdown();
}

// ❌ WRONG — hitting real external APIs
@Test
void geocode_hitsRealMapbox() {
    // This will fail in CI without credentials!
}
```

### GeoJSON Coordinate Format (CRITICAL)
**Always use `[longitude, latitude]` order — never `[lat, lng]`**

```java
// ✅ CORRECT - GeoJSON order
List<Double> sfCoords = List.of(-122.4194, 37.7749);  // [lng, lat]

// ❌ WRONG - Google Maps order
List<Double> sfCoords = List.of(37.7749, -122.4194);  // [lat, lng]
```
```

**Step 3: Verify the instruction file takes effect**
```
# In Copilot Chat:
@workspace Generate a test for MapboxService.getDirections()

# Expected: Copilot follows java.instructions.md rules:
# - Uses @ExtendWith(MockitoExtension.class)
# - Uses AssertJ assertions (assertThat)
# - Uses three-part test naming
# - Uses Arrange-Act-Assert comments
```

### Teaching Points

| Instruction File Pattern | Real Example from This Project |
|-------------------------|-------------------------------|
| Framework mandates | Spring Boot 3, Maven, JUnit 5, Mockito |
| Naming conventions | `methodName_scenario_expectedBehavior` |
| ❌/✅ contrast examples | test naming, coordinate order, AAA structure |
| External API rules | MockWebServer for HTTP mocking, no real API calls |
| Enforcement keywords | "CRITICAL", "REQUIRED" for non-negotiable rules |

---

### Exercise 3: Try It Yourself

**Challenge**: Add a new rule to `java.instructions.md` for exception testing:

```markdown
### Exception Testing Pattern
```java
// ✅ CORRECT — AssertJ assertThatThrownBy
assertThatThrownBy(() -> service.geocode(null))
    .isInstanceOf(ResponseStatusException.class)
    .extracting("status")
    .isEqualTo(HttpStatus.BAD_REQUEST);

// ❌ WRONG — JUnit assertThrows with raw assertion
Exception e = assertThrows(ResponseStatusException.class, 
    () -> service.geocode(null));
assertEquals(400, e.getStatusCode().value());
```
```

**Expected Time**: 5 minutes

---

## Demo 4: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files for consistent test generation patterns. This demo creates a Java-specific prompt file for generating Spring Boot service tests.

### Scenario
Create a new prompt file for generating JUnit 5 tests with MockWebServer for external API services.

### Live Coding Steps

**Step 1: Create the prompt file**
```markdown
<!-- .github/prompts/spring-boot-service-test.prompt.md -->
---
name: 'Spring Boot Service Test Generator'
description: 'Generate JUnit 5 tests for Spring Boot services that call external APIs'
---

# Spring Boot Service Test Generator

Generate comprehensive JUnit 5 tests for Spring Boot services following Road Trip Planner conventions.

## Architecture Context
- Services in `backend-java/src/main/java/com/roadtrip/geospatial/service/`
- Services use WebClient for HTTP calls to Mapbox and Azure Maps
- Configuration via `@Value` injection from application.yml
- All services return DTOs from `dto/` package (Java records)

## Test Framework Stack
- JUnit 5 (`@Test`, `@BeforeEach`, `@AfterEach`, `@ParameterizedTest`)
- Mockito 5 (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `when/verify`)
- AssertJ (`assertThat`, `assertThatThrownBy`)
- MockWebServer (OkHttp) for HTTP response mocking

## Template

```java
package com.roadtrip.geospatial.service;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

class {{ServiceName}}Test {

    private MockWebServer mockWebServer;
    private {{ServiceName}} {{serviceName}};

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        
        String baseUrl = mockWebServer.url("/").toString();
        {{serviceName}} = new {{ServiceName}}(
            WebClient.builder(),
            baseUrl,
            "test-api-token"
        );
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    // === Success Cases ===
    
    @Test
    void {{methodName}}_validInput_returnsExpectedResponse() {
        // Arrange
        mockWebServer.enqueue(new MockResponse()
            .setBody({{VALID_RESPONSE_JSON}})
            .setHeader("Content-Type", "application/json"));

        // Act
        var result = {{serviceName}}.{{methodName}}({{validInput}});

        // Assert
        assertThat(result).isNotNull();
        // Add specific assertions for response fields
    }

    // === Error Cases ===
    
    @Test
    void {{methodName}}_apiReturnsError_throwsAppropriateException() {
        // Arrange
        mockWebServer.enqueue(new MockResponse()
            .setResponseCode(500)
            .setBody("Internal Server Error"));

        // Act & Assert
        assertThatThrownBy(() -> {{serviceName}}.{{methodName}}({{validInput}}))
            .isInstanceOf(ResponseStatusException.class)
            .extracting("status")
            .isEqualTo(HttpStatus.BAD_GATEWAY);
    }

    // === URL/Parameter Verification ===
    
    @Test
    void {{methodName}}_sendsCorrectRequest() throws InterruptedException {
        // Arrange
        mockWebServer.enqueue(new MockResponse()
            .setBody({{VALID_RESPONSE_JSON}})
            .setHeader("Content-Type", "application/json"));

        // Act
        {{serviceName}}.{{methodName}}({{validInput}});

        // Assert — verify request construction
        RecordedRequest request = mockWebServer.takeRequest();
        assertThat(request.getMethod()).isEqualTo("GET");
        assertThat(request.getPath()).contains({{expectedPathElements}});
    }
}
```

## Checklist
- [ ] Test class in `src/test/java/` mirroring main structure
- [ ] MockWebServer lifecycle in @BeforeEach/@AfterEach
- [ ] At least 3 test categories: success, error, request verification
- [ ] AssertJ assertions (NOT raw JUnit)
- [ ] Three-part test naming: `method_scenario_expected`
- [ ] Parameterized tests for multiple input variations
- [ ] JSON fixtures extracted to constants or files
```

**Step 2: Create a companion fixture prompt file**
```markdown
<!-- .github/prompts/test-fixtures-json.prompt.md -->
---
name: 'Test Fixtures Generator'
description: 'Generate JSON fixture constants for MockWebServer tests'
---

# Test Fixtures Generator

Generate JSON response fixtures for external API mocking.

## Fixture Patterns

### Mapbox Geocoding Response
```java
static final String MAPBOX_GEOCODE_SUCCESS = """
    {
      "type": "FeatureCollection",
      "features": [{
        "geometry": {
          "type": "Point",
          "coordinates": [{{longitude}}, {{latitude}}]
        },
        "place_name": "{{placeName}}",
        "properties": {}
      }]
    }
    """;

static final String MAPBOX_GEOCODE_EMPTY = """
    {"type": "FeatureCollection", "features": []}
    """;
```

### Mapbox Directions Response
```java
static final String MAPBOX_DIRECTIONS_SUCCESS = """
    {
      "routes": [{
        "distance": {{distanceMeters}},
        "duration": {{durationSeconds}},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [{{startLng}}, {{startLat}}],
            [{{endLng}}, {{endLat}}]
          ]
        },
        "legs": []
      }],
      "code": "Ok"
    }
    """;
```

### Azure Maps Search Response
```java
static final String AZURE_MAPS_SEARCH_SUCCESS = """
    {
      "results": [{
        "type": "POI",
        "poi": {"name": "{{poiName}}", "categories": ["{{category}}"]},
        "address": {"freeformAddress": "{{address}}"},
        "position": {"lat": {{latitude}}, "lon": {{longitude}}}
      }]
    }
    """;
```

## Usage
Place fixtures in a companion class or the test class itself:
```java
class MapboxServiceTest {
    // Fixtures as nested class for organization
    static class Fixtures {
        static final String GEOCODE_DENVER = MAPBOX_GEOCODE_SUCCESS
            .replace("{{longitude}}", "-104.9903")
            .replace("{{latitude}}", "39.7392")
            .replace("{{placeName}}", "Denver, Colorado");
    }
}
```
```

**Step 3: Use the prompt file in Copilot Chat**
```
# In Copilot Chat:
@workspace #file:.github/prompts/spring-boot-service-test.prompt.md

Generate tests for AzureMapsService.searchPlaces() method:
- Service: AzureMapsService
- Method: searchPlaces(String query, String proximity)
- Returns: SearchResponse with GeoJSON-style features
- Calls: Azure Maps Fuzzy Search API
- Error cases: 401 (invalid key), 403 (no access), empty results
```

### Teaching Points

| Prompt File Element | Purpose | Example from This Project |
|--------------------|---------|--------------------------|
| YAML frontmatter | Metadata for discovery | `name: 'Spring Boot Service Test Generator'` |
| Architecture Context | Ground in real stack | "Services use WebClient for HTTP calls" |
| Requirements | Enforce project rules | "MockWebServer for HTTP mocking" |
| Template | Structural consistency | Full test class skeleton with placeholders |
| Placeholders `{{}}` | Dynamic substitution | `{{ServiceName}}`, `{{methodName}}` |
| Checklist | Verification gates | Success/error/request verification tests |

---

### Exercise 4: Try It Yourself

**Challenge**: Create a prompt file for controller integration tests:
- File: `.github/prompts/spring-boot-controller-test.prompt.md`
- Uses: `@SpringBootTest`, `@AutoConfigureWebTestClient`, `@MockBean`
- Tests: endpoint paths, HTTP status codes, JSON response bodies
- Error cases: validation errors (400), not found (404), service errors (502)

**Expected Time**: 10 minutes

---

## Demo 5: Copilot Code Review (10 min)

### Objective
Use Copilot to review real production code for SOLID violations, security issues, and missing error handling.

### Scenario
Review `AzureMapsService.java` — the Azure Maps API integration. This file has **real deficiencies** documented in `docs/JAVA_BACKEND_REVIEW_PLAN.md`.

> **Why this file?** Unlike fabricated examples, this file has actual production issues that Copilot can find. The review plan already catalogues them — this demo shows Copilot independently discovering the same issues.

### Live Coding Steps

**Step 1: Open the real file and invoke review**
```
# In Copilot Chat:
@workspace Review backend-java/src/main/java/com/roadtrip/geospatial/service/AzureMapsService.java for:
1. SOLID principle violations (especially SRP and DIP)
2. Missing input validation
3. Hardcoded strings
4. Error handling gaps
5. Security concerns (API key handling)

Also reference docs/JAVA_BACKEND_REVIEW_PLAN.md for known issues.
```

**Step 2: Expected Copilot review output**
```markdown
## Code Review: AzureMapsService.java

### 🔴 Critical Issues

**1. DIP Violation: Hardcoded Base URL**
```java
// ❌ Current: URL constructed inline
private final WebClient webClient;

public AzureMapsService(
    WebClient.Builder webClientBuilder,
    @Value("${geospatial.azure-maps.base-url}") String baseUrl,
    @Value("${geospatial.azure-maps.key}") String key) {
    this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    this.azureMapsKey = key;
}

// ✅ Fix: Extract client creation to factory
@Configuration
public class AzureMapsClientConfig {
    @Bean
    public WebClient azureMapsClient(
        WebClient.Builder builder,
        @Value("${geospatial.azure-maps.base-url}") String baseUrl) {
        return builder.baseUrl(baseUrl)
            .defaultHeader("Accept", "application/json")
            .build();
    }
}
```

**2. Missing Input Validation**
```java
// ❌ Current: No validation on query or proximity
public SearchResponse searchPlaces(String query, String proximity) {
    // query could be null, empty, or contain injection characters
    // proximity format not validated: should be "lng,lat"
    
// ✅ Fix: Add parameter validation
public SearchResponse searchPlaces(
    @NotBlank String query,
    @Pattern(regexp = "^-?\\d+\\.\\d+,-?\\d+\\.\\d+$") String proximity) {
    
    // Or validate in method body:
    if (query == null || query.isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
            "Query parameter is required");
    }
```

**3. Hardcoded Error Messages**
```java
// ❌ Current: Inline strings
throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, 
    "No response from Azure Maps");

// ✅ Fix: Use constants
public class ErrorMessages {
    public static final String AZURE_MAPS_NO_RESPONSE = "No response from Azure Maps";
    public static final String AZURE_MAPS_AUTH_FAILED = "Azure Maps authentication failed";
    public static final String INVALID_PROXIMITY_FORMAT = "Proximity must be 'lng,lat' format";
}
```

### 🟡 Warnings

**4. Complex GeoJSON Transform — SRP Violation**
```java
// ❌ Current: searchPlaces() does API call + complex transform
// The transform logic is 30+ lines converting Azure format to GeoJSON

// ✅ Fix: Extract to separate transformer
@Component
public class AzureToGeoJsonTransformer {
    public List<Map<String, Object>> transform(Map<String, Object> azureResponse) {
        // Transform logic here
    }
}
```

**5. No Timeout Configuration**
```java
// ❌ Current: WebClient uses default timeouts (infinite)
this.webClient = webClientBuilder.baseUrl(baseUrl).build();

// ✅ Fix: Add timeouts
this.webClient = webClientBuilder
    .baseUrl(baseUrl)
    .clientConnector(new ReactorClientHttpConnector(
        HttpClient.create()
            .responseTimeout(Duration.ofSeconds(10))
    ))
    .build();
```

### 🟢 Suggestions

**6. Add Structured Logging**
```java
// ✅ Add: Request/response logging for debugging
private static final Logger log = LoggerFactory.getLogger(AzureMapsService.class);

public SearchResponse searchPlaces(String query, String proximity) {
    log.debug("Searching Azure Maps: query={}, proximity={}", query, proximity);
    // ... API call ...
    log.debug("Azure Maps returned {} results", results.size());
}
```

### Summary
| Severity | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 3 | DIP violation, no validation, hardcoded strings |
| 🟡 Warning | 2 | SRP violation (transform), no timeouts |
| 🟢 Suggestion | 1 | Add logging |

**Cross-reference**: Issues match findings in `docs/JAVA_BACKEND_REVIEW_PLAN.md`
```

**Step 3: Apply a fix with Copilot**
```
# In Copilot Chat:
@workspace Fix the input validation issue in AzureMapsService.searchPlaces()
Add validation for query (not blank) and proximity (valid lng,lat format).
Follow the error handling patterns in MapboxService.java.
```

### Teaching Points

| Review Category | What Copilot Found | Fix Priority |
|----------------|--------------------|--------------| 
| 🔴 DIP | Hardcoded URL construction | High |
| 🔴 Validation | No input sanitization | High |
| 🔴 Strings | Inline error messages | Medium |
| 🟡 SRP | Transform logic in service | Medium |
| 🟡 Resilience | Missing timeouts | Medium |
| 🟢 Observability | No structured logging | Low |

---

### Exercise 5: Try It Yourself

**Challenge**: Review `GeospatialController.java` for:
- Missing `@Valid` annotations on request parameters
- Inconsistent error handling between endpoints
- Missing request logging

Write a Copilot prompt that identifies these issues and suggests fixes.

**Expected Time**: 10 minutes

---

## Demo 6: Copilot Plan Mode (12 min)

### Objective
Use Plan Mode to architect a complete test infrastructure before implementation. Plan Mode creates structured, step-by-step plans that can be handed off to an implementation agent.

### Scenario
Plan the test infrastructure for `backend-java/` from scratch — including test directory structure, fixture files, base test classes, and Maven configuration.

### Live Coding Steps

**Step 1: Open Chat and select Plan agent**
```
# In VS Code Chat view:
# 1. Click the agent dropdown (or type @ to see options)
# 2. Select "Plan" agent
# 3. Enter the planning prompt below
```

**Step 2: Enter the planning prompt**
```
Context: The backend-java/ Spring Boot service currently has only a contextLoads() 
test. We need comprehensive test infrastructure for MapboxService, AzureMapsService,
GeospatialController, and HealthController.

Objective: Create a detailed implementation plan for building test infrastructure
that covers unit tests, integration tests, and shared test utilities.

Requirements:
- JUnit 5 + Mockito + AssertJ + MockWebServer (per java.instructions.md)
- Test directory structure mirroring main/java
- Shared fixtures for Mapbox and Azure Maps JSON responses
- Base test classes for common setup (MockWebServer lifecycle)
- Maven test dependencies verified in pom.xml
- CI-compatible (no real API credentials required)

Constraints:
- Must work with existing Spring Boot 3.3 setup
- Total implementation time: ~4 hours
- Priority: Services first, then controllers

Create a step-by-step plan with file paths, code structure, and dependencies.
```

**Step 3: Expected Plan Mode output**
```markdown
## Test Infrastructure Plan for backend-java/

### Phase 1: Maven Dependencies (30 min)
**Files to modify**: `pom.xml`

Add test dependencies:
```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>mockwebserver</artifactId>
    <version>4.12.0</version>
    <scope>test</scope>
</dependency>
```

Verify existing dependencies:
- `spring-boot-starter-test` ✓ (includes JUnit 5, Mockito, AssertJ)

### Phase 2: Test Directory Structure (15 min)
**Files to create**:
```
src/test/java/com/roadtrip/geospatial/
├── service/
│   ├── MapboxServiceTest.java
│   ├── AzureMapsServiceTest.java
│   └── fixtures/
│       └── ApiFixtures.java
├── controller/
│   ├── GeospatialControllerTest.java
│   └── HealthControllerTest.java
├── support/
│   ├── MockWebServerTest.java       # Base class with lifecycle
│   └── TestConstants.java           # Shared constants
└── resources/
    └── fixtures/
        ├── mapbox-geocode-success.json
        ├── mapbox-directions-success.json
        └── azure-search-success.json
```

### Phase 3: Base Test Class (30 min)
**File**: `src/test/java/.../support/MockWebServerTest.java`

```java
public abstract class MockWebServerTest {
    protected MockWebServer mockWebServer;
    
    @BeforeEach
    void setUpMockServer() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
    }
    
    @AfterEach
    void tearDownMockServer() throws IOException {
        mockWebServer.shutdown();
    }
    
    protected String getBaseUrl() {
        return mockWebServer.url("/").toString();
    }
    
    protected void enqueueJsonResponse(String json) {
        mockWebServer.enqueue(new MockResponse()
            .setBody(json)
            .setHeader("Content-Type", "application/json"));
    }
    
    protected void enqueueErrorResponse(int code, String message) {
        mockWebServer.enqueue(new MockResponse()
            .setResponseCode(code)
            .setBody(message));
    }
}
```

### Phase 4: JSON Fixtures (45 min)
**File**: `src/test/java/.../service/fixtures/ApiFixtures.java`

```java
public final class ApiFixtures {
    
    public static final String MAPBOX_GEOCODE_DENVER = """
        {
          "features": [{
            "geometry": {"coordinates": [-104.9903, 39.7392]},
            "place_name": "Denver, Colorado, United States"
          }]
        }
        """;
    
    public static final String MAPBOX_DIRECTIONS_SHORT = """
        {
          "routes": [{
            "distance": 15000,
            "duration": 900,
            "geometry": {"type": "LineString", "coordinates": []},
            "legs": []
          }]
        }
        """;
    
    // ... more fixtures
}
```

### Phase 5: Service Tests (90 min)
**Files**: `MapboxServiceTest.java`, `AzureMapsServiceTest.java`

Test coverage targets:
| Service | Method | Success | Error | Edge |
|---------|--------|---------|-------|------|
| MapboxService | geocode | ✓ | ✓ | empty results |
| MapboxService | getDirections | ✓ | ✓ | no routes |
| MapboxService | optimizeRoute | ✓ | ✓ | single point |
| AzureMapsService | searchPlaces | ✓ | ✓ | empty results |

### Phase 6: Controller Tests (60 min)
**Files**: `GeospatialControllerTest.java`, `HealthControllerTest.java`

Test coverage targets:
| Controller | Endpoint | 200 | 400 | 502 |
|------------|----------|-----|-----|-----|
| Geospatial | /api/geocode | ✓ | ✓ | ✓ |
| Geospatial | /api/directions | ✓ | ✓ | ✓ |
| Geospatial | /api/search | ✓ | ✓ | ✓ |
| Health | /health | ✓ | - | - |

### Implementation Order
1. Phase 1: pom.xml dependencies
2. Phase 2: Create directory structure
3. Phase 3: MockWebServerTest base class
4. Phase 4: ApiFixtures class
5. Phase 5: MapboxServiceTest → AzureMapsServiceTest
6. Phase 6: Controller tests

### Verification
After each phase, run: `./mvnw test`

Ready to hand off to implementation agent?
```

**Step 4: Hand off to implementation**
```
# Click "Hand off to Agent" or type:
Implement Phase 3 and Phase 4 of this plan — create the MockWebServerTest 
base class and ApiFixtures class.
```

### Teaching Points

| Plan Mode Element | Purpose | Example |
|------------------|---------|---------|
| Phase breakdown | Logical grouping of work | Dependencies → Structure → Base class → Fixtures → Tests |
| File paths | Precise location for changes | `src/test/java/.../support/MockWebServerTest.java` |
| Code snippets | Implementation guidance | Base class with lifecycle methods |
| Coverage tables | Visual verification targets | Service/method × scenario matrix |
| Time estimates | Scope management | "Phase 3: 30 min" |
| Implementation order | Dependency sequencing | Dependencies must come before tests |

---

### Exercise 6: Try It Yourself

**Challenge**: Use Plan Mode to plan a `GlobalExceptionHandler` for the Java backend:
- Catches all `ResponseStatusException` types
- Returns consistent JSON error format
- Logs errors with correlation IDs
- Includes tests for each exception type

**Expected Time**: 10 minutes

---

## Demo 7: Copilot Coding Agent (15 min)

### Objective
Use the Copilot Coding Agent to autonomously implement multi-file changes. Agents can create files, run tests, and iterate until the task is complete.

### Scenario
Implement a `GlobalExceptionHandler` with tests — a task that spans multiple files and requires coordination.

### Live Coding Steps

**Step 1: Open Chat and select Agent mode**
```
# In VS Code Chat view:
# 1. Select "Agent" from the agent dropdown
# 2. Optionally select "Bypass Approvals" for faster iteration
# 3. Enter the implementation prompt below
```

**Step 2: Enter the agent prompt**
```
Context: The backend-java/ Spring Boot service lacks centralized error handling.
Currently, each service throws ResponseStatusException directly. We need a
GlobalExceptionHandler that:
1. Catches ResponseStatusException and returns consistent JSON
2. Catches unexpected exceptions and returns 500 with safe message
3. Logs all exceptions with request correlation

Objective: Implement GlobalExceptionHandler with full test coverage.

Requirements (from java.instructions.md):
- Use @ControllerAdvice and @ExceptionHandler annotations
- Follow existing package structure: create in exception/ package
- Create ErrorResponse record in dto/ package
- Use SLF4J for logging
- Tests with @WebMvcTest in controller/ test package
- Target: 100% coverage on handler methods

Files to create:
1. src/main/java/.../exception/GlobalExceptionHandler.java
2. src/main/java/.../dto/ErrorResponse.java
3. src/test/java/.../controller/GlobalExceptionHandlerTest.java

Implementation approach:
1. Create ErrorResponse DTO first (record with timestamp, status, message, path)
2. Create GlobalExceptionHandler with handlers for each exception type
3. Create tests that verify JSON response format
4. Run ./mvnw test to verify

Go ahead and implement these files.
```

**Step 3: Watch Agent work autonomously**

The agent will:
1. Create `ErrorResponse.java` record
2. Create `GlobalExceptionHandler.java` with `@ControllerAdvice`
3. Create test class with multiple test cases
4. Run `./mvnw test` to verify
5. Fix any issues and re-run tests

**Expected Agent output (files created):**

**ErrorResponse.java:**
```java
package com.roadtrip.geospatial.dto;

import java.time.Instant;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path);
    }
}
```

**GlobalExceptionHandler.java:**
```java
package com.roadtrip.geospatial.exception;

import com.roadtrip.geospatial.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {
        
        log.warn("ResponseStatusException: status={}, message={}, path={}",
            ex.getStatusCode().value(), ex.getReason(), request.getRequestURI());
        
        ErrorResponse error = ErrorResponse.of(
            ex.getStatusCode().value(),
            ex.getStatusCode().toString(),
            ex.getReason(),
            request.getRequestURI()
        );
        
        return ResponseEntity
            .status(ex.getStatusCode())
            .body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        
        log.error("Unexpected exception: path={}", request.getRequestURI(), ex);
        
        ErrorResponse error = ErrorResponse.of(
            500,
            "Internal Server Error",
            "An unexpected error occurred",
            request.getRequestURI()
        );
        
        return ResponseEntity
            .internalServerError()
            .body(error);
    }
}
```

**GlobalExceptionHandlerTest.java:**
```java
package com.roadtrip.geospatial.controller;

import com.roadtrip.geospatial.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {TestController.class})
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void handleResponseStatusException_returnsJsonError() throws Exception {
        mockMvc.perform(get("/test/not-found"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").value("Resource not found"))
            .andExpect(jsonPath("$.path").value("/test/not-found"));
    }

    @Test
    void handleGenericException_returns500WithSafeMessage() throws Exception {
        mockMvc.perform(get("/test/unexpected"))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.status").value(500))
            .andExpect(jsonPath("$.message").value("An unexpected error occurred"));
    }

    // Test controller for triggering exceptions
    @org.springframework.web.bind.annotation.RestController
    static class TestController {
        @org.springframework.web.bind.annotation.GetMapping("/test/not-found")
        void notFound() {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }

        @org.springframework.web.bind.annotation.GetMapping("/test/unexpected")
        void unexpected() {
            throw new RuntimeException("Unexpected error");
        }
    }
}
```

### Teaching Points

| Agent Capability | Example in This Demo |
|-----------------|---------------------|
| Multi-file creation | DTO + Handler + Test = 3 files |
| Code coordination | Handler references DTO, Test imports both |
| Test execution | Agent runs `./mvnw test` to verify |
| Iteration | Fixes compile errors and re-runs |
| Context awareness | Follows `java.instructions.md` patterns |

---

### Exercise 7: Try It Yourself

**Challenge**: Use the Coding Agent to implement input validation for `GeospatialController`:
1. Add `@Valid` annotations to endpoint parameters
2. Create a custom `@ValidCoordinates` annotation for coordinate format
3. Add tests for validation error responses

**Expected Time**: 15 minutes

---

## Demo 8: Architecture & Tech Stack Generation (10 min)

### Objective
Use Copilot to generate project scaffolding and architecture decision records (ADRs) for test infrastructure.

### Scenario
Generate an ADR documenting the testing decisions made during this workshop, and scaffold a test utilities module.

### Live Coding Steps

**Step 1: Generate an ADR for testing decisions**
```
# In Copilot Chat:
@workspace Generate an ADR (Architecture Decision Record) for the Java backend 
testing strategy. Document:

1. Decision: Use MockWebServer over WireMock for external API testing
2. Context: Need to test MapboxService and AzureMapsService without real credentials
3. Options considered: Mock WebClient (Branch A), MockWebServer (Branch B), WireMock (Branch C)
4. Decision rationale: MockWebServer provides best balance of realism and simplicity
5. Consequences: Per-test server instances, JSON fixtures required, 10ms overhead

Follow the ADR template in docs/adr/ if one exists, otherwise use standard MADR format.
Create file: docs/adr/0005-java-backend-testing-strategy.md
```

**Expected ADR output:**
```markdown
# ADR 0005: Java Backend Testing Strategy

## Status
Accepted

## Date
2026-03-23

## Context
The `backend-java/` geospatial service makes HTTP calls to external APIs (Mapbox, Azure Maps).
We need a testing strategy that:
- Runs in CI without API credentials
- Provides realistic HTTP-level testing
- Is simple to maintain and extend
- Executes quickly (< 30s for full suite)

## Decision
Use **OkHttp MockWebServer** for mocking external API responses in service tests.

## Options Considered

### Option A: Mock WebClient at Reactive Level
- **Pros**: Pure unit tests, fastest execution, no dependencies
- **Cons**: Complex mock setup (5+ layers), brittle to refactoring, doesn't test HTTP
- **Verdict**: Rejected — too fragile and doesn't validate HTTP layer

### Option B: MockWebServer (Selected)
- **Pros**: Real HTTP over localhost, validates URL construction, simple setup
- **Cons**: Slight overhead (~10ms per test), requires OkHttp dependency
- **Verdict**: Accepted — best balance of realism and simplicity

### Option C: WireMock
- **Pros**: Most realistic, supports fault injection, declarative stubs
- **Cons**: Heavier dependency, slower startup, overkill for our use case
- **Verdict**: Rejected — complexity not justified for service-level tests

## Consequences

### Positive
- Tests validate actual HTTP behavior including URL construction
- Simple setup: one MockWebServer per test, enqueue JSON responses
- Tests survive WebClient internal refactoring
- Fast enough for CI (< 500ms per test)

### Negative
- Must manage MockWebServer lifecycle (`@BeforeEach`/`@AfterEach`)
- Need to create JSON fixture files or constants
- Small memory overhead for server instance per test

### Neutral
- Added dependency: `com.squareup.okhttp3:mockwebserver:4.12.0`
- Test classes are slightly longer due to setup/teardown

## Implementation
See `src/test/java/com/roadtrip/geospatial/support/MockWebServerTest.java` for base class.

## References
- [OkHttp MockWebServer](https://square.github.io/okhttp/4.x/mockwebserver/)
- [JAVA_BACKEND_REVIEW_PLAN.md](../JAVA_BACKEND_REVIEW_PLAN.md)
- [java.instructions.md](../../.github/instructions/java.instructions.md)
```

**Step 2: Generate test utilities module**
```
# In Copilot Chat:
@workspace Generate a TestUtils class for the Java backend with:
1. Method to load JSON from classpath resources
2. Method to create GeocodeResponse test instances
3. Method to create DirectionsResponse test instances
4. Static factory methods following existing DTO patterns

Create file: src/test/java/com/roadtrip/geospatial/support/TestUtils.java
```

**Expected TestUtils output:**
```java
package com.roadtrip.geospatial.support;

import com.roadtrip.geospatial.dto.DirectionsResponse;
import com.roadtrip.geospatial.dto.GeocodeResponse;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Test utilities for the geospatial service.
 */
public final class TestUtils {

    private TestUtils() {
        // Utility class
    }

    /**
     * Load JSON content from classpath resource.
     * @param resourcePath path relative to src/test/resources
     * @return JSON content as string
     */
    public static String loadJson(String resourcePath) {
        try (InputStream is = TestUtils.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IllegalArgumentException("Resource not found: " + resourcePath);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load resource: " + resourcePath, e);
        }
    }

    /**
     * Create a GeocodeResponse for testing.
     */
    public static GeocodeResponse geocodeResponse(double longitude, double latitude, String placeName) {
        return new GeocodeResponse(List.of(longitude, latitude), placeName);
    }

    /**
     * Create a Denver GeocodeResponse (common test case).
     */
    public static GeocodeResponse denverGeocodeResponse() {
        return geocodeResponse(-104.9903, 39.7392, "Denver, Colorado");
    }

    /**
     * Create a DirectionsResponse for testing.
     */
    public static DirectionsResponse directionsResponse(
            double distance,
            double duration,
            Map<String, Object> geometry,
            List<Map<String, Object>> legs) {
        return new DirectionsResponse(distance, duration, geometry, legs);
    }

    /**
     * Create a simple DirectionsResponse (common test case).
     */
    public static DirectionsResponse simpleDirectionsResponse() {
        return directionsResponse(
            15000.0,  // 15km
            900.0,    // 15 minutes
            Map.of("type", "LineString", "coordinates", List.of()),
            List.of()
        );
    }
}
```

### Teaching Points

| Generation Type | Purpose | Output |
|----------------|---------|--------|
| ADR | Document architecture decisions | Markdown with context, options, consequences |
| Test utilities | Reduce boilerplate in tests | Factory methods, resource loading |
| Scaffolding | Create consistent structure | Package layout, base classes |

---

### Exercise 8: Try It Yourself

**Challenge**: Generate an ADR for input validation strategy:
- Decision: Use Bean Validation (`@Valid`, `@NotBlank`) vs manual validation
- Options: Bean Validation only, Manual only, Hybrid
- Document consequences for each approach

**Expected Time**: 10 minutes

---

## Workshop Summary

### Techniques Mastered

| Technique | Key Takeaway | When to Use |
|-----------|--------------|-------------|
| Chain-of-Thought | Decompose complex tests into logical steps | Multi-path logic, external APIs |
| Tree of Thought | Evaluate multiple strategies before deciding | Architecture decisions, framework choices |
| Instruction Files | Encode project rules Copilot follows automatically | Naming conventions, patterns, constraints |
| Prompt Files | Create reusable templates for consistent generation | Test scaffolding, endpoint patterns |
| Code Review | Find SOLID violations and security issues | Pre-PR review, tech debt assessment |
| Plan Mode | Architect before implementing | Multi-file features, infrastructure setup |
| Coding Agent | Autonomous multi-file implementation | Feature implementation, test suites |
| Architecture Generation | Generate scaffolding and ADRs | Project setup, documentation |

### Java Testing Stack Recap

| Component | Package | Usage |
|-----------|---------|-------|
| Test framework | JUnit 5 | `@Test`, `@ParameterizedTest`, `@BeforeEach` |
| Mocking | Mockito 5 | `@Mock`, `@MockBean`, `when().thenReturn()` |
| Assertions | AssertJ | `assertThat().isEqualTo()`, `assertThatThrownBy()` |
| HTTP mocking | MockWebServer | External API simulation |
| Integration | Spring Boot Test | `@SpringBootTest`, `@AutoConfigureWebTestClient` |

### Next Steps

1. **Practice**: Complete all exercises from this workshop
2. **Apply**: Use these techniques on your current Java projects
3. **Customize**: Extend `java.instructions.md` with your team's patterns
4. **Share**: Create prompt files for common patterns in your codebase

---

## Appendix: Quick Reference

### Common Copilot Commands

| Action | Chat Command |
|--------|--------------|
| Review code | `@workspace Review [file] for [criteria]` |
| Generate tests | `@workspace Generate tests for [class/method]` |
| Explain code | `@workspace Explain [file/method]` |
| Refactor | `@workspace Refactor [code] to [pattern]` |
| Fix issue | `@workspace Fix [issue] in [file]` |

### Maven Test Commands

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=MapboxServiceTest

# Run specific test method
./mvnw test -Dtest=MapboxServiceTest#geocode_validQuery_returnsCoordinates

# Run with coverage
./mvnw test jacoco:report

# Skip tests
./mvnw package -DskipTests
```

### Test Annotation Reference

```java
// JUnit 5 lifecycle
@BeforeAll    // Once before all tests (static method)
@BeforeEach   // Before each test
@AfterEach    // After each test
@AfterAll     // Once after all tests (static method)

// Test types
@Test         // Regular test
@ParameterizedTest  // Data-driven test
@RepeatedTest(5)    // Run N times
@Disabled     // Skip test

// Spring Boot
@SpringBootTest                    // Full context
@WebMvcTest(Controller.class)      // Controller slice
@AutoConfigureWebTestClient        // WebTestClient injection
@MockBean                          // Spring-managed mock
```

---

**Workshop Complete!**

You've mastered 8 advanced Copilot techniques for Java development. Apply these patterns to accelerate your Spring Boot development and testing workflows.
