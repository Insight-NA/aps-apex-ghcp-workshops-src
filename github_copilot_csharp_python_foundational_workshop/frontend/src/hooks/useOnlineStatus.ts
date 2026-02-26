/**
 * Online/Offline Status Hook
 * 
 * Monitors network connectivity using navigator.onLine API and network events.
 * Follows React hooks best practices with proper cleanup.
 */

import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean; // Track if we were offline (useful for showing "back online" messages)
}

/**
 * Custom hook to detect and monitor online/offline status
 * 
 * @returns {OnlineStatus} Current online status and history
 * 
 * @example
 * const { isOnline, wasOffline } = useOnlineStatus();
 * 
 * if (!isOnline) {
 *   return <div>You are offline. Changes will sync when connection is restored.</div>;
 * }
 */
export const useOnlineStatus = (): OnlineStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Initialize with current status
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Handler for when connection is restored
    const handleOnline = () => {
      setIsOnline(true);
      // Don't clear wasOffline immediately - let components handle it
      setTimeout(() => setWasOffline(false), 3000); // Clear after 3 seconds
    };

    // Handler for when connection is lost
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Additional check using fetch (more reliable than navigator.onLine)
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource from the backend
        const response = await fetch('/health', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok && !isOnline) {
          handleOnline();
        }
      } catch (error) {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Check connectivity every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return { isOnline, wasOffline };
};

/**
 * Simple version that only tracks current status (no history)
 */
export const useIsOnline = (): boolean => {
  const { isOnline } = useOnlineStatus();
  return isOnline;
};
