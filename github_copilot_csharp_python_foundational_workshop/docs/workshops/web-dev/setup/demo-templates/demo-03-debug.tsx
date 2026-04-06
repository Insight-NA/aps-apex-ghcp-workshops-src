/**
 * Workshop Demo 3: Buggy MapMarkers Component
 *
 * This file intentionally contains a coordinate format bug.
 * Students will use Copilot Chat to identify and fix the issue.
 *
 * BUG: Coordinates are in [latitude, longitude] format,
 * but Mapbox/GeoJSON requires [longitude, latitude].
 */
import { Marker } from 'react-map-gl';

const stops = [
  { name: 'San Francisco', coordinates: [37.7749, -122.4194] },  // BUG: [lat, lng]
  { name: 'Los Angeles', coordinates: [34.0522, -118.2437] },    // BUG: [lat, lng]
];

export function MapMarkers() {
  return (
    <>
      {stops.map((stop, index) => (
        <Marker
          key={index}
          longitude={stop.coordinates[0]}
          latitude={stop.coordinates[1]}
        >
          <div className="flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold shadow-lg">
            {index + 1}
          </div>
          <span className="text-sm font-medium text-gray-700">{stop.name}</span>
        </Marker>
      ))}
    </>
  );
}
