import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTripStore } from '../store/useTripStore';
import type { Stop } from '../types/Stop';
import type { Vehicle } from '../types/Vehicle';

interface SavedTrip {
  id: number;
  name: string;
  stops: Stop[];
  vehicle_specs: Vehicle;
  created_at?: string;
}

const TripsView: React.FC = () => {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadTrip } = useTripStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data);
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTrip = async (id: number) => {
    try {
      await loadTrip(id);
      toast.success('Trip loaded!');
      navigate('/itinerary');
    } catch (error) {
      toast.error('Failed to load trip');
    }
  };

  const handleDeleteTrip = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(trips.filter(t => t.id !== id));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const token = localStorage.getItem('token');

  return (
    <div className="pointer-events-auto absolute top-0 left-0 md:left-16 w-full md:w-[420px] h-full bg-white overflow-y-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <p className="text-sm text-gray-500 mt-1">Your saved road trip plans</p>
      </div>

      {/* Content */}
      <div className="p-4">
        {!token ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Sign in to see your trips</h3>
            <p className="text-sm text-gray-500">Your saved trips will appear here after you log in.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No trips yet</h3>
            <p className="text-sm text-gray-500">Start planning your first adventure!</p>
            <button
              onClick={() => navigate('/itinerary')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className="p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {trip.stops?.length || 0} stops
                      </span>
                      {trip.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(trip.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsView;
