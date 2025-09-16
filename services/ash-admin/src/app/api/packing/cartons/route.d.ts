import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    cartons: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
    };
}> | NextResponse<{
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<any>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<any>>;
