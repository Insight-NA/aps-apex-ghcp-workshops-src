import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Loader2, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTripStore } from '../store/useTripStore';
import type { Stop } from '../types/Stop';
import type { Vehicle } from '../types/Vehicle';

interface PublicTrip {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  distance_miles?: number;
  stops: Stop[];
  vehicle_specs: Vehicle;
  is_featured: boolean;
  created_at?: string;
}

const AllTripsView: React.FC = () => {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const navigate = useNavigate();
  const { setStops, setVehicleSpecs } = useTripStore();

  useEffect(() => {
    fetchPublicTrips();
  }, [filter]);

  const fetchPublicTrips = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/public-trips?featured_only=${filter === 'featured'}`
      );
      setTrips(res.data);
    } catch (error) {
      console.error('Failed to fetch public trips', error);
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTrip = (trip: PublicTrip) => {
    // Load the trip into the store
    setStops(trip.stops || []);
    setVehicleSpecs(trip.vehicle_specs || {});
    toast.success(`Loaded "${trip.name}"!`);
    navigate('/itinerary');
  };

  const getDefaultImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop',
    ];
    return images[index % images.length];
  };

  return (
    <div className="pointer-events-auto absolute top-0 left-0 md:left-16 w-full md:w-[420px] h-full bg-white overflow-y-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/explore')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Community Trips</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Trips
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'featured'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star size={14} />
            Featured
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No trips found</h3>
            <p className="text-sm text-gray-500">
              {filter === 'featured'
                ? 'No featured trips available yet'
                : 'Be the first to share a public trip!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip, index) => (
              <div
                key={trip.id}
                onClick={() => handleLoadTrip(trip)}
                className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={trip.image_url || getDefaultImage(index)}
                    alt={trip.name}
                    className="w-full h-48 object-cover"
                  />
                  {trip.is_featured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      Featured
                    </div>
                  )}
                  {trip.distance_miles && (
                    <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                      {trip.distance_miles} MI
                    </span>
                  )}
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {trip.name}
                  </h3>
                  {trip.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {trip.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {trip.stops?.length || 0} stops
                    </span>
                    {trip.created_at && (
                      <span>{new Date(trip.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTripsView;
