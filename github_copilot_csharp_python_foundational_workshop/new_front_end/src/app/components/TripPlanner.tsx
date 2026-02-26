import { useState } from 'react';
import { MapView } from './MapView';
import { AIChatPanel } from './AIChatPanel';
import { TripDetailsPanel } from './TripDetailsPanel';
import { POICategory, TripData } from '../types';

export function TripPlanner() {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<POICategory[]>([
    'restaurant',
    'hotel',
    'attraction',
    'gas-station'
  ]);

  return (
    <div className="flex h-full">
      {/* AI Chat Panel */}
      <AIChatPanel onTripCreated={setTripData} />
      
      {/* Map View */}
      <div className="flex-1 relative">
        <MapView 
          tripData={tripData} 
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
        />
      </div>
      
      {/* Trip Details Panel */}
      {tripData && (
        <TripDetailsPanel 
          tripData={tripData} 
          onTripUpdate={setTripData}
        />
      )}
    </div>
  );
}