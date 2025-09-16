import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    user: {
        id: string;
        email: any;
        name: string;
        role: string;
    };
    token: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
