import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<any[]> | NextResponse<{
    error: string;
}>>;
