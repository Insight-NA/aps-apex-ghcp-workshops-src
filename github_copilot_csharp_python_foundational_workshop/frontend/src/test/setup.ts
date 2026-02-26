import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (used by some UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Mapbox GL (prevent errors in components using react-map-gl)
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(),
    Marker: vi.fn(),
    LngLatBounds: vi.fn(),
  },
}));

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
vi.stubEnv('VITE_MAPBOX_TOKEN', 'pk.test_token');
vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test_client_id.apps.googleusercontent.com');
