interface ProductionMetrics {
    station_id: string;
    station_name: string;
    station_type: "CUTTING" | "PRINTING" | "SEWING" | "QC" | "FINISHING";
    current_throughput: number;
    expected_throughput: number;
    queue_length: number;
    avg_wait_time_minutes: number;
    utilization_rate: number;
    operator_count: number;
    active_operators: number;
    defect_rate: number;
    timestamp: Date;
}
interface BottleneckDetection {
    is_bottleneck: boolean;
    severity: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    bottleneck_score: number;
    impact: {
        throughput_loss_percent: number;
        estimated_delay_hours: number;
        affected_orders: number;
        cost_impact_php: number;
    };
    root_causes: Array<{
        cause: string;
        confidence: number;
        description: string;
    }>;
    recommendations: Array<{
        action: string;
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
        estimated_impact: string;
        implementation_cost: "LOW" | "MEDIUM" | "HIGH";
    }>;
    station_metrics: ProductionMetrics;
}
interface SystemBottleneckAnalysis {
    detected_bottlenecks: BottleneckDetection[];
    primary_bottleneck: BottleneckDetection | null;
    overall_efficiency: number;
    system_throughput: number;
    optimal_throughput: number;
    efficiency_loss_percent: number;
    critical_path: string[];
    recommendations: string[];
    predicted_completion_delays: Array<{
        order_id: string;
        expected_delay_hours: number;
        reason: string;
    }>;
}
export declare class BottleneckDetectionAI {
    private readonly THRESHOLDS;
    detectStationBottleneck(metrics: ProductionMetrics): Promise<BottleneckDetection>;
    analyzeProductionSystem(allMetrics: ProductionMetrics[]): Promise<SystemBottleneckAnalysis>;
    private calculateThroughputLoss;
    private calculateQueuePressure;
    private calculateWaitTimeImpact;
    private calculateUtilizationIssue;
    private calculateQualityImpact;
    private determineSeverity;
    private identifyRootCauses;
    private calculateImpact;
    private generateRecommendations;
    private identifyCriticalPath;
    private generateSystemRecommendations;
    private predictCompletionDelays;
    analyzeBottleneckTrends(historicalMetrics: Array<{
        timestamp: Date;
        metrics: ProductionMetrics[];
    }>): Promise<{
        trend: "IMPROVING" | "STABLE" | "WORSENING";
        trend_analysis: string;
        historical_bottlenecks: Array<{
            timestamp: Date;
            bottleneck_count: number;
            worst_severity: string;
            primary_station: string;
        }>;
        recommendations: string[];
    }>;
}
export declare const bottleneckDetectionAI: BottleneckDetectionAI;
export {};
