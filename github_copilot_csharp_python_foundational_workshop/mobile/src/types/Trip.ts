import { Stop } from './Stop';
import { Vehicle } from './Vehicle';

export interface Trip {
    id: string;
    name: string;
    description?: string;
    stops: Stop[];
    vehicle_specs: Vehicle;
    routeGeoJSON?: any;
    image_url?: string;
}
