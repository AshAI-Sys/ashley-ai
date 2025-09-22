import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        run_id: string;
        status: any;
        insights: {
            material_utilization: {
                utilization_rate: number;
                waste_percentage: number;
                cost_efficiency: number;
                total_cost?: undefined;
            } | {
                utilization_rate: number;
                waste_percentage: number;
                cost_efficiency: number;
                total_cost: number;
            };
            quality_trend: {
                trend: string;
                score: number;
                confidence: number;
                defect_rate?: undefined;
            } | {
                trend: string;
                score: number;
                defect_rate: number;
                confidence: number;
            };
            efficiency_score: {
                score: number;
                factors: {
                    time: number;
                    quality: number;
                    material: number;
                };
            };
            cost_tracking: {
                material_cost: number;
                labor_cost: number;
                overhead_cost: number;
                total_cost: number;
                estimated_revenue: number;
                profit_margin: number;
            };
            time_prediction: {
                estimated_completion: any;
                confidence: number;
                remaining_minutes?: undefined;
            } | {
                estimated_completion: Date;
                remaining_minutes: number;
                confidence: number;
            };
            risk_factors: any[];
        };
        recommendations: any[];
        performance_score: {
            overall_score: number;
            component_scores: {
                efficiency: any;
                quality: any;
                cost: number;
                time: any;
            };
            grade: string;
        };
    };
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        recommendations: any[];
        confidence_score: number;
        alerts: any[];
    };
}>>;
