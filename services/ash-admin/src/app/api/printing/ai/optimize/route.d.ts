import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        recommendations: any[];
        confidence_score: number;
        estimated_completion_time: number;
        cost_prediction: number;
        quality_prediction: number;
        material_efficiency: number;
        factors: {
            quantity_efficiency: number;
            material_optimization: number;
            machine_efficiency: number;
            historical_performance: number;
        };
        analysis_id: any;
    };
}>>;
