import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Truck, Sparkles } from 'lucide-react';

const StartTripView: React.FC = () => {
  const navigate = useNavigate();

  const handleStartBlank = () => {
    navigate('/itinerary');
  };

  return (
    <div className="pointer-events-auto absolute top-0 left-0 md:left-16 w-full md:w-[420px] h-full bg-white overflow-y-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Start a Trip</h1>
        <p className="text-sm text-gray-500 mt-1">Begin planning your next adventure</p>
      </div>

      {/* Options */}
      <div className="p-4 space-y-4">
        {/* Blank Trip */}
        <button
          onClick={handleStartBlank}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <MapPin size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Start from scratch</h3>
              <p className="text-sm text-gray-500">Add your own stops and destinations</p>
            </div>
          </div>
        </button>

        {/* AI-Powered Trip */}
        <button
          onClick={() => navigate('/itinerary')}
          className="w-full p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all text-left text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-semibold">AI Trip Planner</h3>
              <p className="text-sm opacity-90">Let AI generate a trip based on your preferences</p>
            </div>
          </div>
        </button>

        {/* Quick Templates */}
        <div className="pt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Start Templates</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Navigation, title: 'Weekend Getaway', desc: '2-3 days' },
              { icon: Truck, title: 'Cross Country', desc: '7+ days' },
              { icon: MapPin, title: 'National Parks', desc: 'Scenic routes' },
              { icon: Sparkles, title: 'Hidden Gems', desc: 'Off the beaten path' },
            ].map((template) => (
              <button
                key={template.title}
                onClick={() => navigate('/itinerary')}
                className="p-4 border rounded-xl hover:shadow-md hover:border-blue-300 transition-all text-left"
              >
                <template.icon size={24} className="text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">{template.title}</h4>
                <p className="text-xs text-gray-500">{template.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartTripView;
