/**
 * Centralized Selector Strategy for Playwright E2E Tests
 *
 * Follows Playwright best practices:
 *   1. getByRole() — accessible locators (preferred)
 *   2. getByText() / getByPlaceholder() — visible text
 *   3. data-testid — fallback for elements without accessible roles
 *
 * @see https://playwright.dev/docs/locators#locating-elements
 *
 * IMPORTANT: When adding data-testid attributes to React components,
 * update both the component AND this file to keep them in sync.
 */

// ─── Navigation ──────────────────────────────────────────────
export const NAV = {
  /** Desktop sidebar container */
  sidebar: 'nav[class*="hidden md:flex"]',
  /** Mobile bottom navigation */
  mobileNav: 'nav[class*="md:hidden"]',
  /** Nav link by route path — use getByRole('link') with name instead when possible */
  link: (path: string) => `a[href="${path}"]`,
} as const;

// ─── Explore View ────────────────────────────────────────────
export const EXPLORE = {
  /** Search input field */
  searchInput: 'Search and Explore',
  /** Category pill buttons — use getByRole('button', { name }) */
  categoryPill: (label: string) => label,
  /** Search result items */
  resultItem: '[class*="border rounded-xl"]',
  /** "Add to Trip" button on a search result */
  addToTripButton: 'Add to Trip',
  /** Featured trips section heading */
  featuredHeading: 'Featured Trips',
} as const;

// ─── Itinerary / FloatingPanel ───────────────────────────────
export const ITINERARY = {
  /** Tab buttons by label text */
  tab: (name: 'Itinerary' | 'Vehicle' | 'Directions' | 'Trips') => name,
  /** Stop search input */
  stopSearchInput: 'Add a stop (City, Place)...',
  /** Calculate Route button */
  calculateRouteButton: 'Calculate Route',
  /** Optimize button */
  optimizeButton: 'Optimize',
  /** Save trip button */
  saveTripButton: 'Save Trip',
  /** Trip name input (when saving) */
  tripNameInput: 'Trip name...',
  /** Login button (demo) */
  loginDemoButton: 'Login with Google (Demo)',
  /** Route distance display (after calculation) */
  routeDistance: 'text=/\\d+(\\.\\d+)?\\s*(mi|km|miles)/',
  /** Route duration display */
  routeDuration: 'text=/\\d+\\s*(hr|min|hours|minutes)/',
  /** Stop item in the list — contains stop name */
  stopItem: (name: string) => `text=${name}`,
  /** Remove stop button (X icon on each stop) */
  removeStopButton: 'button:has(svg)',
  /** POI category buttons along route */
  poiGasButton: 'Gas',
  poiFoodButton: 'Food',
  poiSleepButton: 'Sleep',
} as const;

// ─── Vehicle Tab ─────────────────────────────────────────────
export const VEHICLE = {
  /** Vehicle type dropdown */
  typeSelect: 'select',
  /** Vehicle AI text input */
  aiInput: 'Describe your vehicle...',
  /** Manual spec fields (by label text) */
  heightInput: 'Height',
  weightInput: 'Weight',
  widthInput: 'Width',
  rangeInput: 'Range',
  mpgInput: 'MPG',
} as const;

// ─── Trips View ──────────────────────────────────────────────
export const TRIPS = {
  /** Page heading */
  heading: 'My Trips',
  /** Trip card — clickable */
  tripCard: '[class*="border rounded-xl"][class*="cursor-pointer"]',
  /** Delete trip button (trash icon) */
  deleteButton: 'button:has(svg.lucide-trash-2)',
  /** Empty state message */
  emptyMessage: 'No trips yet',
  /** Login prompt message */
  loginPrompt: 'Sign in to see your trips',
  /** Plan a Trip CTA button */
  planTripButton: 'Plan a Trip',
} as const;

// ─── Start Trip View ─────────────────────────────────────────
export const START = {
  /** Page heading */
  heading: 'Start a Trip',
  /** Blank trip button */
  blankTripButton: 'Start from scratch',
  /** AI trip button */
  aiTripButton: 'AI Trip Planner',
  /** Template buttons */
  templateButton: (name: string) => name,
} as const;

// ─── All Trips (Community) View ──────────────────────────────
export const ALL_TRIPS = {
  /** Page heading */
  heading: 'Community Trips',
  /** Filter tab buttons */
  allFilter: 'All Trips',
  featuredFilter: 'Featured',
  /** Back button */
  backButton: 'button:has(svg.lucide-arrow-left)',
} as const;

// ─── Auth ────────────────────────────────────────────────────
export const AUTH = {
  /** Auth status component — shows user email when logged in */
  userBadge: '[class*="auth-status"]',
  /** Logout button */
  logoutButton: 'button:has(svg.lucide-log-out)',
  /** "Secure" badge text */
  secureBadge: 'Secure',
} as const;

// ─── Map ─────────────────────────────────────────────────────
export const MAP = {
  /** Mapbox GL canvas element */
  canvas: 'canvas.mapboxgl-canvas',
  /** Map container */
  container: '.mapboxgl-map',
  /** Marker elements (custom markers rendered by React Map GL) */
  marker: '.mapboxgl-marker',
} as const;

// ─── Generic ─────────────────────────────────────────────────
export const COMMON = {
  /** Toast notification container (react-hot-toast) */
  toastContainer: '[class*="go"]', // react-hot-toast generates go* classes
  /** Loading spinner */
  spinner: 'svg.animate-spin',
  /** Offline indicator */
  offlineIndicator: 'text=Offline',
  /** Version display */
  versionDisplay: '[class*="version"]',
} as const;
