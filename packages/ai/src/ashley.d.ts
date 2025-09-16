import { type AIProviderConfig } from "./providers";
import type { AshleyAnalysis, ProductionValidation, ClientRiskAssessment, OrderAnalysis } from "./types";
export interface AshleyConfig {
    provider: "openai" | "anthropic";
    config: AIProviderConfig;
    enableCaching?: boolean;
    cacheTTL?: number;
}
export declare class Ashley {
    private provider;
    private enableCaching;
    private cacheTTL;
    constructor(config: AshleyConfig);
    validateOrderIntake(workspaceId: string, userId: string, orderData: unknown): Promise<OrderAnalysis>;
    assessClientRisk(workspaceId: string, userId: string, clientData: unknown): Promise<ClientRiskAssessment>;
    validateProduction(workspaceId: string, userId: string, productionData: unknown): Promise<ProductionValidation>;
    analyzeDesignFeasibility(workspaceId: string, userId: string, designData: unknown): Promise<AshleyAnalysis>;
    performQualityCheck(workspaceId: string, userId: string, qcData: unknown): Promise<AshleyAnalysis>;
    private getOrCreateAnalysis;
    private performAnalysis;
    private getCachedAnalysis;
    private cacheAnalysis;
    private saveAnalysis;
    private generateCacheKey;
    private calculateTimelineRisk;
    private calculateCostRisk;
    private calculateEstimatedProfit;
    private calculateDuration;
    private calculateClientHistoryScore;
    private determinePaymentPattern;
}
