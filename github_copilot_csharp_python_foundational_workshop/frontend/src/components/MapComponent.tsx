import React, { useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useTripStore } from '../store/useTripStore';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapComponent: React.FC = () => {
  const { stops, routeGeoJSON, pois } = useTripStore();
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Auto-fit bounds when stops or route change
  useEffect(() => {
    if (!mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasPoints = false;

    // If we have a route, fit to the route
    if (routeGeoJSON && routeGeoJSON.coordinates) {
      routeGeoJSON.coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
        hasPoints = true;
      });
    } 
    // Otherwise fit to stops
    else if (stops.length > 0) {
      stops.forEach(stop => {
        bounds.extend(stop.coordinates);
        hasPoints = true;
      });
    }

    if (hasPoints) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }, [stops, routeGeoJSON]);

  // Initial Viewport (US Center)
  const initialViewState = {
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 3.5
  };

  const routeLayerStyle = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#3b82f6', // Blue-500
      'line-width': 5,
      'line-opacity': 0.75
    }
  };

  return (
    <div className="h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        projection="mercator"
      >
        <NavigationControl position="top-right" />

        {/* Render Route Line */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Render Stops */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            longitude={stop.coordinates[0]}
            latitude={stop.coordinates[1]}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1">
                {index + 1}. {stop.name}
              </div>
              <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white
                ${stop.type === 'start' ? 'bg-green-500' : stop.type === 'end' ? 'bg-red-500' : 'bg-blue-500'}`}
              >
                {index + 1}
              </div>
            </div>
          </Marker>
        ))}

        {/* Render POIs */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            longitude={poi.coordinates[0]}
            latitude={poi.coordinates[1]}
            anchor="bottom"
          >
            <div className="group relative flex flex-col items-center cursor-pointer">
              {/* Tooltip on hover */}
              <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap z-50 pointer-events-none">
                <p className="font-bold">{poi.name}</p>
                <p className="text-[10px] text-gray-500">{poi.category}</p>
              </div>
              
              {/* Icon */}
              <div className="w-6 h-6 rounded-full bg-white border-2 border-orange-500 shadow-md flex items-center justify-center text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default MapComponent;
