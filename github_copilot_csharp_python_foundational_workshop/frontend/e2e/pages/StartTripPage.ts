/**
 * StartTripPage — Page Object for /start view
 *
 * Encapsulates interactions with the StartTripView:
 * - Blank trip creation
 * - AI trip planner
 * - Quick start templates
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class StartTripPage extends BasePage {
  readonly heading: Locator;
  readonly blankTripButton: Locator;
  readonly aiTripButton: Locator;
  readonly templatesSection: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('Start a Trip', { exact: false });
    this.blankTripButton = page.getByText('Start from scratch');
    this.aiTripButton = page.getByText('AI Trip Planner');
    this.templatesSection = page.getByText('Quick Start Templates');
  }

  // ─── Navigation ──────────────────────────────────────────

  /** Navigate directly to the Start Trip page */
  async goto(): Promise<void> {
    await this.navigateTo('/start');
  }

  // ─── Actions ─────────────────────────────────────────────

  /** Click "Start from scratch" button */
  async startBlankTrip(): Promise<void> {
    await this.blankTripButton.click();
  }

  /** Click "AI Trip Planner" button */
  async startAITrip(): Promise<void> {
    await this.aiTripButton.click();
  }

  /** Click a specific template by its title */
  async selectTemplate(title: string): Promise<void> {
    await this.page.getByText(title, { exact: false }).click();
  }

  /** Get all template buttons */
  getTemplates(): Locator {
    return this.page.locator('button').filter({
      has: this.page.locator('h4'),
    });
  }

  // ─── Assertions ──────────────────────────────────────────

  /** Assert all main entry points are visible */
  async expectAllOptionsVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.blankTripButton).toBeVisible();
    await expect(this.aiTripButton).toBeVisible();
    await expect(this.templatesSection).toBeVisible();
  }

  /** Assert template titles are visible */
  async expectTemplatesVisible(): Promise<void> {
    await expect(this.page.getByText('Weekend Getaway')).toBeVisible();
    await expect(this.page.getByText('Cross Country')).toBeVisible();
    await expect(this.page.getByText('National Parks')).toBeVisible();
    await expect(this.page.getByText('Hidden Gems')).toBeVisible();
  }
}
