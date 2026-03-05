/**
 * Reusable Test Data for Playwright E2E Tests
 *
 * Contains pre-defined test fixtures for stops, vehicles, trips, and coordinates.
 * When tests need realistic data, import from here instead of hardcoding inline.
 */

// ─── Coordinates ────────────────────────────────────────────
/** Well-known US cities with coordinates [lng, lat] (GeoJSON order) */
export const COORDINATES = {
  NEW_YORK: [-74.006, 40.7128] as [number, number],
  LOS_ANGELES: [-118.2437, 34.0522] as [number, number],
  CHICAGO: [-87.6298, 41.8781] as [number, number],
  DENVER: [-104.9903, 39.7392] as [number, number],
  AUSTIN: [-97.7431, 30.2672] as [number, number],
  SEATTLE: [-122.3321, 47.6062] as [number, number],
  MIAMI: [-80.1918, 25.7617] as [number, number],
  NASHVILLE: [-86.7816, 36.1627] as [number, number],
  SAN_FRANCISCO: [-122.4194, 37.7749] as [number, number],
  PORTLAND: [-122.6765, 45.5152] as [number, number],
} as const;

// ─── Stop Search Queries ─────────────────────────────────────
/** City names that the geocoding API is likely to resolve */
export const STOP_QUERIES = {
  ORIGIN: 'Denver, CO',
  DESTINATION: 'Austin, TX',
  WAYPOINT_1: 'Nashville, TN',
  WAYPOINT_2: 'Chicago, IL',
  WAYPOINT_3: 'Seattle, WA',
  /** Short query for fuzzy match testing */
  SHORT: 'NYC',
  /** Full address */
  ADDRESS: '1600 Pennsylvania Avenue, Washington DC',
} as const;

// ─── Vehicle Specs ───────────────────────────────────────────
export const VEHICLE_TYPES = {
  CAR: 'car',
  SUV: 'suv',
  VAN: 'van',
  RV_SMALL: 'rv_small',
  RV_LARGE: 'rv_large',
  TRUCK: 'truck',
  EV: 'ev',
} as const;

export const VEHICLE_SPECS = {
  DEFAULT_CAR: {
    height: 5,
    weight: 4000,
    width: 6,
    length: 15,
    fuelType: 'gasoline',
    range: 400,
    mpg: 30,
  },
  LARGE_RV: {
    height: 12,
    weight: 20000,
    width: 8.5,
    length: 35,
    fuelType: 'diesel',
    range: 300,
    mpg: 8,
  },
  ELECTRIC: {
    height: 5,
    weight: 5000,
    width: 6.5,
    length: 16,
    fuelType: 'electric',
    range: 300,
    mpg: 0,
  },
} as const;

/** AI vehicle description strings for free-text input testing */
export const VEHICLE_AI_DESCRIPTIONS = {
  TRUCK_WITH_TRAILER: '2022 Ford F-150 towing a 25ft boat',
  SPRINTER_VAN: 'Mercedes Sprinter 170 converted camper van',
  TESLA: 'Tesla Model Y Long Range 2024',
} as const;

// ─── Trip Data ───────────────────────────────────────────────
export const TRIP_NAMES = {
  SMOKE_TEST: 'E2E Smoke Test Trip',
  ROAD_TRIP: 'Cross Country E2E Test',
  SHORT_TRIP: 'Weekend Quick Trip',
  /** Prefix for identifying and cleaning up test trips */
  PREFIX: 'E2E_TEST_',
} as const;

/**
 * Generate a unique trip name for test isolation.
 * Uses timestamp to avoid collisions between parallel test runs.
 */
export function uniqueTripName(base: string = TRIP_NAMES.SMOKE_TEST): string {
  return `${TRIP_NAMES.PREFIX}${base}_${Date.now()}`;
}

// ─── Explore / Search ────────────────────────────────────────
export const EXPLORE_QUERIES = {
  CATEGORIES: ['campground', 'park', 'restaurant', 'hotel', 'gas station'] as const,
  TEXT_SEARCH: 'Grand Canyon',
  POI_SEARCH: 'Yellowstone National Park',
} as const;

// ─── Timeouts ────────────────────────────────────────────────
/** Custom timeouts for operations that may take longer than defaults */
export const TIMEOUTS = {
  /** Route calculation (depends on Mapbox API) */
  ROUTE_CALCULATION: 15_000,
  /** Geocoding search */
  GEOCODE_SEARCH: 10_000,
  /** Trip save (network + DB write) */
  TRIP_SAVE: 10_000,
  /** Map tiles loading */
  MAP_LOAD: 15_000,
  /** Auth flow (devLogin) */
  AUTH_FLOW: 10_000,
  /** POI search (may hit Azure Maps) */
  POI_SEARCH: 15_000,
} as const;
