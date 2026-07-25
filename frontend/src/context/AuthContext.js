'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user profile on mount
  const refreshUser = useCallback(async () => {
    try {
      const data = await apiGet(ENDPOINTS.AUTH.PROFILE);
      // Profile response: { user: {...}, phone: '...', avatar_url: '...' }
      setUser(data?.user || data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const data = await apiPost(ENDPOINTS.AUTH.LOGIN, { email, password });
    // Response: { message: '...', user: {...} } — cookies set by server
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async ({ email, first_name, last_name, password }) => {
    // Always send password_confirm as backend requires it for validation
    const data = await apiPost(ENDPOINTS.AUTH.REGISTER, {
      email,
      first_name,
      last_name,
      password,
      password_confirm: password,
    });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost(ENDPOINTS.AUTH.LOGOUT, {});
    } catch {
      // Ignore errors — clear state regardless
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    // Backend uses PUT for profile updates
    const data = await apiPut(ENDPOINTS.AUTH.PROFILE, updates);
    // Response: { message: '...', user: {...}, phone: '...', avatar_url: '...' }
    setUser(data.user || data);
    return data;
  }, []);

  const changePassword = useCallback(async (old_password, new_password) => {
    return apiPost(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      old_password,
      new_password,
      new_password_confirm: new_password,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
