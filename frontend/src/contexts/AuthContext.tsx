import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Business, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export interface AuthContextType {
  // State
  user: User | null;
  business: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedBusiness = localStorage.getItem('business');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          if (storedBusiness) {
            setBusiness(JSON.parse(storedBusiness));
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('business');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Verify token validity and refresh user data
  useEffect(() => {
    const verifyToken = async () => {
      if (user && !isLoading) {
        try {
          await refreshUserData();
        } catch (error) {
          console.error('Token verification failed:', error);
          await logout();
        }
      }
    };

    verifyToken();
  }, [user, isLoading]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      setUser(response.user);
      if (response.business) {
        setBusiness(response.business);
      }
      
      toast.success('Login successful!');
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error ? error.message : 'Login failed. Please try again.');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      
      setUser(response.user);
      if (response.business) {
        setBusiness(response.business);
      }
      
      toast.success('Registration successful! Welcome to POS System!');
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error ? error.message : 'Registration failed. Please try again.');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setBusiness(null);
      setIsLoading(false);
      toast.success('Logged out successfully');
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      const response = await apiService.getProfile();
      setUser(response.user);
      if (response.business) {
        setBusiness(response.business);
      }
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.business) {
        localStorage.setItem('business', JSON.stringify(response.business));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    // State
    user,
    business,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;