import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        orders: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: any;
    message: string;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: any;
    message: string;
}>>;
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
