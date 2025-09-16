"use strict";
const __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    constructor() {
        this.authToken = null;
        this.client = axios_1.default.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            if (this.authToken) {
                config.headers.Authorization = `Bearer ${this.authToken}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid
                this.setAuthToken(null);
                localStorage.removeItem('ash_token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    setAuthToken(token) {
        this.authToken = token;
    }
    // Auth endpoints
    async login(email, password, workspaceSlug) {
        const response = await this.client.post('/api/auth/login', {
            email,
            password,
            workspace_slug: workspaceSlug,
        });
        return response.data;
    }
    async getCurrentUser() {
        const response = await this.client.get('/api/auth/me');
        return response.data;
    }
    async logout() {
        await this.client.post('/api/auth/logout');
    }
    // Clients endpoints
    async getClients(params) {
        const response = await this.client.get('/api/clients', { params });
        return response.data;
    }
    async getClient(id) {
        const response = await this.client.get(`/api/clients/${id}`);
        return response.data;
    }
    async createClient(data) {
        const response = await this.client.post('/api/clients', data);
        return response.data;
    }
    async updateClient(id, data) {
        const response = await this.client.put(`/api/clients/${id}`, data);
        return response.data;
    }
    async deleteClient(id) {
        await this.client.delete(`/api/clients/${id}`);
    }
    async getClientBrands(clientId) {
        const response = await this.client.get(`/api/clients/${clientId}/brands`);
        return response.data;
    }
    async createClientBrand(clientId, data) {
        const response = await this.client.post(`/api/clients/${clientId}/brands`, data);
        return response.data;
    }
    async updateClientBrand(clientId, brandId, data) {
        const response = await this.client.put(`/api/clients/${clientId}/brands/${brandId}`, data);
        return response.data;
    }
    async deleteClientBrand(clientId, brandId) {
        await this.client.delete(`/api/clients/${clientId}/brands/${brandId}`);
    }
    // Orders endpoints
    async getOrders(params) {
        const response = await this.client.get('/api/orders', { params });
        return response.data;
    }
    async getOrder(id) {
        const response = await this.client.get(`/api/orders/${id}`);
        return response.data;
    }
    async createOrder(data) {
        const response = await this.client.post('/api/orders', data);
        return response.data;
    }
    async updateOrder(id, data) {
        const response = await this.client.put(`/api/orders/${id}`, data);
        return response.data;
    }
    async generateOrderRouting(orderId, templateId) {
        const response = await this.client.post(`/api/orders/${orderId}/routing`, {
            template_id: templateId
        });
        return response.data;
    }
    async getOrderRouting(orderId) {
        const response = await this.client.get(`/api/orders/${orderId}/routing`);
        return response.data;
    }
    // Dashboard endpoint
    async getDashboard() {
        const response = await this.client.get('/api/dashboard');
        return response.data;
    }
}
exports.api = new ApiClient();
