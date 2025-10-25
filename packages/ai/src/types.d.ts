export type RiskLevel = "GREEN" | "AMBER" | "RED";
export interface AshleyAnalysis {
    id: string;
    timestamp: Date;
    risk: RiskLevel;
    confidence: number;
    issues: AshleyIssue[];
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface AshleyIssue {
    type: string;
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
    details?: Record<string, unknown>;
}
export interface ProductionValidation {
    isValid: boolean;
    risk: RiskLevel;
    estimatedDays: number;
    estimatedCost: number;
    complexity: "SIMPLE" | "MEDIUM" | "COMPLEX" | "VERY_COMPLEX";
    issues: AshleyIssue[];
    recommendations: string[];
}
export interface ClientRiskAssessment {
    creditRisk: RiskLevel;
    historyScore: number;
    paymentPattern: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
    recommendations: string[];
}
export interface OrderAnalysis {
    feasibility: RiskLevel;
    timelineRisk: RiskLevel;
    costRisk: RiskLevel;
    qualityRisk: RiskLevel;
    overallRisk: RiskLevel;
    estimatedProfit: number;
    estimatedDuration: number;
    keyRisks: AshleyIssue[];
    recommendations: string[];
}
export interface AIProvider {
    name: "openai" | "anthropic" | "local";
    model: string;
    maxTokens?: number;
    temperature?: number;
}
export interface ValidationContext {
    workspaceId: string;
    userId: string;
    stage: string;
    entity: "order" | "client" | "production" | "design" | "qc";
    data: Record<string, unknown>;
}
