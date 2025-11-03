import { apiClient } from './client';

export interface Bundle {
  id: string;
  qrCode: string;
  layId: string;
  bundleNumber: number;
  quantity: number;
  status: string;
  createdAt: string;
}

export interface SewingRun {
  id: string;
  orderId: string;
  operatorId: string;
  operatorName?: string;
  startTime: string;
  endTime?: string;
  targetQuantity: number;
  actualQuantity: number;
  efficiency: number;
  status: string;
}

export interface ProductionStats {
  ordersInProgress: number;
  todayProduction: number;
  qcPassRate: number;
  activeOperators: number;
}

export const productionAPI = {
  // Scan bundle by QR code
  getBundleByQR: async (qrCode: string): Promise<Bundle> => {
    return apiClient.get<Bundle>(`/bundles/${qrCode}`);
  },

  // Get production stats
  getStats: async (): Promise<ProductionStats> => {
    return apiClient.get<ProductionStats>('/production/stats');
  },

  // Create sewing run
  createSewingRun: async (data: {
    orderId: string;
    operatorId: string;
    targetQuantity: number;
  }): Promise<SewingRun> => {
    return apiClient.post<SewingRun>('/sewing-runs', data);
  },

  // Update sewing run status
  updateSewingRunStatus: async (id: string, data: {
    status: string;
    actualQuantity?: number;
    endTime?: string;
  }): Promise<SewingRun> => {
    return apiClient.put<SewingRun>(`/sewing-runs/${id}/status`, data);
  },
};
