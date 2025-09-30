import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        total_employees: number;
        employees: {
            employeeId: string;
            name: string;
            email: string;
            password: string;
            role: string;
            position: string;
            department: string;
            access: string;
        }[];
        note: string;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
