import { create } from 'zustand';
import { Route, Leg } from '../types/Route';
import { Stop } from '../types/Stop';
import { POI } from '../types/POI';
import { Vehicle } from '../types/Vehicle';
import api from '../services/api';
import { Trip } from '../types/Trip';

export interface TripState {
    vehicleSpecs: Vehicle;
    stops: Stop[];
    pois: POI[];
    routeGeoJSON: GeoJSON.Feature | null;
    routeDistance: number; // meters
    routeDuration: number; // seconds
    routeLegs: Leg[];

    setVehicleSpecs: (specs: Partial<Vehicle>) => void;
    addStop: (stop: Stop) => void;
    removeStop: (id: string) => void;
    updateStopName: (id: string, name: string) => void;
    setStops: (stops: Stop[]) => void;
    reorderStops: (startIndex: number, endIndex: number) => void;
    setRouteData: (geoJSON: GeoJSON.Feature, distance: number, duration: number, legs: Leg[]) => void;
    setPOIs: (pois: POI[]) => void;
    saveTrip: (name: string) => Promise<void>;
    loadTrips: () => Promise<Trip[]>;
    loadTrip: (id: string) => Promise<void>;
    resetTrip: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
    vehicleSpecs: {
        type: 'rv',
        height: 3.5, // meters
        weight: 10, // tons
        width: 2.5,
        length: 12,
    },
    stops: [],
    pois: [],
    routeGeoJSON: null,
    routeDistance: 0,
    routeDuration: 0,
    routeLegs: [],

    resetTrip: () => set({ stops: [], routeGeoJSON: null, routeDistance: 0, routeDuration: 0, routeLegs: [] }),

    setVehicleSpecs: (specs) =>
        set((state) => ({ vehicleSpecs: { ...state.vehicleSpecs, ...specs } })),

    addStop: (stop) =>
        set((state) => ({ stops: [...state.stops, stop] })),

    removeStop: (id) =>
        set((state) => ({ stops: state.stops.filter((s) => s.id !== id) })),

    updateStopName: (id, name) =>
        set((state) => ({
            stops: state.stops.map((stop) =>
                stop.id === id ? { ...stop, name } : stop
            )
        })),

    setStops: (stops) => set({ stops }),

    reorderStops: (startIndex, endIndex) =>
        set((state) => {
            const newStops = Array.from(state.stops);
            const [removed] = newStops.splice(startIndex, 1);
            newStops.splice(endIndex, 0, removed);
            return { stops: newStops };
        }),

    setRouteData: (geoJSON, distance, duration, legs) =>
        set({ routeGeoJSON: geoJSON, routeDistance: distance, routeDuration: duration, routeLegs: legs }),

    setPOIs: (pois) => set({ pois }),

    saveTrip: async (name) => {
        const state = get();
        const tripData = {
            name,
            stops: state.stops,
            vehicle_specs: state.vehicleSpecs,
            route_geojson: state.routeGeoJSON
        };
        try {
            await api.post('/api/trips', tripData);
        } catch (error) {
            console.error('Failed to save trip', error);
            throw error;
        }
    },

    loadTrips: async () => {
        try {
            const res = await api.get('/api/trips');
            return res.data;
        } catch (error) {
            console.error('Failed to load trips', error);
            throw error;
        }
    },

    loadTrip: async (id) => {
        try {
            const res = await api.get(`/api/trips/${id}`);
            set({
                stops: res.data.stops,
                vehicleSpecs: res.data.vehicle_specs,
                routeGeoJSON: res.data.route_geojson || null,
                routeDistance: res.data.route_geojson?.properties?.distance || 0,
                routeDuration: res.data.route_geojson?.properties?.duration || 0,
                routeLegs: []
            });
        } catch (error) {
            console.error('Failed to load trip', error);
            throw error;
        }
    }
}));
