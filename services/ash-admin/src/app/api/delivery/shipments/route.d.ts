import { NextRequest, NextResponse } from 'next/server';
export declare function GET(_request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any[];
    message: string;
}>>;
export declare function POST(_request: NextRequest): Promise<NextResponse<{
    success: boolean;
    message: string;
}>>;
