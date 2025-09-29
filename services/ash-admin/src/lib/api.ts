import axios, { AxiosInstance } from 'axios'
import { LoginResponse } from '@ash/types'

class ApiClient {
  private client: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.setAuthToken(null)
          localStorage.removeItem('ash_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  // Auth endpoints
  async login(email: string, password: string, workspaceSlug?: string): Promise<LoginResponse> {
    const response = await this.client.post('/api/auth/login', {
      email,
      password,
      workspace_slug: workspaceSlug,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me')
    return response.data
  }

  async logout() {
    await this.client.post('/api/auth/logout')
  }

  // Clients endpoints
  async getClients(params?: {
    page?: number
    limit?: number
    search?: string
    is_active?: boolean
  }) {
    const response = await this.client.get('/api/clients', { params })
    return response.data
  }

  async getClient(id: string) {
    const response = await this.client.get(`/api/clients/${id}`)
    return response.data
  }

  async createClient(data: any) {
    const response = await this.client.post('/api/clients', data)
    return response.data
  }

  async updateClient(id: string, data: any) {
    const response = await this.client.put(`/api/clients/${id}`, data)
    return response.data
  }

  async deleteClient(id: string) {
    await this.client.delete(`/api/clients/${id}`)
  }

  async getClientBrands(clientId: string) {
    const response = await this.client.get(`/api/clients/${clientId}/brands`)
    return response.data
  }

  async createClientBrand(clientId: string, data: any) {
    const response = await this.client.post(`/api/clients/${clientId}/brands`, data)
    return response.data
  }

  async updateClientBrand(clientId: string, brandId: string, data: any) {
    const response = await this.client.put(`/api/clients/${clientId}/brands/${brandId}`, data)
    return response.data
  }

  async deleteClientBrand(clientId: string, brandId: string) {
    await this.client.delete(`/api/clients/${clientId}/brands/${brandId}`)
  }

  // Orders endpoints
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    client_id?: string
    search?: string
  }) {
    const response = await this.client.get('/api/orders', { params })
    return response.data
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/api/orders/${id}`)
    return response.data
  }

  async createOrder(data: any) {
    const response = await this.client.post('/api/orders', data)
    return response.data
  }

  async updateOrder(id: string, data: any) {
    const response = await this.client.put(`/api/orders/${id}`, data)
    return response.data
  }

  async generateOrderRouting(orderId: string, templateId?: string) {
    const response = await this.client.post(`/api/orders/${orderId}/routing`, {
      template_id: templateId
    })
    return response.data
  }

  async getOrderRouting(orderId: string) {
    const response = await this.client.get(`/api/orders/${orderId}/routing`)
    return response.data
  }

  // Dashboard endpoint
  async getDashboard() {
    const response = await this.client.get('/api/dashboard')
    return response.data
  }
}

export const api = new ApiClient()