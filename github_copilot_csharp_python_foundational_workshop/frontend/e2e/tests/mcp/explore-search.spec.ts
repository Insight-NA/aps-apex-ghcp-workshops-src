/**
 * MCP-02: Explore Page — Search & Category Filter
 *
 * Validates text search, category pill filtering, and "Add to Trip" action
 * from the Explore page.
 *
 * Tags: @explore @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 2
 */

import { test, expect } from '../../fixtures/base.fixture';
import { EXPLORE_QUERIES, TIMEOUTS } from '../../helpers/test-data';

test.describe('Explore Search & Category Filter', { tag: ['@explore', '@regression'] }, () => {
  test.beforeEach(async ({ explorePage }) => {
    await explorePage.goto();
  });

  test('MCP-02a: Text search returns results for "Yellowstone"', async ({ explorePage }) => {
    await explorePage.textSearch(EXPLORE_QUERIES.POI_SEARCH);
    await explorePage.waitForResults(TIMEOUTS.GEOCODE_SEARCH);

    const count = await explorePage.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('MCP-02b: Category pill filters results', async ({ explorePage }) => {
    await explorePage.clickCategory('Parks & Nature');
    await explorePage.waitForResults(TIMEOUTS.GEOCODE_SEARCH);

    const count = await explorePage.getResultCount();
    expect(count).toBeGreaterThan(0);
  });

  test('MCP-02c: Add to Trip shows toast confirmation', async ({ explorePage }) => {
    await explorePage.clickCategory('Parks & Nature');
    await explorePage.waitForResults(TIMEOUTS.GEOCODE_SEARCH);

    await explorePage.addResultToTrip(0);
    await explorePage.expectToast(/added|trip/i);
  });
});
