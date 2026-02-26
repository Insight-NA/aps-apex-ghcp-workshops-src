import { Outlet, Link, useLocation } from 'react-router';
import { Map, Save, Share2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Map className="w-8 h-8 text-blue-600" />
              <h1 className="font-semibold text-zinc-900">
                RoadTrip AI Planner
              </h1>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                size="sm"
              >
                <Map className="w-4 h-4 mr-2" />
                Plan Trip
              </Button>
            </Link>
            <Link to="/saved">
              <Button 
                variant={location.pathname === '/saved' ? 'default' : 'ghost'}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Saved Trips
              </Button>
            </Link>
            <Link to="/shared">
              <Button 
                variant={location.pathname === '/shared' ? 'default' : 'ghost'}
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Shared Trips
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
