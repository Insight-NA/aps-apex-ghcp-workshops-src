/**
 * Sync Manager
 * 
 * Manages the synchronization of pending operations with the backend server.
 * Handles retry logic, conflict resolution, and error recovery.
 */

import axiosInstance from './axios';
import {
  PendingOperation,
  getPendingOperations,
  deletePendingOperation,
  updatePendingOperation,
  updateSyncState,
  saveTripLocally,
  deleteTripLocally
} from './offlineStorage';
import { Trip } from '../types/Trip';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

/**
 * Process a single pending operation
 */
const processPendingOperation = async (operation: PendingOperation): Promise<boolean> => {
  try {
    switch (operation.type) {
      case 'CREATE':
        await axiosInstance.post('/api/trips', operation.data);
        break;
      
      case 'UPDATE':
        await axiosInstance.put(`/api/trips/${(operation.data as Trip).id}`, operation.data);
        break;
      
      case 'DELETE':
        await axiosInstance.delete(`/api/trips/${(operation.data as { id: number }).id}`);
        break;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to process ${operation.type} operation:`, error);
    return false;
  }
};

/**
 * Sync all pending operations with the backend
 * Returns the number of operations successfully synced
 */
export const syncPendingOperations = async (): Promise<number> => {
  const pendingOps = await getPendingOperations();
  
  if (pendingOps.length === 0) {
    return 0;
  }

  // Sort by timestamp to process in chronological order
  pendingOps.sort((a, b) => a.timestamp - b.timestamp);

  let successCount = 0;

  for (const operation of pendingOps) {
    const success = await processPendingOperation(operation);

    if (success) {
      // Remove from pending queue
      await deletePendingOperation(operation.id);
      successCount++;
    } else {
      // Increment retry count
      operation.retryCount += 1;
      operation.lastError = new Date().toISOString();

      if (operation.retryCount >= MAX_RETRIES) {
        // Max retries reached - log and remove
        console.error(`Operation ${operation.id} failed after ${MAX_RETRIES} retries. Removing from queue.`);
        await deletePendingOperation(operation.id);
      } else {
        // Update with new retry count
        await updatePendingOperation(operation);
        
        // Exponential backoff
        const delay = RETRY_DELAY_MS * Math.pow(2, operation.retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Update last sync timestamp
  if (successCount > 0) {
    await updateSyncState({ lastSyncTimestamp: Date.now() });
  }

  return successCount;
};

/**
 * Sync trips from backend to local storage
 * This resolves conflicts by using server data as source of truth (last-write-wins)
 */
export const syncTripsFromBackend = async (): Promise<Trip[]> => {
  try {
    const response = await axiosInstance.get('/api/trips');
    const serverTrips: Trip[] = response.data;

    // Update local storage with server data
    for (const trip of serverTrips) {
      await saveTripLocally(trip);
    }

    await updateSyncState({ lastSyncTimestamp: Date.now() });

    return serverTrips;
  } catch (error) {
    console.error('Failed to sync trips from backend:', error);
    throw error;
  }
};

/**
 * Full bidirectional sync
 * 1. Push pending operations to server
 * 2. Pull latest trips from server
 */
export const performFullSync = async (): Promise<{ pushedOps: number; trips: Trip[] }> => {
  // First, push pending changes
  const pushedOps = await syncPendingOperations();

  // Then, pull latest data
  const trips = await syncTripsFromBackend();

  return { pushedOps, trips };
};

/**
 * Check if there are any pending operations
 */
export const hasPendingOperations = async (): Promise<boolean> => {
  const ops = await getPendingOperations();
  return ops.length > 0;
};

/**
 * Get count of pending operations
 */
export const getPendingOperationsCount = async (): Promise<number> => {
  const ops = await getPendingOperations();
  return ops.length;
};
