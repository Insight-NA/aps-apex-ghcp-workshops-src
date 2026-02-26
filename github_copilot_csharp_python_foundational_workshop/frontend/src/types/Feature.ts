import type { Coordinates } from './index';

// Generic feature returned from our backend search endpoints
export interface Feature {
  id: string;
  text: string;
  place_name: string;
  geometry: {
    type: 'Point';
    coordinates: Coordinates;
  };
}
