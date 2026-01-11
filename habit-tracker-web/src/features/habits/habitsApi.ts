// src/features/habits/habitsApi.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// 1. Request Interceptor: Auto-attaches token from storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: Redirect to login if not already there
      if (window.location.pathname !== '/login') {
         window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

