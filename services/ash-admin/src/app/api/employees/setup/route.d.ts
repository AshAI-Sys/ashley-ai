import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        id: any;
        email: any;
        name: string;
        role: any;
        position: any;
        department: any;
        employee_number: any;
    };
    message: string;
}>>;
export declare function GET(): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
