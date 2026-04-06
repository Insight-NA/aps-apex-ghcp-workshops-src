import { Vehicle } from './Vehicle';

/**
 * TripCard Interface
 * Used for displaying trip summary cards across all views (Explore, My Trips, etc.)
 */


export interface TripCard {
    id: number;
    title: string;
    description: string | null;
    startLocation: string;
    endLocation: string;
    startDate: string; // ISO 8601 format
    endDate: string; // ISO 8601 format
    distance: number; // in kilometers
    duration: number; // in hours
    vehicle: Vehicle | null;
    imageUrl: string | null;
    isPublic: boolean;
    authorName: string;
    stopCount: number;
    createdAt: string; // ISO 8601 format
}