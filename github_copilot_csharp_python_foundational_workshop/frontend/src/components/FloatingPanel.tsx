import React, { useState, useEffect } from 'react';
import { Stop } from '../types/Stop';
import { Trip } from '../types/Trip';
import { POI } from '../types/POI';
import type { Feature } from '../types/Feature';
import { Leg } from '../types/Route';
import { useTripStore } from '../store/useTripStore';
import { Truck, MapPin, Settings, Navigation, Plus, X, Search, GripVertical, Coffee, Fuel, Bed, List, Sparkles, Save, FolderOpen, Loader2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import axiosInstance from '../utils/axios';
import * as turf from '@turf/turf';
import { useGoogleLogin } from '@react-oauth/google';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
interface SortableStopItemProps {
  stop: Stop;
  index: number;
  stopsLength: number;
  removeStop: (id: string) => void;
}
const SortableStopItem: React.FC<SortableStopItemProps> = ({ stop, index, stopsLength, removeStop }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group relative"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={16} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : index === stopsLength - 1 ? 'bg-red-500' : 'bg-blue-500'}`} />
        {index < stopsLength - 1 && <div className="w-0.5 h-6 bg-gray-300" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{stop.name}</p>
        <p className="text-xs text-gray-500">{stop.coordinates[1].toFixed(4)}, {stop.coordinates[0].toFixed(4)}</p>
      </div>
      <button 
        onClick={() => removeStop(stop.id)}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const FloatingPanel: React.FC = () => {
  const { vehicleSpecs, setVehicleSpecs, stops, addStop, removeStop, setRouteData, reorderStops, routeDistance, routeGeoJSON, setPOIs, routeLegs, setStops, saveTrip, loadTrips, loadTrip } = useTripStore();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'vehicle' | 'directions' | 'trips'>('itinerary');
  const [searchQuery, setSearchQuery] = useState('');
  const [fuelPrice, setFuelPrice] = useState(3.50); // Default $3.50/gal
  const [isSearchingPOIs, setIsSearchingPOIs] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<{ loggedIn: boolean; email?: string } | null>(null);
  
  // Loading States
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [customVehicleDescription, setCustomVehicleDescription] = useState('');
  const [isAnalyzingVehicle, setIsAnalyzingVehicle] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to get user info (simplified)
      setUser({ loggedIn: true });
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Exchange Google token for App Token
        // Note: In a real app, you'd send the id_token, but useGoogleLogin returns an access_token.
        // For this demo, we'll assume the backend can verify the access_token or we use the id_token flow.
        // Let's assume we send the access_token to our backend which verifies it with Google UserInfo endpoint.
        
        // However, for simplicity in this demo environment where we might not have a real Google Client ID setup:
        // We will simulate the login if the token is "MOCK_TOKEN" (handled in backend)
        // But since we are using the real library, we will try to send the token.
        
        // If you don't have a real Client ID, this part will fail on the frontend.
        // So for testing without a Client ID, we can add a "Dev Login" button.
        
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
          token: tokenResponse.access_token 
        });
        
        localStorage.setItem('token', res.data.access_token);
        if (res.data.refresh_token) {
          localStorage.setItem('refresh_token', res.data.refresh_token);
        }
        if (res.data.user?.email) {
          localStorage.setItem('user_email', res.data.user.email);
        }
        setUser({ loggedIn: true, email: res.data.user?.email });
        window.dispatchEvent(new CustomEvent('auth:login'));
        toast.success('Logged in successfully!');
        
        // If we were trying to save, save now
        if (tripName) {
          handleSaveTrip();
        }
      } catch (error) {
        console.error('Login failed', error);
        toast.error('Login failed');
      }
    },
    onError: () => toast.error('Login Failed'),
  });

  // Dev Login for testing without Google Cloud Project
  const devLogin = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        token: "MOCK_TOKEN"
      });
      localStorage.setItem('token', res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem('refresh_token', res.data.refresh_token);
      }
      if (res.data.user?.email) {
        localStorage.setItem('user_email', res.data.user.email);
      }
      setUser({ loggedIn: true, email: res.data.user?.email });
      window.dispatchEvent(new CustomEvent('auth:login'));
      toast.success('Logged in as Demo User!');
    } catch (error) {
      toast.error('Dev Login failed');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over?.id);
      reorderStops(oldIndex, newIndex);
    }
  };

  const handleAddStop = async () => {
    if (!searchQuery) return;
    
    const promise = axios.get(`${import.meta.env.VITE_API_URL}/api/geocode?q=${encodeURIComponent(searchQuery)}`);
    
    toast.promise(promise, {
      loading: 'Searching...',
      success: (res) => {
        addStop({
          id: crypto.randomUUID(),
          name: res.data.place_name,
          coordinates: res.data.coordinates,
          type: stops.length === 0 ? 'start' : 'stop'
        });
        setSearchQuery('');
        return 'Location added!';
      },
      error: 'Could not find that address.'
    });
  };

  const handleCalculateRoute = async (arg?: Stop[] | React.MouseEvent<HTMLButtonElement>) => {
    // If called from onClick, arg is an Event. If called manually, it might be an array of stops.
    const currentStops: Stop[] = Array.isArray(arg) ? arg : stops;

    if (currentStops.length < 2) return;

    // Prepare coordinates string for Mapbox: "lng,lat;lng,lat"
    const coords = currentStops.map((s) => s.coordinates.join(',')).join(';');
    
    setIsLoadingRoute(true);
    try {
      // Call our Python backend
      // Note: Ensure your backend is running on port 8000
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/directions?coords=${coords}`);
      
      if (response.data) {
        setRouteData(response.data.geometry, response.data.distance, response.data.duration, response.data.legs);
        console.log("Route calculated:", response.data);
        setActiveTab('directions'); // Switch to directions tab automatically
        toast.success('Route calculated!');
      }
    } catch (error) {
      console.error("Failed to calculate route", error);
      toast.error("Failed to calculate route. Make sure the backend is running.");
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleSearchAlongRoute = async (category: string) => {
    if (!routeGeoJSON) {
      toast.error("Please calculate a route first.");
      return;
    }

    // Toggle category on/off
    const newActiveCategories = new Set(activeCategories);
    if (newActiveCategories.has(category)) {
      // Deactivate - remove POIs of this category
      newActiveCategories.delete(category);
      setActiveCategories(newActiveCategories);
      const filteredPOIs = pois.filter(poi => poi.category !== category);
      setPOIs(filteredPOIs);
      toast.success(`${category} hidden`);
      return;
    }

    // Activate - add this category
    newActiveCategories.add(category);
    setActiveCategories(newActiveCategories);
    setIsSearchingPOIs(true);

    try {
      // 1. Sample points along the route (every 50km)
      const line = turf.lineString(routeGeoJSON.coordinates);
      const length = turf.length(line, { units: 'kilometers' });
      const steps = Math.ceil(length / 50); // Every 50km
      
      const searchPoints = [];
      for (let i = 0; i <= steps; i++) {
        const point = turf.along(line, i * 50, { units: 'kilometers' });
        searchPoints.push(point.geometry.coordinates);
      }

      // 2. Call Backend Search for each point (Limit to 10 points to avoid rate limits in demo)
      // In production, you'd optimize this or use a dedicated "along route" API
      const limitedPoints = searchPoints.slice(0, 10); 
      
      const allResults = await Promise.all<Feature[]>(
        limitedPoints.map(async (coords) => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search?query=${category}&proximity=${coords.join(',')}`);
          return res.data.features;
        })
      );

      // 3. Deduplicate and Store
      const flatResults: Feature[] = allResults.flat();
      const uniquePOIs = new Map<string, POI>();
      
      flatResults.forEach((feat) => {
        if (!uniquePOIs.has(feat.id)) {
          uniquePOIs.set(feat.id, {
            id: feat.id,
            name: feat.text,
            coordinates: feat.geometry.coordinates,
            category: category,
            address: feat.place_name
          });
        }
      });

      // MERGE with existing POIs from other categories instead of replacing
      setPOIs([...pois, ...Array.from(uniquePOIs.values())]);
      toast.success(`Found ${uniquePOIs.size} ${category}s along route`);

    } catch (error) {
      console.error("POI Search failed", error);
      toast.error("Failed to search for places.");
      // Rollback on error
      newActiveCategories.delete(category);
      setActiveCategories(newActiveCategories);
    } finally {
      setIsSearchingPOIs(false);
    }
  };

  const handleOptimizeRoute = async () => {
    if (stops.length < 3) return;

    const coords = stops.map(s => s.coordinates.join(',')).join(';');
    
    const promise = axios.get(`${import.meta.env.VITE_API_URL}/api/optimize?coords=${coords}`);

    toast.promise(promise, {
      loading: 'Optimizing route...',
      success: (response) => {
        if (response.data && response.data.waypoints) {
          const newStops = response.data.waypoints.map((wp: { waypoint_index: number }) => stops[wp.waypoint_index]);
          setStops(newStops);
          handleCalculateRoute(newStops);
          return 'Route optimized!';
        }
        throw new Error('No waypoints returned');
      },
      error: 'Failed to optimize route.'
    });
  };

  const handleSaveTrip = async () => {
    if (!tripName) {
      toast.error("Please enter a trip name");
      return;
    }

    if (!user) {
      toast('Please login to save trips', { icon: '🔒' });
      // Trigger login or show modal
      // For now, we'll just show the dev login button in the UI
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const tripData = {
        name: tripName,
        stops,
        vehicle_specs: vehicleSpecs,
        is_public: isPublic,
        description: tripDescription || null,
        distance_miles: routeDistance ? Math.round(routeDistance / 1609.34) : null
      };
      
      await axios.post(`${import.meta.env.VITE_API_URL}/api/trips`, tripData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTripName('');
      setTripDescription('');
      setIsPublic(false);
      toast.success('Trip saved successfully!');
      // Refresh list
      const trips = await loadTrips();
      setSavedTrips(trips);
    } catch (error) {
      toast.error('Failed to save trip');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTrips = async () => {
    if (!user) {
      setActiveTab('trips');
      return;
    }
    
    setIsLoadingTrips(true);
    try {
      const trips = await loadTrips();
      setSavedTrips(trips);
      setActiveTab('trips');
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleSelectTrip = async (id: number) => {
    const promise = loadTrip(id);
    toast.promise(promise, {
      loading: 'Loading trip...',
      success: () => {
        setActiveTab('itinerary');
        return 'Trip loaded!';
      },
      error: 'Failed to load trip'
    });
  };

  return (
    <div className="pointer-events-auto absolute top-4 left-0 md:left-4 w-full md:w-96 bg-white md:rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-5rem)] md:max-h-[90vh]">
      {/* Header Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'itinerary' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('itinerary')}
        >
          <Navigation size={16} /> Itinerary
        </button>
        <button
          className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'vehicle' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('vehicle')}
        >
          <Truck size={16} /> Vehicle
        </button>
        {routeLegs.length > 0 && (
          <button
            className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'directions' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('directions')}
          >
            <List size={16} /> Directions
          </button>
        )}
        <button
            className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'trips' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={handleLoadTrips}
          >
            <FolderOpen size={16} /> Trips
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            {/* Search / Add Stop */}
            <div className="relative">
              <input
                type="text"
                placeholder="Add a stop (City, Place)..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStop()}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <button 
                onClick={handleAddStop}
                className="absolute right-2 top-1.5 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Stops List */}
            <div className="space-y-2">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={stops.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {stops.map((stop, index) => (
                    <SortableStopItem 
                      key={stop.id} 
                      stop={stop} 
                      index={index} 
                      stopsLength={stops.length} 
                      removeStop={removeStop} 
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              {stops.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No stops added yet. Start by adding a location!
                </div>
              )}
            </div>

            {/* Calculate Button & Cost */}
            {stops.length >= 2 && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Est. Fuel Cost:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">($/gal)</span>
                    <input 
                      type="number" 
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(parseFloat(e.target.value))}
                      className="w-16 p-1 border rounded text-right"
                      step="0.1"
                    />
                  </div>
                </div>
                
                {routeDistance > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
                    <span className="text-green-800 font-medium">Total Cost</span>
                    <span className="text-green-700 font-bold text-lg">
                      ${((routeDistance / 1609.34) / vehicleSpecs.mpg * fuelPrice).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {stops.length >= 3 && (
                    <button
                      onClick={handleOptimizeRoute}
                      className="flex-1 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-all flex items-center justify-center gap-2"
                      title="Reorder stops for shortest route"
                    >
                      <Sparkles size={18} /> Optimize
                    </button>
                  )}
                  <button
                    onClick={() => handleCalculateRoute()}
                    disabled={isLoadingRoute}
                    className="flex-[2] py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoadingRoute ? <Loader2 className="animate-spin" size={18} /> : 'Calculate Route'}
                  </button>
                </div>

                {/* Save Trip */}
                <div className="pt-4 border-t border-gray-100 flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Trip Name" 
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="flex-1 p-2 border rounded text-sm"
                    />
                    <button 
                      onClick={handleSaveTrip}
                      disabled={isSaving}
                      className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    </button>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={tripDescription}
                    onChange={(e) => setTripDescription(e.target.value)}
                    className="w-full p-2 border rounded text-sm resize-none"
                    rows={2}
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded"
                    />
                    <span>Share publicly (visible in Explore)</span>
                  </label>
                  {!user && (
                    <button 
                      onClick={devLogin}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-center"
                    >
                      <LogIn size={12} /> Login to Save (Demo)
                    </button>
                  )}
                </div>

                {/* POI Search Buttons */}

                {/* POI Search Buttons */}
                {routeDistance > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Find Along Route</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleSearchAlongRoute('gas station')}
                        disabled={isSearchingPOIs}
                        className={`flex flex-col items-center gap-1 p-2 border rounded-lg transition-colors ${
                          activeCategories.has('gas station')
                            ? 'bg-blue-200 border-blue-400 shadow-md'
                            : 'bg-gray-50 hover:bg-blue-50 border-gray-200'
                        }`}
                      >
                        <Fuel size={20} className="text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Gas</span>
                      </button>
                      <button 
                        onClick={() => handleSearchAlongRoute('restaurant')}
                        disabled={isSearchingPOIs}
                        className={`flex flex-col items-center gap-1 p-2 border rounded-lg transition-colors ${
                          activeCategories.has('restaurant')
                            ? 'bg-orange-200 border-orange-400 shadow-md'
                            : 'bg-gray-50 hover:bg-orange-50 border-gray-200'
                        }`}
                      >
                        <Coffee size={20} className="text-orange-600" />
                        <span className="text-xs font-medium text-gray-700">Food</span>
                      </button>
                      <button 
                        onClick={() => handleSearchAlongRoute('hotel')}
                        disabled={isSearchingPOIs}
                        className={`flex flex-col items-center gap-1 p-2 border rounded-lg transition-colors ${
                          activeCategories.has('hotel')
                            ? 'bg-indigo-200 border-indigo-400 shadow-md'
                            : 'bg-gray-50 hover:bg-indigo-50 border-gray-200'
                        }`}
                      >
                        <Bed size={20} className="text-indigo-600" />
                        <span className="text-xs font-medium text-gray-700">Sleep</span>
                      </button>
                    </div>
                    {isSearchingPOIs && (
                      <div className="text-center mt-2 text-xs text-blue-600 animate-pulse">
                        Searching along route...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vehicle' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Settings size={16} /> Vehicle Configuration
              </h3>
              <p className="text-xs text-blue-700 mb-4">
                Select your vehicle type to auto-configure dimensions for safe routing.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select 
                  className="w-full p-2 border rounded focus:ring-blue-500 outline-none bg-white"
                  onChange={async (e) => {
                    const type = e.target.value;
                    if (!type) return;
                    try {
                      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vehicle-specs`, { type });
                      setVehicleSpecs(res.data);
                    } catch (err) {
                      console.error("Failed to fetch vehicle specs", err);
                    }
                  }}
                >
                  <option value="">Select a vehicle...</option>
                  <option value="car">Sedan / Compact Car</option>
                  <option value="suv">SUV / Crossover</option>
                  <option value="mini_van">Mini Van</option>
                  <option value="van">Camper Van</option>
                  <option value="rv_small">Class C RV (Small)</option>
                  <option value="rv_large">Class A RV (Large)</option>
                  <option value="truck">Commercial Truck</option>
                  <option value="ev_sedan">Electric Sedan</option>
                  <option value="ev_truck">Electric Truck</option>
                </select>
              </div>

              <div className="mb-4 border-t border-blue-200 pt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Or describe your vehicle (AI Powered)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 2022 Ford F-150 towing a 25ft boat"
                    className="flex-1 p-2 border rounded focus:ring-blue-500 outline-none text-sm"
                    value={customVehicleDescription}
                    onChange={(e) => setCustomVehicleDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customVehicleDescription) {
                        // Trigger analysis
                        const analyze = async () => {
                          setIsAnalyzingVehicle(true);
                          try {
                            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vehicle-specs`, { type: customVehicleDescription });
                            setVehicleSpecs(res.data);
                            toast.success('Vehicle specs updated by AI!');
                          } catch (err) {
                            toast.error('Failed to analyze vehicle');
                          } finally {
                            setIsAnalyzingVehicle(false);
                          }
                        };
                        analyze();
                      }
                    }}
                  />
                  <button
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!customVehicleDescription || isAnalyzingVehicle}
                    onClick={async () => {
                      setIsAnalyzingVehicle(true);
                      try {
                        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vehicle-specs`, { type: customVehicleDescription });
                        setVehicleSpecs(res.data);
                        toast.success('Vehicle specs updated by AI!');
                      } catch (err) {
                        toast.error('Failed to analyze vehicle');
                      } finally {
                        setIsAnalyzingVehicle(false);
                      }
                    }}
                  >
                    {isAnalyzingVehicle ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  * Requires Gemini API Key in backend. Falls back to defaults if not configured.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Height (m)</label>
                  <input 
                    type="number" 
                    value={vehicleSpecs.height}
                    onChange={(e) => setVehicleSpecs({ height: parseFloat(e.target.value) })}

                    className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Weight (tons)</label>
                  <input 
                    type="number" 
                    value={vehicleSpecs.weight}
                    onChange={(e) => setVehicleSpecs({ weight: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Width (m)</label>
                  <input 
                    type="number" 
                    value={vehicleSpecs.width}
                    onChange={(e) => setVehicleSpecs({ width: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Range (mi)</label>
                  <input 
                    type="number" 
                    value={vehicleSpecs.range}
                    onChange={(e) => setVehicleSpecs({ range: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">MPG / MPGe</label>
                  <input 
                    type="number" 
                    value={vehicleSpecs.mpg}
                    onChange={(e) => setVehicleSpecs({ mpg: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'directions' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Navigation size={16} /> Turn-by-Turn Directions
            </h3>
            
            <div className="space-y-6">
              {routeLegs.map((leg: Leg, legIndex: number) => (
                <div key={legIndex} className="relative">
                  {/* Leg Header */}
                  <div className="sticky top-0 bg-white z-10 py-2 border-b border-gray-100 mb-2">
                    <h4 className="text-sm font-bold text-blue-800">
                      Leg {legIndex + 1}: To {stops[legIndex + 1]?.name || 'Destination'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {(leg.distance / 1609.34).toFixed(1)} miles • {(leg.duration / 60).toFixed(0)} mins
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3 pl-2">
                    {leg.steps.map((step, stepIndex: number) => (
                      <div key={stepIndex} className="flex gap-3 text-sm group">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors" />
                          {stepIndex < leg.steps.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-100 group-hover:bg-blue-50 transition-colors my-1" />
                          )}
                        </div>
                        <div className="pb-2">
                          <p className="text-gray-700 leading-snug">{step.maneuver.instruction}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {(step.distance / 1609.34).toFixed(1)} mi
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FolderOpen size={16} /> Saved Trips
            </h3>
            
            {!user ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-500 text-sm">Login to view your saved trips.</p>
                <button 
                  onClick={devLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <LogIn size={16} /> Login with Google (Demo)
                </button>
              </div>
            ) : isLoadingTrips ? (
              <div className="flex justify-center py-8 text-blue-600">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : savedTrips.length === 0 ? (
              <p className="text-sm text-gray-500">No saved trips found.</p>
            ) : (
              <div className="space-y-2">
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => handleSelectTrip(trip.id)}
                    className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-gray-800">{trip.name}</h4>
                    <p className="text-xs text-gray-500">
                      {trip.stops.length} stops • {trip.vehicle_specs.fuelType}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingPanel;
