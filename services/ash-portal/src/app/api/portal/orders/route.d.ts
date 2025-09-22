import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    orders: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    };
}>>;
