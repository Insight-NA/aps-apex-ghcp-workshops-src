import React, { useEffect, useState } from 'react';
import { User, LogOut, Shield } from 'lucide-react';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

interface AuthStatusProps {
  className?: string;
}

const AuthStatus: React.FC<AuthStatusProps> = ({ className = '' }) => {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('user_email');
    
    if (token && storedEmail) {
      setUser({ email: storedEmail, name: storedEmail.split('@')[0] });
    }

    // Listen for auth events
    const handleSessionExpired = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };

    const handleLogin = () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('user_email');
      if (token && email) {
        setUser({ email, name: email.split('@')[0] });
      }
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    window.addEventListener('auth:login', handleLogin);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('auth:login', handleLogin);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post('/api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed', error);
      // Still clear local tokens even if server request fails
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
      setUser(null);
      toast.success('Logged out');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User size={16} className="text-blue-600" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {user.name || 'User'}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {user.email}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs text-green-700">
          <Shield size={12} />
          <span>Secure</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default AuthStatus;
