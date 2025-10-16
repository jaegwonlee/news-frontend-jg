'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the user data structure
interface User {
  id: number;
  nickname: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Assume an endpoint to get user info from token
          const res = await fetch('https://news-buds.onrender.com/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData.user); // Assuming the response is { user: { ... } }
            setIsAuthenticated(true);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to validate token', error);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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