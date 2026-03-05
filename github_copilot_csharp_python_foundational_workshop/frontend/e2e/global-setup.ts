/**
 * Playwright Global Setup
 *
 * Runs ONCE before all test suites. Authenticates via devLogin()
 * and caches the browser storageState for reuse in authenticated tests.
 *
 * The storageState file is saved to e2e/.auth/user.json and consumed
 * by the auth fixture and any test that needs an authenticated session.
 *
 * @see https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
 */

import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_DIR = path.resolve(__dirname, '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'user.json');

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5173';
  const bffURL = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';

  console.log(`\n🔐 Global Setup: Authenticating via devLogin...`);
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   BFF URL:  ${bffURL}`);

  // Ensure .auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    // Navigate to the itinerary page where the login button lives
    await page.goto('/itinerary', { waitUntil: 'networkidle' });

    // The FloatingPanel has tabs — switch to "Trips" tab to access login
    const tripsTab = page.getByText('Trips', { exact: false }).first();
    await tripsTab.click();

    // Wait for the tab content to render
    await page.waitForTimeout(500);

    // Click the "Login with Google (Demo)" button which calls devLogin()
    const loginButton = page.getByText('Login with Google (Demo)', { exact: false });

    if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginButton.click();

      // Wait for the auth flow to complete — token stored in localStorage
      await page.waitForFunction(
        () => localStorage.getItem('token') !== null,
        { timeout: 10_000 }
      );

      console.log('   ✅ Authentication successful — token cached');
    } else {
      // If button not found, try API-based login directly
      console.log('   ⚠️  Login button not visible — attempting API-based auth...');

      const response = await page.request.post(`${bffURL}/api/auth/google`, {
        data: { token: 'MOCK_TOKEN' },
      });

      if (response.ok()) {
        const body = await response.json();
        const token = body.access_token || body.token;
        const refreshToken = body.refresh_token || '';
        const email = body.email || 'test@example.com';

        // Inject tokens into localStorage
        await page.evaluate(
          ({ token, refreshToken, email }) => {
            localStorage.setItem('token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('user_email', email);
          },
          { token, refreshToken, email }
        );

        console.log('   ✅ API-based authentication successful');
      } else {
        console.warn(`   ⚠️  Auth API returned ${response.status()} — tests requiring auth may fail`);
      }
    }

    // Save the storage state (cookies + localStorage) for reuse
    await context.storageState({ path: AUTH_FILE });
    console.log(`   📁 Storage state saved to: ${AUTH_FILE}\n`);
  } catch (error) {
    console.error('   ❌ Global setup auth failed:', error);
    console.warn('   ⚠️  Continuing without auth — unauthenticated tests will still run\n');

    // Save empty storage state so the file exists
    await context.storageState({ path: AUTH_FILE });
  } finally {
    await browser.close();
  }
}

export default globalSetup;
