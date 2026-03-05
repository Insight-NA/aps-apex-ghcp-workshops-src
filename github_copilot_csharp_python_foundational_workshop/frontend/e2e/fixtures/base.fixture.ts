/**
 * Base Fixture — Extends Playwright test with Page Object Models
 *
 * Provides all page objects as test fixtures so tests don't
 * need to manually instantiate them.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/base.fixture';
 *
 *   test('explore category search', async ({ explorePage }) => {
 *     await explorePage.goto();
 *     await explorePage.clickCategory('Places to Camp');
 *     // ...
 *   });
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

import { test as base } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { ExplorePage } from '../pages/ExplorePage';
import { ItineraryPage } from '../pages/ItineraryPage';
import { TripsPage } from '../pages/TripsPage';
import { StartTripPage } from '../pages/StartTripPage';
import { AllTripsPage } from '../pages/AllTripsPage';

type PageFixtures = {
  basePage: BasePage;
  explorePage: ExplorePage;
  itineraryPage: ItineraryPage;
  tripsPage: TripsPage;
  startTripPage: StartTripPage;
  allTripsPage: AllTripsPage;
};

export const test = base.extend<PageFixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  explorePage: async ({ page }, use) => {
    await use(new ExplorePage(page));
  },
  itineraryPage: async ({ page }, use) => {
    await use(new ItineraryPage(page));
  },
  tripsPage: async ({ page }, use) => {
    await use(new TripsPage(page));
  },
  startTripPage: async ({ page }, use) => {
    await use(new StartTripPage(page));
  },
  allTripsPage: async ({ page }, use) => {
    await use(new AllTripsPage(page));
  },
});

export { expect } from '@playwright/test';
