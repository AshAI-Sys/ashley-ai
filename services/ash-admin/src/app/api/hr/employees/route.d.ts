import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        id: any;
        name: string;
        employee_number: any;
        position: any;
        department: any;
        hire_date: any;
        salary_type: any;
        base_salary: any;
        piece_rate: any;
        status: string;
        contact_info: any;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
