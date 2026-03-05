/**
 * Playwright Global Teardown
 *
 * Runs ONCE after all test suites complete.
 * Cleans up test data created during the test run.
 */

import { FullConfig } from '@playwright/test';
import { ApiHelpers } from './helpers/api-helpers';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 Global Teardown: Cleaning up test data...');

  const api = new ApiHelpers();

  try {
    await api.init();

    // Attempt to clean up E2E test trips
    const token = await api.devLogin().catch(() => null);
    if (token) {
      const deleted = await api.deleteTestTrips(token);
      if (deleted > 0) {
        console.log(`   🗑️  Deleted ${deleted} test trip(s)`);
      }
    }
  } catch (error) {
    // Teardown failures should not fail the test run
    console.warn('   ⚠️  Teardown cleanup failed (non-fatal):', (error as Error).message);
  } finally {
    await api.dispose();
  }

  console.log('   ✅ Teardown complete\n');
}

export default globalTeardown;
