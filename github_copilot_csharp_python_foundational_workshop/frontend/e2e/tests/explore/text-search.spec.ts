/**
 * EXP-02 / EXP-03: Free-Text Search
 *
 * Validates that typing a query and pressing Enter on the Explore page
 * sends a GET /api/search request and renders at least one result card
 * whose name partially matches the search term.
 *
 * Also validates clearing the search input and performing a new query
 * returns a fresh set of results.
 *
 * Tags: @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running at localhost:5173
 */

import { test, expect } from '../../fixtures/base.fixture';
import { EXPLORE_QUERIES, TIMEOUTS } from '../../helpers/test-data';

test.describe('Free-Text Search', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ explorePage }) => {
    await explorePage.goto();
  });

  test(
    'EXP-02: searching "Grand Canyon" returns relevant result cards',
    async ({ explorePage, page }) => {
      // Register the response waiter BEFORE triggering the network request
      // to eliminate any race between submit and the response arriving.
      const searchResponse = page.waitForResponse(
        (res) =>
          res.url().includes('/api/search') && res.status() === 200,
        { timeout: TIMEOUTS.POI_SEARCH },
      );

      // Submit the search via the POM (fills input, presses Enter)
      await explorePage.textSearch(EXPLORE_QUERIES.TEXT_SEARCH);

      // Block until the API round-trip completes
      await searchResponse;

      // Wait for at least one result card to become visible
      await explorePage.waitForResults(TIMEOUTS.POI_SEARCH);

      // Assert result count
      const count = await explorePage.getResultCount();
      expect(
        count,
        `Expected at least one result for "${EXPLORE_QUERIES.TEXT_SEARCH}"`,
      ).toBeGreaterThan(0);

      // Assert the first result name contains a partial match for the query.
      // Real POI names vary (e.g. "Grand Canyon National Park", "Grand Canyon Village"),
      // so we test for either significant word rather than an exact string.
      const firstName = await explorePage.getResultName(0);
      expect(
        firstName,
        'Expected first result name to contain "Grand" or "Canyon"',
      ).toMatch(/grand|canyon/i);
    },
  );

  test(
    'EXP-03: clearing the search and re-searching returns new results',
    async ({ explorePage, page }) => {
      // ── First search: Grand Canyon ──────────────────────────────────────
      const firstResponse = page.waitForResponse(
        (res) =>
          res.url().includes('/api/search') && res.status() === 200,
        { timeout: TIMEOUTS.POI_SEARCH },
      );

      await explorePage.textSearch(EXPLORE_QUERIES.TEXT_SEARCH);
      await firstResponse;
      await explorePage.waitForResults(TIMEOUTS.POI_SEARCH);

      const firstCount = await explorePage.getResultCount();
      expect(
        firstCount,
        `Expected results after first search for "${EXPLORE_QUERIES.TEXT_SEARCH}"`,
      ).toBeGreaterThan(0);

      // ── Clear the search input ──────────────────────────────────────────
      await explorePage.clearSearch();

      // ── Second search: Yellowstone ──────────────────────────────────────
      // Register a fresh response waiter after clearing so we don't
      // accidentally match the earlier response.
      const secondResponse = page.waitForResponse(
        (res) =>
          res.url().includes('/api/search') && res.status() === 200,
        { timeout: TIMEOUTS.POI_SEARCH },
      );

      await explorePage.textSearch(EXPLORE_QUERIES.POI_SEARCH);
      await secondResponse;
      await explorePage.waitForResults(TIMEOUTS.POI_SEARCH);

      // Assert re-search produces a non-empty result list
      const secondCount = await explorePage.getResultCount();
      expect(
        secondCount,
        `Expected results after re-searching for "${EXPLORE_QUERIES.POI_SEARCH}"`,
      ).toBeGreaterThan(0);

      // Assert the first result is relevant to the new query
      const secondName = await explorePage.getResultName(0);
      expect(
        secondName,
        'Expected first result name to contain "Yellowstone"',
      ).toMatch(/yellowstone/i);
    },
  );
});
