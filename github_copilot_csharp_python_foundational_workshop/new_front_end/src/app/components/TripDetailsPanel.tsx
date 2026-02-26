import { useState } from 'react';
import { TripData, CarType } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import {
  Save,
  Share2,
  Car,
  DollarSign,
  MapPin,
  Hotel,
  Utensils,
  Fuel,
  Download,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface TripDetailsPanelProps {
  tripData: TripData;
  onTripUpdate: (trip: TripData) => void;
}

const carTypes: CarType[] = [
  { id: '1', name: 'Sedan', mpg: 30 },
  { id: '2', name: 'SUV', mpg: 22 },
  { id: '3', name: 'Hybrid', mpg: 45 },
  { id: '4', name: 'Electric', mpg: 100 },
  { id: '5', name: 'Truck', mpg: 18 },
];

export function TripDetailsPanel({ tripData, onTripUpdate }: TripDetailsPanelProps) {
  const [gasPrice, setGasPrice] = useState(tripData.gasPrice);
  const [selectedCarType, setSelectedCarType] = useState(tripData.carType);

  const updateGasCost = (newGasPrice: number, newCarType: CarType) => {
    const newGasCost = (tripData.totalMiles / newCarType.mpg) * newGasPrice;
    onTripUpdate({
      ...tripData,
      gasPrice: newGasPrice,
      carType: newCarType,
      gasCost: Math.round(newGasCost * 100) / 100,
    });
  };

  const handleCarTypeChange = (carTypeId: string) => {
    const newCarType = carTypes.find(c => c.id === carTypeId)!;
    setSelectedCarType(newCarType);
    updateGasCost(gasPrice, newCarType);
  };

  const handleGasPriceChange = (value: string) => {
    const newPrice = parseFloat(value) || 0;
    setGasPrice(newPrice);
    updateGasCost(newPrice, selectedCarType);
  };

  const handleSaveTrip = () => {
    toast.success('Trip saved successfully!', {
      description: 'You can access it from the Saved Trips page.',
    });
  };

  const handleShareTrip = () => {
    toast.success('Share link copied to clipboard!', {
      description: 'Anyone with this link can view your trip.',
    });
  };

  const hotels = tripData.pois.filter(poi => poi.category === 'hotel');
  const restaurants = tripData.pois.filter(poi => poi.category === 'restaurant');
  const gasStations = tripData.pois.filter(poi => poi.category === 'gas-station');

  return (
    <div className="w-96 bg-white border-l border-zinc-200 flex flex-col">
      <div className="p-4 border-b border-zinc-200">
        <h2 className="font-semibold text-zinc-900 mb-3">{tripData.name}</h2>
        <div className="flex gap-2">
          <Button onClick={handleSaveTrip} className="flex-1" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Trip
          </Button>
          <Button onClick={handleShareTrip} variant="outline" className="flex-1" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 px-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pois">POIs</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-4 space-y-4 mt-0">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Route Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Total Distance:</span>
                  <span className="font-semibold">{tripData.totalMiles} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Waypoints:</span>
                  <span className="font-semibold">{tripData.stops.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Points of Interest:</span>
                  <span className="font-semibold">{tripData.pois.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicle Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-600 mb-1 block">Car Type</label>
                  <Select value={selectedCarType.id} onValueChange={handleCarTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {carTypes.map(car => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.name} ({car.mpg} MPG)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Gas Cost Analysis
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-600 mb-1 block">Gas Price ($/gallon)</label>
                  <Input
                    type="number"
                    step="0.10"
                    value={gasPrice}
                    onChange={(e) => handleGasPriceChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Fuel Economy:</span>
                    <span className="font-semibold">{selectedCarType.mpg} MPG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Gallons Needed:</span>
                    <span className="font-semibold">
                      {(tripData.totalMiles / selectedCarType.mpg).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-zinc-600">Total Gas Cost:</span>
                    <span className="font-semibold text-green-600">
                      ${tripData.gasCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Route Stops</h3>
              <div className="space-y-2">
                <div className="text-sm p-2 bg-blue-50 rounded">
                  <p className="font-semibold text-blue-900">🚗 {tripData.origin.name}</p>
                  <p className="text-blue-600 text-xs">Start</p>
                </div>
                {tripData.stops.map((stop, index) => (
                  <div key={index} className="text-sm p-2 bg-zinc-50 rounded">
                    <p className="font-semibold">📍 {stop.location.name}</p>
                    {stop.notes && <p className="text-zinc-600 text-xs">{stop.notes}</p>}
                  </div>
                ))}
                <div className="text-sm p-2 bg-green-50 rounded">
                  <p className="font-semibold text-green-900">🏁 {tripData.destination.name}</p>
                  <p className="text-green-600 text-xs">Destination</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pois" className="p-4 space-y-3 mt-0">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Restaurants ({restaurants.length})
              </h3>
              <div className="space-y-2">
                {restaurants.slice(0, 5).map(poi => (
                  <Card key={poi.id} className="p-3">
                    <p className="font-semibold text-sm">{poi.name}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-600 mt-1">
                      {poi.rating && <span>⭐ {poi.rating.toFixed(1)}</span>}
                      {poi.priceRange && <span>{poi.priceRange}</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Gas Stations ({gasStations.length})
              </h3>
              <div className="space-y-2">
                {gasStations.slice(0, 5).map(poi => (
                  <Card key={poi.id} className="p-3">
                    <p className="font-semibold text-sm">{poi.name}</p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hotels" className="p-4 space-y-2 mt-0">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              Hotels on Route ({hotels.length})
            </h3>
            {hotels.map(poi => (
              <Card key={poi.id} className="p-3">
                <p className="font-semibold text-sm">{poi.name}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-600 mt-1">
                  {poi.rating && <span>⭐ {poi.rating.toFixed(1)}</span>}
                  {poi.priceRange && <span>{poi.priceRange}</span>}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{poi.location.name}</p>
              </Card>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
