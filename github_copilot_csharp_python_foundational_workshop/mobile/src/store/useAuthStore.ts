import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, saveToken, clearToken } from '../utils/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (token: string, user: User) => {
    try {
      await saveToken(token);
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to save token:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await clearToken();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to clear token:', error);
      throw error;
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      const storedToken = await getToken();

      if (storedToken) {
        // In a real app, you'd validate the token with the backend
        // and fetch user data. For now, we'll just set the token.
        // TODO: Add GET /api/auth/me endpoint call to fetch user data
        set({
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
