import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MapPin, Car, DollarSign, Calendar, Users, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SharedTrip {
  id: string;
  name: string;
  origin: string;
  destination: string;
  totalMiles: number;
  gasCost: number;
  sharedBy: string;
  sharedDate: string;
  carType: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const mockSharedTrips: SharedTrip[] = [
  {
    id: '1',
    name: 'Pacific Northwest Paradise',
    origin: 'Portland, OR',
    destination: 'Seattle, WA',
    totalMiles: 174,
    gasCost: 20.28,
    sharedBy: 'Sarah Johnson',
    sharedDate: '2026-02-24',
    carType: 'Hybrid (45 MPG)',
    likes: 42,
    comments: 8,
    isLiked: false,
  },
  {
    id: '2',
    name: 'Southern BBQ Trail',
    origin: 'Austin, TX',
    destination: 'Nashville, TN',
    totalMiles: 907,
    gasCost: 105.77,
    sharedBy: 'Mike Chen',
    sharedDate: '2026-02-23',
    carType: 'Sedan (30 MPG)',
    likes: 128,
    comments: 23,
    isLiked: true,
  },
  {
    id: '3',
    name: 'Desert Explorer',
    origin: 'Las Vegas, NV',
    destination: 'Phoenix, AZ',
    totalMiles: 297,
    gasCost: 34.62,
    sharedBy: 'Emily Rodriguez',
    sharedDate: '2026-02-22',
    carType: 'SUV (22 MPG)',
    likes: 67,
    comments: 12,
    isLiked: false,
  },
  {
    id: '4',
    name: 'East Coast History Tour',
    origin: 'Boston, MA',
    destination: 'Atlanta, GA',
    totalMiles: 1086,
    gasCost: 126.70,
    sharedBy: 'David Park',
    sharedDate: '2026-02-21',
    carType: 'Sedan (30 MPG)',
    likes: 95,
    comments: 17,
    isLiked: false,
  },
];

export function SharedTrips() {
  const [trips, setTrips] = useState<SharedTrip[]>(mockSharedTrips);

  const handleLike = (id: string) => {
    setTrips(trips.map(trip => {
      if (trip.id === id) {
        return {
          ...trip,
          isLiked: !trip.isLiked,
          likes: trip.isLiked ? trip.likes - 1 : trip.likes + 1,
        };
      }
      return trip;
    }));
  };

  const handleComment = (trip: SharedTrip) => {
    toast.success('Comments feature coming soon!');
  };

  const handleCopyTrip = (trip: SharedTrip) => {
    toast.success('Trip copied to your saved trips!', {
      description: `"${trip.name}" is now in your saved trips`,
    });
  };

  return (
    <div className="h-full bg-zinc-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-zinc-900 mb-2">Shared Trips</h1>
          <p className="text-zinc-600">Discover road trips shared by the community</p>
        </div>

        <div className="space-y-4">
          {trips.map(trip => (
            <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {trip.sharedBy.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{trip.name}</h3>
                      <p className="text-sm text-zinc-500">
                        Shared by {trip.sharedBy} • {new Date(trip.sharedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.origin} → {trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>{trip.totalMiles} miles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-green-600 font-semibold">
                          ${trip.gasCost.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">{trip.carType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(trip.id)}
                      className={trip.isLiked ? 'text-red-600' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${trip.isLiked ? 'fill-current' : ''}`} />
                      {trip.likes}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComment(trip)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {trip.comments}
                    </Button>

                    <div className="flex-1" />

                    <Button
                      size="sm"
                      onClick={() => handleCopyTrip(trip)}
                    >
                      Copy to My Trips
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            <Users className="w-4 h-4 inline mr-1" />
            Join the community and share your road trips!
          </p>
        </div>
      </div>
    </div>
  );
}
