/**
 * MCP-07: My Trips Page — Auth Guard & Empty State
 *
 * Validates the /trips page auth guard behavior:
 * - Unauthenticated users see "Sign in to see your trips"
 * - Injecting a token and reloading shows authenticated state
 *
 * Tags: @trips @auth @regression
 * Priority: P1
 * Prerequisites: Docker Compose stack running
 *
 * @see docs/workshops/playwright/playwright-mcp-prompts.md — Prompt 7
 */

import { test, expect } from '../../fixtures/base.fixture';

test.describe('My Trips — Auth Guard', { tag: ['@trips', '@auth', '@regression'] }, () => {
  test('MCP-07a: Unauthenticated users see login prompt', async ({ tripsPage, page }) => {
    await tripsPage.goto();

    // Assert login prompt is visible
    await tripsPage.expectLoginPrompt();

    // Confirm no token in localStorage
    const hasToken = await page.evaluate(() => localStorage.getItem('token') !== null);
    expect(hasToken).toBe(false);
  });

  test('MCP-07b: Injected token shows authenticated state', async ({ tripsPage, page }) => {
    await tripsPage.goto();

    // Inject fake auth token into localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_email', 'test@example.com');
    });

    // Reload to pick up the new auth state
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Should no longer show login prompt — shows either trips or empty state
    const loginPromptVisible = await tripsPage.loginPrompt.isVisible().catch(() => false);
    expect(loginPromptVisible).toBe(false);
  });
});
