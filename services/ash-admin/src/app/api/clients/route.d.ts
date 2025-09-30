import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        clients: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        id: string;
        name: string;
        contact_person: string;
        email: string;
        phone: string;
        address: string;
        tax_id: string;
        payment_terms: number;
        credit_limit: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        _count: {
            orders: number;
            brands: number;
        };
    };
    message: string;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: any;
    message: string;
}>>;
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
