import { Stop } from './Stop';
import { Vehicle } from './Vehicle';

export interface Trip {
  id: number;
  name: string;
  description?: string;
  stops: Stop[];
  vehicle_specs: Vehicle;
  routeGeoJSON?: GeoJSON.Feature<GeoJSON.LineString>;
  image_url?: string;
}
