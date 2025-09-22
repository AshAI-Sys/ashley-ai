import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    message: string;
}> | NextResponse<{
    success: boolean;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}>>;
