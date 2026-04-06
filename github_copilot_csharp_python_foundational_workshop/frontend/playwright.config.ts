import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright E2E Test Configuration for Road Trip Planner
 *
 * Target: Full Docker Compose stack
 *   - Frontend: http://localhost:5173
 *   - BFF:      http://localhost:3000
 *
 * Usage:
 *   npm run test:e2e              # Run all tests
 *   npm run test:e2e:ui           # Interactive UI mode
 *   npm run test:e2e:smoke        # Smoke tests only
 *   npm run test:e2e:headed       # Run with browser visible
 *   npm run test:e2e:debug        # Debug mode (step through)
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const CI = !!process.env.CI;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const BFF_URL = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './e2e/test-results',

  /* Maximum time a test can run */
  timeout: 30_000,

  /* Assertion timeout */
  expect: {
    timeout: 5_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: CI,

  /* Retry on CI only */
  retries: CI ? 2 : 0,

  /* Limit parallel workers on CI to avoid resource contention */
  workers: CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: CI
    ? [['junit', { outputFile: 'e2e/test-results/junit-results.xml' }], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['html', { outputFolder: 'playwright-report', open: 'on-failure' }], ['list']],

  /* Shared settings for all projects */
  use: {
    /* Base URL for navigations: page.goto('/explore') → http://localhost:5173/explore */
    baseURL: BASE_URL,

    /* Collect trace on first retry for debugging failures */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on first retry */
    video: 'on-first-retry',

    /* Reasonable viewport */
    viewport: { width: 1280, height: 720 },

    /* No animations for deterministic tests */
    actionTimeout: 10_000,
  },

  /* Global setup: authenticate via devLogin and cache storageState */
  globalSetup: path.resolve(__dirname, 'e2e/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'e2e/global-teardown.ts'),

  /* Configure projects for major browsers and devices */
  projects: [
    /* ── Desktop Browsers ─────────────────────────── */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /* ── Mobile Viewports ─────────────────────────── */
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
});
