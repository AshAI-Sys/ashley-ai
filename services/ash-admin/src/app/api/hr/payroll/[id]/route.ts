/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user, context) => {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Payroll period ID is required" },
        { status: 400 }
      );
    }

    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        earnings: {
          include: {
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                position: true,
                department: true,
                employee_number: true,
              },
            },
          },
          orderBy: {
            employee: {
              last_name: "asc",
            },
          },
        },
      },
    });

    if (!payrollPeriod) {
      return NextResponse.json(
        { success: false, error: "Payroll period not found" },
        { status: 404 }
      );
    }

    // Format the response
    const formattedPeriod = {
      id: payrollPeriod.id,
      period_start: payrollPeriod.period_start.toISOString(),
      period_end: payrollPeriod.period_end.toISOString(),
      status: payrollPeriod.status,
      total_amount: payrollPeriod.total_amount || 0,
      employee_count: payrollPeriod.earnings.length,
      created_at: payrollPeriod.created_at.toISOString(),
      processed_at: payrollPeriod.processed_at?.toISOString() || null,
    };

    const formattedEarnings = payrollPeriod.earnings.map((earning: any) => ({
      id: earning.id,
      employee: {
        id: earning.employee.id,
        first_name: earning.employee.first_name,
        last_name: earning.employee.last_name,
        position: earning.employee.position,
        department: earning.employee.department,
        employee_number: earning.employee.employee_number,
      },
      regular_hours: earning.regular_hours || 0,
      overtime_hours: earning.overtime_hours || 0,
      piece_count: earning.piece_count || 0,
      piece_rate: earning.piece_rate || 0,
      gross_pay: earning.gross_pay || 0,
      deductions: earning.deductions || 0,
      net_pay: earning.net_pay || 0,
      metadata: earning.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: formattedPeriod,
        earnings: formattedEarnings,
      },
    });
  } catch (error) {
    console.error("Error fetching payroll period details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payroll period details" },
      { status: 500 }
    );
  }
});
