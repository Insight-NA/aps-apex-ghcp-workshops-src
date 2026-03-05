/**
 * TripsPage — Page Object for /trips view
 *
 * Encapsulates interactions with the TripsView:
 * - Viewing saved trips list
 * - Selecting/loading a trip
 * - Deleting a trip
 * - Unauthenticated and empty states
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TripsPage extends BasePage {
  readonly heading: Locator;
  readonly tripCards: Locator;
  readonly emptyMessage: Locator;
  readonly loginPrompt: Locator;
  readonly planTripButton: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('My Trips', { exact: false });
    this.tripCards = page.locator('[class*="border rounded-xl"][class*="cursor-pointer"]');
    this.emptyMessage = page.getByText('No trips yet');
    this.loginPrompt = page.getByText('Sign in to see your trips');
    this.planTripButton = page.getByText('Plan a Trip');
    this.loadingSpinner = page.locator('svg.animate-spin').first();
  }

  // ─── Navigation ──────────────────────────────────────────

  /** Navigate directly to the Trips page */
  async goto(): Promise<void> {
    await this.navigateTo('/trips');
  }

  // ─── Trip List ───────────────────────────────────────────

  /** Get the count of trip cards */
  async getTripCount(): Promise<number> {
    return await this.tripCards.count();
  }

  /** Get a trip card by its name */
  getTripByName(name: string): Locator {
    return this.tripCards.filter({ hasText: name });
  }

  /** Click a trip to load it */
  async selectTrip(name: string): Promise<void> {
    await this.getTripByName(name).click();
  }

  /** Delete a trip by clicking its trash icon */
  async deleteTrip(name: string): Promise<void> {
    const tripCard = this.getTripByName(name);
    // Hover to reveal the delete button
    await tripCard.hover();
    const deleteButton = tripCard.locator('button').filter({
      has: this.page.locator('svg'),
    }).last();
    await deleteButton.click();
  }

  // ─── State Assertions ────────────────────────────────────

  /** Assert the page shows the login prompt (unauthenticated) */
  async expectLoginPrompt(): Promise<void> {
    await expect(this.loginPrompt).toBeVisible();
  }

  /** Assert the page shows the empty state (authenticated, no trips) */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
    await expect(this.planTripButton).toBeVisible();
  }

  /** Assert the page shows trip cards (authenticated, has trips) */
  async expectTripsLoaded(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 5_000 });
    const count = await this.getTripCount();
    expect(count).toBeGreaterThan(0);
  }

  /** Assert a specific trip name appears in the list */
  async expectTripExists(name: string): Promise<void> {
    await expect(this.getTripByName(name)).toBeVisible();
  }

  /** Assert a specific trip name does NOT appear in the list */
  async expectTripNotExists(name: string): Promise<void> {
    await expect(this.getTripByName(name)).toBeHidden();
  }
}
