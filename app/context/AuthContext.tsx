"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types'; // Import User type

interface AuthContextType {
  token: string | null;
  user: User | null; // Use User type
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Use User type

  // Load token and user from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log("AuthContext: login called with user:", newUser);
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken); // Store token
    localStorage.setItem('authUser', JSON.stringify(newUser)); // Store user
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken'); // Remove token
    localStorage.removeItem('authUser'); // Remove user
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};