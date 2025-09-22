import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    defect_rate: number;
    first_pass_yield: number;
    cost_of_quality: number;
    customer_complaints: number;
    trend: "up" | "down" | "stable";
    period_summary: {
        total_inspections: any;
        passed_inspections: any;
        failed_inspections: any;
        total_samples: any;
        total_defects: any;
    };
}> | NextResponse<{
    error: string;
}>>;
