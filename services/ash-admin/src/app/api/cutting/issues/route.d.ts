import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any[];
    total: number;
}> | NextResponse<{
    success: boolean;
    error: string;
    data: any[];
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        id: string;
        workspace_id: string;
        order_id: any;
        batch_id: any;
        qty_issued: number;
        uom: any;
        issued_by: any;
        created_at: string;
        order: {
            order_number: string;
            brand: {
                name: string;
                code: string;
            };
        };
        batch: {
            lot_no: string;
            gsm: number;
            width_cm: number;
            color: string;
        };
        ashley_analysis: {
            estimated_pieces: number;
            efficiency_score: number;
            recommendations: string[];
            risk_factors: any[];
            utilization_forecast: string;
        };
    };
    message: string;
    ashley_insights: {
        estimated_pieces: number;
        efficiency_score: number;
        recommendations: string[];
        risk_factors: any[];
        utilization_forecast: string;
    };
}>>;
