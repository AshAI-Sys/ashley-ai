import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    pending_orders: any;
    in_progress: any;
    completed_today: any;
    packed_today: any;
    efficiency_rate: number;
    packing_efficiency: number;
    period_summary: {
        total_finishing_runs: any;
        completed_runs: any;
        total_cartons: any;
        cartons_today: any;
    };
}> | NextResponse<{
    error: string;
}>>;
