import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    trends: any;
    stats: {
        total: any;
        by_category: any;
        by_type: any;
        avg_impact: number;
        avg_confidence: number;
    };
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    trends: any[];
    count: number;
}> | NextResponse<{
    trend: any;
}>>;
