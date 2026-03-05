/**
 * Auth Fixture — Authenticated Test Context
 *
 * Extends the base Playwright test with a pre-authenticated browser context.
 * Uses the storageState cached by global-setup.ts (devLogin via MOCK_TOKEN).
 *
 * Usage:
 *   import { test, expect } from '../fixtures/auth.fixture';
 *
 *   test('save trip requires auth', async ({ authenticatedPage }) => {
 *     // authenticatedPage is already logged in
 *   });
 *
 * @see https://playwright.dev/docs/auth#testing-multiple-roles
 */

import { test as base, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FILE = path.resolve(__dirname, '..', '.auth', 'user.json');

type AuthFixtures = {
  /** A Page with pre-loaded auth storageState (logged-in user) */
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
