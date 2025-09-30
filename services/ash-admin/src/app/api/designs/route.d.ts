import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        designs: {
            id: string;
            name: string;
            method: string;
            status: string;
            current_version: number;
            is_best_seller: boolean;
            created_at: string;
            updated_at: string;
            order: {
                id: string;
                order_number: string;
                status: string;
            };
            brand: {
                id: string;
                name: string;
                code: string;
            };
            versions: {
                id: string;
                version: number;
                files: string;
                created_at: string;
            }[];
            approvals: {
                id: string;
                status: string;
                created_at: string;
                client: {
                    name: string;
                };
            }[];
            _count: {
                versions: number;
                approvals: number;
                checks: number;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        design: any;
    };
    message: string;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
