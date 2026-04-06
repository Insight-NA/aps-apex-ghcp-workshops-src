# Workshop 1: Foundational Web Development with GitHub Copilot — Java Edition

**Duration**: 60 minutes
**Format**: Live coding demonstrations
**Audience**: Developers familiar with Java 21 and Spring Boot 3
**Prerequisites**: Completed `setup/00-setup-instructions.md`, Copilot activated in VS Code

> **Architecture context**: The Java backend (`backend-java/`, port 8082) is the **geospatial service** in this polyglot road trip app. It handles geocoding, driving directions, POI search, and route optimization — proxying to Mapbox and Azure Maps APIs. All requests reach it through the Node.js BFF at port 3000.
>
> **Key technologies**: Spring Boot 3.3, Java 21, WebClient (reactive HTTP), Java records for DTOs, constructor injection exclusively.

---

## Before You Start — Workspace Checklist

Open these files in VS Code tabs **before the first demo**. Copilot produces the best suggestions when the target file, a reference file, and the instruction file are all visible in context.

```bash
# Open in VS Code (run from project root)
code .github/copilot-instructions.md
code backend-java/src/main/java/com/roadtrip/geospatial/controller/GeospatialController.java
code backend-java/src/main/java/com/roadtrip/geospatial/service/MapboxService.java
code backend-java/src/main/java/com/roadtrip/geospatial/service/AzureMapsService.java
code backend-java/src/main/java/com/roadtrip/geospatial/dto/GeocodeResponse.java
code backend-java/src/main/java/com/roadtrip/geospatial/dto/DirectionsResponse.java
code backend-java/src/main/java/com/roadtrip/geospatial/dto/SearchResponse.java
code backend-java/src/main/resources/application.yml
```

**Pin `.github/copilot-instructions.md`** — right-click the tab → "Pin Tab". Copilot applies its rules more consistently when the instruction file is visible in the editor.

---

## Learning Objectives

By the end of this workshop, you will:
1. [**Understand Copilot's Role**](#capability-1--understand-copilots-role) — see how Copilot acts as a context-aware pair programmer, not an autocomplete engine
2. [**Provide Clear Context**](#capability-2--provide-clear-context-comment-anatomy) — write prompts that give Copilot the right signal: language, framework, dependencies, and constraints
3. [**Use Iterative Acceptance**](#capability-3--iterative-acceptance) — review and accept suggestions line-by-line; never blindly accept a block
4. [**Customize Copilot**](#capability-4--customize-copilot-the-instruction-file) — understand how `.github/copilot-instructions.md` shapes every suggestion in this project
5. [**Leverage Chat for Debugging**](#capability-5--chat-for-debugging-the-workflow) — use Copilot Chat to diagnose bugs you can describe but can't immediately locate
6. [**Be Mindful of Security and Privacy**](#capability-6--be-mindful-of-security-and-privacy) — see why secrets must stay in environment variables and never enter completions
7. [**Understand Limitations**](#capability-7--understand-limitations) — recognise the patterns where Copilot consistently gets it wrong and know how to correct it

[↑ Back to top](#workshop-1-foundational-web-development-with-github-copilot--java-edition)

---

## Workshop Agenda

| Time | Demo | Topic | Files |
|------|------|-------|-------|
| 0–15 min | Demo 1 | Inline Suggestions: Adding fields to Java records and services | `dto/GeocodeResponse.java`, `dto/DirectionsResponse.java`, `dto/SearchResponse.java`, `service/MapboxService.java` |
| 15–30 min | Demo 2 | Comment-Based Generation: New controller endpoints and service methods | `controller/GeospatialController.java`, `service/AzureMapsService.java`, `service/MapboxService.java` |
| 30–45 min | Demo 3 | Chat Debugging: Coordinate format bugs in Java | `service/MapboxService.java`, `service/AzureMapsService.java`, `dto/GeocodeResponse.java` |
| 45–60 min | Demo 4 | Security Pattern: `@Value`, `application.yml`, and env var injection in Spring Boot | `service/MapboxService.java`, `service/AzureMapsService.java`, `application.yml`, `config/WebClientConfig.java` |

> All file paths are relative to `backend-java/src/main/java/com/roadtrip/geospatial/` unless otherwise noted.

---

## The 7 Copilot Capabilities — Where Each Appears

| Capability | Demo 1 | Demo 2 | Demo 3 | Demo 4 |
|-----------|--------|--------|--------|--------|
| **1. Understand Copilot's Role** | ✅ Record pattern drives field suggestions | ✅ Existing handler shapes new endpoint | | |
| **2. Provide Clear Context** | ✅ Comment precision changes field type/name | ✅ Javadoc 4-part anatomy comparison | ✅ Symptom-first prompts vs vague prompts | ✅ Property placeholder names in prompts |
| **3. Iterative Acceptance** | ✅ Accept record field, reject POJO rewrite | ✅ Review injection order before accepting | | |
| **4. Customize Copilot** | ✅ Instruction file enforces records over POJOs | ✅ Constructor injection rule blocks `@Autowired` | | ✅ Instruction file bans hardcoded secrets |
| **5. Chat for Debugging** | | | ✅ Full 3-step bug diagnosis workflow | ✅ Ask Chat to compare `@Value` vs `@ConfigurationProperties` |
| **6. Security and Privacy** | | | | ✅ `@Value` + `application.yml` + env vars; Key Vault in prod |
| **7. Understand Limitations** | ✅ POJO vs record bias; Lombok on records | ✅ `@Autowired`; invented method names | ✅ Symptom-fix vs root-cause fix | ✅ Hardcoded fallback token strings |

---

## Java Backend Architecture Quick Reference

Before diving into the demos, understand the structure you'll be working with:

```
backend-java/
├── pom.xml                          # Spring Boot 3.3, Java 21, WebFlux for HTTP client
├── src/main/resources/
│   └── application.yml              # Property config — env vars mapped to Spring properties
└── src/main/java/com/roadtrip/geospatial/
    ├── GeospatialApplication.java   # @SpringBootApplication entry point
    ├── config/
    │   ├── CorsConfig.java          # CORS via WebMvcConfigurer (reads ALLOWED_ORIGINS env var)
    │   └── WebClientConfig.java     # WebClient.Builder bean for HTTP calls
    ├── controller/
    │   ├── GeospatialController.java # REST endpoints: /api/geocode, /api/directions, /api/search, /api/optimize
    │   └── HealthController.java     # GET /health
    ├── dto/
    │   ├── GeocodeResponse.java     # record(List<Double> coordinates, String placeName)
    │   ├── DirectionsResponse.java  # record(double distance, double duration, Map geometry, List legs)
    │   └── SearchResponse.java      # record(List<Map<String, Object>> features)
    └── service/
        ├── MapboxService.java       # Mapbox API proxy: geocode, directions, optimize
        └── AzureMapsService.java    # Azure Maps API proxy: fuzzy search with GeoJSON transform
```

**Key patterns to notice**:
- **All DTOs are Java records** — immutable, compact, with auto-generated `equals`, `hashCode`, `toString`
- **Constructor injection only** — no `@Autowired` field injection anywhere in the codebase
- **`@Value` for config** — secrets and URLs injected via `application.yml` → environment variables
- **WebClient (reactive)** — used with `.block()` for synchronous-style calls within a traditional Spring MVC app

---

## Copilot Keyboard Shortcuts — Quick Reference

Keep this handy during all demos:

| Action | VS Code | IntelliJ |
|--------|---------|----------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept one word | `Ctrl+→` (macOS: `⌘→`) | `⌥→` |
| Reject suggestion | `Esc` | `Esc` |
| Open Completions Panel | `Ctrl+Enter` | `Alt+\` |
| Trigger suggestion manually | `Alt+\` | `Alt+\` |
| Open Copilot Chat | `Ctrl+Shift+I` (macOS: `⌘⇧I`) | via plugin |

**Rule of thumb**: If a suggestion introduces an import you didn't expect, press `Esc` and re-read the entire block before accepting.

---

## Demo 1: Inline Suggestions — Adding Fields to Java Records and Services (15 min)

> **Copilot capabilities in focus**: Understand Copilot's Role · Provide Clear Context · Iterative Acceptance · Understand Limitations

### Objective

See how Copilot reads existing Java record patterns and adapts its suggestions accordingly. Practise line-by-line acceptance with `Tab`/`Ctrl+→`/`Esc`. Learn where Copilot predictably fails with Java records — and how to correct it.

### Capability 1 — Understand Copilot's Role

Copilot does not just autocomplete syntax — it reads the **entire open file** before suggesting. In this demo you will see it:
- Match the existing Java `record` syntax in the `dto/` package
- Follow the `@SuppressWarnings("unchecked")` pattern from `MapboxService.java`
- Mirror the constructor injection style from service classes
- Use `List.of()` and `Map.of()` immutable collections already present in the codebase

This only works when the file is **open and in context**. If Copilot's suggestion looks wrong, the first question is always: *what context does it have?*

### Scenario

The geospatial service needs richer DTOs: `GeocodeResponse` should include a country code, `DirectionsResponse` needs waypoint data, and `SearchResponse` should use typed records instead of raw `Map<String, Object>`.

### Before Demo: Setup

Open these three files side by side:
```bash
code backend-java/src/main/java/com/roadtrip/geospatial/dto/GeocodeResponse.java
code backend-java/src/main/java/com/roadtrip/geospatial/dto/DirectionsResponse.java
code backend-java/src/main/java/com/roadtrip/geospatial/dto/SearchResponse.java
```

---

### Part A — Add `countryCode` to `GeocodeResponse`

**Existing code in `GeocodeResponse.java`**:
```java
package com.roadtrip.geospatial.dto;

import java.util.List;
import java.util.Map;

public record GeocodeResponse(
        List<Double> coordinates,
        String placeName
) {}
```

**Live coding step — position cursor after `String placeName` and type this comment**:
```java
// Add a countryCode field: ISO 3166-1 alpha-2 country code parsed from place_name
```

**Expected Copilot inline suggestion**:
```java
public record GeocodeResponse(
        List<Double> coordinates,
        String placeName,
        String countryCode  // ISO 3166-1 alpha-2, e.g. "US"
) {}
```

> **What to Watch For**: Copilot may suggest a full class rewrite instead of adding a field to the existing record. If it generates `public class GeocodeResponse {` with getters/setters, **reject immediately** with `Esc` and re-prompt with `// add countryCode field to this record`.

**Decision checklist**:
- ✅ Stays as a Java `record` — not rewritten as a POJO class
- ✅ Uses `String` type (not `Optional<String>` — records work best with non-null fields and `@Nullable` annotation if needed)
- ✅ Comment explains the format (`"US"`) for future maintainers
- ⚠️ Adding a new record field is a **breaking change** — the constructor call in `MapboxService.geocode()` must also be updated

**Navigate to the caller in `MapboxService.java` (line 69)**:
```java
// MapboxService.java — current code:
return new GeocodeResponse(coordinates, placeName);
```

When you position the cursor here with the updated `GeocodeResponse.java` open, Copilot should suggest updating the constructor call:
```java
// Expected Copilot suggestion after record change:
return new GeocodeResponse(coordinates, placeName, countryCode);
```

This demonstrates Capability 1: Copilot reads the updated record definition from the open tab and adjusts the constructor call.

**Verification**:
```bash
cd backend-java && ./mvnw compile
# Should fail until MapboxService.geocode() is updated — this is intentional teaching
```

---

### Part B — Add `waypoints` to `DirectionsResponse`

**Existing code in `DirectionsResponse.java`**:
```java
public record DirectionsResponse(
        double distance,
        double duration,
        Map<String, Object> geometry,
        List<Map<String, Object>> legs
) {}
```

**Live coding step — add a comment before the closing `)`**:
```java
// Add waypoints: list of coordinate pairs [lng, lat] for each waypoint on the route
```

**Expected Copilot suggestion**:
```java
public record DirectionsResponse(
        double distance,
        double duration,
        Map<String, Object> geometry,
        List<Map<String, Object>> legs,
        List<List<Double>> waypoints  // coordinate pairs [lng, lat] for each waypoint
) {}
```

**Decision checklist**:
- ✅ `List<List<Double>>` matches the GeoJSON coordinate array convention used throughout the codebase
- ✅ Placed after `legs` — maintains logical field ordering (route metadata → route segments → waypoints)
- ⚠️ Copilot may suggest `List<double[]>` — reject; the codebase consistently uses `List<Double>` for coordinates (Mapbox JSON deserialises to `List`, not arrays)

---

### Part C — Type the `SearchResponse` Features (Advanced)

**Existing code in `SearchResponse.java`**:
```java
public record SearchResponse(
        List<Map<String, Object>> features
) {}
```

This uses `Map<String, Object>` — a weakly-typed catch-all. The goal is to introduce a typed `Feature` record.

**Live coding step — add a comment above the record**:
```java
// Replace the raw Map features with a typed Feature record containing:
// id (String), type (String, always "Feature"), text (String, POI name),
// placeName (String, full address), geometry with type and coordinates
```

**Expected Copilot suggestion**:
```java
public record SearchResponse(
        List<Feature> features
) {
    public record Feature(
            String id,
            String type,
            String text,
            String placeName,
            Geometry geometry
    ) {
        public record Geometry(
                String type,
                List<Double> coordinates
        ) {}
    }
}
```

> **What to Watch For**: This is where Copilot's POJO bias is strongest. For nested types, Copilot frequently generates:
> ```java
> // ❌ Copilot may suggest this — reject:
> public class Feature {
>     private String id;
>     private String type;
>     // ...getters, setters, constructor — 40+ lines of boilerplate
> }
> ```
> If this happens, reject with `Esc` and add the explicit comment: `// use nested Java records, not classes`

**Decision checklist**:
- ✅ Nested records — compact, immutable, no boilerplate
- ✅ Field names match the GeoJSON keys that `AzureMapsService.searchPlaces()` already builds (lines 92–107)
- ⚠️ This is a **refactoring** — `AzureMapsService.searchPlaces()` must be updated to construct `Feature` records instead of `LinkedHashMap`. That update is out of scope for this demo but makes an excellent hands-on exercise

**Verification** (for Part A only — Parts B and C require corresponding service updates):
```bash
cd backend-java && ./mvnw compile
```

---

### Common Copilot Mistakes with Java Records

| Mistake | Why it happens | How to correct |
|---------|---------------|----------------|
| Suggests POJO class instead of `record` | `record` is a Java 16+ feature; older patterns dominate training data | Add comment `// use Java record` and reject the class |
| Adds `@Data` or `@Getter` (Lombok) to a record | Lombok annotations are extremely common in training data | Records already have accessors — Lombok is redundant and causes compiler warnings |
| Generates a Builder pattern for a record | Builder is a common DTO pattern | Records with ≤5 fields don't need builders; the canonical constructor is sufficient |
| Invents a field type that doesn't exist | Training data contains many plausible types | Always verify the type exists in the project — use `Ctrl+Click` to navigate |
| Suggests `Optional<T>` for record fields | Nullable patterns from Kotlin/Scala influence | Java records work best with `@Nullable` annotation + null checks, not `Optional` fields |

### Teaching Points

#### Capability 1 — Understand Copilot's Role
- Copilot read the existing `record` keyword and the import list in `GeocodeResponse.java` before suggesting. When the file had only the raw record, Copilot added a field in record syntax. When context was missing (file closed), it reverted to POJO.
- **Demo it live**: Close `GeocodeResponse.java`, open a new blank file, type `public class Geocode` — Copilot will generate a full POJO. Now re-open the record file and type the same comment — Copilot generates a record field.

#### Capability 3 — Iterative Acceptance
Never press `Tab` to accept the whole block. Instead:
```
Tab          — accept one line
Ctrl+→       — accept one word at a time
Ctrl+Enter   — open Completions Panel to choose between suggestions
Esc          — reject current suggestion and re-prompt
```

In this demo, the critical rejected lines were:
- POJO `public class` instead of `record` → reject, re-prompt with `// use Java record`
- `@Data` Lombok annotation on a record → reject (redundant)
- `Optional<String> countryCode` → reject if the team convention is `@Nullable`

#### Capability 7 — Understand Limitations

| Where Copilot fails | Why | Training data bias |
|---------------------|-----|--------------------|
| Generates POJO + getters instead of `record` | `record` is newer (Java 16+) | Older Java tutorials with POJOs overwhelmingly dominate |
| Adds Lombok annotations to records | Lombok is in ~40% of Java repos on GitHub | Records make Lombok redundant but Copilot doesn't know that |
| Suggests mutable `ArrayList` in record constructor | Records are immutable but constructors allow mutation | Use `List.of()` or `Collections.unmodifiableList()` |
| Invents plausible-looking but non-existent method names | Statistical pattern matching | Always compile-check before committing |

---

## Demo 2: Comment-Based Generation — New Endpoints and Service Methods (15 min)

> **Copilot capabilities in focus**: Provide Clear Context · Customize Copilot · Iterative Acceptance · Understand Limitations

### Objective

Use Javadoc comment prompts to generate complete REST endpoints and corresponding service methods. Explore how prompt precision controls output quality, and see how the project's `.github/copilot-instructions.md` instruction file constrains what Copilot will suggest.

### Capability 4 — Customize Copilot: The Instruction File

Before writing a single comment, open [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) and point out the Java-specific rules:

```markdown
# From .github/copilot-instructions.md:

## Java Backend
- backend-java/src/main/java/com/roadtrip/geospatial/controller/: REST controllers
- backend-java/src/main/java/com/roadtrip/geospatial/service/: Business logic
- backend-java/src/main/java/com/roadtrip/geospatial/dto/: Data transfer objects

## Code Standards
- Constructor injection ONLY — never @Autowired field injection
- Spring Boot 3 ONLY (NOT Quarkus, Micronaut, or Jakarta EE)

## Pitfalls
7. Hardcoding API tokens: Use environment variables + .env files (never commit!)
```

**Ask the group**: *"If the instruction file says 'Constructor injection ONLY', what happens when Copilot generates a new service with `@Autowired`?"*

**Answer**: Copilot reads the instruction file and will resist suggesting `@Autowired` field injection. When it still does (Capability 7 — Limitations), the instruction file gives you the explicit basis to reject.

### Capability 2 — Provide Clear Context: Comment Anatomy

A Javadoc comment prompt has four parts. All four are needed to consistently produce correct results:

```java
/**
 * [HTTP METHOD + PATH]     → GET /api/search/nearby
 * [BEHAVIOUR]              → Search for POIs near a coordinate using Azure Maps
 * [DEPENDENCIES]           → Uses azureMapsService.searchPlaces()
 * [RETURN CONTRACT]        → @return ResponseEntity<SearchResponse>
 */
```

Remove any one part and observe how the suggestion degrades:
- Remove `[DEPENDENCIES]` → Copilot may inject `mapboxService` instead of `azureMapsService`
- Remove `[RETURN CONTRACT]` → Copilot guesses the return type (often `ResponseEntity<Object>`)
- Remove `[HTTP METHOD + PATH]` → Copilot generates a plain method, not a Spring `@GetMapping` handler

### Scenario

The app needs three new endpoints: a nearby POI search (`/api/search/nearby`), a corresponding service method in `AzureMapsService`, and a batch geocoding endpoint (`/api/geocode/batch`).

---

### Part A — Generate `GET /api/search/nearby` in the Controller

**Open `GeospatialController.java`. Navigate below the existing `searchPlaces` handler.**

**Existing handler to reference (the code Copilot will model after)**:
```java
@GetMapping("/search")
public ResponseEntity<SearchResponse> searchPlaces(
        @RequestParam("query") String query,
        @RequestParam(value = "proximity", required = false) String proximity) {
    SearchResponse result = azureMapsService.searchPlaces(query, proximity);
    return ResponseEntity.ok(result);
}
```

**Live coding step — type this Javadoc comment below the `searchPlaces` handler**:
```java
/**
 * Search for POIs near a coordinate using Azure Maps.
 * GET /api/search/nearby
 *
 * @param lat  latitude of the center point
 * @param lon  longitude of the center point
 * @param query category to search (e.g. "gas station", "restaurant")
 * @param radiusMeters search radius in meters, default 5000
 * @return GeoJSON-compatible feature list via azureMapsService
 */
```

**Expected Copilot suggestion**:
```java
@GetMapping("/search/nearby")
public ResponseEntity<SearchResponse> searchNearby(
        @RequestParam("lat") double lat,
        @RequestParam("lon") double lon,
        @RequestParam("query") String query,
        @RequestParam(value = "radiusMeters", defaultValue = "5000") int radiusMeters) {
    String proximity = lon + "," + lat;
    SearchResponse result = azureMapsService.searchPlaces(query, proximity);
    return ResponseEntity.ok(result);
}
```

**Compare with the existing `searchPlaces` handler pattern** — Copilot should have:
- Used `@GetMapping` (not `@PostMapping` or `@RequestMapping`)
- Used `@RequestParam` (not `@PathVariable`)
- Called `azureMapsService.searchPlaces()` (not `mapboxService`)
- Built the proximity string as `lon + "," + lat` — matching the `"lng,lat"` format the frontend sends

**Decision checklist**:
- ✅ Reuses existing `azureMapsService.searchPlaces()` — no code duplication
- ✅ Builds the `proximity` string as `"lon,lat"` — matches Azure Maps API format
- ✅ Uses `defaultValue = "5000"` for the radius — sensible default
- ⚠️ If Copilot injects `MapboxService` instead of `AzureMapsService` — POI search routes through Azure Maps in this project, not Mapbox
- ⚠️ If Copilot adds `@Autowired` to inject a new dependency — reject; the controller already has both services via constructor injection

**Verification**:
```bash
cd backend-java && ./mvnw compile
# Then test:
./mvnw spring-boot:run &
curl "http://localhost:8082/api/search/nearby?lat=37.77&lon=-122.42&query=gas+station"
# Expected: GeoJSON features list from Azure Maps
```

---

### Part B — Generate a `searchNearby()` Method in AzureMapsService

Now generate the corresponding service method. This demonstrates how Copilot models a new method after existing ones in the same file.

**Open `AzureMapsService.java`. Navigate below the existing `searchPlaces()` method.**

**Existing method signature to reference (what Copilot will model after)**:
```java
public SearchResponse searchPlaces(String query, String proximity) {
    validateKey();
    // ... Azure Maps call with WebClient ...
}
```

**Live coding step — type this Javadoc comment**:
```java
/**
 * Search for POIs near a specific coordinate with a radius constraint.
 * Delegates to Azure Maps Fuzzy Search API with lat/lon and radius parameters.
 *
 * @param query search query
 * @param lat   latitude of center point
 * @param lon   longitude of center point
 * @param radiusMeters search radius in meters
 * @return SearchResponse with GeoJSON-compatible features
 */
```

**Expected Copilot suggestion**:
```java
@SuppressWarnings("unchecked")
public SearchResponse searchNearby(String query, double lat, double lon, int radiusMeters) {
    validateKey();

    Map<String, Object> data = webClient.get()
            .uri(uriBuilder -> uriBuilder
                    .path("/search/fuzzy/json")
                    .queryParam("api-version", "1.0")
                    .queryParam("query", query)
                    .queryParam("lat", lat)
                    .queryParam("lon", lon)
                    .queryParam("radius", radiusMeters)
                    .queryParam("limit", 10)
                    .queryParam("subscription-key", azureMapsKey)
                    .build())
            .retrieve()
            .bodyToMono(Map.class)
            .block();

    if (data == null) {
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "No response from Azure Maps");
    }

    // Transform Azure Maps response to GeoJSON format
    // (reuse the same transform logic from searchPlaces)
    List<Map<String, Object>> results = (List<Map<String, Object>>) data.getOrDefault("results", List.of());
    List<Map<String, Object>> features = new ArrayList<>();
    // ... GeoJSON transform logic ...
    return new SearchResponse(features);
}
```

> **What to Watch For**: Copilot should copy the WebClient pattern from `searchPlaces()` above it. If the `AzureMapsService.java` file is **closed**, Copilot may invent a completely different HTTP client pattern (e.g. `RestTemplate` or `HttpClient`). This is a live demonstration of Capability 1: **context from open files drives suggestion quality**.

**Decision checklist**:
- ✅ Calls `validateKey()` first — same defensive pattern as existing methods
- ✅ Uses WebClient builder with `.bodyToMono(Map.class).block()` — matches existing codebase
- ✅ Reuses the GeoJSON transform logic
- ⚠️ Copilot may invent `azureMapsService.searchNearby()` with a different signature than what we generated — always check the actual method signature

**Teaching point — context window demo**:
1. Close `AzureMapsService.java`, type the Javadoc → Copilot suggests `RestTemplate` or raw `HttpURLConnection`
2. Re-open `AzureMapsService.java`, type the same Javadoc → Copilot suggests WebClient matching the existing pattern

This is the clearest demonstration of why **having the right files open matters**.

---

### Part C — Generate `GET /api/geocode/batch` for Batch Geocoding

**Open `GeospatialController.java`. Navigate below the `geocode` handler.**

**Existing `geocode` handler**:
```java
@GetMapping("/geocode")
public ResponseEntity<GeocodeResponse> geocode(@RequestParam("q") String q) {
    GeocodeResponse result = mapboxService.geocode(q);
    return ResponseEntity.ok(result);
}
```

**Live coding step — type this Javadoc comment**:
```java
/**
 * Geocode multiple addresses in a single request.
 * GET /api/geocode/batch
 *
 * @param addresses comma-separated list of address strings
 * @return list of GeocodeResponse, one per address, using mapboxService.geocode()
 */
```

**Expected Copilot suggestion**:
```java
@GetMapping("/geocode/batch")
public ResponseEntity<List<GeocodeResponse>> batchGeocode(
        @RequestParam("addresses") String addresses) {
    String[] addressList = addresses.split(",");
    List<GeocodeResponse> results = new ArrayList<>();
    for (String address : addressList) {
        results.add(mapboxService.geocode(address.trim()));
    }
    return ResponseEntity.ok(results);
}
```

**Decision checklist**:
- ✅ Uses `mapboxService.geocode()` — correct service for geocoding in this project
- ✅ Trims each address — handles `"San Francisco, Los Angeles"` correctly
- ⚠️ Copilot may suggest `CompletableFuture` / parallel streams — sequential is correct here (Mapbox rate limits apply; parallel calls hit the same token)
- ⚠️ Copilot may suggest `@RequestBody List<String>` (POST) instead of `@RequestParam` (GET) — the endpoint should be GET for consistency with the existing `geocode` endpoint
- ⚠️ If Copilot generates a new private helper method like `geocodeSingle()` — reject; `mapboxService.geocode()` already exists

**Verification**:
```bash
cd backend-java && ./mvnw compile && ./mvnw spring-boot:run &
curl "http://localhost:8082/api/geocode/batch?addresses=San+Francisco,Los+Angeles"
# Expected: JSON array of two GeocodeResponse objects
```

---

### Capability 7 — Understand Limitations in Comment-Based Generation

These are the patterns where Copilot gets it wrong in *this specific Java codebase*:

| What Copilot gets wrong | Why | Fix |
|------------------------|-----|-----|
| `@Autowired` field injection | Field injection is the most common pattern in older Spring tutorials | Project uses constructor injection — the instruction file flags this; reject and re-prompt |
| Invents a service method that does not exist | Training data contains many plausible-but-fictional method names | Always `Ctrl+Click` the method name to verify it resolves |
| `@PostMapping` instead of `@GetMapping` | POST is common for batch operations in REST APIs | This project uses GET for reads — check existing endpoint patterns |
| `@PathVariable` instead of `@RequestParam` | Path variables are common for IDs | This project uses query parameters for search — match existing patterns |
| `RestTemplate` instead of `WebClient` | `RestTemplate` has far more training examples | The project uses WebClient exclusively (see `WebClientConfig.java`) |
| Returns `ResponseEntity<Object>` | Generic fallback when return type is unclear | Always specify `@return` in the Javadoc prompt |

### Verification — All Three Endpoints
```bash
cd backend-java && ./mvnw compile

# Start the service
./mvnw spring-boot:run &

# Test nearby search
curl "http://localhost:8082/api/search/nearby?lat=37.77&lon=-122.42&query=gas+station"

# Test batch geocode
curl "http://localhost:8082/api/geocode/batch?addresses=San+Francisco,Los+Angeles"

# Kill the background process
kill %1
```

---

## Demo 3: Chat Debugging — Coordinate Format Bugs in Java (15 min)

> **Copilot capabilities in focus**: Leverage Chat for Debugging and Exploration · Provide Clear Context · Understand Limitations

### Objective

Use Copilot Chat to diagnose the `[lat, lng]` vs `[lng, lat]` coordinate format bug — one of the most common and insidious bugs in geospatial applications. Show how Chat's *explain* and *explore* modes make it a root-cause analysis tool. Then demonstrate Chat's key limitation: its first suggestion often fixes the symptom, not the root cause.

### Capability 5 — Chat for Debugging: The Workflow

Copilot Chat is a **reasoning tool**, not just a code generator. For debugging, use this three-step workflow:

```
Step 1 — Describe the symptom (not your guess)
  "POI search results appear in the wrong city."
  NOT: "I think the coordinates are swapped — how do I fix them?"

Step 2 — Provide the relevant code snippet
  Paste the exact lines that handle coordinates.

Step 3 — Ask for root cause, then prevention
  "What is the root cause of this bug?"
  "How can we prevent this class of bug in the codebase?"
```

The third question — *prevention* — is where Chat provides the most value. It will suggest type-safe alternatives like named records instead of `List<Double>`.

### Background: Why this bug is so common

| API | Coordinate convention | Trap |
|-----|----------------------|------|
| **Mapbox / GeoJSON** | `[longitude, latitude]` | Feels backwards to GPS users who think "lat first" |
| **Google Maps** | `LatLng(latitude, longitude)` | Opposite order from GeoJSON |
| **Azure Maps REST** | `{ "lat": ..., "lon": ... }` | Named fields — safe, but easy to swap when building arrays |
| **Java `List<Double>`** | index 0 = lng, index 1 = lat | No field names — purely positional, no compiler help |

---

### Part A — Bug in `MapboxService.geocode()` Consumer

**Real code in `MapboxService.java` (lines 65–69)**:
```java
// MapboxService.java — geocode() method
@SuppressWarnings("unchecked")
List<Double> coordinates = (List<Double>) geometry.get("coordinates");
String placeName = (String) feature.get("place_name");
return new GeocodeResponse(coordinates, placeName);
```

Mapbox returns `"coordinates": [-122.4194, 37.7749]` — GeoJSON order: `[longitude, latitude]`.

**Introduce a consuming bug in a hypothetical caller**:
```java
// ❌ Buggy caller code:
GeocodeResponse response = mapboxService.geocode("San Francisco, CA");
double lat = response.coordinates().get(0);  // BUG: gets -122.4194 (longitude), not latitude
double lon = response.coordinates().get(1);  // BUG: gets 37.7749 (latitude), not longitude

// Used later to build an Azure Maps query:
String proximity = lon + "," + lat;  // Sends "37.7749,-122.4194" — WRONG format
```

**Copilot Chat prompt** (Step 1 — symptom, not guess):
```
In MapboxService.geocode(), the returned GeocodeResponse.coordinates() is 
a List<Double> from Mapbox. A caller does coordinates().get(0) and assigns it 
to a variable named `lat`. A marker drawn from that lat value appears in the 
Pacific Ocean. What is the bug and how should the caller read the coordinates?
```

**Expected Chat response key points**:
- Mapbox follows GeoJSON: `coordinates[0]` = **longitude**, `coordinates[1]` = **latitude**
- `get(0)` returns `-122.4194` which is the longitude; assigning it to `lat` is the bug
- The correct reading is: `lon = get(0)`, `lat = get(1)`

**Fix**:
```java
// ✅ Correct reading:
double lon = response.coordinates().get(0);  // index 0 = longitude (GeoJSON)
double lat = response.coordinates().get(1);  // index 1 = latitude
```

---

### Part B — Bug in `AzureMapsService.searchPlaces()` Proximity Parsing

**Real code in `AzureMapsService.java` (lines 47–56)**:
```java
// AzureMapsService.java — searchPlaces() proximity parsing
if (proximity != null && !proximity.isBlank()) {
    try {
        String[] parts = proximity.split(",");
        lon = Double.parseDouble(parts[0]); // Longitude first in input
        lat = Double.parseDouble(parts[1]); // Latitude second in input
    } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid proximity format. Expected: lng,lat");
    }
}
```

**Introduce the bug by swapping the assignments**:
```java
// ❌ Buggy version:
lat = Double.parseDouble(parts[0]); // WRONG: reads longitude value as latitude
lon = Double.parseDouble(parts[1]); // WRONG: reads latitude value as longitude
```

The frontend sends proximity as `"-122.4194,37.7749"` (`lng,lat` format). With the swap:
- `lat` gets `-122.4194` (actually longitude)
- `lon` gets `37.7749` (actually latitude)
- Azure Maps query sends `lat=-122.4194&lon=37.7749` — results appear near Antarctica

**Copilot Chat prompt**:
```
In AzureMapsService.java searchPlaces(), the proximity parameter arrives from 
the frontend as "lng,lat" (e.g. "-122.4194,37.7749"). The code splits on comma 
and assigns parts[0] to `lat` and parts[1] to `lon`. POI search results appear 
in the wrong hemisphere. What is the bug?
```

**Expected Chat response**:
- Frontend sends `"lng,lat"` → `parts[0]` = `-122.4194` = longitude
- Assigning `parts[0]` to `lat` is incorrect
- Fix: `lon = parts[0]`, `lat = parts[1]`

**Also show the downstream GeoJSON transform** (lines 94–98):
```java
// AzureMapsService.java — GeoJSON transform (already correct):
geometry.put("coordinates", List.of(
        position.getOrDefault("lon", 0.0),  // Longitude first (GeoJSON spec)
        position.getOrDefault("lat", 0.0)   // Latitude second (GeoJSON spec)
));
```

This transform is correct because it follows GeoJSON. The bug is only in the *input parsing*, not the *output formatting*. Ask the group: *"If both input parsing and output formatting were wrong, would the results look correct?"* (Answer: yes — two wrongs can appear to cancel out, making the bug invisible until a third component reads the data.)

---

### Part C — Exploration: Making `GeocodeResponse` Self-Documenting

**Copilot Chat prompt (exploration, not debugging)**:
```
The GeocodeResponse record in this project uses List<Double> for coordinates, 
which makes it easy to accidentally swap longitude and latitude indices. 
How can we redesign this record to make the GeoJSON coordinate convention 
self-documenting so this class of bug cannot be introduced silently?
```

**Expected Chat response**:
```java
// Chat will suggest a named record:
public record GeoCoordinate(double longitude, double latitude) {

    /**
     * Create from a GeoJSON coordinate array [lng, lat].
     */
    public static GeoCoordinate fromGeoJson(List<Double> coordinates) {
        return new GeoCoordinate(coordinates.get(0), coordinates.get(1));
    }

    /**
     * Convert back to GeoJSON coordinate array [lng, lat].
     */
    public List<Double> toGeoJson() {
        return List.of(longitude, latitude);
    }
}

// Updated GeocodeResponse:
public record GeocodeResponse(
        GeoCoordinate coordinates,  // Named fields prevent index confusion
        String placeName
) {}
```

This is an *exploration* prompt — Chat is the right tool for cross-cutting design questions that span multiple files. Inline suggestions alone cannot generate this kind of architectural refactoring.

---

### Capability 7 — The Symptom-Fix Trap

**Live demonstration — show how prompt specificity determines diagnosis quality**:

**Vague prompt** (bad):
```
POI search results are showing in the wrong location. How do I fix it?
```

Copilot Chat's likely (wrong) first response:
```java
// ❌ Chat may suggest swapping parameter names — symptom fix:
params.put("lat", lon);  // renames, but data assignment is still wrong
params.put("lon", lat);
```

**Specific prompt** (good):
```
In AzureMapsService.searchPlaces(), proximity arrives as "-122.4194,37.7749" 
(lng,lat format). The code does lat = parts[0] and lon = parts[1]. 
Azure Maps returns results near Antarctica instead of San Francisco. 
What is the root cause?
```

Chat now correctly identifies the index swap and fixes the *data assignment*, not the *parameter names*.

**Key teaching point**: The quality of Chat's diagnosis is **directly proportional to prompt specificity**:
- Vague symptom → symptom-level fix (may compile but doesn't solve the problem)
- Specific code + specific values + specific wrong behaviour → root-cause fix

### Coordinate Convention Reference for Java

| Source | Format | Index 0 | Index 1 |
|--------|--------|---------|---------|
| Mapbox Geocoding API | `[lng, lat]` | longitude | latitude |
| Mapbox Directions API | `"lng,lat;lng,lat"` | longitude | latitude |
| Azure Maps REST | `{ "lat": ..., "lon": ... }` | — (named fields) | — |
| Azure Maps query params | `lat=...&lon=...` | — (named params) | — |
| Frontend proximity string | `"lng,lat"` | longitude | latitude |
| `GeocodeResponse.coordinates()` | `List<Double>` | longitude (0) | latitude (1) |

---

## Demo 4: Security Pattern — `@Value`, `application.yml`, and Environment Variables in Spring Boot (15 min)

> **Copilot capabilities in focus**: Be Mindful of Security and Privacy · Provide Clear Context · Understand Limitations · Customize Copilot

### Objective

Understand the two-level secret injection pattern in Spring Boot: `environment variable` → `application.yml` property → `@Value` annotation. See why this demo is primarily about developer habits — and why Copilot itself is a security risk vector if not used carefully.

### Capability 6 — Be Mindful of Security and Privacy

Copilot presents three distinct security risks:

**Risk 1 — Context contamination from open files**

If you open a `.env` file in VS Code while Copilot is active, its content may influence suggestions across all open files. **Never open `.env` files while pair-programming with Copilot on shared screens.**

**Risk 2 — Hardcoded secrets when config files are not in context**

If `application.yml` is **not** open, Copilot may suggest:
```java
// ❌ Copilot may generate this when it lacks context:
private final String mapboxToken = "pk.eyJ1IjoiZXhhbXBsZSI...";
```

The instruction file at [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) explicitly blocks this:
```markdown
# From copilot-instructions.md → Pitfalls:
7. Hardcoding API tokens: Use environment variables + .env files (never commit!)
```

**Risk 3 — Real-looking but invalid token strings**

Copilot is trained on public code that included real (now-revoked) API tokens. Never copy a token string from a Copilot suggestion — always generate new credentials from your provider console.

### The Two APIs Being Protected in the Java Backend
- **Mapbox token** — used by `MapboxService.java` for geocoding, directions, and route optimization
- **Azure Maps key** — used by `AzureMapsService.java` for POI fuzzy search

---

### Part A — The Two-Level Indirection: Env Var → Property → `@Value`

**Start with `application.yml`** — the bridge between environment variables and Spring beans:
```yaml
# backend-java/src/main/resources/application.yml

server:
  port: ${PORT:8082}

geospatial:
  mapbox:
    token: ${MAPBOX_TOKEN:}           # Empty default — validated at runtime
    base-url: https://api.mapbox.com
  azure-maps:
    key: ${AZURE_MAPS_KEY:}           # Empty default — validated at runtime
    base-url: https://atlas.microsoft.com
```

Key observations:
- `${MAPBOX_TOKEN:}` — the `:` after the variable name means "default to empty string if not set"
- This prevents Spring from throwing `BeanCreationException` at startup, deferring validation to the service layer
- URLs (`base-url`) are **not** secrets — they can be hardcoded in the config file

**Now trace into `MapboxService.java` constructor**:
```java
@Service
public class MapboxService {

    private final WebClient webClient;
    private final String mapboxToken;

    public MapboxService(
            WebClient.Builder webClientBuilder,
            @Value("${geospatial.mapbox.base-url}") String baseUrl,
            @Value("${geospatial.mapbox.token}") String token) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.mapboxToken = token;
    }
```

**The complete chain**:
```
OS Environment: MAPBOX_TOKEN=pk.real_token_here
        ↓
application.yml: geospatial.mapbox.token=${MAPBOX_TOKEN:}
        ↓
@Value("${geospatial.mapbox.token}") String token
        ↓
this.mapboxToken = token  (stored as final field — immutable)
```

**Same pattern in `AzureMapsService.java`**:
```java
public AzureMapsService(
        WebClient.Builder webClientBuilder,
        @Value("${geospatial.azure-maps.base-url}") String baseUrl,
        @Value("${geospatial.azure-maps.key}") String key) {
    this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    this.azureMapsKey = key;
}
```

**Teaching point — ask the group**: *"Why not read the env var directly with `System.getenv("MAPBOX_TOKEN")` in the constructor?"*

**Answer**: Spring's `@Value` gives you:
1. **Profile override** — `application-prod.yml` can swap the source to Azure Key Vault
2. **Test override** — `@SpringBootTest` with `@TestPropertySource` can inject test values without env vars
3. **Centralised config** — one `application.yml` documents all external dependencies
4. **Startup validation** — if you remove the `:` default (e.g. `${MAPBOX_TOKEN}`), Spring fails fast at startup

---

### Part B — Runtime Validation: `validateToken()` and `validateKey()`

Both services validate their secrets at the start of every public method:

**`MapboxService.java`**:
```java
private void validateToken() {
    if (mapboxToken == null || mapboxToken.isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Mapbox token not configured");
    }
}

// Called at the top of every public method:
public GeocodeResponse geocode(String query) {
    validateToken();  // ← Fails fast with 500 if MAPBOX_TOKEN is unset
    // ... proceed with WebClient call
}
```

**`AzureMapsService.java`**:
```java
private void validateKey() {
    if (azureMapsKey == null || azureMapsKey.isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Azure Maps key not configured");
    }
}
```

**Why validate at runtime, not startup?**

The `application.yml` uses `${MAPBOX_TOKEN:}` (empty default), so Spring doesn't throw at startup. This is intentional:
- **In development**: developers may not have all API keys. The app starts, and only the endpoints that need the missing key return 500
- **In production**: all keys are set via Azure Key Vault → App Service → environment variables. The validate methods are a safety net

**Copilot Chat prompt** (live demo):
```
In MapboxService.java, the @Value("${geospatial.mapbox.token}") annotation 
allows an empty default. The validateToken() method then checks at each request. 
What are the trade-offs of this deferred validation vs failing at startup 
with @Value("${geospatial.mapbox.token}") (no default)?
```

**Expected Chat response**:
- **Deferred validation (current)**: App starts without all keys; partial functionality available; good for local dev
- **Startup validation (no default)**: App refuses to start without the key; safer for production; but blocks local developers who don't have all keys

---

### Part C — Spring Profiles for Production: Azure Key Vault Integration

**Ask Copilot Chat to generate a prod profile configuration**:
```
Generate an application-prod.yml for this Spring Boot app that reads 
MAPBOX_TOKEN and AZURE_MAPS_KEY from Azure Key Vault using Spring Cloud Azure. 
The Key Vault URI should come from an environment variable AZURE_KEYVAULT_URI.
```

**Expected Chat suggestion**:
```yaml
# application-prod.yml
spring:
  cloud:
    azure:
      keyvault:
        secret:
          property-sources:
            - name: road-trip-keyvault
              endpoint: ${AZURE_KEYVAULT_URI}

geospatial:
  mapbox:
    token: ${MAPBOX-TOKEN}        # Key Vault secret name (hyphens, not underscores)
    base-url: https://api.mapbox.com
  azure-maps:
    key: ${AZURE-MAPS-KEY}        # Key Vault secret name
    base-url: https://atlas.microsoft.com
```

**Teaching points**:
- Key Vault secret names use **hyphens** (`MAPBOX-TOKEN`), not underscores — Spring Cloud Azure maps them automatically
- No code changes required — the same `@Value` annotations in the service classes resolve to Key Vault secrets in prod
- The managed identity of the Azure App Service authenticates to Key Vault — no client secret needed

---

### Part D — What Copilot Gets Wrong About Security

**Live demo — close `application.yml` and ask Copilot to generate a new service**:

Type this comment in a new file:
```java
// Create a WeatherService that calls the OpenWeatherMap API with an API key
```

**Without `application.yml` in context, Copilot may generate**:
```java
// ❌ Hardcoded key — Copilot's worst security suggestion:
@Service
public class WeatherService {
    private static final String API_KEY = "abc123def456";  // ❌ NEVER do this
    // ...
}
```

**Now open `application.yml` and `MapboxService.java`, then retype the same comment**:
```java
// ✅ With context, Copilot generates the @Value pattern:
@Service
public class WeatherService {
    private final String apiKey;

    public WeatherService(@Value("${weather.api-key}") String apiKey) {
        this.apiKey = apiKey;
    }
}
```

This is the most compelling demonstration that **Copilot's security awareness depends entirely on context**.

---

### Security Pattern Summary

| Concern | How it's handled in the Java backend |
|---------|-------------------------------------|
| Secret storage (local dev) | `.env` file in project root, read by `docker-compose.yml` |
| Secret injection bridge | `application.yml` maps env vars to Spring properties |
| Secret consumption | `@Value("${property}")` in constructor parameters |
| Runtime validation | `validateToken()` / `validateKey()` at method entry |
| Production secret store | Azure Key Vault via Spring Cloud Azure + managed identity |
| Empty default protection | `${MAPBOX_TOKEN:}` allows startup without keys; validation defers to request time |

### Never Do This (Three Anti-Patterns)

```java
// ❌ Anti-pattern 1: Hardcoded in source code
private static final String TOKEN = "pk.eyJ1IjoiYWN0dWFsLXRva2VuIiwiYSI6...}";

// ❌ Anti-pattern 2: @Value with a literal instead of property placeholder
@Value("pk.eyJ1IjoiYWN0dWFsLXRva2VuIiwiYSI6...}")
private String mapboxToken;

// ❌ Anti-pattern 3: Reading env var directly (bypasses Spring config)
private final String token = System.getenv("MAPBOX_TOKEN");
```

### Verification
```bash
# Confirm no hardcoded keys in Java source
grep -r "pk\.eyJ\|sk\.eyJ\|subscription-key.*[a-zA-Z0-9]\{20\}" \
    backend-java/src/ --include="*.java"
# Expected: no matches

# Confirm @Value uses property placeholders, not literals
grep -r "@Value" backend-java/src/ --include="*.java"
# Expected: @Value("${geospatial.mapbox.token}"), @Value("${geospatial.azure-maps.key}"), etc.

# Confirm application.yml uses env var references
grep -E '\$\{[A-Z_]+' backend-java/src/main/resources/application.yml
# Expected: ${PORT:8082}, ${MAPBOX_TOKEN:}, ${AZURE_MAPS_KEY:}
```

---

## Workshop Summary & Key Takeaways

### The 7 Capabilities — What Each Demo Taught

**Capability 1 — Understand Copilot's Role in Your Workflow** *(Demo 1)*
- Copilot reads the **entire open file** before suggesting. The `record` keyword in `GeocodeResponse.java` caused Copilot to suggest record fields, not POJO getters. When the file was closed, suggestions degraded to POJO patterns.
- **Practical habit**: Before starting a Copilot-assisted feature, open the most relevant existing file of the same type — for DTOs, open an existing record; for services, open a service with the same `WebClient` pattern.

**Capability 2 — Provide Clear Context for Better Suggestions** *(All Demos)*
- Javadoc prompt anatomy: `[METHOD + PATH]` + `[BEHAVIOUR]` + `[DEPENDENCIES]` + `[@return TYPE]`
- Missing `[DEPENDENCIES]` → Copilot injected `MapboxService` instead of `AzureMapsService` (Demo 2 Part A)
- Chat prompts: symptom + code snippet + expected values → root cause. Vague symptom → symptom fix only (Demo 3).

**Capability 3 — Use Iterative Acceptance of Suggestions** *(Demo 1)*
- `Tab` accepts one line; `Ctrl+→` accepts one word; `Esc` rejects entirely.
- Critical rejections from today:
  - POJO class instead of `record` → `Esc`, add comment `// use Java record`
  - `@Data` Lombok annotation on a record → `Esc` (redundant)
  - `CompletableFuture` for sequential batch geocoding → `Esc` (over-engineering)
- **Rule**: If a suggestion introduces an `import` you didn't expect, stop and review.

**Capability 4 — Customize Copilot for Your Needs** *(Demo 2)*
- [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) sets project-wide constraints: constructor injection only, Spring Boot 3 only, no hardcoded tokens.
- **Keep the instruction file pinned** — Copilot applies it more consistently when visible.
- Anti-patterns blocked today: `@Autowired` field injection, `RestTemplate` instead of `WebClient`, inline secret strings.

**Capability 5 — Leverage Copilot's Chat for Debugging and Exploration** *(Demo 3)*
- Three-step debug workflow: describe symptom → paste code → ask root cause then prevention.
- Chat is uniquely powerful for *exploration*: "How can `GeocodeResponse` prevent index swaps?" → Copilot designed a `GeoCoordinate(double longitude, double latitude)` record with factory method.
- Chat cannot be replaced by inline suggestions for cross-cutting design questions.

**Capability 6 — Be Mindful of Security and Privacy** *(Demo 4)*
- Three risks: `.env` contamination, hardcoded placeholder suggestions, real-looking revoked tokens.
- The Java backend's security chain: `env var` → `application.yml` → `@Value` → `final` field → `validateToken()`.
- **Context determines security**: closing `application.yml` caused Copilot to suggest hardcoded keys; opening it restored the `@Value` pattern.

**Capability 7 — Understand Limitations** *(All Demos)*

| Limitation | Observed in | Mitigation |
|-----------|------------|------------|
| Generates POJO instead of Java record | Demo 1 | Add `// use Java record` comment; keep record files open |
| Adds Lombok to records (redundant) | Demo 1 | Reject — records have built-in accessors |
| `@Autowired` field injection | Demo 2 | Instruction file + active rejection |
| Invents non-existent service methods | Demo 2 | `Ctrl+Click` to verify method exists before accepting |
| `RestTemplate` instead of `WebClient` | Demo 2 | Keep a `WebClient` service file open for context |
| Symptom fix instead of root cause | Demo 3 | Include specific values and wrong behaviour in Chat prompt |
| Suggests hardcoded secret strings | Demo 4 | Keep `application.yml` open; instruction file blocks this |

### Java-Specific Pitfalls — Quick Reference

| Pitfall | Wrong pattern | Correct pattern |
|---------|--------------|-----------------|
| Dependency injection | `@Autowired private MapboxService svc;` | Constructor parameter: `MapboxService svc` |
| DTO design | `public class Dto { private String x; ... }` | `public record Dto(String x) {}` |
| HTTP client | `RestTemplate` / `HttpURLConnection` | `WebClient` via `WebClientConfig.java` bean |
| Secret injection | `System.getenv("KEY")` or hardcoded string | `@Value("${property}")` in constructor |
| Coordinate index | `get(0)` = latitude ❌ | `get(0)` = **longitude** (GeoJSON spec) |
| Collection default | `new ArrayList<>()` in record | `List.of()` for immutable default |
| Batch processing | `CompletableFuture` / parallel streams | Sequential loop (respects API rate limits) |

---

## Hands-On Exercise (Optional — 15 min)

### Exercise 1: Add `GET /api/geocode/reverse` (Copilot inline + comment)

Reverse geocoding converts coordinates to an address. Mapbox provides this at `/geocoding/v5/mapbox.places/{lng},{lat}.json`.

**Starting point — type this in `GeospatialController.java`**:
```java
/**
 * Reverse geocode a coordinate pair to an address using Mapbox.
 * GET /api/geocode/reverse
 *
 * @param lng longitude
 * @param lat latitude
 * @return GeocodeResponse with place name and original coordinates
 */
```

**Expected outcome**: Copilot generates the controller endpoint. You'll also need to add a `reverseGeocode(double lng, double lat)` method to `MapboxService.java`.

**Verification**:
```bash
cd backend-java && ./mvnw compile && ./mvnw spring-boot:run &
curl "http://localhost:8082/api/geocode/reverse?lng=-122.4194&lat=37.7749"
# Expected: GeocodeResponse with placeName containing "San Francisco"
```

### Exercise 2: Add a `SearchCategory` Enum (Copilot Chat + inline)

The `/api/search` endpoint accepts any string query. Add a validated set of categories.

**Ask Copilot Chat**:
```
Create a Java enum SearchCategory with values GAS_STATION, RESTAURANT, HOTEL, 
PARKING, and ATTRACTION. Each should have a displayName field. Place it in the 
dto package following the existing record conventions.
```

Then update `GeospatialController.searchPlaces()` to accept an optional `SearchCategory` parameter.

### Exercise 3: Write a Unit Test for Coordinate Ordering

**Type this comment in a new test file**:
```java
// Test that GeocodeResponse.coordinates() follows GeoJSON convention:
// index 0 = longitude (-180 to 180), index 1 = latitude (-90 to 90)
```

Use Copilot to generate the test, then verify it catches the swap bug from Demo 3.

**Verification**:
```bash
cd backend-java && ./mvnw test
```

---

## Troubleshooting

### Common Spring Boot Startup Issues

| Problem | Error message | Fix |
|---------|--------------|-----|
| Missing env var (no default) | `Could not resolve placeholder 'MAPBOX_TOKEN'` | Add `:` default in `application.yml`: `${MAPBOX_TOKEN:}` |
| Port already in use | `Web server failed to start. Port 8082 was already in use` | `lsof -i :8082` and kill the process, or set `PORT=8083` |
| WebClient bean not found | `No qualifying bean of type 'WebClient.Builder'` | Ensure `WebClientConfig.java` has `@Configuration` and `@Bean` |
| Java version mismatch | `Unsupported class file major version 65` | Ensure Java 21 is on your `PATH`: `java -version` |
| Maven wrapper not executable | `Permission denied: ./mvnw` | `chmod +x backend-java/mvnw` |

### Environment Setup Checklist
```bash
# Verify Java 21
java -version
# Expected: openjdk 21.x.x

# Verify Maven wrapper works
cd backend-java && ./mvnw --version

# Set environment variables for local dev
export MAPBOX_TOKEN="your_mapbox_token_here"
export AZURE_MAPS_KEY="your_azure_maps_key_here"

# Start the service
./mvnw spring-boot:run
# Expected: Started GeospatialApplication on port 8082

# Quick smoke test
curl http://localhost:8082/health
# Expected: {"status":"healthy","service":"geospatial-service","runtime":"java"}
```

---

## Next Workshop Preview

**Workshop 2: Intermediate Web Development**
- **Few-shot prompting**: Show Copilot one service implementation, generate a parallel service
- **Refactoring**: Extract the GeoJSON transform from `AzureMapsService` into a reusable utility
- **WebClient patterns**: Error handling, retry logic, and circuit breakers with Copilot assistance
- **Testing**: Generate unit tests for `MapboxService` with mocked `WebClient` responses

**Preparation**:
- Read `backend-java/src/main/java/com/roadtrip/geospatial/service/MapboxService.java` — understand the WebClient pattern
- Read `backend-java/src/main/java/com/roadtrip/geospatial/service/AzureMapsService.java` — understand the GeoJSON transform
- Read `backend-java/src/main/java/com/roadtrip/geospatial/config/WebClientConfig.java` — understand bean configuration

---

## Resources

- **Project Architecture**: `docs/ARCHITECTURE.md`
- **Full Project Instructions**: `docs/PROJECT_INSTRUCTIONS.md`
- **AI Coding Agent Guide**: `.github/copilot-instructions.md` (the instruction file Copilot reads)
- **Copilot Docs**: https://docs.github.com/copilot
- **GeoJSON Spec**: https://geojson.org (coordinates are always `[longitude, latitude]`)
- **Spring Boot 3 Reference**: https://docs.spring.io/spring-boot/docs/3.3.x/reference/html/
- **Spring Cloud Azure**: https://learn.microsoft.com/en-us/azure/developer/java/spring-framework/

**Questions?** Continue to Workshop 2 or ask the instructor for clarification.
