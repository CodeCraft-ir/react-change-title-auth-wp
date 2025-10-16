'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthTokens } from '@/types/auth';
import { isTokenExpired } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const storedUserId = localStorage.getItem('user_id');

    if (accessToken && storedUserId) {
      if (isTokenExpired(accessToken)) {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserId(null);
        // Optionally, redirect to login here if not handled by useProtectedRoute
      } else {
        setIsAuthenticated(true);
        setUserId(parseInt(storedUserId, 10));
      }
    }
  }, []);

  const login = (tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('user_id', tokens.user_id.toString());
    setIsAuthenticated(true);
    setUserId(tokens.user_id);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};