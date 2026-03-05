# Workshop 3: Advanced Playwright Testing with GitHub Copilot

**Duration**: 120 minutes  
**Format**: Live coding demonstrations  
**Audience**: QA engineers and developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Playwright basics (locators, assertions, POM pattern), Copilot explicit prompting, Road Trip Planner E2E setup complete

> **Codebase Reference**: All demos use real Playwright tests from the Road Trip Planner polyglot microservices app.  
> Test Stack: Playwright v1.57+ → React Frontend (:5173) → BFF (:3000) → Python (:8000) / C# (:8081) / Java (:8082) → PostgreSQL  
> Test Location: `frontend/e2e/` — Page Objects, fixtures, helpers, and 15 implemented tests across 2 spec files.

---

## Learning Objectives

By the end of this workshop, you will master these **8 advanced Copilot techniques** applied to Playwright E2E testing:

1. **Chain-of-Thought Prompting** — Decompose complex multi-POM test flows into logical reasoning steps
2. **Instruction Files** — Encode Playwright test standards in `.github/copilot-instructions.md`
3. **Prompt Files** — Create reusable `.prompt.md` templates for consistent test generation
4. **Copilot Code Review** — Detect flaky tests, fragile selectors, and anti-patterns
5. **Copilot Plan Mode** — Architect multi-file test suites before implementation
6. **Copilot Coding Agent** — Delegate autonomous multi-file test generation
7. **Copilot Agent HQ** — Use the Playwright Tester Agent with live-site exploration
8. **CI/CD & Test Infrastructure Generation** — Generate pipelines, sharding, and fixtures

---

## CORE Prompt Framework

All demos in this workshop use the **CORE Framework** for structuring prompts:

| Letter | Section | Purpose | Playwright Example |
|--------|---------|---------|-------------------|
| **C** | **Context** | What exists — POMs, fixtures, helpers, stack | "The test project is at `frontend/e2e/`, uses `ItineraryPage` POM, runs against Docker Compose at `localhost:5173`" |
| **O** | **Objective** | What the test validates | "Validate the route calculation flow returns distance and duration" |
| **R** | **Request** | Exact steps — POM methods, file paths, tags, API waits | "Create `calculate-route.spec.ts` that waits for `/api/directions`" |
| **E** | **Expectation** | Pass criteria, anti-patterns to avoid | "Uses POM methods, no `waitForTimeout`, handles API latency" |

> **Why CORE?** Playwright tests require precise context (which POMs exist, what APIs to intercept, which fixtures to use). Generic prompts like "write a test for the itinerary page" produce tests with fragile CSS selectors and arbitrary timeouts. CORE prompts produce tests that match the project's established patterns.

---

## Workshop Agenda

| Time | Demo | Topic | Focus Files |
|------|------|-------|-------------|
| 0-15 min | Demo 1 | Chain-of-Thought Prompting | `e2e/pages/ItineraryPage.ts`, `e2e/pages/ExplorePage.ts`, `e2e/helpers/test-data.ts` |
| 15-30 min | Demo 2 | Instruction Files | `.github/copilot-instructions.md`, `e2e/helpers/selectors.ts` |
| 30-45 min | Demo 3 | Prompt Files | `.github/prompts/playwright-e2e-test.prompt.md` (new) |
| 45-60 min | Demo 4 | Copilot Code Review | `docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts` |
| 60-75 min | Demo 5 | Copilot Plan Mode | `e2e/tests/auth/`, `e2e/fixtures/auth.fixture.ts` |
| 75-90 min | Demo 6 | Copilot Coding Agent | `e2e/tests/itinerary/` (4 new spec files) |
| 90-105 min | Demo 7 | Copilot Agent HQ | `.github/copilot-agents/playwright-tester.agent.md` |
| 105-120 min | Demo 8 | CI/CD & Test Infrastructure | `.github/workflows/e2e-tests.yml`, `e2e/fixtures/` |

---

## Pre-Workshop: Architecture Recap

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

### Key API Endpoints Under Test

| API Route | Backend | Playwright Wait Pattern |
|-----------|---------|------------------------|
| `GET /api/geocode?q=...` | Java :8082 | `waitForResponse(r => r.url().includes('/api/geocode'))` |
| `GET /api/directions?coords=...` | Java :8082 | `waitForResponse(r => r.url().includes('/api/directions'))` |
| `GET /api/search?query=...` | Java :8082 | `waitForResponse(r => r.url().includes('/api/search'))` |
| `GET /api/optimize?coords=...` | Java :8082 | `waitForResponse(r => r.url().includes('/api/optimize'))` |
| `POST /api/auth/google` | Python :8000 | `waitForResponse(r => r.url().includes('/api/auth/google'))` |
| `GET /api/trips` | Python :8000 | `waitForResponse(r => r.url().includes('/api/trips'))` |
| `POST /api/trips` | Python :8000 | `waitForResponse(r => r.url().includes('/api/trips') && r.request().method() === 'POST')` |
| `GET /api/public-trips` | Python :8000 | `waitForResponse(r => r.url().includes('/api/public-trips'))` |
| `POST /api/vehicle-specs` | Python :8000 | `waitForResponse(r => r.url().includes('/api/vehicle-specs'))` |

### Existing Test Infrastructure

| Component | File | What It Provides |
|-----------|------|------------------|
| POM fixtures | `e2e/fixtures/base.fixture.ts` | `basePage`, `explorePage`, `itineraryPage`, `tripsPage`, `startTripPage`, `allTripsPage` |
| Auth fixture | `e2e/fixtures/auth.fixture.ts` | `authenticatedPage` (pre-loaded `storageState`) |
| Selectors | `e2e/helpers/selectors.ts` | `NAV`, `EXPLORE`, `ITINERARY`, `VEHICLE`, `TRIPS`, `AUTH`, `MAP`, `COMMON` constants |
| Test data | `e2e/helpers/test-data.ts` | `COORDINATES`, `STOP_QUERIES`, `VEHICLE_SPECS`, `TIMEOUTS`, `uniqueTripName()` |
| API helpers | `e2e/helpers/api-helpers.ts` | `ApiHelpers` class: `devLogin()`, `createTrip()`, `deleteTestTrips()` |
| Global setup | `e2e/global-setup.ts` | Authenticates via `devLogin()`, caches to `e2e/.auth/user.json` |
| Global teardown | `e2e/global-teardown.ts` | Deletes `E2E_TEST_*` trips after all tests |

### Implemented Tests (15 total)

| File | Test IDs | Count |
|------|----------|-------|
| `e2e/tests/smoke/app-loads.spec.ts` | SM-01 through SM-08 | 8 |
| `e2e/tests/navigation/sidebar-nav.spec.ts` | NAV-01a through NAV-02 | 7 |

---

## Demo 1: Chain-of-Thought Prompting (15 min)

### Objective
Decompose a complex, multi-POM E2E test into logical reasoning steps that guide Copilot toward a correct, non-flaky implementation.

### Scenario
Build the `E2E-01: Complete Trip Flow` test — the most complex planned test in the roadmap. It spans 4 views (`/explore` → `/itinerary` → `/itinerary` (Vehicle/Trips tabs) → `/trips`), requires 3 different POMs, 4 API waits, auth fixtures, and test data isolation.

> **Why this test?** It exercises the full happy path: search → add to trip → configure vehicle → calculate route → save → verify in trips list. Without chain-of-thought, Copilot will produce a 50-line monolithic test with `waitForTimeout` delays and fragile selectors. With chain-of-thought, each step references specific POM methods and API endpoints.

### Live Coding Steps

**Step 1: Write chain-of-thought prompt using CORE Framework**

```
CORE PROMPT — E2E-01: Complete Trip Flow

CONTEXT:
You are writing Playwright E2E tests for a React road trip planner.
The test project is at `frontend/e2e/`, uses Page Object Models in `e2e/pages/`,
and runs against Docker Compose at `localhost:5173`. The test uses the
`authenticatedPage` fixture from `e2e/fixtures/auth.fixture.ts` for pre-logged-in
state. Test data comes from `e2e/helpers/test-data.ts` (STOP_QUERIES, EXPLORE_QUERIES,
uniqueTripName()). TIMEOUTS constants define API wait durations.

CHAIN OF THOUGHT: Plan the complete trip flow test step-by-step.

Step 1: Identify the user journey phases
  - Phase A: Explore & discover (ExplorePage) → search, add result to trip
  - Phase B: Build itinerary (ItineraryPage) → add 2nd stop, configure vehicle
  - Phase C: Calculate route (ItineraryPage) → verify distance/duration
  - Phase D: Save trip (ItineraryPage Trips tab) → unique name, POST /api/trips
  - Phase E: Verify saved (TripsPage) → trip appears in list

Step 2: Map each phase to POMs and API waits
  - Phase A: ExplorePage.textSearch() → wait /api/search → addResultToTrip()
  - Phase B: ItineraryPage.addStop() → wait /api/geocode → selectVehicleType()
  - Phase C: ItineraryPage.calculateRoute() → wait /api/directions → getRouteDistance()
  - Phase D: ItineraryPage.switchTab('Trips') → enterTripName() → saveTrip() → wait POST /api/trips
  - Phase E: TripsPage.goto() → wait GET /api/trips → assert trip card visible

Step 3: Plan test isolation and cleanup
  - Use uniqueTripName() → generates "E2E_TEST_<timestamp>" names
  - global-teardown.ts auto-deletes E2E_TEST_* trips

Step 4: Identify assertions (in spec, NOT in POMs)
  - Toast "Added to trip!" after Phase A
  - Stop count == 2 after Phase B
  - Distance matches /\d+(\.\d+)?\s*(mi|miles)/ after Phase C
  - Success toast after Phase D
  - Trip name visible on /trips after Phase E

Step 5: Identify failure modes to handle
  - API timeouts → use TIMEOUTS constants (not magic numbers)
  - Empty search results → use known-good EXPLORE_QUERIES
  - Auth expired → authenticatedPage fixture handles renewal

OBJECTIVE: Create a single test that validates the complete trip planning workflow.

REQUEST: Create `e2e/tests/full-flow/complete-trip.spec.ts` following each chain
step above. Use the POM methods identified. Import from fixtures/base.fixture and
fixtures/auth.fixture. Tag as @regression @slow @auth @e2e.

EXPECTATION: Test passes with `npx playwright test complete-trip`. Uses 3+ POMs.
No waitForTimeout calls. All API interactions use waitForResponse. Runtime < 60s.
```

**Step 2: Accept Copilot suggestions following each chain step**

```typescript
// Copilot generates based on the chain-of-thought:

import { test, expect } from '../../fixtures/auth.fixture';
import { ExplorePage } from '../../pages/ExplorePage';
import { ItineraryPage } from '../../pages/ItineraryPage';
import { TripsPage } from '../../pages/TripsPage';
import { uniqueTripName, EXPLORE_QUERIES, STOP_QUERIES } from '../../helpers/test-data';

test.describe('Complete Trip Flow @regression @slow @auth @e2e', () => {

  test('E2E-01: Explore → add stops → vehicle → route → save', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const explore = new ExplorePage(page);
    const itinerary = new ItineraryPage(page);
    const trips = new TripsPage(page);
    const tripName = uniqueTripName();

    // Phase A: Explore & discover
    await explore.goto();
    await explore.textSearch(EXPLORE_QUERIES.NATIONAL_PARK);
    await explore.waitForResults();
    const resultCount = await explore.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
    await explore.addResultToTrip(0);
    await explore.expectToast('Added to trip!');

    // Phase B: Build itinerary — add a second stop
    await itinerary.goto();
    await itinerary.addStop(STOP_QUERIES.DENVER);
    const stopCount = await itinerary.getStopCount();
    expect(stopCount).toBeGreaterThanOrEqual(2);

    // Phase B (cont): Configure vehicle
    await itinerary.selectVehicleType('suv');

    // Phase C: Calculate route
    await itinerary.calculateRoute();
    const distance = await itinerary.getRouteDistance();
    expect(distance).toMatch(/\d+(\.\d+)?\s*(mi|miles)/);
    const duration = await itinerary.getRouteDuration();
    expect(duration).toMatch(/\d+\s*(hr|min|hours|minutes)/);

    // Phase D: Save trip
    await itinerary.switchTab('Trips');
    await itinerary.enterTripName(tripName);
    await itinerary.saveTrip();

    // Phase E: Verify in trips list
    await trips.goto();
    await expect(page.getByText(tripName)).toBeVisible({ timeout: 10_000 });
  });
});
```

**Step 3: Contrast with a weak prompt — show why chain-of-thought matters**

```python
# ❌ WITHOUT chain-of-thought (vague prompt):
# "Write a full trip test for the road trip app"
#
# Copilot produces:
#   - page.goto('/') → doesn't know about /explore redirect
#   - page.fill('input', 'Denver') → fragile CSS selector
#   - page.waitForTimeout(3000) → arbitrary delay
#   - page.click('.btn-save') → CSS class that doesn't exist
#   - No auth fixture → test fails on save (requires login)
#   - No uniqueTripName() → test data collisions in parallel runs

# ✅ WITH chain-of-thought (CORE prompt):
#   - Each phase maps to a real POM: ExplorePage, ItineraryPage, TripsPage
#   - API waits are explicit: /api/search, /api/geocode, /api/directions, /api/trips
#   - Auth handled by authenticatedPage fixture
#   - Test data from test-data.ts (STOP_QUERIES, EXPLORE_QUERIES, uniqueTripName)
#   - Assertions use regex patterns for distance/duration flexibility
```

### Teaching Points

| Chain-of-Thought Element | Purpose | Playwright Example |
|-------------------------|---------|-------------------|
| **Step 1: User journey** | Map the flow before coding | 5 phases: Explore → Build → Route → Save → Verify |
| **Step 2: POM mapping** | Identify which POMs handle each phase | `ExplorePage.textSearch()`, `ItineraryPage.addStop()` |
| **Step 3: Test isolation** | Prevent data collisions | `uniqueTripName()` → `E2E_TEST_1741190400` |
| **Step 4: Assertions** | Define what to verify (in spec, not POM) | `expect(distance).toMatch(/\d+/)` in spec file |
| **Step 5: Failure modes** | Handle real-world flakiness | `TIMEOUTS` constants, known-good test data |

**When to Use**: Multi-view E2E flows, tests requiring 2+ POMs, tests with multiple API interactions  
**Avoid**: Simple smoke tests, single-view assertions  
**Pro Tip**: Include the specific POM method signatures in your chain so Copilot uses the right API (e.g., `addStop(query)` not `addStop(query, index, timeout)`)

---

## Demo 2: Instruction Files (15 min)

### Objective
Encode Playwright testing standards in `.github/copilot-instructions.md` so Copilot automatically follows them in every test it generates.

> **Key Insight**: The project already has a 471-line instruction file with architecture rules and coding standards — but no Playwright-specific section. This demo adds one, showing how instruction files prevent flaky test patterns before they're written.

### Scenario
Walk through the existing instruction file's relevant sections, then add Playwright test standards that prevent the 5 most common anti-patterns.

### Live Coding Steps

**Step 1: Show existing rules that already apply to Playwright tests**

```markdown
# Already in .github/copilot-instructions.md:

### Architecture Adherence (CRITICAL)
- **Map Library**: React Map GL (Mapbox GL JS wrapper) ONLY
  → Tests must use `.mapboxgl-canvas` for map assertions (not Leaflet or Google Maps selectors)

### No Hardcoded Strings (STRICTLY ENFORCED)
  → Tests must use TIMEOUTS from test-data.ts, not magic numbers like 5000
  → Selectors come from selectors.ts, not inline CSS classes
```

**Step 2: Add a new Playwright Testing Standards section**

```markdown
<!-- Add to .github/copilot-instructions.md under Code Standards -->

### Playwright E2E Testing Standards (STRICTLY ENFORCED)

**Test Location**: All E2E tests live in `frontend/e2e/tests/` organized by feature.
**Config**: `frontend/playwright.config.ts` — NOT the root `playwright.config.ts`.

#### Selector Priority (CRITICAL — Prevents Flaky Tests)
Always use Playwright's recommended locator hierarchy. Never use raw CSS classes.

```typescript
// ❌ WRONG — fragile CSS selector (Tailwind classes change frequently)
const input = page.locator('.flex.items-center input.border-gray-300');

// ❌ WRONG — nth-child for dynamic content
const marker = page.locator('.mapboxgl-marker:nth-child(3)');

// ✅ CORRECT — accessible locators (resilient to UI changes)
const input = page.getByPlaceholder('Add a stop (City, Place)...');
const markers = page.locator('.mapboxgl-marker');
await expect(markers).toHaveCount(2);

// Selector priority: getByRole > getByText > getByPlaceholder > getByTestId > CSS
// See e2e/helpers/selectors.ts for centralized locator constants
```

#### No Arbitrary Waits (CRITICAL — #1 Cause of Flaky Tests)

```typescript
// ❌ WRONG — arbitrary timeout (flaky in CI, slow locally)
await page.waitForTimeout(5000);

// ✅ CORRECT — wait for actual API response
await page.waitForResponse(
  (response) => response.url().includes('/api/directions'),
  { timeout: TIMEOUTS.ROUTE_CALCULATION }
);

// ✅ CORRECT — wait for DOM state change
await expect(page.getByText('Route calculated')).toBeVisible();

// Import TIMEOUTS from helpers:
import { TIMEOUTS } from '../helpers/test-data';
// Available: GEOCODE_SEARCH, ROUTE_CALCULATION, TRIP_SAVE, AUTH_FLOW, POI_SEARCH
```

#### Page Object Model Rules

```typescript
// ❌ WRONG — assertion inside POM
class ItineraryPage {
  async addStop(query: string) {
    /* ... */
    expect(count).toBe(1);  // Assertions belong in spec files!
  }
}

// ✅ CORRECT — POM returns data, spec makes assertions
class ItineraryPage {
  async addStop(query: string): Promise<void> { /* actions only */ }
  async getStopCount(): Promise<number> { /* return data */ }
}
// In spec file:
const count = await itineraryPage.getStopCount();
expect(count).toBe(1);
```

#### Test Tags and IDs

```typescript
// ❌ WRONG — no tag, no ID
test('it should add a stop', async () => { ... });

// ✅ CORRECT — test ID and tag in describe block
test.describe('Itinerary Stop Management @regression', () => {
  test('ITN-01: Add stop via geocode search', async () => { ... });
});
// Tags: @smoke, @regression, @auth, @slow, @mobile, @e2e
// IDs: SM-01, NAV-01, EXP-01, ITN-01, VEH-01, AUTH-01, TRIP-01, etc.
```

#### Required Imports Pattern

```typescript
// ❌ WRONG — importing from @playwright/test directly in POM-based tests
import { test, expect } from '@playwright/test';

// ✅ CORRECT — import from project fixtures (includes POM instantiation)
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';

// ✅ CORRECT — for authenticated tests
import { test, expect } from '../../fixtures/auth.fixture';
```

#### Test Data Isolation

```typescript
// ❌ WRONG — hardcoded trip name (collides in parallel runs)
await itinerary.enterTripName('My Road Trip');

// ✅ CORRECT — unique name from test-data.ts
import { uniqueTripName } from '../../helpers/test-data';
await itinerary.enterTripName(uniqueTripName());
// Generates: "E2E_TEST_<timestamp>" — cleaned up by global-teardown.ts
```
```

**Step 3: Demonstrate the instruction file preventing anti-patterns**

```
# In Copilot Chat, type:
@workspace Write a Playwright test that adds a stop to the itinerary
and verifies the map updates.

# WITHOUT instruction file rules → Copilot generates:
await page.locator('.stop-input').fill('Denver');
await page.waitForTimeout(3000);
const markers = page.locator('div:nth-child(2) > .marker');

# WITH instruction file rules → Copilot generates:
await itinerary.addStop(STOP_QUERIES.DENVER);
await expect(map.markers).toHaveCount(1, { timeout: TIMEOUTS.GEOCODE_SEARCH });
```

### Teaching Points

| Instruction File Rule | Anti-Pattern Prevented | Enforcement Level |
|----------------------|----------------------|-------------------|
| Selector priority | Fragile CSS selectors that break on Tailwind changes | 🔴 CRITICAL |
| No `waitForTimeout` | Tests that pass locally but flake in CI | 🔴 CRITICAL |
| Assertions in specs | POMs that are untestable and hard to reuse | 🟡 WARNING |
| Test tags & IDs | Untagged tests that can't be filtered for smoke/regression | 🟡 WARNING |
| `uniqueTripName()` | Data collisions in parallel test runs | 🟡 WARNING |
| Fixture imports | Tests that don't use POM fixtures or auth state | 🟢 SUGGESTION |

**Key Takeaway**: The instruction file is your first line of defense against flaky tests. Copilot reads it before generating every line of test code.

---

## Demo 3: Prompt Files (15 min)

### Objective
Create a reusable `.prompt.md` template for Playwright test generation using the CORE framework. Then use it to generate a real test.

> **Existing Prompt Files**: The project has 3 prompt files in `.github/prompts/` — none are Playwright-specific. We'll create the first one.

### Scenario
Examine the existing mock-external-APIs prompt file for its structure, then create a Playwright test generation prompt file with CORE sections and placeholders.

### Live Coding Steps

**Step 1: Review the existing prompt file pattern**

```markdown
<!-- Actual structure from .github/prompts/plan-mockExternalApisBackendTests.prompt.md -->

## Plan: Mock External APIs in Backend Tests (Issue #4) - Final

Mock 5 httpx-based external API endpoints using `unittest.mock.patch`,
with JSON fixtures in separate files...

### Steps
1. **Create fixture directory and JSON files**...
2. **Create backend/tests/conftest.py** with...
3. **Update backend/tests/test_main.py** with mocked tests...
4. **Remove `continue-on-error: true`** from CI workflow
5. **Verify locally** with `pytest -v`
```

> **Pattern**: Summary → Steps → Verification. Each step references real file paths and established patterns.

**Step 2: Create the Playwright test prompt file**

Create `.github/prompts/playwright-e2e-test.prompt.md`:

```markdown
# Playwright E2E Test Generator (CORE Framework)

Generate a Playwright E2E test following Road Trip Planner conventions
and the patterns established in `frontend/e2e/`.

## Architecture Context
- Tests run against Docker Compose stack (frontend :5173, BFF :3000)
- POMs in `e2e/pages/` extend `BasePage` (navigation, toast, map helpers)
- Fixtures in `e2e/fixtures/` provide instantiated POMs and auth state
- Selectors in `e2e/helpers/selectors.ts` — NEVER use inline CSS classes
- Test data in `e2e/helpers/test-data.ts` — TIMEOUTS, STOP_QUERIES, uniqueTripName()
- API helpers in `e2e/helpers/api-helpers.ts` — direct API calls for setup/teardown

## CORE Template

### Context
You are writing Playwright E2E tests for a React road trip planner.
The test project is at `frontend/e2e/`. Uses Page Object Models in
`e2e/pages/{{PageObject}}.ts`. Runs against Docker Compose at `localhost:5173`.
{{AdditionalContext}}

### Objective
{{TestObjective}}

### Request
Create `e2e/tests/{{feature}}/{{filename}}.spec.ts` that:
1. {{Step1}}
2. {{Step2}}
3. {{Step3}}
- Tags: `{{Tags}}`
- Test ID: `{{TestId}}`
- Import from: `e2e/fixtures/{{fixture}}.fixture`
- Wait for API: `{{ApiEndpoint}}`

### Expectation
- Test passes with `npx playwright test {{filename}}`
- Uses POM methods (no raw selectors in test files)
- Waits for API responses (no `page.waitForTimeout()`)
- Test data from `e2e/helpers/test-data.ts`
- Handles empty/error states gracefully

## Checklist
- [ ] Test ID in title: `test('{{TestId}}: Description', ...)`
- [ ] Tags in describe block: `test.describe('Feature @tag', ...)`
- [ ] POM imported from `e2e/fixtures/` (not instantiated manually)
- [ ] API waits use `waitForResponse()` with `TIMEOUTS` constant
- [ ] No `page.waitForTimeout()` calls
- [ ] Assertions in spec file (not in POM)
- [ ] Test data from `test-data.ts` (no hardcoded strings)
- [ ] Unique names via `uniqueTripName()` for any saved data
```

**Step 3: Use the prompt file to generate ITN-01**

```
# In Copilot Chat:
@workspace #file:.github/prompts/playwright-e2e-test.prompt.md

Fill the CORE template with:
- PageObject: ItineraryPage
- TestObjective: Test adding a stop to the itinerary via the geocode search flow
- feature: itinerary
- filename: add-stops
- Step1: Navigate to /itinerary using ItineraryPage.goto()
- Step2: Type "Denver, CO" in stop search, wait for /api/geocode
- Step3: Click first result, assert stop count is 1
- Tags: @regression
- TestId: ITN-01
- fixture: base
- ApiEndpoint: /api/geocode
- AdditionalContext: The ItineraryPage POM has addStop(query), getStopCount(),
  and removeStop(index) methods. Use STOP_QUERIES from test-data.ts.
```

**Expected output with CORE template:**

```typescript
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';
import { STOP_QUERIES, TIMEOUTS } from '../../helpers/test-data';

test.describe('Itinerary Stop Management @regression', () => {

  test('ITN-01: Add stop via geocode search', async ({ itineraryPage }) => {
    await itineraryPage.goto();

    // Assert initial state
    const initialCount = await itineraryPage.getStopCount();
    expect(initialCount).toBe(0);

    // Add first stop
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    const count = await itineraryPage.getStopCount();
    expect(count).toBe(1);

    // Add second stop
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
    const finalCount = await itineraryPage.getStopCount();
    expect(finalCount).toBe(2);
  });

  test('ITN-02: Remove stop from list', async ({ itineraryPage }) => {
    await itineraryPage.goto();
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);

    expect(await itineraryPage.getStopCount()).toBe(2);
    await itineraryPage.removeStop(0);
    expect(await itineraryPage.getStopCount()).toBe(1);
  });
});
```

### Teaching Points

| Prompt File Element | Purpose | Playwright Example |
|--------------------|---------|-------------------|
| Architecture Context | Ground Copilot in real stack | "POMs in `e2e/pages/` extend `BasePage`" |
| CORE Template | Structured prompt with placeholders | `{{PageObject}}`, `{{ApiEndpoint}}`, `{{TestId}}` |
| Checklist | Verification gates | "No `waitForTimeout()`", "Assertions in spec" |
| Placeholder values | Dynamic per-test customization | `ITN-01`, `ItineraryPage`, `/api/geocode` |
| Real file paths | Prevent Copilot from inventing locations | `e2e/fixtures/base.fixture`, `e2e/helpers/test-data.ts` |

**Benefits**:
- **Consistency**: Every generated test follows the same POM + fixture + assertion pattern
- **Onboarding**: New testers generate correct tests immediately without learning all conventions
- **Version-controlled**: Template evolves as the test infrastructure changes
- **CORE alignment**: Matches the CORE prompts in `PLAYWRIGHT_TESTING_ROADMAP.md`

---

## Demo 4: Copilot Code Review (15 min)

### Objective
Use Copilot to review Playwright tests for flaky patterns, fragile selectors, and anti-patterns. This demo uses a **real file with 5 intentional bugs** designed for this workshop.

### Scenario
Review `docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts` — a test file purposely written with the 5 most common Playwright anti-patterns. Copilot should identify all 5 without hints.

> **Why this file?** It already exists in the project with 5 documented bugs and an instructor reference with the fixed version. This is real teaching material, not a fabricated example.

### Live Coding Steps

**Step 1: Open the buggy file and invoke Copilot review using CORE**

```
CORE PROMPT — Flaky Test Code Review

CONTEXT:
You are reviewing a Playwright E2E test file at
`docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts`.
This project follows strict testing standards:
- Selectors: getByRole > getByText > getByPlaceholder > data-testid > CSS
  (see e2e/helpers/selectors.ts for centralized constants)
- No arbitrary waits: use waitForResponse() with TIMEOUTS from test-data.ts
- POMs handle interactions, specs handle assertions
- The ItineraryPage POM in e2e/pages/ItineraryPage.ts has addStop(),
  calculateRoute(), getRouteDistance() that handle API waits internally
- TIMEOUTS constants: GEOCODE_SEARCH, ROUTE_CALCULATION, TRIP_SAVE, AUTH_FLOW

OBJECTIVE:
Identify all flaky test patterns, fragile selectors, and Playwright
anti-patterns in this test file.

REQUEST:
Review the file for:
1. Fragile CSS selectors that break when Tailwind/styling changes
2. Missing API waits (assertions before data loads)
3. Hardcoded nth-child selectors for dynamic content
4. Magic timeout numbers instead of named constants
5. page.waitForTimeout() usage (arbitrary delay anti-pattern)
For each issue, provide the specific line, explain why it's flaky,
and suggest the fix using project conventions.

EXPECTATION:
All flaky patterns caught. Each fix references real project files
(selectors.ts, test-data.ts, ItineraryPage POM). No false positives.
```

**Step 2: Expected Copilot review output**

```markdown
## Code Review: demo-04-flaky.spec.ts — 5 Flaky Patterns Found

### 🔴 BUG #1 (Line 26): Fragile CSS Selector
```typescript
// ❌ Current — breaks if Tailwind classes change:
const stopInput = page.locator('.flex.items-center input.border-gray-300');

// ✅ Fix — accessible locator from selectors.ts:
const stopInput = page.getByPlaceholder('Add a stop (City, Place)...');
// Or use: ITINERARY.stopSearchInput from e2e/helpers/selectors.ts
```
**Why flaky**: Tailwind generates utility classes like `border-gray-300`. Any design
change (e.g., `border-gray-200`) breaks this selector silently.

### 🔴 BUG #2 (Line 35): Missing API Wait
```typescript
// ❌ Current — clicks result before geocode API returns:
const firstResult = page.locator('[class*="cursor-pointer"]').first();
await firstResult.click();

// ✅ Fix — wait for geocode API response:
await page.waitForResponse(
  (response) => response.url().includes('/api/geocode'),
  { timeout: TIMEOUTS.GEOCODE_SEARCH }
);
const firstResult = page.locator('[class*="cursor-pointer"]').first();
await firstResult.click();
// Or use: ItineraryPage.addStop('Denver, CO') which handles the wait internally
```
**Why flaky**: The geocode API takes 200-2000ms. Without waiting, the click targets
an element that doesn't exist yet → `TimeoutError` in CI.

### 🔴 BUG #3 (Line 49): Hardcoded nth-child
```typescript
// ❌ Current — assumes 3rd marker exists at exact DOM position:
const thirdMarker = page.locator('.mapboxgl-marker:nth-child(3)');

// ✅ Fix — count markers instead:
const markers = page.locator('.mapboxgl-marker');
await expect(markers).toHaveCount(2, { timeout: 5_000 });
// Use MAP.marker from e2e/helpers/selectors.ts
```
**Why flaky**: Mapbox renders markers asynchronously. DOM order is not guaranteed.
`nth-child(3)` may target a different element or not exist at all.

### 🟡 BUG #4 (Line 58): Magic Timeout Number
```typescript
// ❌ Current — unexplained magic number:
await calculateButton.click();
// (no explicit timeout, but the waitForTimeout below uses 5000)

// ✅ Fix — use named constant:
import { TIMEOUTS } from '../../helpers/test-data';
// TIMEOUTS.ROUTE_CALCULATION = 30_000 (route calc can be slow)
```
**Why a problem**: Magic numbers like `5000` have no semantic meaning. When route
calculation takes 8 seconds in CI, nobody knows why the timeout is 5000 or whether
it should be higher.

### 🟡 BUG #5 (Line 66): waitForTimeout Anti-Pattern
```typescript
// ❌ Current — waits 5 seconds regardless of actual API timing:
await page.waitForTimeout(5000);

// ✅ Fix — wait for the specific API response:
await page.waitForResponse(
  (response) => response.url().includes('/api/directions'),
  { timeout: TIMEOUTS.ROUTE_CALCULATION }
);
// Or use: ItineraryPage.calculateRoute() which handles this internally
```
**Why flaky**: `waitForTimeout(5000)` wastes 5s when the API returns in 500ms.
In CI with slow containers, the API may take 6s → test fails intermittently.

### Summary
| Bug | Severity | Anti-Pattern | Fix Pattern |
|-----|----------|-------------|-------------|
| #1 | 🔴 Critical | Fragile CSS selector | `getByPlaceholder()` from selectors.ts |
| #2 | 🔴 Critical | Missing API wait | `waitForResponse()` with TIMEOUTS |
| #3 | 🔴 Critical | Hardcoded nth-child | `expect(markers).toHaveCount(n)` |
| #4 | 🟡 Warning | Magic timeout | Named `TIMEOUTS` constants |
| #5 | 🟡 Warning | waitForTimeout | `waitForResponse()` for API calls |
```

**Step 3: Apply fixes with Copilot**

```
# In Copilot Chat:
@workspace Fix all 5 bugs in demo-04-flaky.spec.ts using:
- Selectors from e2e/helpers/selectors.ts
- TIMEOUTS from e2e/helpers/test-data.ts
- ItineraryPage POM methods where available
Compare your fixes with the instructor reference at the bottom of the file.
```

### Teaching Points

| Review Technique | What Copilot Detects | Real Impact |
|-----------------|---------------------|-------------|
| Selector audit | CSS classes that break on redesign | Prevents UI change → test failure cascade |
| Wait pattern analysis | Missing API waits, arbitrary delays | Eliminates 80% of CI flakiness |
| Dynamic content checks | nth-child on async-rendered content | Fixes intermittent marker/list failures |
| Constant usage | Magic numbers without semantic meaning | Makes timeouts maintainable and debuggable |
| Anti-pattern detection | `waitForTimeout` in assertions | Saves 5-30s per test in CI runtime |

**Code Review Prompt Templates for Playwright**:
```
# Flakiness audit
@workspace Review [test file] for flaky patterns: fragile selectors,
missing API waits, waitForTimeout, hardcoded nth-child

# Selector compliance
@workspace Check all locators in [test file] against e2e/helpers/selectors.ts.
Flag any raw CSS selectors that should use getByRole/getByText/getByPlaceholder.

# POM usage audit
@workspace Review [test file] for assertions inside POM classes.
Assertions must be in spec files, not POMs.

# Cross-reference with roadmap
@workspace Compare [test file] with the CORE prompt in
docs/PLAYWRIGHT_TESTING_ROADMAP.md for test ID [ID]. Flag any deviations.
```

---

## Demo 5: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect a multi-file test suite before writing any code. This demo plans the complete Auth test suite (AUTH-01 through AUTH-04).

### Scenario
The Auth test suite requires careful orchestration because different tests need different auth states: AUTH-01 needs a fresh (unauthenticated) context, AUTH-02 needs a pre-authenticated context, and AUTH-04 needs to verify UI behavior without auth. Plan Mode helps sequence these requirements before generating code.

> **Existing infrastructure used by the plan**:
> - `e2e/global-setup.ts` — Caches auth via `devLogin()` to `e2e/.auth/user.json`
> - `e2e/fixtures/auth.fixture.ts` — Provides `authenticatedPage` with pre-loaded `storageState`
> - `e2e/pages/components/AuthStatus.ts` — POM for login badge, logout button, email display
> - `e2e/helpers/api-helpers.ts` — `ApiHelpers.devLogin()` for API-based auth

### Live Coding Steps

**Step 1: Invoke Plan Mode with CORE prompts from the roadmap**

```
CORE PROMPT — Auth Test Suite Plan

CONTEXT:
You are planning the Auth test suite for a React road trip planner
(`frontend/e2e/`). The auth system uses: (1) devLogin() mock auth that
sends POST /api/auth/google with { token: "MOCK_TOKEN" }, (2) localStorage
for token storage (keys: token, refresh_token, user_email), (3) global-setup.ts
pre-authenticates and caches state to e2e/.auth/user.json, (4) auth.fixture.ts
provides `authenticatedPage` with pre-loaded storageState.

Existing POMs:
- ItineraryPage.clickLoginDemo() → clicks "Login with Google (Demo)" button
- AuthStatus.logout() → clicks logout button
- AuthStatus has: userBadge, logoutButton, secureBadge locators
- BasePage.isLoggedIn() → checks localStorage for token

Existing helpers:
- ApiHelpers.devLogin() → direct API login (no browser)
- TIMEOUTS.AUTH_FLOW = 10_000

OBJECTIVE:
Plan the complete auth test suite (4 tests across 2 spec files) with
correct fixture usage for each test's auth state requirements.

REQUEST:
Create a phased plan to implement AUTH-01 through AUTH-04:
- AUTH-01: Dev login flow (fresh context, NO auth fixture)
- AUTH-02: Logout clears session (authenticatedPage fixture)
- AUTH-03: Auth status shows email (authenticatedPage fixture)
- AUTH-04: Save trip prompts login (fresh context, NO auth fixture)

For each phase:
1. Identify fixture requirements (fresh vs authenticated)
2. Specify file location and imports
3. List POM methods to use
4. Define assertions

EXPECTATION:
Plan groups tests by fixture type to minimize context switching.
Plan identifies that AUTH-01 and AUTH-04 need fresh contexts while
AUTH-02 and AUTH-03 use authenticatedPage. Plan can be executed
step-by-step by Copilot Coding Agent.
```

**Step 2: Review generated plan**

```markdown
## Plan: Auth Test Suite (AUTH-01 through AUTH-04)

### Phase 1: Verify Auth Infrastructure (2 min)
☐ 1.1 Confirm `e2e/fixtures/auth.fixture.ts` exports `authenticatedPage`
☐ 1.2 Confirm `e2e/.auth/user.json` is populated by global-setup.ts
☐ 1.3 Confirm `ItineraryPage.clickLoginDemo()` exists and waits for token

### Phase 2: Create login-logout.spec.ts (AUTH-01, AUTH-02, AUTH-03) (15 min)
☐ 2.1 Create `e2e/tests/auth/login-logout.spec.ts`
☐ 2.2 AUTH-01 test (fresh context):
```typescript
import { test, expect } from '@playwright/test';  // NOT auth fixture

test('AUTH-01: Dev login flow sets token', async ({ page }) => {
  // Fresh context — no storageState
  await page.goto('/itinerary');
  // Verify no token initially
  const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
  expect(tokenBefore).toBeNull();

  // Click demo login
  await page.getByText('Login with Google (Demo)').click();
  await page.waitForResponse(r => r.url().includes('/api/auth/google'));

  // Verify token now exists
  const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
  expect(tokenAfter).not.toBeNull();
  const email = await page.evaluate(() => localStorage.getItem('user_email'));
  expect(email).toBeTruthy();
});
```

☐ 2.3 AUTH-02 test (authenticated context):
```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test('AUTH-02: Logout clears session', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/explore');

  // Verify initially logged in
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).not.toBeNull();

  // Click logout
  await page.locator('button:has(svg.lucide-log-out)').click();

  // Verify token cleared
  const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
  expect(tokenAfter).toBeNull();
});
```

☐ 2.4 AUTH-03 test (authenticated context):
```typescript
test('AUTH-03: Auth status shows secure badge', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto('/explore');
  await expect(page.getByText('Secure')).toBeVisible();
});
```

### Phase 3: Create protected-actions.spec.ts (AUTH-04) (10 min)
☐ 3.1 Create `e2e/tests/auth/protected-actions.spec.ts`
☐ 3.2 AUTH-04 test (fresh context):
```typescript
import { test, expect } from '@playwright/test';  // Fresh context

test('AUTH-04: Save trip prompts login', async ({ page }) => {
  await page.goto('/itinerary');
  // Switch to Trips tab
  await page.getByText('Trips', { exact: true }).first().click();
  // Login button visible (not Save Trip)
  await expect(page.getByText('Login with Google (Demo)')).toBeVisible();
});
```

### Phase 4: Verify & Run (3 min)
☐ 4.1 Run: `npx playwright test --grep @auth --project=chromium`
☐ 4.2 Verify auth tests isolated: `npx playwright test e2e/tests/auth/ -v`
☐ 4.3 Confirm no auth state leaks between tests

**Plan Review Checklist**:
✅ AUTH-01, AUTH-04 → fresh context (import from `@playwright/test`)
✅ AUTH-02, AUTH-03 → authenticated (import from `fixtures/auth.fixture`)
✅ All tests use `page.evaluate()` for localStorage assertions
✅ AUTH-01 waits for `POST /api/auth/google` response
✅ File structure: 2 files in `e2e/tests/auth/`
✅ Tags: all tests in `@regression @auth` describe blocks
```

**Step 3: Execute Phase 2 with Copilot**

```
# In Copilot Chat:
@workspace Execute Phase 2.2 of the auth test plan.
Create e2e/tests/auth/login-logout.spec.ts with AUTH-01 test.
Use the exact pattern shown in the plan. Import from @playwright/test
for fresh context. Use TIMEOUTS.AUTH_FLOW for the waitForResponse timeout.
```

### Teaching Points

| Plan Mode Element | Purpose | Auth Suite Example |
|------------------|---------|-------------------|
| Phase grouping | Verify infrastructure → Write tests → Verify | 4 phases = 30 min total |
| Fixture analysis | Different auth states per test | Fresh vs `authenticatedPage` |
| File structure | Group related tests logically | `login-logout.spec.ts` (3 tests) + `protected-actions.spec.ts` (1 test) |
| Import decisions | Fixture choice affects test behavior | `@playwright/test` = fresh, `auth.fixture` = pre-authenticated |
| Verification steps | Confirm tests run in isolation | `--grep @auth`, check no state leaks |

**When to Use Plan Mode**:
- Test suites with mixed auth requirements (some fresh, some authenticated)
- Multi-file test suites spanning several spec files
- Tests that depend on existing infrastructure (fixtures, POMs, helpers)
- Complex test data setup that needs sequencing

**When NOT to Use Plan Mode**:
- Single test additions to existing spec files
- Simple smoke tests with no state dependencies
- Tests that mirror an existing pattern 1:1

---

## Demo 6: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file test generation to Copilot's coding agent. The agent creates 4 spec files with 7 tests for the Itinerary feature area.

### Scenario
Use the coding agent to generate the complete Itinerary test suite (ITN-01 through ITN-07) — the largest planned test area with 4 spec files.

> **Real Scope Inventory** (from `PLAYWRIGHT_TESTING_ROADMAP.md`):
> | File | Tests | POMs Used | APIs |
> |------|-------|-----------|------|
> | `add-stops.spec.ts` | ITN-01, ITN-02 | ItineraryPage | `/api/geocode` |
> | `calculate-route.spec.ts` | ITN-03, ITN-04, ITN-07 | ItineraryPage | `/api/directions` |
> | `optimize-route.spec.ts` | ITN-05 | ItineraryPage | `/api/optimize` |
> | `drag-reorder.spec.ts` | ITN-06 | ItineraryPage | (none — client-side only) |

### Live Coding Steps

**Step 1: Invoke Copilot Coding Agent with precise scope and CORE structure**

```
CORE PROMPT — Itinerary Test Suite (Agent Task)

CONTEXT:
You are generating the complete Itinerary test suite for a Playwright E2E
project at `frontend/e2e/`. The ItineraryPage POM (`e2e/pages/ItineraryPage.ts`)
provides these methods:
  - goto() → navigates to /itinerary
  - addStop(query) → fills search, waits for /api/geocode, clicks first result
  - getStopCount() → returns number of stops in the list
  - removeStop(index) → clicks X button on stop at index
  - calculateRoute() → clicks Calculate Route, waits for /api/directions
  - getRouteDistance() → returns distance text (e.g., "935 mi")
  - getRouteDuration() → returns duration text (e.g., "13 hr 52 min")
  - optimizeRoute() → clicks Optimize, waits for /api/optimize
  - switchTab(name) → switches FloatingPanel tab
  - viewDirections() → switches to Directions tab
  - getDirectionsStepCount() → returns number of direction steps

Test infrastructure:
  - Fixture: import { test } from '../../fixtures/base.fixture' → provides `itineraryPage`
  - Test data: STOP_QUERIES (DENVER, AUSTIN, NASHVILLE), TIMEOUTS
  - Selectors: ITINERARY from e2e/helpers/selectors.ts

OBJECTIVE:
Generate 4 spec files containing 7 tests covering all Itinerary interactions.

REQUEST:
Create these 4 files in `e2e/tests/itinerary/`:

1. **add-stops.spec.ts** (ITN-01, ITN-02):
   - ITN-01: Add 2 stops, assert count increases from 0 → 1 → 2
   - ITN-02: Add 2 stops, remove first, assert count decreases to 1

2. **calculate-route.spec.ts** (ITN-03, ITN-04, ITN-07):
   - ITN-03: Add 2 stops, calculate route, assert distance + duration visible
   - ITN-04: Assert distance matches `/\d+(\.\d+)?\s*(mi|miles)/`,
     duration matches `/\d+\s*(hr|min|hours|minutes)/`
   - ITN-07: After route calc, switch to Directions tab, assert steps > 0

3. **optimize-route.spec.ts** (ITN-05):
   - ITN-05: Add 3 stops, record initial order, optimize, assert order changed
     (handle "already optimal" case)

4. **drag-reorder.spec.ts** (ITN-06):
   - ITN-06: Add 3 stops, drag last to first position, assert order changed

Rules:
- Import `test` from `../../fixtures/base.fixture`
- Use `itineraryPage` fixture (not manual instantiation)
- Use STOP_QUERIES and TIMEOUTS from test-data.ts
- Tag all as `@regression` in describe blocks
- ITN-05 additionally tagged `@slow`
- No page.waitForTimeout() — POM methods handle waits internally
- Assertions in spec files ONLY

EXPECTATION:
All 4 files created. Tests pass with `npx playwright test --grep "ITN-"`.
Code compiles with `npx tsc --noEmit -p tsconfig.e2e.json`. No raw CSS
selectors in test files. Zero waitForTimeout calls.
```

**Step 2: Agent executes autonomously — expected output**

```markdown
## Agent Progress Report

### File 1: e2e/tests/itinerary/add-stops.spec.ts
```typescript
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';
import { STOP_QUERIES } from '../../helpers/test-data';

test.describe('Itinerary Stop Management @regression', () => {

  test('ITN-01: Add stop via geocode search', async ({ itineraryPage }) => {
    await itineraryPage.goto();
    expect(await itineraryPage.getStopCount()).toBe(0);

    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    expect(await itineraryPage.getStopCount()).toBe(1);

    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
    expect(await itineraryPage.getStopCount()).toBe(2);
  });

  test('ITN-02: Remove stop from list', async ({ itineraryPage }) => {
    await itineraryPage.goto();
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
    expect(await itineraryPage.getStopCount()).toBe(2);

    await itineraryPage.removeStop(0);
    expect(await itineraryPage.getStopCount()).toBe(1);
  });
});
```
**Status**: ✅ 2/2 tests created

### File 2: e2e/tests/itinerary/calculate-route.spec.ts
```typescript
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';
import { STOP_QUERIES } from '../../helpers/test-data';

test.describe('Itinerary Route Calculation @regression', () => {

  test.beforeEach(async ({ itineraryPage }) => {
    await itineraryPage.goto();
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
  });

  test('ITN-03: Calculate route with 2+ stops', async ({ itineraryPage }) => {
    await itineraryPage.calculateRoute();
    const distance = await itineraryPage.getRouteDistance();
    expect(distance).toBeTruthy();
    const duration = await itineraryPage.getRouteDuration();
    expect(duration).toBeTruthy();
  });

  test('ITN-04: Route distance and duration format', async ({ itineraryPage }) => {
    await itineraryPage.calculateRoute();
    const distance = await itineraryPage.getRouteDistance();
    expect(distance).toMatch(/\d+(\.\d+)?\s*(mi|miles)/);
    const duration = await itineraryPage.getRouteDuration();
    expect(duration).toMatch(/\d+\s*(hr|min|hours|minutes)/);
  });

  test('ITN-07: Directions tab shows turn-by-turn', async ({ itineraryPage }) => {
    await itineraryPage.calculateRoute();
    await itineraryPage.viewDirections();
    const stepCount = await itineraryPage.getDirectionsStepCount();
    expect(stepCount).toBeGreaterThan(0);
  });
});
```
**Status**: ✅ 3/3 tests created

### File 3: e2e/tests/itinerary/optimize-route.spec.ts
```typescript
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';
import { STOP_QUERIES } from '../../helpers/test-data';

test.describe('Itinerary Route Optimization @regression @slow', () => {

  test('ITN-05: Optimize route reorders stops', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
    await itineraryPage.addStop(STOP_QUERIES.NASHVILLE);

    // Record initial stop order
    const initialStops = await itineraryPage.getStopsList().allTextContents();

    await itineraryPage.optimizeRoute();

    // Get new order — may be same if already optimal
    const optimizedStops = await itineraryPage.getStopsList().allTextContents();

    // The order should exist (3 stops remain regardless)
    expect(optimizedStops).toHaveLength(3);
    // Note: order may or may not change depending on geography
  });
});
```
**Status**: ✅ 1/1 test created

### File 4: e2e/tests/itinerary/drag-reorder.spec.ts
```typescript
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';
import { STOP_QUERIES } from '../../helpers/test-data';

test.describe('Itinerary Drag Reorder @regression', () => {

  test('ITN-06: Drag-and-drop reorder stops', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
    await itineraryPage.addStop(STOP_QUERIES.NASHVILLE);

    const initialStops = await itineraryPage.getStopsList().allTextContents();

    // Drag last stop to first position
    const stops = itineraryPage.getStopsList();
    const lastStop = stops.last();
    const firstStop = stops.first();
    await lastStop.dragTo(firstStop);

    const reorderedStops = await itineraryPage.getStopsList().allTextContents();
    expect(reorderedStops).not.toEqual(initialStops);
  });
});
```
**Status**: ✅ 1/1 test created

### Summary
| Metric | Value |
|--------|-------|
| Files created | 4 |
| Tests created | 7 |
| POM methods used | 10 (goto, addStop, getStopCount, removeStop, calculateRoute, getRouteDistance, getRouteDuration, optimizeRoute, viewDirections, getDirectionsStepCount) |
| waitForTimeout calls | 0 |
| Raw CSS selectors | 0 |
```

**Step 3: Verify agent work**

```bash
# Compile check
cd frontend && npx tsc --noEmit -p tsconfig.e2e.json

# Run all ITN tests
npx playwright test --grep "ITN-" --project=chromium -v

# Confirm no anti-patterns
grep -rn "waitForTimeout" e2e/tests/itinerary/
# Expected: 0 matches

grep -rn "page.locator('\." e2e/tests/itinerary/
# Expected: 0 raw CSS selectors in spec files (they're in POMs)
```

### Teaching Points

| Agent Best Practice | Itinerary Suite Example |
|--------------------|------------------------|
| **Precise scope** | 7 tests enumerated with IDs (ITN-01 through ITN-07) |
| **POM method inventory** | 10 methods listed with signatures |
| **File structure specified** | 4 files with exact names and test groupings |
| **Rules reference** | "No waitForTimeout, assertions in specs only" |
| **Verification steps** | `tsc --noEmit`, run with `--grep`, `grep` for anti-patterns |

**Agent Prompt Formula for Playwright Test Generation**:
```
1. Context: POM methods with signatures + fixture imports + test data
2. Scope: List every test ID with file location
3. Rules: Reference instruction file and POM patterns
4. Per-file: Specify tests, describe blocks, tags
5. Verification: Compile check + run command + anti-pattern grep
```

**Common Pitfall**: Saying "generate all itinerary tests" without listing POM methods. The agent invents methods like `itineraryPage.verify()` or `itineraryPage.assertStopAdded()` that don't exist. **Always list available POM methods in the prompt.**

---

## Demo 7: Copilot Agent HQ (15 min)

### Objective
Understand and use the Playwright Tester Agent — a custom agent that uses the Playwright MCP to **navigate the live site**, take DOM snapshots, identify locators, and generate tests based on the real page state.

> **This project has a real Playwright Tester Agent** at `.github/copilot-agents/playwright-tester.agent.md` with 5 core responsibilities. Unlike other Copilot features, this agent interacts with the running application.

### Scenario
Use the Playwright Tester Agent to explore the `/itinerary` page live, identify interactive elements, and generate the `EXP-05: Find Along Route POI Search` test — one of the most complex planned tests requiring route calculation as a prerequisite.

### Live Coding Steps

**Step 1: Examine the real agent file**

```markdown
<!-- Actual content from .github/copilot-agents/playwright-tester.agent.md -->
---
description: "Testing mode for Playwright tests"
name: "Playwright Tester Mode"
tools: ["changes", "codebase", "edit/editFiles", "fetch", "findTestFiles",
        "problems", "runCommands", "runTasks", "runTests", "search",
        "searchResults", "terminalLastCommand", "terminalSelection",
        "testFailure", "playwright"]
model: Claude Sonnet 4
---

## Core Responsibilities
1. **Website Exploration**: Navigate to the website, take snapshots, analyze functionalities
2. **Test Improvements**: Navigate to URL, view snapshot, identify correct locators
3. **Test Generation**: Write well-structured Playwright tests based on exploration
4. **Test Execution & Refinement**: Run tests, diagnose failures, iterate until passing
5. **Documentation**: Summarize functionalities tested and test structure
```

> **Key Insight**: The `playwright` tool in the agent's toolset enables it to:
> - Launch a browser and navigate to `http://localhost:5173`
> - Take page snapshots (accessibility tree + visual screenshot)
> - Identify real DOM elements and their accessible roles
> - Validate that selectors from `selectors.ts` actually match elements
> - Discover interactive elements that aren't in the POM yet

**Step 2: Invoke the agent with a CORE prompt for EXP-05**

```
@playwright-tester

CORE PROMPT — EXP-05: Find Along Route POI Search

CONTEXT:
The Road Trip Planner has a "Find Along Route" feature. After calculating
a route in the Itinerary view, three POI category buttons appear: Gas,
Food, Sleep. Clicking one sends parallel GET /api/search requests sampled
along the route. The app is running at http://localhost:5173.

I need you to:
1. FIRST: Navigate to http://localhost:5173/itinerary
2. Take a page snapshot to see the current state
3. Identify the POI category buttons (Gas, Food, Sleep)
4. Check if they match ITINERARY.poiGasButton from e2e/helpers/selectors.ts
5. Report what locators correctly target these buttons

OBJECTIVE:
Explore the live /itinerary page to validate POI button locators and
generate the EXP-05 test with verified selectors.

REQUEST:
After exploration, create `e2e/tests/itinerary/along-route-poi.spec.ts`:
1. Navigate to /itinerary
2. Add 2 stops (Denver, Austin) via ItineraryPage.addStop()
3. Calculate route via ItineraryPage.calculateRoute()
4. Click "Gas" POI button via ItineraryPage.searchPOIAlongRoute('Gas')
5. Wait for /api/search responses
6. Assert POI results appear
7. Tags: @regression @slow

EXPECTATION:
Locators validated against the live DOM. Test uses POM methods.
Handles the case where POI buttons only appear after route calculation.
```

**Step 3: Agent workflow — what happens behind the scenes**

```
Agent Execution Log:

1. [NAVIGATE] → http://localhost:5173/itinerary
   Status: Page loaded, FloatingPanel visible

2. [SNAPSHOT] → Accessibility tree captured
   Found: "Add a stop (City, Place)..." input (textbox role)
   Found: Tab buttons: "Itinerary", "Vehicle", "Directions", "Trips"
   NOT found: Gas/Food/Sleep buttons (hidden until route is calculated)

3. [INSIGHT] POI buttons are conditionally rendered.
   → Need to add stops and calculate route first.

4. [INTERACT] Fill "Denver, CO" in stop input → Enter
   → Wait for geocode API response
   → First result clicked → stop added

5. [INTERACT] Fill "Austin, TX" → Enter → result clicked

6. [INTERACT] Click "Calculate Route"
   → Wait for /api/directions response
   → Route rendered on map

7. [SNAPSHOT] → Updated accessibility tree
   NOW found: "Gas" button, "Food" button, "Sleep" button
   Locators confirmed:
   - page.getByText('Gas', { exact: true }) ✅ matches
   - page.getByText('Food', { exact: true }) ✅ matches
   - page.getByText('Sleep', { exact: true }) ✅ matches
   - ITINERARY.poiGasButton ('Gas') from selectors.ts ✅ confirmed

8. [GENERATE] Creating along-route-poi.spec.ts:
```

```typescript
// Agent-generated test with verified locators:
import { test } from '../../fixtures/base.fixture';
import { expect } from '@playwright/test';
import { STOP_QUERIES, TIMEOUTS } from '../../helpers/test-data';

test.describe('Find Along Route POI Search @regression @slow', () => {

  test('EXP-05: Search for gas stations along calculated route', async ({
    itineraryPage,
    page,
  }) => {
    await itineraryPage.goto();

    // Prerequisites: add stops and calculate route
    await itineraryPage.addStop(STOP_QUERIES.DENVER);
    await itineraryPage.addStop(STOP_QUERIES.AUSTIN);
    await itineraryPage.calculateRoute();

    // POI buttons should now be visible (confirmed by live snapshot)
    const gasButton = page.getByText('Gas', { exact: true });
    await expect(gasButton).toBeVisible({ timeout: 5_000 });

    // Click Gas and wait for search API responses
    await itineraryPage.searchPOIAlongRoute('Gas');

    // Assert POI results appeared
    // (Results render as cards or map markers depending on implementation)
    const searchResponses = await page.evaluate(() =>
      performance.getEntriesByType('resource')
        .filter(e => e.name.includes('/api/search'))
        .length
    );
    expect(searchResponses).toBeGreaterThan(0);
  });
});
```

**Step 4: Compare agent exploration vs manual POM writing**

```markdown
## Agent Value: Live DOM Validation

| Aspect | Manual Approach | Agent Approach |
|--------|----------------|----------------|
| Locator discovery | Read React source code, guess selectors | Snapshot live DOM, validate selectors |
| Conditional elements | Miss that POI buttons are hidden initially | Discovers they appear only after route calc |
| Selector accuracy | May use selectors that don't match | Validates every locator against real page |
| State prerequisites | Must infer from code reading | Discovers by interactive exploration |
| Accessibility roles | Check React components for ARIA | Reads accessibility tree directly |
```

### Teaching Points

| Agent HQ Concept | Playwright Tester Example |
|-----------------|--------------------------|
| **Tool permissions** | `playwright` tool enables live-site interaction |
| **Exploration first** | Agent navigates before generating code |
| **Snapshot analysis** | Accessibility tree reveals real DOM structure |
| **Locator validation** | Selectors tested against live page |
| **Conditional UI discovery** | POI buttons only visible after route calc |
| **Iterative refinement** | Agent retries if test fails |

**Agent Prompt Best Practices**:

```
# Exploration prompt (before test generation)
@playwright-tester Navigate to http://localhost:5173/[page]
Take a snapshot. List all interactive elements with their roles and names.
Compare with e2e/helpers/selectors.ts constants.

# Test generation prompt (after exploration)
@playwright-tester Based on your exploration, generate test [ID]
following the CORE prompt in PLAYWRIGHT_TESTING_ROADMAP.md.
Use POM methods from e2e/pages/[PageObject].ts.

# Debugging prompt (when tests fail)
@playwright-tester Run `npx playwright test [file] --project=chromium`.
If any test fails, navigate to the page, take a snapshot, and fix the locators.
```

**When to Use the Playwright Agent**:
- New pages with unknown interactive elements
- Validating selectors against the live DOM before writing tests
- Debugging tests that pass locally but fail in CI (DOM differences)
- Discovering conditional UI elements (like POI buttons that need prerequisites)

---

## Demo 8: CI/CD & Test Infrastructure Generation (15 min)

### Objective
Use Copilot to generate CI/CD pipelines, test sharding configuration, and advanced fixtures for the Playwright test suite.

### Scenario
The roadmap appendix has a basic GitHub Actions example. We'll use Copilot to generate an improved version with parallel sharding, artifact uploads, merge-reports, and test data fixtures.

> **Existing reference**: `PLAYWRIGHT_TESTING_ROADMAP.md` Appendix: CI/CD Integration has a starter GitHub Actions YAML. We'll enhance it significantly.

### Live Coding Steps

**Step 1: Generate an enhanced CI/CD pipeline with CORE**

```
CORE PROMPT — GitHub Actions for Playwright E2E Tests

CONTEXT:
The Road Trip Planner uses Docker Compose to run the full stack (frontend,
BFF, 3 backends, PostgreSQL). Playwright tests are in `frontend/e2e/`,
configured in `frontend/playwright.config.ts`. The config has 5 projects:
chromium, firefox, webkit, mobile-chrome, mobile-safari. CI should run only
chromium initially (expand later). The existing PLAYWRIGHT_TESTING_ROADMAP.md
has a basic CI example in the appendix.

Playwright config settings for CI (already in playwright.config.ts):
- CI retries: 2
- CI workers: 2
- Reporter: JUnit + HTML
- Traces: on-first-retry
- Screenshots: only-on-failure

Infrastructure patterns:
- Scripts must be in infrastructure/ (per copilot-instructions.md CI/CD rules)
- No inline code in GitHub Actions YAML
- Scripts must support --dry-run and be locally testable

OBJECTIVE:
Generate a production-ready GitHub Actions workflow for Playwright E2E tests
with parallel test sharding and comprehensive reporting.

REQUEST:
Create `.github/workflows/e2e-tests.yml` that:
1. Triggers on PR to main + workflow_dispatch
2. Starts Docker Compose stack with health check loop
3. Installs Playwright browsers (Chromium only)
4. Runs tests with 3-shard parallelism
5. Merges shard reports into a single HTML report
6. Uploads playwright-report as artifact (7-day retention)
7. Uploads test-results (screenshots/traces) on failure
8. Cleans up Docker Compose in always() step

EXPECTATION:
Workflow handles Docker Compose startup timing (health check before tests).
Sharding reduces wall-clock time by ~3x. Failed tests have traces/screenshots
in the uploaded artifacts. Script-based commands follow the CI/CD standards
in copilot-instructions.md.
```

**Step 2: Expected Copilot output — enhanced workflow**

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests (Playwright)

on:
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'
      - 'bff/**'
      - 'backend/**'
      - 'backend-csharp/**'
      - 'backend-java/**'
      - 'docker-compose.yml'
  workflow_dispatch:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        shard: [1/3, 2/3, 3/3]
    steps:
      - uses: actions/checkout@v4

      - name: Start Docker Compose stack
        run: ./infrastructure/start-e2e-stack.sh
        env:
          MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
          VITE_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Install Playwright (Chromium only)
        working-directory: frontend
        run: npx playwright install --with-deps chromium

      - name: Run E2E Tests (shard ${{ matrix.shard }})
        working-directory: frontend
        run: npx playwright test --project=chromium --shard=${{ matrix.shard }}
        env:
          CI: true
          PLAYWRIGHT_BASE_URL: http://localhost:5173
          PLAYWRIGHT_BFF_URL: http://localhost:3000

      - name: Upload shard report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: frontend/playwright-report/
          retention-days: 7

      - name: Upload test results (traces & screenshots)
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results-${{ strategy.job-index }}
          path: frontend/e2e/test-results/
          retention-days: 7

      - name: Cleanup Docker Compose
        if: always()
        run: docker compose down -v

  merge-reports:
    if: always()
    needs: [e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Download shard reports
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-report-*
          path: all-reports

      - name: Merge reports
        working-directory: frontend
        run: npx playwright merge-reports ../all-reports --reporter=html

      - name: Upload merged report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-merged
          path: frontend/playwright-report/
          retention-days: 30
```

**Step 3: Generate an API setup fixture**

```
CORE PROMPT — Test Data Setup Fixture

CONTEXT:
The project has `e2e/helpers/api-helpers.ts` with an `ApiHelpers` class
that provides: devLogin(), createTrip(data), deleteTrip(id),
deleteTestTrips(), getTrips(). Some tests need pre-created trips
(TRIP-02, TRIP-03, E2E-02). Currently there's no fixture that
creates test data via API before a test runs.

OBJECTIVE:
Create a Playwright fixture that sets up test data (trips) via the API
before a test and cleans up after.

REQUEST:
Create `e2e/fixtures/api-setup.fixture.ts` that:
1. Extends the base test with an `apiHelpers` fixture
2. Provides a `testTrip` fixture that creates a trip before the test
   and deletes it after
3. Uses ApiHelpers from helpers/api-helpers.ts
4. Authenticates via devLogin() in the fixture setup

EXPECTATION:
Fixture follows the same pattern as auth.fixture.ts. Can be imported
in tests that need pre-created data. Cleanup runs even if test fails.
```

**Expected output:**

```typescript
// e2e/fixtures/api-setup.fixture.ts
import { test as base } from './base.fixture';
import { ApiHelpers } from '../helpers/api-helpers';
import { uniqueTripName, STOP_QUERIES, COORDINATES } from '../helpers/test-data';

type ApiFixtures = {
  apiHelpers: ApiHelpers;
  testTrip: { id: number; name: string };
};

export const test = base.extend<ApiFixtures>({
  apiHelpers: async ({}, use) => {
    const helpers = new ApiHelpers();
    await helpers.init();
    await helpers.devLogin();
    await use(helpers);
    await helpers.dispose();
  },

  testTrip: async ({ apiHelpers }, use) => {
    const name = uniqueTripName();
    const trip = await apiHelpers.createTrip({
      name,
      stops: [
        { name: 'Denver, CO', coordinates: COORDINATES.DENVER },
        { name: 'Austin, TX', coordinates: COORDINATES.AUSTIN },
      ],
    });

    await use({ id: trip.id, name });

    // Cleanup after test (runs even on failure)
    await apiHelpers.deleteTrip(trip.id).catch(() => {});
  },
});

export { expect } from '@playwright/test';
```

**Step 4: Generate Playwright config enhancement for sharding**

```
@workspace Update frontend/playwright.config.ts to add:
1. fullyParallel: true for better CI shard distribution
2. JUnit reporter output path for CI artifact collection
3. A 'ci' project profile that only runs chromium with 2 retries
Show the diff, don't rewrite the whole file.
```

### Teaching Points

| Infrastructure Element | Purpose | Copilot Generated |
|----------------------|---------|------------------|
| 3-shard parallelism | Reduce CI wall-clock by ~3x | `matrix: shard: [1/3, 2/3, 3/3]` |
| Merge reports | Single HTML report from shards | `npx playwright merge-reports` |
| Trace on failure | Debug flaky tests in CI | `testResults` artifact upload |
| API setup fixture | Pre-create test data via API | `api-setup.fixture.ts` with cleanup |
| Health check | Wait for Docker stack readiness | `./infrastructure/start-e2e-stack.sh` |
| Path-scoped triggers | Only run E2E on relevant changes | `paths: ['frontend/**', 'backend/**']` |

**CI/CD Prompt Templates**:
```
# Pipeline generation
@workspace Generate a GitHub Actions workflow for Playwright E2E tests
with Docker Compose, sharding, and artifact uploads. Follow CI/CD
standards from .github/copilot-instructions.md.

# Infrastructure scripts
@workspace Create infrastructure/start-e2e-stack.sh that starts
Docker Compose, waits for health checks, and prints service status.
Must support --dry-run and be idempotent.

# Test fixtures
@workspace Create a Playwright fixture in e2e/fixtures/ that provides
[resource] for tests, with automatic cleanup in the teardown.
Use the same pattern as auth.fixture.ts.
```

---

## CORE Framework: Complete Reference

### Anatomy of a CORE Prompt for Playwright

```
CORE PROMPT — [Test ID]: [Test Name]

CONTEXT:
• Project: frontend/e2e/ — Playwright v1.57+ with TypeScript
• Target: Docker Compose at localhost:5173 → BFF :3000 → backends
• POM: e2e/pages/[PageObject].ts — list specific methods available
• Fixtures: base.fixture (POMs) or auth.fixture (authenticated)
• Selectors: e2e/helpers/selectors.ts — [SECTION] constants
• Test data: e2e/helpers/test-data.ts — STOP_QUERIES, TIMEOUTS, etc.
• Auth: global-setup.ts caches to e2e/.auth/user.json via devLogin()
[Any additional context specific to this test]

OBJECTIVE:
[One sentence: what user flow or behavior this test validates]

REQUEST:
Create `e2e/tests/[feature]/[filename].spec.ts` that:
1. [Exact step with POM method reference]
2. [Exact step with API wait: waitForResponse(r => r.url().includes('[endpoint]'))]
3. [Exact step with assertion]
...
- Tags: @[tag1] @[tag2]
- Test ID: [AREA]-[NUMBER]
- Import from: e2e/fixtures/[fixture].fixture
- Wait for API: [endpoint(s)]

EXPECTATION:
• Test passes: npx playwright test [filename] --project=chromium
• Uses POM methods (no raw selectors)
• Waits for API responses (no waitForTimeout)
• Test data from test-data.ts
• [Additional pass criteria]
```

### Three CORE Prompt Examples (Increasing Complexity)

#### Example 1: Simple Smoke Test ← Based on existing SM-06

```
CORE PROMPT — SM-06: Explore Category Pills

CONTEXT:
Playwright E2E tests in frontend/e2e/. The Explore view (/explore) renders
10 category pill buttons. No POM needed — direct locator assertions.

OBJECTIVE:
Verify category pill buttons render on the Explore page.

REQUEST:
In e2e/tests/smoke/app-loads.spec.ts, test SM-06:
1. Navigate to /explore
2. Assert "Places to Camp" text is visible
3. Assert "Parks & Nature" text is visible
- Tags: @smoke
- Import: @playwright/test (no fixture needed)

EXPECTATION:
Simple visibility assertions. No API waits needed. Under 2 seconds.
```

#### Example 2: API-Dependent Test ← Based on ITN-03 from roadmap

```
CORE PROMPT — ITN-03: Calculate Route

CONTEXT:
Playwright E2E in frontend/e2e/. ItineraryPage POM provides: goto(),
addStop(query), calculateRoute() (waits for /api/directions internally),
getRouteDistance(), getRouteDuration(). Test data: STOP_QUERIES from
test-data.ts.

OBJECTIVE:
Test route calculation returns distance and duration after adding 2+ stops.

REQUEST:
Create e2e/tests/itinerary/calculate-route.spec.ts:
1. Navigate to /itinerary via itineraryPage.goto()
2. Add 2 stops: STOP_QUERIES.DENVER, STOP_QUERIES.AUSTIN
3. Call itineraryPage.calculateRoute() (handles /api/directions wait)
4. Assert getRouteDistance() returns text matching /\d+(\.\d+)?\s*(mi|miles)/
5. Assert getRouteDuration() returns text matching /\d+\s*(hr|min)/
- Tags: @regression
- Import: fixtures/base.fixture (itineraryPage fixture)

EXPECTATION:
POM handles API wait. Assertions use regex for format flexibility.
No waitForTimeout. Test runs in < 15 seconds.
```

#### Example 3: Cross-View Flow ← Based on E2E-01 from roadmap

```
CORE PROMPT — E2E-01: Complete Trip Flow

CONTEXT:
Playwright E2E in frontend/e2e/. Uses 3 POMs: ExplorePage (textSearch,
addResultToTrip), ItineraryPage (addStop, selectVehicleType, calculateRoute,
switchTab, enterTripName, saveTrip), TripsPage (goto). Auth: authenticatedPage
from auth.fixture.ts. Test data: EXPLORE_QUERIES, STOP_QUERIES, uniqueTripName().

OBJECTIVE:
Validate the complete trip planning workflow: explore → add stops →
vehicle → route → save → verify in trip list.

REQUEST:
Create e2e/tests/full-flow/complete-trip.spec.ts:
1. Use authenticatedPage fixture
2. Navigate to /explore → search → add result to trip → expect toast
3. Navigate to /itinerary → add 2nd stop → select vehicle → calculate route
4. Assert distance and duration displayed
5. Switch to Trips tab → enter uniqueTripName() → save trip
6. Navigate to /trips → assert saved trip name visible
- Tags: @regression @slow @auth @e2e
- Import: fixtures/auth.fixture
- API waits: /api/search, /api/geocode, /api/directions, POST /api/trips

EXPECTATION:
Multi-POM test. All API waits explicit. Uses uniqueTripName() for isolation.
global-teardown.ts cleans up E2E_TEST_* trips. Runtime < 60 seconds.
```

---

## Summary: 8 Techniques Applied to Playwright Testing

| # | Technique | Playwright Application | Key Benefit |
|---|-----------|----------------------|-------------|
| 1 | **Chain-of-Thought** | Break E2E flows into phases: user journey → POM mapping → API waits → assertions → failure modes | Prevents 50-line monolithic tests with arbitrary delays |
| 2 | **Instruction Files** | Encode selector priority, no-waitForTimeout rule, POM assertion rule, TIMEOUTS usage | Every Copilot-generated test follows project conventions |
| 3 | **Prompt Files** | CORE template with `{{PageObject}}`, `{{ApiEndpoint}}`, `{{TestId}}` placeholders | Consistent test structure across all team members |
| 4 | **Code Review** | Detect 5 flakiness patterns: CSS selectors, missing waits, nth-child, magic numbers, waitForTimeout | Catches anti-patterns before they reach CI |
| 5 | **Plan Mode** | Architect test suites with fixture analysis (fresh vs authenticated) | Correct auth state for each test before coding |
| 6 | **Coding Agent** | Generate 4 files / 7 tests autonomously with POM methods and proper imports | 10x faster than manual test writing |
| 7 | **Agent HQ** | Live-site exploration to discover conditional UI and validate selectors | Locators verified against real DOM |
| 8 | **CI/CD Generation** | Sharded pipelines, merge-reports, API setup fixtures | Production-ready test infrastructure |

---

## Appendix: Quick Reference

### Running Tests

```bash
cd frontend

npm run test:e2e              # All tests, all browsers
npm run test:e2e:chromium     # Chromium only (fast iteration)
npm run test:e2e:smoke        # Smoke tests only (@smoke tag)
npm run test:e2e:ui           # Interactive UI mode
npm run test:e2e:headed       # See the browser
npm run test:e2e:debug        # Step-through debugger
npm run test:e2e:report       # View HTML report
```

### Test Tags Reference

| Tag | Filter Command | When to Run |
|-----|---------------|-------------|
| `@smoke` | `--grep @smoke` | Every PR |
| `@regression` | `--grep @regression` | Nightly |
| `@auth` | `--grep @auth` | When auth changes |
| `@slow` | `--grep-invert @slow` | Exclude from fast feedback |
| `@mobile` | `--grep @mobile` | When UI layout changes |
| `@e2e` | `--grep @e2e` | Full flow validation |

### Selector Priority Checklist

| Priority | Locator | Example |
|----------|---------|---------|
| 1 | `getByRole()` | `page.getByRole('button', { name: 'Calculate Route' })` |
| 2 | `getByText()` | `page.getByText('My Trips')` |
| 3 | `getByPlaceholder()` | `page.getByPlaceholder('Add a stop...')` |
| 4 | `getByLabel()` | `page.getByLabel('Height')` |
| 5 | `getByTestId()` | `page.getByTestId('stop-list')` |
| 6 | CSS selector | `page.locator('canvas.mapboxgl-canvas')` (last resort) |

### POM Methods Quick Reference

| POM | Key Methods |
|-----|-------------|
| `BasePage` | `navigateTo()`, `expectToast()`, `waitForNetworkIdle()`, `isLoggedIn()` |
| `ExplorePage` | `goto()`, `textSearch()`, `waitForResults()`, `addResultToTrip()`, `expectCategoriesVisible()` |
| `ItineraryPage` | `goto()`, `addStop()`, `calculateRoute()`, `optimizeRoute()`, `saveTrip()`, `selectVehicleType()` |
| `TripsPage` | `goto()`, `getTripCount()`, `selectTrip()`, `deleteTrip()` |
| `AllTripsPage` | `goto()`, `filterFeatured()`, `loadTrip()` |
| `Sidebar` | `expectAllLinksVisible()`, `clickLink()` |
| `MapComponent` | `expectVisible()`, `getMarkerCount()`, `hasRouteLine()` |
| `AuthStatus` | `logout()`, `getUserEmail()` |

### TIMEOUTS Constants (from test-data.ts)

| Constant | Value | Used For |
|----------|-------|----------|
| `GEOCODE_SEARCH` | 15,000ms | `/api/geocode` response wait |
| `ROUTE_CALCULATION` | 30,000ms | `/api/directions` response wait |
| `TRIP_SAVE` | 10,000ms | `POST /api/trips` response wait |
| `AUTH_FLOW` | 10,000ms | Login/logout completion |
| `POI_SEARCH` | 20,000ms | `/api/search` along-route response |

---

## Cross-References

- **Playwright Testing Roadmap**: See [PLAYWRIGHT_TESTING_ROADMAP.md](../../../docs/PLAYWRIGHT_TESTING_ROADMAP.md) for the full test inventory (50+ planned tests) and all 17 CORE prompts
- **Workshop Setup**: See [00-setup-instructions.md](./setup/00-setup-instructions.md) for Docker Compose setup and Playwright browser installation
- **Flaky Test Demo**: See [demo-04-flaky.spec.ts](./setup/demo-templates/demo-04-flaky.spec.ts) for the 5-bug exercise file (Demo 4)
- **Playwright Tester Agent**: See [playwright-tester.agent.md](../../../.github/copilot-agents/playwright-tester.agent.md) for agent configuration
- **Web Dev Advanced Workshop**: See [03-advanced-web-dev.md](../web-dev/03-advanced-web-dev.md) for the parallel workshop on web development techniques
- **Instruction File**: See [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) for project-wide Copilot rules
- **Existing Prompt Files**: See [.github/prompts/](../../../.github/prompts/) for 3 existing prompt template examples
