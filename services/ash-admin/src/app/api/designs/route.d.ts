import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        designs: any;
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
    asset_id: any;
    message: string;
}>>;
