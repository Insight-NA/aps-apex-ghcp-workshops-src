export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteStop {
  location: Location;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}

export interface POI {
  id: string;
  name: string;
  location: Location;
  category: POICategory;
  description?: string;
  rating?: number;
  priceRange?: string;
}

export type POICategory = 
  | 'restaurant' 
  | 'hotel' 
  | 'attraction' 
  | 'gas-station' 
  | 'scenic-view'
  | 'park'
  | 'museum'
  | 'shopping';

export interface CarType {
  id: string;
  name: string;
  mpg: number;
  image?: string;
}

export interface TripData {
  id: string;
  name: string;
  origin: Location;
  destination: Location;
  stops: RouteStop[];
  pois: POI[];
  carType: CarType;
  totalMiles: number;
  gasCost: number;
  gasPrice: number;
  route: [number, number][];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
