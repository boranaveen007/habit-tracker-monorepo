// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { api } from '../features/habits/habitsApi';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login function
  const login = (userData: User, token: string) => {
    // Save to storage (Axios interceptor will read this automatically)
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Update State
    setUser(userData);
  };

  // 3. Logout function
  const logout = () => {
    // Clear storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset State
    setUser(null);
    
    // Optional: Redirect to login or home
    window.location.href = '/login';
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
