import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_assessment_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error message extraction and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired or invalid, clear local auth
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('smart_assessment_token');
        localStorage.removeItem('smart_assessment_user');
        window.location.href = '/login';
      }
    }
    let message = 'An unexpected error occurred. Please check your network connection or server status.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        const titleMatch = error.response.data.match(/<title>(.*?)<\/title>/i);
        message = titleMatch ? titleMatch[1] : error.response.data.slice(0, 150);
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.error) {
        message = typeof error.response.data.error === 'string' ? error.response.data.error : JSON.stringify(error.response.data.error);
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
