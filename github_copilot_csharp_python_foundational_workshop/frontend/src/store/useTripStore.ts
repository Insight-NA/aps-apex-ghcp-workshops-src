import { create } from 'zustand';
import { Route, Leg } from '../types/Route';
import { Stop } from '../types/Stop';
import { POI } from '../types/POI';
import { Vehicle } from '../types/Vehicle';
import type { Trip } from '../types/Trip';
import axiosInstance from '../utils/axios';
import {
  saveTripLocally,
  getAllTripsLocally,
  getTripLocally,
  deleteTripLocally,
  addPendingOperation,
  generateOperationId,
  updateSyncState,
  getSyncState,
  PendingOperation
} from '../utils/offlineStorage';
import {
  performFullSync,
  getPendingOperationsCount
} from '../utils/syncManager';

export interface TripState {
  vehicleSpecs: Vehicle;
  stops: Stop[];
  pois: POI[];
  routeGeoJSON: GeoJSON.Feature | null;
  routeDistance: number; // meters
  routeDuration: number; // seconds
  routeLegs: Leg[];
  
  // Offline mode state
  isOnline: boolean;
  pendingOperationsCount: number;
  lastSyncTimestamp: number;
  isSyncing: boolean;

  setVehicleSpecs: (specs: Partial<Vehicle>) => void;
  addStop: (stop: Stop) => void;
  removeStop: (id: string) => void;
  setStops: (stops: Stop[]) => void;
  reorderStops: (startIndex: number, endIndex: number) => void;
  setRouteData: (geoJSON: GeoJSON.Feature, distance: number, duration: number, legs: Leg[]) => void;
  setPOIs: (pois: POI[]) => void;
  saveTrip: (name: string) => Promise<void>;
  loadTrips: () => Promise<Trip[]>;
  loadTrip: (id: number) => Promise<void>;
  deleteTrip: (id: number) => Promise<void>;
  
  // Offline mode actions
  setOnlineStatus: (isOnline: boolean) => void;
  syncWithBackend: () => Promise<void>;
  updatePendingCount: () => Promise<void>;
  initializeOfflineMode: () => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  vehicleSpecs: {
    height: 3.5, // meters
    weight: 10, // tons
    width: 2.5,
    length: 12,
    fuelType: 'diesel',
    range: 500, // miles
    mpg: 10,
  },
  stops: [],
  pois: [],
  routeGeoJSON: null,
  routeDistance: 0,
  routeDuration: 0,
  routeLegs: [],
  
  // Offline mode initial state
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingOperationsCount: 0,
  lastSyncTimestamp: 0,
  isSyncing: false,

  setVehicleSpecs: (specs) =>
    set((state) => ({ vehicleSpecs: { ...state.vehicleSpecs, ...specs } })),

  addStop: (stop) =>
    set((state) => ({ stops: [...state.stops, stop] })),

  removeStop: (id) =>
    set((state) => ({ stops: state.stops.filter((s) => s.id !== id) })),

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
    const tripData: Trip = {
      id: Date.now(), // Temporary ID for offline mode
      name,
      stops: state.stops,
      vehicle_specs: state.vehicleSpecs,
      routeGeoJSON: state.routeGeoJSON || undefined,
    };
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in to save trips.');
      }
      
      // Save locally first (optimistic update)
      await saveTripLocally(tripData);
      
      if (state.isOnline) {
        // Try to save to backend
        try {
          const response = await axiosInstance.post('/api/trips', {
            name: tripData.name,
            stops: tripData.stops,
            vehicle_specs: tripData.vehicle_specs,
            route_geojson: tripData.routeGeoJSON
          });
          
          // Update local copy with server ID
          if (response.data?.id) {
            tripData.id = response.data.id;
            await saveTripLocally(tripData);
          }
        } catch (error: any) {
          if (error?.response?.status === 401) {
            console.error('Authentication failed: Token expired or invalid. Please log in again.');
            localStorage.removeItem('token');
            throw new Error('Session expired. Please log in again.');
          }
          
          // If offline or network error, queue for later
          console.warn('Failed to save to backend, queueing for sync:', error);
          await addPendingOperation({
            id: generateOperationId(),
            type: 'CREATE',
            timestamp: Date.now(),
            data: tripData,
            retryCount: 0
          });
          await get().updatePendingCount();
        }
      } else {
        // Offline mode - add to pending operations
        await addPendingOperation({
          id: generateOperationId(),
          type: 'CREATE',
          timestamp: Date.now(),
          data: tripData,
          retryCount: 0
        });
        await get().updatePendingCount();
      }
    } catch (error) {
      console.error('Failed to save trip', error);
      throw error;
    }
  },

  loadTrips: async () => {
    const state = get();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found. Please log in to load trips.');
        // Return locally cached trips if offline
        return await getAllTripsLocally();
      }
      
      if (state.isOnline) {
        try {
          const res = await axiosInstance.get('/api/trips');
          const trips: Trip[] = res.data;
          
          // Update local cache
          for (const trip of trips) {
            await saveTripLocally(trip);
          }
          
          return trips;
        } catch (error: any) {
          if (error?.response?.status === 401) {
            console.error('Authentication failed: Token expired or invalid. Please log in again.');
            localStorage.removeItem('token');
            throw error;
          }
          
          // Network error - fall back to local cache
          console.warn('Failed to load from backend, using local cache:', error);
          return await getAllTripsLocally();
        }
      } else {
        // Offline mode - return local cache
        return await getAllTripsLocally();
      }
    } catch (error) {
      console.error('Failed to load trips', error);
      // Last resort - return local cache
      return await getAllTripsLocally();
    }
  },

  loadTrip: async (id) => {
    const state = get();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in to load trips.');
      }
      
      if (state.isOnline) {
        try {
          const res = await axiosInstance.get(`/api/trips/${id}`);
          const trip: Trip = res.data;
          
          // Update local cache
          await saveTripLocally(trip);
          
          set({
            stops: trip.stops,
            vehicleSpecs: trip.vehicle_specs,
            routeGeoJSON: trip.routeGeoJSON || null,
            routeDistance: trip.routeGeoJSON?.properties?.distance || 0,
            routeDuration: trip.routeGeoJSON?.properties?.duration || 0,
            routeLegs: []
          });
        } catch (error: any) {
          if (error?.response?.status === 401) {
            console.error('Authentication failed: Token expired or invalid. Please log in again.');
            localStorage.removeItem('token');
            throw new Error('Session expired. Please log in again.');
          }
          
          // Network error - fall back to local cache
          console.warn('Failed to load from backend, using local cache:', error);
          const localTrip = await getTripLocally(id);
          if (!localTrip) {
            throw new Error('Trip not found in local cache');
          }
          
          set({
            stops: localTrip.stops,
            vehicleSpecs: localTrip.vehicle_specs,
            routeGeoJSON: localTrip.routeGeoJSON || null,
            routeDistance: localTrip.routeGeoJSON?.properties?.distance || 0,
            routeDuration: localTrip.routeGeoJSON?.properties?.duration || 0,
            routeLegs: []
          });
        }
      } else {
        // Offline mode - load from local cache
        const localTrip = await getTripLocally(id);
        if (!localTrip) {
          throw new Error('Trip not found in local cache');
        }
        
        set({
          stops: localTrip.stops,
          vehicleSpecs: localTrip.vehicle_specs,
          routeGeoJSON: localTrip.routeGeoJSON || null,
          routeDistance: localTrip.routeGeoJSON?.properties?.distance || 0,
          routeDuration: localTrip.routeGeoJSON?.properties?.duration || 0,
          routeLegs: []
        });
      }
    } catch (error) {
      console.error('Failed to load trip', error);
      throw error;
    }
  },
  
  deleteTrip: async (id) => {
    const state = get();
    
    try {
      // Delete locally first
      await deleteTripLocally(id);
      
      if (state.isOnline) {
        try {
          await axiosInstance.delete(`/api/trips/${id}`);
        } catch (error) {
          // Queue for sync if deletion fails
          console.warn('Failed to delete on backend, queueing for sync:', error);
          await addPendingOperation({
            id: generateOperationId(),
            type: 'DELETE',
            timestamp: Date.now(),
            data: { id },
            retryCount: 0
          });
          await get().updatePendingCount();
        }
      } else {
        // Offline mode - add to pending operations
        await addPendingOperation({
          id: generateOperationId(),
          type: 'DELETE',
          timestamp: Date.now(),
          data: { id },
          retryCount: 0
        });
        await get().updatePendingCount();
      }
    } catch (error) {
      console.error('Failed to delete trip', error);
      throw error;
    }
  },
  
  // Offline mode actions
  setOnlineStatus: (isOnline) => {
    set({ isOnline });
    updateSyncState({ isOnline });
    
    // Trigger sync when coming back online
    if (isOnline) {
      get().syncWithBackend();
    }
  },
  
  syncWithBackend: async () => {
    const state = get();
    
    if (!state.isOnline || state.isSyncing) {
      return;
    }
    
    set({ isSyncing: true });
    
    try {
      const result = await performFullSync();
      
      set({
        lastSyncTimestamp: Date.now(),
        pendingOperationsCount: 0,
        isSyncing: false
      });
      
      console.log(`Sync completed: ${result.pushedOps} operations synced, ${result.trips.length} trips loaded`);
    } catch (error) {
      console.error('Sync failed:', error);
      set({ isSyncing: false });
    }
  },
  
  updatePendingCount: async () => {
    const count = await getPendingOperationsCount();
    set({ pendingOperationsCount: count });
  },
  
  initializeOfflineMode: async () => {
    // Load sync state from IndexedDB
    const syncState = await getSyncState();
    
    if (syncState) {
      set({
        lastSyncTimestamp: syncState.lastSyncTimestamp,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
      });
    }
    
    // Update pending operations count
    await get().updatePendingCount();
    
    // Sync if online
    if (get().isOnline) {
      get().syncWithBackend();
    }
  }
}));
