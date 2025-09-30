import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        active_runs: any;
        todays_runs: any;
        quality_rate: number;
        total_produced: any;
        method_breakdown: any;
        recent_rejects: any;
        machine_utilization: any;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
