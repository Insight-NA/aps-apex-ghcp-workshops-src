import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTripStore } from './useTripStore';
import axios from 'axios';

vi.mock('axios');

describe('useTripStore', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock alert
    global.alert = vi.fn();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => 'mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    
    useTripStore.setState({
      stops: [],
      vehicleSpecs: {
        height: 3.5,
        weight: 10,
        width: 2.5,
        length: 12,
        fuelType: 'diesel',
        range: 500,
        mpg: 10,
      },
      routeGeoJSON: null,
      routeDistance: 0,
      routeDuration: 0,
      routeLegs: [],
      pois: []
    });
  });

  it('should add a stop', () => {
    const stop = {
      id: '1',
      name: 'Test Stop',
      coordinates: [0, 0] as [number, number],
      type: 'stop' as const
    };

    useTripStore.getState().addStop(stop);
    expect(useTripStore.getState().stops).toHaveLength(1);
    expect(useTripStore.getState().stops[0]).toEqual(stop);
  });

  it('should remove a stop', () => {
    const stop = {
      id: '1',
      name: 'Test Stop',
      coordinates: [0, 0] as [number, number],
      type: 'stop' as const
    };

    useTripStore.getState().addStop(stop);
    useTripStore.getState().removeStop('1');
    expect(useTripStore.getState().stops).toHaveLength(0);
  });

  it('should update vehicle specs', () => {
    useTripStore.getState().setVehicleSpecs({ height: 4.0 });
    expect(useTripStore.getState().vehicleSpecs.height).toBe(4.0);
    // Should preserve other values
    expect(useTripStore.getState().vehicleSpecs.weight).toBe(10);
  });

  it('should save a trip', async () => {
    const stop = {
      id: '1',
      name: 'Test Stop',
      coordinates: [0, 0] as [number, number],
      type: 'stop' as const
    };
    useTripStore.getState().addStop(stop);
    
    // Set route GeoJSON in state
    const routeGeoJSON = {
      type: 'LineString',
      coordinates: [[0, 0], [1, 1]],
      properties: { distance: 100, duration: 60 }
    };
    useTripStore.setState({ routeGeoJSON });
    
    (axios.post as unknown as jest.Mock).mockResolvedValue({ data: { success: true } });

    await useTripStore.getState().saveTrip('My Trip');

    expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/trips', expect.objectContaining({
      name: 'My Trip',
      stops: [stop],
      route_geojson: routeGeoJSON
    }), {
      headers: { Authorization: 'Bearer mock-token' }
    });
  });

  it('should load trips', async () => {
    const mockTrips = [{ id: 1, name: 'Trip 1' }];
    (axios.get as unknown as jest.Mock).mockResolvedValue({ data: mockTrips });

    const trips = await useTripStore.getState().loadTrips();
    expect(trips).toEqual(mockTrips);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/trips', {
      headers: { Authorization: 'Bearer mock-token' }
    });
  });

  it('should load a specific trip', async () => {
    const routeGeoJSON = {
      type: 'LineString',
      coordinates: [[-122.4, 37.8], [-122.3, 37.9]],
      properties: { distance: 1500, duration: 300 }
    };
    
    const mockTrip = {
      id: 1,
      name: 'Trip 1',
      stops: [],
      vehicle_specs: { height: 4.0 },
      route_geojson: routeGeoJSON
    };
    (axios.get as unknown as jest.Mock).mockResolvedValue({ data: mockTrip });

    await useTripStore.getState().loadTrip(1);
    
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/trips/1', {
      headers: { Authorization: 'Bearer mock-token' }
    });
    expect(useTripStore.getState().vehicleSpecs.height).toBe(4.0);
    expect(useTripStore.getState().routeGeoJSON).toEqual(routeGeoJSON);
    expect(useTripStore.getState().routeDistance).toBe(1500);
    expect(useTripStore.getState().routeDuration).toBe(300);
  });
});
