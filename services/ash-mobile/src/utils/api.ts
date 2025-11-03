import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants/config';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Token will be added by AuthContext when making authenticated requests
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);

      // Handle 401 Unauthorized (token expired)
      if (error.response.status === 401) {
        // TODO: Handle logout and redirect to login
        console.log('Unauthorized - Token may be expired');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to create authenticated request config
export const createAuthConfig = (token: string): AxiosRequestConfig => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
