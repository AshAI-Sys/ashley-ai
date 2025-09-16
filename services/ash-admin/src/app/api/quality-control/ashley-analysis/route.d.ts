import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    inspection_id: any;
    analysis_type: any;
    ashley_analysis: {};
}>>;
