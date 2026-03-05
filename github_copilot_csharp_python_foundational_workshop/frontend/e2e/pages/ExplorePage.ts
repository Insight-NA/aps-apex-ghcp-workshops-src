/**
 * ExplorePage — Page Object for /explore view
 *
 * Encapsulates interactions with the ExploreView:
 * - Category pill search
 * - Free-text search
 * - Search results handling
 * - Featured trips section
 * - "Add to Trip" action
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExplorePage extends BasePage {
  readonly searchInput: Locator;
  readonly featuredSection: Locator;
  readonly searchResultsList: Locator;
  readonly loadingSpinner: Locator;
  readonly clearSearchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search and Explore');
    this.featuredSection = page.getByText('Featured Trips');
    this.searchResultsList = page.locator('[class*="space-y"]').first();
    this.loadingSpinner = page.locator('svg.animate-spin').first();
    this.clearSearchButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
  }

  // ─── Navigation ──────────────────────────────────────────

  /** Navigate directly to the Explore page */
  async goto(): Promise<void> {
    await this.navigateTo('/explore');
  }

  // ─── Category Search ─────────────────────────────────────

  /** Get all visible category pill buttons */
  getCategoryPills(): Locator {
    // Category pills are buttons inside the scrollable category section
    return this.page.locator('button').filter({
      has: this.page.locator('svg'),
    });
  }

  /** Click a category pill by its visible label text */
  async clickCategory(label: string): Promise<void> {
    await this.page.getByText(label, { exact: false }).click();
  }

  /** Assert that category pills are rendered */
  async expectCategoriesVisible(): Promise<void> {
    // Check for known categories
    await expect(this.page.getByText('Places to Camp')).toBeVisible();
    await expect(this.page.getByText('Parks & Nature')).toBeVisible();
    await expect(this.page.getByText('Bars & Restaurants')).toBeVisible();
  }

  // ─── Text Search ─────────────────────────────────────────

  /** Type a search query and submit (Enter key) */
  async textSearch(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /** Clear the current search */
  async clearSearch(): Promise<void> {
    if (await this.clearSearchButton.isVisible().catch(() => false)) {
      await this.clearSearchButton.click();
    } else {
      await this.searchInput.clear();
    }
  }

  // ─── Search Results ──────────────────────────────────────

  /** Get all visible search result cards */
  getSearchResults(): Locator {
    return this.page.locator('[class*="border rounded-xl"]').filter({
      has: this.page.locator('h3, h4'),
    });
  }

  /** Get the count of search results */
  async getResultCount(): Promise<number> {
    return await this.getSearchResults().count();
  }

  /** Wait for search results to load (spinner disappears + results appear) */
  async waitForResults(timeout: number = 10_000): Promise<void> {
    // Wait for loading to complete
    await expect(this.loadingSpinner).toBeHidden({ timeout });
    // Wait for at least one result
    await expect(this.getSearchResults().first()).toBeVisible({ timeout });
  }

  /** Click "Add to Trip" on a search result by its index (0-based) */
  async addResultToTrip(index: number = 0): Promise<void> {
    const result = this.getSearchResults().nth(index);
    const addButton = result.getByText('Add to Trip', { exact: false });
    await addButton.click();
  }

  /** Get the name of a search result by index */
  async getResultName(index: number): Promise<string> {
    const result = this.getSearchResults().nth(index);
    const name = result.locator('h3, h4').first();
    return await name.textContent() || '';
  }

  // ─── Featured Trips ──────────────────────────────────────

  /** Assert that featured trips section is visible */
  async expectFeaturedTripsVisible(): Promise<void> {
    await expect(this.featuredSection).toBeVisible();
  }

  /** Get featured trip cards */
  getFeaturedTrips(): Locator {
    return this.page.locator('[class*="rounded-xl"]').filter({
      has: this.page.locator('img'),
    });
  }

  /** Click "View All" to navigate to the all-trips page */
  async clickViewAll(): Promise<void> {
    await this.page.getByText('View All', { exact: false }).click();
  }
}
