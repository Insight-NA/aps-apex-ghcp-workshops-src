# Workshop 4: Expert Playwright Testing with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Advanced QA engineers and SDETs with TDD/agent experience (completed Workshops 1-3)  
**Prerequisites**: Proficiency with CORE prompts, Playwright POM fixtures, coding agents, Plan Mode  
**Project**: Road Trip Planner — React + TypeScript frontend with Playwright E2E test suite at `frontend/e2e/`

---

## Learning Objectives

By the end of this workshop, you will:
1. **Copilot Extensions → MCP Servers**: Understand the evolution from Copilot Extensions to Model Context Protocol (MCP) servers and configure the Playwright MCP server for live-site test authoring
2. **MCP Servers**: Configure and use MCP servers (@context7, Playwright MCP, @github) to fetch real-time Playwright documentation and execute browser operations from Chat
3. **Enterprise Policy Management**: Configure organization-wide Copilot policies, content exclusions, and test governance standards
4. **Model Selection & Cost Optimization**: Choose appropriate models (GPT-4.1, Claude Sonnet 4, Opus 4, o3-mini) based on test complexity and manage premium request allocation
5. **GitHub Copilot Certification**: Review certification domains and practice exam-style scenarios focused on Playwright testing workflows
6. **Copilot Spec Kit**: Use the full Spec Kit workflow (@speckit.specify → @speckit.plan → @speckit.tasks → @speckit.implement) for E2E test suite development
7. **Copilot Metrics**: Configure and interpret Copilot usage metrics for test automation teams, including acceptance rates and productivity dashboards

---

## CORE Prompt Framework Recap

All demos in this workshop use the **CORE Framework** — the structured 4-element approach for Playwright test generation established in Workshops 1-3:

| Letter | Section | Purpose | Playwright Example |
|--------|---------|---------|-------------------|
| **C** | **Context** | What exists — POMs, fixtures, helpers, stack | "The test project is at `frontend/e2e/`, uses `ItineraryPage` POM, runs against Docker Compose at `localhost:5173`" |
| **O** | **Objective** | What the test validates | "Validate the route calculation flow returns distance and duration" |
| **R** | **Request** | Exact steps — POM methods, file paths, tags, API waits | "Create `calculate-route.spec.ts` that waits for `/api/directions`" |
| **E** | **Expectation** | Pass criteria, anti-patterns to avoid | "Uses POM methods, no `waitForTimeout`, handles API latency" |

> **Why CORE?** Playwright tests require precise context (which POMs exist, what APIs to intercept, which fixtures to use). Generic prompts like "write a test for the itinerary page" produce tests with fragile CSS selectors and arbitrary timeouts. CORE prompts produce tests that match the project's established patterns.

---

## Workshop Agenda

| Time | Demo | Topic | Key Concept |
|------|------|-------|-------------|
| 0-12 min | Demo 1 | Copilot Extensions → MCP Servers Evolution | Extensions architecture, MCP migration |
| 12-24 min | Demo 2 | MCP Servers: Playwright MCP & @context7 | Live browser testing, real-time docs |
| 24-36 min | Demo 3 | Enterprise Policy Management | Org policies, test content exclusions |
| 36-48 min | Demo 4 | Model Selection & Cost Optimization | Model comparison, premium requests |
| 48-60 min | Demo 5 | GitHub Copilot Certification Prep | Exam domains, Playwright scenarios |
| 60-75 min | Demo 6 | Copilot Spec Kit Full Workflow | specify → plan → tasks → implement |
| 75-90 min | Demo 7 | Copilot Metrics & Productivity Dashboard | Usage analytics, ROI measurement |

---

## Pre-Workshop: Test Architecture Recap

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
| Agent file | `.github/copilot-agents/playwright-tester.agent.md` | Playwright Tester Mode with MCP browser tools |

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

---

## Demo 1: Copilot Extensions → MCP Servers Evolution (12 min)

### Objective
Understand how GitHub Copilot Extensions have evolved into the Model Context Protocol (MCP) standard, and why Playwright testers should care about MCP for live-browser test authoring.

### Background: The Evolution

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GitHub Copilot Extension Evolution                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  2023: Copilot Extensions (v1)          2024-2025: MCP Servers (v2)     │
│  ─────────────────────────────          ─────────────────────────────   │
│                                                                          │
│  • Custom chat participants             • Standardized protocol          │
│  • Limited to GitHub ecosystem          • Cross-IDE compatible           │
│  • Proprietary API format               • Open specification             │
│  • Single-turn interactions             • Stateful sessions              │
│  • Manual tool definitions              • Auto-discovered tools          │
│                                                                          │
│  @extension-name prompt                 @mcp-server prompt               │
│         ↓                                       ↓                        │
│  [Extension-specific API]               [MCP JSON-RPC Protocol]          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Differences: Extensions vs MCP Servers

| Aspect | Copilot Extensions (Legacy) | MCP Servers (Current) |
|--------|----------------------------|----------------------|
| **Protocol** | Proprietary GitHub API | Open JSON-RPC 2.0 standard |
| **Portability** | GitHub Copilot only | VS Code, JetBrains, Cursor, etc. |
| **Tool Discovery** | Manual registration | Auto-discovery via manifest |
| **State Management** | Stateless per-request | Persistent session context |
| **Authentication** | GitHub OAuth only | Flexible (OAuth, API keys, etc.) |
| **Ecosystem** | GitHub Marketplace | npm, local servers, cloud services |

### Why MCP Matters for Playwright Testers

```
┌─────────────────────────────────────────────────────────────────────────┐
│            MCP Impact on Playwright Test Workflows                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BEFORE MCP (Manual Workflow):                                           │
│  1. Read Playwright docs manually                                        │
│  2. Inspect DOM with DevTools                                            │
│  3. Write selectors by hand                                              │
│  4. Run test → fail → fix → repeat                                       │
│                                                                          │
│  AFTER MCP (AI-Assisted Workflow):                                       │
│  1. @context7 fetches LIVE Playwright API docs                           │
│  2. Playwright MCP navigates to page, takes accessibility snapshot       │
│  3. AI reads snapshot → generates precise locators                       │
│  4. Tests pass on first run (with correct a11y selectors)                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Live Demo: Configuring MCP Servers for Playwright

MCP servers are configured in two ways in VS Code:
1. **Copilot Agent files** (`.github/copilot-agents/*.agent.md`) — recommended for team sharing
2. **VS Code settings** (`settings.json`) — for personal/local servers
3. **GitHub MCP Registry** ([github.com/mcp](https://github.com/mcp)) — discover and install community servers

**Step 1: Review Agent-Based MCP Configuration (Real Example from This Repo)**

```yaml
# File: .github/copilot-agents/playwright-tester.agent.md (from this repo)
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
1. Website Exploration: Use Playwright MCP to navigate, snapshot, analyze
2. Test Improvements: Navigate to URL, view snapshot, identify correct locators
3. Test Generation: Write TypeScript Playwright tests based on exploration
4. Test Execution: Run tests, diagnose failures, iterate until passing
5. Documentation: Summarize functionalities tested and test structure
```

**Step 1b: VS Code settings.json (Playwright MCP Server)**
```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "command": "npx",
        "args": ["@anthropic/mcp-playwright"],
        "env": {
          "PLAYWRIGHT_HEADLESS": "true"
        }
      },
      "context7": {
        "command": "npx",
        "args": ["-y", "@upstash/context7-mcp"]
      }
    }
  }
}
```

**Step 2: Understanding the Playwright MCP Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                     Copilot Chat                             │
│            (VS Code / JetBrains / GitHub.com)                │
└─────────────────────┬───────────────────────────────────────┘
                      │ JSON-RPC 2.0 / HTTP (Streamable)
         ┌────────────┼────────────┬──────────────┐
         │            │            │              │
   ┌─────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌──────┴──────┐
   │Playwright│ │@context7│ │ @github │ │  @azure     │
   │   MCP    │ │  MCP    │ │   MCP   │ │   MCP       │
   └─────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘
         │           │           │              │
    Live Browser  Playwright   GitHub API    Azure CLI
    Snapshots     Docs v1.58   Issues/PRs    Resources
    Navigation    Fixtures     Workflows
    Screenshots   Assertions
```

**Step 3: MCP Tool Discovery for Playwright Testing**
```bash
# In Copilot Chat, MCP servers auto-register their tools
# Type @ to see all available agents/MCP servers

@playwright-tester  - Explore site, generate tests from snapshots
@context7           - Fetch live Playwright API docs (v1.58+)
@github             - Search issues, create PRs, manage workflows
@tdd-red            - Write failing Playwright tests (TDD Red phase)
@tdd-green          - Make failing tests pass (TDD Green phase)
@debug              - Debug flaky test failures

# Playwright MCP auto-discovers these tools:
# - browser_navigate    → Navigate to a URL
# - browser_snapshot    → Get accessibility tree snapshot
# - browser_click       → Click elements by accessibility ref
# - browser_fill_form   → Fill form fields
# - browser_screenshot  → Capture visual state
# - browser_evaluate    → Execute JS in browser context
# - browser_wait_for    → Wait for elements/conditions
```

### Migration Path: Extension → MCP Agent

**Before (Custom Copilot Extension for Test Helpers)**:
```typescript
// Old: Custom extension with proprietary API
// File: extension/src/test-helper-participant.ts

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    'playwright-helper',
    async (request, context, stream, token) => {
      // Manually parse request, call Playwright API, format response
      const { prompt } = request;
      stream.markdown(`Running test analysis for: ${prompt}`);
      // ...proprietary implementation
    }
  );
  context.subscriptions.push(participant);
}
```

**After (MCP Agent File — from this repo)**:
```yaml
# New: Standardized agent file with MCP server + Playwright tools
# File: .github/copilot-agents/playwright-tester.agent.md
---
description: "Testing mode for Playwright tests"
name: "Playwright Tester Mode"
tools: ["changes", "codebase", "edit/editFiles", "fetch", "findTestFiles",
        "problems", "runCommands", "runTasks", "runTests", "search",
        "searchResults", "terminalLastCommand", "terminalSelection",
        "testFailure", "playwright"]
model: Claude Sonnet 4
---

# Playwright Tester Agent

## Core Responsibilities
1. **Website Exploration**: Navigate to the site, take snapshots, analyze
2. **Test Generation**: Write TypeScript Playwright tests from exploration
3. **Test Execution**: Run, diagnose failures, iterate until passing
```

> **Key Difference**: Agent files combine instructions + MCP config + tool permissions in one portable markdown file. The `playwright` tool in the tools list enables the Playwright MCP for live-browser operations directly from Copilot Chat.

### Teaching Points

1. **Why MCP Matters for Playwright**:
   - **Live DOM Exploration**: Playwright MCP navigates the actual site, takes accessibility snapshots — no manual DevTools inspection
   - **Real-time Docs**: @context7 fetches current Playwright v1.58 API — no stale training data
   - **Selector Accuracy**: Snapshots provide exact accessibility tree, so generated locators use `getByRole()`, `getByText()`, `getByPlaceholder()` — not fragile CSS selectors

2. **MCP Server Types for Testing**:
   ```
   stdio   →  Playwright MCP (local browser automation)
   HTTP    →  @context7 (live documentation fetching)
   stdio   →  @github (issue tracking, PR management)
   ```

3. **This Repo's Agent Files** (Testing-related):
   ```
   .github/copilot-agents/
   ├── playwright-tester.agent.md   ← Live-site exploration + test gen
   ├── tdd-red.agent.md             ← Write failing tests first
   ├── tdd-green.agent.md           ← Make tests pass
   ├── tdd-refactor.agent.md        ← Optimize test code
   ├── debug.agent.md               ← Diagnose test failures
   └── context7.agent.md            ← Fetch live library docs
   ```

### Verification
```bash
# List configured MCP servers
# In Copilot Chat: Type @ to see available agents

# Test Playwright MCP tool discovery
@playwright-tester Navigate to http://localhost:5173/explore and take a snapshot

# Verify @context7 server health
@context7 Fetch Playwright v1.58 test.describe API documentation

# Check VS Code Output panel → GitHub Copilot Chat
# Look for: "MCP server 'playwright' connected"
```

---

## Demo 2: MCP Servers — Playwright MCP & @context7 Integration (12 min)

### Objective
Use the Playwright MCP server for live-browser exploration to generate precise test selectors, and @context7 to fetch current Playwright API documentation for fixture patterns.

### Scenario
Create a new test for the Explore page category search flow using MCP-guided selector discovery and live documentation for the latest `page.route()` API mocking patterns.

### Part A: Playwright MCP for Live-Site Exploration

**Step 1: Navigate and snapshot the Explore page**

```
CORE PROMPT — Playwright MCP Exploration

CONTEXT:
The Road Trip Planner runs at http://localhost:5173. The /explore view has
category pills (Places to Camp, Parks & Nature, Bars & Restaurants), a search
input, and search results. The Playwright MCP server is configured and connected.

OBJECTIVE:
Explore the /explore page to discover the exact accessibility tree and generate
precise locators for a category search E2E test.

REQUEST:
1. Navigate to http://localhost:5173/explore
2. Take an accessibility snapshot of the page
3. Identify locators for: category pills, search input, result cards
4. List the recommended Playwright locator strategy for each element

EXPECTATION:
All locators use accessibility-first strategies (getByRole, getByText,
getByPlaceholder). No CSS class selectors. Output in a table format.
```

**In Copilot Chat with Playwright MCP**:
```
@playwright-tester Navigate to http://localhost:5173/explore and take a snapshot.
Identify all interactive elements and suggest Playwright locators for each.
```

**Expected Playwright MCP Response** (from live accessibility snapshot):
```
📸 Page Snapshot: /explore

Accessibility Tree (key elements):
┌──────────────────────────────────────────────────────────────────────┐
│  Element                    │ Role      │ Recommended Locator         │
│  ──────────────────────────┼───────────┼─────────────────────────────│
│  "Search and Explore"      │ textbox   │ getByPlaceholder('Search…') │
│  "Places to Camp"          │ button    │ getByText('Places to Camp') │
│  "Parks & Nature"          │ button    │ getByText('Parks & Nature') │
│  "Bars & Restaurants"      │ button    │ getByText('Bars & Rest…')   │
│  "Featured Trips"          │ heading   │ getByText('Featured Trips') │
│  Nav: Explore (active)     │ link      │ getByRole('link', {name})   │
│  Nav: Itinerary            │ link      │ getByRole('link', {name})   │
│  Map canvas                │ canvas    │ locator('canvas.mapboxgl…') │
└──────────────────────────────────────────────────────────────────────┘

✅ No data-testid attributes needed — all elements are accessible via
   semantic roles and visible text.
```

**Step 2: Click a category pill and snapshot the results**

```
@playwright-tester Click "Places to Camp" and wait for the search results to load.
Then take another snapshot showing the result cards.
```

**Expected Response**:
```
📸 After clicking "Places to Camp":

New elements on page:
- Loading spinner appeared then disappeared
- 4 search result cards rendered with:
  - Name (heading text)
  - Distance (e.g., "2.3 mi")
  - "Add to Trip" button on each card

Recommended assertions:
- await expect(page.getByText('Places to Camp')).toBeVisible()
- await expect(page.locator('[class*="border rounded-xl"]')).toHaveCount(4)
- await expect(page.getByText('Add to Trip').first()).toBeVisible()
```

**Step 3: Generate test from MCP exploration**

```
CORE PROMPT — Generate Test from MCP Snapshot

CONTEXT:
Based on the Playwright MCP snapshots above, the /explore page uses these locators:
- Search input: getByPlaceholder('Search and Explore')
- Category pills: getByText('Places to Camp'), etc.
- Result cards: locator('[class*="border rounded-xl"]')
- Add to Trip: getByText('Add to Trip')
The ExplorePage POM exists at e2e/pages/ExplorePage.ts with methods:
clickCategory(), textSearch(), getResultCount(), addResultToTrip().

OBJECTIVE:
Create a test that validates the category pill search returns results.

REQUEST:
Create e2e/tests/explore/category-search.spec.ts using the base.fixture.
Import explorePage from fixtures. Use MCP-discovered locators where the POM
doesn't cover them. Wait for /api/search API response. Tag as @regression.

EXPECTATION:
Test passes with `npx playwright test category-search`.
Uses explorePage POM methods (no raw selectors in the test file).
Waits for API response (no waitForTimeout). Handles zero results gracefully.
```

**Expected Copilot Output** (MCP-informed test):
```typescript
import { test, expect } from '../../fixtures/base.fixture';
import { TIMEOUTS } from '../../helpers/test-data';

test.describe('Explore Category Search @regression', () => {

  test('EXP-01: Category pill triggers search and displays results', async ({
    explorePage,
    page,
  }) => {
    await explorePage.goto();
    await explorePage.expectCategoriesVisible();

    // Click "Places to Camp" category pill
    const searchPromise = page.waitForResponse(
      (r) => r.url().includes('/api/search') && r.status() === 200,
      { timeout: TIMEOUTS.SEARCH }
    );
    await explorePage.clickCategory('Places to Camp');
    await searchPromise;

    // Verify results rendered
    const resultCount = await explorePage.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('EXP-02: "Add to Trip" from search result navigates to itinerary', async ({
    explorePage,
    page,
  }) => {
    await explorePage.goto();

    const searchPromise = page.waitForResponse(
      (r) => r.url().includes('/api/search') && r.status() === 200,
    );
    await explorePage.clickCategory('Parks & Nature');
    await searchPromise;

    await explorePage.addResultToTrip(0);
    await explorePage.expectToast('Added to trip!');
  });
});
```

### Common Copilot Mistakes (Fixed by Playwright MCP)

**Mistake #1: Fragile CSS selectors (without MCP)**
```typescript
// ❌ Without MCP, Copilot guesses selectors from training data:
await page.click('.category-pill:nth-child(2)');  // Fragile!

// ✅ With MCP, Copilot uses accessibility snapshot:
await page.getByText('Places to Camp').click();   // Accessible & stable
```

**Mistake #2: Missing API waits (without @context7)**
```typescript
// ❌ Without live docs, Copilot uses waitForTimeout:
await explorePage.clickCategory('Places to Camp');
await page.waitForTimeout(3000);  // Flaky! Arbitrary delay

// ✅ With @context7 showing current Playwright best practices:
const searchPromise = page.waitForResponse(
  (r) => r.url().includes('/api/search') && r.status() === 200,
);
await explorePage.clickCategory('Places to Camp');
await searchPromise;  // Deterministic wait
```

**Mistake #3: Wrong API mocking syntax (stale training data)**
```typescript
// ❌ Copilot might suggest outdated page.route() syntax:
await page.route('**/api/search', (route) => {
  route.fulfill({ body: testData });  // Missing status, contentType
});

// ✅ @context7 returns current v1.58 page.route() API:
await page.route('**/api/search**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(testData),
  });
});
```

### Part B: @context7 for Live Playwright Documentation

**Step 1: Fetch current Playwright fixture documentation**

```
CORE PROMPT — @context7 Documentation Fetch

CONTEXT:
The Road Trip Planner Playwright tests use custom fixtures (base.fixture.ts,
auth.fixture.ts) that extend @playwright/test. We're using Playwright v1.57+.

OBJECTIVE:
Understand the latest Playwright custom fixture patterns for worker-scoped
database setup and API mocking.

REQUEST:
@context7 Fetch Playwright v1.58 documentation for:
1. Custom test fixtures with TypeScript generics
2. Worker-scoped fixtures for database seeding
3. page.route() API for mocking backend responses

EXPECTATION:
Returns current API signatures, TypeScript types, and examples.
Highlights any breaking changes from v1.50+.
```

**In Copilot Chat**:
```
@context7 Fetch Playwright custom fixture documentation for TypeScript.
Focus on: worker-scoped fixtures, test.extend with generics, automatic
fixture cleanup patterns.
```

**Expected @context7 Response** (Live documentation):
```
📚 Context7: Playwright Test Fixtures (v1.58)

Source: https://playwright.dev/docs/test-fixtures
Updated: 3 days ago

## Custom Fixtures with TypeScript

import { test as base } from '@playwright/test';

// Define fixture types
type MyFixtures = {
  todoPage: TodoPage;
  settingsPage: SettingsPage;
};

// Extend base test
const test = base.extend<MyFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo('item1');
    await use(todoPage);       // ← Test runs here
    await todoPage.removeAll(); // ← Cleanup after test
  },
});

## Worker-Scoped Fixtures (for DB seeding)

type WorkerFixtures = {
  dbConnection: DatabaseConnection;
};

const test = base.extend<{}, WorkerFixtures>({
  dbConnection: [async ({}, use) => {
    const db = await createTestDatabase();
    await db.seed();
    await use(db);
    await db.cleanup();
  }, { scope: 'worker' }],
});

## page.route() API (v1.58)

await page.route('**/api/data', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [] }),
  });
});

// Abort requests to third-party services
await page.route('*external.com/*', route => route.abort());
```

**Step 2: Use @context7 output to create a mock API fixture**

```
CORE PROMPT — Create Mock API Fixture

CONTEXT:
Based on @context7 Playwright v1.58 fixture docs, the project needs a reusable
API mocking fixture. The existing fixtures are at e2e/fixtures/base.fixture.ts
(POM fixtures) and e2e/fixtures/auth.fixture.ts (auth state).
The backend API endpoints are: /api/geocode, /api/directions, /api/search,
/api/trips, /api/optimize (all proxied through BFF at localhost:3000).

OBJECTIVE:
Create a custom fixture that pre-configures page.route() mocks for all
backend APIs, allowing tests to run without the Docker Compose stack.

REQUEST:
Create e2e/fixtures/mock-api.fixture.ts that:
1. Extends the base test with a `mockApi` fixture
2. Provides methods: mockGeocodeResponse(), mockDirectionsResponse(),
   mockSearchResponse(), mockTripsResponse()
3. Each method accepts a custom response body or uses a default
4. Uses page.route() with correct v1.58 syntax from @context7
5. Cleans up routes after each test

EXPECTATION:
Fixture follows the pattern from base.fixture.ts (PageFixtures type).
Uses async route.fulfill() (not callback style).
Default responses are realistic GeoJSON matching our schema.
```

**Expected Copilot Output**:
```typescript
import { test as base, Page, Route } from '@playwright/test';

type MockApiFixtures = {
  mockApi: MockApiHelper;
};

class MockApiHelper {
  constructor(private page: Page) {}

  async mockGeocodeResponse(body?: unknown): Promise<void> {
    await this.page.route('**/api/geocode**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body ?? {
          features: [{
            center: [-104.9903, 39.7392],
            place_name: 'Denver, CO',
            text: 'Denver',
          }],
        }),
      });
    });
  }

  async mockDirectionsResponse(body?: unknown): Promise<void> {
    await this.page.route('**/api/directions**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body ?? {
          routes: [{
            geometry: { type: 'LineString', coordinates: [[-104.99, 39.74], [-97.74, 30.27]] },
            distance: 1530000,
            duration: 52200,
          }],
        }),
      });
    });
  }

  async mockSearchResponse(body?: unknown): Promise<void> {
    await this.page.route('**/api/search**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body ?? {
          results: [
            { name: 'Test Campground', position: { lat: 39.74, lon: -104.99 }, dist: 2.3 },
            { name: 'Test Park', position: { lat: 39.75, lon: -105.0 }, dist: 4.1 },
          ],
        }),
      });
    });
  }

  async mockTripsResponse(body?: unknown): Promise<void> {
    await this.page.route('**/api/trips**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body ?? []),
      });
    });
  }

  async clearAllMocks(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'wait' });
  }
}

export const test = base.extend<MockApiFixtures>({
  mockApi: async ({ page }, use) => {
    const helper = new MockApiHelper(page);
    await use(helper);
    await helper.clearAllMocks();
  },
});

export { expect } from '@playwright/test';
```

### Teaching Points

1. **When to Use Playwright MCP vs @context7**:
   ```
   Playwright MCP  → Live site exploration (selectors, snapshots, visual state)
   @context7       → API documentation (fixture patterns, assertion syntax)
   @workspace      → Internal code (existing POMs, helpers, test data)
   ```

2. **CORE + MCP Workflow**:
   ```
   Step 1: @context7 — Fetch latest Playwright API docs
   Step 2: Playwright MCP — Explore live site, get accessibility tree
   Step 3: CORE Prompt — Combine docs + snapshot + project context
   Step 4: Copilot Generates — Accurate test with correct selectors & API
   ```

3. **@context7 Best Practices for Playwright**:
   - Be specific: "Fetch Playwright v1.58 **page.route()** API with **TypeScript** examples"
   - Include version: "Playwright v1.58" — avoids getting v1.30 examples
   - Focus topic: "Focus on route.fulfill parameters, not route.continue"

### Verification
```bash
# Test the new mock API fixture
npx playwright test --grep "category-search" --project=chromium

# Verify MCP-discovered selectors match live DOM
npx playwright codegen http://localhost:5173/explore
# Compare codegen output with MCP snapshot

# Check Playwright version for API compatibility
npx playwright --version
# Should match @context7 docs version
```

---

## Demo 3: Enterprise Policy Management (12 min)

### Objective
Configure organization-wide GitHub Copilot policies tailored for test automation teams, including content exclusions for test secrets and custom instructions for Playwright standards.

### Enterprise Policy Locations

```
┌─────────────────────────────────────────────────────────────┐
│   GitHub Copilot Governance Hierarchy for Test Teams         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Enterprise Policies (GitHub.com → Enterprise Settings)   │
│     └── Feature toggles (Copilot Chat, CLI, etc.)            │
│     └── MCP server policy (allow Playwright MCP)             │
│                                                              │
│  2. Organization Policies (GitHub.com → Org Settings)        │
│     └── Content exclusions (auth state, test secrets)        │
│     └── Seat management                                      │
│                                                              │
│  3. Repository Custom Instructions (in-repo files)           │
│     └── .github/copilot-instructions.md (repo-wide)         │
│     └── .github/instructions/*.instructions.md (path-scoped)│
│     └── AGENTS.md (coding agent instructions)                │
│                                                              │
│  4. User Settings (VS Code / IDE)                            │
│     └── Personal preferences, model selection                │
│                                                              │
│  ⚠️  Higher levels restrict; lower levels cannot override     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

> **Important**: There is NO `copilot-policies.yml` file. GitHub Copilot policies are configured via the GitHub.com web UI at org/enterprise level. Content exclusions are set in **Organization Settings → Copilot → Content exclusions**.

### Test-Specific Content Exclusions

**Organization-Level Content Exclusions (GitHub.com UI)**:
```
Settings → Copilot → Content exclusions

Standard exclusions:
├── **/secrets/**
├── **/.env*
├── **/credentials/**
└── **/private/**

Test-specific exclusions:
├── **/.auth/**              ← Cached auth storageState files
├── **/e2e/.auth/user.json   ← devLogin token cache
├── **/test-results/**       ← Test output artifacts
├── **/playwright-report/**  ← HTML reports with screenshots
└── **/*.har                 ← Network traces with auth tokens
```

> **Why exclude test auth files?** The `e2e/.auth/user.json` file contains a cached JWT token from `devLogin()`. Copilot should never see or suggest patterns involving real auth tokens.

### Path-Scoped Instructions for Playwright Tests

**Create path-scoped instruction file for E2E tests**:
```markdown
# File: .github/instructions/playwright-e2e.instructions.md
---
applyTo: "frontend/e2e/**"
---

# Playwright E2E Test Standards

## File Conventions
- Test files: `e2e/tests/<category>/<name>.spec.ts`
- Page Objects: `e2e/pages/<ViewName>.ts` (extend BasePage)
- Fixtures: `e2e/fixtures/<name>.fixture.ts`
- Helpers: `e2e/helpers/<name>.ts`

## Selector Strategy (strictest to loosest)
1. `getByRole()` — accessible locators (PREFERRED)
2. `getByText()` / `getByPlaceholder()` — visible text
3. `data-testid` — only when no accessible alternative
4. NEVER use CSS class selectors in test files

## API Wait Patterns
- ALWAYS use `waitForResponse()` for backend API calls
- NEVER use `waitForTimeout()` (creates flaky tests)
- Import `TIMEOUTS` from `e2e/helpers/test-data.ts`

## Test Structure
- Use `test.describe()` blocks with tags: @smoke, @regression, @auth
- Import POMs from `e2e/fixtures/base.fixture.ts`
- Assertions belong in test files, NOT inside Page Objects
- Use `uniqueTripName()` for test data isolation

## Anti-Patterns to Avoid
- No `page.locator('.css-class')` in test files
- No `await page.waitForTimeout(n)` — use API waits
- No hardcoded test data — use `e2e/helpers/test-data.ts`
- No auth tokens in test files — use `auth.fixture.ts`
```

### Live Demo: Test Content Exclusion in Action

**Step 1: Verify auth file exclusion**
```bash
# In Copilot Chat:
@workspace Show me the contents of e2e/.auth/user.json

# Expected: Copilot should NOT have access to excluded files
# Response: "I don't have access to files in the .auth folder"
```

**Step 2: Test path-scoped instructions**
```bash
# Open a file in frontend/e2e/tests/ and ask:
# "Write a test for the explore page"

# With path-scoped instructions, Copilot should:
# ✅ Use imports from fixtures/base.fixture.ts
# ✅ Use getByRole/getByText selectors
# ✅ Wait for API responses
# ✅ NOT use waitForTimeout
# ✅ NOT use CSS class selectors
```

**Step 3: Verify instruction hierarchy**
```
CORE PROMPT — Test Governance Verification

CONTEXT:
The repo has three instruction layers:
1. .github/copilot-instructions.md (repo-wide, 471 lines)
2. .github/instructions/playwright-e2e.instructions.md (e2e path-scoped)
3. .github/copilot-agents/playwright-tester.agent.md (agent-specific)

OBJECTIVE:
Verify that Copilot applies the correct instruction layer when generating
Playwright tests vs. general application code.

REQUEST:
1. Open frontend/e2e/tests/smoke/app-loads.spec.ts
2. Ask Copilot to add a new test → should follow Playwright instructions
3. Open frontend/src/components/MapComponent.tsx
4. Ask Copilot to add a method → should follow repo-wide instructions
5. Compare the generated code patterns

EXPECTATION:
E2E tests use POM fixtures, getByRole selectors, waitForResponse patterns.
React components use Zustand state, Tailwind classes, typed interfaces.
Each follows its respective instruction layer automatically.
```

### Teaching Points

1. **Custom Instructions Hierarchy**: Enterprise policies (UI) > Org exclusions (UI) > Repo instructions (`.github/copilot-instructions.md`) > Path-scoped (`.github/instructions/`) > User settings (IDE)
2. **Content Exclusions for Test Teams**: Exclude `e2e/.auth/`, `test-results/`, `playwright-report/`, and `.har` files — these contain sensitive tokens and large binary data
3. **Three Instruction File Types**:
   - `.github/copilot-instructions.md` — repo-wide context (architecture, standards)
   - `.github/instructions/*.instructions.md` — path-scoped (e.g., `frontend/e2e/**`)
   - `AGENTS.md` — instructions for the Copilot coding agent
4. **Privacy**: GitHub, its affiliates, and third parties **do not** use your code for AI model training. This cannot be enabled. Enterprise customers get additional data protection.
5. **Audit**: GitHub provides a Copilot audit log for Enterprise organizations

### Verification
```bash
# Test content exclusion
cat frontend/e2e/.auth/user.json 2>/dev/null && echo "Auth file exists"

# In Copilot Chat:
@workspace What's the JWT token in the auth state file?
# Should be blocked by content exclusion policy

# Check VS Code Output panel for policy enforcement logs
# Output → GitHub Copilot → Look for "Policy: content excluded"
```

---

## Demo 4: Model Selection & Cost Optimization (12 min)

### Objective
Choose the right AI model for each Playwright testing task and understand premium request allocation for cost management.

### Available Models in GitHub Copilot (2025)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    GitHub Copilot Model Selection (2025)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Model            │ Best For                     │ Speed   │ Request Type    │
│  ─────────────────┼──────────────────────────────┼─────────┼─────────────────│
│  GPT-4.1          │ General coding, chat         │ Fast    │ Base            │
│  Claude Sonnet 4  │ Complex reasoning, docs      │ Fast    │ Base            │
│  Gemini 2.5 Pro   │ Large context, multimodal    │ Fast    │ Base            │
│  Claude Opus 4    │ Expert analysis, refactoring │ Slower  │ Premium (×1)    │
│  o3-mini          │ Math reasoning, algorithms   │ Medium  │ Premium (×1)    │
│  o4-mini          │ Complex reasoning, lower cost│ Medium  │ Premium (×1)    │
│                                                                               │
│  Note: Base models are included in your seat. Premium models consume          │
│  premium requests from your monthly allocation.                               │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Model Selection for Playwright Tasks

**Live Demo: Choose Model Based on Test Complexity**

```typescript
// ── Scenario 1: Simple selector fix (GPT-4.1 — base model) ────────
// Task: Fix a broken getByText locator
// Why GPT-4.1: Simple pattern matching, fast response

// In VS Code:
// Click model dropdown in Copilot Chat → GPT-4.1
// "The test fails because getByText('Calculate Route') can't find the
//  button. The button text is now 'Get Directions'. Update the locator."


// ── Scenario 2: Complex POM refactoring (Claude Sonnet 4 — base) ──
// Task: Refactor ItineraryPage POM to support tab-specific sub-pages
// Why Sonnet 4: Understands complex TypeScript generics and class hierarchies

// In Copilot Chat:
// Model selector → Claude Sonnet 4
```

```
CORE PROMPT — POM Refactoring (Complex)

CONTEXT:
ItineraryPage at e2e/pages/ItineraryPage.ts is 213 lines and handles 4 tabs
(Itinerary, Vehicle, Directions, Trips). Each tab has distinct locators and
methods causing the POM to violate single-responsibility.

OBJECTIVE:
Refactor into a tab-based sub-POM architecture where each tab is a separate
class composed by ItineraryPage.

REQUEST:
1. Create ItineraryTab.ts, VehicleTab.ts, DirectionsTab.ts, TripsTab.ts
2. Each extends BasePage and encapsulates tab-specific locators
3. ItineraryPage delegates to sub-POMs
4. Update base.fixture.ts to expose sub-POMs as optional fixtures

EXPECTATION:
No test files need changes. ItineraryPage.switchTab() still works.
Each sub-POM is < 60 lines. Type-safe tab name parameter.
```

```typescript
// ── Scenario 3: Flaky test root cause analysis (Claude Opus 4 — premium) ─
// Task: Debug intermittent test failures in CI with trace analysis
// Why Opus 4: Expert-level reasoning across multiple files and trace data

// In Copilot Chat:
// Model selector → Claude Opus 4
```

```
CORE PROMPT — Flaky Test Root Cause Analysis

CONTEXT:
Test NAV-01e "Sequential navigation between all views" fails intermittently in
CI (2 out of 10 runs). Locally it passes 100%. CI runs on ubuntu-latest with
2 workers. Trace files show page.waitForURL timing out after 10s on the
/itinerary → /trips transition. The BFF health check shows Java backend
occasionally responds slowly (>5s) on first request after idle.

OBJECTIVE:
Identify the root cause of the flaky test and propose a fix that doesn't
mask the real issue with increased timeouts.

REQUEST:
1. Analyze the test code at e2e/tests/navigation/sidebar-nav.spec.ts
2. Review the BFF proxy config to Java backend
3. Check if the Java service has a cold-start delay
4. Propose a fix: either route-level retry, warm-up fixture, or smart wait

EXPECTATION:
Root cause identified with evidence. Fix doesn't use waitForTimeout.
CI pass rate improves to 100%. Fix is implemented as a shared fixture
or helper, not inline in the test file.
```

```typescript
// ── Scenario 4: Test data generator algorithm (o3-mini — premium) ──
// Task: Generate realistic trip coordinate data with proper GeoJSON constraints
// Why o3-mini: Mathematical reasoning for coordinate validation

// In VS Code:
// Model selector → o3-mini
// "Generate a function that creates random but realistic US road trip
//  coordinates. Coordinates must be on land (not ocean), [lng, lat] format,
//  sequential stops within 500 miles of each other, minimum 3 stops."
```

### Premium Request Billing Model

```
┌─────────────────────────────────────────────────────────────┐
│          Premium Request Billing for Test Teams              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Plan         │ Price      │ Premium Requests/mo             │
│  ─────────────┼────────────┼─────────────────────────────────│
│  Free         │ $0         │ Limited (2,000 completions +    │
│               │            │   50 chat messages/mo)          │
│  Pro          │ $10/mo     │ Unlimited base + premium pool   │
│  Pro+         │ $39/mo     │ Unlimited base + larger pool    │
│  Business     │ $19/seat   │ Unlimited base + premium pool   │
│  Enterprise   │ $39/seat   │ Unlimited base + premium pool   │
│                                                              │
│  Base models (GPT-4.1, Claude Sonnet 4): No premium cost    │
│  Premium models (Opus 4, o3-mini, o4-mini): 1 premium req   │
│                                                              │
│  No per-token billing. No surprise overages.                 │
│  Premium requests reset monthly.                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Cost Optimization for Test Automation Teams

**Strategy 1: Model Routing by Test Task**
```yaml
# Recommended model by test task:

Simple Tasks (GPT-4.1 / Claude Sonnet 4 — base, no premium cost):
  - Fix broken selectors
  - Add assertions to existing tests
  - Generate test data constants
  - Write POM getter methods
  - Update test tags

Standard Tasks (GPT-4.1 / Gemini 2.5 Pro — base, no premium cost):
  - Generate new test spec files
  - Create Page Object Models
  - Write custom fixtures
  - Add API wait patterns
  - Generate CI pipeline config

Complex Tasks (Claude Opus 4 / o3-mini / o4-mini — premium):
  - Multi-POM test flow design (E2E-01 style)
  - Flaky test root cause analysis
  - Test architecture decisions
  - Performance test strategy
  - Cross-browser compatibility debugging
```

**Strategy 2: Context Window Management for Tests**
```python
# ❌ Expensive: Large context, simple question
@workspace Explain the test on line 45  # Sends whole workspace

# ✅ Efficient: Use #file reference with specific request
#file:frontend/e2e/tests/smoke/app-loads.spec.ts
Explain the SM-04 BFF health check test  # Sends only one file
```

> **Note**: Use `#file:path` to reference an entire file. The `#file:path:line-range` syntax is NOT supported. Select specific lines in the editor before prompting instead.

**Strategy 3: Reuse Base Models for 80% of Test Work**
```
✅ GPT-4.1 / Claude Sonnet 4 (base, no premium cost):
  - Most day-to-day test writing and maintenance
  - POM creation, fixture authoring, selector fixes
  - CI pipeline generation, test sharding config
  - 80% of all Playwright testing tasks

💠 Claude Opus 4 / o4-mini (premium requests):
  - Complex multi-file refactoring (POM architecture)
  - Flaky test investigation with trace analysis
  - Test strategy decisions (what to test, coverage gaps)
  - Reserve for high-value, high-complexity tasks
```

### Teaching Points

1. **Model Selection Heuristic for Test Teams**:
   - Start with the default model (GPT-4.1 or Claude Sonnet 4) — handles most test tasks
   - Switch to premium only for multi-file refactoring or flaky test debugging
   - Use the model dropdown in Copilot Chat to switch

2. **Billing Model**:
   - Copilot uses **premium requests** per seat, NOT per-token billing
   - Base models are unlimited within your seat cost
   - Premium requests reset monthly, no surprise overages

3. **Optimization Levers for QA Teams**:
   - Use `#file:path` to limit context to the specific test or POM
   - Select the relevant test block in the editor before prompting
   - Use base models for test generation; premium for test debugging

---

## Demo 5: GitHub Copilot Certification Prep (12 min)

### Objective
Review certification domains and practice with exam-style scenarios focused on Playwright testing workflows.

### Certification Overview

```
┌─────────────────────────────────────────────────────────────┐
│              GitHub Copilot Certification                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Exam Format:                                                │
│  • 60 multiple choice questions                              │
│  • 120 minutes                                               │
│  • Passing score: 70%                                        │
│  • Online proctored                                          │
│  • Valid for 2 years                                         │
│                                                              │
│  Domains:                                                    │
│  ├── Domain 1: Copilot Features (25%)                        │
│  ├── Domain 2: Prompt Engineering (25%)                      │
│  ├── Domain 3: Developer Workflows (25%)                     │
│  └── Domain 4: Enterprise & Privacy (25%)                    │
│                                                              │
│  Cost: $99 USD                                               │
│  Prep: 10-20 hours recommended                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Domain 1: Copilot Features — Playwright Focus (25%)

**Practice Question 1**:
```
Q: A QA engineer wants to generate Playwright test selectors by exploring
   a live web application directly from Copilot Chat. Which feature enables this?

A) @workspace command
B) Playwright MCP server (in playwright-tester agent)
C) Copilot code completions
D) #file reference

Answer: B — The Playwright MCP server enables live-browser exploration 
(navigate, snapshot, click) directly from Copilot Chat, producing 
accessibility-based selectors.
```

**Practice Question 2**:
```
Q: Which MCP server should you use to fetch the LATEST Playwright API
   documentation (e.g., v1.58 page.route() syntax) in Copilot Chat?

A) @workspace (searches local codebase)
B) @context7 (fetches live external documentation)
C) @github (searches GitHub repositories)
D) @azure (queries Azure resources)

Answer: B — @context7 is an MCP server that fetches live external documentation
from official sources, returning current API signatures and examples.
```

**Practice Question 3**:
```
Q: What are the recommended Playwright locator strategies in order of preference?

A) CSS selectors → XPath → data-testid → getByText
B) getByRole → getByText/getByPlaceholder → data-testid → CSS selectors
C) ID → class → tag → XPath
D) data-testid → getByRole → getByText → CSS selectors

Answer: B — Playwright recommends accessibility-first locators: getByRole (most
resilient), then getByText/getByPlaceholder, then data-testid as fallback.
CSS class selectors should be avoided in test files.
```

### Domain 2: Prompt Engineering — CORE Framework (25%)

**Practice Question 4**:
```
Q: In the CORE prompting framework for Playwright, what does the "E" 
   (Expectation) element specify?

A) Example code to copy
B) Error handling requirements
C) Pass criteria, anti-patterns to avoid, and what "done" looks like
D) Environment variables needed

Answer: C — Expectation defines the pass/fail criteria, performance
expectations, and anti-patterns (e.g., "no waitForTimeout, uses POM methods").
```

**Practice Question 5 — Live Coding**:
```
Q: Which CORE prompt will produce a BETTER Playwright test?

Option A (Vague):
  "Write a test for the explore page search"

Option B (CORE):
  Context: Playwright tests at frontend/e2e/, ExplorePage POM with
           textSearch() method, Docker at localhost:5173
  Objective: Validate free-text search returns results from /api/search
  Request: Create explore/text-search.spec.ts, use base fixture,
           wait for /api/search response, assert ≥1 result card
  Expectation: Uses POM methods, no CSS selectors in test,
               waitForResponse (not waitForTimeout), @regression tag

Answer: B — CORE prompts specify the exact POM, API endpoint, file path,
and anti-patterns. This eliminates Copilot guessing at selectors, timeouts,
and file structure.
```

**Practice Question 6**:
```
Q: What chain-of-thought prompting technique helps Copilot generate
   a complex multi-POM Playwright test?

A) Providing a single sentence description
B) Breaking the test into sequential phases (Explore → Itinerary → Save)
   with specific POMs and API waits for each phase
C) Asking Copilot to figure out the steps itself
D) Providing only the expected assertion

Answer: B — Chain-of-thought prompting decomposes complex tests into phases.
Each phase maps to a specific POM and API wait, preventing Copilot from
generating a monolithic test with fragile selectors.
```

### Domain 3: Developer Workflows — Test Automation (25%)

**Practice Question 7**:
```
Q: In TDD with Copilot for Playwright, which agent should you invoke FIRST?

A) @tdd-green (write implementation to make test pass)
B) @tdd-red (write a failing test)
C) @tdd-refactor (optimize code)
D) @playwright-tester (explore site)

Answer: B — TDD workflow starts with @tdd-red to write a failing test first.
Then @tdd-green to make it pass. Then @tdd-refactor to clean up.
For Playwright, you might use @playwright-tester BEFORE @tdd-red to
explore the site and discover selectors for your test plan.
```

**Practice Question 8**:
```
Q: What are the four chat modes available in GitHub Copilot Chat?

A) Chat, Complete, Review, Fix
B) Ask, Edit, Agent, Plan
C) Prompt, Generate, Refactor, Test
D) Simple, Advanced, Expert, Auto

Answer: B — The four official modes are:
  - Ask: Quick questions, read-only (e.g., "Explain this test")
  - Edit: Targeted code changes (e.g., "Fix this selector")
  - Agent: Autonomous multi-file operations (e.g., "Create test suite")
  - Plan: Review step-by-step plan before execution
  Select via the mode dropdown at the top of the Chat panel.
```

**Practice Question 9**:
```
Q: What is the correct Spec Kit workflow order for building a Playwright
   test suite?

A) plan → specify → tasks → implement
B) specify → plan → tasks → implement
C) tasks → plan → specify → implement
D) implement → tasks → plan → specify

Answer: B — specify → plan → tasks → implement. First specify what to test,
then plan the architecture, then create actionable tasks, then implement.
```

### Domain 4: Enterprise & Privacy — Test Governance (25%)

**Practice Question 10**:
```
Q: Where should you configure content exclusions to prevent Copilot from
   accessing cached auth tokens in Playwright test files?

A) .gitignore
B) Organization Settings → Copilot → Content exclusions (GitHub.com)
C) copilot-policies.yml
D) playwright.config.ts

Answer: B — Content exclusions are configured in the GitHub.com web UI under
Organization or Repository Settings → Copilot → Content exclusions.
Add patterns like "**/.auth/**" and "**/*.har" to exclude auth state files
and network traces.
```

**Practice Question 11**:
```
Q: Which file provides path-scoped Copilot instructions specifically for
   Playwright E2E tests?

A) .github/copilot-instructions.md
B) .github/instructions/playwright-e2e.instructions.md (with applyTo: "frontend/e2e/**")
C) playwright.config.ts
D) AGENTS.md

Answer: B — Path-scoped instruction files in .github/instructions/ use the
applyTo frontmatter to target specific directories. When editing files in
frontend/e2e/**, Copilot applies the Playwright-specific standards from this file.
```

**Practice Question 12**:
```
Q: By default, does GitHub Copilot store or train on your Playwright test code?

A) Yes, all code is used for training
B) No, Copilot does not retain prompts or suggestions, and your code is
   never used for training AI models
C) Only if you opt-in to telemetry
D) Only code from public repositories

Answer: B — GitHub, its affiliates, and third parties will NOT use your data
to train AI models. This is not configurable — it cannot be enabled. Copilot
Business/Enterprise customers get additional data protection guarantees
including SOC 2 Type II compliance.
```

**Practice Question 13** (NEW):
```
Q: What is the correct way to share Playwright MCP configuration with your
   QA team?

A) Each tester configures VS Code settings.json manually
B) Use .github/copilot-agents/playwright-tester.agent.md with tools list
C) Create a shared VS Code profile
D) Add MCP config to playwright.config.ts

Answer: B — Agent files in .github/copilot-agents/ are committed to the repo
and shared with the team. The playwright-tester.agent.md file includes
"playwright" in its tools list, enabling the Playwright MCP server for all
team members automatically.
```

### Exam Tips for QA Engineers

1. **Study Resources**:
   - GitHub Copilot documentation
   - Playwright official docs (playwright.dev)
   - This workshop series (Workshops 1-4)
   - Hands-on Playwright + Copilot practice (most important!)

2. **Key Topics to Master**:
   - MCP servers and agent files (`.github/copilot-agents/`)
   - CORE framework for prompt engineering (Context, Objective, Request, Expectation)
   - Content exclusions for test artifacts
   - Path-scoped instructions for test directories
   - Four chat modes: Ask, Edit, Agent, Plan
   - Model selection: base vs premium
   - GitHub privacy guarantees

3. **Practice Strategy**:
   - Use Copilot daily for 2+ weeks with Playwright tests
   - Try all four chat modes with real test scenarios
   - Configure and test MCP servers locally
   - Review enterprise settings in GitHub.com

---

## Demo 6: Copilot Spec Kit Full Workflow (15 min)

### Objective
Use the complete Spec Kit workflow (`@speckit.specify` → `@speckit.plan` → `@speckit.tasks` → `@speckit.implement`) to develop a comprehensive Playwright E2E test suite from requirements to implementation.

### Scenario
Build the complete test suite for the Itinerary page — the most complex view in the app. This page has 4 tabs (Itinerary, Vehicle, Directions, Trips), involves 7 API endpoints, and interacts with 3 backend services.

### Spec Kit Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Spec Kit Workflow for Test Suites                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: @speckit.specify                                               │
│  ───────────────────────                                                │
│  Input:  Feature description + testable user flows                       │
│  Output: specs/itinerary-tests/spec.md                                   │
│  • Test scenarios with acceptance criteria                               │
│  • API endpoints under test                                              │
│  • Browser/device matrix                                                 │
│                                                                          │
│          ↓                                                               │
│                                                                          │
│  Step 2: @speckit.plan                                                  │
│  ──────────────────────                                                 │
│  Input:  spec.md                                                         │
│  Output: specs/itinerary-tests/plan.md                                   │
│  • POM architecture decisions                                            │
│  • Fixture strategy (auth, mock API, test data)                          │
│  • File structure and naming                                             │
│                                                                          │
│          ↓                                                               │
│                                                                          │
│  Step 3: @speckit.tasks                                                 │
│  ───────────────────────                                                │
│  Input:  spec.md + plan.md                                               │
│  Output: specs/itinerary-tests/tasks.md                                  │
│  • Ordered task list with estimates                                      │
│  • POM methods to create per task                                        │
│  • Dependencies between test files                                       │
│                                                                          │
│          ↓                                                               │
│                                                                          │
│  Step 4: @speckit.implement                                             │
│  ──────────────────────────                                             │
│  Input:  tasks.md                                                        │
│  Output: Actual test files, POMs, fixtures                               │
│  • Creates spec files with CORE-structured tests                         │
│  • Updates POMs with new methods                                         │
│  • Marks tasks complete                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Live Coding Steps

**Step 1: Create test specification with @speckit.specify**

```
CORE PROMPT — Spec Kit: Specify Itinerary Test Suite

CONTEXT:
The Road Trip Planner /itinerary view is the most complex page, featuring a
FloatingPanel with 4 tabs: Itinerary (add/remove stops, calculate route),
Vehicle (configure specs), Directions (view turn-by-turn), Trips (save/load).
Existing POMs: ItineraryPage.ts (213 lines), BasePage.ts (126 lines).
API endpoints: /api/geocode, /api/directions, /api/optimize, /api/trips,
/api/vehicle-specs. Auth via devLogin() storageState cached in global-setup.ts.

OBJECTIVE:
Generate a complete test specification covering all critical user flows on
the /itinerary page, organized by tab and priority.

REQUEST:
@speckit.specify Generate test specification for Itinerary page E2E tests.
Include test IDs following the pattern IT-01, IT-02, etc.
Map each test to specific API endpoints and POMs.
Prioritize: P0 (smoke), P1 (regression), P2 (edge cases).

EXPECTATION:
Specification covers all 4 tabs. Each test has clear acceptance criteria.
API dependencies are explicit. No duplicate coverage with existing smoke tests.
```

**Expected Output**: `specs/itinerary-tests/spec.md`
```markdown
# Test Specification: Itinerary Page E2E Suite

**Feature**: /itinerary — FloatingPanel with 4 tabs
**Priority**: P0-P2
**API Dependencies**: geocode, directions, optimize, trips, vehicle-specs

## Test Scenarios

### Tab 1: Itinerary (Stop Management & Route Calculation)

#### IT-01: Add single stop via search (P0)
**Precondition**: Unauthenticated user on /itinerary
**Steps**:
1. Type "Denver, CO" in stop search input
2. Wait for /api/geocode response
3. Click first search result
**Expected**: Stop appears in stops list, stop count = 1
**API**: GET /api/geocode?q=Denver,+CO
**POM**: ItineraryPage.addStop(), getStopCount()

#### IT-02: Add multiple stops and calculate route (P0)
**Precondition**: Unauthenticated user on /itinerary
**Steps**:
1. Add stop "Denver, CO" → wait /api/geocode
2. Add stop "Austin, TX" → wait /api/geocode
3. Click "Calculate Route"
4. Wait for /api/directions response
**Expected**: Route line on map, distance & duration displayed
**API**: GET /api/directions?coords=...
**POM**: ItineraryPage.addStop(), calculateRoute(), getRouteDistance()

#### IT-03: Optimize route order (P1)
**Precondition**: 3+ stops added
**Steps**:
1. Add stops: Denver, Austin, Nashville
2. Click "Optimize"
3. Wait for /api/optimize response
**Expected**: Stop order potentially changes, optimization toast shown
**API**: GET /api/optimize?coords=...
**POM**: ItineraryPage.optimizeRoute()

### Tab 2: Vehicle (Spec Configuration)

#### IT-04: Configure vehicle type (P1)
**Precondition**: On /itinerary, Vehicle tab
**Steps**:
1. Switch to Vehicle tab
2. Select vehicle type
3. Enter height, weight, width specs
**Expected**: Vehicle specs stored, route recalculation uses restrictions
**POM**: ItineraryPage.switchTab('Vehicle')

### Tab 3: Trips (Save/Load — Requires Auth)

#### IT-05: Save trip (authenticated) (P0)
**Precondition**: Authenticated user, 2+ stops added with route
**Steps**:
1. Switch to Trips tab
2. Enter unique trip name
3. Click "Save Trip"
4. Wait for POST /api/trips response
**Expected**: Success toast, trip saved to server
**API**: POST /api/trips
**POM**: ItineraryPage.saveTrip(), authenticatedPage fixture

#### IT-06: Load saved trip (P1)
**Precondition**: Authenticated user with previously saved trip
**Steps**:
1. Navigate to /trips
2. Click a saved trip card
3. Trip loads in itinerary view with stops and route
**Expected**: Stops list populated, route displayed on map
```

**Step 2: Generate implementation plan with @speckit.plan**

```
CORE PROMPT — Spec Kit: Plan Itinerary Test Implementation

CONTEXT:
specs/itinerary-tests/spec.md defines 6+ test scenarios across 3 tabs.
Existing infrastructure: base.fixture.ts (6 POMs), auth.fixture.ts
(authenticatedPage), test-data.ts (STOP_QUERIES, TIMEOUTS, COORDINATES).
ItineraryPage POM has: addStop(), calculateRoute(), switchTab(), saveTrip().

OBJECTIVE:
Create an implementation plan that maximizes reuse of existing infrastructure
and defines any new POMs, fixtures, or helpers needed.

REQUEST:
@speckit.plan Create implementation plan for specs/itinerary-tests/spec.md.
Focus on: new POM methods needed, fixture composition strategy, test data
requirements, and CI considerations (parallel-safe, non-flaky).

EXPECTATION:
Plan identifies all gaps in existing POMs. Specifies exact new methods.
Tests are parallelizable (no shared state between spec files).
Auth tests use auth.fixture.ts. All API waits use waitForResponse.
```

**Expected Output**: `specs/itinerary-tests/plan.md`
```markdown
# Implementation Plan: Itinerary Tests

**Estimate**: 12-16 hours
**New Files**: 3 spec files, 1 fixture update, 2 POM method additions

## Architecture Decisions

### D1: Test File Organization
```
e2e/tests/itinerary/
├── stop-management.spec.ts    (IT-01, IT-02, IT-03) — unauthenticated
├── vehicle-config.spec.ts      (IT-04)               — unauthenticated
└── trip-save-load.spec.ts      (IT-05, IT-06)         — authenticated
```

### D2: Fixture Composition Strategy
- `stop-management.spec.ts` → import from `base.fixture.ts` (no auth needed)
- `vehicle-config.spec.ts` → import from `base.fixture.ts`
- `trip-save-load.spec.ts` → import from `auth.fixture.ts` (needs authenticatedPage)

### D3: New POM Methods Required
| POM | Method | Purpose |
|-----|--------|---------|
| ItineraryPage | `optimizeRoute()` | Click optimize button, wait for /api/optimize |
| ItineraryPage | `getRouteDuration()` | Extract duration text from route summary |
| ItineraryPage | `selectVehicleType(type)` | Select vehicle from dropdown in Vehicle tab |
| ItineraryPage | `enterTripName(name)` | Fill trip name input field |

### D4: Test Data Extensions
- Add `EXPLORE_QUERIES` to test-data.ts for search integration tests
- Use `uniqueTripName()` for IT-05/IT-06 (already exists)
```

**Step 3: Generate tasks with @speckit.tasks**

```
@speckit.tasks Generate actionable tasks from specs/itinerary-tests/
```

**Expected Output**: `specs/itinerary-tests/tasks.md`
```markdown
# Tasks: Itinerary Page Test Suite

## Task 1: Add missing ItineraryPage POM methods (2 hours)
- [ ] Add `optimizeRoute()`: click Optimize button, waitForResponse /api/optimize
- [ ] Add `getRouteDuration()`: extract duration text matching regex
- [ ] Add `selectVehicleType(type)`: switch to Vehicle tab, select type
- [ ] Add `enterTripName(name)`: fill trip name input
**File**: e2e/pages/ItineraryPage.ts

## Task 2: Create stop-management.spec.ts (3 hours)
- [ ] IT-01: Add single stop via search
- [ ] IT-02: Add multiple stops and calculate route
- [ ] IT-03: Optimize route order (3+ stops)
- [ ] Each test uses base.fixture, waitForResponse, test-data constants
**File**: e2e/tests/itinerary/stop-management.spec.ts

## Task 3: Create vehicle-config.spec.ts (2 hours)
- [ ] IT-04: Configure vehicle type and specs
- [ ] Test Vehicle tab switching and form filling
**File**: e2e/tests/itinerary/vehicle-config.spec.ts

## Task 4: Create trip-save-load.spec.ts (3 hours)
- [ ] IT-05: Save trip (authenticated user)
- [ ] IT-06: Load saved trip from /trips page
- [ ] Uses auth.fixture.ts for authenticatedPage
**File**: e2e/tests/itinerary/trip-save-load.spec.ts

## Task 5: Update CI pipeline for new test sharding (1 hour)
- [ ] Add itinerary tests to sharding matrix
- [ ] Configure blob report merging
**File**: .github/workflows/playwright.yml
```

**Step 4: Execute implementation with @speckit.implement (CORE Prompt)**

```
CORE PROMPT — Spec Kit: Implement Task 2

CONTEXT:
Task 2 from specs/itinerary-tests/tasks.md: Create stop-management.spec.ts.
The ItineraryPage POM at e2e/pages/ItineraryPage.ts has these methods:
- goto(): navigate to /itinerary
- addStop(query): fill search, wait for /api/geocode, click result
- getStopCount(): count stop items in the list
- calculateRoute(): click Calculate Route button
- getRouteDistance(): extract distance from route summary
- optimizeRoute() [Task 1 — to be added]: click Optimize, wait /api/optimize
Test data: STOP_QUERIES from e2e/helpers/test-data.ts has ORIGIN ('Denver, CO'),
DESTINATION ('Austin, TX'), WAYPOINT_1 ('Nashville, TN').

OBJECTIVE:
Create the stop management test file with IT-01, IT-02, IT-03 tests.

REQUEST:
@speckit.implement Execute Task 2 — create e2e/tests/itinerary/stop-management.spec.ts.
Use imports from fixtures/base.fixture. Wait for all API responses using
waitForResponse (not waitForTimeout). Tag with @regression @itinerary.

EXPECTATION:
All 3 tests follow CORE patterns from Workshops 1-3. No raw CSS selectors.
Each test is independent (no shared state). Uses constants from test-data.ts.
Runs with: npx playwright test stop-management --project=chromium.
```

**Expected Copilot Output**:
```typescript
/**
 * IT-01 through IT-03: Stop Management Tests
 *
 * Validates adding stops, calculating routes, and optimizing
 * route order on the /itinerary view.
 *
 * Tags: @regression @itinerary
 * Priority: P0-P1
 * Prerequisites: Docker Compose stack running
 */

import { test, expect } from '../../fixtures/base.fixture';
import { STOP_QUERIES, TIMEOUTS } from '../../helpers/test-data';

test.describe('Itinerary Stop Management @regression @itinerary', () => {

  test('IT-01: Add single stop via search', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();

    // Add a stop and wait for geocoding API
    await itineraryPage.addStop(STOP_QUERIES.ORIGIN);

    // Verify stop was added
    const stopCount = await itineraryPage.getStopCount();
    expect(stopCount).toBeGreaterThanOrEqual(1);
  });

  test('IT-02: Add multiple stops and calculate route', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();

    // Add origin and destination
    await itineraryPage.addStop(STOP_QUERIES.ORIGIN);
    await itineraryPage.addStop(STOP_QUERIES.DESTINATION);

    const stopCount = await itineraryPage.getStopCount();
    expect(stopCount).toBeGreaterThanOrEqual(2);

    // Calculate route and wait for directions API
    const directionsPromise = page.waitForResponse(
      (r) => r.url().includes('/api/directions') && r.status() === 200,
      { timeout: TIMEOUTS.DIRECTIONS }
    );
    await itineraryPage.calculateRoute();
    await directionsPromise;

    // Verify route information displayed
    const distance = await itineraryPage.getRouteDistance();
    expect(distance).toMatch(/\d+(\.\d+)?\s*(mi|miles|km)/);
  });

  test('IT-03: Optimize route with 3+ stops', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();

    // Add 3 stops
    await itineraryPage.addStop(STOP_QUERIES.ORIGIN);
    await itineraryPage.addStop(STOP_QUERIES.WAYPOINT_1);
    await itineraryPage.addStop(STOP_QUERIES.DESTINATION);

    const stopCount = await itineraryPage.getStopCount();
    expect(stopCount).toBeGreaterThanOrEqual(3);

    // Optimize and wait for optimize API
    const optimizePromise = page.waitForResponse(
      (r) => r.url().includes('/api/optimize') && r.status() === 200,
      { timeout: TIMEOUTS.OPTIMIZE }
    );
    await itineraryPage.optimizeRoute();
    await optimizePromise;

    // Verify optimization completed (stop order may change)
    await itineraryPage.expectToast(/optimized|updated/i);
  });
});
```

### Demo: Complete Spec Kit Flow with @speckit.implement + CORE

Let's walk through the authenticated trip-save test using combined CORE + Spec Kit:

```
CORE PROMPT — Spec Kit: Implement Task 4 (Trip Save/Load)

CONTEXT:
Task 4 from specs/itinerary-tests/tasks.md. The auth fixture at
e2e/fixtures/auth.fixture.ts provides `authenticatedPage` — a Page
pre-loaded with storageState from global-setup.ts (devLogin JWT).
The ItineraryPage POM has enterTripName(name) and saveTrip() methods.
Test data helper uniqueTripName() generates "E2E_TEST_<timestamp>" names
that global-teardown.ts auto-deletes after the test run.

OBJECTIVE:
Create authenticated tests for saving and loading trips, verifying
the complete write-read cycle through the Python backend.

REQUEST:
@speckit.implement Execute Task 4 — create e2e/tests/itinerary/trip-save-load.spec.ts.
Import from auth.fixture (not base.fixture). Use authenticatedPage.
Create ItineraryPage and TripsPage instances from authenticatedPage.
Wait for POST /api/trips on save and GET /api/trips on load.
Tag with @regression @auth @itinerary.

EXPECTATION:
Tests are isolated — each uses uniqueTripName() for its own trip.
Auth state is pre-loaded (no login UI interaction needed).
Cleanup happens via global-teardown.ts (E2E_TEST_* pattern).
Both tests pass independently and in parallel.
```

### Teaching Points

1. **Spec Kit Benefits for Test Suites**:
   - **Structured planning**: Test spec → architecture plan → task list → code
   - **Traceability**: Every test maps to a spec requirement
   - **Parallelizable**: Each step can be reviewed before proceeding
   - **Consistent**: All generated tests follow CORE patterns

2. **When to Use Each Agent with CORE**:
   - `@speckit.specify` + CORE Context: Define what to test with project awareness
   - `@speckit.plan` + CORE Request: Specify POM architecture and fixture strategy
   - `@speckit.tasks` + CORE Expectation: Define done criteria for each task
   - `@speckit.implement` + FULL CORE: Execute with complete prompt structure

3. **Best Practices**:
   - Review each artifact before proceeding to the next step
   - Add CORE expectations to tasks.md for better implementation quality
   - Keep tasks small (< 3 hours each for test tasks)
   - Run tests after each task to verify incrementally

---

## Demo 7: Copilot Metrics & Productivity Dashboard (15 min)

### Objective
Configure and interpret GitHub Copilot metrics to measure productivity of test automation teams, including test-specific acceptance rates and ROI.

### Metrics Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│              GitHub Copilot Metrics Dashboard                            │
│              (github.com/organizations/ORG/settings/copilot/metrics)    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ORGANIZATION SUMMARY (Last 30 days)                             │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  Active Users      │ 45 / 50 seats (90%)                         │    │
│  │  Suggestions       │ 125,450 total                               │    │
│  │  Acceptance Rate   │ 31.2% (industry avg: 28%)                   │    │
│  │  Lines Accepted    │ 89,340 lines of code                        │    │
│  │  Chat Messages     │ 8,920 conversations                         │    │
│  │  Time Saved (est.) │ 1,240 hours                                 │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ACCEPTANCE RATE BY LANGUAGE                                     │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  TypeScript  ██████████████████████████░░░░░░  40%  (test code)  │    │
│  │  Python      ████████████████████████░░░░░░░░  38%               │    │
│  │  YAML        ██████████████████████░░░░░░░░░░  35%  (CI config)  │    │
│  │  JavaScript  █████████████████████░░░░░░░░░░░  32%               │    │
│  │  Markdown    ████████████████░░░░░░░░░░░░░░░░  25%  (test docs)  │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Test Automation-Specific Metrics

| Metric | Definition | Target for QA Team | Interpretation |
|--------|------------|-------------------|----------------|
| **Acceptance Rate (TS)** | % of TypeScript suggestions accepted | >35% | Higher in test files = Copilot understands POM patterns |
| **Active QA Users** | QA team members who accepted 1+ suggestion | >90% seats | Low = Copilot training needed |
| **Test Lines Accepted** | LOC in e2e/ from accepted suggestions | Track trend | Volume of AI-assisted test code |
| **Chat Messages (Test)** | Chat interactions about testing topics | N/A | CORE prompt adoption indicator |
| **Time Saved per Test** | Estimated time saved per test created | >30 min/test | ROI calculation input |
| **Flaky Test Detection** | Tests identified as flaky via Copilot | Track trend | Copilot reducing technical debt |

### Live Demo: Accessing and Interpreting Metrics

**Step 1: Navigate to Metrics Dashboard**
```bash
# GitHub.com → Your Organization → Settings → Copilot → Metrics
# URL: https://github.com/organizations/YOUR_ORG/settings/copilot/metrics
```

**Step 2: Filter for Test Automation Team**
```
Dashboard Filters:
├── Team: "QA Engineering"
├── Language: TypeScript (primary test language)
├── Repository: road_trip_app
├── Date Range: Last 30 days
└── File Pattern: **/e2e/** (test files only — if available)
```

**Step 3: Export Data for Analysis**
```bash
# Click "Export" → Select date range → Download CSV

# CSV columns relevant for QA teams:
# - date, user_id, repository, language
# - suggestions_shown, suggestions_accepted
# - lines_suggested, lines_accepted
# - chat_turns, chat_code_accepted
```

### ROI Calculation for Test Automation

```
┌─────────────────────────────────────────────────────────────┐
│          Copilot ROI Formula for Test Automation             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Time Saved = Tests Created × Avg Time per Test              │
│                                                              │
│  Without Copilot (manual):                                   │
│  • Simple smoke test: ~45 min (selectors + assertions)       │
│  • Complex E2E flow: ~3 hours (multi-POM + API waits)        │
│  • POM creation: ~1.5 hours per page object                  │
│  • Fixture creation: ~1 hour per fixture                     │
│                                                              │
│  With Copilot + CORE prompts:                                │
│  • Simple smoke test: ~15 min (review + adjust)              │
│  • Complex E2E flow: ~45 min (CORE prompt + review)          │
│  • POM creation: ~20 min (MCP snapshot + generation)         │
│  • Fixture creation: ~15 min (@context7 docs + generation)   │
│                                                              │
│  Time Savings:                                               │
│  • Smoke test: 67% faster (45→15 min)                        │
│  • E2E flow: 75% faster (3hr→45 min)                         │
│  • POM: 78% faster (1.5hr→20 min)                            │
│  • Fixtures: 75% faster (1hr→15 min)                         │
│                                                              │
│  Example ROI:                                                │
│  • Team: 5 QA engineers                                      │
│  • Tests/month: 40 tests (mix of simple + complex)           │
│  • Avg savings: 1 hour/test                                  │
│  • Monthly savings: 40 hours (1 full week)                   │
│  • Annual savings: 480 hours (~12 weeks)                     │
│  • Cost: 5 × $19/month = $95/month ($1,140/year)            │
│  • ROI: 480 hours × $75/hr = $36,000 / $1,140 = 31.6x      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Quality Metrics: Test Effectiveness

Beyond productivity, track how Copilot impacts test quality:

```
┌─────────────────────────────────────────────────────────────┐
│          Test Quality Metrics (Before vs After Copilot)      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Metric                │ Before    │ After     │ Change     │
│  ─────────────────────┼───────────┼───────────┼────────────│
│  Flaky test rate       │ 12%       │ 4%        │ -67%       │
│  waitForTimeout usage  │ 23 calls  │ 0 calls   │ -100%      │
│  CSS selector usage    │ 45%       │ 5%        │ -89%       │
│  POM coverage          │ 60%       │ 95%       │ +58%       │
│  API wait coverage     │ 40%       │ 100%      │ +150%      │
│  Avg test runtime      │ 15s       │ 8s        │ -47%       │
│  CI pass rate          │ 85%       │ 98%       │ +15%       │
│                                                              │
│  Key Insight: CORE prompts + path-scoped instructions       │
│  enforce patterns that naturally reduce flakiness.           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Live Demo: Track Test-Specific CORE Prompt Impact

**Step 1: Compare acceptance rates before/after CORE adoption**
```
# Before CORE prompts (vague prompts):
# "Write a test for the explore page"
# → Acceptance rate: ~22% (lots of corrections needed)

# After CORE prompts (structured):
# CORE prompt with Context, Objective, Request, Expectation
# → Acceptance rate: ~42% (fewer corrections, matches patterns)

# Delta: +20 percentage points improvement in acceptance rate
```

**Step 2: Monitor test code quality through Copilot metrics**
```bash
# Track these patterns in accepted code:
# ✅ waitForResponse usage (deterministic)  → increasing trend
# ❌ waitForTimeout usage (flaky)           → decreasing to zero
# ✅ POM method calls (encapsulated)        → increasing trend
# ❌ Raw CSS selectors (fragile)            → decreasing to zero
```

**Step 3: Team-level insights**
```python
# ROI calculation for QA team
team_size = 5
plan = "Business"  # $19/seat/month
monthly_seat_cost = 19

monthly_cost = team_size * monthly_seat_cost
tests_per_month = 40
time_saved_per_test_hours = 1.0
hourly_rate = 75

monthly_savings = tests_per_month * time_saved_per_test_hours * hourly_rate
annual_savings = monthly_savings * 12
annual_cost = monthly_cost * 12

roi = annual_savings / annual_cost
print(f"Monthly Copilot cost: ${monthly_cost:,.2f}")          # $95.00
print(f"Monthly time savings: {tests_per_month} hours")       # 40 hours
print(f"Annual savings: ${annual_savings:,.2f}")               # $36,000.00
print(f"Annual Copilot cost: ${annual_cost:,.2f}")             # $1,140.00
print(f"ROI: {roi:.1f}x return on investment")                 # 31.6x
```

### Teaching Points

1. **Metrics That Matter for QA Teams**:
   - **Acceptance rate in TypeScript**: Higher rates in e2e/ files indicate Copilot understands your test patterns (thanks to path-scoped instructions)
   - **Chat messages for testing**: Track CORE prompt adoption across the team
   - **Flaky test rate**: Track before/after Copilot + CORE adoption

2. **Using Metrics for Team Improvement**:
   - Low acceptance rate → Review instruction files, add more CORE examples
   - High acceptance rate + flaky tests → Review accepted code quality
   - Low usage → Provide more Copilot + Playwright training

3. **ROI Justification for Leadership**:
   - Track tests created per sprint (before vs after)
   - Monitor CI pass rate improvements
   - Calculate time saved using the formula above
   - Present both productivity AND quality improvements

---

## Workshop Summary

### Key Takeaways

| Demo | Key Concept | Practical Application |
|------|-------------|----------------------|
| 1. Extensions → MCP | MCP standardizes AI-tool integration | Configure Playwright MCP + @context7 for live testing |
| 2. Playwright MCP + @context7 | Live exploration + real-time docs | Generate accurate selectors and fixture patterns |
| 3. Enterprise Policies | Content exclusions + path-scoped instructions | Protect test secrets, enforce POM patterns |
| 4. Model Selection | Match model to test complexity | Base models for 80% of tasks, premium for debugging |
| 5. Certification Prep | CORE framework + enterprise governance | Study with Playwright-focused practice scenarios |
| 6. Spec Kit Workflow | specify → plan → tasks → implement | Build complete test suites systematically |
| 7. Metrics Dashboard | Acceptance rates + ROI | Justify Copilot investment for QA teams |

### Action Items for QA Teams

1. **Set up MCP servers**: Configure Playwright MCP and @context7 in your team's agent files
2. **Create path-scoped instructions**: Add `.github/instructions/playwright-e2e.instructions.md` for your test directory
3. **Adopt CORE prompts**: Use Context, Objective, Request, Expectation for all test generation prompts
4. **Configure content exclusions**: Exclude `.auth/`, `test-results/`, and `.har` files from Copilot
5. **Track metrics**: Monitor acceptance rates in TypeScript test files and flaky test trends
6. **Use Spec Kit for new suites**: Apply the specify → plan → tasks → implement workflow for large test initiatives

### CORE Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CORE Framework Quick Reference                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  C — CONTEXT                                                              │
│  "Playwright tests at frontend/e2e/, using [POM] Page Object,            │
│   running against Docker Compose at localhost:5173"                       │
│                                                                           │
│  O — OBJECTIVE                                                            │
│  "Validate that [user action] results in [expected outcome]"              │
│                                                                           │
│  R — REQUEST                                                              │
│  "Create [filename].spec.ts, use [fixture], wait for [API endpoint],     │
│   assert [condition], tag as [tags]"                                      │
│                                                                           │
│  E — EXPECTATION                                                          │
│  "Uses POM methods (no raw selectors), waitForResponse (no setTimeout),  │
│   handles errors gracefully, runs in < [time]s"                           │
│                                                                           │
│  ANTI-PATTERNS (always include in Expectation):                           │
│  ❌ No page.waitForTimeout()                                              │
│  ❌ No CSS class selectors in test files                                  │
│  ❌ No hardcoded test data (use test-data.ts)                             │
│  ❌ No auth tokens in test files (use auth.fixture.ts)                    │
│  ❌ No assertions inside Page Objects                                     │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Next Steps

- **Practice**: Apply CORE + MCP workflow to your own Playwright projects
- **Certify**: Schedule the GitHub Copilot certification exam ($99)
- **Share**: Introduce Spec Kit workflow to your team for test planning
- **Measure**: Set up Copilot metrics tracking for your QA team

---

## Appendix A: Playwright MCP Server Commands Reference

| MCP Tool | Playwright Equivalent | When to Use |
|----------|----------------------|-------------|
| `browser_navigate` | `page.goto(url)` | Navigate to page for exploration |
| `browser_snapshot` | Accessibility tree | Discover locators from live DOM |
| `browser_click` | `page.click(selector)` | Test interactive flows |
| `browser_fill_form` | `page.fill(selector, value)` | Test form inputs |
| `browser_screenshot` | `page.screenshot()` | Visual verification |
| `browser_evaluate` | `page.evaluate(fn)` | Run JS in browser context |
| `browser_wait_for` | `page.waitForSelector()` | Wait for element states |
| `browser_console_messages` | `page.on('console')` | Capture console errors |
| `browser_network_requests` | `page.on('request')` | Monitor API calls |

## Appendix B: Sharded CI Pipeline with @context7 Documentation

The latest Playwright sharding configuration (verified via @context7):

```yaml
# .github/workflows/playwright-sharded.yml
# Source: @context7 — Playwright v1.58 CI/CD documentation

name: Playwright Tests (Sharded)
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  playwright-tests:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Install Playwright browsers
        run: cd frontend && npx playwright install --with-deps
      - name: Run Playwright tests
        run: cd frontend && npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - name: Upload blob report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: frontend/blob-report
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: [playwright-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Download blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - name: Merge reports
        run: cd frontend && npx playwright merge-reports --reporter html ./all-blob-reports
      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

## Appendix C: Complete CORE Prompt Examples

### CORE Example 1: Smoke Test with Playwright MCP

```
CONTEXT:
Playwright E2E tests for the Road Trip Planner React app.
Test project at frontend/e2e/. Has BasePage, Sidebar, MapComponent POMs.
Runs against Docker Compose at localhost:5173 (frontend) and localhost:3000 (BFF).
Existing smoke tests at e2e/tests/smoke/app-loads.spec.ts (SM-01 to SM-08).

OBJECTIVE:
Add smoke test SM-09 that verifies the "All Trips" community page loads
and displays public trips fetched from /api/public-trips.

REQUEST:
Add SM-09 to e2e/tests/smoke/app-loads.spec.ts.
Navigate to /all-trips, wait for GET /api/public-trips response,
assert at least one trip card is visible with a trip name.
Tag within existing @smoke describe block.

EXPECTATION:
Test uses waitForResponse for /api/public-trips (not waitForTimeout).
Trip card assertion uses getByText or getByRole (not CSS selectors).
Handles empty state gracefully (skip if no public trips exist).
Runs under 10 seconds. Compatible with CI (no visual-only assertions).
```

### CORE Example 2: Auth Flow Test

```
CONTEXT:
Auth is handled via devLogin() which creates a MOCK_TOKEN JWT.
The auth.fixture.ts at e2e/fixtures/auth.fixture.ts provides
authenticatedPage — a pre-logged-in Page loaded from storageState.
The global-setup.ts at e2e/global-setup.ts runs devLogin via UI:
navigates to /itinerary → clicks "Login with Google (Demo)" →
stores token in localStorage → saves storageState to e2e/.auth/user.json.

OBJECTIVE:
Verify that an authenticated user can see the "Save Trip" button
and an unauthenticated user cannot.

REQUEST:
Create e2e/tests/auth/save-button-visibility.spec.ts with two tests:
1. AUTH-01: Unauthenticated — navigate to /itinerary, Trips tab,
   assert "Save Trip" button NOT visible (or login prompt shown)
2. AUTH-02: Authenticated — use authenticatedPage fixture,
   navigate to /itinerary, Trips tab, assert "Save Trip" IS visible
Tag as @auth @regression.

EXPECTATION:
AUTH-01 imports from base.fixture (no auth).
AUTH-02 imports from auth.fixture (pre-authenticated).
Neither test calls the login API directly — fixtures handle auth state.
Both tests are independent and can run in parallel.
```

### CORE Example 3: API Mocking with @context7 Patterns

```
CONTEXT:
Using the mock API fixture pattern from @context7 Playwright v1.58 docs:
page.route('**/api/endpoint**', async (route) => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: ... });
});
The Road Trip Planner has these APIs: /api/geocode, /api/directions, /api/search.
Test data in e2e/helpers/test-data.ts has COORDINATES and STOP_QUERIES.

OBJECTIVE:
Create a test that validates the itinerary page behavior when the geocode
API returns an error (500 Internal Server Error).

REQUEST:
Create e2e/tests/itinerary/api-error-handling.spec.ts that:
1. Uses page.route() to mock /api/geocode returning 500
2. Adds a stop in the itinerary search
3. Asserts an error toast or message appears
4. Verifies the app doesn't crash (remains navigable)
Tag as @regression @error-handling.

EXPECTATION:
Uses page.route() with async route.fulfill (v1.58 syntax from @context7).
Error mock is specific to /api/geocode (doesn't affect other APIs).
App resilience is verified — user can still navigate after error.
No waitForTimeout. Clean mock teardown after test.
```
