import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TripData, POICategory } from '../types';
import { POICategoryFilter } from './POICategoryFilter';

interface MapViewProps {
  tripData: TripData | null;
  selectedCategories: POICategory[];
  onCategoriesChange: (categories: POICategory[]) => void;
}

const poiIcons: Record<POICategory, string> = {
  'restaurant': '🍴',
  'hotel': '🏨',
  'attraction': '🎭',
  'gas-station': '⛽',
  'scenic-view': '🏞️',
  'park': '🌳',
  'museum': '🏛️',
  'shopping': '🛍️',
};

function createCustomIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="background: white; border: 2px solid #3b82f6; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px;">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

export function MapView({ tripData, selectedCategories, onCategoriesChange }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      const center: [number, number] = tripData 
        ? [tripData.origin.lat, tripData.origin.lng]
        : [39.8283, -98.5795];

      mapRef.current = L.map(mapContainerRef.current).setView(center, tripData ? 6 : 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !tripData) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    const startIcon = createCustomIcon('🚗');
    const endIcon = createCustomIcon('🏁');
    const stopIcon = createCustomIcon('📍');

    // Add route polyline
    const routeLine = L.polyline(tripData.route as [number, number][], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7
    }).addTo(mapRef.current);
    markersRef.current.push(routeLine);

    // Add start marker
    const startMarker = L.marker([tripData.origin.lat, tripData.origin.lng], { icon: startIcon })
      .bindPopup(`<div class="text-center"><p class="font-semibold">Start: ${tripData.origin.name}</p></div>`)
      .addTo(mapRef.current);
    markersRef.current.push(startMarker);

    // Add end marker
    const endMarker = L.marker([tripData.destination.lat, tripData.destination.lng], { icon: endIcon })
      .bindPopup(`<div class="text-center"><p class="font-semibold">End: ${tripData.destination.name}</p></div>`)
      .addTo(mapRef.current);
    markersRef.current.push(endMarker);

    // Add stop markers
    tripData.stops.forEach((stop) => {
      const marker = L.marker([stop.location.lat, stop.location.lng], { icon: stopIcon })
        .bindPopup(`<div><p class="font-semibold">${stop.location.name}</p>${stop.notes ? `<p class="text-sm text-zinc-600">${stop.notes}</p>` : ''}</div>`)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Add POI markers based on selected categories
    const filteredPOIs = tripData.pois.filter(poi => selectedCategories.includes(poi.category));
    filteredPOIs.forEach((poi) => {
      const poiIcon = createCustomIcon(poiIcons[poi.category]);
      const marker = L.marker([poi.location.lat, poi.location.lng], { icon: poiIcon })
        .bindPopup(`
          <div class="min-w-[200px]">
            <p class="font-semibold">${poi.name}</p>
            <p class="text-sm text-zinc-600 capitalize">${poi.category.replace('-', ' ')}</p>
            ${poi.rating ? `<p class="text-sm">⭐ ${poi.rating.toFixed(1)}</p>` : ''}
            ${poi.priceRange ? `<p class="text-sm">${poi.priceRange}</p>` : ''}
          </div>
        `)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Fit bounds to show the entire route
    if (tripData.route.length > 0) {
      const bounds = L.latLngBounds(tripData.route as [number, number][]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tripData, selectedCategories]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div className="absolute top-4 right-4 z-[1000]">
        <POICategoryFilter
          selectedCategories={selectedCategories}
          onCategoriesChange={onCategoriesChange}
        />
      </div>
    </div>
  );
}
