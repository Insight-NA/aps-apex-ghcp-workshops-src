/**
 * Demo 4: Flaky Locator Debugging Exercise
 *
 * ⚠️ THIS FILE CONTAINS INTENTIONAL BUGS for workshop Demo 4.
 * Do NOT fix these bugs before the workshop — they are teaching material.
 *
 * Bugs present (instructor reference):
 *   BUG #1 (Line 26): Fragile CSS class selector instead of accessible locator
 *   BUG #2 (Line 35): Missing wait — asserts immediately after navigation
 *   BUG #3 (Line 49): Hardcoded nth-child selector for dynamic map markers
 *   BUG #4 (Line 58): Hardcoded timeout magic number instead of TIMEOUTS constant
 *   BUG #5 (Line 66): Uses page.waitForTimeout (arbitrary delay) instead of waitForResponse
 *
 * Workshop goal: Use Copilot Chat to identify and fix all 5 issues.
 *
 * Tags: @regression @workshop
 * Priority: P1
 */

import { test, expect } from '@playwright/test';

test.describe('Itinerary Route Calculation @regression @workshop', () => {

  test('ITN-DEMO: Calculate route between two stops', async ({ page }) => {
    await page.goto('/itinerary', { waitUntil: 'domcontentloaded' });

    // BUG #1: Fragile CSS class selector — breaks if Tailwind classes change
    // ❌ Should use: page.getByPlaceholder('Add a stop (City, Place)...')
    const stopInput = page.locator('.flex.items-center input.border-gray-300');
    await stopInput.fill('Denver, CO');
    await stopInput.press('Enter');

    // BUG #2: Missing wait for geocoding API response
    // ❌ Should wait for: page.waitForResponse(r => r.url().includes('/api/geocode'))
    // Instead, immediately tries to click a result that hasn't loaded yet
    const firstResult = page.locator('[class*="cursor-pointer"]').first();
    await firstResult.click();

    // Add second stop
    await stopInput.fill('Austin, TX');
    await stopInput.press('Enter');

    // Wait and click second result (same BUG #2 pattern — no API wait)
    const secondResult = page.locator('[class*="cursor-pointer"]').first();
    await secondResult.click();

    // BUG #3: Hardcoded nth-child for dynamic content — markers load in unpredictable order
    // ❌ Should use: page.locator('.mapboxgl-marker') and count, not nth-child
    const thirdMarker = page.locator('.mapboxgl-marker:nth-child(3)');
    await expect(thirdMarker).toBeVisible();

    // Click Calculate Route
    // BUG #4: Hardcoded timeout magic number instead of importing TIMEOUTS.ROUTE_CALCULATION
    // ❌ Should use: import { TIMEOUTS } from '../../helpers/test-data'
    const calculateButton = page.getByText('Calculate Route');
    await calculateButton.click();

    // BUG #5: Uses arbitrary delay instead of waiting for the directions API response
    // ❌ Should use: page.waitForResponse(r => r.url().includes('/api/directions'))
    await page.waitForTimeout(5000);

    // Assert route info appears
    const distanceText = page.locator('text=/\\d+(\\.\\d+)?\\s*(mi|km|miles)/').first();
    await expect(distanceText).toBeVisible({ timeout: 3000 });
  });
});

// ═══════════════════════════════════════════════════════════════
// INSTRUCTOR REFERENCE: Fixed version below (do not show until
// after students have debugged with Copilot Chat)
// ═══════════════════════════════════════════════════════════════

/*
import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../../helpers/test-data';

test.describe('Itinerary Route Calculation @regression', () => {

  test('ITN-DEMO: Calculate route between two stops (FIXED)', async ({ page }) => {
    await page.goto('/itinerary', { waitUntil: 'domcontentloaded' });

    // FIX #1: Use accessible placeholder locator (resilient to CSS changes)
    const stopInput = page.getByPlaceholder('Add a stop (City, Place)...');
    await stopInput.fill('Denver, CO');
    await stopInput.press('Enter');

    // FIX #2: Wait for geocoding API response before clicking result
    await page.waitForResponse(
      (response) => response.url().includes('/api/geocode'),
      { timeout: TIMEOUTS.GEOCODE_SEARCH }
    );
    const firstResult = page.locator('[class*="cursor-pointer"]').first();
    await firstResult.click();

    // Add second stop with proper wait
    await stopInput.fill('Austin, TX');
    await stopInput.press('Enter');
    await page.waitForResponse(
      (response) => response.url().includes('/api/geocode'),
      { timeout: TIMEOUTS.GEOCODE_SEARCH }
    );
    const secondResult = page.locator('[class*="cursor-pointer"]').first();
    await secondResult.click();

    // FIX #3: Assert marker count instead of targeting specific nth-child
    const markers = page.locator('.mapboxgl-marker');
    await expect(markers).toHaveCount(2, { timeout: 5_000 });

    // FIX #4: Use named constant for timeout
    const calculateButton = page.getByText('Calculate Route');
    await calculateButton.click();

    // FIX #5: Wait for the actual API response instead of arbitrary delay
    await page.waitForResponse(
      (response) => response.url().includes('/api/directions'),
      { timeout: TIMEOUTS.ROUTE_CALCULATION }
    );

    // Assert route info appears
    const distanceText = page.locator('text=/\\d+(\\.\\d+)?\\s*(mi|km|miles)/').first();
    await expect(distanceText).toBeVisible({ timeout: 5_000 });
  });
});
*/
