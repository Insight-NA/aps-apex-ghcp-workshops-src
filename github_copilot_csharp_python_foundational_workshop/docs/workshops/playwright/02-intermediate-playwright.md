# Workshop 2: Intermediate Playwright Testing with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: Test engineers / developers with Copilot foundational knowledge (completed Workshop 1)  
**Prerequisites**: VS Code with GitHub Copilot + Playwright Test extensions, Docker Compose stack running, Playwright browsers installed (see `docs/workshops/playwright/setup/00-setup-instructions.md`)

---

## Learning Objectives

By the end of this workshop, you will be able to:

1. **Inline Code Suggestions & NES** — Accept ghost text and Next Edit Suggestions when writing Page Object Models and test specs
2. **CORE Framework Prompting** — Write structured prompts using **C**ontext → **O**bjective → **R**equest → **E**xpectation that generate accurate, project-aware Playwright tests
3. **Comment-Based Generation** — Generate complete test cases from descriptive comments placed above test functions
4. **Code Explanations** — Use Ask mode to understand complex test infrastructure (auth caching, fixtures, global setup)
5. **Code Refactoring** — Use Agent mode to extract duplicate patterns across Page Object Models into shared utilities
6. **Few-Shot Prompting** — Teach Copilot your POM patterns by showing examples before requesting new Page Objects
7. **Test Generation & Debugging** — Generate test suites and debug flaky tests with Copilot
8. **Copilot CLI** — Generate Playwright commands, codegen invocations, and CI pipeline snippets from natural language

---

## The CORE Prompting Framework

Every demo in this workshop uses the **CORE Framework** — a structured prompting technique purpose-built for generating Playwright tests with GitHub Copilot.

> 📝 **CORE = Context → Objective → Request → Expectation**

| Section | Purpose | Example |
|---------|---------|---------|
| **C — Context** | Describe the app, test infrastructure, file locations, and relevant POMs | "You are writing Playwright E2E tests for a React road trip planner. The test project is at `frontend/e2e/`, uses POMs in `e2e/pages/`, and runs against Docker Compose at `localhost:5173`." |
| **O — Objective** | State the testing goal clearly | "Create a test that validates the category pill search flow returns results." |
| **R — Request** | List specific steps, files to create, tags, fixtures to use | "Create `e2e/tests/explore/category-search.spec.ts` that: 1. Navigates to `/explore`... 2. Clicks category pill... 3. Waits for API..." |
| **E — Expectation** | Define pass/fail criteria, patterns to follow, anti-patterns to avoid | "Test passes with `npx playwright test category-search`, uses POM methods (no raw selectors in tests), waits for API responses (not arbitrary timeouts)." |

### CORE vs. Vague Prompts — Comparison

```
❌ VAGUE: "Write a test for the explore page"

✅ CORE:
  Context:     React road trip planner, e2e/ project structure, ExplorePage POM at 
               e2e/pages/ExplorePage.ts, Docker Compose at localhost:5173
  Objective:   Validate category pill search returns results and displays them
  Request:     Create spec file with @regression tag, use explorePage fixture, 
               wait for /api/search response, assert ≥1 result card
  Expectation: Uses POM methods only, no raw selectors, explicit API waits, 
               handles empty results gracefully
```

---

## Copilot Chat Modes (2025+)

GitHub Copilot in VS Code uses three built-in modes instead of slash commands:

| Mode | Purpose | When to Use for Playwright |
|------|---------|---------------------------|
| **Ask mode** | Read-only Q&A, explanations | Understanding global-setup.ts auth flow, fixture inheritance |
| **Agent mode** | Autonomous multi-step edits | Refactoring POMs, generating test suites, creating new fixtures |
| **Plan mode** | Generate a plan before editing | Complex test infrastructure changes requiring review |

> ⚠️ **Note**: The old slash commands (`/explain`, `/fix`, `/tests`, `/refactor`) have been replaced by natural language prompts in these modes. Use `#selection`, `#file:`, and `#codebase` to provide context.

---

## Workshop Agenda

| Time | Demo | Learning Objective | File(s) |
|------|------|-------------------|---------|
| 0-10 min | Demo 1 | **Inline Suggestions & NES** | `e2e/pages/ItineraryPage.ts`, `e2e/helpers/selectors.ts` |
| 10-25 min | Demo 2 | **CORE Framework Prompting** | New: `e2e/tests/explore/category-search.spec.ts` |
| 25-35 min | Demo 3 | **Comment-Based Generation** | `e2e/tests/navigation/sidebar-nav.spec.ts` |
| 35-45 min | Demo 4 | **Code Explanations** (Ask mode) | `e2e/global-setup.ts`, `e2e/fixtures/auth.fixture.ts` |
| 45-55 min | Demo 5 | **Refactoring** (Agent mode) | `e2e/pages/BasePage.ts`, `e2e/pages/ItineraryPage.ts` |
| 55-65 min | Demo 6 | **Few-Shot Prompting** | New: `e2e/pages/LoginPage.ts` |
| 65-80 min | Demo 7 | **Test Generation & Debugging** | New: `e2e/tests/auth/login-logout.spec.ts`, `demo-04-flaky.spec.ts` |
| 80-90 min | Demo 8 | **Copilot CLI** | Terminal |

> **All file paths are relative to `frontend/`** unless stated otherwise.

---

## Demo 1: Inline Code Suggestions & Next Edit Suggestions (10 min)

### Learning Objective
Accept ghost text completions and use Next Edit Suggestions (NES) to navigate related edits across Page Object Models and helper files.

### Scenario
Add a new method to `ItineraryPage.ts` that retrieves POI search results displayed after clicking a Gas/Food/Sleep button. Copilot will recognize the existing method patterns and suggest the complete implementation. Then use NES to propagate a matching locator constant into `selectors.ts`.

### Before Demo: Setup
```bash
# Open the Itinerary page object
code frontend/e2e/pages/ItineraryPage.ts

# Review existing method patterns (lines 42-80):
# - addStop(query)      → fills input, waits for API, clicks result
# - calculateRoute()    → clicks button, waits for /api/directions
# - searchPOIAlongRoute(category) → clicks button, waits for /api/search
```

### Live Coding Steps

**Step 1: Position cursor after the `searchPOIAlongRoute` method (end of file)**
```typescript
// Navigate to the end of ItineraryPage.ts, after searchPOIAlongRoute method
// Press Enter twice to create whitespace, then start typing:
```

**Step 2: Type the beginning of a new method**
```typescript
  /** Get the list of POI results displayed after a POI search */
  async getPOIResults
```

**Expected Copilot Inline Suggestion** (appears as ghost text):
```typescript
  /** Get the list of POI results displayed after a POI search */
  async getPOIResultCount(): Promise<number> {
    const results = this.page.locator('[class*="border rounded-xl"]').filter({
      has: this.page.locator('h3, h4'),
    });
    return await results.count();
  }
```

**Step 3: Accept with Tab key**
- Press `Tab` to accept the entire suggestion
- Or use `Ctrl+→` (Windows) / `Cmd+→` (Mac) to accept word-by-word

**Step 4: Add another related method — partial acceptance**
```typescript
  /** Assert that POI markers are visible on the map after search */
  async expectPOIMarkers
```

**Copilot suggests** (accept partially, then modify):
```typescript
  /** Assert that POI markers are visible on the map after search */
  async expectPOIMarkersVisible(minCount: number = 1): Promise<void> {
    const markers = this.page.locator('.mapboxgl-marker');
    await expect(markers).toHaveCount(minCount, { timeout: 10_000 });
  }
```

### Next Edit Suggestions (NES)

> 🆕 **Next Edit Suggestions** predict where you'll need to edit next after making a change. After adding the POI methods, look for a decorating arrow in the gutter — press `Tab` to jump to the next related edit location.

**How NES works in this context:**
1. You add `getPOIResultCount()` to `ItineraryPage.ts`
2. Copilot detects that `selectors.ts` has related constants (the `ITINERARY` object) that may need updating
3. A gutter arrow appears → press `Tab` to jump to `selectors.ts`
4. Copilot suggests adding a `poiResults` selector constant:
```typescript
// In selectors.ts, inside the ITINERARY object:
  /** POI search result cards */
  poiResults: '[class*="border rounded-xl"]',
```
5. Accept or dismiss, then Tab to the next location (e.g., `base.fixture.ts` if a new fixture is needed)

### Teaching Points

| Action | Shortcut (Windows) | Shortcut (Mac) |
|--------|-------------------|----------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Ctrl+→` | `Cmd+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See alternatives | `Alt+]` / `Alt+[` | `Alt+]` / `Alt+[` |
| Jump to next edit (NES) | `Tab` (on gutter arrow) | `Tab` (on gutter arrow) |

### Common Mistakes
- ❌ **Accepting methods without verifying locators**: Always check that the generated CSS selectors match actual app structure
- ❌ **Ignoring import needs**: New methods using `expect` require it imported from `@playwright/test`
- ❌ **Missing NES arrows**: Watch for gutter decorations — they save multi-file edits when adding POM methods
- ❌ **Putting assertions in POMs**: Per project convention, POMs return data — assertions belong in spec files. Exception: `expect*` helper methods like `expectPOIMarkersVisible` are acceptable for common assertions

---

## Demo 2: CORE Framework Prompting (15 min)

### Learning Objective
Write structured CORE-format prompts that generate complete, project-aware Playwright test specs with proper fixtures, tags, and API waits.

### Scenario
Create `e2e/tests/explore/category-search.spec.ts` (test ID: EXP-01 from the testing roadmap). This test validates that clicking a category pill on the Explore page triggers a search and displays results.

### Before Demo: Setup
```bash
# Review the existing test patterns
code frontend/e2e/tests/smoke/app-loads.spec.ts    # See test structure
code frontend/e2e/pages/ExplorePage.ts              # See available POM methods
code frontend/e2e/fixtures/base.fixture.ts          # See fixture pattern
```

### Live Coding Steps

**Step 1: Create the new test file and write a CORE prompt**

Create `frontend/e2e/tests/explore/category-search.spec.ts` and paste this CORE prompt as a comment block:

```typescript
/**
 * CORE Prompt for Copilot — Category Pill Search Test (EXP-01)
 *
 * CONTEXT:
 * You are writing Playwright E2E tests for a React road trip planner.
 * The test project is at `frontend/e2e/`, uses Page Object Models in
 * `e2e/pages/ExplorePage.ts`, and runs against Docker Compose at
 * localhost:5173. The Explore view (`/explore`) renders category pill
 * buttons (Places to Camp, Parks & Nature, Bars & Restaurants, etc.).
 * Clicking a pill sends `GET /api/search?query=<category>` via BFF to
 * the Java backend. Results render as cards with name, address, and
 * "Add to Trip" button. Fixtures are in `e2e/fixtures/base.fixture.ts`
 * which provides an `explorePage` fixture (pre-constructed ExplorePage POM).
 *
 * OBJECTIVE:
 * Create a Playwright test that validates the category pill search flow
 * returns results and displays them correctly.
 *
 * REQUEST:
 * 1. Import `test` and `expect` from `../../fixtures/base.fixture`
 * 2. Create a `test.describe` with tag `@regression`
 * 3. Test case EXP-01: navigates to /explore via explorePage.goto()
 * 4. Assert category pills visible via explorePage.expectCategoriesVisible()
 * 5. Click "Places to Camp" category pill
 * 6. Wait for the `/api/search` API response (not waitForTimeout!)
 * 7. Assert at least 1 search result card is visible
 * 8. Assert the first result has a name (non-empty text)
 *
 * EXPECTATION:
 * Test passes with `npx playwright test category-search`.
 * Uses ExplorePage POM methods — no raw selectors in the test file.
 * Waits for API responses explicitly (not arbitrary timeouts).
 * Handles potential empty results with a meaningful error message.
 */
```

**Step 2: Press Enter and let Copilot generate the test**

**Expected Copilot Output**:
```typescript
import { test, expect } from '../../fixtures/base.fixture';

test.describe('Explore Category Search @regression', () => {
  test('EXP-01: Category pill search returns results', async ({ explorePage, page }) => {
    // Navigate to explore page
    await explorePage.goto();

    // Verify category pills are rendered
    await explorePage.expectCategoriesVisible();

    // Click "Places to Camp" category pill
    await explorePage.clickCategory('Places to Camp');

    // Wait for search API response
    await page.waitForResponse(
      (response) => response.url().includes('/api/search') && response.status() === 200,
      { timeout: 10_000 }
    );

    // Assert at least 1 result is visible
    const resultCount = await explorePage.getResultCount();
    expect(resultCount, 'Expected at least 1 search result').toBeGreaterThan(0);

    // Assert first result has a non-empty name
    const firstName = await explorePage.getResultName(0);
    expect(firstName.trim().length, 'First result should have a name').toBeGreaterThan(0);
  });
});
```

### CORE Prompting Formula

> 📝 **CORE Formula for Playwright Tests:**
> ```
> CONTEXT:     App description + test infrastructure + POM locations + API endpoints
> OBJECTIVE:   What user flow or behavior to validate
> REQUEST:     Step-by-step test actions, file name, tags, fixtures to use
> EXPECTATION: Pass criteria, coding patterns to follow, anti-patterns to avoid
> ```

### Compare: Vague vs. CORE Prompt

| Prompt Quality | Prompt | Result |
|----------------|--------|--------|
| ❌ Vague | "Write a test for explore search" | May use raw selectors, `waitForTimeout`, wrong imports |
| ⚠️ Partial | "Test category pills on ExplorePage using POM" | Better, but may miss API waits, tags, error handling |
| ✅ CORE | Full Context + Objective + Request + Expectation | Complete spec with fixtures, API waits, assertions, tags |

### Teaching Points

> 💡 **Why CORE works for Playwright tests:**
> - **Context** tells Copilot about your test infra (POMs, fixtures, Docker ports) — it can't infer this
> - **Objective** prevents over-engineered tests — each test validates one flow
> - **Request** eliminates guesswork — Copilot knows the exact steps and file conventions
> - **Expectation** enforces quality gates — no `waitForTimeout`, no raw selectors, proper error messages

---

## Demo 3: Comment-Based Generation (10 min)

### Learning Objective
Generate complete test cases from descriptive comments placed directly above test functions.

### Scenario
Add a new test to the existing `sidebar-nav.spec.ts` that validates mobile bottom navigation behavior using Playwright's mobile viewport emulation.

### Before Demo: Setup
```bash
code frontend/e2e/tests/navigation/sidebar-nav.spec.ts
# Review existing 7 tests (NAV-01a through NAV-02)
# Navigate to end of the test.describe block (~line 88)
```

### Live Coding Steps

**Step 1: Write a descriptive comment inside the `test.describe` block**
```typescript
  // RSP-01: Test mobile bottom navigation renders and works on small viewports
  // Uses Playwright's built-in mobile device emulation (Pixel 5 — 393x851 viewport)
  // The app hides the desktop sidebar below md breakpoint (768px) and shows
  // a fixed bottom nav bar with the same 4 links: Explore, Itinerary, Trips, Start
  // Steps:
  //   1. Create a new context with Pixel 5 device settings
  //   2. Navigate to /explore
  //   3. Assert desktop sidebar is NOT visible (hidden on mobile)
  //   4. Assert mobile bottom nav IS visible
  //   5. Click each nav item and verify URL changes
  // Tags: @mobile @regression
```

**Step 2: Press Enter and type the test signature**
```typescript
  test('RSP-01: Mobile bottom nav renders and navigates @mobile @regression', async ({ browser }) => {
```

**Expected Copilot Suggestion** (completes the test):
```typescript
  test('RSP-01: Mobile bottom nav renders and navigates @mobile @regression', async ({ browser }) => {
    // Create mobile context with Pixel 5 viewport
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    });
    const page = await context.newPage();

    try {
      await page.goto('/explore', { waitUntil: 'domcontentloaded' });

      // Desktop sidebar should be hidden on mobile
      const desktopSidebar = page.locator('nav').filter({
        has: page.locator('a[href="/explore"]'),
      }).first();
      await expect(desktopSidebar).toBeHidden();

      // Mobile bottom nav should be visible
      const mobileNav = page.locator('nav.fixed.bottom-0').first();
      await expect(mobileNav).toBeVisible();

      // Navigate via mobile nav items
      await page.locator('a[href="/itinerary"]').last().click();
      await page.waitForURL('**/itinerary');
      expect(page.url()).toContain('/itinerary');

      await page.locator('a[href="/trips"]').last().click();
      await page.waitForURL('**/trips');
      expect(page.url()).toContain('/trips');

      await page.locator('a[href="/start"]').last().click();
      await page.waitForURL('**/start');
      expect(page.url()).toContain('/start');
    } finally {
      await context.close();
    }
  });
```

> ⚠️ **Note**: You'll need to add `import { devices } from '@playwright/test';` at the top. Watch for NES to suggest this import automatically.

### Comment Quality Comparison

```typescript
// ❌ Too vague — Copilot may generate incorrect viewport or wrong selectors
// Test mobile navigation

// ✅ Detailed — Copilot generates complete, correct implementation
// RSP-01: Test mobile bottom navigation renders and works on small viewports
// Uses Playwright's built-in mobile device emulation (Pixel 5 — 393x851 viewport)
// The app hides the desktop sidebar below md breakpoint (768px) and shows
// a fixed bottom nav bar with the same 4 links: Explore, Itinerary, Trips, Start
```

### Teaching Points

> 💡 **Comment-Based Generation for Playwright — Best Practices:**
> 1. **Name the test ID** (`RSP-01`) — Copilot uses it in the test title
> 2. **Specify the device/viewport** — Playwright has dozens of device presets
> 3. **Describe the UI behavior** (sidebar hidden, bottom nav visible) — Copilot can't infer responsive breakpoints
> 4. **List the assertion steps** — prevents Copilot from generating incomplete tests
> 5. **Include tags** (`@mobile @regression`) — Copilot adds them to the test title for `--grep` filtering

---

## Demo 4: Code Explanations with Ask Mode (10 min)

### Learning Objective
Use Copilot's Ask mode with `#selection` and `#file:` context to understand complex test infrastructure — auth caching, fixture inheritance, and global setup/teardown.

### Scenario
Understand how the Playwright global setup authenticates once, caches the browser state, and shares it across all test workers via `storageState`.

### Before Demo: Setup
```bash
code frontend/e2e/global-setup.ts
# Select lines 25-106 (the globalSetup function)
```

### Live Coding Steps

**Step 1: Select the global setup function (lines 25-106)**

The selected code includes:
- Browser launch and context creation
- Navigation to `/itinerary` and clicking "Login with Google (Demo)"
- Fallback to API-based auth if the button isn't visible
- `context.storageState({ path: AUTH_FILE })` to cache cookies + localStorage

**Step 2: Open Copilot Chat in Ask mode**
Press `Ctrl+Alt+I` (Windows) or `⌃⌘I` (Mac), switch to **Ask mode**, then type:

```
CORE Ask Prompt:

Context: I'm looking at #selection in the Playwright global setup file for a 
road trip planner app. This runs once before all test suites.

Objective: Understand the dual authentication strategy and how storageState 
sharing works across parallel test workers.

Request: Explain:
1. Why does it try UI-based login first, then fall back to API-based auth?
2. How does storageState({ path: AUTH_FILE }) share auth across workers?
3. What happens if global setup auth fails — do all tests fail?
4. Why use devLogin with MOCK_TOKEN instead of real Google OAuth?

Expectation: Explain each mechanism clearly with references to Playwright docs 
on auth and storageState.
```

**Expected Copilot Explanation**:
```
This global setup implements a resilient dual-strategy authentication flow:

**1. UI-first Login (lines 47-67)**
The setup navigates to /itinerary, switches to the Trips tab, and clicks 
"Login with Google (Demo)". This is preferred because it exercises the 
actual login flow the user sees, ensuring the UI-based auth path works.

**2. API Fallback (lines 69-92)**
If the login button isn't visible (UI changed, page didn't load), it falls 
back to calling POST /api/auth/google directly with { token: "MOCK_TOKEN" }. 
This injects the token into localStorage via page.evaluate(). This ensures 
tests can still run even if the UI is broken.

**3. storageState Sharing**
`context.storageState({ path: AUTH_FILE })` serializes ALL cookies and 
localStorage entries to a JSON file (.auth/user.json). Playwright workers 
can load this file via:
  - Config: storageState in project use options
  - Fixture: browser.newContext({ storageState: AUTH_FILE })

Since global setup runs ONCE before all workers start, every worker gets 
the same authenticated state without re-logging in.

**4. Graceful Failure (lines 98-103)**
If auth fails entirely, the setup catches the error and saves an EMPTY 
storageState. Tests requiring auth will fail, but unauthenticated tests 
(smoke, navigation) will still pass. This is why global setup never throws.

**5. MOCK_TOKEN instead of real OAuth**
Real Google OAuth requires browser redirects to accounts.google.com which 
Playwright can't handle in CI environments (no Google session). The backend 
has a dev mode that accepts "MOCK_TOKEN" as a valid token and returns a 
test user. This is only enabled in development/test environments.
```

**Step 3: Follow-up question using `#file:` context**
```
How does #file:e2e/fixtures/auth.fixture.ts consume the storageState 
created by global-setup? What's the relationship between the fixture 
and the global setup file?
```

### Teaching Points

> 🔍 **Ask Mode Tips for Playwright Infrastructure:**
> - Use `#selection` for specific code blocks (global setup function)
> - Use `#file:e2e/fixtures/auth.fixture.ts` to reference the auth fixture file
> - Use `#codebase` to search for all `storageState` usage across the project
> - Ask mode is read-only — perfect for understanding test infrastructure before modifying it
> - Frame questions with CORE structure even in Ask mode — it produces more focused answers

### Alternative: Inline Chat
- Select the `storageState` line, press `Ctrl+I` (Windows) / `⌘I` (Mac)
- Type: "What does storageState serialize and how do workers access it?"
- Copilot answers inline without leaving the editor

---

## Demo 5: Code Refactoring with Agent Mode (10 min)

### Learning Objective
Use Copilot's Agent mode to identify and refactor duplicate API wait patterns across Page Object Models into a shared utility method.

### Scenario
`ItineraryPage.ts` contains 6 separate `page.waitForResponse()` calls with similar patterns — each waits for a different API endpoint with a timeout from `TIMEOUTS`. Extract a reusable `waitForApi()` helper method into `BasePage.ts` and update all callers.

### Before Demo: Setup
```bash
# Open both files side by side
code frontend/e2e/pages/ItineraryPage.ts
code frontend/e2e/pages/BasePage.ts

# Note the duplicate pattern in ItineraryPage.ts:
# Line 79:  await this.page.waitForResponse(r => r.url().includes('/api/geocode'), { timeout: TIMEOUTS.GEOCODE_SEARCH })
# Line 122: await this.page.waitForResponse(r => r.url().includes('/api/directions'), { timeout: TIMEOUTS.ROUTE_CALCULATION })
# Line 133: await this.page.waitForResponse(r => r.url().includes('/api/optimize'), { timeout: TIMEOUTS.ROUTE_CALCULATION })
# Line 164: await this.page.waitForResponse(r => r.url().includes('/api/trips') && ..., { timeout: TIMEOUTS.TRIP_SAVE })
# Line 180: await this.page.waitForResponse(r => r.url().includes('/api/search'), { timeout: TIMEOUTS.POI_SEARCH })
```

### The Duplicate Code

**ItineraryPage.ts — repeated pattern:**
```typescript
// Pattern 1: Geocode wait
await this.page.waitForResponse(
  (response) => response.url().includes('/api/geocode'),
  { timeout: TIMEOUTS.GEOCODE_SEARCH }
);

// Pattern 2: Directions wait
await this.page.waitForResponse(
  (response) => response.url().includes('/api/directions'),
  { timeout: TIMEOUTS.ROUTE_CALCULATION }
);

// Pattern 3: Search wait
await this.page.waitForResponse(
  (response) => response.url().includes('/api/search'),
  { timeout: TIMEOUTS.POI_SEARCH }
);
```

### Live Coding Steps

**Step 1: Open Copilot Chat in Agent mode**
Press `Ctrl+Alt+I` (Windows) or `⌃⌘I` (Mac), switch to **Agent mode**

**Step 2: Use a CORE prompt for the refactoring**

```
CORE Refactoring Prompt:

Context: In the Playwright E2E test project at frontend/e2e/, the ItineraryPage.ts 
POM has 6 separate page.waitForResponse() calls with the same pattern — each includes 
a URL substring and a timeout from the TIMEOUTS constant in helpers/test-data.ts. 
The BasePage.ts already has a waitForApiResponse() method (line 110) but it doesn't 
accept a timeout parameter and uses a different signature.

Objective: Consolidate all API wait patterns into a single reusable method in 
BasePage.ts that all POMs can inherit.

Request:
1. Update the existing waitForApiResponse() method in BasePage.ts to match this signature:
   async waitForApi(urlPattern: string | RegExp, timeout?: number): Promise<Response>
   - Returns the Response object (callers may need to inspect it)
   - Default timeout = 10_000
2. Update all 6 waitForResponse calls in ItineraryPage.ts to use this.waitForApi()
3. Update ExplorePage.ts if it has similar patterns

Expectation: Zero behavior change — same URLs, same timeouts. The refactored code 
is DRYer and follows the BasePage inheritance pattern used by all POMs. Run 
npm run test:e2e:smoke to verify no regressions.
```

**Expected Agent Actions** (modifies 2-3 files autonomously):

**Updated: `BasePage.ts`** — enhanced method:
```typescript
  /** Wait for a specific API response matching a URL pattern */
  async waitForApi(urlPattern: string | RegExp, timeout: number = 10_000): Promise<Response> {
    return await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        return typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      },
      { timeout }
    );
  }
```

**Updated: `ItineraryPage.ts`** — simplified callers:
```typescript
  // Before (verbose):
  await this.page.waitForResponse(
    (response) => response.url().includes('/api/geocode'),
    { timeout: TIMEOUTS.GEOCODE_SEARCH }
  );

  // After (DRY):
  await this.waitForApi('/api/geocode', TIMEOUTS.GEOCODE_SEARCH);
```

> 💡 **Agent Mode Advantage**: Agent mode makes all file changes in one operation. Review proposed changes in the diff viewer before accepting, and use **checkpoints** to rollback if anything breaks.

### Teaching Points

> 🔧 **Agent Mode vs Ask Mode for Refactoring POMs:**
> - **Agent mode**: Modifies files autonomously — ideal for cross-file refactoring
> - **Ask mode**: Explains the duplication but doesn't modify files
> - **Plan mode**: Creates a step-by-step refactoring plan, then executes after approval
> - Use `#file:e2e/pages/ItineraryPage.ts` in your prompt to scope the refactoring

### Verification
```bash
cd frontend

# Verify no TypeScript errors
npx tsc --noEmit --project tsconfig.json

# Run smoke tests to verify no regressions
npm run test:e2e:smoke

# Check that duplicate pattern is eliminated
grep -r "page.waitForResponse" e2e/pages/ItineraryPage.ts
# Should return: 0 matches (all replaced by this.waitForApi)

grep -r "waitForApi" e2e/pages/
# Should return: BasePage.ts (definition) + ItineraryPage.ts (callers)
```

---

## Demo 6: Few-Shot Prompting (10 min)

### Learning Objective
Teach Copilot your Page Object Model conventions by showing 2 existing examples, then asking it to generate a new POM following the exact same pattern.

### Scenario
Create a new `LoginPage.ts` Page Object Model for authentication interactions, using the existing `Sidebar.ts` and `ExplorePage.ts` as pattern examples.

### Before Demo: Setup
```bash
code frontend/e2e/pages/components/Sidebar.ts    # Simple component POM (68 lines)
code frontend/e2e/pages/ExplorePage.ts            # Full page POM extending BasePage (133 lines)
code frontend/e2e/helpers/selectors.ts            # AUTH section (lines 131-139)
```

### Live Coding Steps

**Step 1: Show Copilot the existing patterns (few-shot examples)**

Create `frontend/e2e/pages/LoginPage.ts` and write this few-shot prompt:

```typescript
/**
 * PATTERN EXAMPLES (Few-Shot Learning):
 *
 * Example 1: Sidebar.ts (simple component POM)
 * - Constructor takes Page, assigns to this.page
 * - Defines locators as readonly properties: this.exploreLink = page.locator('a[href="/explore"]')
 * - Methods: goToExplore(), expectAllLinksVisible()
 * - Does NOT extend BasePage (it's a small component)
 *
 * Example 2: ExplorePage.ts (full page POM extending BasePage)
 * - Extends BasePage (inherits navigateTo, waitForNetworkIdle, expectToast)
 * - Constructor calls super(page), then defines page-specific locators
 * - Locators use getByPlaceholder(), getByText(), page.locator() (in that priority)
 * - Has goto() method calling this.navigateTo('/explore')
 * - Action methods: clickCategory(label), textSearch(query), addResultToTrip(index)
 * - Data methods: getResultCount() → Promise<number>, getResultName(index) → Promise<string>
 * - Wait methods: waitForResults(timeout) uses expect(spinner).toBeHidden + expect(results).toBeVisible
 *
 * NOW CREATE: LoginPage.ts (auth interaction POM extending BasePage)
 * - Extends BasePage (imports from './BasePage')
 * - Locators from e2e/helpers/selectors.ts AUTH section:
 *     loginDemoButton: getByText('Login with Google (Demo)')
 *     logoutButton: button with svg.lucide-log-out icon
 *     userBadge: element showing user email when logged in
 *     secureBadge: getByText('Secure')
 * - Methods:
 *     loginWithDemo() → clicks button, waits for token in localStorage
 *     logout() → clicks logout button, waits for token removal
 *     isLoggedIn() → checks localStorage for 'token' key
 *     getUserEmail() → returns email from localStorage
 *     expectLoggedIn() → asserts secureBadge visible + token exists
 *     expectLoggedOut() → asserts loginDemoButton visible + no token
 */
```

**Step 2: Press Enter and let Copilot generate**

**Expected Copilot Suggestion**:
```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../helpers/test-data';

export class LoginPage extends BasePage {
  readonly loginDemoButton: Locator;
  readonly logoutButton: Locator;
  readonly userBadge: Locator;
  readonly secureBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.loginDemoButton = page.getByText('Login with Google (Demo)', { exact: false });
    this.logoutButton = page.locator('button').filter({
      has: page.locator('svg.lucide-log-out'),
    }).first();
    this.userBadge = page.locator('[class*="auth-status"]').first();
    this.secureBadge = page.getByText('Secure');
  }

  /** Navigate to itinerary where login button lives */
  async goto(): Promise<void> {
    await this.navigateTo('/itinerary');
  }

  /** Click the demo login button and wait for auth to complete */
  async loginWithDemo(): Promise<void> {
    await this.loginDemoButton.click();
    await this.page.waitForFunction(
      () => localStorage.getItem('token') !== null,
      { timeout: TIMEOUTS.AUTH_FLOW }
    );
  }

  /** Click logout and wait for session to clear */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForFunction(
      () => localStorage.getItem('token') === null,
      { timeout: 5_000 }
    );
  }

  /** Check if user is currently authenticated */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('token') !== null;
    });
  }

  /** Get the logged-in user's email */
  async getUserEmail(): Promise<string | null> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('user_email');
    });
  }

  /** Assert user is logged in */
  async expectLoggedIn(): Promise<void> {
    await expect(this.secureBadge).toBeVisible({ timeout: 5_000 });
    const hasToken = await this.isLoggedIn();
    expect(hasToken).toBe(true);
  }

  /** Assert user is logged out */
  async expectLoggedOut(): Promise<void> {
    await expect(this.loginDemoButton).toBeVisible({ timeout: 5_000 });
    const hasToken = await this.isLoggedIn();
    expect(hasToken).toBe(false);
  }
}
```

**Step 3: NES for fixture registration**
After creating the LoginPage, watch for **Next Edit Suggestions** (NES) — Copilot may show gutter arrows pointing to `base.fixture.ts` where you need to register the new POM as a fixture:

```typescript
// Add to base.fixture.ts:
import { LoginPage } from '../pages/LoginPage';

// In the PageFixtures type:
loginPage: LoginPage;

// In the test.extend block:
loginPage: async ({ page }, use) => {
  await use(new LoginPage(page));
},
```

> 💡 **NES Tip**: Press `Tab` on each gutter arrow to jump to `base.fixture.ts` and accept the suggested fixture registration.

### Why Few-Shot Works for POMs

| Approach | Prompt | Result |
|----------|--------|--------|
| Zero-shot | "Create LoginPage POM" | May not extend BasePage, wrong locator style, missing wait patterns |
| Few-shot (2 examples) | "Example 1: Sidebar... Example 2: ExplorePage... NOW CREATE: LoginPage" | Follows exact constructor pattern, locator priority, method signatures |

### Teaching Points

> 📚 **Few-Shot Prompting Formula for POMs:**
> ```
> Example 1: [Simple component POM — constructor, locators, methods]
> Example 2: [Full page POM — extends BasePage, goto, actions, data, waits]
> NOW CREATE: [New POM with field list, method signatures, locator sources]
> ```
> - Show both simple and complex examples to give Copilot range
> - Reference the selectors.ts constants so locators are consistent
> - List method signatures with return types — Copilot matches them precisely

---

## Demo 7: Test Generation & Debugging (15 min)

### Learning Objective
Generate test suites using CORE prompts and debug flaky tests using Copilot Chat.

### Part A: Generate Auth Test Suite (8 min)

**Scenario**: Generate `e2e/tests/auth/login-logout.spec.ts` covering AUTH-01 (login flow) and AUTH-02 (logout flow) from the testing roadmap.

**Step 1: Open Agent mode and use a CORE prompt**

```
CORE Test Generation Prompt:

Context: Playwright E2E tests for a React road trip planner. Auth uses devLogin() 
with MOCK_TOKEN. The login button "Login with Google (Demo)" is on the Itinerary 
view's Trips tab. After login: token is in localStorage, "Secure" badge appears, 
user email is shown. Logout clears localStorage. Use the authenticatedPage fixture 
from e2e/fixtures/auth.fixture.ts for pre-logged-in state. For login-from-scratch, 
use the standard test from @playwright/test (no pre-auth).

Objective: Create auth tests covering login and logout flows.

Request: Create e2e/tests/auth/login-logout.spec.ts with:
1. AUTH-01: Login via demo button sets token in localStorage
   - Use standard Playwright test (NOT authenticatedPage — testing login itself)
   - Navigate to /itinerary, switch to Trips tab, click "Login with Google (Demo)"
   - Assert localStorage has 'token' key
   - Assert "Secure" badge becomes visible
   - Tag: @auth @smoke
2. AUTH-02: Logout clears session data
   - Use authenticatedPage fixture (pre-logged-in state)
   - Assert initially logged in (token exists)
   - Click logout button
   - Assert localStorage no longer has 'token'
   - Assert "Login with Google (Demo)" button reappears
   - Tag: @auth @regression
3. AUTH-03: Auth status shows user email when logged in
   - Use authenticatedPage fixture
   - Assert user email is visible in the auth status component
   - Tag: @auth @regression

Expectation: Tests are independent (no test depends on another). Login test uses 
fresh context (no storageState). Logout test uses pre-authenticated context. 
All waits use waitForFunction or expect with timeout — never waitForTimeout.
```

**Expected Generated Test**:
```typescript
import { test as base, expect } from '@playwright/test';
import { test as authTest } from '../../fixtures/auth.fixture';

base.describe('Auth Login @auth @smoke', () => {
  base('AUTH-01: Dev login sets token in localStorage', async ({ page }) => {
    await page.goto('/itinerary', { waitUntil: 'domcontentloaded' });

    // Switch to Trips tab where login button lives
    await page.getByText('Trips', { exact: false }).first().click();
    await page.waitForTimeout(500); // Tab animation

    // Click demo login
    const loginButton = page.getByText('Login with Google (Demo)', { exact: false });
    await expect(loginButton).toBeVisible({ timeout: 5_000 });
    await loginButton.click();

    // Wait for auth to complete
    await page.waitForFunction(
      () => localStorage.getItem('token') !== null,
      { timeout: 10_000 }
    );

    // Assert token is set
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).not.toBeNull();

    // Assert secure badge appears
    await expect(page.getByText('Secure')).toBeVisible({ timeout: 5_000 });
  });
});

authTest.describe('Auth Logout @auth @regression', () => {
  authTest('AUTH-02: Logout clears session data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/itinerary', { waitUntil: 'domcontentloaded' });

    // Verify initially logged in
    const initialToken = await authenticatedPage.evaluate(() => localStorage.getItem('token'));
    expect(initialToken).not.toBeNull();

    // Click logout
    const logoutButton = authenticatedPage.locator('button').filter({
      has: authenticatedPage.locator('svg.lucide-log-out'),
    }).first();
    await logoutButton.click();

    // Wait for session to clear
    await authenticatedPage.waitForFunction(
      () => localStorage.getItem('token') === null,
      { timeout: 5_000 }
    );

    // Assert login button reappears
    await expect(
      authenticatedPage.getByText('Login with Google (Demo)', { exact: false })
    ).toBeVisible({ timeout: 5_000 });
  });

  authTest('AUTH-03: Auth status shows user email', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/itinerary', { waitUntil: 'domcontentloaded' });

    // Get email from localStorage
    const email = await authenticatedPage.evaluate(() => localStorage.getItem('user_email'));
    expect(email).not.toBeNull();

    // Assert email is visible in auth status
    if (email) {
      await expect(authenticatedPage.getByText(email)).toBeVisible({ timeout: 5_000 });
    }
  });
});
```

### Part B: Debug Flaky Test with Copilot (7 min)

**Scenario**: The project includes an intentionally buggy test file at `docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts` with **5 bugs** that cause flakiness. Use Copilot to identify and fix them all.

**Step 1: Open the flaky test file**
```bash
code docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts
```

**Step 2: Select the entire test (lines 22-68) and open inline chat (`Ctrl+I`)**
```
CORE Debug Prompt:

Context: This Playwright test calculates a route between two stops in a road trip 
planner. The project uses centralized selectors in e2e/helpers/selectors.ts and 
TIMEOUTS constants in e2e/helpers/test-data.ts. Locator priority is: 
getByRole > getByPlaceholder > getByText > data-testid > CSS selectors.

Objective: Identify ALL flaky patterns and anti-patterns in #selection.

Request: Find each bug, explain WHY it causes flakiness, and provide the fix. 
Reference the project's selector strategy and TIMEOUTS constants.

Expectation: Each fix should use resilient locators (accessible selectors over CSS 
classes), explicit API waits (waitForResponse over waitForTimeout), and named 
TIMEOUTS constants. No magic numbers.
```

**Expected Copilot Analysis**:
```
I found 5 flaky patterns in this test:

BUG #1 (Line 26): Fragile CSS class selector
❌ page.locator('.flex.items-center input.border-gray-300')
✅ page.getByPlaceholder('Add a stop (City, Place)...')
WHY: Tailwind classes change frequently. Placeholder text is stable.

BUG #2 (Line 35): Missing wait for geocoding API
❌ Immediately clicks result after typing
✅ Add: await page.waitForResponse(r => r.url().includes('/api/geocode'), 
     { timeout: TIMEOUTS.GEOCODE_SEARCH })
WHY: Geocode is async — results haven't loaded when click fires.

BUG #3 (Line 49): Hardcoded nth-child for map markers
❌ page.locator('.mapboxgl-marker:nth-child(3)')
✅ await expect(page.locator('.mapboxgl-marker')).toHaveCount(2)
WHY: Markers load in unpredictable order. Assert count, not position.

BUG #4 (Line 58): Magic timeout number
❌ { timeout: 3000 }
✅ { timeout: TIMEOUTS.ROUTE_CALCULATION }
WHY: 3000ms is too short for API calls. Named constants are maintainable.

BUG #5 (Line 66): waitForTimeout (arbitrary delay)
❌ await page.waitForTimeout(5000)
✅ await page.waitForResponse(r => r.url().includes('/api/directions'),
     { timeout: TIMEOUTS.ROUTE_CALCULATION })
WHY: waitForTimeout is the #1 cause of flaky tests. Always wait for 
a specific condition (API response, element state, function evaluation).
```

### Teaching Points

> 🧪 **Flaky Test Debugging Checklist (use with Copilot):**
>
> | Anti-Pattern | Fix | Copilot Prompt |
> |--------------|-----|---------------|
> | CSS class selectors | `getByPlaceholder`, `getByRole`, `getByText` | "Replace CSS selector with accessible locator" |
> | `waitForTimeout(N)` | `waitForResponse()`, `waitForFunction()` | "Replace arbitrary delay with explicit API wait" |
> | `nth-child(N)` for dynamic content | `toHaveCount(N)` or filter by text | "Replace positional selector with count assertion" |
> | Magic numbers | Import from `TIMEOUTS` constant | "Replace hardcoded timeout with named constant" |
> | No API waits after user action | `waitForResponse(url)` before assertions | "Add API wait between action and assertion" |

---

## Demo 8: Copilot CLI (10 min)

### Learning Objective
Use the standalone Copilot CLI to generate Playwright commands, explain complex test runner flags, and build CI pipeline snippets from natural language.

### Prerequisites
```bash
# Verify Copilot CLI is installed
copilot --version

# If not installed, see: https://docs.github.com/en/copilot/copilot-cli
copilot auth login
```

### Live Coding Steps

**Step 1: Interactive mode — explain a Playwright command**
```bash
copilot
```

Type your question in the interactive session:
```
> Explain this command: npx playwright test --grep @smoke --project=chromium --reporter=html --retries=2 --workers=4
```

**Expected Explanation**:
```
This runs Playwright tests with specific filtering and configuration:

- `npx playwright test`: Run tests using the local Playwright installation
- `--grep @smoke`: Only run tests tagged with @smoke in their title
- `--project=chromium`: Run only in the Chromium browser project
- `--reporter=html`: Generate an interactive HTML report
- `--retries=2`: Retry failed tests up to 2 times (helps with flaky tests)
- `--workers=4`: Use 4 parallel worker processes

This is ideal for CI smoke checks — fast (single browser), 
with retries for stability, and an HTML report for debugging.
```

**Step 2: Generate a command from natural language**
```
> Run only the authentication tests in debug mode with the browser visible, using Chromium
```

**Expected Suggestion**:
```bash
npx playwright test --grep @auth --project=chromium --headed --debug
```

**Step 3: Generate Playwright codegen command**
```
> Generate a playwright codegen command that records actions on localhost:5173 and saves to a file called explore-test.spec.ts
```

**Expected Suggestion**:
```bash
npx playwright codegen http://localhost:5173 --output frontend/e2e/tests/explore/explore-test.spec.ts
```

**Step 4: Generate CI pipeline snippet**
```
copilot -m "Create a GitHub Actions job that installs Playwright browsers, starts Docker Compose, waits for health check, runs Playwright tests with JUnit reporter, and uploads test results and HTML report as artifacts"
```

**Expected Output**:
```yaml
  playwright-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Install Playwright browsers
        run: cd frontend && npx playwright install --with-deps chromium

      - name: Start Docker Compose stack
        run: docker compose up -d --build

      - name: Wait for services to be healthy
        run: |
          timeout 120 bash -c 'until curl -s http://localhost:3000/health; do sleep 5; done'

      - name: Run Playwright tests
        run: cd frontend && npx playwright test --project=chromium --reporter=junit,html
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: |
            frontend/e2e/test-results/
            frontend/playwright-report/
```

**Step 5: Generate trace viewer command**
```
> Open the Playwright trace viewer for a specific test result trace file
```

**Expected**:
```bash
npx playwright show-trace frontend/e2e/test-results/smoke-App-Loads-SM-01/trace.zip
```

### Teaching Points

> 💻 **Copilot CLI for Playwright — Practical Examples:**
>
> | Natural Language | Generated Command |
> |-----------------|-------------------|
> | "Run smoke tests in headed mode" | `npx playwright test --grep @smoke --headed` |
> | "Run tests and open report on failure" | `npx playwright test; npx playwright show-report` |
> | "Record a test for the itinerary page" | `npx playwright codegen http://localhost:5173/itinerary` |
> | "List all available Playwright projects" | `npx playwright test --list --project=chromium` |
> | "Show last test run report" | `npx playwright show-report frontend/playwright-report` |
> | "Run specific test file with verbose output" | `npx playwright test app-loads.spec.ts --reporter=list` |
> | "Update Playwright browsers to latest" | `npx playwright install --with-deps` |
> | "Debug a single test step by step" | `npx playwright test -g "SM-01" --debug` |

### Copilot CLI Modes

| Mode | Command | Best For |
|------|---------|----------|
| **Interactive** | `copilot` | Multi-turn Q&A about Playwright commands |
| **Programmatic** | `copilot -m "..."` | Single-shot command generation for scripts |
| **Plan mode** | `Shift+Tab` (in interactive) | Multi-step CI/CD pipeline generation |

---

## Workshop Summary & Key Takeaways

### Techniques Comparison Matrix

| Technique | When to Use for Playwright | How to Access | Example |
|-----------|---------------------------|---------------|---------|
| **Inline Suggestions** | POM methods, locator definitions | Just type (ghost text) | Adding methods to ItineraryPage |
| **NES (Next Edit)** | POM ↔ selectors.ts ↔ fixture sync | `Tab` on gutter arrow | Adding POM method → update selectors |
| **CORE Prompting** | New test specs from roadmap | Comment block + Enter | EXP-01 category search test |
| **Comment-Based** | Quick tests, viewport variations | `// Description` + Enter | Mobile nav test from comment |
| **Ask Mode** | Understanding test infra | `Ctrl+Alt+I` → Ask + `#selection` | Global setup auth flow |
| **Agent Mode** | Multi-file POM refactoring | `Ctrl+Alt+I` → Agent | Extract waitForApi to BasePage |
| **Few-Shot** | New POMs matching project patterns | 2 examples + request | LoginPage from Sidebar + ExplorePage |
| **Test Generation** | Full test suites from CORE prompts | Agent mode | Auth test suite (AUTH-01..03) |
| **Debugging** | Flaky test diagnosis | Inline chat + `#selection` | 5 bugs in demo-04-flaky.spec.ts |
| **CLI** | Commands, codegen, CI pipelines | `copilot` (standalone) | Run tests, generate reports |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│            PLAYWRIGHT + COPILOT QUICK REFERENCE              │
├─────────────────────────────────────────────────────────────┤
│ CORE FRAMEWORK (for all prompts)                             │
│   C  Context     App, test infra, POMs, API endpoints        │
│   O  Objective   What user flow to validate                  │
│   R  Request     Steps, files, tags, fixtures                │
│   E  Expectation Pass criteria, patterns, anti-patterns      │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab          Accept full suggestion                        │
│   Ctrl+→       Accept word-by-word                          │
│   Alt+]        Next suggestion                               │
│   Tab (gutter) Jump to Next Edit Suggestion (NES)            │
│   Esc          Dismiss                                       │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT (Ctrl+Alt+I)                                    │
│   Ask mode     Understand test infra, explain auth flows     │
│   Agent mode   Generate test suites, refactor POMs           │
│   Plan mode    Review complex multi-file changes first       │
│   #selection   Reference highlighted code                    │
│   #file:name   Reference a specific file                     │
│   #codebase    Search across all test files                  │
├─────────────────────────────────────────────────────────────┤
│ INLINE CHAT (Ctrl+I)                                         │
│   Select code → Ctrl+I → "Why is this test flaky?"           │
├─────────────────────────────────────────────────────────────┤
│ PLAYWRIGHT COMMANDS                                          │
│   npm run test:e2e           All tests, all browsers         │
│   npm run test:e2e:smoke     Smoke tests only (@smoke)       │
│   npm run test:e2e:ui        Interactive UI mode              │
│   npm run test:e2e:headed    Browser visible                  │
│   npm run test:e2e:debug     Step-through debugger            │
│   npm run test:e2e:report    Open HTML report                 │
│   npm run test:e2e:chromium  Chromium only                    │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CLI (standalone)                                     │
│   copilot              Interactive mode                      │
│   copilot -m "..."     Programmatic (single-shot)            │
│   Shift+Tab            Plan mode (in interactive)            │
└─────────────────────────────────────────────────────────────┘
```

### Playwright Anti-Patterns Copilot Helps Fix

| Anti-Pattern | Why It's Bad | Copilot Fix |
|-------------|--------------|-------------|
| `page.waitForTimeout(5000)` | Arbitrary delay — too slow or too fast | "Replace with `waitForResponse` or `waitForFunction`" |
| `page.locator('.css-class')` | Breaks when CSS changes | "Use `getByRole`, `getByPlaceholder`, or `getByText`" |
| Raw selectors in test specs | Duplicated, unmaintainable | "Extract to Page Object Model method" |
| `nth-child(3)` for dynamic lists | Position changes between runs | "Assert count with `toHaveCount()` instead" |
| No test isolation | Tests depend on execution order | "Use `test.beforeEach` for setup, `uniqueTripName()` for data" |
| Assertions in POMs | Violates separation of concerns | "Move assertions to spec file, return data from POM" |
| Hardcoded timeout numbers | Unmaintainable magic numbers | "Import from `TIMEOUTS` constant in test-data.ts" |
| Missing global teardown | Test data accumulates in database | "Use `global-teardown.ts` with `deleteTestTrips()`" |

### Common Mistakes to Avoid

| Pitfall | Solution |
|---------|----------|
| Accepting Copilot selectors blindly | Verify selectors match actual app DOM structure |
| Generating tests without API waits | Always wait for backend responses before asserting |
| Using `waitForTimeout` because it "works locally" | It WILL fail in CI — use explicit waits |
| Forgetting to register new POMs as fixtures | Check `base.fixture.ts` after creating a POM |
| Not tagging tests (`@smoke`, `@auth`, etc.) | Breaks `--grep` filtering in CI |
| Skipping test verification after generation | Always run `npm run test:e2e:chromium` to verify |
| Using Agent mode for simple questions | Use Ask mode for understanding, Agent for modifications |
| Not reviewing Agent mode diffs before accepting | Use checkpoints to rollback bad changes |

---

## Hands-On Exercise (Optional — 15 min)

**Challenge**: Use ALL techniques from this workshop to implement the **EXP-02: Text Search** test from the testing roadmap.

### Steps

1. **Inline Suggestions + NES**: Open `ExplorePage.ts`, add a method `assertResultContainsText(index, text)`. Watch NES suggest updating `selectors.ts`.

2. **CORE Prompt**: Write a full CORE prompt to generate `e2e/tests/explore/text-search.spec.ts`:
   ```
   Context:     React road trip planner, ExplorePage POM with textSearch(), 
                waitForResults(), getResultCount(), getResultName() methods.
                Test data: EXPLORE_QUERIES.TEXT_SEARCH = 'Grand Canyon'.
   Objective:   Validate free-text search returns results and displays names.
   Request:     Create spec with @regression tag. Search 'Grand Canyon', 
                assert results > 0, assert first result name is non-empty.
                Clear search. Search 'Yellowstone', assert results > 0.
   Expectation: Uses ExplorePage POM only. Waits for /api/search response. 
                No waitForTimeout. Uses test data from helpers/test-data.ts.
   ```

3. **Comment-Based**: Add a test for "Add to Trip" using a descriptive comment before the test function.

4. **Few-Shot**: Use the existing smoke test (`app-loads.spec.ts`) and navigation test (`sidebar-nav.spec.ts`) as examples to establish the test structure pattern.

5. **Agent Mode Refactoring**: After generating the tests, ask Agent to extract repeated `waitForResponse` into the ExplorePage POM.

6. **Debugging**: Intentionally break one assertion (e.g., `expect(count).toBe(0)`) and use Copilot inline chat to fix it.

7. **CLI**: Use `copilot -m "run only the text-search tests in chromium with html report"`

### Verification
```bash
cd frontend

# Run the new test
npx playwright test text-search --project=chromium

# Run all explore tests
npx playwright test --grep @regression --project=chromium

# View the report
npm run test:e2e:report
```

---

## Next Workshop Preview

**Workshop 3: Advanced Playwright Testing with Copilot**
- **Custom Instructions**: Using `.github/copilot-instructions.md` for Playwright-specific context
- **Custom Agents**: Building `@playwright-tester` agent for specialized test generation
- **MCP Servers**: Connecting to Playwright's trace viewer and test results APIs
- **Visual Regression Testing**: Screenshot comparison with `toHaveScreenshot()`
- **API Testing**: Using Playwright's `request` context for backend API validation
- **Network Mocking**: `page.route()` for testing error states and edge cases
- **Performance Testing**: Web Vitals and Lighthouse integration

**Preparation**:
- Review `docs/PLAYWRIGHT_TESTING_ROADMAP.md` for the full test inventory
- Explore the VS Code Playwright Test Explorer sidebar (`Ctrl+Shift+T`)
- Run the full test suite: `npm run test:e2e` and review the HTML report
- Read the CORE prompts for ITN-01 through ITN-07 in the roadmap

---

## Resources

- **Playwright Documentation**: https://playwright.dev/docs/intro
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices
- **Playwright Locators Guide**: https://playwright.dev/docs/locators
- **Playwright Auth Guide**: https://playwright.dev/docs/auth
- **Playwright CI Guide**: https://playwright.dev/docs/ci-intro
- **Playwright Test Fixtures**: https://playwright.dev/docs/test-fixtures
- **Playwright Page Object Models**: https://playwright.dev/docs/pom
- **Playwright Codegen**: https://playwright.dev/docs/codegen-intro
- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Copilot Chat Modes**: https://code.visualstudio.com/docs/copilot/copilot-chat
- **Copilot CLI**: https://docs.github.com/en/copilot/copilot-cli
- **Project Test Roadmap**: `docs/PLAYWRIGHT_TESTING_ROADMAP.md`
- **Project Setup**: `docs/workshops/playwright/setup/00-setup-instructions.md`
- **Flaky Test Demo**: `docs/workshops/playwright/setup/demo-templates/demo-04-flaky.spec.ts`

**Questions?** Proceed to Workshop 3 or ask for clarification.
