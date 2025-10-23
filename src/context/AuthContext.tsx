'use client';

import { fetchUser } from '@/lib/api';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from "@/types/user"; // Import User interface from types/user.ts
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null; // Added token to AuthContextType
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Added token state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = sessionStorage.getItem('authToken');
      if (storedToken) {
        try {
          const userData = await fetchUser(storedToken);
          setToken(storedToken); // Set token state
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to validate token', error);
          toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
    sessionStorage.removeItem('authToken');
          setToken(null); // Clear token state on error
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = (newToken: string, userData: User) => {
    sessionStorage.setItem('authToken', newToken);
    setToken(newToken); // Set token state on login
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    setToken(null); // Clear token state on logout
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  // Do not render children until the token validation is complete
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}