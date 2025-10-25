import { NextRequest, NextResponse } from "next/server";
export declare function GET(_request: NextRequest): Promise<NextResponse<{
    success: boolean;
    shipments: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message: string;
}>>;
export declare function POST(_request: NextRequest): Promise<NextResponse<{
    success: boolean;
    message: string;
}>>;
