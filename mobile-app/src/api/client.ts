import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Base URL - Update this to your Ashley AI backend
const API_BASE_URL = 'http://192.168.1.6:3001/api';

interface TokenStorage {
  accessToken: string | null;
  refreshToken: string | null;
}

class APIClient {
  private client: AxiosInstance;
  private tokens: TokenStorage = {
    accessToken: null,
    refreshToken: null,
  };

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.tokens.accessToken) {
          await this.loadTokens();
        }

        if (this.tokens.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried, try refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Load tokens from secure storage
  private async loadTokens(): Promise<void> {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      this.tokens = { accessToken, refreshToken };
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  // Save tokens to secure storage
  private async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      this.tokens = { accessToken, refreshToken };
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.tokens.refreshToken,
      });

      const { accessToken, refreshToken } = response.data;
      await this.saveTokens(accessToken, refreshToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Login method
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      await this.saveTokens(accessToken, refreshToken);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      this.tokens = { accessToken: null, refreshToken: null };
    }
  }

  // Generic GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
