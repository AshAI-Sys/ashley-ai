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
        marker_name: any;
        marker_width_cm: any;
        lay_length_m: number;
        plies: number;
        gross_used: number;
        offcuts: number;
        defects: number;
        uom: any;
        created_by: any;
        created_at: string;
        updated_at: string;
        status: string;
        order: {
            order_number: string;
            brand: {
                name: string;
                code: string;
            };
        };
        outputs: any;
        ashley_analysis: {
            efficiency_metrics: {
                marker_efficiency: number;
                material_efficiency: number;
                waste_percentage: number;
                cutting_speed: number;
                total_pieces: any;
                ashley_score: number;
            };
            recommendations: string[];
            risk_factors: string[];
            performance_level: string;
            yield_analysis: {
                expected_pieces: number;
                actual_pieces: any;
                yield_variance_percent: number;
                fabric_utilization: number;
            };
            cost_analysis: {
                fabric_cost_per_piece: number;
                waste_cost: number;
                efficiency_rating: string;
            };
        };
    };
    message: string;
    ashley_insights: {
        efficiency_metrics: {
            marker_efficiency: number;
            material_efficiency: number;
            waste_percentage: number;
            cutting_speed: number;
            total_pieces: any;
            ashley_score: number;
        };
        recommendations: string[];
        risk_factors: string[];
        performance_level: string;
        yield_analysis: {
            expected_pieces: number;
            actual_pieces: any;
            yield_variance_percent: number;
            fabric_utilization: number;
        };
        cost_analysis: {
            fabric_cost_per_piece: number;
            waste_cost: number;
            efficiency_rating: string;
        };
    };
    next_steps: {
        create_bundles: boolean;
        bundle_url: string;
        estimated_bundles: number;
    };
}>>;
