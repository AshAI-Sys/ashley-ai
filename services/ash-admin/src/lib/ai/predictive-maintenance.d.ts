interface MaintenanceData {
    asset_id: string;
    asset_name: string;
    runtime_hours: number;
    temperature: number;
    vibration_level: number;
    noise_level: number;
    last_maintenance: Date;
    failure_history: Array<{
        date: Date;
        type: string;
        downtime_hours: number;
    }>;
}
interface PredictionResult {
    asset_id: string;
    asset_name: string;
    failure_probability: number;
    predicted_failure_date: Date | null;
    risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    recommended_actions: string[];
    confidence: number;
    factors: Array<{
        name: string;
        impact: number;
        value: number;
        threshold: number;
    }>;
}
export declare class PredictiveMaintenanceAI {
    predictFailure(data: MaintenanceData): Promise<PredictionResult>;
    predictAllAssets(assets: MaintenanceData[]): Promise<PredictionResult[]>;
    private calculateRuntimeRisk;
    private calculateTemperatureRisk;
    private calculateVibrationRisk;
    private calculateNoiseRisk;
    private calculateHistoryRisk;
    private determineRiskLevel;
    private estimateFailureDate;
    private generateRecommendations;
    private calculateConfidence;
    optimizeSchedule(predictions: PredictionResult[], maintenanceCrew?: number): Promise<{
        schedule: Array<{
            date: Date;
            assets: string[];
            priority: string;
            estimated_hours: number;
        }>;
        totalCost: number;
        preventedDowntime: number;
    }>;
}
export declare const predictiveMaintenanceAI: PredictiveMaintenanceAI;
export {};
