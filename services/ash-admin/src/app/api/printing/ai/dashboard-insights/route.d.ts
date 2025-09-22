import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        overall_performance_grade: string;
        overall_performance_score: number;
        active_runs_insights: {
            total_active: number;
            high_risk_runs: number;
            optimization_opportunities: number;
            avg_efficiency: number;
        };
        recommendations: any[];
        performance_trends: {
            efficiency_trend: "up" | "down" | "stable";
            quality_trend: "up" | "down" | "stable";
            cost_trend: "up" | "down" | "stable";
            efficiency_change: number;
            quality_change: number;
            cost_change: number;
        };
        method_performance: {};
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
