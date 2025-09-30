import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        id: string;
        email: string;
        name: string;
        role: string;
        position: string;
        department: string;
        employee_number: string;
    };
    message: string;
}>>;
export declare function GET(): Promise<NextResponse<{
    success: boolean;
    data: {
        id: string;
        created_at: Date;
        email: string;
        role: string;
        first_name: string;
        last_name: string;
        position: string;
        department: string;
        piece_rate: number;
        base_salary: number;
        employee_number: string;
        hire_date: Date;
        salary_type: string;
        last_login: Date;
    }[];
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
