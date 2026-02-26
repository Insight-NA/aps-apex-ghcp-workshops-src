import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { MapPin, Car, DollarSign, Calendar, Trash2, Share2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SavedTrip {
  id: string;
  name: string;
  origin: string;
  destination: string;
  totalMiles: number;
  gasCost: number;
  savedDate: string;
  carType: string;
}

const mockSavedTrips: SavedTrip[] = [
  {
    id: '1',
    name: 'California Coast Adventure',
    origin: 'San Francisco, CA',
    destination: 'Los Angeles, CA',
    totalMiles: 382,
    gasCost: 44.52,
    savedDate: '2026-02-20',
    carType: 'Sedan (30 MPG)',
  },
  {
    id: '2',
    name: 'East Coast Express',
    origin: 'New York, NY',
    destination: 'Miami, FL',
    totalMiles: 1280,
    gasCost: 149.33,
    savedDate: '2026-02-18',
    carType: 'SUV (22 MPG)',
  },
  {
    id: '3',
    name: 'Mountain Scenic Route',
    origin: 'Denver, CO',
    destination: 'Seattle, WA',
    totalMiles: 1316,
    gasCost: 102.13,
    savedDate: '2026-02-15',
    carType: 'Hybrid (45 MPG)',
  },
];

export function SavedTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>(mockSavedTrips);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setTrips(trips.filter(trip => trip.id !== id));
    toast.success('Trip deleted successfully');
  };

  const handleShare = (trip: SavedTrip) => {
    toast.success('Share link copied to clipboard!', {
      description: `Link for "${trip.name}" is ready to share`,
    });
  };

  return (
    <div className="h-full bg-zinc-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-zinc-900 mb-2">Saved Trips</h1>
          <p className="text-zinc-600">Manage and view all your saved road trips</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input
              placeholder="Search saved trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map(trip => (
            <Card key={trip.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <h3 className="font-semibold text-zinc-900">{trip.name}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-zinc-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{trip.origin}</p>
                      <p className="text-xs">to {trip.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600">
                    <Car className="w-4 h-4" />
                    <span>{trip.totalMiles} miles • {trip.carType}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-green-600 font-semibold">${trip.gasCost.toFixed(2)}</span>
                    <span className="text-xs">estimated gas cost</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>Saved {new Date(trip.savedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(trip)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(trip.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">No saved trips found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {searchQuery ? 'Try a different search term' : 'Start planning a trip to save it here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
