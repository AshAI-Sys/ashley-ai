import { NextRequest, NextResponse } from 'next/server';
export declare const GET: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../../lib/error-handling").ApiResponse<any>>>;
export declare const POST: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../../lib/error-handling").ApiResponse<{
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
}>>>;
export declare const PUT: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../../lib/error-handling").ApiResponse<any>>>;
