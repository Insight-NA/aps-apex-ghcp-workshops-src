/**
 * MCP-05: Directions Tab — Turn-by-Turn Review
 *
 * Validates that after calculating a route, the Directions tab
 * renders leg headers with distance/duration and step instructions.
 *
 * Tags: @directions @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 5
 */

import { test, expect } from '../../fixtures/base.fixture';

test.describe('Directions Tab — Turn-by-Turn', { tag: ['@directions', '@regression'] }, () => {
  test('MCP-05: Directions render after route calculation', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();

    // Add 2 stops to create a calculable route
    await itineraryPage.addStop('Los Angeles, CA');
    await itineraryPage.addStop('San Francisco, CA');

    // Calculate route
    await itineraryPage.calculateRoute();

    // Switch to Directions tab
    await itineraryPage.viewDirections();

    // Assert at least one leg header with distance/duration is visible
    const legHeader = page.locator('text=/\\d+(\\.\\d+)?\\s*(mi|km|miles|hours|hr|min)/').first();
    await expect(legHeader).toBeVisible({ timeout: 5_000 });

    // Assert step instructions are rendered
    const stepCount = await itineraryPage.getDirectionsStepCount();
    expect(stepCount).toBeGreaterThan(0);
  });
});
