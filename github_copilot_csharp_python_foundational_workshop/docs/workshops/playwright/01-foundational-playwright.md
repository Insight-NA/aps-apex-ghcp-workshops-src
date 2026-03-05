# Workshop 1: Foundational Playwright Testing with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations with hands-on exercises  
**Audience**: QA engineers, SDETs, and developers new to GitHub Copilot who work with Playwright  
**Prerequisites**: Completed `setup/00-setup-instructions.md`, Copilot activated in VS Code, Docker Compose stack running  
**Project**: Road Trip Planner — React + TypeScript frontend with Playwright E2E test suite

---

## Learning Objectives

By the end of this workshop, you will:

1. **Write CORE prompts** to generate Playwright test specs with consistent, high-quality output
2. **Build Page Object Models** using Copilot inline suggestions that follow existing project patterns
3. **Create custom test fixtures** using Copilot Chat with `#file:` context references
4. **Debug flaky locators** by describing symptoms in Chat and applying Copilot's fix suggestions
5. **Write API-level tests** using Playwright's `request` context without a browser
6. **Generate structured CORE prompts** for new test specifications across your team

---

## The CORE Prompting Framework for Playwright

All prompts in this workshop follow the **CORE** framework — a structured 4-element approach adapted for test automation. This variant is optimized for writing test specifications:

| Letter | Element | Description | Playwright Example |
|--------|---------|-------------|--------------------|
| **C** | **Context** | Test project location, POM files, infrastructure, view under test | "Playwright E2E tests at `frontend/e2e/`, using `ExplorePage` POM, running against Docker Compose at `localhost:5173`" |
| **O** | **Objective** | What test scenario to validate | "Validate that the category pill search returns results and displays them" |
| **R** | **Request** | Specific steps — file name, POM methods, assertions, tags, fixtures | "Create `explore/category-search.spec.ts`, use `explorePage` fixture, assert result count > 0, tag with `@regression`" |
| **E** | **Expectation** | Pass criteria, performance expectations, artifact requirements | "Test passes with `npx playwright test category-search`, uses POM methods (no raw selectors), waits for API responses" |

### CORE for Testing vs CORE for Development

The web development workshops use **Context / Objective / Requirements / Examples**. The Playwright variant replaces the last two elements to better fit test specifications:

| Element | Web Dev (Requirements) | Playwright (Request) |
|---------|----------------------|---------------------|
| **R** | Architecture constraints, type rules, styling | Specific test steps, file paths, methods to use, tags |
| **E** | Existing code patterns to follow | Pass/fail criteria, performance, what "done" looks like |

> **Why the change?** Test specs need concrete steps and acceptance criteria. "Requirements" is too abstract for describing test flows, and "Examples" matters less when you have Page Object Models encapsulating patterns.

### How to Write CORE Prompts for Playwright

**Style 1: Copilot Chat Prompt** (primary method for test generation)
```
Context: Playwright E2E tests for the Road Trip Planner, located at frontend/e2e/.
         Tests run against Docker Compose stack (frontend :5173, BFF :3000).
         Page Objects are at e2e/pages/ExplorePage.ts, ItineraryPage.ts, etc.
         Each POM extends BasePage which provides nav, toast, and map helpers.

Objective: Create a test that validates the Explore view's category pill search
           returns results and displays them with name and "Add to Trip" button.

Request: Create e2e/tests/explore/category-search.spec.ts that:
         1. Navigates to /explore using explorePage.goto()
         2. Asserts category pills are visible
         3. Clicks "Places to Camp" pill
         4. Waits for /api/search response
         5. Asserts at least 1 result card is visible
         6. Tag with @regression

Expectation: Test passes with npx playwright test category-search --project=chromium.
             Uses POM methods exclusively (no raw selectors in the test file).
             Handles network latency with waitForResponse, not waitForTimeout.
```

**Style 2: Comment Block** (above test functions for inline suggestions)
```typescript
// Context: Playwright smoke test for the /all-trips community trips page.
//          Extends SM-01..SM-08 in app-loads.spec.ts.
// Objective: Verify the All Trips page loads and shows community trips heading.
// Request: Test SM-09 that navigates to /all-trips and asserts "Community Trips" is visible.
// Expectation: Passes headless, uses getByText for accessible locator.
```

---

## Workshop Agenda

| Time | Demo | Topic | Key Files |
|------|------|-------|-----------|
| 0–15 min | Demo 1 | Your First Test with CORE Prompts | `e2e/tests/smoke/app-loads.spec.ts` |
| 15–30 min | Demo 2 | Page Object Model with Inline Suggestions | `e2e/pages/AllTripsPage.ts`, `BasePage.ts` |
| 30–50 min | Demo 3 | Custom Fixtures with Copilot Chat | `e2e/fixtures/auth.fixture.ts`, `base.fixture.ts` |
| 50–65 min | Demo 4 | Debugging Flaky Locators with Chat | `setup/demo-templates/demo-04-flaky.spec.ts` |
| 65–80 min | Demo 5 | API-Level Testing with `request` Context | `e2e/helpers/api-helpers.ts` |
| 80–90 min | Demo 6 | Generating CORE Prompts for New Specs | PLAYWRIGHT_TESTING_ROADMAP.md |

---

## Project Architecture Overview

Before diving into demos, understand the test infrastructure you'll be working with:

### Test Architecture
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Playwright Test Runner (npx playwright test)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Chromium     │  │  Firefox     │  │  WebKit      │  + mobile devices │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
│         │                 │                 │                             │
│         ▼                 ▼                 ▼                             │
│  ┌──────────────────────────────────────────────────────┐                │
│  │  Frontend  (React + Vite)         http://localhost:5173│               │
│  └──────────────────────┬───────────────────────────────┘                │
│                         │ /api/*                                         │
│                         ▼                                                │
│  ┌──────────────────────────────────────────────────────┐                │
│  │  BFF  (Node.js / Express)         http://localhost:3000│               │
│  └──────┬───────────────┬──────────────────┬────────────┘                │
│         │               │                  │                             │
│         ▼               ▼                  ▼                             │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐                       │
│  │ Python     │  │ C# ASP.NET │  │ Java Spring  │                       │
│  │ FastAPI    │  │ AI Service │  │ Geospatial   │                       │
│  │ :8000      │  │ :8081      │  │ :8082        │                       │
│  └──────┬─────┘  └────────────┘  └──────────────┘                       │
│         ▼                                                                │
│  ┌────────────┐                                                          │
│  │ PostgreSQL │                                                          │
│  │ :5432      │                                                          │
│  └────────────┘                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### E2E Test Project Structure
```
frontend/e2e/
├── global-setup.ts         — Auth caching via devLogin (runs once)
├── global-teardown.ts      — Cleanup E2E_TEST_ prefixed trips
├── fixtures/
│   ├── auth.fixture.ts     — authenticatedPage fixture (pre-logged-in)
│   └── base.fixture.ts     — POM fixtures: explorePage, itineraryPage, etc.
├── helpers/
│   ├── selectors.ts        — Centralized locator constants (NAV, EXPLORE, MAP, etc.)
│   ├── test-data.ts        — Coordinates, queries, vehicle specs, timeouts
│   └── api-helpers.ts      — ApiHelpers class for setup/teardown API calls
├── pages/
│   ├── BasePage.ts         — Shared: nav, toast, map, auth, network utilities
│   ├── ExplorePage.ts      — /explore: category search, text search, results
│   ├── ItineraryPage.ts    — /itinerary: stops, route, optimize, save, POI
│   ├── TripsPage.ts        — /trips: trip cards, delete, empty state
│   ├── StartTripPage.ts    — /start: blank, AI, templates
│   ├── AllTripsPage.ts     — /all-trips: community trips, filter
│   └── components/
│       ├── Sidebar.ts      — Desktop sidebar nav links
│       ├── MapComponent.ts — Map canvas, markers, route layer
│       └── AuthStatus.ts   — Login status, logout
└── tests/
    ├── smoke/              — SM-01..SM-08 (P0, all passing)
    └── navigation/         — NAV-01..NAV-02 (P0, all passing)
```

### Key Conventions (from `PLAYWRIGHT_TESTING_ROADMAP.md`)

| Convention | Detail |
|------------|--------|
| **File naming** | Tests: `kebab-case.spec.ts`. POMs: `PascalCase.ts` |
| **Test IDs** | `{AREA}-{NUMBER}`: `SM-01`, `NAV-01a`, `EXP-02` |
| **Tags** | `@smoke` (P0), `@regression` (P1), `@auth`, `@slow`, `@mobile` |
| **Locator priority** | `getByRole()` > `getByText()` / `getByPlaceholder()` > `data-testid` > CSS |
| **POMs** | All extend `BasePage`. Locators as `readonly` fields. Methods return `Promise<void>` |
| **Waits** | `waitForResponse()` for API calls. Never `waitForTimeout()` in production tests |
| **Test data** | Import from `helpers/test-data.ts`. Use `uniqueTripName()` for isolation |
| **Auth** | Global setup caches auth to `.auth/user.json`. Use `authenticatedPage` fixture |
| **Cleanup** | All test trips prefixed with `E2E_TEST_`. Global teardown deletes them |

### Copilot Customization in This Project

Copilot reads `.github/copilot-instructions.md` automatically for every prompt. It includes:
- Architecture rules (React, Zustand, Tailwind, FastAPI)
- Coordinate format: `[longitude, latitude]` — GeoJSON standard
- HTTP client: `axiosInstance` — never raw `fetch()`
- API proxy pattern: frontend → BFF → backend (never call Mapbox directly)

For Playwright-specific context, use `#file:` references in Chat:
```
#file:frontend/playwright.config.ts — Show config (base URL, projects, timeouts)
#file:frontend/e2e/pages/BasePage.ts — Show the base POM pattern
#file:frontend/e2e/helpers/selectors.ts — Show available locator constants
#file:frontend/e2e/helpers/test-data.ts — Show test data and timeouts
```

### Keyboard Shortcuts (VS Code)

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Accept inline suggestion | `Tab` | `Tab` |
| Dismiss suggestion | `Esc` | `Esc` |
| Next/prev suggestion | `Option+]` / `Option+[` | `Alt+]` / `Alt+[` |
| Open Copilot Chat | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| Inline Chat | `Cmd+I` | `Ctrl+I` |
| Quick Chat | `Cmd+Shift+Option+L` | `Ctrl+Shift+Alt+L` |

---

## Demo 1: Your First Playwright Test with CORE Prompts (15 min)

### Objective
Learn how CORE prompts produce dramatically better Playwright tests than vague requests, by generating a new smoke test using Copilot Chat.

### Scenario
The existing smoke suite (`SM-01` through `SM-08` in `app-loads.spec.ts`) covers core views but is missing a test for the `/all-trips` community page. We'll write `SM-09` using a CORE prompt.

### Before Demo: Setup
```bash
# 1. Open the existing smoke tests for reference
code frontend/e2e/tests/smoke/app-loads.spec.ts

# 2. Open the selectors file (Copilot will use this as context)
code frontend/e2e/helpers/selectors.ts

# 3. Ensure Docker Compose stack is running
docker-compose ps
```

### Live Coding Steps

**Step 1: Show the BAD prompt first** (2 min)

Open Copilot Chat (`Ctrl+Shift+I`) and type a vague prompt:

```
Write a Playwright test for the all-trips page
```

**Expected poor output** — Copilot will likely produce:
```typescript
// ❌ Generic, doesn't match project patterns
import { test, expect } from '@playwright/test';

test('all trips page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/all-trips');  // Wrong URL
  await expect(page.locator('h1')).toHaveText('All Trips');  // Wrong heading
  const trips = page.locator('.trip-card');  // Made-up selector
  await expect(trips).toHaveCount(5);  // Arbitrary number
});
```

**Problems to point out**:
- ❌ Hardcoded base URL (should use relative path — config provides `baseURL`)
- ❌ Wrong heading text ("All Trips" vs actual "Community Trips")
- ❌ Invented CSS selectors (`.trip-card` doesn't exist)
- ❌ Missing test ID convention (`SM-09`)
- ❌ Missing tag convention (`@smoke`)
- ❌ No `waitUntil` option on navigation
- ❌ Doesn't follow the `test.describe` block pattern used in existing tests

**Step 2: Write the CORE prompt** (5 min)

Clear the Chat and write a structured CORE prompt:

```
Context: I'm writing Playwright E2E smoke tests in frontend/e2e/tests/smoke/app-loads.spec.ts.
The existing tests SM-01 through SM-08 follow this pattern:
- Wrapped in test.describe('Smoke Tests @smoke', () => { ... })
- Each test has an ID prefix like 'SM-01: Description'
- Use page.goto() with relative paths (baseURL from playwright.config.ts)
- Use waitUntil: 'domcontentloaded' for navigation
- Use getByText() for accessible locators
- Import only from '@playwright/test'
See #file:frontend/e2e/tests/smoke/app-loads.spec.ts for the full pattern.
See #file:frontend/e2e/helpers/selectors.ts for the ALL_TRIPS selector constants.

Objective: Add a new smoke test SM-09 that validates the /all-trips community trips page
loads correctly and displays the expected heading and content.

Request: Generate a test that:
1. Navigates to /all-trips with waitUntil: 'domcontentloaded'
2. Asserts "Community Trips" heading is visible (using getByText)
3. Asserts the "All Trips" filter tab is visible
4. Asserts the "Featured" filter tab is visible
5. Keep the same import and describe block pattern as existing tests
6. Use the SM-09 test ID prefix

Expectation: The test integrates cleanly into the existing app-loads.spec.ts file.
It passes with: npx playwright test app-loads --project=chromium.
Uses only accessible locators (getByText, getByRole) — no CSS class selectors.
```

**Expected CORE-prompt output**:
```typescript
test('SM-09: All Trips community page loads with filters', async ({ page }) => {
  await page.goto('/all-trips', { waitUntil: 'domcontentloaded' });

  // Community trips heading
  await expect(page.getByText('Community Trips')).toBeVisible({ timeout: 5_000 });

  // Filter tabs
  await expect(page.getByText('All Trips')).toBeVisible();
  await expect(page.getByText('Featured')).toBeVisible();
});
```

**Decision Point**: Review the suggestion
- ✅ Uses relative URL (config provides `baseURL`)
- ✅ Uses `getByText()` accessible locators
- ✅ Follows `SM-09:` ID convention
- ✅ Includes `waitUntil: 'domcontentloaded'`
- ✅ Uses timeout for first visual assertion (page may still be loading)

**Step 3: Verify the test** (3 min)

```bash
cd frontend
npx playwright test app-loads --project=chromium --headed
```

### Common Copilot Mistakes to Watch For

**Mistake #1: Hardcoded base URL**
```typescript
// ❌ Copilot might suggest:
await page.goto('http://localhost:5173/all-trips');

// ✅ Correct: Use relative path (baseURL comes from playwright.config.ts)
await page.goto('/all-trips', { waitUntil: 'domcontentloaded' });
```

**Mistake #2: Inventing selectors that don't exist**
```typescript
// ❌ Copilot might suggest CSS selectors it made up:
const heading = page.locator('h1.page-title');

// ✅ Correct: Use accessible locators or selectors.ts constants
const heading = page.getByText('Community Trips');
```

**Mistake #3: Using `toHaveText` with exact match on dynamic content**
```typescript
// ❌ Might suggest exact match that breaks:
await expect(page.locator('h1')).toHaveText('Community Trips');

// ✅ Correct: toBeVisible is more resilient for smoke tests
await expect(page.getByText('Community Trips')).toBeVisible();
```

### Teaching Points

1. **CORE prompts vs vague prompts**: Side-by-side comparison shows 5–10x better output quality. The CORE prompt produced a test that matches project conventions on the first attempt.

2. **`#file:` references are powerful**: Including `#file:frontend/e2e/tests/smoke/app-loads.spec.ts` gives Copilot the exact pattern to follow. Without it, Copilot invents patterns.

3. **Relative URLs with `baseURL`**: Playwright's config handles the host — tests should always use `page.goto('/path')`, not `page.goto('http://localhost:5173/path')`.

4. **Accept, then refine**: If the CORE output is 90% right, accept it and tweak. Don't restart the prompt from scratch.

---

## Demo 2: Page Object Model with Inline Suggestions (15 min)

### Objective
Use Copilot inline suggestions to build a Page Object Model class that follows the established `BasePage` pattern, learning how Copilot leverages open tabs for context.

### Scenario
The `AllTripsPage.ts` POM exists but needs enhancement. We'll create a new method to filter community trips by tab and verify Copilot follows the `BasePage` inheritance pattern.

### Before Demo: Setup
```bash
# CRITICAL: Open these files as tabs first — Copilot reads open tabs for context
code frontend/e2e/pages/BasePage.ts
code frontend/e2e/pages/ExplorePage.ts
code frontend/e2e/pages/AllTripsPage.ts
code frontend/e2e/helpers/selectors.ts
```

> **Teaching Point**: Copilot's inline suggestions are dramatically better when related files are open in VS Code tabs. The POM pattern from `BasePage.ts` and `ExplorePage.ts` teaches Copilot the constructor pattern, locator style, and method signatures.

### Live Coding Steps

**Step 1: Examine the existing `AllTripsPage.ts`** (2 min)

Open `frontend/e2e/pages/AllTripsPage.ts` and review its current structure:
- It extends `BasePage`
- Has a constructor calling `super(page)`
- Has a `goto()` method
- May have some basic locators

**Step 2: Add new locators using inline suggestions** (5 min)

Position your cursor inside the class, below the existing locators, and start typing:

```typescript
// Type slowly — Copilot sees BasePage and ExplorePage patterns:
readonly allTripsFilter: Locator;
```

**Expected Copilot Suggestion** (after the first locator):
```typescript
readonly allTripsFilter: Locator;
readonly featuredFilter: Locator;
readonly backButton: Locator;
readonly tripCards: Locator;
readonly loadingSpinner: Locator;
```

**Decision Point**: Review each suggestion
- ✅ `readonly` modifier matches `BasePage` / `ExplorePage` pattern
- ✅ `Locator` type is correct
- ⚠️ Check naming: does it match `selectors.ts` `ALL_TRIPS` entries?

**Step 3: Initialize locators in constructor** (3 min)

Inside the constructor, after `super(page)`, start typing:

```typescript
constructor(page: Page) {
  super(page);
  this.allTripsFilter = page.getByText('All Trips');
  // Cursor here — wait for Copilot to suggest remaining initializations
```

**Expected Copilot Suggestion**:
```typescript
this.featuredFilter = page.getByText('Featured');
this.backButton = page.locator('button').filter({ has: page.locator('svg.lucide-arrow-left') });
this.tripCards = page.locator('[class*="rounded-xl"]').filter({ has: page.locator('h3, h4') });
this.loadingSpinner = page.locator('svg.animate-spin').first();
```

**Step 4: Add a filter method using CORE comment** (5 min)

Type a CORE comment above a new method:

```typescript
// Context: AllTripsPage POM for /all-trips community trips view.
// Objective: Add method to click a filter tab and wait for content to update.
// Request: Method clickFilter(name: 'All Trips' | 'Featured') that clicks the tab and waits.
// Expectation: Returns Promise<void>, uses getByText, includes brief waitForLoadState.
```

**Expected Copilot Suggestion**:
```typescript
async clickFilter(name: 'All Trips' | 'Featured'): Promise<void> {
  await this.page.getByText(name, { exact: true }).click();
  await this.page.waitForLoadState('networkidle', { timeout: 5_000 });
}
```

**Step 5: Add an assertion method** (2 min)

Start typing:
```typescript
/** Assert that trip cards are visible */
async expectTripsVisible
```

**Expected Copilot Suggestion**:
```typescript
async expectTripsVisible(): Promise<void> {
  await expect(this.tripCards.first()).toBeVisible({ timeout: 5_000 });
}
```

### Common Copilot Mistakes

**Mistake #1: Not extending BasePage**
```typescript
// ❌ Copilot might create a standalone class:
export class AllTripsPage {
  constructor(private page: Page) {}
}

// ✅ Correct: Must extend BasePage (project convention)
export class AllTripsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
```

**Mistake #2: Using CSS instead of accessible locators**
```typescript
// ❌ Copilot might suggest CSS class locators:
this.allTripsFilter = page.locator('.btn-filter-all');

// ✅ Correct: Use getByText or getByRole (Playwright best practice)
this.allTripsFilter = page.getByText('All Trips');
```

**Mistake #3: Missing `expect` import for assertion methods**
```typescript
// ❌ Copilot might forget the import when adding expect calls:
async expectTripsVisible(): Promise<void> {
  await expect(this.tripCards).toBeVisible();  // expect not imported!
}

// ✅ Correct: Ensure import at top of file
import { Page, Locator, expect } from '@playwright/test';
```

### Teaching Points

1. **Open tabs = context**: Copilot produced correct `BasePage` inheritance, `readonly Locator` fields, and `super(page)` call because `BasePage.ts` and `ExplorePage.ts` were open.

2. **Pattern propagation**: After accepting one `readonly` locator declaration, Copilot suggested the rest in the same style. The first accepted line becomes a "few-shot example."

3. **CORE comments in code**: Writing a CORE comment block directly above a method gives inline suggestions the same quality boost as Chat prompts. Works especially well for POM methods.

4. **Union types for parameters**: `name: 'All Trips' | 'Featured'` is a TypeScript pattern Copilot picks up from the project (see `ItineraryPage.switchTab` with `'Itinerary' | 'Vehicle' | 'Directions' | 'Trips'`).

### Verification
```bash
# Type check the POM file
cd frontend
npx tsc --noEmit --project tsconfig.e2e.json

# No errors means the POM compiles correctly
```

---

## Demo 3: Custom Fixtures with Copilot Chat (20 min)

### Objective
Use Copilot Chat with `#file:` references to create a custom Playwright fixture that combines authentication with trip seeding, demonstrating how Copilot understands fixture composition.

### Scenario
You need a test that validates trip-related features, but it requires:
1. An authenticated user (logged in)
2. A pre-existing trip with 2 stops (seeded via API, not through UI)

Creating this through the UI would be slow and flaky. Instead, we'll build a **composite fixture** that handles both auth and data seeding.

### Before Demo: Setup
```bash
# Open the existing fixtures for context
code frontend/e2e/fixtures/auth.fixture.ts
code frontend/e2e/fixtures/base.fixture.ts
code frontend/e2e/helpers/api-helpers.ts
code frontend/e2e/helpers/test-data.ts
```

### Live Coding Steps

**Step 1: Examine existing fixtures** (3 min)

Review `auth.fixture.ts` — it extends `base.extend<AuthFixtures>` to create an `authenticatedPage`:
```typescript
// auth.fixture.ts creates:
authenticatedPage: async ({ browser }, use) => {
  const context = await browser.newContext({ storageState: AUTH_FILE });
  const page = await context.newPage();
  await use(page);
  await context.close();
};
```

Review `api-helpers.ts` — it has `createTrip()` and `deleteTestTrips()` methods.

**Step 2: Write the CORE prompt in Copilot Chat** (5 min)

Open Copilot Chat (`Ctrl+Shift+I`) and provide the full CORE prompt with file references:

```
Context: I'm creating a new Playwright fixture in frontend/e2e/fixtures/.
The project already has these fixture patterns:
#file:frontend/e2e/fixtures/auth.fixture.ts — authenticatedPage using storageState
#file:frontend/e2e/fixtures/base.fixture.ts — POM fixtures (explorePage, itineraryPage, etc.)
#file:frontend/e2e/helpers/api-helpers.ts — ApiHelpers with devLogin(), createTrip(), deleteTestTrips()
#file:frontend/e2e/helpers/test-data.ts — COORDINATES, uniqueTripName(), TRIP_NAMES

Objective: Create a composite fixture that provides an authenticated page AND a
pre-seeded trip with 2 stops (Denver + Austin), so tests can immediately interact
with trip data without going through the UI.

Request: Create e2e/fixtures/trip-seed.fixture.ts that:
1. Extends from the auth fixture pattern (use storageState for auth)
2. Uses ApiHelpers to create a trip via API in the fixture setup
3. Trip should have name from uniqueTripName() and 2 stops (Denver, Austin)
4. Exposes { seededPage: Page; seededTrip: { id: number; name: string } } to tests
5. Cleans up the seeded trip in fixture teardown (after use())
6. Follows the same code style as auth.fixture.ts (JSDoc header, typed fixture interface)

Expectation: Tests using this fixture get a ready-to-use page with a trip already saved.
Example test usage:
  test('shows saved trip', async ({ seededPage, seededTrip }) => {
    await seededPage.goto('/trips');
    await expect(seededPage.getByText(seededTrip.name)).toBeVisible();
  });
```

**Expected Copilot Chat Output**:
```typescript
/**
 * Trip Seed Fixture — Authenticated Page with Pre-Created Trip
 *
 * Extends Playwright test with a browser context that:
 * 1. Has cached auth state (logged-in user)
 * 2. Has a trip pre-created via API with 2 stops (Denver, Austin)
 *
 * Usage:
 *   import { test, expect } from '../fixtures/trip-seed.fixture';
 *
 *   test('trip appears in list', async ({ seededPage, seededTrip }) => {
 *     await seededPage.goto('/trips');
 *     await expect(seededPage.getByText(seededTrip.name)).toBeVisible();
 *   });
 */

import { test as base, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiHelpers } from '../helpers/api-helpers';
import { COORDINATES, uniqueTripName } from '../helpers/test-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FILE = path.resolve(__dirname, '..', '.auth', 'user.json');

type SeededTrip = {
  id: number;
  name: string;
};

type TripSeedFixtures = {
  /** A Page with auth state and a pre-created trip */
  seededPage: Page;
  /** The trip created during fixture setup */
  seededTrip: SeededTrip;
};

export const test = base.extend<TripSeedFixtures>({
  seededPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  seededTrip: async ({}, use) => {
    const api = new ApiHelpers();
    await api.init();

    const token = await api.devLogin();
    const tripName = uniqueTripName('SeededTrip');

    const trip = await api.createTrip(token, {
      name: tripName,
      stops: [
        {
          id: 'seed-stop-1',
          name: 'Denver, CO',
          coordinates: COORDINATES.DENVER,
          type: 'start',
        },
        {
          id: 'seed-stop-2',
          name: 'Austin, TX',
          coordinates: COORDINATES.AUSTIN,
          type: 'end',
        },
      ],
    });

    await use({ id: trip.id, name: tripName });

    // Teardown: delete the seeded trip
    await api.deleteTrip(token, trip.id);
    await api.dispose();
  },
});

export { expect } from '@playwright/test';
```

**Step 3: Review the output** (5 min)

Walk through the generated code:
- ✅ Follows `auth.fixture.ts` structure (JSDoc, typed fixtures, `base.extend`)
- ✅ Uses `ApiHelpers` correctly (`init()`, `devLogin()`, `createTrip()`, `dispose()`)
- ✅ Imports from `test-data.ts` (`COORDINATES`, `uniqueTripName`)
- ✅ Cleanup in teardown (after `use()`)
- ✅ Properly typed `TripSeedFixtures` interface
- ⚠️ May need to verify `COORDINATES.DENVER` and `COORDINATES.AUSTIN` are the correct keys in `test-data.ts`

**Step 4: Ask a follow-up question** (3 min)

```
Follow-up: How would I compose this fixture with the base.fixture.ts
POM fixtures so I can use both seededTrip AND itineraryPage in the same test?
```

**Expected response** — Copilot explains fixture composition:
```typescript
// You can merge fixtures by chaining extends:
import { test as tripSeedTest } from './trip-seed.fixture';
import { ItineraryPage } from '../pages/ItineraryPage';

export const test = tripSeedTest.extend({
  itineraryPage: async ({ seededPage }, use) => {
    await use(new ItineraryPage(seededPage));
  },
});
```

### Common Copilot Mistakes

**Mistake #1: Not disposing ApiHelpers**
```typescript
// ❌ Copilot might forget cleanup:
seededTrip: async ({}, use) => {
  const api = new ApiHelpers();
  await api.init();
  const trip = await api.createTrip(token, data);
  await use(trip);
  // Missing: api.dispose() and trip deletion!
};

// ✅ Correct: Always clean up after use()
await use({ id: trip.id, name: tripName });
await api.deleteTrip(token, trip.id);  // Delete test data
await api.dispose();                    // Release API context
```

**Mistake #2: Using `page` fixture inside `seededTrip`**
```typescript
// ❌ Copilot might try to use browser page in an API fixture:
seededTrip: async ({ page }, use) => {  // WRONG — seededTrip is API-only
  // ...
};

// ✅ Correct: Use empty destructuring for API-only fixtures
seededTrip: async ({}, use) => {
  // API calls don't need browser page
};
```

**Mistake #3: Dependent fixture ordering issues**
```typescript
// ❌ Copilot might make seededPage depend on seededTrip (circular):
seededPage: async ({ browser, seededTrip }, use) => { ... }
seededTrip: async ({ seededPage }, use) => { ... }  // Circular!

// ✅ Correct: seededTrip is independent (API-only), seededPage is independent (auth-only)
// Tests that need both just declare both as parameters
```

### Teaching Points

1. **`#file:` references are essential for fixtures**: Without seeing `auth.fixture.ts`, Copilot wouldn't know about `storageState`, `AUTH_FILE`, or the `base.extend` pattern.

2. **Fixture composition**: Playwright fixtures compose via chaining `extend()`. Copilot understands this pattern when shown examples.

3. **Separation of concerns**: `seededPage` handles auth, `seededTrip` handles data. They're independent — a test can use either or both.

4. **Teardown is automated**: Code after `await use()` runs automatically when the test finishes — even if the test fails. This prevents test data leaking between runs.

### Verification
```bash
# Type check the new fixture
npx tsc --noEmit --project tsconfig.e2e.json
```

---

## Demo 4: Debugging Flaky Locators with Copilot Chat (15 min)

### Objective
Use Copilot Chat to diagnose and fix a flaky Playwright test, learning the locator priority hierarchy and why `waitForResponse` beats `waitForTimeout`.

### Scenario
A test file has been written that passes locally sometimes but fails in CI. It contains 5 intentional bugs representing common Playwright anti-patterns. You'll use Copilot Chat to identify and fix each one.

### Before Demo: Setup
```bash
# Copy the buggy demo template into the test directory
cp docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts \
   frontend/e2e/tests/workshop/flaky-demo.spec.ts

# Open the buggy file
code frontend/e2e/tests/workshop/flaky-demo.spec.ts

# Also open these for context
code frontend/e2e/helpers/selectors.ts
code frontend/e2e/helpers/test-data.ts
```

### Live Coding Steps

**Step 1: Run the buggy test and show it failing** (2 min)

```bash
cd frontend
npx playwright test flaky-demo --project=chromium --headed
```

The test will likely fail on the first result click (BUG #2 — no wait for geocoding).

**Step 2: Paste the test into Copilot Chat** (5 min)

Open Copilot Chat and use a CORE prompt:

```
Context: This Playwright test is for the Road Trip Planner at frontend/e2e/.
It tests route calculation on the /itinerary view. The test passes locally
about 50% of the time but always fails in CI. The project uses these
conventions: #file:frontend/e2e/helpers/selectors.ts for locators,
#file:frontend/e2e/helpers/test-data.ts for data and TIMEOUTS constants,
and Page Object Models in e2e/pages/.

Objective: Debug why this test is flaky and identify all anti-patterns.

Request: Analyze the test code in #file:frontend/e2e/tests/workshop/flaky-demo.spec.ts
and identify every issue that causes flakiness. For each issue:
1. Explain WHY it's flaky
2. Show the FIXED code
3. Reference the correct Playwright API to use

Expectation: After applying all fixes, the test should pass reliably on CI
(2 retries, headless Chromium, Docker Compose stack). No waitForTimeout
calls. All locators should be accessible (getByText, getByPlaceholder, getByRole).
```

**Expected Copilot Chat Response** — identifies all 5 bugs:

**Bug #1: Fragile CSS class selector**
```typescript
// ❌ Line 26: Breaks when Tailwind classes change
const stopInput = page.locator('.flex.items-center input.border-gray-300');

// ✅ Fix: Use placeholder text (stable across CSS changes)
const stopInput = page.getByPlaceholder('Add a stop (City, Place)...');
```

**Bug #2: Missing API wait**
```typescript
// ❌ Line 35: Clicks result before geocoding response arrives
const firstResult = page.locator('[class*="cursor-pointer"]').first();
await firstResult.click();  // Race condition!

// ✅ Fix: Wait for the geocoding API response first
await page.waitForResponse(
  (response) => response.url().includes('/api/geocode'),
  { timeout: TIMEOUTS.GEOCODE_SEARCH }
);
const firstResult = page.locator('[class*="cursor-pointer"]').first();
await firstResult.click();
```

**Bug #3: Hardcoded nth-child**
```typescript
// ❌ Line 49: Markers load in unpredictable order
const thirdMarker = page.locator('.mapboxgl-marker:nth-child(3)');

// ✅ Fix: Assert count instead of specific child
const markers = page.locator('.mapboxgl-marker');
await expect(markers).toHaveCount(2, { timeout: 5_000 });
```

**Bug #4: Magic number timeout**
```typescript
// ❌ Line 58: Hardcoded 3000 — should use project constant
await expect(distanceText).toBeVisible({ timeout: 3000 });

// ✅ Fix: Import from test-data.ts
import { TIMEOUTS } from '../../helpers/test-data';
// ... then use:
await expect(distanceText).toBeVisible({ timeout: TIMEOUTS.ROUTE_CALCULATION });
```

**Bug #5: Arbitrary delay**
```typescript
// ❌ Line 66: Waits 5 seconds regardless of actual API response time
await page.waitForTimeout(5000);

// ✅ Fix: Wait for the specific API response
await page.waitForResponse(
  (response) => response.url().includes('/api/directions'),
  { timeout: TIMEOUTS.ROUTE_CALCULATION }
);
```

**Step 3: Apply fixes and re-run** (5 min)

Apply each fix using Copilot Chat's "Apply" button or inline edits. Then re-run:

```bash
npx playwright test flaky-demo --project=chromium --repeat-each=3
```

Using `--repeat-each=3` runs the test 3 times — if all 3 pass, the flakiness is resolved.

**Step 4: Show the Playwright Trace Viewer** (3 min)

For tests that fail intermittently, the trace viewer is invaluable:

```bash
# Run with trace enabled
npx playwright test flaky-demo --project=chromium --trace=on

# Open the trace
npx playwright show-trace frontend/e2e/test-results/*/trace.zip
```

The trace shows:
- Timeline of actions with screenshots at each step
- Network tab showing API requests and responses
- Console logs from the browser
- DOM snapshots at each assertion point

> **Teaching Point**: Ask Copilot Chat to explain any trace output you don't understand. Paste a screenshot or describe what you see.

### Playwright Locator Priority Hierarchy

This hierarchy should guide all locator choices in your tests:

```
Best ──────────────────────────────────────────── Worst

getByRole()          Most accessible, resilient to UI changes
   │                 Example: getByRole('button', { name: 'Save Trip' })
   ▼
getByText()          Good for headings, labels, button text
getByPlaceholder()   Good for input fields
   │                 Example: getByPlaceholder('Add a stop...')
   ▼
getByTestId()        Requires data-testid attribute in component
   │                 Example: getByTestId('trip-card-1')
   ▼
CSS Selectors        Fragile — breaks when classes change
   │                 Example: page.locator('.btn-primary')
   ▼
XPath                Most fragile — avoid entirely
                     Example: page.locator('//div[@class="card"]/button')
```

### Teaching Points

1. **`waitForResponse` > `waitForTimeout`**: The biggest source of flakiness is arbitrary delays. `waitForResponse` waits for exactly the right event — no more, no less.

2. **Accessible locators survive refactors**: Button text ("Calculate Route") rarely changes. CSS classes (`btn-primary`, `flex items-center`) change in every Tailwind refactor.

3. **`--repeat-each=N`**: The best way to verify a flakiness fix. If the test passes 5 times in a row, the fix is solid.

4. **Trace viewer is your debugger**: For tests that fail only in CI, download the trace artifact and open locally. It's like a time machine for test failures.

---

## Demo 5: API-Level Testing with `request` Context (15 min)

### Objective
Use Copilot to write Playwright tests that validate backend APIs directly using the `APIRequestContext`, learning that Playwright isn't just for browser testing.

### Scenario
Beyond UI smoke tests, the team needs to validate:
1. The BFF health endpoint aggregates all backend service health checks
2. Trip CRUD operations work correctly via the API
3. Protected endpoints reject unauthenticated requests

These tests run faster than browser tests and catch backend regressions early.

### Before Demo: Setup
```bash
# Open existing API test pattern (SM-04 in app-loads.spec.ts)
code frontend/e2e/tests/smoke/app-loads.spec.ts

# Open API helpers for reference
code frontend/e2e/helpers/api-helpers.ts
code frontend/e2e/helpers/test-data.ts
```

### Live Coding Steps

**Step 1: Examine the existing API test pattern** (2 min)

Look at `SM-04` in `app-loads.spec.ts`:
```typescript
test('SM-04: BFF health endpoint returns healthy', async ({ request }) => {
  const bffUrl = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';
  const response = await request.get(`${bffUrl}/health`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toBeDefined();
});
```

**Key patterns**:
- Uses `{ request }` fixture (no browser launched)
- Uses `PLAYWRIGHT_BFF_URL` env var with fallback
- Checks both status code and response body

**Step 2: Write CORE prompt for API test suite** (5 min)

```
Context: Playwright API tests for the Road Trip Planner BFF at localhost:3000.
The project has an API helper class at #file:frontend/e2e/helpers/api-helpers.ts
with devLogin(), createTrip(), getTrips(), deleteTrip(), and deleteTestTrips().
Test data is at #file:frontend/e2e/helpers/test-data.ts with COORDINATES,
uniqueTripName(), and TIMEOUTS. The existing API test pattern is SM-04 in
#file:frontend/e2e/tests/smoke/app-loads.spec.ts.

Objective: Create an API-level test suite that validates trip CRUD operations
and authentication enforcement without launching a browser.

Request: Create e2e/tests/api/trip-crud.spec.ts that:
1. Uses test.describe('Trip CRUD API @regression', () => { ... })
2. In beforeAll: init ApiHelpers, devLogin to get token
3. In afterAll: deleteTestTrips, dispose ApiHelpers
4. Test API-01: Create trip via POST /api/trips — assert 200 and id returned
5. Test API-02: Get trips via GET /api/trips — assert created trip is in list
6. Test API-03: Delete trip via DELETE /api/trips/:id — assert 200
7. Test API-04: GET /api/trips without auth token — assert 401 or 403
8. Use uniqueTripName() for test isolation
9. Use COORDINATES.DENVER and COORDINATES.AUSTIN for stop data

Expectation: All tests use ApiHelpers class methods (not raw fetch).
No browser is launched (request fixture only where needed, ApiHelpers for most).
Tests are isolated — each creates and cleans up its own data.
Passes with: npx playwright test trip-crud --project=chromium
```

**Expected Copilot Output**:
```typescript
/**
 * API-01 through API-04: Trip CRUD API Tests
 *
 * Validates trip Create, Read, Delete operations via the BFF API layer.
 * No browser is launched — uses ApiHelpers for direct HTTP calls.
 *
 * Tags: @regression @api
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 */

import { test, expect } from '@playwright/test';
import { ApiHelpers } from '../../helpers/api-helpers';
import { COORDINATES, uniqueTripName } from '../../helpers/test-data';

test.describe('Trip CRUD API @regression @api', () => {
  let api: ApiHelpers;
  let token: string;
  let createdTripId: number;
  const tripName = uniqueTripName('APICrud');

  test.beforeAll(async () => {
    api = new ApiHelpers();
    await api.init();
    token = await api.devLogin();
  });

  test.afterAll(async () => {
    await api.deleteTestTrips(token);
    await api.dispose();
  });

  test('API-01: Create trip via POST /api/trips', async () => {
    const trip = await api.createTrip(token, {
      name: tripName,
      stops: [
        { id: 'api-stop-1', name: 'Denver, CO', coordinates: COORDINATES.DENVER, type: 'start' },
        { id: 'api-stop-2', name: 'Austin, TX', coordinates: COORDINATES.AUSTIN, type: 'end' },
      ],
    });

    expect(trip).toBeDefined();
    expect(trip.id).toBeGreaterThan(0);
    createdTripId = trip.id;
  });

  test('API-02: Get trips includes created trip', async () => {
    const trips = await api.getTrips(token);
    const found = (trips as Array<{ id: number; name: string }>)
      .find(t => t.name === tripName);

    expect(found).toBeDefined();
    expect(found!.id).toBe(createdTripId);
  });

  test('API-03: Delete trip via DELETE /api/trips/:id', async () => {
    await api.deleteTrip(token, createdTripId);

    const trips = await api.getTrips(token);
    const found = (trips as Array<{ id: number; name: string }>)
      .find(t => t.id === createdTripId);

    expect(found).toBeUndefined();
  });

  test('API-04: GET /api/trips without auth returns 401', async ({ request }) => {
    const bffUrl = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';
    const response = await request.get(`${bffUrl}/api/trips`);

    // Backend should reject unauthenticated requests
    expect([401, 403]).toContain(response.status());
  });
});
```

**Step 3: Review and discuss** (5 min)

Walk through key patterns:
- ✅ `beforeAll` / `afterAll` for setup/teardown (not `beforeEach` — wasteful for API tests)
- ✅ `ApiHelpers` class encapsulates HTTP details
- ✅ `uniqueTripName()` prevents collision with parallel test runs
- ✅ `API-04` uses the `{ request }` fixture to make an unauthenticated call
- ✅ Test IDs follow `{AREA}-{NUMBER}` convention (`API-01`, `API-02`, etc.)
- ⚠️ Tests depend on order (`API-02` needs `createdTripId` from `API-01`) — discuss whether to use `test.describe.serial()` or make each test independent

**Step 4: Ask follow-up about test independence** (3 min)

```
Follow-up: Tests API-01 through API-03 depend on execution order because they
share createdTripId. Should I use test.describe.serial() or restructure them
to be independent? What does Playwright recommend?
```

**Expected response**: Copilot explains `test.describe.serial()` for sequential tests and offers an alternative where each test creates/deletes its own data for full independence.

### Common Copilot Mistakes

**Mistake #1: Using raw fetch instead of ApiHelpers**
```typescript
// ❌ Copilot might suggest raw fetch calls:
const response = await fetch('http://localhost:3000/api/trips', {
  headers: { 'Authorization': `Bearer ${token}` },
});

// ✅ Correct: Use the existing ApiHelpers class
const trips = await api.getTrips(token);
```

**Mistake #2: Forgetting to dispose ApiHelpers**
```typescript
// ❌ Missing dispose in afterAll:
test.afterAll(async () => {
  await api.deleteTestTrips(token);
  // Missing api.dispose()!
});

// ✅ Correct: Always dispose to release the API request context
test.afterAll(async () => {
  await api.deleteTestTrips(token);
  await api.dispose();
});
```

**Mistake #3: Exact status code assertion for auth**
```typescript
// ❌ Copilot might assert exactly 401:
expect(response.status()).toBe(401);  // Some backends return 403!

// ✅ Correct: Allow either 401 or 403 (both are valid)
expect([401, 403]).toContain(response.status());
```

### Teaching Points

1. **Playwright = browser tests + API tests**: The `APIRequestContext` (`request` fixture and `request.newContext()`) makes Playwright a complete testing tool — not just for UI.

2. **ApiHelpers pattern**: Wrap HTTP calls in a helper class. Tests read like English (`api.createTrip()`) instead of HTTP plumbing.

3. **Test isolation via naming**: `uniqueTripName()` generates `E2E_TEST_APICrud_1709654321000` — unique per run, prefixed for bulk cleanup.

4. **`beforeAll` vs `beforeEach`**: For API tests that share a token, `beforeAll` is fine. For browser tests, `beforeEach` provides better isolation.

### Verification
```bash
npx playwright test trip-crud --project=chromium
# Expected: 4 tests passed
```

---

## Demo 6: Generating CORE Prompts for New Test Specs (10 min)

### Objective
Learn the meta-skill of using Copilot to generate structured CORE prompts, enabling consistent test generation across your team.

### Scenario
Your team has a feature backlog with test gaps. Instead of having each team member write ad-hoc tests, you want to standardize how tests are specified using CORE prompts — similar to the prompts in `PLAYWRIGHT_TESTING_ROADMAP.md`.

### Before Demo: Setup
```bash
# Open the existing CORE prompts for reference
code docs/PLAYWRIGHT_TESTING_ROADMAP.md

# Open the Page Object Models
code frontend/e2e/pages/ItineraryPage.ts
code frontend/e2e/pages/ExplorePage.ts
```

### Live Coding Steps

**Step 1: Show a feature requirement** (2 min)

Given this feature requirement:
> **Feature**: Users should be able to add a stop on the itinerary page by searching for a city,
> selecting a result, and seeing the stop appear in the stops list.

We need a CORE prompt that any team member can paste into Copilot to generate the test.

**Step 2: Ask Copilot to generate the CORE prompt** (3 min)

```
Context: I'm building CORE prompts for the Playwright test roadmap in the
Road Trip Planner project. CORE stands for Context/Objective/Request/Expectation.
The test project is at frontend/e2e/ with POMs in e2e/pages/ItineraryPage.ts
(see #file:frontend/e2e/pages/ItineraryPage.ts for available methods like
addStop(), getStopCount(), etc.) and helpers at e2e/helpers/test-data.ts
(see #file:frontend/e2e/helpers/test-data.ts for STOP_QUERIES and TIMEOUTS).
Here's an example CORE prompt from the roadmap:

---
**Context**: Playwright E2E tests at frontend/e2e/, using ExplorePage POM,
Docker Compose at localhost:5173.
**Objective**: Validate category pill search flow returns results.
**Request**: Create tests/explore/category-search.spec.ts using explorePage
fixture, assert results visible, tag @regression.
**Expectation**: Passes with npx playwright test, uses POM methods only,
waits for API responses.
---

Objective: Generate a CORE prompt for the feature "Add a stop via search
on the itinerary page."

Request: Write a complete CORE prompt following the format above that would
produce a high-quality Playwright test. Reference specific POM methods from
ItineraryPage.ts and test data from test-data.ts.

Expectation: The CORE prompt should be detailed enough that any developer
can paste it into Copilot Chat and get a working test on the first try.
```

**Expected Copilot Output**:

```markdown
### ITN-01: Add Stop via Search

**Context**: You are writing Playwright E2E tests for a React road trip planner.
The test project is at `frontend/e2e/`, using the `ItineraryPage` POM at
`e2e/pages/ItineraryPage.ts`. The POM has `goto()`, `addStop(query)`,
`getStopCount()`, and `getStopsList()` methods. The `addStop()` method fills
the search input (placeholder "Add a stop (City, Place)..."), presses Enter,
waits for `/api/geocode` response, and clicks the first result. Test data
is at `e2e/helpers/test-data.ts` with `STOP_QUERIES.ORIGIN` ("Denver, CO")
and `TIMEOUTS.GEOCODE_SEARCH` (10_000ms). Tests run against Docker Compose
at `localhost:5173`.

**Objective**: Create a test that validates adding a stop via the search
input on the itinerary page and verifying it appears in the stops list.

**Request**: Create `e2e/tests/itinerary/add-stop.spec.ts` that:
1. Uses the `itineraryPage` fixture from `e2e/fixtures/base.fixture.ts`
2. Navigates to `/itinerary` via `itineraryPage.goto()`
3. Records initial stop count via `itineraryPage.getStopCount()`
4. Adds a stop using `itineraryPage.addStop(STOP_QUERIES.ORIGIN)`
5. Asserts stop count increased by 1
6. Asserts the stop name "Denver" is visible in the stops list
7. Tags: `@regression @itinerary`
8. Test ID: `ITN-01`

**Expectation**: Test passes with `npx playwright test add-stop --project=chromium`.
Uses POM methods exclusively — no raw selectors in the test file. Waits for
geocoding API response (inside addStop method), no arbitrary timeouts.
Stop count assertion uses Playwright's polling (expect with timeout), not
a hardcoded delay.
```

**Step 3: Validate the generated CORE prompt** (3 min)

Paste the generated CORE prompt back into a fresh Copilot Chat window and see if it produces a working test:

```bash
# Did it work? Verify:
npx tsc --noEmit --project tsconfig.e2e.json
```

**Step 4: Discuss the meta-skill** (2 min)

Key observations:
- The CORE prompt references **specific POM methods** (`addStop()`, `getStopCount()`)
- It references **specific test data** (`STOP_QUERIES.ORIGIN`, `TIMEOUTS.GEOCODE_SEARCH`)
- It specifies the **file path, test ID, and tags**
- Any team member can paste this into Copilot and get consistent output

### Using @context7 for Latest Playwright Documentation

When generating CORE prompts for features that use new Playwright APIs, you can use the `@context7` MCP server to fetch up-to-date documentation:

```
@context7 Playwright toHaveScreenshot visual comparison API
```

This fetches the latest Playwright documentation — useful when:
- A new Playwright version adds features (e.g., `toHaveScreenshot` for visual testing)
- You're unsure about the API signature for a specific Playwright method
- You want Copilot to follow the latest best practices, not its training data

### Teaching Points

1. **CORE prompts are a team asset**: Store them in your test roadmap (like `PLAYWRIGHT_TESTING_ROADMAP.md`) so any team member can generate tests from them.

2. **The meta-skill**: Teaching Copilot to write CORE prompts means you can scale test generation across the team — one person writes the prompt, anyone can execute it.

3. **Specificity is everything**: The more POM methods, test data constants, and file paths you include in the CORE prompt, the better the generated test.

4. **@context7 bridges the knowledge gap**: Copilot's training data may be 6+ months old. MCP servers fetch live documentation for cutting-edge APIs.

---

## Workshop Summary & Key Takeaways

### What We Learned

| Demo | Capability | Key Lesson |
|------|-----------|------------|
| **Demo 1** | CORE Prompts | Vague prompts → wrong patterns. CORE prompts → working test on first try |
| **Demo 2** | Inline Suggestions | Open related files as tabs. Copilot reads `BasePage.ts` to match POM patterns |
| **Demo 3** | Chat + `#file:` | `#file:` references give Copilot exact patterns for fixtures and helpers |
| **Demo 4** | Debugging | Describe symptoms ("flaky in CI") + paste code → Copilot finds 5 bugs |
| **Demo 5** | API Testing | Playwright's `request` context = backend testing without a browser |
| **Demo 6** | Meta-Prompting | Generate CORE prompts themselves to scale test writing across teams |

### Playwright Anti-Patterns Caught by Copilot

| Anti-Pattern | Fix | Demo |
|-------------|-----|------|
| `page.waitForTimeout(5000)` | `page.waitForResponse(url)` | Demo 4 |
| `page.locator('.btn-primary')` | `page.getByRole('button', { name: ... })` | Demo 4 |
| `.mapboxgl-marker:nth-child(3)` | `expect(markers).toHaveCount(2)` | Demo 4 |
| Hardcoded URLs: `http://localhost:5173` | Relative paths with `baseURL` config | Demo 1 |
| Invented selectors | Reference `selectors.ts` constants | Demo 2 |
| Missing cleanup in fixtures | Code after `await use()` for teardown | Demo 3 |
| Raw `fetch()` in tests | `ApiHelpers` class methods | Demo 5 |

### CORE Framework Quick Reference

```
Context:     Test project location, POM files, infrastructure, view under test
Objective:   What test scenario to validate (one sentence)
Request:     Specific steps — file name, methods, assertions, tags, fixtures
Expectation: Pass criteria, what "done" looks like, performance requirements
```

### Common Pitfalls (Recap)

| Pitfall | How to Avoid |
|---------|-------------|
| Vague prompts produce wrong patterns | Always use CORE structure |
| Copilot invents selectors | Open `selectors.ts` as a tab, use `#file:` in Chat |
| Tests pass locally, fail in CI | Use `waitForResponse`, not `waitForTimeout` |
| Fixture leaks test data | Always clean up after `await use()` |
| Accepting without reviewing | Accept line-by-line with `Tab`, verify types |
| Not using open tabs for context | Open `BasePage.ts`, `selectors.ts`, `test-data.ts` before prompting |
| Copilot suggests old Playwright APIs | Use `@context7` MCP to fetch latest docs |

### Copilot Prompt Engineering Tips for Playwright

1. **Open the right tabs**: Before writing any test, open `BasePage.ts`, the relevant POM, `selectors.ts`, and `test-data.ts`. Copilot's inline suggestions improve dramatically.

2. **Use `#file:` in every Chat prompt**: Reference the POM, fixture, and helper files. This costs nothing and saves multiple prompt iterations.

3. **Start with CORE, iterate with follow-ups**: Write one CORE prompt, review the output, then ask clarifying follow-ups ("Should these tests be serial?", "How to handle the loading spinner?").

4. **Verify with `--repeat-each`**: After Copilot generates a test, run it 3–5 times with `--repeat-each=3` to catch flakiness before merging.

5. **Use traces for complex failures**: When Copilot's fix doesn't resolve a failure, run with `--trace=on` and describe the trace output in Chat.

---

## Hands-On Exercise (Optional — 15 min)

**Task**: Using CORE prompts and the techniques from all 6 demos, write a complete Playwright test for the Explore page text search feature.

### Requirements

1. Create `frontend/e2e/tests/explore/text-search.spec.ts`
2. Use the `explorePage` fixture from `base.fixture.ts`
3. Test EXP-02: Search for "Grand Canyon" and verify results appear
4. Use test data from `helpers/test-data.ts` (`EXPLORE_QUERIES.TEXT_SEARCH`)
5. Follow the CORE prompt pattern from Demo 6

### Step-by-Step

**Step 1**: Write the CORE prompt (don't write any code yet):
```
Context: [Fill in — mention ExplorePage POM, test-data.ts, base.fixture.ts]
Objective: [Fill in — what are you testing?]
Request: [Fill in — file name, steps 1-6, tags, test ID]
Expectation: [Fill in — pass criteria, POM usage, wait strategy]
```

**Step 2**: Paste your CORE prompt into Copilot Chat

**Step 3**: Review the generated test using the checklist:
- [ ] Uses `explorePage` fixture (not raw `page`)
- [ ] Imports from `base.fixture.ts` (not `@playwright/test`)
- [ ] Uses POM methods (`textSearch`, `waitForResults`, `getResultCount`)
- [ ] Uses test data constant (`EXPLORE_QUERIES.TEXT_SEARCH`)
- [ ] Has test ID (`EXP-02:`)
- [ ] Has tag (`@regression`)
- [ ] No `waitForTimeout` calls
- [ ] No hardcoded URLs

**Step 4**: Run the test:
```bash
npx playwright test text-search --project=chromium --headed
```

### Solution

<details>
<summary>Reveal CORE Prompt (try writing your own first!)</summary>

```
Context: Playwright E2E tests for the Road Trip Planner at frontend/e2e/.
The ExplorePage POM at e2e/pages/ExplorePage.ts has: goto(), textSearch(query),
waitForResults(), getResultCount(), getResultName(index), and clearSearch().
Test data at e2e/helpers/test-data.ts has EXPLORE_QUERIES.TEXT_SEARCH = 'Grand Canyon'.
The base fixture at e2e/fixtures/base.fixture.ts provides the explorePage fixture.

Objective: Validate that free-text search on the Explore page returns relevant results.

Request: Create e2e/tests/explore/text-search.spec.ts that:
1. Uses import { test, expect } from '../../fixtures/base.fixture'
2. test.describe('Explore Text Search @regression', () => { ... })
3. Test EXP-02: Navigate via explorePage.goto()
4. Search using explorePage.textSearch(EXPLORE_QUERIES.TEXT_SEARCH)
5. Wait for results: explorePage.waitForResults()
6. Assert getResultCount() > 0
7. Assert first result name contains partial match
8. Test clearing search and re-searching with a different term

Expectation: Passes with npx playwright test text-search --project=chromium.
Uses POM methods only. No raw selectors, no waitForTimeout, no hardcoded URLs.
```
</details>

<details>
<summary>Reveal Solution Code (try generating from CORE prompt first!)</summary>

```typescript
/**
 * EXP-02: Explore Text Search Tests
 *
 * Validates free-text search on the Explore page returns relevant results.
 *
 * Tags: @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 */

import { test, expect } from '../../fixtures/base.fixture';
import { EXPLORE_QUERIES } from '../../helpers/test-data';

test.describe('Explore Text Search @regression', () => {
  test('EXP-02: Text search returns relevant results', async ({ explorePage }) => {
    await explorePage.goto();

    // Search for the text query
    await explorePage.textSearch(EXPLORE_QUERIES.TEXT_SEARCH);
    await explorePage.waitForResults();

    // Assert results are displayed
    const count = await explorePage.getResultCount();
    expect(count).toBeGreaterThan(0);

    // Assert first result is relevant (partial match)
    const firstName = await explorePage.getResultName(0);
    expect(firstName.toLowerCase()).toContain('canyon');
  });

  test('EXP-02b: Clear and re-search', async ({ explorePage }) => {
    await explorePage.goto();

    // First search
    await explorePage.textSearch(EXPLORE_QUERIES.TEXT_SEARCH);
    await explorePage.waitForResults();
    const firstCount = await explorePage.getResultCount();
    expect(firstCount).toBeGreaterThan(0);

    // Clear and search again
    await explorePage.clearSearch();
    await explorePage.textSearch(EXPLORE_QUERIES.POI_SEARCH);
    await explorePage.waitForResults();

    const secondCount = await explorePage.getResultCount();
    expect(secondCount).toBeGreaterThan(0);
  });
});
```
</details>

---

## Resources

- **Workshop Setup**: `docs/workshops/playwright/setup/00-setup-instructions.md`
- **Project Playwright Roadmap**: `docs/PLAYWRIGHT_TESTING_ROADMAP.md` (46 planned tests with CORE prompts)
- **Key Definitions**: `docs/workshops/web-dev/00-key-definitions-best-practices.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices
- **Playwright Locators Guide**: https://playwright.dev/docs/locators
- **Playwright Fixtures Guide**: https://playwright.dev/docs/test-fixtures
- **Playwright Trace Viewer**: https://playwright.dev/docs/trace-viewer-intro
- **Playwright API Testing**: https://playwright.dev/docs/api-testing
- **Copilot Best Practices**: https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot
- **VS Code Prompt Crafting**: https://code.visualstudio.com/docs/copilot/prompt-crafting

---

## Next Workshop Preview

**Workshop 2: Intermediate Playwright Testing with Copilot**
- **Visual regression testing**: `toHaveScreenshot()` with Copilot-generated baselines
- **Network mocking**: `page.route()` to intercept and mock API responses
- **Authentication flows**: Testing Google OAuth with mock tokens
- **Mobile responsive testing**: Multi-project configs for Pixel 5, iPhone 13
- **Chain-of-thought prompting**: Complex multi-step test scenarios
- **Copilot Edits**: Refactoring test suites across multiple files

**Preparation**:
- Review `frontend/playwright.config.ts` — study the 5 browser projects
- Read `frontend/e2e/pages/ItineraryPage.ts` — understand the complex POM
- Read `docs/PLAYWRIGHT_TESTING_ROADMAP.md` — review the ITN and AUTH test specs
- Try running `npm run test:e2e:ui` to explore the Playwright Test UI

---

**Questions?** Continue to Workshop 2 or ask your instructor for clarification.
