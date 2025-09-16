export interface MaterialDemand {
    materialId: string;
    materialName: string;
    orderId: string;
    requiredQuantity: number;
    requiredDate: Date;
    unit: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}
export interface SupplyPlan {
    materialId: string;
    plannedQuantity: number;
    plannedDate: Date;
    supplier?: string;
    leadTime: number;
    cost: number;
    status: "PLANNED" | "ORDERED" | "SHIPPED" | "RECEIVED";
}
export interface MRPResult {
    materialId: string;
    materialName: string;
    currentStock: number;
    totalDemand: number;
    plannedSupply: number;
    projectedStock: number;
    shortfall: number;
    recommendedAction: "ORDER_NOW" | "ORDER_SOON" | "ADEQUATE" | "EXCESS";
    urgentOrders: string[];
    recommendations: string[];
}
export interface StockProjection {
    date: string;
    beginningStock: number;
    receipts: number;
    demands: number;
    endingStock: number;
    shortfall: number;
    actions: string[];
}
export declare class MaterialRequirementPlanner {
    private workspaceId;
    private planningHorizon;
    constructor(workspaceId: string, planningHorizon?: number);
    generateMRPPlan(orderId?: string): Promise<MRPResult[]>;
    projectStockLevels(materialId: string): Promise<StockProjection[]>;
    createPurchaseRequisition(materialId: string, quantity: number, requiredDate: Date, justification: string): Promise<string>;
    optimizeMaterialPlan(mrpResults: MRPResult[]): Promise<{
        consolidatedOrders: Array<{
            supplier: string;
            materials: Array<{
                materialId: string;
                quantity: number;
                estimatedCost: number;
            }>;
            totalCost: number;
            recommendedDate: Date;
        }>;
        savings: {
            consolidationSavings: number;
            bulkDiscountSavings: number;
            totalSavings: number;
        };
    }>;
    private getMaterialDemands;
    private getCurrentInventory;
    private getPlannedSupplies;
    private groupDemandsByMaterial;
    private calculateMaterialRequirement;
    private getMaterialDemandsForPeriod;
    private getPlannedSuppliesForPeriod;
}
