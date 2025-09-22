import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    client: {
        id: any;
        name: any;
        email: any;
        workspace: {
            id: any;
            name: any;
            slug: any;
        };
    };
}>>;
