/**
 * Demo 5 — Debugging with Copilot Chat
 *
 * INSTRUCTIONS:
 * 1. Open this file in VS Code alongside MapComponent.tsx.
 * 2. This component has a BUG: markers appear in the ocean.
 * 3. Use Copilot Chat (Cmd+I / Ctrl+I) with the CORE framework to debug.
 * 4. Fix the bug and verify with the expected coordinates.
 *
 * COPILOT CHAT PROMPT (paste this into Chat):
 *
 *   Context: I'm working on a MapComponent in a React road trip planner
 *   that uses react-map-gl (Mapbox). Markers render with longitude and latitude.
 *
 *   Objective: Debug why markers for San Francisco and Los Angeles appear
 *   in the middle of the ocean instead of California.
 *
 *   Requirements: Explain the root cause and fix the coordinate data.
 *
 *   Examples: The Marker component uses coordinates[0] for longitude
 *   and coordinates[1] for latitude.
 */

import React from 'react';

// 🐛 BUG: These coordinates are in [latitude, longitude] order.
//    Mapbox expects [longitude, latitude] (GeoJSON standard).
//    This causes markers to render in the wrong location.
const testStops = [
  {
    id: '1',
    name: 'San Francisco',
    coordinates: [37.7749, -122.4194] as [number, number], // [lat, lng] ❌
    type: 'start' as const,
  },
  {
    id: '2',
    name: 'Los Angeles',
    coordinates: [34.0522, -118.2437] as [number, number], // [lat, lng] ❌
    type: 'stop' as const,
  },
  {
    id: '3',
    name: 'Las Vegas',
    coordinates: [36.1699, -115.1398] as [number, number], // [lat, lng] ❌
    type: 'end' as const,
  },
];

// EXPECTED FIX — After debugging with Copilot:
//
// const testStops = [
//   { id: '1', name: 'San Francisco', coordinates: [-122.4194, 37.7749], type: 'start' },  // [lng, lat] ✅
//   { id: '2', name: 'Los Angeles',   coordinates: [-118.2437, 34.0522], type: 'stop' },   // [lng, lat] ✅
//   { id: '3', name: 'Las Vegas',     coordinates: [-115.1398, 36.1699], type: 'end' },    // [lng, lat] ✅
// ];

// Simple component to test the stops on a map
const DebugMapDemo: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug: Marker Positions</h1>
      <div className="space-y-2">
        {testStops.map((stop) => (
          <div key={stop.id} className="flex items-center gap-4 p-2 border rounded">
            <span className="font-medium w-32">{stop.name}</span>
            <span className="text-sm text-gray-500">
              lng: {stop.coordinates[0]}, lat: {stop.coordinates[1]}
            </span>
            <span className="text-xs text-red-500">
              {Math.abs(stop.coordinates[0]) < 90 && Math.abs(stop.coordinates[1]) > 90
                ? '⚠️ Coordinate order looks wrong!'
                : '✅ OK'}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-400">
        Hint: longitude values for US West Coast should be between -125 and -114.
        Latitude values should be between 32 and 42.
      </p>
    </div>
  );
};

export default DebugMapDemo;
