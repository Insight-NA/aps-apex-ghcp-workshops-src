/**
 * useTrips Custom Hook
 *
 * Consolidates all trip-fetching logic into one reusable hook.
 * Supports both authenticated (my trips) and public (community/featured) trip fetching.
 * Follows the useOnlineStatus pattern: named interface, JSDoc, cleanup via AbortController.
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axios';
import type { TripCard } from '../types/Trip copy';

export interface TripsOptions {
  /** When true, returns only featured public trips. Only applies when requireAuth is false. */
  featured_only?: boolean;
  /** Maximum number of trips to return. Only applies when requireAuth is false. */
  limit?: number;
  /** When true, fetches the authenticated user's trips (/api/trips).
   *  When false or omitted, fetches public trips (/api/public-trips). */
  requireAuth?: boolean;
}

export interface TripsResult {
  trips: TripCard[];
  isLoading: boolean;
  error: string | null;
  /** Manually trigger a re-fetch outside of the automatic options-change cycle. */
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage trip data
 *
 * @param options - Configuration for which trips to fetch and how to filter them
 * @param options.featured_only - Return only featured public trips (public endpoint only)
 * @param options.limit - Cap the number of returned trips (public endpoint only)
 * @param options.requireAuth - Fetch the current user's saved trips instead of public trips
 * @returns {TripsResult} Trips array, loading/error state, and an imperative refetch function
 *
 * @example
 * // Fetch featured trips for the Explore page (ExploreView replacement)
 * const { trips, isLoading } = useTrips({ featured_only: true, limit: 5 });
 *
 * @example
 * // Fetch all public community trips (AllTripsView replacement)
 * const { trips, isLoading, error, refetch } = useTrips({ featured_only: false });
 *
 * @example
 * // Fetch authenticated user's saved trips (TripsView replacement)
 * const { trips, isLoading, error, refetch } = useTrips({ requireAuth: true });
 */
export const useTrips = (options: TripsOptions = {}): TripsResult => {
  const { featured_only, limit, requireAuth = false } = options;

  const [trips, setTrips] = useState<TripCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      let url: string;

      if (requireAuth) {
        url = '/api/trips';
      } else {
        const params = new URLSearchParams();
        if (featured_only !== undefined) {
          params.set('featured_only', String(featured_only));
        }
        if (limit !== undefined) {
          params.set('limit', String(limit));
        }
        const queryString = params.toString();
        url = `/api/public-trips${queryString ? `?${queryString}` : ''}`;
      }

      const res = await axiosInstance.get<TripCard[]>(url, { signal });
      setTrips(res.data);
    } catch (err) {
      // Ignore intentional aborts caused by cleanup or rapid option changes
      if ((err as { name?: string })?.name === 'CanceledError') {
        return;
      }
      const message = 'Failed to load trips';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [featured_only, limit, requireAuth]);

  /** Imperative refetch — does not create a new AbortController,
   *  safe to call from event handlers or after a mutation. */
  const refetch = useCallback(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTrips(controller.signal);

    // Cancel any in-flight request when options change or the component unmounts
    return () => {
      controller.abort();
    };
  }, [fetchTrips]);

  return { trips, isLoading, error, refetch };
};
