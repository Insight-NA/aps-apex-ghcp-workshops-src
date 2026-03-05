/**
 * AuthStatus — Component Page Object for auth status display
 */

import { Page, Locator, expect } from '@playwright/test';

export class AuthStatus {
  readonly page: Page;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;
  readonly secureBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    // AuthStatus renders in the top-right corner with user email and logout
    this.userEmail = page.locator('[class*="auth"]').first();
    this.logoutButton = page.locator('button').filter({
      has: page.locator('svg.lucide-log-out'),
    }).first();
    this.secureBadge = page.getByText('Secure', { exact: false });
  }

  /** Assert that the user appears logged in */
  async expectLoggedIn(): Promise<void> {
    // When logged in, the auth status shows user info
    await expect(this.secureBadge).toBeVisible({ timeout: 5_000 });
  }

  /** Assert that no user is logged in */
  async expectLoggedOut(): Promise<void> {
    await expect(this.secureBadge).toBeHidden({ timeout: 5_000 });
  }

  /** Click the logout button */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /** Get the displayed user email text */
  async getEmail(): Promise<string> {
    return await this.userEmail.textContent() || '';
  }
}
