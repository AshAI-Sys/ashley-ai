import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        total_employees: any;
        active_employees: any;
        present_today: any;
        absent_today: any;
        overtime_requests: any;
        pending_leaves: number;
        total_payroll_cost: any;
        upcoming_payroll: string;
        average_tenure_months: number;
        attendance_rate: number;
        avg_sewing_efficiency: any;
        avg_printing_efficiency: any;
        avg_pieces_per_hour: number;
        department_distribution: any;
        position_distribution: any;
        salary_type_distribution: any;
        last_payroll: {
            period: string;
            employee_count: any;
            status: any;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
