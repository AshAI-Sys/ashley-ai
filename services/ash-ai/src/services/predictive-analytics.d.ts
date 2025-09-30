interface PredictionResult {
    type: string;
    confidence: number;
    recommendation: string;
    data: any;
}
export declare class PredictiveAnalyticsService {
    private openai;
    constructor();
    validateCapacityVsDeadline(workspaceId: string, orderId: string): Promise<PredictionResult>;
    predictQualityIssues(workspaceId: string, bundleId: string): Promise<PredictionResult>;
    analyzeEmployeeFatigue(workspaceId: string): Promise<PredictionResult>;
    predictMaintenance(workspaceId: string): Promise<PredictionResult>;
    generateInsightsDashboard(workspaceId: string): Promise<any>;
    private getCapacityInsights;
    private getQualityInsights;
    private extractHighPriorityAlerts;
    private generateActionItems;
}
export {};
