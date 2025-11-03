import { apiClient } from './client';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName?: string;
  status: string;
  quantity: number;
  dueDate: string;
  createdAt: string;
}

export interface OrderDetails extends Order {
  lineItems: OrderLineItem[];
  productionProgress: {
    cutting: number;
    printing: number;
    sewing: number;
    qc: number;
    finishing: number;
    delivery: number;
  };
}

export interface OrderLineItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const ordersAPI = {
  // Get orders list with pagination
  getOrders: async (params: { page?: number; limit?: number } = {}): Promise<OrdersListResponse> => {
    const { page = 1, limit = 20 } = params;
    return apiClient.get<OrdersListResponse>(`/orders?page=${page}&limit=${limit}`);
  },

  // Get order details by ID
  getOrderById: async (id: string): Promise<OrderDetails> => {
    return apiClient.get<OrderDetails>(`/orders/${id}`);
  },

  // Get order line items
  getOrderLineItems: async (orderId: string): Promise<OrderLineItem[]> => {
    return apiClient.get<OrderLineItem[]>(`/orders/${orderId}/line-items`);
  },
};
