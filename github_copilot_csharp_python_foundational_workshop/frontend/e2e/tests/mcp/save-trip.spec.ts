/**
 * MCP-06: Save Trip — Unauthenticated Flow & Demo Login
 *
 * Validates the full trip save flow: add stops, fill trip details,
 * demo login when unauthenticated, then save and confirm.
 *
 * Tags: @save @auth @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 6
 */

import { test, expect } from '../../fixtures/base.fixture';
import { uniqueTripName, TIMEOUTS } from '../../helpers/test-data';

test.describe('Save Trip — Auth Flow', { tag: ['@save', '@auth', '@regression'] }, () => {
  test('MCP-06: Demo login and save trip', async ({ itineraryPage, page }) => {
    await itineraryPage.goto();

    // Add two stops
    await itineraryPage.addStop('Austin, TX');
    await itineraryPage.addStop('Nashville, TN');

    // Fill in trip details
    const tripName = uniqueTripName('Southern Road Trip');
    await itineraryPage.enterTripName(tripName);

    const descriptionInput = page.getByPlaceholder(/description/i)
      .or(page.locator('textarea')).first();
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('From Texas to Tennessee');
    }

    // Assert Demo Login button is visible (unauthenticated)
    await expect(itineraryPage.loginDemoButton).toBeVisible();

    // Click Demo Login and wait for token in localStorage
    await itineraryPage.clickLoginDemo();

    // Verify we're now authenticated
    // Runs in browser context — localStorage available at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isLoggedIn = await page.evaluate(() => (globalThis as any).localStorage.getItem('token') !== null);
    expect(isLoggedIn).toBe(true);

    // Save the trip
    await itineraryPage.saveTrip();

    // Confirm success toast
    await itineraryPage.expectToast(/saved|success/i);
  });
});
