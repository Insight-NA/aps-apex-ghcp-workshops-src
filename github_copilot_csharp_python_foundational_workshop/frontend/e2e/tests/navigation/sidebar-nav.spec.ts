/**
 * NAV-01: Sidebar Navigation Tests
 *
 * Validates that clicking sidebar nav items navigates to the correct routes
 * and the correct view content loads.
 *
 * Tags: @smoke @navigation
 * Priority: P0
 * Prerequisites: Docker Compose stack running
 */

import { test, expect } from '@playwright/test';
import { Sidebar } from '../../pages/components/Sidebar';

test.describe('Sidebar Navigation @smoke @navigation', () => {
  let sidebar: Sidebar;

  test.beforeEach(async ({ page }) => {
    sidebar = new Sidebar(page);
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
  });

  test('NAV-01a: Navigate to Explore', async ({ page }) => {
    await sidebar.goToExplore();
    await page.waitForURL('**/explore');

    expect(page.url()).toContain('/explore');
    await expect(page.getByText('Places to Camp')).toBeVisible({ timeout: 5_000 });
  });

  test('NAV-01b: Navigate to Itinerary', async ({ page }) => {
    await sidebar.goToItinerary();
    await page.waitForURL('**/itinerary');

    expect(page.url()).toContain('/itinerary');
    await expect(page.getByPlaceholder('Add a stop (City, Place)...')).toBeVisible({ timeout: 5_000 });
  });

  test('NAV-01c: Navigate to My Trips', async ({ page }) => {
    await sidebar.goToTrips();
    await page.waitForURL('**/trips');

    expect(page.url()).toContain('/trips');
    await expect(page.getByText('My Trips')).toBeVisible({ timeout: 5_000 });
  });

  test('NAV-01d: Navigate to Start Trip', async ({ page }) => {
    await sidebar.goToStart();
    await page.waitForURL('**/start');

    expect(page.url()).toContain('/start');
    await expect(page.getByText('Start a Trip')).toBeVisible({ timeout: 5_000 });
  });

  test('NAV-01e: Sequential navigation between all views', async ({ page }) => {
    // Explore → Itinerary → Trips → Start → back to Explore
    await sidebar.goToItinerary();
    await page.waitForURL('**/itinerary');
    expect(page.url()).toContain('/itinerary');

    await sidebar.goToTrips();
    await page.waitForURL('**/trips');
    expect(page.url()).toContain('/trips');

    await sidebar.goToStart();
    await page.waitForURL('**/start');
    expect(page.url()).toContain('/start');

    await sidebar.goToExplore();
    await page.waitForURL('**/explore');
    expect(page.url()).toContain('/explore');
  });

  test('NAV-02: Browser back/forward preserves navigation', async ({ page }) => {
    // Navigate forward: explore → itinerary → trips
    await sidebar.goToItinerary();
    await page.waitForURL('**/itinerary');

    await sidebar.goToTrips();
    await page.waitForURL('**/trips');

    // Go back to itinerary
    await page.goBack();
    await page.waitForURL('**/itinerary');
    expect(page.url()).toContain('/itinerary');

    // Go forward to trips again
    await page.goForward();
    await page.waitForURL('**/trips');
    expect(page.url()).toContain('/trips');
  });
});
