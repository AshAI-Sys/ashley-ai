import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    client: {
        id: string;
        name: string;
        email: string;
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
    };
}>>;
