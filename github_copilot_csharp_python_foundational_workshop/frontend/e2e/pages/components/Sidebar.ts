/**
 * Sidebar — Component Page Object for desktop sidebar navigation
 */

import { Page, Locator, expect } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly container: Locator;
  readonly exploreLink: Locator;
  readonly itineraryLink: Locator;
  readonly tripsLink: Locator;
  readonly startLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // The sidebar is a nav element that contains links to all routes
    this.container = page.locator('nav').filter({ has: page.locator('a[href="/explore"]') }).first();
    this.exploreLink = page.locator('a[href="/explore"]').first();
    this.itineraryLink = page.locator('a[href="/itinerary"]').first();
    this.tripsLink = page.locator('a[href="/trips"]').first();
    this.startLink = page.locator('a[href="/start"]').first();
  }

  /** Assert all navigation items are visible */
  async expectAllLinksVisible(): Promise<void> {
    await expect(this.exploreLink).toBeVisible();
    await expect(this.itineraryLink).toBeVisible();
    await expect(this.tripsLink).toBeVisible();
    await expect(this.startLink).toBeVisible();
  }

  /** Navigate to explore */
  async goToExplore(): Promise<void> {
    await this.exploreLink.click();
  }

  /** Navigate to itinerary */
  async goToItinerary(): Promise<void> {
    await this.itineraryLink.click();
  }

  /** Navigate to trips */
  async goToTrips(): Promise<void> {
    await this.tripsLink.click();
  }

  /** Navigate to start trip */
  async goToStart(): Promise<void> {
    await this.startLink.click();
  }

  /** Get the href of the currently active/highlighted link */
  async getActiveHref(): Promise<string | null> {
    const links = [this.exploreLink, this.itineraryLink, this.tripsLink, this.startLink];
    for (const link of links) {
      const classes = await link.getAttribute('class') || '';
      if (classes.includes('bg-blue') || classes.includes('text-blue')) {
        return await link.getAttribute('href');
      }
    }
    return null;
  }
}
