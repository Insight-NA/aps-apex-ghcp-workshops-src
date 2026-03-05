/**
 * API Helper Utilities for Playwright E2E Tests
 *
 * Direct API calls for test setup/teardown (creating seed data, cleaning up).
 * These bypass the UI to efficiently arrange test preconditions.
 *
 * @example
 *   // In a test setup:
 *   const api = new ApiHelpers(BFF_URL);
 *   const token = await api.devLogin();
 *   await api.deleteTestTrips(token);
 */

import { APIRequestContext, request } from '@playwright/test';

const BFF_URL = process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:3000';

export class ApiHelpers {
  private baseUrl: string;
  private requestContext: APIRequestContext | null = null;

  constructor(baseUrl: string = BFF_URL) {
    this.baseUrl = baseUrl;
  }

  /** Create a reusable API request context */
  async init(): Promise<void> {
    this.requestContext = await request.newContext({
      baseURL: this.baseUrl,
    });
  }

  /** Dispose of the request context (call in teardown) */
  async dispose(): Promise<void> {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
  }

  private get ctx(): APIRequestContext {
    if (!this.requestContext) {
      throw new Error('ApiHelpers not initialized. Call init() first.');
    }
    return this.requestContext;
  }

  // ─── Health ──────────────────────────────────────────────

  /** Check BFF aggregated health endpoint */
  async checkHealth(): Promise<{ status: number; body: unknown }> {
    const response = await this.ctx.get('/health');
    return {
      status: response.status(),
      body: await response.json().catch(() => null),
    };
  }

  // ─── Auth ────────────────────────────────────────────────

  /** Perform dev/mock login and return access token */
  async devLogin(): Promise<string> {
    const response = await this.ctx.post('/api/auth/google', {
      data: { token: 'MOCK_TOKEN' },
    });

    if (!response.ok()) {
      throw new Error(`devLogin failed: ${response.status()} ${response.statusText()}`);
    }

    const body = await response.json();
    return body.access_token || body.token;
  }

  /** Perform guest login and return access token */
  async guestLogin(): Promise<string> {
    const response = await this.ctx.post('/api/auth/guest');

    if (!response.ok()) {
      throw new Error(`guestLogin failed: ${response.status()} ${response.statusText()}`);
    }

    const body = await response.json();
    return body.access_token || body.token;
  }

  // ─── Trips ───────────────────────────────────────────────

  /** Get all trips for the authenticated user */
  async getTrips(token: string): Promise<unknown[]> {
    const response = await this.ctx.get('/api/trips', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok() ? await response.json() : [];
  }

  /** Create a trip via API (test seed data) */
  async createTrip(
    token: string,
    data: {
      name: string;
      stops: Array<{ id: string; name: string; coordinates: [number, number]; type: string }>;
      vehicle_specs?: Record<string, unknown>;
    }
  ): Promise<{ id: number }> {
    const response = await this.ctx.post('/api/trips', {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });

    if (!response.ok()) {
      throw new Error(`createTrip failed: ${response.status()}`);
    }

    return await response.json();
  }

  /** Delete a specific trip by ID */
  async deleteTrip(token: string, tripId: number): Promise<void> {
    await this.ctx.delete(`/api/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /** Delete all trips whose name starts with the E2E test prefix */
  async deleteTestTrips(token: string, prefix: string = 'E2E_TEST_'): Promise<number> {
    const trips = await this.getTrips(token);
    let deleted = 0;

    for (const trip of trips) {
      const t = trip as { id: number; name: string };
      if (t.name?.startsWith(prefix)) {
        await this.deleteTrip(token, t.id);
        deleted++;
      }
    }

    return deleted;
  }
}
