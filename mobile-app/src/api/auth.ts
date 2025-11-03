import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    workspaceId: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
}

export const authAPI = {
  // Login with email and password
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.login(credentials.email, credentials.password);
  },

  // Logout current user
  logout: async (): Promise<void> => {
    return apiClient.logout();
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },
};
