export interface POI {
  id: string;
  name: string;
  coordinates: [number, number];
  category: string;
  address?: string;
}
