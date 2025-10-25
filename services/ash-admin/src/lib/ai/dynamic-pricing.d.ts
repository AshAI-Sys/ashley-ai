interface PricingFactors {
    order_id?: string;
    client_id: string;
    product_type: string;
    quantity: number;
    complexity: "SIMPLE" | "MODERATE" | "COMPLEX" | "VERY_COMPLEX";
    material_cost: number;
    labor_hours_estimate: number;
    deadline_days: number;
    season?: "PEAK" | "NORMAL" | "LOW";
    client_history?: {
        total_orders: number;
        total_revenue: number;
        average_margin: number;
        payment_reliability: number;
    };
}
interface PricingRecommendation {
    recommended_price: number;
    minimum_price: number;
    optimal_price: number;
    maximum_price: number;
    confidence: number;
    margin_percentage: number;
    expected_profit: number;
    pricing_factors: Array<{
        factor: string;
        impact: "INCREASE" | "DECREASE" | "NEUTRAL";
        weight: number;
        value: string;
    }>;
    recommendations: string[];
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    competitor_benchmark?: number;
}
interface MarketConditions {
    demand_level: "LOW" | "NORMAL" | "HIGH" | "VERY_HIGH";
    capacity_utilization: number;
    material_price_trend: "FALLING" | "STABLE" | "RISING";
    competitor_avg_price?: number;
    seasonal_multiplier: number;
}
export declare class DynamicPricingAI {
    private readonly BASE_LABOR_RATE;
    private readonly OVERHEAD_PERCENTAGE;
    private readonly TARGET_MARGIN;
    private readonly RUSH_FEE_MULTIPLIER;
    calculatePricing(factors: PricingFactors, marketConditions: MarketConditions): Promise<PricingRecommendation>;
    private calculateBaseCost;
    private getComplexityMultiplier;
    private getQuantityAdjustment;
    private getClientRelationshipFactor;
    private getMarketDemandFactor;
    private getUrgencyFactor;
    private calculateConfidence;
    private analyzePricingFactors;
    private generateRecommendations;
    private assessPricingRisk;
    analyzePricingScenarios(baseFactors: PricingFactors, market: MarketConditions): Promise<{
        conservative: PricingRecommendation;
        recommended: PricingRecommendation;
        aggressive: PricingRecommendation;
    }>;
    analyzeHistoricalPricing(orders: Array<{
        client_id: string;
        product_type: string;
        quantity: number;
        quoted_price: number;
        actual_cost: number;
        accepted: boolean;
    }>): Promise<{
        average_margin: number;
        acceptance_rate: number;
        price_elasticity: number;
        optimal_margin_range: {
            min: number;
            max: number;
        };
        insights: string[];
    }>;
}
export declare const dynamicPricingAI: DynamicPricingAI;
export {};
