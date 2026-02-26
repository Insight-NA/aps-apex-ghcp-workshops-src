import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, List, MapPin, Plus, User } from 'lucide-react';
import VersionDisplay from '../VersionDisplay';

const navItems = [
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/itinerary', icon: List, label: 'Itinerary' },
  { to: '/trips', icon: MapPin, label: 'My Trips' },
  { to: '/start', icon: Plus, label: 'Start Trip' },
];

const DesktopSidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col items-center w-16 bg-[#0a1628] py-4 gap-6">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <MapPin size={20} className="text-white" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile & Version */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-600">
          <User size={18} />
        </button>
        <VersionDisplay className="text-[9px]" />
      </div>
    </aside>
  );
};

export default DesktopSidebar;
