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
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        id: any;
        employee: {
            name: string;
            role: any;
        };
        date: any;
        time_in: any;
        time_out: any;
        status: any;
        type: any;
        timestamp: any;
    };
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
