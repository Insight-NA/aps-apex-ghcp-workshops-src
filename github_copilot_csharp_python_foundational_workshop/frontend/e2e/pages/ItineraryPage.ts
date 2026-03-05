/**
 * ItineraryPage — Page Object for /itinerary view (FloatingPanel)
 *
 * Encapsulates interactions with the FloatingPanel component:
 * - Tab navigation (Itinerary, Vehicle, Directions, Trips)
 * - Stop management (add, remove, reorder)
 * - Route calculation and optimization
 * - Trip save/load operations
 * - POI search along route
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../helpers/test-data';

export class ItineraryPage extends BasePage {
  readonly stopSearchInput: Locator;
  readonly calculateRouteButton: Locator;
  readonly optimizeButton: Locator;
  readonly saveButton: Locator;
  readonly tripNameInput: Locator;
  readonly loginDemoButton: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.stopSearchInput = page.getByPlaceholder('Add a stop (City, Place)...');
    this.calculateRouteButton = page.getByText('Calculate Route', { exact: false });
    this.optimizeButton = page.getByText('Optimize', { exact: false });
    this.saveButton = page.getByText('Save Trip', { exact: false });
    this.tripNameInput = page.getByPlaceholder('Trip name...');
    this.loginDemoButton = page.getByText('Login with Google (Demo)', { exact: false });
    this.loadingSpinner = page.locator('svg.animate-spin').first();
  }

  // ─── Navigation ──────────────────────────────────────────

  /** Navigate directly to the Itinerary page */
  async goto(): Promise<void> {
    await this.navigateTo('/itinerary');
  }

  // ─── Tab Navigation ──────────────────────────────────────

  /** Switch to a specific tab in the FloatingPanel */
  async switchTab(name: 'Itinerary' | 'Vehicle' | 'Directions' | 'Trips'): Promise<void> {
    // Tabs are buttons or clickable elements with the tab label text
    await this.page.getByText(name, { exact: true }).first().click();
  }

  /** Assert the currently active tab */
  async expectActiveTab(name: string): Promise<void> {
    // Active tab usually has a distinct visual style (bg-blue, text-blue, etc.)
    const tab = this.page.getByText(name, { exact: true }).first();
    await expect(tab).toBeVisible();
  }

  // ─── Stop Management ─────────────────────────────────────

  /** Add a stop by searching for a location */
  async addStop(query: string): Promise<void> {
    await this.stopSearchInput.fill(query);
    await this.stopSearchInput.press('Enter');

    // Wait for geocoding API response
    await this.page.waitForResponse(
      (response) => response.url().includes('/api/geocode'),
      { timeout: TIMEOUTS.GEOCODE_SEARCH }
    );

    // Click the first search result to add it as a stop
    await this.page.waitForTimeout(500);
    const firstResult = this.page.locator('[class*="cursor-pointer"]').filter({
      hasText: query.split(',')[0],
    }).first();

    if (await firstResult.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await firstResult.click();
    }
  }

  /** Get all stops currently in the stops list */
  getStopsList(): Locator {
    // Stop items contain a grip handle (GripVertical icon) and the stop name
    return this.page.locator('[class*="flex items-center"]').filter({
      has: this.page.locator('svg'),
    });
  }

  /** Get the count of stops in the list */
  async getStopCount(): Promise<number> {
    // Count items that look like stop entries (have a numbered marker or grip)
    const stops = this.page.locator('[class*="rounded-full"][class*="w-6"]');
    return await stops.count();
  }

  /** Remove a stop by clicking its X button */
  async removeStop(index: number): Promise<void> {
    const stopItems = this.page.locator('[class*="group"]').filter({
      has: this.page.locator('svg.lucide-x'),
    });
    const removeBtn = stopItems.nth(index).locator('button').filter({
      has: this.page.locator('svg.lucide-x'),
    }).first();
    await removeBtn.click();
  }

  // ─── Route Operations ────────────────────────────────────

  /** Click "Calculate Route" and wait for the directions API response */
  async calculateRoute(): Promise<void> {
    await this.calculateRouteButton.click();

    await this.page.waitForResponse(
      (response) => response.url().includes('/api/directions'),
      { timeout: TIMEOUTS.ROUTE_CALCULATION }
    );

    // Wait for the UI to update with route info
    await this.page.waitForTimeout(1_000);
  }

  /** Click "Optimize" to reorder stops */
  async optimizeRoute(): Promise<void> {
    await this.optimizeButton.click();

    await this.page.waitForResponse(
      (response) => response.url().includes('/api/optimize'),
      { timeout: TIMEOUTS.ROUTE_CALCULATION }
    );
  }

  /** Get the displayed route distance text */
  async getRouteDistance(): Promise<string> {
    const distanceEl = this.page.locator('text=/\\d+(\\.\\d+)?\\s*(mi|km|miles)/').first();
    return await distanceEl.textContent() || '';
  }

  /** Get the displayed route duration text */
  async getRouteDuration(): Promise<string> {
    const durationEl = this.page.locator('text=/\\d+\\s*(hr|min|hours|minutes)/').first();
    return await durationEl.textContent() || '';
  }

  // ─── Trip Save/Load ──────────────────────────────────────

  /** Enter a trip name in the save input */
  async enterTripName(name: string): Promise<void> {
    await this.tripNameInput.fill(name);
  }

  /** Click Save Trip button */
  async saveTrip(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForResponse(
      (response) => response.url().includes('/api/trips') && response.request().method() === 'POST',
      { timeout: TIMEOUTS.TRIP_SAVE }
    );
  }

  /** Click the login demo button */
  async clickLoginDemo(): Promise<void> {
    await this.loginDemoButton.click();
    await this.page.waitForFunction(
      () => localStorage.getItem('token') !== null,
      { timeout: TIMEOUTS.AUTH_FLOW }
    );
  }

  // ─── Vehicle Tab ─────────────────────────────────────────

  /** Select a vehicle type from the dropdown */
  async selectVehicleType(type: string): Promise<void> {
    await this.switchTab('Vehicle');
    const select = this.page.locator('select').first();
    await select.selectOption(type);
  }

  /** Enter an AI vehicle description */
  async enterVehicleDescription(description: string): Promise<void> {
    await this.switchTab('Vehicle');
    const input = this.page.getByPlaceholder('Describe your vehicle');
    if (await input.isVisible().catch(() => false)) {
      await input.fill(description);
      await input.press('Enter');
    }
  }

  // ─── Directions Tab ──────────────────────────────────────

  /** Switch to directions tab and verify content */
  async viewDirections(): Promise<void> {
    await this.switchTab('Directions');
  }

  /** Get directions step count */
  async getDirectionsStepCount(): Promise<number> {
    const steps = this.page.locator('[class*="direction-step"], [class*="step"]');
    return await steps.count();
  }

  // ─── POI Search Along Route ──────────────────────────────

  /** Click a POI category button (Gas, Food, Sleep) */
  async searchPOIAlongRoute(category: 'Gas' | 'Food' | 'Sleep'): Promise<void> {
    await this.page.getByText(category, { exact: true }).click();
    await this.page.waitForResponse(
      (response) => response.url().includes('/api/search'),
      { timeout: TIMEOUTS.POI_SEARCH }
    );
  }
}
