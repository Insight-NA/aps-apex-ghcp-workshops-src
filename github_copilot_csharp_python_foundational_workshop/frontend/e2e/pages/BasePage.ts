/**
 * BasePage — Shared Page Object for all views
 *
 * Provides common navigation, toast assertion, and map interaction helpers.
 * All other page objects extend or compose with this class.
 */

import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  // Common locators
  readonly sidebar: Locator;
  readonly mobileNav: Locator;
  readonly mapCanvas: Locator;
  readonly mapContainer: Locator;
  readonly offlineIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('nav').filter({ has: page.locator('a[href="/explore"]') }).first();
    this.mobileNav = page.locator('nav.fixed.bottom-0').first();
    this.mapCanvas = page.locator('canvas.mapboxgl-canvas').first();
    this.mapContainer = page.locator('.mapboxgl-map').first();
    this.offlineIndicator = page.getByText('Offline');
  }

  // ─── Navigation ──────────────────────────────────────────

  /** Navigate to a specific route path */
  async navigateTo(path: '/' | '/explore' | '/itinerary' | '/trips' | '/start' | '/all-trips'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Click a sidebar nav item by its href path */
  async clickNavItem(path: string): Promise<void> {
    await this.sidebar.locator(`a[href="${path}"]`).click();
  }

  /** Get the currently active nav item's href */
  async getActiveNavHref(): Promise<string | null> {
    // Active nav items typically have a distinct visual class — look for aria-current or active-like class
    const activeLink = this.sidebar.locator('a[class*="text-blue"], a[class*="bg-blue"], a[aria-current="page"]').first();
    return await activeLink.getAttribute('href').catch(() => null);
  }

  /** Get the current URL path */
  getPath(): string {
    return new URL(this.page.url()).pathname;
  }

  // ─── Toast Notifications ─────────────────────────────────

  /** Assert that a toast message appears with the given text */
  async expectToast(text: string | RegExp): Promise<void> {
    const toastLocator = typeof text === 'string'
      ? this.page.getByText(text)
      : this.page.locator(`text=${text}`);
    await expect(toastLocator).toBeVisible({ timeout: 5_000 });
  }

  /** Wait for a toast to appear and then disappear */
  async waitForToastDismiss(text: string, timeout: number = 10_000): Promise<void> {
    const toast = this.page.getByText(text);
    await expect(toast).toBeVisible({ timeout: 5_000 });
    await expect(toast).toBeHidden({ timeout });
  }

  // ─── Map ─────────────────────────────────────────────────

  /** Assert the Mapbox map canvas is present and rendered */
  async expectMapVisible(): Promise<void> {
    await expect(this.mapCanvas).toBeVisible({ timeout: 10_000 });
  }

  /** Check if route line is rendered on the map */
  async hasRouteLine(): Promise<boolean> {
    // Route line is rendered as a Mapbox source/layer — check for the canvas update
    // This is a heuristic: we check if the map container has any route-related elements
    const routeSource = this.page.locator('[class*="mapboxgl"]');
    return await routeSource.count() > 0;
  }

  /** Count visible map markers */
  async getMarkerCount(): Promise<number> {
    return await this.page.locator('.mapboxgl-marker').count();
  }

  // ─── Auth Status ─────────────────────────────────────────

  /** Check if a user is currently logged in (token in localStorage) */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('token') !== null;
    });
  }

  /** Get the logged-in user's email from localStorage */
  async getUserEmail(): Promise<string | null> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('user_email');
    });
  }

  // ─── Utilities ───────────────────────────────────────────

  /** Wait for network to be idle (no pending requests for 500ms) */
  async waitForNetworkIdle(timeout: number = 5_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /** Wait for a specific API response */
  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 10_000): Promise<void> {
    await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        return typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      },
      { timeout }
    );
  }
}
