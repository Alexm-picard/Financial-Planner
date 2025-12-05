import axios from 'axios';
import { getAccessTokenSilently } from '@/lib/auth0';

// Use relative URL in production (Nginx will proxy /api/* to backend)
// Use absolute URL in development (Vite dev server on different port)
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    // Get Auth0 access token
    const token = await getAccessTokenSilently();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // If token retrieval fails, continue without token
    // Some endpoints might be public
    console.warn('Failed to get access token:', error);
  }

  // Add userId to query params or body if available
  // This is a workaround until we implement proper Auth0 token verification
  // In production, the backend should extract userId from the verified token
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    // Enhanced error handling for connection issues
    if (!error.response) {
      // Network error - backend not reachable
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        console.error('❌ Cannot connect to backend server');
        console.error(`   URL: ${apiUrl}`);
        console.error('   Is your backend server running?');
        console.error('   Try: http://localhost:5001/api/health');
        return Promise.reject(new Error('Cannot connect to server. Please check your connection and try again.'));
      }
      
      // Timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return Promise.reject(new Error('Request timed out. Please try again.'));
      }
    }
    
    // Handle HTTP status codes
    const status = error.response?.status;
    let message = error.response?.data?.error || error.message || 'An error occurred';
    
    // Provide user-friendly messages for common errors
    if (status === 401) {
      message = 'Please log in again to continue.';
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'Resource not found.';
    } else if (status === 409) {
      // Conflict - usually means duplicate
      message = error.response?.data?.error || 'This value is already taken.';
    } else if (status === 429) {
      message = 'Too many requests. Please try again later.';
    } else if (status >= 500) {
      message = 'Server error. Please try again later.';
    }
    
    console.error('API Error:', {
      message,
      status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    return Promise.reject(new Error(message));
  }
);

export default api;

