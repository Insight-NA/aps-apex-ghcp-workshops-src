import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, List, MapPin, Plus } from 'lucide-react';

const navItems = [
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/itinerary', icon: List, label: 'Itinerary' },
  { to: '/trips', icon: MapPin, label: 'My Trips' },
  { to: '/start', icon: Plus, label: 'Start' },
];

const MobileBottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <item.icon size={22} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
