/**
 * AllTripsPage — Page Object for /all-trips view
 *
 * Encapsulates interactions with the AllTripsView:
 * - Community/public trips browsing
 * - Filter tabs (All / Featured)
 * - Loading a public trip into the itinerary
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AllTripsPage extends BasePage {
  readonly heading: Locator;
  readonly allFilterButton: Locator;
  readonly featuredFilterButton: Locator;
  readonly backButton: Locator;
  readonly tripCards: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('Community Trips', { exact: false });
    this.allFilterButton = page.getByRole('button', { name: 'All Trips' });
    this.featuredFilterButton = page.getByRole('button', { name: /Featured/ });
    this.backButton = page.locator('button').filter({ has: page.locator('svg.lucide-arrow-left') }).first();
    this.tripCards = page.locator('[class*="rounded-xl"]').filter({ has: page.locator('img') });
    this.loadingSpinner = page.locator('svg.animate-spin').first();
  }

  // ─── Navigation ──────────────────────────────────────────

  /** Navigate directly to the All Trips page */
  async goto(): Promise<void> {
    await this.navigateTo('/all-trips');
  }

  /** Click the back button to return to explore */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // ─── Filters ─────────────────────────────────────────────

  /** Switch to "All Trips" filter */
  async filterAll(): Promise<void> {
    await this.allFilterButton.click();
  }

  /** Switch to "Featured" filter */
  async filterFeatured(): Promise<void> {
    await this.featuredFilterButton.click();
  }

  // ─── Trip Cards ──────────────────────────────────────────

  /** Get the count of visible trip cards */
  async getTripCount(): Promise<number> {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 5_000 });
    return await this.tripCards.count();
  }

  /** Click a trip card by its visible name */
  async loadTrip(name: string): Promise<void> {
    const card = this.tripCards.filter({ hasText: name }).first();
    await card.click();
  }

  // ─── Assertions ──────────────────────────────────────────

  /** Assert the page heading and filter tabs are visible */
  async expectPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.allFilterButton).toBeVisible();
    await expect(this.featuredFilterButton).toBeVisible();
  }
}
