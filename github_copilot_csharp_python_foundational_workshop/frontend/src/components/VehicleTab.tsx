import React, { useState } from 'react';
import type { Vehicle } from '../types/Vehicle';
import { Settings, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axios';

interface VehicleTabProps {
  vehicleSpecs: Vehicle;
  setVehicleSpecs: (specs: Partial<Vehicle>) => void;
}

const VehicleTab: React.FC<VehicleTabProps> = ({ vehicleSpecs, setVehicleSpecs }) => {
  const [customVehicleDescription, setCustomVehicleDescription] = useState('');
  const [isAnalyzingVehicle, setIsAnalyzingVehicle] = useState(false);

  const handleAnalyzeVehicle = async (description: string) => {
    if (!description) return;
    setIsAnalyzingVehicle(true);
    try {
      const res = await axiosInstance.post('/api/vehicle-specs', { type: description });
      setVehicleSpecs(res.data);
      toast.success('Vehicle specs updated by AI!');
    } catch (err) {
      toast.error('Failed to analyze vehicle');
    } finally {
      setIsAnalyzingVehicle(false);
    }
  };

  return (
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
                const res = await axiosInstance.post('/api/vehicle-specs', { type });
                setVehicleSpecs(res.data);
              } catch (err) {
                console.error('Failed to fetch vehicle specs', err);
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
                  handleAnalyzeVehicle(customVehicleDescription);
                }
              }}
            />
            <button
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!customVehicleDescription || isAnalyzingVehicle}
              onClick={() => handleAnalyzeVehicle(customVehicleDescription)}
            >
              {isAnalyzingVehicle ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            * Requires Azure OpenAI configuration in backend. Falls back to defaults if not configured.
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
              value={(vehicleSpecs as Vehicle & { range: number }).range}
              onChange={(e) => setVehicleSpecs({ range: parseFloat(e.target.value) } as Partial<Vehicle>)}
              className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">MPG / MPGe</label>
            <input
              type="number"
              value={(vehicleSpecs as Vehicle & { mpg: number }).mpg}
              onChange={(e) => setVehicleSpecs({ mpg: parseFloat(e.target.value) } as Partial<Vehicle>)}
              className="w-full p-2 border rounded focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTab;
