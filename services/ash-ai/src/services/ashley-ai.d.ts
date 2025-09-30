export interface CapacityAnalysis {
    can_meet_deadline: boolean;
    confidence: number;
    bottlenecks: string[];
    recommendations: string[];
    estimated_completion: Date;
}
export interface QualityPrediction {
    risk_level: 'low' | 'medium' | 'high';
    confidence: number;
    risk_factors: string[];
    preventive_actions: string[];
}
export interface RouteValidation {
    is_valid: boolean;
    issues: string[];
    optimizations: string[];
    estimated_time: number;
}
export interface StockAlert {
    material: string;
    current_level: number;
    required_level: number;
    days_until_stockout: number;
    urgency: 'low' | 'medium' | 'high';
}
export declare class AshleyAI {
    private openai;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    analyzeCapacityVsDeadline(orderId: string, workspaceId: string): Promise<CapacityAnalysis>;
    predictQualityRisk(orderId: string, workspaceId: string): Promise<QualityPrediction>;
    validateProductionRoute(orderId: string, workspaceId: string): Promise<RouteValidation>;
    generateStockAlerts(workspaceId: string): Promise<StockAlert[]>;
    shutdown(): void;
}
