import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar, MobileBottomNav } from './navigation';
import MapComponent from './MapComponent';
import AuthStatus from './AuthStatus';
import { OfflineIndicator } from './OfflineIndicator';
import { useTripStore } from '../store/useTripStore';

const MainLayout: React.FC = () => {
  const initializeOfflineMode = useTripStore(state => state.initializeOfflineMode);

  // Initialize offline mode on mount
  useEffect(() => {
    initializeOfflineMode();
  }, [initializeOfflineMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Full Screen Map */}
        <div className="absolute inset-0 z-0">
          <MapComponent />
        </div>

        {/* Authentication Status Indicator - Top Right */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <AuthStatus />
        </div>

        {/* Offline Indicator - Below Auth Status */}
        <div className="absolute top-20 right-4 z-20 pointer-events-auto">
          <OfflineIndicator />
        </div>

        {/* Page Content Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
