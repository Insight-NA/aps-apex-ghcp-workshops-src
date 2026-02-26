/**
 * Geographic coordinate type
 * Format: [longitude, latitude] (GeoJSON standard)
 */
export type Coordinates = [number, number];

/**
 * Stop type discriminator
 */
export type StopType = 'start' | 'end' | 'stop';

/**
 * Trip stop location
 */
export interface Stop {
  id: string;
  name: string;
  coordinates: Coordinates;
  address?: string;
  type: StopType;
  order: number;
}

/**
 * Vehicle type category
 */
export type VehicleType = 'car' | 'suv' | 'rv' | 'truck' | 'ev';

/**
 * Vehicle specifications (matches backend VehicleSpecsResponse schema)
 */
export interface VehicleSpecs {
  height: number;        // meters
  width: number;         // meters
  length?: number;       // meters (optional - may not be available for all types)
  weight: number;        // tonnes
  fuelType: 'gas' | 'diesel' | 'electric';
  range: number;         // miles
  mpg: number;           // miles per gallon (or MPGe for electric)
}

/**
 * Route leg between two stops
 */
export interface RouteLeg {
  distance: number;      // meters
  duration: number;      // seconds
  geometry: GeoJSON.LineString;
  steps?: RouteStep[];
}

/**
 * Individual route step/instruction
 */
export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  maneuver?: {
    type: string;
    modifier?: string;
    location: Coordinates;
  };
}

/**
 * Complete route information
 */
export interface Route {
  distance: number;       // total meters
  duration: number;       // total seconds
  geometry: GeoJSON.LineString;
  legs: RouteLeg[];
  waypoints: Array<{
    name: string;
    location: Coordinates;
  }>;
}

/**
 * POI category type
 */
export type POICategory = 'gas_station' | 'restaurant' | 'hotel' | 'attraction';

/**
 * Point of Interest
 */
export interface POI {
  id: string;
  name: string;
  category: POICategory;
  coordinates: Coordinates;
  address?: string;
  phone?: string;
  rating?: number;
  price_level?: number;
  distance_from_route?: number;  // meters
  brand?: string;
  amenities?: string[];
}

/**
 * Trip entity (matches backend schema)
 */
export interface Trip {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  stops: Stop[];
  vehicle_specs?: VehicleSpecs;
  route_geojson?: GeoJSON.Feature<GeoJSON.LineString>;
  distance?: number;      // total miles
  duration?: number;      // total minutes
  is_public: boolean;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Trip creation payload
 */
export interface TripCreate {
  name: string;
  description?: string;
  stops: Stop[];
  vehicle_specs?: VehicleSpecs;
  route_geojson?: GeoJSON.Feature<GeoJSON.LineString>;
  distance?: number;
  is_public?: boolean;
}

/**
 * Trip update payload
 */
export interface TripUpdate {
  name?: string;
  description?: string;
  stops?: Stop[];
  vehicle_specs?: VehicleSpecs;
  route_geojson?: GeoJSON.Feature<GeoJSON.LineString>;
  distance?: number;
  is_public?: boolean;
  is_featured?: boolean;
  image_url?: string;
}

/**
 * User entity
 */
export interface User {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  created_at: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * API error response
 */
export interface APIError {
  detail: string;
  status_code?: number;
}

/**
 * Mapbox Directions API response type
 */
export interface MapboxDirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: GeoJSON.LineString | {
      coordinates: Coordinates[];
      type: 'LineString';
    };
    legs: Array<{
      distance: number;
      duration: number;
      steps?: RouteStep[];
    }>;
  }>;
  waypoints: Array<{
    name: string;
    location: Coordinates;
  }>;
}

/**
 * Azure Maps search response feature
 */
export interface AzureMapsFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: Coordinates;
  };
  properties: {
    name: string;
    category?: string;
    address?: string;
    phone?: string;
    [key: string]: unknown;
  };
}
