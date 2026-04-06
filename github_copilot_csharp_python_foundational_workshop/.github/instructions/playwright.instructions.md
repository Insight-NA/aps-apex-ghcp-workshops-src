---
applyTo: "frontend/e2e/**/*.ts,playwright.config.ts,frontend/playwright.config.ts"
---
# Playwright E2E Testing — Road Trip Planner

Apply the [general architecture rules](../copilot-instructions.md) and [testing standards](testing.instructions.md) alongside these Playwright-specific rules.

---

## Project Structure

```
frontend/
├── playwright.config.ts          # Playwright config (baseURL, projects, retries)
└── e2e/
    ├── global-setup.ts           # Auth pre-seeding (runs once before all tests)
    ├── global-teardown.ts        # Test data cleanup (runs once after all tests)
    ├── .auth/                    # Git-ignored — cached storageState (user.json)
    ├── fixtures/
    │   ├── auth.fixture.ts       # Authenticated context — use for auth-gated tests
    │   └── base.fixture.ts       # All POMs available as Playwright fixtures
    ├── pages/                    # Page Object Models (one per route/feature)
    │   ├── BasePage.ts           # Shared: nav, toast, map helpers
    │   ├── ExplorePage.ts
    │   ├── ItineraryPage.ts
    │   ├── TripsPage.ts
    │   ├── StartTripPage.ts
    │   ├── AllTripsPage.ts
    │   └── components/
    │       ├── Sidebar.ts
    │       ├── MapComponent.ts
    │       └── AuthStatus.ts
    ├── helpers/
    │   ├── selectors.ts          # Centralized locator constants
    │   ├── test-data.ts          # Reusable coordinates, city names, TIMEOUTS, vehicle specs
    │   └── api-helpers.ts        # Direct API calls for setup/teardown
    └── tests/                    # Specs organized by feature
        ├── smoke/
        ├── navigation/
        ├── explore/
        ├── itinerary/
        ├── vehicle/
        ├── auth/
        ├── trips/
        ├── all-trips/
        ├── responsive/
        ├── mcp/
        └── full-flow/
```

---

## Fixture Import Rules

**Always** import `test` and `expect` from the fixture file, not directly from `@playwright/test`.

```ts
// ✅ Correct — POM fixtures auto-injected
import { test, expect } from '../../fixtures/base.fixture';

// ✅ Correct — auth-gated test
import { test, expect } from '../../fixtures/auth.fixture';

// ❌ Wrong — no POM fixtures available
import { test, expect } from '@playwright/test';
```

| Fixture | Use when |
|---------|----------|
| `base.fixture.ts` | Most tests — provides all POMs (`explorePage`, `itineraryPage`, etc.) |
| `auth.fixture.ts` | Tests that require a logged-in user (`authenticatedPage` fixture) |

---

## Page Object Models (POM)

### Rules
- **One POM per page/major feature** — place in `e2e/pages/`
- **All POMs extend `BasePage`** for shared helpers (nav, toast, map)
- **Declare Locators as `readonly` class members** in the constructor
- **Never use raw CSS selectors** in a POM — prefer `getByRole()` or `getByText()`
- **Wrap multi-step actions** in descriptive methods (e.g., `addStop()`, `calculateRoute()`)
- **Export only the class** — no default exports

```ts
// ✅ Correct POM pattern
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../helpers/test-data';

export class FeaturePage extends BasePage {
  readonly submitButton: Locator;
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.nameInput = page.getByPlaceholder('Enter name...');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/feature');
  }

  async fillAndSubmit(name: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await this.page.waitForURL('**/confirmation');
  }
}
```

### Registering a new POM
Add it to `e2e/fixtures/base.fixture.ts` so it is injected into every test automatically.

---

## Selector Strategy (Priority Order)

Always prefer higher-priority selectors. Only fall back when the higher priority is not possible.

| Priority | Selector | Example |
|----------|----------|---------|
| 1 | `getByRole()` | `page.getByRole('button', { name: 'Calculate Route' })` |
| 2 | `getByText()` / `getByPlaceholder()` / `getByLabel()` | `page.getByPlaceholder('Add a stop...')` |
| 3 | `data-testid` | `page.getByTestId('stop-list-item')` |
| 4 | CSS / XPath | Last resort only — document the reason |

- **Centralize selectors** in `e2e/helpers/selectors.ts` — never hardcode selector strings inline in specs
- When adding a `data-testid` attribute to a React component, **update `selectors.ts` too**
- **Never use** `:nth-child`, positional CSS, or brittle class-name fragments like `[class*="text-blue"]` in new tests

---

## Test ID Conventions

Every test must carry a **unique identifier** as the first part of its description.

| Group | Prefix | Example |
|-------|--------|---------|
| Smoke | `SM-` | `SM-01: App loads and redirects to /explore` |
| Navigation | `NAV-` | `NAV-01a: Sidebar → Explore` |
| Explore | `EXP-` | `EXP-02: Text search returns results` |
| Itinerary | `ITN-` | `ITN-01: Add stop via geocode` |
| Vehicle | `VEH-` | `VEH-01: Vehicle type selection` |
| Auth | `AUTH-` | `AUTH-01: Demo login stores token` |
| Trips CRUD | `TRIP-` | `TRIP-01: Save trip with name` |
| Public trips | `PUB-` | `PUB-01: Community trips list` |
| Map | `MAP-` | `MAP-01: Route line renders` |
| Responsive | `RSP-` | `RSP-01: Mobile bottom nav` |
| Full E2E | `E2E-` | `E2E-01: Complete road trip flow` |
| MCP tests | `MCP-` | `MCP-03: Itinerary flow` |

---

## Tagging

Tag tests with `{ tag: [...] }` on `test.describe` blocks (Playwright v1.42+ syntax). Use lowercase `@` tags.

```ts
test.describe('Itinerary — Stops, Route & Optimize', { tag: ['@itinerary', '@regression'] }, () => {
  // ...
});
```

| Tag | When to use |
|-----|------------|
| `@smoke` | P0 — must pass on every PR |
| `@regression` | Full regression suite (nightly) |
| `@auth` | Requires authenticated session |
| `@itinerary` | Itinerary / route building tests |
| `@explore` | Explore / search tests |
| `@trips` | Trips CRUD tests |
| `@vehicle` | Vehicle spec tests |
| `@map` | Map canvas / marker tests |
| `@responsive` | Mobile viewport tests |
| `@e2e` | Full user journey tests |

Run by tag: `npx playwright test --grep @smoke`

---

## Auth Strategy

### Unauthenticated tests (default)
Most tests run without auth. The app uses `devLogin()` / `MOCK_TOKEN` for the demo flow — **never use real Google OAuth tokens in tests**.

### Authenticated tests
1. `global-setup.ts` runs once before all tests and caches auth state to `e2e/.auth/user.json`.
2. Use `auth.fixture.ts` to get a pre-authenticated `authenticatedPage`.

```ts
import { test, expect } from '../../fixtures/auth.fixture';

test('TRIP-01: Save trip requires auth', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/itinerary');
  // page is already logged in via saved storageState
});
```

3. For API-level auth setup in `beforeAll` / teardown, use `ApiHelpers` from `e2e/helpers/api-helpers.ts`.

```ts
import { ApiHelpers } from '../../helpers/api-helpers';

test.beforeAll(async () => {
  const api = new ApiHelpers();
  await api.init();
  token = await api.devLogin();
});
```

---

## Test Data

- **All test data lives in `e2e/helpers/test-data.ts`** — import; never hardcode inline
- Coordinates: always `[longitude, latitude]` order (GeoJSON spec)
- Use exported constants: `COORDINATES`, `STOP_QUERIES`, `VEHICLE_SPECS`, `VEHICLE_AI_DESCRIPTIONS`, `TIMEOUTS`

```ts
import { STOP_QUERIES, VEHICLE_SPECS, TIMEOUTS } from '../../helpers/test-data';

await itineraryPage.addStop(STOP_QUERIES.ORIGIN);   // 'Denver, CO'
await page.waitForResponse('**/api/geocode', { timeout: TIMEOUTS.GEOCODE_SEARCH });
```

### TIMEOUTS constants (always use these — never raw numbers)

| Constant | Value | Use for |
|----------|-------|---------|
| `TIMEOUTS.GEOCODE_SEARCH` | 8000 ms | Geocoding API responses |
| `TIMEOUTS.ROUTE_CALCULATION` | 15000 ms | Route/directions API responses |
| `TIMEOUTS.AI_PARSE` | 20000 ms | Azure OpenAI vehicle parsing |
| `TIMEOUTS.PAGE_LOAD` | 10000 ms | Page navigation / DOM ready |
| `TIMEOUTS.TOAST` | 5000 ms | Toast notification appearance |

---

## Network Mocking

**Never** hit real external APIs in tests. Mock all third-party services via Playwright route interception.

```ts
// ✅ Mock Java geocoding endpoint (via BFF)
await page.route('**/api/geocode**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { name: 'Denver, CO', longitude: -104.9903, latitude: 39.7392 },
    ]),
  });
});

// ✅ Mock directions endpoint
await page.route('**/api/directions**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ distance: 1287, duration: 720, geometry: { type: 'LineString', coordinates: [] } }),
  });
});

// ✅ Observe (don't intercept) — assert a request was made
await page.waitForResponse(resp => resp.url().includes('/api/geocode') && resp.status() === 200);

// ❌ Never let tests call real Mapbox, Azure OpenAI, or external services
```

**External APIs that MUST be mocked:**

| Service | URL pattern |
|---------|-------------|
| Mapbox Geocoding | `**/api.mapbox.com/**` |
| Java geocode (via BFF) | `**/api/geocode**` |
| Java directions (via BFF) | `**/api/directions**` |
| Java search (via BFF) | `**/api/search**` |
| Java optimize (via BFF) | `**/api/optimize**` |
| Azure OpenAI / C# AI (via BFF) | `**/api/v1/parse-vehicle**`, `**/api/v1/generate-trip**` |
| Google OAuth | `**/accounts.google.com/**` |

**Exception**: `@smoke` smoke tests may call real BFF `/health` to verify stack health — this is intentional.

---

## Waiting for API Responses (use instead of `waitForTimeout`)

Always prefer deterministic waits over `page.waitForTimeout()`.

```ts
// ✅ Correct — wait for the network response
await page.waitForResponse(resp =>
  resp.url().includes('/api/geocode') && resp.status() === 200,
  { timeout: TIMEOUTS.GEOCODE_SEARCH }
);

// ✅ Correct — wait for URL change
await page.waitForURL('**/itinerary');

// ✅ Correct — wait for element to appear
await expect(page.getByText('Route calculated')).toBeVisible({ timeout: TIMEOUTS.ROUTE_CALCULATION });

// ❌ Avoid — arbitrary sleep
await page.waitForTimeout(2000);
```

`waitForTimeout` is only acceptable for stabilizing animation/UI transitions where no better signal exists — add a comment explaining why.

---

## Mapbox GL Map Assertions

The Mapbox canvas is a `<canvas>` element — pixel contents cannot be directly read. Use these patterns instead:

```ts
import { MapComponent } from '../../pages/components/MapComponent';

const map = new MapComponent(page);

// ✅ Assert canvas is present and loaded
await map.expectVisible();

// ✅ Check for route layer via Mapbox GL JS internals (page.evaluate)
const hasRoute = await page.evaluate(() => {
  const map = (window as any).__mapboxMap;
  return map && map.getLayer('route-line') !== undefined;
});
expect(hasRoute).toBe(true);

// ✅ Assert marker count via aria labels or test IDs on marker elements
await expect(page.getByTestId('map-marker')).toHaveCount(3);
```

---

## Running Tests

All commands from the `frontend/` directory:

```bash
# Fast iteration — Chromium only
npm run test:e2e:chromium

# Smoke suite only (P0)
npm run test:e2e:smoke

# All browsers (CI-level)
npm run test:e2e

# Interactive UI picker
npm run test:e2e:ui

# Debug with browser visible
npm run test:e2e:headed

# Step-through debugger
npm run test:e2e:debug

# View last HTML report
npm run test:e2e:report

# Run by grep tag
npx playwright test --grep @smoke

# Run a single spec
npx playwright test e2e/tests/smoke/app-loads.spec.ts --headed
```

### Prerequisites
```bash
# Stack must be running
docker-compose up --build -d
docker-compose ps   # All services must show "healthy"

# Browsers must be installed
cd frontend && npx playwright install --with-deps chromium
```

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | Frontend URL |
| `PLAYWRIGHT_BFF_URL` | `http://localhost:3000` | BFF URL (for API helpers) |
| `CI` | (unset) | When set: enables retries=2, JUnit reporter, workers=1 |
| `MOCK_TOKEN` | `devtoken` | Used by `devLogin()` to simulate Google OAuth |

Never hardcode these values in test files.

---

## CI Configuration

In `playwright.config.ts`, CI mode is controlled by `process.env.CI`:

```ts
export default defineConfig({
  forbidOnly: !!process.env.CI,   // fail if test.only left in code
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['junit', { outputFile: 'test-results/results.xml' }], ['html']] : 'html',
});
```

- **JUnit reporter** is required for Azure DevOps / GitHub Actions test result publishing
- `test.only` must never be committed — CI enforces this via `forbidOnly`

---

## Test File Template

```ts
/**
 * <TEST-ID>: <Short Description>
 *
 * <One paragraph describing what user flow is covered.>
 *
 * Tags: @<tag1> @<tag2>
 * Priority: P0|P1|P2
 * Prerequisites: Docker Compose stack running
 */

import { test, expect } from '../../fixtures/base.fixture';
import { STOP_QUERIES, TIMEOUTS } from '../../helpers/test-data';

test.describe('<Feature Group> — <Scenario>', { tag: ['@tag1', '@tag2'] }, () => {
  test.beforeEach(async ({ page }) => {
    // navigate to the correct starting point
  });

  test('<TEST-ID>: <description>', async ({ itineraryPage }) => {
    // Arrange
    await itineraryPage.goto();

    // Act
    await itineraryPage.addStop(STOP_QUERIES.ORIGIN);

    // Assert
    await expect(itineraryPage.getStopsList()).toHaveCount(1);
  });
});
```

---

## Common Pitfalls

| Pitfall | Correct approach |
|---------|-----------------|
| Importing from `@playwright/test` directly | Import from `fixtures/base.fixture` or `fixtures/auth.fixture` |
| Hardcoding `'Denver, CO'` strings inline | Use `STOP_QUERIES.ORIGIN` from `test-data.ts` |
| Using `waitForTimeout(2000)` to wait for API | Use `waitForResponse()` or `expect(...).toBeVisible({ timeout })` |
| `[class*="text-blue"]` CSS selector | `getByRole()` or `getByText()` |
| Calling real geocoding / Mapbox API | Mock via `page.route()` |
| Coordinates as `[lat, lng]` | Always `[longitude, latitude]` (GeoJSON order) |
| Calling backends directly (`:8000`, `:8081`, `:8082`) | All traffic goes through BFF at `:3000` |
| `test.only` left in committed code | CI fails — never commit `test.only` |
| Skipping `global-setup` for auth tests | Auth tests rely on cached `e2e/.auth/user.json` from global-setup |
| New POM not registered in `base.fixture.ts` | Always register new POMs in the fixture file |
