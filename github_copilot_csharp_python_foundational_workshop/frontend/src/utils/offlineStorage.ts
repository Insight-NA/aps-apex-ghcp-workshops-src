/**
 * Offline Storage Utilities
 * 
 * Uses IndexedDB to persist trip data and pending operations for offline support.
 * Follows project conventions: TypeScript strict mode, no `any` types.
 */

import { Trip } from '../types/Trip';

// Database configuration
const DB_NAME = 'roadTripPlannerDB';
const DB_VERSION = 1;
const STORES = {
  TRIPS: 'trips',
  PENDING_OPS: 'pendingOperations',
  SYNC_STATE: 'syncState'
};

export interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: number;
  data: Trip | { id: number }; // Trip for CREATE/UPDATE, {id} for DELETE
  retryCount: number;
  lastError?: string;
}

export interface SyncState {
  key: string;
  lastSyncTimestamp: number;
  isOnline: boolean;
}

/**
 * Initialize IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.TRIPS)) {
        db.createObjectStore(STORES.TRIPS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_OPS)) {
        db.createObjectStore(STORES.PENDING_OPS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_STATE)) {
        db.createObjectStore(STORES.SYNC_STATE, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Generic IndexedDB operation wrapper
 */
const dbOperation = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ===== Trip Storage Operations =====

export const saveTripLocally = async (trip: Trip): Promise<void> => {
  await dbOperation(STORES.TRIPS, 'readwrite', (store) => store.put(trip));
};

export const getTripLocally = async (id: number): Promise<Trip | undefined> => {
  return await dbOperation(STORES.TRIPS, 'readonly', (store) => store.get(id));
};

export const getAllTripsLocally = async (): Promise<Trip[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TRIPS, 'readonly');
    const store = transaction.objectStore(STORES.TRIPS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as Trip[]);
    request.onerror = () => reject(request.error);
  });
};

export const deleteTripLocally = async (id: number): Promise<void> => {
  await dbOperation(STORES.TRIPS, 'readwrite', (store) => store.delete(id));
};

export const clearAllTripsLocally = async (): Promise<void> => {
  await dbOperation(STORES.TRIPS, 'readwrite', (store) => store.clear());
};

// ===== Pending Operations Queue =====

export const addPendingOperation = async (operation: PendingOperation): Promise<void> => {
  await dbOperation(STORES.PENDING_OPS, 'readwrite', (store) => store.put(operation));
};

export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PENDING_OPS, 'readonly');
    const store = transaction.objectStore(STORES.PENDING_OPS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as PendingOperation[]);
    request.onerror = () => reject(request.error);
  });
};

export const deletePendingOperation = async (id: string): Promise<void> => {
  await dbOperation(STORES.PENDING_OPS, 'readwrite', (store) => store.delete(id));
};

export const updatePendingOperation = async (operation: PendingOperation): Promise<void> => {
  await dbOperation(STORES.PENDING_OPS, 'readwrite', (store) => store.put(operation));
};

export const clearPendingOperations = async (): Promise<void> => {
  await dbOperation(STORES.PENDING_OPS, 'readwrite', (store) => store.clear());
};

// ===== Sync State Management =====

export const getSyncState = async (): Promise<SyncState | undefined> => {
  return await dbOperation(STORES.SYNC_STATE, 'readonly', (store) => store.get('main'));
};

export const updateSyncState = async (state: Partial<SyncState>): Promise<void> => {
  const current = await getSyncState();
  const newState: SyncState = {
    key: 'main',
    lastSyncTimestamp: current?.lastSyncTimestamp || 0,
    isOnline: current?.isOnline ?? true,
    ...state
  };
  
  await dbOperation(STORES.SYNC_STATE, 'readwrite', (store) => store.put(newState));
};

/**
 * Generate unique ID for pending operations
 */
export const generateOperationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
