import { TripData, Location, POI, CarType, RouteStop } from '../types';

const cities: Record<string, Location> = {
  'new york': { lat: 40.7128, lng: -74.0060, name: 'New York, NY' },
  'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
  'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
  'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
  'seattle': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  'san francisco': { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
  'denver': { lat: 39.7392, lng: -104.9903, name: 'Denver, CO' },
  'boston': { lat: 42.3601, lng: -71.0589, name: 'Boston, MA' },
  'austin': { lat: 30.2672, lng: -97.7431, name: 'Austin, TX' },
  'portland': { lat: 45.5152, lng: -122.6784, name: 'Portland, OR' },
  'nashville': { lat: 36.1627, lng: -86.7816, name: 'Nashville, TN' },
  'atlanta': { lat: 33.7490, lng: -84.3880, name: 'Atlanta, GA' },
  'las vegas': { lat: 36.1699, lng: -115.1398, name: 'Las Vegas, NV' },
  'phoenix': { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ' },
};

const carTypes: CarType[] = [
  { id: '1', name: 'Sedan (30 MPG)', mpg: 30 },
  { id: '2', name: 'SUV (22 MPG)', mpg: 22 },
  { id: '3', name: 'Hybrid (45 MPG)', mpg: 45 },
  { id: '4', name: 'Electric (100 MPGe)', mpg: 100 },
  { id: '5', name: 'Truck (18 MPG)', mpg: 18 },
];

function findCityInPrompt(prompt: string): Location | null {
  const lowerPrompt = prompt.toLowerCase();
  for (const [key, location] of Object.entries(cities)) {
    if (lowerPrompt.includes(key)) {
      return location;
    }
  }
  return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function interpolatePoints(start: Location, end: Location, numPoints: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    points.push([lat, lng]);
  }
  return points;
}

function generatePOIs(start: Location, end: Location, route: [number, number][]): POI[] {
  const pois: POI[] = [];
  const numPOIs = Math.min(route.length, 15);
  
  const poiTemplates = [
    { category: 'restaurant' as const, names: ['The Roadside Diner', 'Mountain View Cafe', 'Highway Grill', 'Sunset Bistro', 'Route 66 Kitchen'] },
    { category: 'hotel' as const, names: ['Comfort Inn', 'Mountain Lodge', 'Highway Hotel', 'Traveler\'s Rest', 'Grand View Resort'] },
    { category: 'attraction' as const, names: ['Historic Landmark', 'Scenic Overlook', 'State Park', 'Museum of Natural History', 'Art Gallery'] },
    { category: 'gas-station' as const, names: ['Shell Station', 'BP Gas', 'Chevron', 'ExxonMobil', 'Speedway'] },
    { category: 'scenic-view' as const, names: ['Mountain Vista', 'Canyon Viewpoint', 'Lake Overlook', 'Desert Panorama', 'Valley View'] },
  ];

  for (let i = 0; i < numPOIs; i++) {
    const template = poiTemplates[i % poiTemplates.length];
    const pointIndex = Math.floor((i / numPOIs) * route.length);
    const [lat, lng] = route[pointIndex];
    
    pois.push({
      id: `poi-${i}`,
      name: template.names[i % template.names.length],
      location: {
        lat: lat + (Math.random() - 0.5) * 0.1,
        lng: lng + (Math.random() - 0.5) * 0.1,
        name: template.names[i % template.names.length],
      },
      category: template.category,
      rating: 3.5 + Math.random() * 1.5,
      priceRange: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
    });
  }

  return pois;
}

function generateStops(start: Location, end: Location, route: [number, number][]): RouteStop[] {
  const stops: RouteStop[] = [];
  const numStops = Math.min(Math.floor(route.length / 20), 8);

  for (let i = 1; i <= numStops; i++) {
    const pointIndex = Math.floor((i / (numStops + 1)) * route.length);
    const [lat, lng] = route[pointIndex];
    
    stops.push({
      location: {
        lat,
        lng,
        name: `Stop ${i}`,
      },
      notes: `Recommended rest stop`,
    });
  }

  return stops;
}

export function generateTripFromPrompt(prompt: string): TripData {
  const words = prompt.toLowerCase().split(/\s+/);
  
  let origin: Location | null = null;
  let destination: Location | null = null;
  
  // Find "from X to Y" pattern
  const fromIndex = words.findIndex(w => w === 'from');
  const toIndex = words.findIndex(w => w === 'to');
  
  if (fromIndex !== -1 && toIndex !== -1) {
    const fromText = words.slice(fromIndex + 1, toIndex).join(' ');
    const toText = words.slice(toIndex + 1).join(' ');
    
    for (const [key, location] of Object.entries(cities)) {
      if (fromText.includes(key)) origin = location;
      if (toText.includes(key)) destination = location;
    }
  }
  
  // Fallback: find any two cities in the prompt
  if (!origin || !destination) {
    const foundCities = Object.entries(cities).filter(([key]) => 
      prompt.toLowerCase().includes(key)
    );
    
    if (foundCities.length >= 2) {
      origin = foundCities[0][1];
      destination = foundCities[1][1];
    }
  }
  
  // Default trip if no cities found
  if (!origin) origin = cities['new york'];
  if (!destination) destination = cities['los angeles'];
  
  const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const route = interpolatePoints(origin, destination, 50);
  const pois = generatePOIs(origin, destination, route);
  const stops = generateStops(origin, destination, route);
  
  const carType = carTypes[0]; // Default sedan
  const gasPrice = 3.50; // $ per gallon
  const gasCost = (distance / carType.mpg) * gasPrice;

  return {
    id: Date.now().toString(),
    name: `${origin.name} to ${destination.name}`,
    origin,
    destination,
    stops,
    pois,
    carType,
    totalMiles: Math.round(distance),
    gasCost: Math.round(gasCost * 100) / 100,
    gasPrice,
    route,
    createdAt: new Date().toISOString(),
  };
}
