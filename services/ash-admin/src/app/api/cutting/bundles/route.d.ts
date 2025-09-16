import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any[];
    summary: {
        total_bundles: number;
        total_pieces: any;
        status_breakdown: any;
        size_breakdown: any;
    };
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
    data: any[];
    analysis: {
        total_bundles_created: number;
        total_pieces: number;
        size_distribution: Record<string, number>;
        ashley_insights: {
            optimal_bundle_sizes: boolean;
            tracking_efficiency: number;
            sewing_workflow_ready: boolean;
            recommendations: string[];
        };
    };
    message: string;
    next_steps: {
        print_labels: boolean;
        send_to_sewing: boolean;
        track_progress: boolean;
    };
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: any;
    message: string;
}>>;
