import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Tent, Coffee, Fuel, Bed, ShoppingBag, Mountain, 
  Utensils, ParkingCircle, Star, Heart, Dumbbell, Bus, Sparkles, ChevronRight,
  MapPin, Plus, Loader2, X, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTripStore } from '../store/useTripStore';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  category: string;
}

const categories = [
  { id: 'campground', label: 'Places to Camp', icon: Tent, query: 'campground' },
  { id: 'park', label: 'Parks & Nature', icon: Mountain, query: 'park' },
  { id: 'attraction', label: 'Sights & Attractions', icon: Sparkles, query: 'tourist attraction' },
  { id: 'restaurant', label: 'Bars & Restaurants', icon: Utensils, query: 'restaurant' },
  { id: 'hotel', label: 'Hotels & Stays', icon: Bed, query: 'hotel' },
  { id: 'gas', label: 'Fuel & Rest Stops', icon: Fuel, query: 'gas station' },
  { id: 'coffee', label: 'Coffee Shops', icon: Coffee, query: 'coffee' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, query: 'shopping' },
  { id: 'gym', label: 'Sports & Wellness', icon: Dumbbell, query: 'gym' },
  { id: 'parking', label: 'RV Parking', icon: ParkingCircle, query: 'rv park' },
];

interface FeaturedTrip {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  distance_miles?: number;
}

const ExploreView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [featuredTrips, setFeaturedTrips] = useState<FeaturedTrip[]>([]);
  const { addStop, stops } = useTripStore();
  const navigate = useNavigate();

  // Fetch featured trips on mount
  React.useEffect(() => {
    fetchFeaturedTrips();
  }, []);

  const fetchFeaturedTrips = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/public-trips?featured_only=true&limit=5`
      );
      setFeaturedTrips(res.data);
    } catch (error) {
      console.error('Failed to fetch featured trips', error);
      // Keep empty array, will show fallback
    }
  };

  const getDefaultImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    ];
    return images[index % images.length];
  };

  const handleCategoryClick = async (category: typeof categories[0]) => {
    setSelectedCategory(category.id);
    setIsSearching(true);
    setSearchResults([]);

    try {
      // Search near center of US by default, or use user's location
      const defaultProximity = '-98.5795,39.8283'; // Center of US
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/search?query=${encodeURIComponent(category.query)}&proximity=${defaultProximity}`
      );

        if (res.data.features) {
          const results: SearchResult[] = res.data.features.map((feat: {
            id: string;
            text?: string;
            place_name?: string;
            geometry: { coordinates: [number, number] };
          }) => ({
            id: feat.id,
            name: feat.text || feat.place_name?.split(',')[0] || '',
            address: feat.place_name || '',
            coordinates: feat.geometry.coordinates,
            category: category.id,
          }));
          setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed', error);
      toast.error('Failed to search. Check backend connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSelectedCategory('search');
    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/search?query=${encodeURIComponent(searchQuery)}`
      );

        if (res.data.features) {
          const results: SearchResult[] = res.data.features.map((feat: {
            id: string;
            text?: string;
            place_name?: string;
            geometry: { coordinates: [number, number] };
          }) => ({
            id: feat.id,
            name: feat.text || feat.place_name?.split(',')[0] || '',
            address: feat.place_name || '',
            coordinates: feat.geometry.coordinates,
            category: 'search',
          }));
          setSearchResults(results);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToTrip = (result: SearchResult) => {
    addStop({
      id: crypto.randomUUID(),
      name: result.name,
      coordinates: result.coordinates,
      type: stops.length === 0 ? 'start' : 'stop',
    });
    toast.success(`Added "${result.name}" to your trip!`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchResults([]);
  };

  const handleViewOnMap = (result: SearchResult) => {
    // Add to trip and navigate to itinerary
    handleAddToTrip(result);
    navigate('/itinerary');
  };

  const handleLoadFeaturedTrip = (trip: FeaturedTrip) => {
    navigate('/all-trips');
  };

  return (
    <div className="pointer-events-auto absolute top-0 left-0 md:left-16 w-full md:w-[420px] h-full bg-white overflow-y-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="p-4 border-b">
        {selectedCategory ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToCategories}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'search' ? `Results for "${searchQuery}"` : categories.find(c => c.id === selectedCategory)?.label}
            </h1>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Explore</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search and Explore"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            </div>
          </>
        )}
      </div>

      {/* Search Results View */}
      {selectedCategory ? (
        <div className="p-4">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
              <p className="text-gray-500">Searching nearby places...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No results found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-xl hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{result.name}</h3>
                      <p className="text-sm text-gray-500 truncate mt-1">{result.address}</p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => handleAddToTrip(result)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Add to trip"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category Pills */}
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
                >
                  <cat.icon size={16} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Planning CTA */}
          <div 
            onClick={() => navigate('/start')}
            className="mx-4 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-300 rounded-lg flex items-center justify-center">
              <Mountain size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Start planning your next</h3>
              <p className="text-gray-700">road trip today</p>
            </div>
            <ChevronRight className="text-gray-400" />
          </div>

          {/* Featured Trips */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Find Your Next Camping-Inspired Adventure</h2>
              <button 
                onClick={() => navigate('/all-trips')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {featuredTrips.length > 0 ? (
                featuredTrips.map((trip, index) => (
                  <div
                    key={trip.id}
                    onClick={() => handleLoadFeaturedTrip(trip)}
                    className="flex-shrink-0 w-64 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={trip.image_url || getDefaultImage(index)}
                        alt={trip.name}
                        className="w-full h-40 object-cover"
                      />
                      {trip.distance_miles && (
                        <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                          {trip.distance_miles} MI
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{trip.name}</p>
                      {trip.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{trip.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                // Fallback: Show placeholder message
                <div className="flex-shrink-0 w-64 p-6 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">No featured trips yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="p-4 border-t">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'National Parks', query: 'national park' },
                { name: 'Beach Towns', query: 'beach' },
                { name: 'Mountain Getaways', query: 'mountain resort' },
                { name: 'Historic Sites', query: 'historic site' },
              ].map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => handleCategoryClick({ id: dest.name, label: dest.name, icon: MapPin, query: dest.query })}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors text-left"
                >
                  <span className="text-sm font-medium">{dest.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExploreView;
