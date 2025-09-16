import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        id: any;
        period_start: any;
        period_end: any;
        status: any;
        total_amount: any;
        employee_count: any;
        created_at: any;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        id: any;
        period_start: any;
        period_end: any;
        status: any;
        total_amount: any;
        employee_count: any;
        created_at: any;
        processed_at: any;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
