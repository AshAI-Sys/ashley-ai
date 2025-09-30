import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        warning: string;
        backup_codes_remaining: number;
        auth_token: string;
        device_token: any;
    };
    message: string;
}>>;
