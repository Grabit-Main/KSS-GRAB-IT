import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grabit_seller_access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If uploading FormData, delete Content-Type to let browser set boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('grabit_seller_refresh');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/sellers/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem('grabit_seller_access', newAccessToken);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // Token refresh failed - clear storage & redirect to login
          localStorage.removeItem('grabit_seller_access');
          localStorage.removeItem('grabit_seller_refresh');
          localStorage.removeItem('grabit_seller_profile');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      } else {
        // No refresh token available - redirect to login
        localStorage.removeItem('grabit_seller_access');
        localStorage.removeItem('grabit_seller_profile');
        if (window.location.pathname.startsWith('/seller')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
