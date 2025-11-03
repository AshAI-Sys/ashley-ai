import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../utils/api';
import { APP_CONFIG, API_CONFIG } from '../constants/config';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(APP_CONFIG.TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(APP_CONFIG.USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('Loaded stored auth - User:', JSON.parse(storedUser).email);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);

      // Call backend login API
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        password,
      });

      console.log('Login response status:', response.status);

      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }

      const { access_token, user: userData } = response.data;

      console.log('Login successful - User:', userData.email, 'Role:', userData.role);

      // Map backend user data to app user format
      const mappedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email,
        role: userData.role,
        workspaceId: userData.workspaceId,
      };

      // Store auth data in secure storage
      await SecureStore.setItemAsync(APP_CONFIG.TOKEN_KEY, access_token);
      await SecureStore.setItemAsync(APP_CONFIG.USER_KEY, JSON.stringify(mappedUser));

      // Update state
      setToken(access_token);
      setUser(mappedUser);

      console.log('Auth data stored securely');
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message;

        if (status === 401) {
          throw new Error('Invalid email or password');
        } else if (status === 429) {
          throw new Error('Too many login attempts. Please try again later');
        } else if (message) {
          throw new Error(message);
        } else {
          throw new Error('Server error. Please try again');
        }
      } else if (error.request) {
        // Request made but no response received
        throw new Error('Cannot connect to server. Please check your connection');
      } else {
        // Something else happened
        throw new Error(error.message || 'Login failed. Please try again');
      }
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user:', user?.email);

      // Clear secure storage
      await SecureStore.deleteItemAsync(APP_CONFIG.TOKEN_KEY);
      await SecureStore.deleteItemAsync(APP_CONFIG.USER_KEY);

      // Clear state
      setUser(null);
      setToken(null);

      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear the state
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
