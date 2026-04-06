/**
 * MCP-08: Start Trip — Template Navigation
 *
 * Validates that quick-start template cards and action buttons
 * navigate to the itinerary page.
 *
 * Tags: @start @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 8
 */

import { test, expect } from '../../fixtures/base.fixture';

test.describe('Start Trip — Template Navigation', { tag: ['@start', '@regression'] }, () => {
  test.beforeEach(async ({ startTripPage }) => {
    await startTripPage.goto();
  });

  test('MCP-08a: Quick-start templates are visible', async ({ startTripPage, page }) => {
    await expect(page.getByText('Weekend Getaway')).toBeVisible();
    await expect(page.getByText('Cross Country')).toBeVisible();
    await expect(page.getByText('National Parks')).toBeVisible();
    await expect(page.getByText('Hidden Gems')).toBeVisible();
  });

  test('MCP-08b: Weekend Getaway template navigates to itinerary', async ({ startTripPage, page }) => {
    await startTripPage.selectTemplate('Weekend Getaway');
    await page.waitForURL('**/itinerary', { timeout: 5_000 });
    expect(page.url()).toContain('/itinerary');
  });

  test('MCP-08c: AI Trip Planner navigates to itinerary', async ({ startTripPage, page }) => {
    await startTripPage.startAITrip();
    await page.waitForURL('**/itinerary', { timeout: 5_000 });
    expect(page.url()).toContain('/itinerary');
  });

  test('MCP-08d: Start from scratch navigates to itinerary', async ({ startTripPage, page }) => {
    await startTripPage.startBlankTrip();
    await page.waitForURL('**/itinerary', { timeout: 5_000 });
    expect(page.url()).toContain('/itinerary');
  });
});
