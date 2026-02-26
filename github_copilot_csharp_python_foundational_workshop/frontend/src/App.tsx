import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainLayout from './components/MainLayout';
import { ExploreView, ItineraryView, TripsView, StartTripView, AllTripsView } from './views';

// Google Client ID from environment variable (set during build)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/explore" replace />} />
            <Route path="explore" element={<ExploreView />} />
            <Route path="itinerary" element={<ItineraryView />} />
            <Route path="trips" element={<TripsView />} />
            <Route path="start" element={<StartTripView />} />
            <Route path="all-trips" element={<AllTripsView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
