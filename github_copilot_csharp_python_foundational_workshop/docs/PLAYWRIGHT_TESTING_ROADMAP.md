# Playwright E2E Testing Roadmap — Road Trip Planner

**Last Updated**: March 5, 2026  
**Status**: Foundation Implemented  
**Test Framework**: Playwright v1.57+ with TypeScript  
**Test Location**: `frontend/e2e/`  
**Target**: Docker Compose stack (frontend `:5173`, BFF `:3000`)  
**Auth Strategy**: `devLogin()` mock auth via `MOCK_TOKEN`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Setup Guide](#setup-guide)
4. [Conventions & Best Practices](#conventions--best-practices)
5. [Test Inventory](#test-inventory)
6. [Foundation Tests (Implemented)](#foundation-tests-implemented)
7. [Test Roadmap — CORE Prompts](#test-roadmap--core-prompts)
8. [Appendix: Selector Strategy](#appendix-selector-strategy)
9. [Appendix: CI/CD Integration](#appendix-cicd-integration)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  Playwright Test Runner                              │
│  ┌─────────────────────────────────────────────────┐ │
│  │ e2e/tests/   ← Test specs (*.spec.ts)          │ │
│  │ e2e/pages/   ← Page Object Models              │ │
│  │ e2e/fixtures/ ← Custom fixtures (auth, POMs)   │ │
│  │ e2e/helpers/  ← Test data, selectors, API utils│ │
│  └─────────────────────────────────────────────────┘ │
│                        │                              │
│                        ▼                              │
│  ┌─────────────────────────────────────────────────┐ │
│  │ http://localhost:5173 — React Frontend (Nginx)  │ │
│  └────────────────────┬────────────────────────────┘ │
│                       │ /api/*                        │
│                       ▼                               │
│  ┌─────────────────────────────────────────────────┐ │
│  │ http://localhost:3000 — BFF (Node.js/Express)   │ │
│  └──┬──────────┬──────────┬────────────────────────┘ │
│     │          │          │                           │
│     ▼          ▼          ▼                           │
│  Python     C#         Java                          │
│  :8000      :8081      :8082                         │
│  Auth/Trips AI/Parse   Geo/Search                    │
│     │          │          │                           │
│     └──────────┴──────────┘                           │
│                │                                      │
│                ▼                                      │
│  PostgreSQL :5432                                     │
└──────────────────────────────────────────────────────┘
```

### Key User Flows Under Test

| Flow | Route(s) | Backend Services | Priority |
|------|----------|-----------------|----------|
| App loads & navigates | `/`, `/explore`, `/itinerary`, `/trips`, `/start` | Frontend only | P0 |
| Explore & search POIs | `/explore` | Java (search), BFF | P0 |
| Add stops & build itinerary | `/itinerary` | Java (geocode), BFF | P0 |
| Calculate route | `/itinerary` | Java (directions), BFF | P0 |
| Vehicle spec configuration | `/itinerary` (Vehicle tab) | Python (vehicle-specs), BFF | P1 |
| Auth (login/logout) | `/itinerary` (Trips tab) | Python (auth), BFF | P0 |
| Save/Load/Delete trips | `/itinerary`, `/trips` | Python (trips), BFF | P0 |
| Community trips | `/all-trips` | Python (public-trips), BFF | P1 |
| Map markers & route line | All views | Frontend (Mapbox GL) | P1 |
| Mobile responsive | All views | Frontend only | P2 |

---

## Project Structure

```
frontend/
├── playwright.config.ts          # Playwright configuration
├── e2e/
│   ├── global-setup.ts           # Auth pre-seeding (runs once before all tests)
│   ├── global-teardown.ts        # Test data cleanup (runs once after all tests)
│   ├── .auth/                    # Git-ignored — cached storageState
│   │   └── user.json
│   ├── fixtures/
│   │   ├── auth.fixture.ts       # Authenticated context fixture
│   │   └── base.fixture.ts       # Page Object Model fixtures
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts           # Shared navigation, toast, map helpers
│   │   ├── ExplorePage.ts        # /explore — categories, search, featured
│   │   ├── ItineraryPage.ts      # /itinerary — stops, route, save, vehicle
│   │   ├── TripsPage.ts          # /trips — saved trips CRUD
│   │   ├── StartTripPage.ts      # /start — trip creation options
│   │   ├── AllTripsPage.ts       # /all-trips — community trips
│   │   └── components/
│   │       ├── Sidebar.ts        # Desktop sidebar navigation
│   │       ├── MapComponent.ts   # Map canvas, markers, route assertions
│   │       └── AuthStatus.ts     # Login state, user badge, logout
│   ├── helpers/
│   │   ├── selectors.ts          # Centralized locator constants
│   │   ├── test-data.ts          # Reusable coordinates, names, vehicle specs
│   │   └── api-helpers.ts        # Direct API calls for setup/teardown
│   └── tests/                    # Test specs organized by feature
│       ├── smoke/
│       │   └── app-loads.spec.ts          # SM-01..SM-08
│       ├── navigation/
│       │   └── sidebar-nav.spec.ts        # NAV-01..NAV-02
│       ├── explore/
│       │   ├── category-search.spec.ts    # EXP-01
│       │   └── text-search.spec.ts        # EXP-02..EXP-04
│       ├── itinerary/
│       │   ├── add-stops.spec.ts          # ITN-01..ITN-02
│       │   ├── calculate-route.spec.ts    # ITN-03..ITN-04
│       │   ├── optimize-route.spec.ts     # ITN-05
│       │   └── drag-reorder.spec.ts       # ITN-06
│       ├── vehicle/
│       │   └── vehicle-specs.spec.ts      # VEH-01..VEH-03
│       ├── auth/
│       │   ├── login-logout.spec.ts       # AUTH-01..AUTH-03
│       │   └── protected-actions.spec.ts  # AUTH-04
│       ├── trips/
│       │   ├── save-trip.spec.ts          # TRIP-01
│       │   ├── load-trip.spec.ts          # TRIP-02..TRIP-03
│       │   └── delete-trip.spec.ts        # TRIP-04..TRIP-05
│       ├── all-trips/
│       │   └── community-trips.spec.ts    # PUB-01..PUB-03
│       ├── responsive/
│       │   └── mobile-nav.spec.ts         # RSP-01..RSP-02
│       └── full-flow/
│           ├── complete-trip.spec.ts      # E2E-01
│           └── reload-trip.spec.ts        # E2E-02
```

---

## Setup Guide

### Prerequisites

1. **Node.js 18+** installed
2. **Docker Desktop** running (for the full stack)
3. **Playwright browsers** installed

### First-Time Setup

```bash
# 1. Start the Docker Compose stack
cd road_trip_app
docker-compose up --build -d

# 2. Wait for all services to be healthy
docker-compose ps   # All should show "healthy"

# 3. Install Playwright browsers
cd frontend
npx playwright install --with-deps chromium
# For all browsers: npx playwright install --with-deps

# 4. Verify frontend is accessible
curl http://localhost:5173   # Should return HTML
curl http://localhost:3000/health   # BFF health check
```

### Running Tests

```bash
cd frontend

# Run all E2E tests (Chromium only — fast iteration)
npm run test:e2e:chromium

# Run smoke tests only
npm run test:e2e:smoke

# Run all tests across all browsers
npm run test:e2e

# Interactive UI mode (pick and run tests visually)
npm run test:e2e:ui

# Run with browser visible (debugging)
npm run test:e2e:headed

# Step-through debugging
npm run test:e2e:debug

# View HTML report from last run
npm run test:e2e:report
```

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | Frontend URL |
| `PLAYWRIGHT_BFF_URL` | `http://localhost:3000` | BFF URL (for API tests) |
| `CI` | (unset) | When set, enables retries, JUnit reporter |

---

## Conventions & Best Practices

### File Naming
- Test files: `kebab-case.spec.ts` — e.g., `add-stops.spec.ts`
- Page objects: `PascalCase.ts` — e.g., `ItineraryPage.ts`
- Helpers: `kebab-case.ts` — e.g., `test-data.ts`

### Test Tags
Tags are included in `test.describe()` titles for `--grep` filtering:

| Tag | Purpose | Command |
|-----|---------|---------|
| `@smoke` | Critical path — run on every PR | `--grep @smoke` |
| `@auth` | Requires authenticated session | `--grep @auth` |
| `@regression` | Full regression suite | `--grep @regression` |
| `@slow` | Long-running tests (>15s) | `--grep @slow` |
| `@mobile` | Mobile viewport tests | `--grep @mobile` |

### Test IDs
Each test has a unique ID: `{AREA}-{NUMBER}` (e.g., `ITN-03`, `AUTH-01`).  
Use the ID in the test title: `test('ITN-03: Calculate route with 2+ stops', ...)`.

### Selector Priority (Playwright Best Practices)
1. **`getByRole()`** — `page.getByRole('button', { name: 'Calculate Route' })`
2. **`getByText()`** — `page.getByText('My Trips')`
3. **`getByPlaceholder()`** — `page.getByPlaceholder('Add a stop...')`
4. **`getByLabel()`** — for form inputs with labels
5. **`data-testid`** — fallback: `page.getByTestId('stop-list')`
6. **CSS selectors** — last resort: `page.locator('.mapboxgl-canvas')`

### Test Isolation
- Each test must be **independent** — no test should depend on the outcome of another test.
- Use `test.beforeEach()` for common setup.
- Use `uniqueTripName()` from `test-data.ts` for test trip names (avoids collisions in parallel runs).
- Clean up test data in `test.afterEach()` or rely on `global-teardown.ts`.

### Page Object Model Rules
- Page objects **return locators and data** — they do NOT make assertions.
- Assertions live in the **test spec file**.
- Page objects take a `Page` in the constructor.
- Methods return `Promise<void>` for actions, `Promise<T>` for data.
- Use `BasePage` for shared navigation/toast helpers.

### Authentication
- **Unauthenticated tests**: Use standard `test` import from `@playwright/test`.
- **Authenticated tests**: Use `test` from `fixtures/auth.fixture.ts` and the `authenticatedPage` fixture.
- The `global-setup.ts` caches auth state to `e2e/.auth/user.json` via `devLogin()`.

---

## Test Inventory

### Legend
| Priority | Meaning | SLA |
|----------|---------|-----|
| **P0** | Blocks release — must pass | Every PR |
| **P1** | Important — should pass | Nightly |
| **P2** | Nice-to-have — can defer | Weekly |
| **P3** | Future — not yet buildable | Backlog |

### Status
| Icon | Meaning |
|------|---------|
| ✅ | Implemented and passing |
| 🔨 | Implemented, needs backend |
| 📋 | Planned (spec not written) |
| 🔮 | Future (depends on feature work) |

---

### Smoke Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| SM-01 | App loads and redirects `/` → `/explore` | P0 | ✅ | 5 min |
| SM-02 | Sidebar nav items (4 links) render | P0 | ✅ | 5 min |
| SM-03 | Mapbox GL canvas renders | P0 | ✅ | 5 min |
| SM-04 | BFF `/health` returns 200 | P0 | ✅ | 5 min |
| SM-05 | No auth token by default | P0 | ✅ | 5 min |
| SM-06 | Explore view category pills render | P0 | ✅ | 5 min |
| SM-07 | Itinerary view FloatingPanel renders | P0 | ✅ | 5 min |
| SM-08 | Start Trip view options render | P0 | ✅ | 5 min |

### Navigation Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| NAV-01a | Sidebar → Explore loads view | P0 | ✅ | 5 min |
| NAV-01b | Sidebar → Itinerary loads view | P0 | ✅ | 5 min |
| NAV-01c | Sidebar → My Trips loads view | P0 | ✅ | 5 min |
| NAV-01d | Sidebar → Start Trip loads view | P0 | ✅ | 5 min |
| NAV-01e | Sequential nav through all views | P0 | ✅ | 10 min |
| NAV-02 | Browser back/forward preserves state | P1 | ✅ | 10 min |
| NAV-03 | Mobile bottom nav renders and works | P2 | 📋 | 30 min |

### Explore Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| EXP-01 | Category pill search returns results | P0 | 📋 | 30 min |
| EXP-02 | Text search returns results | P0 | 📋 | 30 min |
| EXP-03 | "Add to Trip" adds stop to Zustand store | P1 | 📋 | 45 min |
| EXP-04 | Featured trips section loads | P1 | 📋 | 20 min |
| EXP-05 | "Find Along Route" POI search (gas/food/sleep) | P2 | 📋 | 1 hr |

### Itinerary Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| ITN-01 | Add stop via geocode search | P0 | 📋 | 45 min |
| ITN-02 | Remove stop from list | P0 | 📋 | 20 min |
| ITN-03 | Calculate route with 2+ stops | P0 | 📋 | 45 min |
| ITN-04 | Route distance and duration displayed | P1 | 📋 | 20 min |
| ITN-05 | Optimize route order (3+ stops) | P1 | 📋 | 45 min |
| ITN-06 | Drag-and-drop reorder stops | P2 | 📋 | 1 hr |
| ITN-07 | Directions tab shows turn-by-turn | P1 | 📋 | 30 min |

### Vehicle Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| VEH-01 | Select vehicle type from dropdown | P1 | 📋 | 20 min |
| VEH-02 | Vehicle specs update in store | P1 | 📋 | 30 min |
| VEH-03 | AI vehicle text description input | P2 | 📋 | 45 min |

### Auth Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| AUTH-01 | Dev login flow sets token in localStorage | P0 | 📋 | 30 min |
| AUTH-02 | Logout clears session data | P0 | 📋 | 30 min |
| AUTH-03 | Auth status shows user email when logged in | P1 | 📋 | 20 min |
| AUTH-04 | Save trip action prompts login if unauthenticated | P1 | 📋 | 30 min |

### Trips CRUD Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| TRIP-01 | Save trip with name and stops | P0 | 📋 | 45 min |
| TRIP-02 | Load saved trips list | P0 | 📋 | 30 min |
| TRIP-03 | Load specific trip restores stops + route | P1 | 📋 | 45 min |
| TRIP-04 | Delete trip removes from list | P1 | 📋 | 30 min |
| TRIP-05 | Unauthenticated user sees login prompt | P1 | 📋 | 15 min |

### Community/Public Trips Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| PUB-01 | Load community trips list | P1 | 📋 | 30 min |
| PUB-02 | Filter featured trips toggle | P2 | 📋 | 20 min |
| PUB-03 | Load public trip into itinerary | P2 | 📋 | 45 min |

### Map Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| MAP-01 | Stop markers render on map after adding stops | P1 | 📋 | 45 min |
| MAP-02 | Route line renders after calculation | P1 | 📋 | 45 min |
| MAP-03 | Auto-fit bounds adjusts viewport to stops | P2 | 📋 | 30 min |
| MAP-04 | POI markers render on search results | P2 | 📋 | 30 min |

### Responsive Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| RSP-01 | Mobile bottom nav renders on small viewport | P2 | 📋 | 30 min |
| RSP-02 | FloatingPanel adapts to mobile layout | P2 | 📋 | 30 min |

### Full End-to-End Flow Tests

| ID | Test | Priority | Status | Effort |
|----|------|----------|--------|--------|
| E2E-01 | Complete: explore → add stops → vehicle → route → save | P0 | 📋 | 1.5 hr |
| E2E-02 | Reload saved trip and verify all data intact | P1 | 📋 | 1 hr |

---

## Foundation Tests (Implemented)

The following tests are implemented and ready to run:

- **`e2e/tests/smoke/app-loads.spec.ts`**: SM-01 through SM-08
- **`e2e/tests/navigation/sidebar-nav.spec.ts`**: NAV-01a through NAV-02

Run with:
```bash
cd frontend
npm run test:e2e:smoke
```

---

## Test Roadmap — CORE Prompts

> **CORE Framework**: **C**ontext → **O**bjective → **R**equest → **E**xpectation  
> Each prompt below is ready to paste into GitHub Copilot Chat to generate the test.

---

### EXP-01: Category Pill Search

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for a React road trip planner. The test project is at `frontend/e2e/`, uses Page Object Models in `e2e/pages/ExplorePage.ts`, and runs against Docker Compose at `localhost:5173`. The Explore view (`/explore`) renders 10 category pill buttons (Places to Camp, Parks & Nature, Bars & Restaurants, etc.). Clicking a pill sends `GET /api/search?query=<category>&proximity=-98.5795,39.8283` via BFF to the Java backend, which proxies to Azure Maps or Mapbox search. Results render as cards with name, address, and "Add to Trip" button. See `frontend/src/views/ExploreView.tsx` for implementation.

**Objective**: Create a Playwright test that validates the category pill search flow returns results and displays them correctly.

**Request**: Create `e2e/tests/explore/category-search.spec.ts` that:
1. Navigates to `/explore` using `ExplorePage.goto()`
2. Asserts category pills are visible using `ExplorePage.expectCategoriesVisible()`
3. Clicks the "Places to Camp" category pill
4. Waits for the `/api/search` API response
5. Asserts at least 1 search result card is visible
6. Asserts each result has a name and "Add to Trip" button
7. Tag the test with `@regression`
8. Import from `e2e/fixtures/base.fixture` to get the `explorePage` fixture

**Expectation**: Test passes with `npx playwright test category-search`, uses Page Object methods (no raw selectors in tests), waits for API responses (not arbitrary timeouts), and handles potential empty results gracefully.

</details>

---

### EXP-02: Text Search Returns Results

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for a React road trip planner (`frontend/e2e/`). The Explore view has a search input with placeholder "Search and Explore". Typing a query and pressing Enter sends `GET /api/search?query=<text>&proximity=<coords>`. The `ExplorePage` POM in `e2e/pages/ExplorePage.ts` has `textSearch(query)`, `waitForResults()`, `getResultCount()`, and `getResultName(index)` methods.

**Objective**: Create a Playwright test that validates free-text search functionality on the Explore page.

**Request**: Create `e2e/tests/explore/text-search.spec.ts` that:
1. Navigates to `/explore`
2. Uses `ExplorePage.textSearch('Grand Canyon')` to search
3. Waits for results to load via `ExplorePage.waitForResults()`
4. Asserts result count > 0
5. Asserts the first result name contains relevant text (partial match)
6. Tests clearing the search and searching again with a different term
7. Include `@regression` tag
8. Use test data from `e2e/helpers/test-data.ts` (`EXPLORE_QUERIES`)

**Expectation**: Test demonstrates searching, clearing, and re-searching. Uses POM methods exclusively. Handles network latency with proper waits.

</details>

---

### EXP-03: Add Search Result to Trip

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for a React road trip planner (`frontend/e2e/`). On the Explore view, each search result has an "Add to Trip" button. Clicking it calls `useTripStore.addStop()` which adds the location to the Zustand store's `stops` array. The UI then shows a toast "Added to trip!" and the stop appears in the Itinerary view. The `ExplorePage` POM has `addResultToTrip(index)` method. The `ItineraryPage` POM has `getStopCount()`.

**Objective**: Create a test that verifies adding a search result to the trip updates the store and is visible in the itinerary.

**Request**: Create or extend `e2e/tests/explore/text-search.spec.ts` to include a test that:
1. Searches for a location on `/explore`
2. Clicks "Add to Trip" on the first result
3. Asserts a success toast appears
4. Navigates to `/itinerary`
5. Asserts the added stop appears in the stops list (count increased by 1)
6. Tag: `@regression`

**Expectation**: Cross-view test — verifies state persistence between Explore and Itinerary views via Zustand store. Uses POM methods from both `ExplorePage` and `ItineraryPage`.

</details>

---

### EXP-04: Featured Trips Section

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The Explore view (`/explore`) has a "Featured Trips" section that loads public trips via `GET /api/public-trips?featured_only=true&limit=5` on mount. Each trip card shows an image, name, and description. The `ExplorePage` POM has `expectFeaturedTripsVisible()` and `getFeaturedTrips()` methods.

**Objective**: Test that featured trips load and display on the Explore page.

**Request**: Add a test to `e2e/tests/explore/text-search.spec.ts` (or create a new file) that:
1. Navigates to `/explore`
2. Waits for the `/api/public-trips` response
3. Asserts the "Featured Trips" heading is visible
4. Asserts at least 1 trip card is rendered (if backend has data; handle empty gracefully)
5. Tag: `@regression`

**Expectation**: Handles both populated and empty states. Waits for API, not arbitrary timeout.

</details>

---

### EXP-05: Find Along Route POI Search

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: In the Itinerary view, after calculating a route, three POI category buttons appear: Gas, Food, Sleep. Clicking one samples points every 50km along the route and makes parallel `GET /api/search` requests. Results render on the map as orange POI markers. This flow requires: (1) 2+ stops added, (2) route calculated, (3) then POI buttons become active. Uses `@turf/turf` for route sampling. The `ItineraryPage` POM has `searchPOIAlongRoute(category)`.

**Objective**: Test the "Find Along Route" POI search feature end-to-end.

**Request**: Create `e2e/tests/itinerary/along-route-poi.spec.ts` that:
1. Navigates to `/itinerary`
2. Adds 2 stops (e.g., Denver and Austin from `test-data.ts`)
3. Calculates the route
4. Clicks the "Gas" POI button via `ItineraryPage.searchPOIAlongRoute('Gas')`
5. Waits for multiple `/api/search` responses
6. Asserts POI results appear (either in a list or on the map)
7. Tags: `@regression @slow`

**Expectation**: This is a multi-step test that exercises the full flow. Use proper waits for API calls. Tag as `@slow` since it makes multiple API requests.

</details>

---

### ITN-01: Add Stop via Geocode Search

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for a React road trip planner (`frontend/e2e/`). The Itinerary view (`/itinerary`) has a stop search input with placeholder "Add a stop (City, Place)...". Typing a query and pressing Enter sends `GET /api/geocode?q=<query>` to the Java backend via BFF. Results appear as clickable items below the input. Clicking a result adds it as a stop to the Zustand store. The `ItineraryPage` POM in `e2e/pages/ItineraryPage.ts` has `addStop(query)` and `getStopCount()` methods. Use `STOP_QUERIES` from `e2e/helpers/test-data.ts`.

**Objective**: Test adding a stop to the itinerary via the geocode search flow.

**Request**: Create `e2e/tests/itinerary/add-stops.spec.ts` that:
1. Navigates to `/itinerary` using `ItineraryPage.goto()`
2. Asserts initial stop count is 0
3. Types "Denver, CO" in the stop search and waits for geocode API response
4. Clicks the first geocode result to add as stop
5. Asserts stop count is now 1
6. Asserts the stop name appears in the UI
7. Adds a second stop ("Austin, TX") and asserts count is 2
8. Tags: `@regression`

**Expectation**: Test uses `ItineraryPage.addStop()` POM method. Waits for `/api/geocode` response. Verifies both the count and the name. Test data comes from `STOP_QUERIES`.

</details>

---

### ITN-02: Remove Stop from List

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: Each stop in the itinerary list has an X button that removes it. Clicking it calls `useTripStore.removeStop(id)`. The `ItineraryPage` POM has `removeStop(index)` and `getStopCount()`.

**Objective**: Test removing a stop from the itinerary after adding it.

**Request**: Extend `e2e/tests/itinerary/add-stops.spec.ts` to include:
1. Add 2 stops, assert count is 2
2. Remove the first stop using `ItineraryPage.removeStop(0)`
3. Assert count is now 1
4. (Optional) Assert the remaining stop is the second one added

**Expectation**: Validates Zustand state update reflects in the UI after removal.

</details>

---

### ITN-03: Calculate Route with 2+ Stops

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for a React road trip planner (`frontend/e2e/`). After adding 2+ stops in the Itinerary view, the "Calculate Route" button becomes enabled. Clicking it sends `GET /api/directions?coords=lng1,lat1;lng2,lat2` to the Java backend which proxies to Mapbox Directions API. On success, the route line renders on the map and distance/duration display in the panel. The `ItineraryPage` POM has `calculateRoute()`, `getRouteDistance()`, `getRouteDuration()`.

**Objective**: Test the full route calculation flow including API interaction and UI update.

**Request**: Create `e2e/tests/itinerary/calculate-route.spec.ts` that:
1. Navigates to `/itinerary`
2. Adds 2 stops (Denver and Austin)
3. Clicks "Calculate Route" and waits for `/api/directions` response
4. Asserts route distance text is visible and contains a number + unit (e.g., "935 mi")
5. Asserts route duration text is visible (e.g., "13 hr 52 min")
6. Asserts the map canvas is still visible (route rendered)
7. Tags: `@regression`

**Expectation**: Route metrics are displayed. Distance/duration assertions use regex patterns to allow for variation. API wait is explicit.

</details>

---

### ITN-04: Route Distance and Duration Display

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: After route calculation, the FloatingPanel displays total distance in miles and duration in hours/minutes. These values come from the Mapbox Directions API response. The `ItineraryPage` POM has `getRouteDistance()` and `getRouteDuration()`.

**Objective**: Verify that route metrics are formatted correctly in the UI.

**Request**: Extend `e2e/tests/itinerary/calculate-route.spec.ts` to:
1. After route calculation, assert distance text matches pattern `/\d+(\.\d+)?\s*(mi|miles)/`
2. Assert duration text matches pattern `/\d+\s*(hr|hours).*\d+\s*(min|minutes)/`
3. Assert both values are non-zero (distance > 0)

**Expectation**: Regex-based assertions accommodate formatting variations while ensuring data is present and realistic.

</details>

---

### ITN-05: Optimize Route Order

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: With 3+ stops, the "Optimize" button activates. Clicking it sends `GET /api/optimize?coords=...` which calls the Mapbox Optimization API to reorder stops for shortest total distance. The stops list in the UI reorders accordingly. The `ItineraryPage` POM has `optimizeRoute()`.

**Objective**: Test that route optimization reorders stops.

**Request**: Create `e2e/tests/itinerary/optimize-route.spec.ts` that:
1. Adds 3 stops (Denver, Austin, Nashville) — use `STOP_QUERIES`
2. Records the initial stop order (top-to-bottom names)
3. Clicks "Optimize" and waits for `/api/optimize` response
4. Gets the new stop order
5. Asserts the order changed (or is confirmed as already optimal)
6. Tags: `@regression @slow`

**Expectation**: The test handles both cases: order changed or already optimal. Uses the POM for all interactions.

</details>

---

### ITN-06: Drag-and-Drop Reorder Stops

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The itinerary stop list uses `@dnd-kit/sortable` for drag-and-drop reordering. Each stop has a `GripVertical` icon as the drag handle. Dropping a stop at a new position calls `useTripStore.reorderStops()`. Playwright supports drag-and-drop via `locator.dragTo(target)`.

**Objective**: Test drag-and-drop reorder of itinerary stops.

**Request**: Create `e2e/tests/itinerary/drag-reorder.spec.ts` that:
1. Adds 3 stops
2. Records initial order
3. Drags the last stop to the first position using Playwright's `dragTo()`
4. Asserts the stop order has changed
5. Tags: `@regression`

**Expectation**: Uses `page.locator()` for the drag handle and `dragTo()` for the drop target. Verifies the reorder is reflected in the UI.

</details>

---

### ITN-07: Directions Tab Shows Turn-by-Turn

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: After calculating a route, switching to the "Directions" tab shows turn-by-turn navigation instructions extracted from the Mapbox Directions API response. Each instruction includes distance and a description. The `ItineraryPage` POM has `viewDirections()` and `getDirectionsStepCount()`.

**Objective**: Test that the Directions tab renders navigation instructions after route calculation.

**Request**: Add to `e2e/tests/itinerary/calculate-route.spec.ts`:
1. After route calculation, switch to Directions tab
2. Assert at least 1 direction step is visible
3. Assert steps contain distance text
4. Tags: `@regression`

**Expectation**: Validates the Directions tab content renders from route data. Does not validate instruction accuracy (that's the API's job).

</details>

---

### VEH-01: Select Vehicle Type from Dropdown

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The FloatingPanel's "Vehicle" tab has a dropdown select for predefined vehicle types (car, SUV, van, RV small/large, truck, EV). Selecting a type sends `POST /api/vehicle-specs` with `{ type: "rv_large" }` and updates the Zustand store's `vehicleSpecs`. The `ItineraryPage` POM has `selectVehicleType(type)`.

**Objective**: Test vehicle type selection via dropdown.

**Request**: Create `e2e/tests/vehicle/vehicle-specs.spec.ts` that:
1. Navigates to `/itinerary`
2. Switches to the "Vehicle" tab
3. Selects "RV (Large)" from the dropdown
4. Waits for `/api/vehicle-specs` API response
5. Asserts vehicle specs update in the UI (height, weight visible)
6. Tags: `@regression`

**Expectation**: Uses `ItineraryPage.selectVehicleType()`. Waits for API. Verifies the vehicle spec fields populate with values.

</details>

---

### VEH-02: Vehicle Specs Update in Store

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: After selecting a vehicle type or entering specs manually, the Zustand store's `vehicleSpecs` updates, which affects fuel cost calculations and clearance warnings. Vehicle specs can be read from the UI or from the store via `page.evaluate()`.

**Objective**: Verify that vehicle spec changes persist in the Zustand store.

**Request**: Extend `e2e/tests/vehicle/vehicle-specs.spec.ts`:
1. Select a vehicle type
2. Use `page.evaluate()` to read `useTripStore.getState().vehicleSpecs` from the store
3. Assert the store contains expected values (height > 0, weight > 0)
4. Change to a different vehicle type
5. Assert the store values updated

**Expectation**: Direct Zustand store assertion via `page.evaluate()`. This tests the data layer, not just the UI.

</details>

---

### VEH-03: AI Vehicle Text Description

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The Vehicle tab has a text input for AI-powered vehicle description (e.g., "2022 Ford F-150 towing a 25ft boat"). Entering text and submitting sends it to `POST /api/vehicle-specs` which may proxy to the C# backend's Azure OpenAI endpoint. The `ItineraryPage` POM has `enterVehicleDescription(description)`. Test data: `VEHICLE_AI_DESCRIPTIONS`.

**Objective**: Test the AI vehicle description input flow.

**Request**: Extend `e2e/tests/vehicle/vehicle-specs.spec.ts`:
1. Switch to Vehicle tab
2. Enter an AI description from `VEHICLE_AI_DESCRIPTIONS.TRUCK_WITH_TRAILER`
3. Wait for the API response
4. Assert that vehicle specs populated (non-default values)
5. Tags: `@regression @slow` (AI API may be slow)

**Expectation**: This test depends on the C# backend being available. Tag as `@slow`. Handle potential timeout if AI service is down.

</details>

---

### AUTH-01: Dev Login Flow

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for a React road trip planner (`frontend/e2e/`). The login flow: on the Itinerary view's "Trips" tab, there's a "Login with Google (Demo)" button. Clicking it calls `devLogin()` which sends `POST /api/auth/google` with `{ token: "MOCK_TOKEN" }`. On success, the backend returns `{ access_token, refresh_token, email }` which are stored in `localStorage`. The `ItineraryPage` POM has `clickLoginDemo()`. Use a fresh context (no stored auth).

**Objective**: Test the dev/mock login flow end-to-end.

**Request**: Create `e2e/tests/auth/login-logout.spec.ts` that:
1. Navigates to `/itinerary` with a fresh browser context (no storageState)
2. Asserts no token in localStorage initially
3. Switches to "Trips" tab
4. Clicks "Login with Google (Demo)"
5. Waits for `POST /api/auth/google` response
6. Asserts localStorage now has `token`, `refresh_token`, `user_email`
7. Tags: `@regression @auth`

**Expectation**: Uses a clean context (not the auth fixture). Validates localStorage values via `page.evaluate()`. Tests the real devLogin flow.

</details>

---

### AUTH-02: Logout Clears Session

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: After login, the AuthStatus component shows the user email and a logout button (log-out icon). Clicking logout sends `POST /api/auth/logout` and clears `localStorage` keys (`token`, `refresh_token`, `user_email`). The `AuthStatus` component POM has `logout()`.

**Objective**: Test that logout clears all auth state.

**Request**: Add to `e2e/tests/auth/login-logout.spec.ts`:
1. Start with the `authenticatedPage` fixture (pre-logged-in)
2. Navigate to any page
3. Assert initially logged in (token exists in localStorage)
4. Click the logout button via `AuthStatus.logout()`
5. Assert localStorage no longer has `token`
6. Tags: `@regression @auth`

**Expectation**: Uses the auth fixture for pre-authenticated state. Validates complete cleanup of auth data.

</details>

---

### AUTH-03: Auth Status Shows User Email

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The AuthStatus component (`components/AuthStatus.tsx`) shows a "Secure" badge and the user's email when logged in. It listens for `auth:login` custom events.

**Objective**: Verify the auth status UI displays correctly when authenticated.

**Request**: Add to `e2e/tests/auth/login-logout.spec.ts`:
1. Use `authenticatedPage` fixture
2. Navigate to `/explore`
3. Assert the "Secure" badge text is visible
4. Tags: `@regression @auth`

**Expectation**: Simple UI assertion on the auth status component.

</details>

---

### AUTH-04: Save Trip Prompts Login

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: In the Itinerary view's Trips tab, unauthenticated users see a "Login with Google (Demo)" button instead of a "Save Trip" button. Save requires auth.

**Objective**: Test that the save action requires authentication.

**Request**: Create `e2e/tests/auth/protected-actions.spec.ts` that:
1. Uses a fresh context (no auth) — do NOT use the auth fixture
2. Navigates to `/itinerary`
3. Switches to "Trips" tab
4. Asserts "Login with Google (Demo)" button is visible
5. Asserts "Save Trip" button is NOT visible (or disabled)
6. Tags: `@regression @auth`

**Expectation**: Validates the UI correctly gates auth-required actions.

</details>

---

### TRIP-01: Save Trip with Name and Stops

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing Playwright E2E tests for `frontend/e2e/`. An authenticated user can save a trip by: (1) adding stops, (2) switching to "Trips" tab, (3) entering a trip name, (4) clicking "Save Trip". This sends `POST /api/trips` with `{ name, stops, vehicle_specs }`. The `ItineraryPage` POM has `enterTripName(name)`, `saveTrip()`. Use `uniqueTripName()` from `test-data.ts` for isolation. Use the `authenticatedPage` fixture from `auth.fixture.ts`.

**Objective**: Test saving a new trip end-to-end.

**Request**: Create `e2e/tests/trips/save-trip.spec.ts` that:
1. Uses `authenticatedPage` fixture
2. Navigates to `/itinerary`
3. Adds 2 stops
4. Switches to "Trips" tab
5. Enters a unique trip name via `uniqueTripName()`
6. Clicks "Save Trip" and waits for `POST /api/trips`
7. Asserts success toast appears
8. Tags: `@regression @auth`

**Expectation**: Uses auth fixture, unique names for isolation, and proper API waits. Cleans up test data if possible.

</details>

---

### TRIP-02: Load Saved Trips List

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The Trips view (`/trips`) fetches user's saved trips via `GET /api/trips` with auth header. Trips render as cards with name, stop count, and date. The `TripsPage` POM has `goto()`, `getTripCount()`, `expectTripsLoaded()`.

**Objective**: Test loading the trips list for an authenticated user.

**Request**: Create `e2e/tests/trips/load-trip.spec.ts` that:
1. (Setup) Uses API helper to create a test trip via `POST /api/trips`
2. Uses `authenticatedPage` fixture
3. Navigates to `/trips`
4. Waits for `GET /api/trips` response
5. Asserts the trip list loads (loading spinner disappears)
6. Asserts at least 1 trip card is visible
7. Tags: `@regression @auth`

**Expectation**: Uses `ApiHelpers.createTrip()` for test data setup. Tests the data loading flow, not just static UI.

</details>

---

### TRIP-03: Load Specific Trip into Itinerary

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: On the Trips view, clicking a trip card calls `useTripStore.loadTrip(id)` → `GET /api/trips/:id`, then navigates to `/itinerary` with the trip's stops and vehicle specs loaded. The `TripsPage` POM has `selectTrip(name)`.

**Objective**: Test loading a specific trip restores its data in the itinerary.

**Request**: Extend `e2e/tests/trips/load-trip.spec.ts`:
1. Create a test trip via API (with known stops)
2. Navigate to `/trips`
3. Click the test trip card
4. Assert navigation to `/itinerary`
5. Assert the stops from the trip are loaded in the itinerary panel
6. Tags: `@regression @auth`

**Expectation**: Cross-view test validating data flows from Trips → Itinerary.

</details>

---

### TRIP-04: Delete Trip

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: On the Trips view, hovering a trip card reveals a trash icon delete button. Clicking it sends `DELETE /api/trips/:id` and removes the card from the list. The `TripsPage` POM has `deleteTrip(name)`.

**Objective**: Test deleting a trip from the list.

**Request**: Create `e2e/tests/trips/delete-trip.spec.ts` that:
1. Create a test trip via API helper
2. Navigate to `/trips`, assert trip exists
3. Delete the trip via `TripsPage.deleteTrip(name)`
4. Wait for `DELETE /api/trips/:id` response
5. Assert success toast
6. Assert the trip no longer appears in the list
7. Tags: `@regression @auth`

**Expectation**: Full CRUD validation. Uses API helper for setup and POM for UI interaction.

</details>

---

### TRIP-05: Unauthenticated User Login Prompt

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The Trips view (`/trips`) checks `localStorage.getItem('token')`. If null, it shows "Sign in to see your trips" message instead of calling the API.

**Objective**: Test the unauthenticated state of the Trips view.

**Request**: Add to `e2e/tests/trips/delete-trip.spec.ts` or create separate file:
1. Use a fresh context (no auth fixture)
2. Navigate to `/trips`
3. Assert "Sign in to see your trips" message is visible
4. Assert no trip cards are rendered
5. Assert no API call to `/api/trips` was made
6. Tags: `@regression`

**Expectation**: Simple state assertion — no network calls expected.

</details>

---

### PUB-01: Load Community Trips List

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The All Trips view (`/all-trips`) fetches public trips via `GET /api/public-trips` (no auth required). Shows trip cards with images, names, descriptions. Has filter tabs: "All Trips" / "Featured". The `AllTripsPage` POM has `goto()`, `getTripCount()`, `expectPageLoaded()`.

**Objective**: Test loading the community trips page.

**Request**: Create `e2e/tests/all-trips/community-trips.spec.ts` that:
1. Navigates to `/all-trips`
2. Asserts page heading "Community Trips" is visible
3. Asserts filter tabs (All Trips, Featured) are visible
4. Waits for `/api/public-trips` response
5. Checks if trip cards load (handles empty state gracefully)
6. Tags: `@regression`

**Expectation**: No auth required. Handles empty backend gracefully.

</details>

---

### PUB-02: Filter Featured Trips

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: The All Trips view has "All Trips" and "Featured" filter tab buttons. Clicking "Featured" refetches with `GET /api/public-trips?featured_only=true`. The `AllTripsPage` POM has `filterFeatured()`, `filterAll()`.

**Objective**: Test the featured filter toggle.

**Request**: Extend `e2e/tests/all-trips/community-trips.spec.ts`:
1. Start with All Trips view loaded
2. Click "Featured" filter
3. Wait for API with `featured_only=true`
4. Click back to "All Trips"
5. Wait for API refetch
6. Tags: `@regression`

**Expectation**: Validates that filter switching triggers API calls with correct parameters.

</details>

---

### PUB-03: Load Public Trip into Itinerary

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: Clicking a trip card on the All Trips view calls `setStops()` and `setVehicleSpecs()` on the Zustand store, then navigates to `/itinerary`. The `AllTripsPage` POM has `loadTrip(name)`.

**Objective**: Test loading a public trip into the itinerary.

**Request**: Extend `e2e/tests/all-trips/community-trips.spec.ts`:
1. Load All Trips page
2. If at least 1 trip card visible, click it
3. Assert navigation to `/itinerary`
4. Assert stops were loaded (count > 0)
5. Handle empty state (skip test gracefully if no public trips)
6. Tags: `@regression`

**Expectation**: Cross-view test. Handles empty backend with `test.skip()` annotation.

</details>

---

### MAP-01: Stop Markers Render on Map

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: When stops are added to the itinerary, the `MapComponent` renders custom markers using React Map GL's `Marker` component. Each stop gets a colored, numbered marker. The `MapComponent` POM has `getMarkerCount()` and `expectMarkersVisible(minCount)`.

**Objective**: Test that map markers appear when stops are added.

**Request**: Create `e2e/tests/map/map-markers.spec.ts` that:
1. Navigates to `/itinerary`
2. Asserts initial marker count is 0
3. Adds 2 stops
4. Asserts marker count equals 2 (uses `MapComponent.expectMarkersVisible(2)`)
5. Removes 1 stop
6. Asserts marker count is 1
7. Tags: `@regression`

**Expectation**: Validates the map reflects Zustand store changes. Uses the component POM for assertions.

</details>

---

### MAP-02: Route Line Renders After Calculation

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: After route calculation, the MapComponent renders a blue route line using Mapbox GL's Source+Layer components. The route geometry comes from `routeGeoJSON` in the Zustand store.

**Objective**: Test that a route line appears on the map after calculation.

**Request**: Extend `e2e/tests/map/map-markers.spec.ts` or add to `calculate-route.spec.ts`:
1. Add 2 stops and calculate route
2. Assert the map canvas has updated (route layer present)
3. Optionally use `page.evaluate()` to check if the Mapbox style has a route layer
4. Tags: `@regression`

**Expectation**: Map layer verification is tricky with WebGL — use heuristic checks.

</details>

---

### RSP-01: Mobile Bottom Nav Renders

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: On mobile viewports (<768px), the desktop sidebar hides and a `MobileBottomNav` renders at the bottom of the screen. Uses Tailwind responsive classes (`md:hidden` / `hidden md:flex`). Playwright supports viewport configuration per-test.

**Objective**: Test mobile bottom navigation rendering.

**Request**: Create `e2e/tests/responsive/mobile-nav.spec.ts` that:
1. Sets viewport to iPhone 13 size (390x844) via `test.use({ viewport: { width: 390, height: 844 } })`
2. Navigates to `/explore`
3. Asserts mobile bottom nav is visible
4. Asserts desktop sidebar is NOT visible
5. Clicks mobile nav items and verifies navigation works
6. Tags: `@regression @mobile`

**Expectation**: Viewport-specific test. Uses `test.use()` for viewport override.

</details>

---

### RSP-02: FloatingPanel Adapts to Mobile

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: On mobile, the FloatingPanel should take full width instead of the 420px desktop width. The panel has class `md:w-[420px]` and `w-full`.

**Objective**: Test panel layout adapts to mobile viewport.

**Request**: Extend `e2e/tests/responsive/mobile-nav.spec.ts`:
1. Set mobile viewport
2. Navigate to `/itinerary`
3. Assert FloatingPanel is visible and takes full width
4. Assert content is usable (stop search input accessible)
5. Tags: `@regression @mobile`

**Expectation**: Layout assertion via element bounding box or viewport comparison.

</details>

---

### E2E-01: Complete Trip Flow (End-to-End)

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: You are writing a comprehensive end-to-end Playwright test for a React road trip planner at `frontend/e2e/`. This test validates the complete happy path: Explore → discover a place → add to trip → configure vehicle → calculate route → save trip. Uses multiple POMs: `ExplorePage`, `ItineraryPage`, `TripsPage`. Uses the `authenticatedPage` fixture and `uniqueTripName()` for isolation. All POMs are in `e2e/pages/` and fixtures in `e2e/fixtures/`.

**Objective**: Create a single test that validates the complete trip planning workflow end-to-end.

**Request**: Create `e2e/tests/full-flow/complete-trip.spec.ts` that:
1. Uses `authenticatedPage` fixture
2. Navigates to `/explore`
3. Searches for "Grand Canyon"
4. Adds a search result to trip → assert toast "Added to trip!"
5. Navigates to `/itinerary`
6. Adds a second stop (e.g., "Denver, CO")
7. Switches to Vehicle tab → selects "SUV" vehicle type
8. Switches to Itinerary tab → clicks "Calculate Route"
9. Asserts route distance and duration displayed
10. Switches to Trips tab → enters trip name (unique) → clicks "Save Trip"
11. Asserts success toast
12. Navigates to `/trips` → asserts the saved trip appears in list
13. Tags: `@regression @slow @auth @e2e`

**Expectation**: This is the critical happy-path test. Takes 30-60 seconds. Uses multiple POMs. Unique trip name prevents collisions. Should clean up via API teardown.

</details>

---

### E2E-02: Reload Saved Trip and Verify Data

<details>
<summary>📋 CORE Prompt (click to expand)</summary>

**Context**: After saving a trip (E2E-01), the user should be able to navigate to `/trips`, click the saved trip, and have all data restored: stops, vehicle specs, and optionally the route.

**Objective**: Test data persistence by saving and reloading a trip.

**Request**: Create `e2e/tests/full-flow/reload-trip.spec.ts` that:
1. Uses API helper to create a trip with known stops and vehicle specs
2. Uses `authenticatedPage` fixture
3. Navigates to `/trips`
4. Clicks the test trip to load it
5. Asserts navigation to `/itinerary`
6. Asserts stops match the original data
7. Asserts vehicle specs are restored
8. Tags: `@regression @auth`

**Expectation**: Validates complete data round-trip: API create → UI load → verify data integrity.

</details>

---

## Appendix: Selector Strategy

### Locator Priority Matrix

| Priority | Method | When to Use | Example |
|----------|--------|-------------|---------|
| 1 | `getByRole()` | Interactive elements | `getByRole('button', { name: 'Save Trip' })` |
| 2 | `getByText()` | Static labels, headings | `getByText('My Trips')` |
| 3 | `getByPlaceholder()` | Input fields | `getByPlaceholder('Add a stop...')` |
| 4 | `getByLabel()` | Form fields with labels | `getByLabel('Height')` |
| 5 | `getByTestId()` | No accessible alternative | `getByTestId('stop-list-item')` |
| 6 | CSS selector | Mapbox GL, canvas elements | `locator('canvas.mapboxgl-canvas')` |

### Recommended `data-testid` Attributes to Add

These are components that would benefit from `data-testid` for more reliable test targeting:

| Component | Suggested `data-testid` | Location |
|-----------|------------------------|----------|
| Stop list container | `data-testid="stop-list"` | FloatingPanel.tsx |
| Individual stop item | `data-testid="stop-item-{index}"` | SortableStopItem |
| FloatingPanel tabs | `data-testid="tab-{name}"` | FloatingPanel.tsx |
| Route summary | `data-testid="route-summary"` | FloatingPanel.tsx |
| Vehicle type select | `data-testid="vehicle-type-select"` | FloatingPanel.tsx |
| Search result card | `data-testid="search-result-{index}"` | ExploreView.tsx |

> **Note**: Adding `data-testid` attributes to React components is tracked separately from this test roadmap. Tests should prefer accessible locators first.

---

## Appendix: CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start Docker Compose
        run: docker-compose up -d --build
        env:
          MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
          VITE_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}

      - name: Wait for services
        run: |
          echo "Waiting for services..."
          sleep 30
          curl --retry 10 --retry-delay 5 http://localhost:3000/health

      - name: Install Playwright
        working-directory: frontend
        run: npx playwright install --with-deps chromium

      - name: Run E2E Tests
        working-directory: frontend
        run: npx playwright test --project=chromium
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/e2e/test-results/
          retention-days: 7

      - name: Cleanup
        if: always()
        run: docker-compose down -v
```

### Key CI Considerations

| Setting | Local | CI |
|---------|-------|-----|
| Retries | 0 | 2 |
| Workers | auto (CPU cores) | 2 |
| Reporter | HTML + list | JUnit + HTML |
| Browsers | Chromium only | Chromium (expand later) |
| Traces | on-first-retry | on-first-retry |
| Screenshots | only-on-failure | only-on-failure |

---

## Cross-Reference

- **Main Roadmap**: See [ROADMAP.md](./ROADMAP.md) Phase 6 Issue #31 for unit/component test tasks
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for service topology
- **Copilot Agent**: See `.github/copilot-agents/playwright-tester.agent.md` for the Playwright testing agent mode
