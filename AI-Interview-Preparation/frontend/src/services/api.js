
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ai-interview-delta-seven.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach the backend JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Log authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        'Authentication failed:',
        error.response?.data?.message ||
          'Backend rejected the request.'
      );
    }

    return Promise.reject(error);
  }
);

export default api;