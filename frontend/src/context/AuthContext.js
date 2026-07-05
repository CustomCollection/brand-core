'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiGet(ENDPOINTS.AUTH.PROFILE);
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(
    async (credentials) => {
      const data = await apiPost(ENDPOINTS.AUTH.LOGIN, credentials);
      await fetchProfile();
      return data;
    },
    [fetchProfile]
  );

  const register = useCallback(async (userData) => {
    const data = await apiPost(ENDPOINTS.AUTH.REGISTER, userData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const data = await apiPost(ENDPOINTS.AUTH.PROFILE, updates);
    setUser(data);
    return data;
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
