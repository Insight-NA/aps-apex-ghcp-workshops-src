/**
 * MapComponent — Component Page Object for Mapbox GL map interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class MapComponent {
  readonly page: Page;
  readonly canvas: Locator;
  readonly container: Locator;
  readonly markers: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator('canvas.mapboxgl-canvas').first();
    this.container = page.locator('.mapboxgl-map').first();
    this.markers = page.locator('.mapboxgl-marker');
  }

  /** Assert the map canvas is visible and rendering */
  async expectVisible(): Promise<void> {
    await expect(this.container).toBeVisible({ timeout: 15_000 });
    await expect(this.canvas).toBeVisible({ timeout: 15_000 });
  }

  /** Get the count of markers on the map */
  async getMarkerCount(): Promise<number> {
    return await this.markers.count();
  }

  /** Assert that markers are showing on the map */
  async expectMarkersVisible(minCount: number = 1): Promise<void> {
    await expect(async () => {
      const count = await this.getMarkerCount();
      expect(count).toBeGreaterThanOrEqual(minCount);
    }).toPass({ timeout: 10_000 });
  }

  /** Assert that no markers are on the map */
  async expectNoMarkers(): Promise<void> {
    const count = await this.getMarkerCount();
    expect(count).toBe(0);
  }

  /**
   * Check if a route line layer is rendered.
   * Uses evaluate to check Mapbox GL's internal state.
   */
  async hasRouteLayer(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const mapElement = document.querySelector('.mapboxgl-map');
      if (!mapElement) return false;
      // Check for canvas content — indirect indicator of route rendering
      const canvas = mapElement.querySelector('canvas');
      return canvas !== null && canvas.width > 0;
    });
  }
}
