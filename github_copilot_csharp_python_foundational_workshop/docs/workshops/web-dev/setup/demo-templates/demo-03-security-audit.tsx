/**
 * SECURITY AUDIT EXERCISE — Workshop 1, Demo 3
 *
 * This file contains 3 security vulnerabilities intentionally embedded for training.
 * Use Copilot Chat with `/fix` to identify and correct each one.
 *
 * HINT: The security checklist in the workshop has all the categories you need.
 */

import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------
// 🔴 ISSUE #1: Hardcoded secret token
//    This value will end up in the compiled JavaScript bundle and
//    is visible to anyone who opens DevTools → Sources.
//    Fix: use import.meta.env.VITE_MAPBOX_TOKEN instead.
// ----------------------------------------------------------------
const MAPBOX_TOKEN = 'sk.eyJ1IjoicmVhbC11c2VyIiwiYSI6ImNsZXhhbXBsZTEyMyJ9.supersecret_do_not_commit';

interface Trip {
  id: string;
  title: string;
  description: string; // may contain user-supplied HTML
  coordinates: [number, number][];
}

interface DirectionsResult {
  distance: number;
  duration: number;
  geometry: object;
}

// ----------------------------------------------------------------
// 🔴 ISSUE #2: Direct call to the Mapbox API from the frontend
//    Exposes the token in network requests visible in DevTools.
//    Bypasses the backend proxy (/api/directions) that keeps
//    all third-party tokens server-side.
//    Fix: POST to axiosInstance('/api/directions', { coordinates })
// ----------------------------------------------------------------
async function fetchDirections(coordinates: [number, number][]): Promise<DirectionsResult> {
  const coordString = coordinates.map(c => c.join(',')).join(';');
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?access_token=${MAPBOX_TOKEN}&geometries=geojson`
  );
  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.status}`);
  }
  const data = await response.json();
  return {
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
    geometry: data.routes[0].geometry,
  };
}

interface TripSummaryCardProps {
  trip: Trip;
}

const TripSummaryCard: React.FC<TripSummaryCardProps> = ({ trip }) => {
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trip.coordinates.length < 2) return;
    setLoading(true);
    fetchDirections(trip.coordinates)
      .then(result => {
        setDirections(result);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [trip.coordinates]);

  const formatDistance = (meters: number) =>
    `${(meters / 1000).toFixed(1)} km`;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{trip.title}</h2>

      {/* ----------------------------------------------------------------
          🔴 ISSUE #3: XSS vulnerability via dangerouslySetInnerHTML
             If trip.description contains <script>...</script> or
             <img onerror="..."> the browser will execute it.
             Fix: render as plain text — <p>{trip.description}</p>
          ---------------------------------------------------------------- */}
      <div
        className="text-sm text-gray-500 mb-4"
        dangerouslySetInnerHTML={{ __html: trip.description }}
      />

      {loading && (
        <p className="text-sm text-blue-500 animate-pulse">Loading route info…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">Error: {error}</p>
      )}

      {directions && (
        <div className="flex gap-6 text-sm text-gray-700">
          <div>
            <span className="font-medium">Distance</span>
            <p>{formatDistance(directions.distance)}</p>
          </div>
          <div>
            <span className="font-medium">Duration</span>
            <p>{formatDuration(directions.duration)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripSummaryCard;
