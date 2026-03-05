/**
 * SM-01 through SM-04: Smoke Tests — App Loads
 *
 * Validates that the application loads correctly, core UI elements render,
 * and backend services are healthy.
 *
 * Tags: @smoke
 * Priority: P0
 * Prerequisites: Docker Compose stack running
 */

import { test, expect } from '@playwright/test';
import { Sidebar } from '../../pages/components/Sidebar';
import { MapComponent } from '../../pages/components/MapComponent';

test.describe('Smoke Tests @smoke', () => {
  test('SM-01: App loads and redirects root to /explore', async ({ page }) => {
    await page.goto('/');

    // Root should redirect to /explore
    await page.waitForURL('**/explore', { timeout: 10_000 });
    expect(page.url()).toContain('/explore');
  });

  test('SM-02: Sidebar navigation items render', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });

    const sidebar = new Sidebar(page);
    await sidebar.expectAllLinksVisible();
  });

  test('SM-03: Map canvas renders', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });

    const map = new MapComponent(page);
    await map.expectVisible();
  });

  test('SM-04: BFF health endpoint returns healthy', async ({ request }) => {
    const bffUrl = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';
    const response = await request.get(`${bffUrl}/health`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    // BFF health aggregates all backend service health checks
    expect(body).toBeDefined();
  });

  test('SM-05: Auth status shows no logged-in user by default', async ({ page }) => {
    // Use a fresh context with no stored auth state
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });

    const isLoggedIn = await page.evaluate(() => {
      return localStorage.getItem('token') !== null;
    });

    expect(isLoggedIn).toBe(false);
  });

  test('SM-06: Explore view renders category pills', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });

    // Check for known category labels
    await expect(page.getByText('Places to Camp')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Parks & Nature')).toBeVisible();
  });

  test('SM-07: Itinerary view renders FloatingPanel with tabs', async ({ page }) => {
    await page.goto('/itinerary', { waitUntil: 'domcontentloaded' });

    // FloatingPanel should show with at least the Itinerary tab
    await expect(page.getByPlaceholder('Add a stop (City, Place)...')).toBeVisible({ timeout: 5_000 });
  });

  test('SM-08: Start Trip view renders all options', async ({ page }) => {
    await page.goto('/start', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Start a Trip')).toBeVisible();
    await expect(page.getByText('Start from scratch')).toBeVisible();
    await expect(page.getByText('AI Trip Planner')).toBeVisible();
    await expect(page.getByText('Quick Start Templates')).toBeVisible();
  });
});
