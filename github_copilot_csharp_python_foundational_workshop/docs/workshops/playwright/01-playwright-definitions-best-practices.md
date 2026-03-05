# GitHub Copilot: Playwright Testing — Key Definitions & Best Practices

**Last Updated**: March 5, 2026  
**Workshop Series**: Road Trip Planner — GitHub Copilot for Playwright Testers  
**Reference Guide**: Read before attending Playwright workshops  
**Prerequisites**: Familiarity with [00-key-definitions-best-practices.md](00-key-definitions-best-practices.md) (general Copilot concepts)

---

## Table of Contents

1. [Playwright Fundamentals](#playwright-fundamentals)
   - [What is Playwright?](#what-is-playwright)
   - [What is a Page Object Model (POM)?](#what-is-a-page-object-model-pom)
   - [What are Fixtures?](#what-are-fixtures)
   - [What are Locators?](#what-are-locators)
   - [What is Test Isolation?](#what-is-test-isolation)
   - [What is the `@playwright-tester` Agent?](#what-is-the-playwright-tester-agent)
   - [What is the Playwright MCP Server?](#what-is-the-playwright-mcp-server)
2. [Playwright Test for VS Code](#playwright-test-for-vs-code)
   - [Requirements](#1-requirements)
   - [Install Playwright](#2-install-playwright)
   - [Run Tests with a Single Click](#3-run-tests-with-a-single-click)
   - [Run Multiple Tests](#4-run-multiple-tests)
   - [Run Tests in Watch Mode](#5-run-tests-in-watch-mode)
   - [Show Browsers](#6-show-browsers)
   - [Show Trace Viewer](#7-show-trace-viewer)
   - [Pick Locators](#8-pick-locators)
   - [Debug Step-by-Step, Explore Locators](#9-debug-step-by-step-explore-locators)
   - [Tune Locators](#10-tune-locators)
   - [Record New Tests](#11-record-new-tests)
   - [Record at Cursor](#12-record-at-cursor)
3. [CORE Prompting Framework for Playwright](#core-prompting-framework-for-playwright)
4. [Best Practices for AI-Assisted Playwright Testing](#best-practices-for-ai-assisted-playwright-testing)
5. [Common Pitfalls & How to Avoid Them](#common-pitfalls--how-to-avoid-them)
6. [Quick Reference](#quick-reference)
7. [References & Further Reading](#references--further-reading)

---

## Playwright Fundamentals

### What is Playwright?

**Playwright** is an open-source browser automation and end-to-end testing framework developed by Microsoft. It enables reliable, fast, and cross-browser testing for modern web applications with a single TypeScript/JavaScript API.

**Core Capabilities**:
- **Multi-Browser**: Chromium, Firefox, WebKit — desktop and mobile emulation in a single test suite
- **Auto-Wait**: Built-in actionability checks — Playwright waits for elements to be visible, enabled, and stable before interacting
- **Test Isolation**: Every test runs in a fresh browser context (cookies, storage, cache are isolated)
- **TypeScript-First**: Full type safety, IntelliSense, and autocompletion out of the box
- **Parallelism**: Tests run in parallel across worker processes — configurable via `workers` in config
- **Tracing & Debugging**: Built-in Trace Viewer, Playwright Inspector, and VS Code integration for step-by-step debugging
- **Codegen**: Record browser actions and generate test code automatically

**How Playwright Compares**:

| Feature | Playwright | Cypress | Selenium |
|---------|-----------|---------|----------|
| **Multi-browser** | Chromium, Firefox, WebKit | Chromium-only (core), limited Firefox/WebKit | All browsers via WebDriver |
| **Language** | TypeScript, JavaScript, Python, C#, Java | JavaScript/TypeScript only | All major languages |
| **Auto-wait** | Built-in on every action | Built-in | Manual waits required |
| **Test isolation** | Fresh context per test | Clears state between tests | Manual cleanup |
| **Parallelism** | Built-in worker processes | Paid cloud parallelism | Grid/Selenium Grid |
| **Mobile emulation** | Device profiles (Pixel, iPhone) | Viewport-only | Appium required |
| **Trace viewer** | Built-in (screenshots, DOM, network) | Video recording | No built-in |
| **Speed** | Very fast (direct protocol) | Fast (in-browser) | Slower (HTTP protocol) |
| **iframes / tabs** | Full support | Limited | Full support |

**Road Trip Planner E2E Stack**:
```
┌──────────────────────────────────────────────────────────┐
│  Playwright Test Runner (TypeScript)                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ e2e/tests/   ← Test specs (*.spec.ts)              │ │
│  │ e2e/pages/   ← Page Object Models                  │ │
│  │ e2e/fixtures/ ← Custom fixtures (auth, POMs)       │ │
│  │ e2e/helpers/  ← Test data, selectors, API utils    │ │
│  └─────────────────────────────────────────────────────┘ │
│                        │                                  │
│                        ▼                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ http://localhost:5173 — React Frontend              │ │
│  └────────────────────┬────────────────────────────────┘ │
│                       │ /api/*                            │
│                       ▼                                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ http://localhost:3000 — BFF (Node.js/Express)       │ │
│  └──┬──────────┬──────────┬────────────────────────────┘ │
│     │          │          │                               │
│     ▼          ▼          ▼                               │
│  Python     C#         Java                              │
│  :8000      :8081      :8082                             │
│  Auth/Trips AI/Parse   Geo/Search                        │
│                │                                          │
│                ▼                                          │
│  PostgreSQL :5432                                         │
└──────────────────────────────────────────────────────────┘
```

> **Why Playwright for Road Trip Planner?**  
> The app has a complex Mapbox GL map canvas, multi-service API routing through BFF, auth state management, and mobile-responsive views. Playwright's auto-wait handles map tile loading, its API testing capabilities validate BFF health endpoints, and its mobile device emulation tests responsive layouts — all in a single framework.

**Example** — Simplest Playwright Test:
```typescript
import { test, expect } from '@playwright/test';

test('Road Trip app loads and redirects to /explore', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/explore', { timeout: 10_000 });
  expect(page.url()).toContain('/explore');
});
```

> **Reference**: [Playwright Official Documentation](https://playwright.dev/docs/intro) | [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

---

### What is a Page Object Model (POM)?

A **Page Object Model** encapsulates page-specific selectors and actions into reusable classes, keeping test files clean and maintainable. When the UI changes, you update the POM — not every test.

**Pattern**: Each view/component gets a class with:
- **Locators** as properties (defined once in the constructor)
- **Actions** as methods (navigate, click, fill)
- **Assertions** as methods (expectVisible, expectCount)

**Road Trip Planner POMs** (9 total in `frontend/e2e/pages/`):

| POM Class | Route/Component | File |
|-----------|----------------|------|
| `BasePage` | Shared (nav, toast, map, auth) | `e2e/pages/BasePage.ts` |
| `ExplorePage` | `/explore` | `e2e/pages/ExplorePage.ts` |
| `ItineraryPage` | `/itinerary` | `e2e/pages/ItineraryPage.ts` |
| `TripsPage` | `/trips` | `e2e/pages/TripsPage.ts` |
| `StartTripPage` | `/start` | `e2e/pages/StartTripPage.ts` |
| `AllTripsPage` | `/all-trips` | `e2e/pages/AllTripsPage.ts` |
| `Sidebar` | Sidebar component | `e2e/pages/components/Sidebar.ts` |
| `MapComponent` | Map canvas | `e2e/pages/components/MapComponent.ts` |
| `AuthStatus` | Auth badge | `e2e/pages/components/AuthStatus.ts` |

**Real Example — `BasePage.ts`** (shared helpers all POMs use):
```typescript
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly mapCanvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('nav')
      .filter({ has: page.locator('a[href="/explore"]') }).first();
    this.mapCanvas = page.locator('canvas.mapboxgl-canvas').first();
  }

  async navigateTo(path: '/' | '/explore' | '/itinerary' | '/trips' | '/start'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async expectToast(text: string | RegExp): Promise<void> {
    const toastLocator = typeof text === 'string'
      ? this.page.getByText(text)
      : this.page.locator(`text=${text}`);
    await expect(toastLocator).toBeVisible({ timeout: 5_000 });
  }

  async expectMapVisible(): Promise<void> {
    await expect(this.mapCanvas).toBeVisible({ timeout: 10_000 });
  }

  async waitForApiResponse(urlPattern: string | RegExp, timeout = 10_000): Promise<void> {
    await this.page.waitForResponse(
      (response) => typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url()),
      { timeout }
    );
  }
}
```

**Using POM in Tests** (from `sidebar-nav.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';
import { Sidebar } from '../../pages/components/Sidebar';

test.describe('Sidebar Navigation @smoke @navigation', () => {
  let sidebar: Sidebar;

  test.beforeEach(async ({ page }) => {
    sidebar = new Sidebar(page);
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
  });

  test('NAV-01b: Navigate to Itinerary', async ({ page }) => {
    await sidebar.goToItinerary();            // POM method — no raw selectors
    await page.waitForURL('**/itinerary');
    expect(page.url()).toContain('/itinerary');
  });
});
```

**CORE Prompt — Generate a New POM**:
```
Context:     Road Trip Planner, Playwright E2E, frontend/e2e/pages/. Existing POMs
             extend BasePage and define locators in the constructor. The Explore view
             at /explore has a search input (placeholder "Search and Explore"),
             10 category pill buttons, and result cards with "Add to Trip" buttons.
Objective:   Create a Page Object Model for the Explore view.
Requirements: TypeScript class extending BasePage, locators as readonly properties,
             action methods (textSearch, clickCategory, addResultToTrip),
             assertion methods (expectCategoriesVisible, expectResultCount).
             Use getByRole/getByText/getByPlaceholder — avoid CSS selectors.
Examples:    See BasePage.ts for constructor pattern, Sidebar.ts for component POM.
```

> **Reference**: [Playwright Page Object Models](https://playwright.dev/docs/pom) | [BasePage.ts](../../frontend/e2e/pages/BasePage.ts)

---

### What are Fixtures?

**Fixtures** are Playwright's dependency injection mechanism. They provide reusable setup/teardown logic to tests — each fixture is lazily initialized and automatically cleaned up.

**Built-in Fixtures**: `page`, `context`, `browser`, `request`, `browserName`

**Custom Fixtures**: Extend `test` with your own fixtures (POMs, auth state, test data).

**Road Trip Planner Custom Fixtures** (2 files):

**1. `base.fixture.ts` — POM injection** (provides all 6 page objects):
```typescript
import { test as base } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { ExplorePage } from '../pages/ExplorePage';
import { ItineraryPage } from '../pages/ItineraryPage';
import { TripsPage } from '../pages/TripsPage';
import { StartTripPage } from '../pages/StartTripPage';
import { AllTripsPage } from '../pages/AllTripsPage';

type PageFixtures = {
  basePage: BasePage;
  explorePage: ExplorePage;
  itineraryPage: ItineraryPage;
  tripsPage: TripsPage;
  startTripPage: StartTripPage;
  allTripsPage: AllTripsPage;
};

export const test = base.extend<PageFixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  explorePage: async ({ page }, use) => {
    await use(new ExplorePage(page));
  },
  // ... other page fixtures
});

export { expect } from '@playwright/test';
```

**2. `auth.fixture.ts` — Authenticated sessions**:
```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',   // Cached from globalSetup
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

**Using Fixtures in Tests** (no manual instantiation needed):
```typescript
// Import from fixture file — NOT from '@playwright/test'
import { test, expect } from '../fixtures/base.fixture';

test('explore category search', async ({ explorePage }) => {
  // explorePage is auto-created by the fixture
  await explorePage.goto();
  await explorePage.clickCategory('Places to Camp');
  await explorePage.expectResultCount(1);  // at least 1 result
});
```

**Without Fixtures** (verbose, repetitive):
```typescript
import { test, expect } from '@playwright/test';
import { ExplorePage } from '../pages/ExplorePage';

test('explore with manual POM setup', async ({ page }) => {
  const explorePage = new ExplorePage(page);   // Manual — every test!
  await explorePage.goto();
});
```

**CORE Prompt — Create a Custom Fixture**:
```
Context:     Road Trip Planner Playwright E2E suite, frontend/e2e/fixtures/.
             The existing base.fixture.ts extends test with 6 POM fixtures.
             We need an authenticated variant for tests behind login.
Objective:   Create an auth fixture that provides a page with pre-loaded auth state.
Requirements: Extend base fixture (not @playwright/test directly), load storageState
             from e2e/.auth/user.json (cached by global-setup.ts via devLogin()),
             clean up context after use, export both test and expect.
Examples:    See base.fixture.ts for the extend pattern, global-setup.ts for auth flow.
```

> **Reference**: [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures) | [base.fixture.ts](../../frontend/e2e/fixtures/base.fixture.ts)

---

### What are Locators?

**Locators** are Playwright's way of finding elements on the page. They are lazy (resolved at interaction time), auto-wait, and retry-able — making tests resilient to timing issues.

**Locator Priority** (from most to least preferred):

| Priority | Method | Why | Example |
|----------|--------|-----|---------|
| 1 | `getByRole()` | Accessible, semantic, user-facing | `page.getByRole('button', { name: 'Save Trip' })` |
| 2 | `getByText()` | Visible text the user sees | `page.getByText('Places to Camp')` |
| 3 | `getByPlaceholder()` | Form inputs by placeholder | `page.getByPlaceholder('Add a stop (City, Place)...')` |
| 4 | `getByLabel()` | Form inputs by associated label | `page.getByLabel('Trip name')` |
| 5 | `getByTestId()` | Stable `data-testid` attribute | `page.getByTestId('map-canvas')` |
| 6 | CSS/XPath | Last resort — fragile | `page.locator('.mapboxgl-canvas')` |

**Road Trip Planner Selector Strategy** (centralized in `e2e/helpers/selectors.ts`):
```typescript
// ─── Navigation ───────────────────────────────────
export const NAV = {
  sidebar: 'nav[class*="hidden md:flex"]',
  mobileNav: 'nav[class*="md:hidden"]',
  link: (path: string) => `a[href="${path}"]`,
} as const;

// ─── Explore View ─────────────────────────────────
export const EXPLORE = {
  searchInput: 'Search and Explore',           // Used with getByPlaceholder()
  categoryPill: (label: string) => label,       // Used with getByText()
  addToTripButton: 'Add to Trip',               // Used with getByRole('button')
} as const;

// ─── Itinerary / FloatingPanel ────────────────────
export const ITINERARY = {
  tab: (name: 'Itinerary' | 'Vehicle' | 'Directions' | 'Trips') => name,
  stopSearchInput: 'Add a stop (City, Place)...',
  saveTripButton: 'Save Trip',
  calculateRouteButton: 'Calculate Route',
} as const;
```

**Using Locators in Tests** (from `app-loads.spec.ts`):
```typescript
// ✅ CORRECT — Accessible locators
await expect(page.getByText('Places to Camp')).toBeVisible({ timeout: 5_000 });
await expect(page.getByPlaceholder('Add a stop (City, Place)...')).toBeVisible();

// ✅ CORRECT — For elements without accessible roles (Mapbox canvas)
const map = new MapComponent(page);
await map.expectVisible();  // Uses page.locator('canvas.mapboxgl-canvas')

// ❌ WRONG — Fragile CSS selectors directly in test
await expect(page.locator('.css-1abc23 > div:nth-child(3)')).toBeVisible();
```

**Auto-Wait Behavior** — Locators automatically wait for elements to be:
1. **Attached** to the DOM
2. **Visible** on screen
3. **Stable** (not animating)
4. **Enabled** (not disabled)
5. **Receiving events** (not obscured by overlay)

This means you almost never need `page.waitForTimeout()` — Playwright handles timing.

> **Reference**: [Playwright Locators](https://playwright.dev/docs/locators) | [selectors.ts](../../frontend/e2e/helpers/selectors.ts)

---

### What is Test Isolation?

**Test Isolation** ensures each test runs independently — no shared state, cookies, or localStorage between tests. In Playwright, every `test()` gets a fresh `BrowserContext`.

**Road Trip Planner Isolation Strategy**:

| Layer | Mechanism | File |
|-------|-----------|------|
| **Browser state** | Fresh `BrowserContext` per test (Playwright default) | Built-in |
| **Auth pre-seeding** | `globalSetup` runs `devLogin()` once, caches to `.auth/user.json` | `e2e/global-setup.ts` |
| **Test data cleanup** | `globalTeardown` deletes all `E2E_TEST_*` trips after suite | `e2e/global-teardown.ts` |
| **Unique names** | `uniqueTripName()` appends timestamp for parallel safety | `e2e/helpers/test-data.ts` |

**Global Setup** — runs once before all tests:
```typescript
// e2e/global-setup.ts (simplified)
async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Authenticate via devLogin mock endpoint
  await ApiHelpers.devLogin();

  // Save authenticated state for reuse
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
  await browser.close();
}

export default globalSetup;
```

**Global Teardown** — runs once after all tests:
```typescript
// e2e/global-teardown.ts (simplified)
async function globalTeardown() {
  // Delete all trips created during test run
  await ApiHelpers.deleteTestTrips();
}

export default globalTeardown;
```

**Test Data Isolation** — avoid collisions between parallel workers:
```typescript
import { uniqueTripName, TRIP_NAMES } from '../helpers/test-data';

test('save a new trip', async ({ page }) => {
  const tripName = uniqueTripName('Cross Country');
  // → "E2E_TEST_Cross Country_1709654321000" (unique per run)
});
```

**Key Rules**:
- Tests MUST NOT depend on execution order
- Tests MUST NOT share mutable state (trips, stops, auth tokens)
- Each test either creates its own data or uses `globalSetup` cached state
- Cleanup happens in `globalTeardown`, not in individual tests

> **Reference**: [Playwright Test Isolation](https://playwright.dev/docs/browser-contexts) | [global-setup.ts](../../frontend/e2e/global-setup.ts)

---

### What is the `@playwright-tester` Agent?

The **`@playwright-tester`** is a custom GitHub Copilot agent configured specifically for E2E test generation. It uses the **Playwright MCP server** to explore the live website before writing any code.

**Agent Configuration** (`.github/copilot-agents/playwright-tester.agent.md`):
```yaml
---
name: "Playwright Tester Mode"
model: Claude Sonnet 4
tools: ["changes", "codebase", "edit/editFiles", "fetch", "findTestFiles",
        "problems", "runCommands", "runTasks", "runTests", "search",
        "searchResults", "terminalLastCommand", "terminalSelection",
        "testFailure", "playwright"]
---
```

**5 Core Responsibilities**:

| Step | Responsibility | What It Does |
|------|---------------|--------------|
| 1 | **Website Exploration** | Navigate to the site via Playwright MCP, take page snapshots, identify key user flows — **before writing any code** |
| 2 | **Test Improvements** | Use page snapshots to find correct locators when fixing existing tests |
| 3 | **Test Generation** | Write TypeScript Playwright tests based on exploration results |
| 4 | **Test Execution & Refinement** | Run tests, diagnose failures, iterate until all pass |
| 5 | **Documentation** | Summarize functionalities tested and test structure |

**Why Claude Sonnet 4?** — Playwright tests involve complex multi-step reasoning: understanding DOM structure from snapshots, choosing optimal locators, handling async flows, and mapping user journeys. Claude Sonnet 4's superior reasoning handles this better than faster models.

**Example Usage**:
```bash
# Explore first, then generate
@playwright-tester "Navigate to http://localhost:5173/explore, 
take a snapshot, then generate a test for the category pill search flow. 
Use the ExplorePage POM from e2e/pages/ExplorePage.ts."

# Fix a failing test
@playwright-tester "The test NAV-01b is failing because the sidebar 
locator can't find the Itinerary link. Navigate to /explore, take a 
snapshot, and fix the locator in Sidebar.ts."
```

**Workflow — Explore Before You Code**:
```
1. @playwright-tester navigates to http://localhost:5173/explore
2. Takes a DOM snapshot → identifies elements, text, roles
3. Analyzes the snapshot to plan test steps
4. Generates test code using POM patterns from e2e/pages/
5. Runs the test → diagnoses failures → iterates
6. Documents what was tested
```

> **Reference**: [playwright-tester.agent.md](../../../.github/copilot-agents/playwright-tester.agent.md), [Custom Agents](00-key-definitions-best-practices.md#what-are-custom-agents)

---

### What is the Playwright MCP Server?

The **Playwright MCP Server** extends GitHub Copilot's capabilities by providing direct browser automation tools within the chat interface. Instead of guessing DOM structure, the `@playwright-tester` agent can navigate to the live site, take snapshots, and interact with elements.

**Capabilities**:
- **Navigate** to URLs (`navigate_page`, `new_page`)
- **Snapshot** the DOM (`take_snapshot`) — returns a structured representation of all visible elements
- **Click**, **fill**, **hover** elements (`click`, `fill`, `hover`)
- **Take screenshots** (`take_screenshot`) — visual verification
- **Wait for** selectors, network, navigation (`wait_for`)
- **Evaluate JavaScript** (`evaluate_script`) in page context

**Without Playwright MCP**:
```
Developer: "Generate a test for the Explore view category pills"
Copilot: *Guesses element structure based on training data*
         *May use wrong selectors, wrong text, wrong hierarchy*
```

**With Playwright MCP** (via `@playwright-tester`):
```
Developer: "@playwright-tester Generate a test for the Explore view category pills"
Agent:
  1. Navigates to http://localhost:5173/explore
  2. Takes snapshot → sees: <button>Places to Camp</button>, <button>Parks & Nature</button>...
  3. Generates test with EXACT locators from the live DOM:
     await expect(page.getByRole('button', { name: 'Places to Camp' })).toBeVisible();
```

**When to Use Playwright MCP**:
- ✅ Writing tests for unfamiliar views (agent explores first)
- ✅ Fixing broken locators after UI changes
- ✅ Verifying element structure before choosing a locator strategy
- ✅ Generating tests for complex flows (multi-step, cross-view)
- ❌ Simple test patterns where DOM structure is well-known
- ❌ API-only tests (use `request` fixture instead)

> **Reference**: [Using MCP with Copilot](https://docs.github.com/en/copilot/customizing-copilot/extending-the-functionality-of-github-copilot-in-vs-code-with-mcp) | [Playwright MCP](https://github.com/mcp)

---

## Playwright Test for VS Code

The **Playwright Test for VS Code** extension transforms your editor into a full E2E testing workbench — run, debug, record, and explore tests without leaving VS Code.

> **Extension ID**: `ms-playwright.playwright`  
> **Marketplace**: [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

---

### 1. Requirements

Before using Playwright with the Road Trip Planner, ensure:

**System Requirements**:

| Requirement | Minimum | Road Trip Planner |
|-------------|---------|-------------------|
| **Node.js** | 18+ | 18 LTS or 20 LTS |
| **VS Code** | 1.86+ | Latest stable |
| **Playwright Test Extension** | Latest | `ms-playwright.playwright` |
| **Operating System** | macOS 12+, Windows 10+, Ubuntu 20.04+ | macOS / Linux recommended |
| **Docker** | 20+ (for full stack) | Docker Desktop with Compose v2 |

**Project-Specific Requirements**:

| Requirement | Purpose |
|-------------|---------|
| Docker Compose stack running | Tests target `localhost:5173` (frontend) and `localhost:3000` (BFF) |
| Playwright browsers installed | `npx playwright install` downloads Chromium, Firefox, WebKit |
| Environment variables | `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_BFF_URL` (optional overrides) |

**Quick Verification**:
```bash
# Check Node.js version
node --version    # Expected: v18.x or v20.x

# Check Docker
docker compose version   # Expected: v2.x

# Start full stack
docker compose -f docker-compose.dev.yml up -d

# Verify frontend is accessible
curl -s http://localhost:5173 | head -1    # Should return HTML

# Verify BFF is healthy
curl -s http://localhost:3000/health | jq   # Should return JSON health status
```

**CORE Prompt — Verify Environment**:
```
Context:     Road Trip Planner project, Docker Compose dev stack, Playwright E2E
             tests at frontend/e2e/. Frontend runs on localhost:5173, BFF on localhost:3000.
Objective:   Generate a shell script that verifies all prerequisites for running 
             Playwright E2E tests.
Requirements: Check Node.js 18+, Docker running, docker compose stack healthy
             (all 6 services), frontend responding, BFF /health endpoint OK,
             Playwright browsers installed. Print clear pass/fail for each check.
Examples:    See docker-compose.dev.yml for service names, playwright.config.ts
             for Playwright-specific settings.
```

> **Reference**: [Playwright Getting Started](https://playwright.dev/docs/intro) | [Workshop Setup Instructions](setup/00-setup-instructions.md)

---

### 2. Install Playwright

**First-Time Setup** (new project from scratch):
```bash
# Initialize Playwright in a new project
npm init playwright@latest

# Playwright will ask:
#   ✔ Where to put tests?     → e2e/tests
#   ✔ Add GitHub Actions?     → Yes
#   ✔ Install browsers?       → Yes
```

**Existing Project Setup** (Road Trip Planner already configured):
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (Playwright is in package.json)
npm install

# Install browser binaries (Chromium, Firefox, WebKit)
npx playwright install

# Optional: Install only specific browsers
npx playwright install chromium
npx playwright install --with-deps    # Includes system dependencies (Linux CI)
```

**What Gets Installed**:

| Item | Location | Purpose |
|------|----------|---------|
| `@playwright/test` | `node_modules/` | Test runner, assertions, API |
| Browser binaries | `~/Library/Caches/ms-playwright/` (macOS) | Chromium, Firefox, WebKit engines |
| `playwright.config.ts` | `frontend/` | Test configuration (already exists) |
| `e2e/` directory | `frontend/e2e/` | Test files, POMs, fixtures (already exists) |

**Road Trip Planner Configuration** (`frontend/playwright.config.ts` — key settings):
```typescript
import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './e2e/test-results',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
  },

  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

**VS Code Extension Installation**:
1. Open VS Code → Extensions panel (`Cmd+Shift+X`)
2. Search "Playwright Test for VS Code"
3. Install `ms-playwright.playwright`
4. The Testing sidebar icon (flask) appears — click to see discovered tests

**CORE Prompt — Set Up Playwright**:
```
Context:     Road Trip Planner frontend (React + TypeScript + Vite), tests target
             Docker Compose stack at localhost:5173. The frontend/playwright.config.ts
             already exists with 5 browser projects and global setup/teardown.
Objective:   Install Playwright and verify the setup works end-to-end.
Requirements: Install @playwright/test, install browser binaries, run the existing
             smoke tests to verify connectivity to the Docker stack, generate
             an HTML report of results.
Examples:    See frontend/package.json for scripts: test:e2e, test:e2e:smoke.
```

> **Reference**: [Playwright Installation](https://playwright.dev/docs/intro#installing-playwright) | [playwright.config.ts](../../frontend/playwright.config.ts)

---

### 3. Run Tests with a Single Click

The Playwright VS Code extension adds green **play buttons** (▶) to every test in the editor and the Test Explorer sidebar.

**Three Ways to Run a Single Test**:

| Method | How | When |
|--------|-----|------|
| **Editor gutter** | Click the green ▶ next to `test(...)` in the editor | Fastest — run the test you're looking at |
| **Test Explorer** | Click ▶ next to any test name in the Testing sidebar | Browse and pick from the full test tree |
| **Right-click menu** | Right-click a test → "Run Test" | Access additional options (debug, reveal) |

**Run from the Editor** — Step by step:
1. Open a test file (e.g., `frontend/e2e/tests/smoke/app-loads.spec.ts`)
2. See green ▶ icons in the gutter next to each `test()` call
3. Click ▶ next to `SM-01: App loads and redirects root to /explore`
4. Test runs → result icon appears (✓ green check or ✗ red X)
5. Click the result icon to see the output

**Run a Single Test from Test Explorer**:
1. Click the Testing icon (flask) in the Activity Bar
2. Expand the test tree: `app-loads.spec.ts` → `Smoke Tests @smoke`
3. Click ▶ next to `SM-01: App loads and redirects root to /explore`
4. Result appears inline with duration

**Using `test.only()` for Focus**:
```typescript
// Temporarily focus on ONE test (remove before committing!)
test.only('SM-01: App loads and redirects root to /explore', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/explore', { timeout: 10_000 });
  expect(page.url()).toContain('/explore');
});
```

> **Warning**: `forbidOnly: CI` in `playwright.config.ts` prevents `test.only()` from passing in CI — you'll get a build failure if you forget to remove it.

**CORE Prompt — Run a Focused Test**:
```
Context:     Road Trip Planner, Playwright in VS Code, frontend/e2e/tests/smoke/.
             I have 8 smoke tests (SM-01 through SM-08) in app-loads.spec.ts.
Objective:   Run only the SM-04 BFF health endpoint test in isolation.
Requirements: Use test.only() or the VS Code gutter button. Show the test output
             and explain how to verify the result. Remind me to remove test.only()
             before committing (forbidOnly is enabled in config).
Examples:    SM-04 uses the { request } fixture and calls localhost:3000/health.
```

> **Reference**: [Playwright Running Tests](https://playwright.dev/docs/running-tests) | [VS Code Extension — Running Tests](https://playwright.dev/docs/getting-started-vscode#running-tests)

---

### 4. Run Multiple Tests

**Run Entire Suite** — all tests across all projects:
```bash
# From frontend/ directory
npx playwright test                    # All tests, all browsers
npm run test:e2e                       # Same via npm script
```

**Filter by Tag** — use `--grep` to run subsets:
```bash
npx playwright test --grep @smoke            # Smoke tests only
npx playwright test --grep @regression       # Regression tests
npx playwright test --grep @navigation       # Navigation tests
npx playwright test --grep-invert @slow      # Skip slow tests

# npm script shortcut
npm run test:e2e:smoke                       # Same as --grep @smoke
```

**Filter by File or Directory**:
```bash
npx playwright test smoke/                   # All tests in smoke/ folder
npx playwright test app-loads                # Match filename pattern
npx playwright test sidebar-nav.spec.ts      # Specific file
```

**Filter by Browser Project**:
```bash
npx playwright test --project=chromium        # Chromium only
npx playwright test --project=mobile-chrome   # Mobile only
npm run test:e2e:chromium                     # npm script shortcut
```

**Combine Filters**:
```bash
# Smoke tests on Chromium only
npx playwright test --grep @smoke --project=chromium

# Navigation tests on mobile
npx playwright test --grep @navigation --project=mobile-chrome --project=mobile-safari
```

**Road Trip Planner npm Scripts** (from `frontend/package.json`):

| Script | Command | Purpose |
|--------|---------|---------|
| `test:e2e` | `playwright test` | Run all tests |
| `test:e2e:ui` | `playwright test --ui` | Interactive UI mode |
| `test:e2e:headed` | `playwright test --headed` | Show browser windows |
| `test:e2e:debug` | `playwright test --debug` | Debug mode with Inspector |
| `test:e2e:report` | `playwright show-report playwright-report` | Open last HTML report |
| `test:e2e:smoke` | `playwright test --grep @smoke` | Smoke tests only |
| `test:e2e:chromium` | `playwright test --project=chromium` | Chromium project only |

**VS Code Test Explorer — Run Multiple Tests**:
1. Click Testing icon (flask) in Activity Bar
2. Click ▶ at the top level to run ALL tests
3. Or click ▶ next to a `test.describe` block to run all tests in that group
4. Use checkboxes to select specific tests, then "Run Selected"
5. Filter by tag using the search/filter input at the top

**Tag Convention** (from `PLAYWRIGHT_TESTING_ROADMAP.md`):

| Tag | Purpose | When to Run |
|-----|---------|-------------|
| `@smoke` | Core functionality works | Every PR, pre-deploy |
| `@regression` | Full feature verification | Nightly, pre-release |
| `@auth` | Authentication-dependent tests | After auth changes |
| `@slow` | Tests >10s (API-heavy, AI features) | Nightly only |
| `@mobile` | Mobile-responsive tests | Before mobile releases |

**CORE Prompt — Set Up Test Tags**:
```
Context:     Road Trip Planner Playwright E2E tests, frontend/e2e/tests/.
             We use tag annotations in test.describe() names: @smoke, @regression, etc.
             playwright.config.ts has forbidOnly and grep support.
Objective:   Create a script that runs tests in stages: smoke first, then regression
             if smoke passes.
Requirements: Shell script, exit early if smoke fails (exit code 1), use --grep for
             filtering, generate separate reports for each stage, support CI mode
             (2 retries, JUnit output).
Examples:    See npm scripts in package.json: test:e2e:smoke uses --grep @smoke.
```

> **Reference**: [Playwright Test CLI](https://playwright.dev/docs/test-cli) | [Playwright Annotations](https://playwright.dev/docs/test-annotations)

---

### 5. Run Tests in Watch Mode

**Interactive UI Mode** — the most powerful way to develop tests:
```bash
npx playwright test --ui
# or
npm run test:e2e:ui
```

**What UI Mode Provides**:
- **Live test tree** — browse and run individual tests with one click
- **Watch mode** — re-runs tests automatically when files change
- **DOM snapshot** — see the page state at each test step
- **Network log** — inspect all API requests/responses
- **Timeline** — step through test execution visually
- **Source code** — see which line is executing
- **Locator picker** — click elements to generate locator code

**Using UI Mode** — Step by step:
1. Run `npm run test:e2e:ui` from the `frontend/` directory
2. A browser window opens with the Playwright UI
3. Left panel: test file tree (expand to see individual tests)
4. Click ▶ on any test to run it
5. Right panel: shows DOM snapshots for each step
6. Click a step → see the page state, highlighted elements
7. Toggle "Watch" mode (eye icon) → tests auto-rerun on file save

**Watch Mode** (CLI alternative):
```bash
# Not a built-in flag, but achievable with:
npx playwright test --ui    # Built-in watch in UI mode

# Or use a file watcher
npx chokidar 'e2e/**/*.ts' -c 'npx playwright test --project=chromium'
```

**When to Use Each Mode**:

| Mode | Use Case | Command |
|------|----------|---------|
| **UI mode** | Developing new tests, exploring failures | `--ui` |
| **Headed** | Quick visual check of test behavior | `--headed` |
| **Headless** | CI, full suite run, fast execution | (default) |
| **Debug** | Step-by-step with Inspector | `--debug` |

**CORE Prompt — Debug with UI Mode**:
```
Context:     Road Trip Planner, Playwright UI mode (--ui), the smoke test SM-03
             "Map canvas renders" intermittently fails. The map uses Mapbox GL
             and loads tiles asynchronously.
Objective:   Use Playwright UI mode to investigate why the map canvas locator
             sometimes fails to find canvas.mapboxgl-canvas.
Requirements: Open UI mode, run SM-03 on chromium, examine the DOM snapshot at
             the point of failure, check if the canvas element exists but isn't
             visible yet, suggest a more robust locator or wait strategy.
Examples:    MapComponent POM uses page.locator('canvas.mapboxgl-canvas').first()
             with a 10_000ms visibility timeout.
```

> **Reference**: [Playwright UI Mode](https://playwright.dev/docs/test-ui-mode) | [VS Code Extension — Watch Mode](https://playwright.dev/docs/getting-started-vscode)

---

### 6. Show Browsers

**Headed Mode** runs tests with visible browser windows — you can watch the test interact with your app in real time.

**How to Enable**:
```bash
# CLI
npx playwright test --headed
npm run test:e2e:headed

# Config override (playwright.config.ts)
use: {
  headless: false,   // Show browser for ALL tests
}
```

**VS Code Extension** — Show browser for a single test:
1. Open Test Explorer (flask icon)
2. Click the **eye icon** (👁 "Show Browser") in the toolbar
3. Run any test — a browser window opens showing the interaction
4. Toggle off to return to headless mode

**When to Use Headed Mode**:
- ✅ Debugging visual issues (map not rendering, layout broken)
- ✅ Verifying animations and transitions
- ✅ Demonstrating test behavior to stakeholders
- ✅ Recording screen captures for documentation
- ❌ CI pipelines (no GUI available, use screenshots/traces instead)
- ❌ Full suite runs (slower than headless)

**Slow Motion** — add delay between actions to observe step-by-step:
```typescript
// playwright.config.ts
use: {
  headless: false,
  launchOptions: {
    slowMo: 500,   // 500ms delay between each action
  },
}
```

**Road Trip Planner Example** — Watching a navigation flow:
```bash
# Run navigation tests with browser visible and slow motion
npx playwright test sidebar-nav --headed --project=chromium

# You'll see:
# 1. Browser opens → navigates to localhost:5173/explore
# 2. Sidebar link "Itinerary" gets clicked (highlighted briefly)
# 3. Page transitions to /itinerary
# 4. FloatingPanel with stop search input appears
# 5. Test passes → browser closes
```

> **Reference**: [Playwright Headed Mode](https://playwright.dev/docs/running-tests#run-tests-in-headed-mode) | [VS Code Extension — Show Browser](https://playwright.dev/docs/getting-started-vscode#show-browsers)

---

### 7. Show Trace Viewer

The **Trace Viewer** is Playwright's most powerful debugging tool — a GUI that shows exactly what happened during a test, step by step: screenshots, DOM snapshots, network requests, console logs, and source code.

**How Traces Are Collected** (from `playwright.config.ts`):
```typescript
use: {
  trace: 'on-first-retry',       // Collect trace when a test is retried
  screenshot: 'only-on-failure',  // Screenshot on failure too
  video: 'on-first-retry',       // Video recording on retry
}
```

**Trace Collection Options**:

| Setting | When Traced | Use Case |
|---------|------------|----------|
| `'off'` | Never | Production CI (fastest) |
| `'on'` | Every test | Deep debugging (slowest) |
| `'on-first-retry'` | Only on retry | **Recommended** — captures failures |
| `'retain-on-failure'` | Failed tests only | Good balance |
| `'retain-on-first-failure'` | First failure of each test | Minimal overhead |

**Viewing a Trace**:

```bash
# After a test fails and retry captures the trace:
npx playwright show-trace e2e/test-results/SM-04-BFF-health-chromium-retry1/trace.zip

# Or open the HTML report (includes trace links):
npx playwright show-report playwright-report
npm run test:e2e:report    # npm script shortcut
```

**Trace Viewer Panels**:

| Panel | Shows | Example for Road Trip Planner |
|-------|-------|-------------------------------|
| **Timeline** | Visual timeline of all test steps | Navigation: goto → click → waitForURL |
| **Actions** | Each Playwright action with before/after DOM | `page.goto('/explore')` → DOM snapshot |
| **Screenshots** | Before/after screenshot per action | Map canvas state at each step |
| **Network** | All HTTP requests/responses | `GET /health` → 200, `GET /api/search?q=camp` → results |
| **Console** | Browser console.log/error messages | JavaScript errors, Mapbox warnings |
| **Source** | Test source code with line highlighting | Shows which `expect()` assertion failed |
| **Call** | Stack trace for each action | Where in the POM the locator was called |

**Trace Viewer from VS Code**:
1. Run a test that fails (or force trace with `trace: 'on'`)
2. Click the red ✗ result icon in the gutter or Test Explorer
3. Select "Show Trace" from the context menu
4. Trace Viewer opens in a new VS Code tab

**CORE Prompt — Investigate a Failure with Trace Viewer**:
```
Context:     Road Trip Planner, Playwright E2E. The SM-04 BFF health test
             failed in CI with "Request failed: connect ECONNREFUSED localhost:3000".
             A trace.zip was captured from the retry.
Objective:   Analyze the trace to determine why the BFF was unreachable during the test.
Requirements: Open the trace, examine the Network panel for the GET /health request,
             check the Timeline for when the request was made relative to test start,
             look at Console for any container startup errors. Suggest a fix — likely
             the BFF wasn't ready when tests started (missing health check wait in
             global-setup.ts).
Examples:    The global-setup.ts calls devLogin() which hits the BFF. If it fails,
             tests start without auth state and BFF may still be starting.
```

> **Reference**: [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) | [VS Code Trace Integration](https://playwright.dev/docs/getting-started-vscode#trace-viewer)

---

### 8. Pick Locators

**Pick Locator** lets you interactively select an element on the live page and generates the optimal Playwright locator for it.

**From VS Code** (recommended):
1. Open Test Explorer → click "Pick Locator" button in the toolbar
2. A browser window opens with your app loaded
3. Hover over any element — see the generated locator in real-time
4. Click to copy the locator to your clipboard
5. Paste into your test or POM file

**From Codegen** (alternative):
```bash
npx playwright codegen http://localhost:5173/explore
# Browser opens with the Codegen toolbar
# Click "Pick Locator" button in the toolbar
# Hover and click elements to see suggested locators
```

**Locator Generation Priority** — Playwright generates locators in this preference order:
1. `getByRole('button', { name: 'Save Trip' })` — roles with accessible names
2. `getByText('Places to Camp')` — unique visible text
3. `getByPlaceholder('Add a stop (City, Place)...')` — placeholders
4. `getByLabel('Trip name')` — form labels
5. `getByTestId('map-canvas')` — data-testid attribute
6. `locator('#element-id')` — CSS ID (last resort)

**Road Trip Planner Example** — Picking locators for the Explore view:

| Element | Pick Locator Result | Selector Strategy |
|---------|-------------------|-------------------|
| "Places to Camp" pill | `getByRole('button', { name: 'Places to Camp' })` | Role + name |
| Search input | `getByPlaceholder('Search and Explore')` | Placeholder text |
| Sidebar Itinerary link | `getByRole('link', { name: 'Itinerary' })` | Role + name |
| Map canvas | `locator('canvas.mapboxgl-canvas')` | CSS (no role/testid) |
| "Add to Trip" button | `getByRole('button', { name: 'Add to Trip' })` | Role + name |
| Toast notification | `getByText('Added to trip!')` | Visible text |

**From Picked Locators to selectors.ts** — after picking, add to your centralized selectors:
```typescript
// e2e/helpers/selectors.ts
export const EXPLORE = {
  searchInput: 'Search and Explore',       // → getByPlaceholder(EXPLORE.searchInput)
  categoryPill: (label: string) => label,  // → getByRole('button', { name: EXPLORE.categoryPill('Places to Camp') })
  addToTripButton: 'Add to Trip',          // → getByRole('button', { name: EXPLORE.addToTripButton })
} as const;
```

**CORE Prompt — Pick and Organize Locators**:
```
Context:     Road Trip Planner, Playwright E2E. The Itinerary view at /itinerary
             has a FloatingPanel with 4 tabs (Itinerary, Vehicle, Directions, Trips),
             a stop search input, Calculate Route button, and Save Trip button.
             Selectors are centralized in e2e/helpers/selectors.ts.
Objective:   Pick appropriate locators for all interactive elements on the Itinerary view
             and add them to the ITINERARY section of selectors.ts.
Requirements: Use getByRole/getByText/getByPlaceholder as primary strategies.
             Only use CSS for elements without accessible roles (map canvas, markers).
             Follow the existing ITINERARY selector pattern in selectors.ts.
Examples:    See EXPLORE selectors for the pattern — string values used with getByText/
             getByPlaceholder, CSS only for structural elements like result cards.
```

> **Reference**: [Playwright Pick Locator](https://playwright.dev/docs/getting-started-vscode#pick-locators) | [selectors.ts](../../frontend/e2e/helpers/selectors.ts)

---

### 9. Debug Step-by-Step, Explore Locators

**Playwright Inspector** is a dedicated debugging UI that lets you step through test execution one action at a time, inspect the DOM, and evaluate locators live.

**Three Ways to Launch Debug Mode**:

```bash
# 1. CLI flag
npx playwright test --debug
npm run test:e2e:debug

# 2. Debug a specific test
npx playwright test app-loads --debug

# 3. In test code (programmatic breakpoint)
await page.pause();   // Opens Inspector at this exact line
```

**VS Code Debugger Integration**:
1. Open a test file
2. Set a breakpoint (click the gutter, or add `await page.pause()`)
3. Right-click the test → "Debug Test" (or click the debug icon in Test Explorer)
4. VS Code debugger + Playwright Inspector both launch
5. Step through code in VS Code while seeing browser state in Inspector

**Playwright Inspector Features**:

| Feature | How | Purpose |
|---------|-----|---------|
| **Step Over** | Click "Step Over" or press `F10` | Execute next action, see result |
| **Resume** | Click "Resume" or press `F8` | Run to next breakpoint or end |
| **Locator input** | Type locator in the explore bar | Test if a locator finds the desired element |
| **Highlight** | Type locator → element highlights on page | Visual confirmation before adding to code |
| **Pick Locator** | Click Pick Locator → click element | Generate locator from live element |
| **Console** | Open DevTools alongside Inspector | Evaluate JavaScript, inspect storage |

**Debugging a Failing Navigation Test** — walkthrough:
```typescript
// sidebar-nav.spec.ts
test('NAV-01b: Navigate to Itinerary', async ({ page }) => {
  const sidebar = new Sidebar(page);
  await page.goto('/explore', { waitUntil: 'domcontentloaded' });

  await page.pause();  // <-- Inspector opens HERE

  await sidebar.goToItinerary();       // Step Over to see click
  await page.waitForURL('**/itinerary'); // Step Over to see URL change
  expect(page.url()).toContain('/itinerary');
});
```

Debug steps:
1. Inspector opens at `page.pause()`
2. In the Locator explore bar, type: `getByRole('link', { name: 'Itinerary' })` → element highlights
3. Click "Step Over" → `sidebar.goToItinerary()` executes → browser navigates
4. Step Over again → `waitForURL` succeeds, URL bar shows `/itinerary`
5. Step Over → assertion passes → test completes

**Exploring Locators Live** — test locators without modifying code:
```
Type in Inspector's Locator bar:
  getByText('Places to Camp')         → highlights category pill
  getByRole('button', { name: /Camp/ }) → highlights same pill (regex match)
  locator('.mapboxgl-canvas')         → highlights the map canvas
  getByPlaceholder('Search')          → highlights search input (partial match!)
```

> **Tip**: Locator exploration in Inspector is the fastest way to verify a locator works before adding it to a POM. You can also check `count` — if it returns more than 1, your locator is ambiguous.

**CORE Prompt — Debug a Flaky Test**:
```
Context:     Road Trip Planner, Playwright E2E. Test SM-06 "Explore view renders
             category pills" fails intermittently — getByText('Places to Camp')
             times out about 20% of the time on CI.
Objective:   Debug the flaky test step-by-step to find the root cause.
Requirements: Add page.pause() before the flaky assertion, run in debug mode (--debug),
             use the Playwright Inspector to check if the element exists (but isn't
             visible yet, behind a loading skeleton, etc.). Examine timing — is the
             category pill loaded asynchronously? Should we wait for a network response
             before asserting visibility?
Examples:    The Explore view loads categories from a static list but renders them
             after the map component initializes. See ExploreView.tsx for render order.
```

> **Reference**: [Playwright Debug Tests](https://playwright.dev/docs/debug) | [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector) | [VS Code Debugging](https://playwright.dev/docs/getting-started-vscode#debugging-tests)

---

### 10. Tune Locators

**Tuning locators** means refining them to be more resilient, specific, and maintainable. A "good" locator survives UI redesigns; a "bad" locator breaks when someone changes a CSS class.

**From Fragile to Resilient** — locator evolution:

```typescript
// ❌ LEVEL 0: Fragile CSS selector (breaks on any style change)
page.locator('.css-1x2y3z > div:nth-child(2) > button')

// ⚠️ LEVEL 1: CSS class name (better, but still fragile)
page.locator('button.category-pill')

// ✅ LEVEL 2: Text content (resilient to styling)
page.getByText('Places to Camp')

// ✅ LEVEL 3: Role + name (most resilient, accessible)
page.getByRole('button', { name: 'Places to Camp' })
```

**Tuning Techniques**:

**1. Use `filter()` for disambiguation**:
```typescript
// Problem: Multiple buttons with text "Add to Trip" (one per search result)
page.getByRole('button', { name: 'Add to Trip' })  // ← Matches multiple!

// Solution: Filter to the first result card, THEN find the button
page.locator('[class*="border rounded-xl"]')        // Result card container
  .first()                                           // First result only
  .getByRole('button', { name: 'Add to Trip' });    // Button within that card
```

**2. Use `first()` / `nth()` carefully**:
```typescript
// ✅ OK — selector is inherently multiple (map markers)
const firstMarker = page.locator('.mapboxgl-marker').first();
const thirdMarker = page.locator('.mapboxgl-marker').nth(2);

// ❌ AVOID — using nth() on semantic elements (order may change)
page.getByRole('button').nth(3);  // What button is index 3??

// ✅ BETTER — use name to identify
page.getByRole('button', { name: 'Calculate Route' });
```

**3. Use `has()` and `hasText()` for structural matching**:
```typescript
// Find a sidebar nav link that contains an Itinerary icon AND text
page.locator('nav')
  .filter({ has: page.locator('a[href="/itinerary"]') })
  .first();

// Find a trip card that contains specific text
page.locator('[class*="border rounded-xl"]')
  .filter({ hasText: 'Cross Country Trip' });
```

**4. Use `exact` option for text matching**:
```typescript
// Problem: getByText('Trip') matches "My Trips", "Trip Planner", "Start a Trip"
page.getByText('Trip');                          // ← Ambiguous!

// Solution: Exact match
page.getByText('My Trips', { exact: true });     // ← Only "My Trips"

// Or use regex for pattern matching
page.getByText(/^My Trips$/);                    // ← Only exact "My Trips"
```

**5. Real Example — Tuning the Sidebar Locator** (from `BasePage.ts`):
```typescript
// Original attempt — too broad
this.sidebar = page.locator('nav');  // Multiple nav elements (desktop + mobile)!

// Tuned — filter to desktop sidebar only
this.sidebar = page.locator('nav')
  .filter({ has: page.locator('a[href="/explore"]') })
  .first();
// Rationale: Desktop sidebar always contains the Explore link; .first() 
// disambiguates from mobile bottom nav.
```

**`data-testid` as Fallback** — when no accessible locator works:
```typescript
// For Mapbox canvas — no role, no text, no placeholder
// Add to React component:
<canvas data-testid="map-canvas" className="mapboxgl-canvas" />

// Use in test:
page.getByTestId('map-canvas');
```

**Recommended `data-testid` Attributes** (from `PLAYWRIGHT_TESTING_ROADMAP.md`):

| Element | Suggested `data-testid` | Why Needed |
|---------|------------------------|------------|
| Map canvas | `map-canvas` | Canvas has no accessible role |
| Toast container | `toast-container` | Dynamic, generated class names |
| Loading spinner | `loading-spinner` | SVG without text |
| Route line | `route-line` | Mapbox layer, not standard DOM |

**CORE Prompt — Tune a Fragile Locator**:
```
Context:     Road Trip Planner, Playwright E2E. The MapComponent POM uses
             page.locator('canvas.mapboxgl-canvas').first() to find the map.
             This CSS selector depends on the Mapbox GL library's internal class name.
Objective:   Tune the map locator to be more resilient to Mapbox version upgrades.
Requirements: Consider adding a data-testid="map-canvas" to the React MapComponent,
             then using page.getByTestId('map-canvas'). Update both the React
             component (src/components/MapComponent.tsx) and the Playwright POM
             (e2e/pages/components/MapComponent.ts). Keep the CSS fallback for
             backward compatibility.
Examples:    The existing selectors.ts has MAP.canvas: 'canvas.mapboxgl-canvas'.
             The React component renders via react-map-gl <Map> component.
```

> **Reference**: [Playwright Locators — Best Practices](https://playwright.dev/docs/locators#locating-elements) | [Playwright Locator Strictness](https://playwright.dev/docs/locators#strictness)

---

### 11. Record New Tests

**Codegen** (Code Generator) records your browser interactions and generates Playwright test code automatically. This is the fastest way to bootstrap a new test.

**Launch Codegen**:
```bash
# Record against the Road Trip Planner
npx playwright codegen http://localhost:5173

# Record with specific device emulation
npx playwright codegen --device="iPhone 13" http://localhost:5173

# Record with saved auth state
npx playwright codegen --load-storage=e2e/.auth/user.json http://localhost:5173
```

**Codegen Toolbar** (appears at top of browser):

| Button | Action |
|--------|--------|
| **Record** (red circle) | Start/stop recording actions |
| **Pick Locator** | Click element → copy optimal locator |
| **Assert Visibility** | Click element → generate `expect().toBeVisible()` |
| **Assert Text** | Click element → generate `expect().toHaveText()` |
| **Assert Value** | Click input → generate `expect().toHaveValue()` |

**Recording a New Test** — Step by step:

1. Start Docker Compose stack: `docker compose -f docker-compose.dev.yml up -d`
2. Run: `npx playwright codegen http://localhost:5173`
3. Browser + Codegen panel open side-by-side
4. **Perform actions** in the browser:
   - Click "Itinerary" in sidebar → codegen records `page.getByRole('link', { name: 'Itinerary' }).click()`
   - Type in search → codegen records `page.getByPlaceholder('Add a stop...').fill('Denver')`
   - Click a button → codegen records `page.getByRole('button', { name: 'Calculate Route' }).click()`
5. **Add assertions** using toolbar buttons (Assert Visibility, Assert Text)
6. Copy generated code from the Codegen panel
7. Paste into a new `.spec.ts` file and refactor to use POMs

**Example — Recording an Itinerary Flow**:

Codegen generates (raw):
```typescript
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Itinerary' }).click();
  await page.getByPlaceholder('Add a stop (City, Place)...').fill('Denver, CO');
  await page.getByPlaceholder('Add a stop (City, Place)...').press('Enter');
  // ... more recorded steps
});
```

Refactored to use POM:
```typescript
import { test, expect } from '../fixtures/base.fixture';

test('ITN-01: Add a stop via search @regression', async ({ itineraryPage, page }) => {
  await itineraryPage.goto();
  await itineraryPage.searchStop('Denver, CO');
  await itineraryPage.expectStopCount(1);
});
```

> **Key Rule**: Codegen output is a **starting point** — always refactor to use POMs, imports from `base.fixture`, and proper test IDs.

**CORE Prompt — Record and Refactor**:
```
Context:     Road Trip Planner, Playwright E2E at frontend/e2e/. We use POMs in
             e2e/pages/ and fixtures in e2e/fixtures/base.fixture.ts. The codegen
             tool generates raw tests with inline locators.
Objective:   Record a test for the Explore → search → Add to Trip → check Itinerary
             flow, then refactor the recorded output to use POM patterns.
Requirements: Use codegen to capture the flow (npx playwright codegen localhost:5173),
             then replace inline locators with ExplorePage and ItineraryPage POM
             methods, import from base.fixture instead of @playwright/test, add
             proper test ID (EXP-03), @regression tag, and JSDoc header.
Examples:    See app-loads.spec.ts for the test header pattern (JSDoc with test ID,
             tags, prerequisites). See sidebar-nav.spec.ts for POM usage pattern.
```

> **Reference**: [Playwright Codegen](https://playwright.dev/docs/codegen-intro) | [VS Code Extension — Record Tests](https://playwright.dev/docs/getting-started-vscode#record-new-tests)

---

### 12. Record at Cursor

**Record at Cursor** inserts recorded browser actions at your current cursor position in an existing test file — perfect for extending tests without starting from scratch.

**How It Works** (VS Code only):

1. Open an existing test file (e.g., `app-loads.spec.ts`)
2. Place your cursor where you want to insert new actions:
   ```typescript
   test('SM-08: Start Trip view renders all options', async ({ page }) => {
     await page.goto('/start', { waitUntil: 'domcontentloaded' });
     
     await expect(page.getByText('Start a Trip')).toBeVisible();
     // CURSOR HERE — want to add more assertions
   });
   ```
3. Open Command Palette (`Cmd+Shift+P`) → "Playwright: Record at Cursor"
4. A browser window opens at the current page/URL
5. Click elements, type text, assert — each action is inserted at cursor position
6. Stop recording → actions are inline in your test file

**Example — Extending SM-08 with Record at Cursor**:

Before recording:
```typescript
test('SM-08: Start Trip view renders all options', async ({ page }) => {
  await page.goto('/start', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Start a Trip')).toBeVisible();
  // CURSOR
});
```

After Record at Cursor (you clicked "Start from scratch" and "AI Trip Planner"):
```typescript
test('SM-08: Start Trip view renders all options', async ({ page }) => {
  await page.goto('/start', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Start a Trip')).toBeVisible();
  // Recorded actions inserted below:
  await expect(page.getByText('Start from scratch')).toBeVisible();
  await expect(page.getByText('AI Trip Planner')).toBeVisible();
  await expect(page.getByText('Quick Start Templates')).toBeVisible();
});
```

**When to Use Record at Cursor**:
- ✅ Extending an existing test with more assertions
- ✅ Adding interaction steps to a partially written test
- ✅ Quickly capturing a specific sub-flow within a larger test
- ❌ Creating entirely new tests (use full Record / Codegen instead)
- ❌ Complex flows requiring POM refactoring (record then refactor manually)

**VS Code Integration Tips**:
- The "Record at Cursor" button also appears in the editor title bar when a `.spec.ts` file is open
- You can Undo (`Cmd+Z`) the recorded insertions if they're not what you expected
- Recorded code uses the same locator priority as Codegen (roles > text > testId)

**CORE Prompt — Extend a Test with Record at Cursor**:
```
Context:     Road Trip Planner, Playwright E2E. The smoke test SM-06 validates
             that category pills render ("Places to Camp", "Parks & Nature").
             We want to extend it to also verify clicking a pill triggers a search.
Objective:   Use Record at Cursor to add interactions: click "Places to Camp",
             wait for results, assert at least 1 result appears.
Requirements: Position cursor after the last assertion in SM-06, use Record at
             Cursor to capture the click and result check. After recording,
             refactor to use waitForResponse(/api/search/) instead of arbitrary
             timeout. Keep the @smoke tag.
Examples:    See SM-06 current implementation in app-loads.spec.ts. See the CORE
             prompt for EXP-01 in PLAYWRIGHT_TESTING_ROADMAP.md for the full
             category search test pattern.
```

> **Reference**: [Playwright Record at Cursor](https://playwright.dev/docs/getting-started-vscode#record-at-cursor) | [VS Code Extension — Recording](https://playwright.dev/docs/getting-started-vscode#record-new-tests)

---

## CORE Prompting Framework for Playwright

All prompts in this workshop series use the **CORE framework** — a structured 4-element approach that produces consistent, high-quality Copilot results for Playwright test generation.

### The CORE Framework

Two variants are used in the Road Trip Planner project, optimized for different tasks:

**Variant 1 — General Development** (from workshop 00):

| Letter | Element | Description |
|--------|---------|-------------|
| **C** | **Context** | Background — project, tech stack, current file, libraries |
| **O** | **Objective** | What you want — create, debug, refactor, explain, test |
| **R** | **Requirements** | Constraints — types, patterns, accessibility, styling, architecture rules |
| **E** | **Examples** | Existing code patterns to follow |

**Variant 2 — Test Generation** (from `PLAYWRIGHT_TESTING_ROADMAP.md`):

| Letter | Element | Description |
|--------|---------|-------------|
| **C** | **Context** | Test project structure, target URL, relevant POMs, API endpoints |
| **O** | **Objective** | What the test should validate — specific user flow or assertion |
| **R** | **Request** | Detailed test spec — steps, file name, fixtures, tags, imports |
| **E** | **Expectation** | How to verify the test works — pass criteria, performance, edge cases |

> **When to use which**: Use **Variant 1** (Requirements/Examples) for general tasks — creating POMs, setting up fixtures, configuring Playwright. Use **Variant 2** (Request/Expectation) for generating specific test specs.

---

### CORE Template for Playwright Tests

Copy-paste this template into Copilot Chat and fill in the brackets:

```
Context:     [Project name], Playwright E2E, [test directory path].
             [Relevant POM files, fixture files]. Tests run against
             [target URL] via Docker Compose. [auth strategy if relevant].
             [Relevant source files for the feature under test].

Objective:   [What the test should validate — specific user flow or behavior].

Request:     Create [file path] that:
             1. [First test step — navigation, setup]
             2. [Second step — interaction, action]
             3. [Third step — assertion, verification]
             4. [Additional steps...]
             Tag: [@smoke | @regression | @auth | @slow | @mobile]
             Import from: [fixture file or @playwright/test]
             Test ID: [ID convention, e.g., SM-09, NAV-03, EXP-01]

Expectation: Test passes with [npx playwright test <file>], uses POM methods
             (no raw selectors in test body), waits for API responses (not
             arbitrary timeouts), handles [edge cases: empty state, network
             error, slow load]. Follows project conventions from
             PLAYWRIGHT_TESTING_ROADMAP.md.
```

---

### CORE Prompt Examples

#### Example 1: Smoke Test — Map Canvas Rendering

```
Context:     Road Trip Planner, Playwright E2E, frontend/e2e/tests/smoke/.
             MapComponent POM at e2e/pages/components/MapComponent.ts has
             expectVisible() which checks canvas.mapboxgl-canvas visibility.
             Tests run against localhost:5173 via Docker Compose. The map uses
             Mapbox GL JS via react-map-gl and loads tiles asynchronously.

Objective:   Create a smoke test that verifies the Mapbox map canvas renders
             on the Explore page within a reasonable timeout.

Request:     Add to e2e/tests/smoke/app-loads.spec.ts a test that:
             1. Navigates to /explore with waitUntil: 'domcontentloaded'
             2. Instantiates MapComponent POM
             3. Calls map.expectVisible() (has built-in 10s timeout for tile loading)
             4. Verifies the map container (.mapboxgl-map) is also present
             5. Tag: @smoke
             Test ID: SM-03

Expectation: Test passes in <5s on local Docker stack. MapComponent.expectVisible()
             handles Mapbox tile loading delay internally. No page.waitForTimeout()
             used. Test is resilient to slow first-load (Mapbox token validation).
```

**Expected Output** (what Copilot generates):
```typescript
test('SM-03: Map canvas renders', async ({ page }) => {
  await page.goto('/explore', { waitUntil: 'domcontentloaded' });

  const map = new MapComponent(page);
  await map.expectVisible();
});
```

---

#### Example 2: Navigation Test — Browser History

```
Context:     Road Trip Planner, Playwright E2E, frontend/e2e/tests/navigation/.
             Sidebar POM at e2e/pages/components/Sidebar.ts has methods:
             goToExplore(), goToItinerary(), goToTrips(), goToStart().
             The SPA uses React Router v6. We need to verify browser
             back/forward navigation preserves the correct view.

Objective:   Create a navigation test that verifies browser history
             (back/forward buttons) works correctly across all views.

Request:     Add to e2e/tests/navigation/sidebar-nav.spec.ts a test that:
             1. Starts on /explore
             2. Navigates: Explore → Itinerary → Trips (using Sidebar POM)
             3. Goes back (page.goBack()) → asserts URL contains /itinerary
             4. Goes forward (page.goForward()) → asserts URL contains /trips
             5. Tag: @smoke @navigation
             Test ID: NAV-02

Expectation: Test validates React Router history integration. Uses
             page.waitForURL() after back/forward (not waitForTimeout).
             URL assertions use toContain() for flexibility.
```

**Expected Output**:
```typescript
test('NAV-02: Browser back/forward preserves navigation', async ({ page }) => {
  const sidebar = new Sidebar(page);
  await page.goto('/explore', { waitUntil: 'domcontentloaded' });

  // Navigate forward: explore → itinerary → trips
  await sidebar.goToItinerary();
  await page.waitForURL('**/itinerary');

  await sidebar.goToTrips();
  await page.waitForURL('**/trips');

  // Go back to itinerary
  await page.goBack();
  await page.waitForURL('**/itinerary');
  expect(page.url()).toContain('/itinerary');

  // Go forward to trips again
  await page.goForward();
  await page.waitForURL('**/trips');
  expect(page.url()).toContain('/trips');
});
```

---

#### Example 3: API Integration Test — BFF Health Check

```
Context:     Road Trip Planner, Playwright E2E, frontend/e2e/tests/smoke/.
             The BFF at localhost:3000 has a /health endpoint that aggregates
             health status from all 3 backend services (Python :8000, C# :8081,
             Java :8082). Playwright provides a { request } fixture for API
             testing without a browser. The BFF URL is configurable via
             PLAYWRIGHT_BFF_URL env var (default: http://localhost:3000).

Objective:   Create an API-level smoke test that validates the BFF health
             endpoint returns 200 and has a valid response body.

Request:     Add to e2e/tests/smoke/app-loads.spec.ts a test that:
             1. Uses the { request } fixture (not { page })
             2. Reads BFF URL from PLAYWRIGHT_BFF_URL or falls back to localhost:3000
             3. Sends GET request to /health
             4. Asserts status is 200
             5. Asserts response body is defined (not empty)
             6. Tag: @smoke
             Test ID: SM-04

Expectation: Test passes in <2s. Uses the { request } API fixture —
             no browser needed (faster). Validates the full Docker Compose
             stack is healthy. Handles BFF not ready with clear timeout error.
```

**Expected Output**:
```typescript
test('SM-04: BFF health endpoint returns healthy', async ({ request }) => {
  const bffUrl = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';
  const response = await request.get(`${bffUrl}/health`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toBeDefined();
});
```

---

#### Example 4: Cross-View Test — Explore to Itinerary Flow

```
Context:     Road Trip Planner, Playwright E2E, frontend/e2e/tests/explore/.
             The Explore view at /explore has a search input and result cards
             with "Add to Trip" buttons. Clicking "Add to Trip" adds a stop
             to the Zustand store (useTripStore.addStop()). The stop persists
             when navigating to /itinerary. ExplorePage POM has textSearch(),
             addResultToTrip(). ItineraryPage POM has getStopCount().
             Test data in e2e/helpers/test-data.ts has EXPLORE_QUERIES.

Objective:   Create a test that validates the cross-view flow: search on
             Explore, add to trip, navigate to Itinerary, verify stop appears.

Request:     Create e2e/tests/explore/add-to-trip.spec.ts that:
             1. Navigates to /explore using ExplorePage
             2. Searches for EXPLORE_QUERIES.TEXT_SEARCH ('Grand Canyon')
             3. Waits for /api/search response
             4. Clicks "Add to Trip" on the first result
             5. Asserts a success toast appears ("Added to trip!" or similar)
             6. Navigates to /itinerary using Sidebar POM
             7. Asserts stop count is 1 (the just-added stop)
             8. Tag: @regression
             Test ID: EXP-03
             Import: base.fixture (explorePage, itineraryPage)

Expectation: Test validates Zustand state persistence across route changes.
             Uses waitForResponse for API calls. Handles potential empty search
             results (skip test if no results). Uses POM methods from both
             ExplorePage and ItineraryPage — no raw locators in test body.
```

---

### CORE Anti-Patterns

**❌ Vague prompt — no CORE structure**:
```
"Write a Playwright test for the explore page"
```
**Result**: Copilot guesses DOM structure, uses wrong selectors, doesn't follow project conventions, generates a generic test that won't work.

**❌ Missing Context**:
```
"Test the search functionality"
```
**Result**: Copilot doesn't know which app, which search, what framework, where tests live, what POMs exist.

**❌ Missing Expectation**:
```
Context: Road Trip Planner Playwright
Objective: Test the category pill search
Request: Create a test that clicks a category and checks results
```
**Result**: No guidance on edge cases, pass criteria, or conventions. Test may use `waitForTimeout` instead of `waitForResponse`.

**✅ Full CORE (correct)**:
```
Context:     Road Trip Planner, Playwright E2E, frontend/e2e/tests/explore/.
             ExplorePage POM has clickCategory() and waitForResults() methods.
             API: GET /api/search?query=<category>&proximity=-98.5795,39.8283.
Objective:   Test clicking a category pill triggers a search and shows results.
Request:     Create e2e/tests/explore/category-search.spec.ts that:
             1. Navigate to /explore, 2. Click "Places to Camp" pill,
             3. Wait for /api/search response, 4. Assert ≥1 result card visible.
             Tag: @regression. Test ID: EXP-01. Import: base.fixture.
Expectation: Uses ExplorePage POM methods. Waits for API response (not timeout).
             Handles empty results gracefully (soft assert or skip).
```

---

## Best Practices for AI-Assisted Playwright Testing

### 1. Always Use Page Object Models

**❌ Bad** — Selectors scattered across test files:
```typescript
test('search for camping', async ({ page }) => {
  await page.goto('/explore');
  await page.locator('input[placeholder="Search and Explore"]').fill('camp');
  await page.locator('input[placeholder="Search and Explore"]').press('Enter');
  await expect(page.locator('[class*="border rounded-xl"]').first()).toBeVisible();
});
```

**✅ Good** — POMs encapsulate selectors and actions:
```typescript
import { test, expect } from '../fixtures/base.fixture';

test('EXP-02: search for camping @regression', async ({ explorePage }) => {
  await explorePage.goto();
  await explorePage.textSearch('camp');
  await explorePage.expectResultCount(1);
});
```

**Why POMs Matter**:
- **One change, one place**: If the search placeholder changes, update `ExplorePage.ts` — not 20 tests
- **Readable tests**: `explorePage.textSearch()` is clear; `page.locator('input[placeholder="Search and Explore"]').fill()` is noisy
- **Reusable**: The same POM methods work in smoke, regression, and performance tests
- **Copilot-friendly**: POM methods give Copilot concrete patterns to follow

---

### 2. Prefer Accessible Locators

Follow Playwright's recommended locator priority:

```typescript
// 1. getByRole() — Best: semantic, accessible, resilient
page.getByRole('button', { name: 'Save Trip' })
page.getByRole('link', { name: 'Itinerary' })

// 2. getByText() — Good: visible text the user sees
page.getByText('Places to Camp')
page.getByText('My Trips', { exact: true })

// 3. getByPlaceholder() — Good for inputs
page.getByPlaceholder('Add a stop (City, Place)...')

// 4. getByLabel() — Good for labeled form fields
page.getByLabel('Trip name')

// 5. getByTestId() — Fallback for non-semantic elements
page.getByTestId('map-canvas')

// 6. CSS — Last resort only
page.locator('canvas.mapboxgl-canvas')
```

**Real Project Examples** (from Road Trip Planner):
```typescript
// ✅ Tests use getByText for visible UI text
await expect(page.getByText('Places to Camp')).toBeVisible();
await expect(page.getByText('Start a Trip')).toBeVisible();

// ✅ Tests use getByPlaceholder for inputs
await expect(page.getByPlaceholder('Add a stop (City, Place)...')).toBeVisible();

// ✅ POM uses locator() only when necessary (Mapbox canvas has no role)
this.mapCanvas = page.locator('canvas.mapboxgl-canvas').first();
```

---

### 3. Auto-Wait Instead of Explicit Waits

Playwright auto-waits on every action and assertion. **Never** use `page.waitForTimeout()`.

```typescript
// ❌ WRONG — Hardcoded wait (flaky, slow)
await page.goto('/explore');
await page.waitForTimeout(3000);   // Why 3 seconds? What if it takes 4?
await expect(page.getByText('Places to Camp')).toBeVisible();

// ✅ CORRECT — Playwright auto-wait with assertion timeout
await page.goto('/explore', { waitUntil: 'domcontentloaded' });
await expect(page.getByText('Places to Camp')).toBeVisible({ timeout: 5_000 });

// ✅ CORRECT — Wait for specific API response  
await page.route('**/api/search**', (route) => route.continue());
const responsePromise = page.waitForResponse('**/api/search**');
await page.getByText('Places to Camp').click();
await responsePromise;
```

**Road Trip Planner pattern** — wait for network, not time:
```typescript
// BasePage.ts provides this helper
async waitForApiResponse(urlPattern: string | RegExp, timeout = 10_000): Promise<void> {
  await this.page.waitForResponse(
    (response) => typeof urlPattern === 'string'
      ? response.url().includes(urlPattern)
      : urlPattern.test(response.url()),
    { timeout }
  );
}

// Used in tests:
await basePage.waitForApiResponse('/api/search');
```

---

### 4. Test Isolation and Authentication

Each test gets a fresh browser context. Use `globalSetup` for shared auth state.

```typescript
// ❌ WRONG — Logging in during every single test (slow, fragile)
test('save a trip', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Login with Google (Demo)').click();
  await page.fill('#email', 'test@example.com');
  // ... 10 lines of login flow
  // THEN the actual test starts
});

// ✅ CORRECT — Auth is cached from globalSetup, use auth fixture
import { test } from '../fixtures/auth.fixture';

test('save a trip @auth', async ({ authenticatedPage }) => {
  // authenticatedPage already has auth token from .auth/user.json
  await authenticatedPage.goto('/itinerary');
  // Jump straight to the test logic
});
```

---

### 5. Use Fixtures for DRY Tests

Import from `base.fixture.ts` instead of `@playwright/test`:

```typescript
// ❌ WRONG — Manual POM instantiation in every test
import { test, expect } from '@playwright/test';
import { ExplorePage } from '../../pages/ExplorePage';
import { ItineraryPage } from '../../pages/ItineraryPage';

test('search and add to trip', async ({ page }) => {
  const explorePage = new ExplorePage(page);    // Manual
  const itineraryPage = new ItineraryPage(page); // Manual
  // ...
});

// ✅ CORRECT — Fixtures auto-create POMs
import { test, expect } from '../../fixtures/base.fixture';

test('search and add to trip', async ({ explorePage, itineraryPage }) => {
  // explorePage and itineraryPage are injected by the fixture
  await explorePage.goto();
  await explorePage.textSearch('Grand Canyon');
});
```

---

### 6. Tagging Strategy

Use tags consistently in `test.describe()` names:

```typescript
// Tags in describe block name
test.describe('Smoke Tests @smoke', () => { /* ... */ });
test.describe('Sidebar Navigation @smoke @navigation', () => { /* ... */ });

// Run by tag
npx playwright test --grep @smoke
npx playwright test --grep @regression
npx playwright test --grep-invert @slow    // Skip slow tests
```

**Tag definitions**:

| Tag | Purpose | CI Strategy |
|-----|---------|-------------|
| `@smoke` | Core functionality — app loads, navigates, API healthy | Every PR (fast, <2 min) |
| `@regression` | Full feature verification — search, CRUD, routing | Nightly build |
| `@auth` | Tests requiring login state | After auth changes |
| `@slow` | Tests >10s (AI trip generation, heavy API) | Nightly only |
| `@mobile` | Mobile-responsive behavior | Before mobile releases |

---

### 7. Test Data Management

Centralize all test data in `e2e/helpers/test-data.ts`:

```typescript
import { uniqueTripName, STOP_QUERIES, COORDINATES, TIMEOUTS } from '../helpers/test-data';

test('add Denver as a stop', async ({ itineraryPage }) => {
  // ✅ Use centralized constants — not magic strings
  await itineraryPage.searchStop(STOP_QUERIES.ORIGIN);  // 'Denver, CO'

  // ✅ Use unique names for test isolation
  const tripName = uniqueTripName('Denver Trip');  // 'E2E_TEST_Denver Trip_170965432100'

  // ✅ Use named timeouts — not magic numbers
  await itineraryPage.waitForRoute({ timeout: TIMEOUTS.ROUTE_CALCULATION });
});
```

---

### 8. CI/CD Configuration

The `playwright.config.ts` has CI-specific settings:

| Setting | Local | CI |
|---------|-------|-----|
| `retries` | 0 | 2 |
| `workers` | unlimited | 2 |
| `reporter` | HTML + list | JUnit + HTML |
| `forbidOnly` | false | true |
| `trace` | on-first-retry | on-first-retry |
| `screenshot` | only-on-failure | only-on-failure |

```yaml
# GitHub Actions example (from PLAYWRIGHT_TESTING_ROADMAP.md)
name: Playwright E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Install Playwright browsers
        run: cd frontend && npx playwright install --with-deps
      - name: Start Docker Compose
        run: docker compose -f docker-compose.yml up -d --wait
      - name: Run smoke tests
        run: cd frontend && npx playwright test --grep @smoke
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

### 9. Use the `@playwright-tester` Agent Effectively

**When to use `@playwright-tester`**:
- ✅ For unfamiliar views — agent explores first, then generates tests
- ✅ For broken locators — agent takes DOM snapshots to find correct selectors
- ✅ For complex multi-step flows — agent reasons through the user journey

**When to write tests manually**:
- ✅ Simple assertions on known elements
- ✅ API tests (no browser interaction needed)
- ✅ Extending existing tests with `Record at Cursor`

**Effective agent prompts**:
```bash
# Good — specific, contextual, references existing code
@playwright-tester "Navigate to http://localhost:5173/itinerary, take a snapshot,
then generate a test for adding a stop via the search input. Use the ItineraryPage
POM from e2e/pages/ItineraryPage.ts. Follow the test header pattern from
app-loads.spec.ts (test ID: ITN-01, tag: @regression)."

# Bad — vague, no context
@playwright-tester "Write tests for the app"
```

---

### 10. Leverage Copilot Chat for Debugging

```bash
# Explain a failing test
/explain why is this test timing out at line 24?

# Find related selectors
@workspace which selectors are defined for the Itinerary view?

# Debug a test error
@terminal the SM-04 health check test returned ECONNREFUSED - how do I fix this?

# Generate a test from a feature
@workspace generate a Playwright test for the save trip flow described in
FloatingPanel.tsx. Use the CORE framework from PLAYWRIGHT_TESTING_ROADMAP.md.
```

---

## Common Pitfalls & How to Avoid Them

### 1. Using `page.waitForTimeout()`

**Pitfall**: Hardcoded timeouts make tests slow AND flaky.

```typescript
// ❌ WRONG — waits 3 seconds even if page loads in 500ms
await page.goto('/explore');
await page.waitForTimeout(3000);
await expect(page.getByText('Places to Camp')).toBeVisible();

// ✅ CORRECT — auto-wait assertion (returns as soon as visible)
await page.goto('/explore', { waitUntil: 'domcontentloaded' });
await expect(page.getByText('Places to Camp')).toBeVisible({ timeout: 5_000 });
```

**Why**: `waitForTimeout(3000)` waits exactly 3 seconds regardless — wastes time when fast, fails when slow. Playwright's auto-wait assertions retry until the condition is met or timeout expires.

---

### 2. Raw CSS Selectors in Test Files

**Pitfall**: Tests break when designers change CSS classes or restructure the DOM.

```typescript
// ❌ WRONG — fragile CSS selectors in test body
test('click itinerary tab', async ({ page }) => {
  await page.locator('.sidebar-nav > ul > li:nth-child(2) > a').click();
  await expect(page.locator('.floating-panel .tab-content.active')).toBeVisible();
});

// ✅ CORRECT — POM methods
test('NAV-01b: Navigate to Itinerary @navigation', async ({ page }) => {
  const sidebar = new Sidebar(page);
  await sidebar.goToItinerary();
  await expect(page.getByPlaceholder('Add a stop (City, Place)...')).toBeVisible();
});
```

**Fix**: Move ALL selectors into POMs (`e2e/pages/`) or the centralized selectors file (`e2e/helpers/selectors.ts`).

---

### 3. Not Waiting for API Responses

**Pitfall**: Test asserts results before the API call completes.

```typescript
// ❌ WRONG — clicks search and immediately checks results
await page.getByText('Places to Camp').click();
const count = await page.locator('.result-card').count();
expect(count).toBeGreaterThan(0);  // FAILS — API hasn't responded yet!

// ✅ CORRECT — wait for the API response, then assert
const responsePromise = page.waitForResponse('**/api/search**');
await page.getByText('Places to Camp').click();
await responsePromise;  // Wait for API to respond
const count = await page.locator('.result-card').count();
expect(count).toBeGreaterThan(0);  // NOW safe to assert
```

**Road Trip Planner helper** (from `BasePage.ts`):
```typescript
// Use the reusable waitForApiResponse helper
await basePage.waitForApiResponse('/api/search');
```

---

### 4. Shared State Between Tests

**Pitfall**: Test B depends on data created by Test A — fails when run in isolation.

```typescript
// ❌ WRONG — tests share state
test('create a trip', async ({ page }) => {
  // Creates a trip named "My Road Trip"
  await createTrip(page, 'My Road Trip');
});

test('delete a trip', async ({ page }) => {
  // Assumes "My Road Trip" exists from previous test — BRITTLE!
  await deleteTripByName(page, 'My Road Trip');
});

// ✅ CORRECT — each test manages its own data
test('create and delete a trip @regression', async ({ page }) => {
  const tripName = uniqueTripName('Delete Test');
  await createTrip(page, tripName);
  await deleteTripByName(page, tripName);
});
```

**Cleanup**: The `globalTeardown` deletes all `E2E_TEST_*` prefixed trips after the suite runs — catching any missed cleanup.

---

### 5. Ignoring Mobile Viewports

**Pitfall**: Tests pass on desktop but fail on mobile — sidebar becomes a bottom nav, layouts shift.

```typescript
// The Road Trip Planner has 5 browser projects including mobile:
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },    // 393x851
  { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },  // 390x844
]
```

**Fix**: Run tests across all projects regularly:
```bash
# Include mobile projects in regression
npx playwright test --grep @regression  # Runs on ALL 5 projects

# Or test mobile specifically
npx playwright test --project=mobile-chrome --project=mobile-safari
```

**Mobile-specific locators** (sidebar becomes bottom nav):
```typescript
// BasePage.ts handles both layouts
this.sidebar = page.locator('nav').filter({ has: page.locator('a[href="/explore"]') }).first();
this.mobileNav = page.locator('nav.fixed.bottom-0').first();
```

---

### 6. Hardcoded URLs

**Pitfall**: Tests break when running against different environments (local, staging, CI).

```typescript
// ❌ WRONG — hardcoded URL
await page.goto('http://localhost:5173/explore');
const response = await request.get('http://localhost:3000/health');

// ✅ CORRECT — use baseURL from config + env vars
await page.goto('/explore');  // Uses baseURL from playwright.config.ts

const bffUrl = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';
const response = await request.get(`${bffUrl}/health`);
```

**Config** (from `playwright.config.ts`):
```typescript
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
use: {
  baseURL: BASE_URL,
}
```

---

### 7. Not Cleaning Up Test Data

**Pitfall**: E2E tests create trips that accumulate in the database.

```typescript
// ❌ WRONG — creates trips but never deletes them
test('save a trip', async ({ page }) => {
  await createTrip(page, 'My Trip');
  // Test ends — trip stays in DB forever
});

// ✅ CORRECT — globalTeardown cleans up prefixed test data
// All test trips use the E2E_TEST_ prefix
const tripName = uniqueTripName('Save Test');  // → "E2E_TEST_Save Test_170965432100"

// globalTeardown.ts automatically deletes ALL E2E_TEST_* trips
```

**Road Trip Planner cleanup** (from `global-teardown.ts`):
```typescript
async function globalTeardown() {
  await ApiHelpers.deleteTestTrips();  // Deletes all E2E_TEST_* trips
}
```

---

### 8. Testing Implementation Details

**Pitfall**: Tests assert on internal state/classes instead of user-visible behavior.

```typescript
// ❌ WRONG — testing internal React/Zustand state
test('store has 2 stops', async ({ page }) => {
  const storeState = await page.evaluate(() => {
    return window.__ZUSTAND_STORE__.getState().stops.length;
  });
  expect(storeState).toBe(2);
});

// ✅ CORRECT — test what the USER sees
test('2 stops visible in itinerary', async ({ itineraryPage }) => {
  await itineraryPage.goto();
  await itineraryPage.expectStopCount(2);  // Counts visible DOM elements
});
```

**Guideline**: If the user can't see it or interact with it, don't test it in E2E. Use unit tests (Vitest) for internal state.

---

## Quick Reference

### Playwright CLI Commands

| Command | Purpose |
|---------|---------|
| `npx playwright test` | Run all tests |
| `npx playwright test --headed` | Show browser windows |
| `npx playwright test --debug` | Debug with Playwright Inspector |
| `npx playwright test --ui` | Interactive UI mode (watch) |
| `npx playwright test --grep @smoke` | Run tagged tests |
| `npx playwright test --project=chromium` | Run specific browser |
| `npx playwright codegen <url>` | Record new test |
| `npx playwright show-report` | Open HTML report |
| `npx playwright show-trace <file>` | Open Trace Viewer |
| `npx playwright install` | Install browser binaries |
| `npx playwright install --with-deps` | Install browsers + system deps (CI) |

### npm Scripts (from `frontend/package.json`)

| Script | Command |
|--------|---------|
| `npm run test:e2e` | `playwright test` |
| `npm run test:e2e:ui` | `playwright test --ui` |
| `npm run test:e2e:headed` | `playwright test --headed` |
| `npm run test:e2e:debug` | `playwright test --debug` |
| `npm run test:e2e:report` | `playwright show-report playwright-report` |
| `npm run test:e2e:smoke` | `playwright test --grep @smoke` |
| `npm run test:e2e:chromium` | `playwright test --project=chromium` |

### VS Code Test Explorer Actions

| Action | How |
|--------|-----|
| **Run test** | Click ▶ in gutter or Test Explorer |
| **Debug test** | Right-click → "Debug Test" |
| **Record test** | Command Palette → "Playwright: Record New Test" |
| **Record at cursor** | Command Palette → "Playwright: Record at Cursor" |
| **Pick locator** | Test Explorer toolbar → "Pick Locator" |
| **Show browser** | Test Explorer toolbar → 👁 toggle |
| **Show trace** | Click failed test → "Show Trace" |

### Locator Priority Table

| Priority | Locator | Example | When |
|----------|---------|---------|------|
| 1 | `getByRole` | `getByRole('button', { name: 'Save' })` | Buttons, links, headings, inputs |
| 2 | `getByText` | `getByText('Places to Camp')` | Labels, descriptions, unique text |
| 3 | `getByPlaceholder` | `getByPlaceholder('Search...')` | Input placeholders |
| 4 | `getByLabel` | `getByLabel('Trip name')` | Labeled form fields |
| 5 | `getByTestId` | `getByTestId('map-canvas')` | Non-semantic elements |
| 6 | CSS | `locator('.mapboxgl-canvas')` | Last resort — 3rd party elements |

### CORE Prompting Template — Playwright Test Generation

```
Context:     [Project], Playwright E2E, [test dir]. [POMs], [fixtures].
             Tests against [baseURL]. [Auth strategy]. [Relevant source files].

Objective:   [What the test validates — specific user flow or assertion].

Request:     Create [file path] that:
             1. [Navigate / setup]
             2. [Interact / action]
             3. [Assert / verify]
             Tag: [@smoke | @regression | @auth | @slow | @mobile]
             Test ID: [SM-XX | NAV-XX | EXP-XX | ITN-XX | AUTH-XX]
             Import: [base.fixture | auth.fixture | @playwright/test]

Expectation: Passes with npx playwright test <file>. Uses POM methods,
             waits for APIs (not timeouts), handles edge cases.
```

### Agent & Prompt Quick Reference

| Tool | Purpose | Example |
|------|---------|---------|
| `@playwright-tester` | Explore site + generate tests | `@playwright-tester "Navigate to /explore, snapshot, generate category search test"` |
| `@tdd-red` | Write failing Playwright test first | `@tdd-red "Write failing test for save trip flow"` |
| `@tdd-green` | Implement code to pass E2E test | `@tdd-green "Add data-testid to MapComponent to fix SM-03"` |
| `@tdd-refactor` | Clean up test code | `@tdd-refactor "Extract common navigation setup to beforeEach"` |
| `@debug` | Investigate test failures | `@debug "Why does SM-04 BFF health test fail intermittently?"` |

### Copilot Keyboard Shortcuts (VS Code)

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| **Accept suggestion** | `Tab` | `Tab` |
| **Reject suggestion** | `Esc` | `Esc` |
| **Next suggestion** | `Alt + ]` | `Alt + ]` |
| **Previous suggestion** | `Alt + [` | `Alt + [` |
| **Open Chat** | `Cmd + I` | `Ctrl + I` |
| **Chat Sidebar** | `Cmd + Shift + I` | `Ctrl + Shift + I` |
| **Explain selection** | Select code → `/explain` | Select code → `/explain` |
| **Generate tests** | Select code → `/tests` | Select code → `/tests` |

---

## References & Further Reading

**Playwright Official Documentation**:
- [Getting Started](https://playwright.dev/docs/intro) — Installation, first test, CLI
- [Writing Tests](https://playwright.dev/docs/writing-tests) — Test structure, assertions, hooks
- [Locators](https://playwright.dev/docs/locators) — Locator types, priority, best practices
- [Page Object Models](https://playwright.dev/docs/pom) — POM pattern guidance
- [Test Fixtures](https://playwright.dev/docs/test-fixtures) — Custom fixtures, worker fixtures
- [Test Configuration](https://playwright.dev/docs/test-configuration) — playwright.config.ts reference
- [Trace Viewer](https://playwright.dev/docs/trace-viewer) — Debugging with traces
- [Codegen](https://playwright.dev/docs/codegen-intro) — Recording tests
- [UI Mode](https://playwright.dev/docs/test-ui-mode) — Interactive test runner
- [CI Integration](https://playwright.dev/docs/ci) — GitHub Actions, Docker, containers
- [Debugging](https://playwright.dev/docs/debug) — Inspector, VS Code, breakpoints
- [API Testing](https://playwright.dev/docs/api-testing) — Request fixture, API validation

**VS Code Extension**:
- [Playwright Test for VS Code](https://playwright.dev/docs/getting-started-vscode) — Setup, running, recording, debugging
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) — Extension page

**GitHub Copilot Documentation**:
- [Custom Agents](https://docs.github.com/en/copilot/customizing-copilot/building-copilot-agents-in-vs-code) — Building agent files
- [MCP Integration](https://docs.github.com/en/copilot/customizing-copilot/extending-the-functionality-of-github-copilot-in-vs-code-with-mcp) — Using MCP servers
- [Copilot in VS Code](https://code.visualstudio.com/docs/copilot/overview) — Complete feature guide

**Microsoft Learn**:
- [End-to-End Testing with Playwright](https://learn.microsoft.com/en-us/training/modules/build-with-playwright/) — Training module
- [Best Practices for Copilot](https://learn.microsoft.com/en-us/shows/introduction-to-github-copilot/best-practices-for-using-github-copilot) — General best practices

**Road Trip Planner Project**:
- [PLAYWRIGHT_TESTING_ROADMAP.md](../../PLAYWRIGHT_TESTING_ROADMAP.md) — Full test inventory with CORE prompts (45+ planned tests)
- [playwright.config.ts](../../frontend/playwright.config.ts) — Project test configuration
- [Workshop Setup Instructions](setup/00-setup-instructions.md) — First-time setup guide
- [00-key-definitions-best-practices.md](00-key-definitions-best-practices.md) — General Copilot definitions (prerequisite)
- [copilot-instructions.md](../../../.github/copilot-instructions.md) — Project-wide Copilot rules
- [playwright-tester.agent.md](../../../.github/copilot-agents/playwright-tester.agent.md) — Playwright testing agent

---

**Workshop Navigation**:
- ⬅️ **Prerequisite**: [00-key-definitions-best-practices.md](00-key-definitions-best-practices.md) — General Copilot concepts
- ➡️ **Setup**: [setup/00-setup-instructions.md](setup/00-setup-instructions.md) — Environment setup for Playwright workshops
- 📚 **Test Inventory**: [PLAYWRIGHT_TESTING_ROADMAP.md](../../PLAYWRIGHT_TESTING_ROADMAP.md) — All 45+ planned tests with CORE prompts
