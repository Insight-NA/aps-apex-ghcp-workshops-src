/**
 * EXP-01: Category Pill Search
 *
 * Validates that clicking a category pill on the Explore page triggers a
 * /api/search request and renders at least one result card with a non-empty
 * name.
 *
 * Tags: @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running at localhost:5173
 */

import { test, expect } from '../../fixtures/base.fixture';
import { TIMEOUTS } from '../../helpers/test-data';

test.describe('Category Pill Search', { tag: ['@regression'] }, () => {
  test('EXP-01: clicking "Places to Camp" returns visible result cards', async ({
    explorePage,
    page,
  }) => {
    // Navigate to the Explore view
    await explorePage.goto();

    // Verify category pills are rendered before interacting
    await explorePage.expectCategoriesVisible();

    // Start intercepting the search API response before the click triggers it
    const searchResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/search') && response.status() === 200,
      { timeout: TIMEOUTS.POI_SEARCH },
    );

    // Click the "Places to Camp" category pill
    await explorePage.clickCategory('Places to Camp');

    // Wait for the actual API response — no arbitrary timeouts
    await searchResponsePromise;

    // Assert at least one result card is visible
    const resultCount = await explorePage.getResultCount();
    expect(resultCount, 'Expected at least one search result card to be visible').toBeGreaterThan(0);

    // Assert the first result has a non-empty name
    const firstName = await explorePage.getResultName(0);
    expect(firstName.trim(), 'Expected the first result to have a non-empty name').not.toBe('');
  });
});
