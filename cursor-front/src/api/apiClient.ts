import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds - sufficient for traditional analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add role header
apiClient.interceptors.request.use(
  (config) => {
    // Get role from localStorage (Zustand persist)
    if (typeof window !== 'undefined') {
      const appStore = localStorage.getItem('app-store');
      if (appStore) {
        try {
          const parsed = JSON.parse(appStore);
          if (parsed.state?.role) {
            config.headers['X-User-Role'] = parsed.state.role;
          }
        } catch (error) {
          console.warn('Failed to parse app store from localStorage:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
