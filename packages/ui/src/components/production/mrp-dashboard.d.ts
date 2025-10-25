import * as React from "react";
export interface MRPItem {
    id: string;
    materialName: string;
    currentStock: number;
    totalDemand: number;
    plannedSupply: number;
    projectedStock: number;
    shortfall: number;
    unit: string;
    reorderPoint: number;
    minimumStock: number;
    recommendedAction: "ORDER_NOW" | "ORDER_SOON" | "ADEQUATE" | "EXCESS";
    urgentOrders: Array<{
        id: string;
        orderNumber: string;
        requiredDate: Date;
        quantity: number;
    }>;
    supplier?: string;
    leadTime: number;
    costPerUnit: number;
}
export interface StockProjectionData {
    date: string;
    beginningStock: number;
    receipts: number;
    demands: number;
    endingStock: number;
    shortfall: number;
    actions: string[];
}
export interface MRPDashboardProps {
    materials: MRPItem[];
    projections?: StockProjectionData[];
    selectedMaterial?: string;
    onMaterialSelect?: (materialId: string) => void;
    onCreatePurchaseOrder?: (materialId: string, quantity: number) => void;
    onOptimizePlan?: () => void;
    className?: string;
}
export declare const MRPDashboard: React.ForwardRefExoticComponent<MRPDashboardProps & React.RefAttributes<HTMLDivElement>>;
