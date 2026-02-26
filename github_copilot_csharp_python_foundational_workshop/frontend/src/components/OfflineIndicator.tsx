/**
 * OfflineIndicator Component
 * 
 * Displays connection status and pending sync operations.
 * Shows different states: online, offline, syncing, and "back online" notifications.
 */

import React, { useEffect } from 'react';
import { useTripStore } from '../store/useTripStore';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline: storeOnline, pendingOperationsCount, isSyncing, lastSyncTimestamp, setOnlineStatus, syncWithBackend } = useTripStore();
  const { isOnline, wasOffline } = useOnlineStatus();

  // Sync online status with store
  useEffect(() => {
    if (isOnline !== storeOnline) {
      setOnlineStatus(isOnline);
    }
  }, [isOnline, storeOnline, setOnlineStatus]);

  // Don't show indicator if online and no pending operations
  if (isOnline && !wasOffline && pendingOperationsCount === 0 && !isSyncing) {
    return null;
  }

  // Format last sync time
  const getLastSyncText = () => {
    if (!lastSyncTimestamp) return 'Never synced';
    
    const now = Date.now();
    const diffMinutes = Math.floor((now - lastSyncTimestamp) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Back online notification */}
      {isOnline && wasOffline && (
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2 flex items-center space-x-3 animate-slide-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Back Online</p>
            {pendingOperationsCount > 0 && (
              <p className="text-sm">Syncing {pendingOperationsCount} change{pendingOperationsCount > 1 ? 's' : ''}...</p>
            )}
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">You're Offline</p>
            <p className="text-sm">Changes will sync when connection is restored</p>
            {pendingOperationsCount > 0 && (
              <p className="text-xs mt-1 opacity-90">
                {pendingOperationsCount} pending change{pendingOperationsCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Syncing indicator */}
      {isOnline && isSyncing && (
        <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Syncing...</p>
            {pendingOperationsCount > 0 && (
              <p className="text-sm">{pendingOperationsCount} operation{pendingOperationsCount > 1 ? 's' : ''} remaining</p>
            )}
          </div>
        </div>
      )}

      {/* Pending operations indicator (online but not syncing) */}
      {isOnline && !isSyncing && pendingOperationsCount > 0 && (
        <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Pending Changes</p>
            <p className="text-sm">{pendingOperationsCount} change{pendingOperationsCount > 1 ? 's' : ''} waiting to sync</p>
          </div>
          <button
            onClick={() => syncWithBackend()}
            className="bg-white text-yellow-600 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-50 transition-colors"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Last sync info (only show if recently synced and no other indicators) */}
      {isOnline && !wasOffline && pendingOperationsCount === 0 && !isSyncing && lastSyncTimestamp > 0 && (
        <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Last synced {getLastSyncText()}</span>
        </div>
      )}
    </div>
  );
};
