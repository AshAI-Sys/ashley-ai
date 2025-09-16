import { LoginResponse } from '@ash/types';
declare class ApiClient {
    private client;
    private authToken;
    constructor();
    setAuthToken(token: string | null): void;
    login(email: string, password: string, workspaceSlug?: string): Promise<LoginResponse>;
    getCurrentUser(): Promise<any>;
    logout(): Promise<void>;
    getClients(params?: {
        page?: number;
        limit?: number;
        search?: string;
        is_active?: boolean;
    }): Promise<any>;
    getClient(id: string): Promise<any>;
    createClient(data: any): Promise<any>;
    updateClient(id: string, data: any): Promise<any>;
    deleteClient(id: string): Promise<void>;
    getClientBrands(clientId: string): Promise<any>;
    createClientBrand(clientId: string, data: any): Promise<any>;
    updateClientBrand(clientId: string, brandId: string, data: any): Promise<any>;
    deleteClientBrand(clientId: string, brandId: string): Promise<void>;
    getOrders(params?: {
        page?: number;
        limit?: number;
        status?: string;
        client_id?: string;
        search?: string;
    }): Promise<any>;
    getOrder(id: string): Promise<any>;
    createOrder(data: any): Promise<any>;
    updateOrder(id: string, data: any): Promise<any>;
    generateOrderRouting(orderId: string, templateId?: string): Promise<any>;
    getOrderRouting(orderId: string): Promise<any>;
    getDashboard(): Promise<any>;
}
export declare const api: ApiClient;
export {};
