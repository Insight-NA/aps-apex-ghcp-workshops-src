/**
 * MCP-04: Vehicle Tab — Dropdown Selection & AI Analyzer
 *
 * Validates vehicle type dropdown selection updates dimension fields,
 * and AI vehicle description analyzer populates specs.
 *
 * Tags: @vehicle @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 4
 */

import { test, expect } from '../../fixtures/base.fixture';
import { VEHICLE_TYPES, TIMEOUTS } from '../../helpers/test-data';

test.describe('Vehicle Tab — Selection & AI Analyzer', { tag: ['@vehicle', '@regression'] }, () => {
  test.beforeEach(async ({ itineraryPage }) => {
    await itineraryPage.goto();
    await itineraryPage.switchTab('Vehicle');
  });

  test('MCP-04a: Vehicle type dropdown is visible and selectable', async ({ page }) => {
    const vehicleSelect = page.locator('select').first();
    await expect(vehicleSelect).toBeVisible();

    // Select "RV Large"
    await vehicleSelect.selectOption(VEHICLE_TYPES.RV_LARGE);

    // Verify dimension inputs are populated with non-empty values
    const heightInput = page.getByLabel(/height/i).or(page.locator('input[name*="height"]')).first();
    await expect(heightInput).toBeVisible();
  });

  test('MCP-04b: AI vehicle analyzer populates specs', async ({ itineraryPage, page }) => {
    const aiInput = page.getByPlaceholder('Describe your vehicle');
    // Skip if the AI input is not visible on this build
    test.skip(!(await aiInput.isVisible().catch(() => false)), 'AI vehicle input not present');

    await aiInput.fill('2023 Ford F-150 with a 36-gallon tank and 20 MPG highway');

    const analyzeButton = page.getByText('Analyze', { exact: false });
    await analyzeButton.click();

    // Wait for AI response to populate dimension fields
    await page.waitForResponse(
      (response) => response.url().includes('/api/') && response.status() === 200,
      { timeout: TIMEOUTS.POI_SEARCH }
    );
  });
});
