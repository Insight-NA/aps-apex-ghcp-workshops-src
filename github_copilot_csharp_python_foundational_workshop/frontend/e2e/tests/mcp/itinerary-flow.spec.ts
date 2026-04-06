/**
 * MCP-03: Itinerary — Add Stops, Calculate Route, and Optimize
 *
 * Validates the full itinerary workflow: adding 3 stops, calculating
 * a route, and optimizing stop order.
 *
 * Tags: @itinerary @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 3
 */

import { test, expect } from '../../fixtures/base.fixture';
import { TIMEOUTS } from '../../helpers/test-data';

test.describe('Itinerary — Stops, Route & Optimize', { tag: ['@itinerary', '@regression'] }, () => {
  test('MCP-03: Add 3 stops, calculate route, and optimize', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();
    await itineraryPage.switchTab('Itinerary');

    // Add 3 stops
    await itineraryPage.addStop('Denver, CO');
    await itineraryPage.addStop('Salt Lake City, UT');
    await itineraryPage.addStop('Las Vegas, NV');

    // Verify stop count
    const stopCount = await itineraryPage.getStopCount();
    expect(stopCount).toBe(3);

    // Calculate route
    await itineraryPage.calculateRoute();

    // Assert Optimize button is visible after route calculation
    await expect(itineraryPage.optimizeButton).toBeVisible({ timeout: TIMEOUTS.ROUTE_CALCULATION });

    // Optimize route
    await itineraryPage.optimizeRoute();

    // Verify the page still shows 3 stops after optimization
    const optimizedCount = await itineraryPage.getStopCount();
    expect(optimizedCount).toBe(3);
  });
});
