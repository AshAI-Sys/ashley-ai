/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import {
  cachedQueryWithMetrics,
  CacheKeys,
  CACHE_DURATION,
} from "@/lib/performance/query-cache";

export const dynamic = 'force-dynamic';


// Fixed: Prisma groupBy nullable field issues - using manual grouping instead

export const GET = requireAuth(async (_request: NextRequest, _user) => {
  try {
    // SECURITY: Get user's workspace_id for data isolation
    const workspaceId = _user.workspace_id || _user.workspaceId;
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Cache key based on date
    const cacheKey = CacheKeys.hrStats(workspaceId);

    // Use cached query with 2 minute cache (stats update frequently)
    const stats = await cachedQueryWithMetrics(
      cacheKey,
      async () =>
        await calculateHRStats(
          workspaceId,
          today,
          startOfToday,
          endOfToday,
          thisMonth
        ),
      CACHE_DURATION.STATS // 1 minute cache for stats
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error calculating HR stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate HR statistics" },
      { status: 500 }
    );
  }
})

async function calculateHRStats(
  workspaceId: string,
  today: Date,
  startOfToday: Date,
  endOfToday: Date,
  thisMonth: Date
) {
  // Run all queries in parallel
  const [
    totalEmployees,
    activeEmployees,
    todayAttendance,
    pendingOvertimeRequests,
    pendingLeaveRequests,
    currentMonthPayroll,
    todayAbsences,
    lastPayrollRun,
  ] = await Promise.all([
    // Total employees
    prisma.employee.count({
      where: { workspace_id: workspaceId },
    }),

      // Active employees
    prisma.employee.count({
      where: {
        workspace_id: workspaceId,
        is_active: true,
      },
    }),

      // Today's attendance - employees who checked in
    prisma.attendanceLog.count({
      where: {
        workspace_id: workspaceId,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
        time_in: { not: null },
        status: "APPROVED",
      },
    }),

      // Pending overtime requests - using attendance with overtime
    prisma.attendanceLog.count({
      where: {
        workspace_id: workspaceId,
        overtime_minutes: { gt: 0 },
        status: "PENDING",
      },
    }),

    // Pending leave requests (this would be a separate table in full implementation)
    0, // Mock for now

    // Current month's payroll cost estimate
    prisma.payrollEarning.aggregate({
      where: {
        workspace_id: workspaceId,
        payroll_period: {
          period_start: {
            gte: thisMonth,
          },
        },
      },
      _sum: {
        net_pay: true,
      },
    }),

    // Today's absences (active employees who didn't check in)
    prisma.employee.count({
      where: {
        workspace_id: workspaceId,
        is_active: true,
        attendance: {
          none: {
            date: {
              gte: startOfToday,
              lte: endOfToday,
            },
            time_in: { not: null },
            status: "APPROVED",
          },
        },
      },
    }),

    // Last payroll period
    prisma.payrollPeriod.findFirst({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: {
            earnings: true,
          },
        },
      },
    }),
  ]);

  const presentToday = todayAttendance;
  const absentToday = todayAbsences;

  // Calculate department distribution - using findMany and manual grouping
  const allEmployees = await prisma.employee.findMany({
    where: {
      workspace_id: workspaceId,
      is_active: true,
    },
    take: 500, // Limit to 500 active employees
    select: {
      id: true,
      department: true,
      position: true,
      salary_type: true,
    },
  });

  // Manual grouping to avoid Prisma groupBy issues with nullable fields
  const departmentMap = new Map<string, number>();
  const positionMap = new Map<string, number>();
  const salaryTypeMap = new Map<string, number>();

  allEmployees.forEach((emp: any) => {
    // Count departments
    if (emp.department) {
      departmentMap.set(
        emp.department,
        (departmentMap.get(emp.department) || 0) + 1
      );
    }
    // Count positions
    if (emp.position) {
      positionMap.set(emp.position, (positionMap.get(emp.position) || 0) + 1);
    }
    // Count salary types
    if (emp.salary_type) {
      salaryTypeMap.set(
        emp.salary_type,
        (salaryTypeMap.get(emp.salary_type) || 0) + 1
      );
    }
  });

  // Convert maps to arrays
  const departmentStats = Array.from(departmentMap.entries()).map(
    ([department, count]) => ({
      department,
      _count: { id: count },
    })
  );

  const positionStats = Array.from(positionMap.entries()).map(
    ([position, count]) => ({
      position,
      _count: { id: count },
    })
  );

  const salaryTypeStats = Array.from(salaryTypeMap.entries()).map(
    ([salary_type, count]) => ({
      salary_type,
      _count: { id: count },
    })
  );

  // Calculate average tenure - filter out employees without hire_date manually
  const allEmployeesForTenure = await prisma.employee.findMany({
    where: {
      workspace_id: workspaceId,
      is_active: true,
    },
    take: 500, // Limit to 500 active employees
    select: {
      hire_date: true,
    },
  });

  // Filter out null hire_dates
  const employeesWithTenure = allEmployeesForTenure.filter(
    (emp: any) => emp.hire_date !== null
  );

  let averageTenureMonths = 0;
  if (employeesWithTenure.length > 0) {
    const totalMonths = employeesWithTenure.reduce((sum: any, emp: any) => {
      const months =
        (today.getTime() - emp.hire_date!.getTime()) /
        (1000 * 60 * 60 * 24 * 30.44);
      return sum + months;
    }, 0);
    averageTenureMonths = totalMonths / employeesWithTenure.length;
  }

  // Productivity metrics (from production runs)
  // Note: SewingRun doesn't have pieces_per_hour or efficiency_percentage fields
  // Calculate these manually from qty_good and time
  const sewingRuns = await prisma.sewingRun.findMany({
    where: {
      started_at: {
        gte: thisMonth,
      },
      status: "DONE",
    },
    take: 100, // Limit to last 100 completed runs
    select: {
      qty_good: true,
      qty_reject: true,
      started_at: true,
      ended_at: true,
    },
  });

  // Calculate average efficiency from sewing runs
  const sewingProductivity = {
    _avg: {
      pieces_per_hour:
        sewingRuns.length > 0
          ? sewingRuns.reduce((sum: any, run: any) => {
              if (run.started_at && run.ended_at) {
                const hours =
                  (run.ended_at.getTime() - run.started_at.getTime()) /
                  (1000 * 60 * 60);
                const piecesPerHour =
                  hours > 0 ? (run.qty_good || 0) / hours : 0;
                return sum + piecesPerHour;
              }
              return sum;
            }, 0) / sewingRuns.length
          : 0,
      efficiency_percentage:
        sewingRuns.length > 0
          ? sewingRuns.reduce((sum: any, run: any) => {
              const total = (run.qty_good || 0) + (run.qty_reject || 0);
              const efficiency =
                total > 0 ? ((run.qty_good || 0) / total) * 100 : 0;
              return sum + efficiency;
            }, 0) / sewingRuns.length
          : 0,
    },
  };

  // PrintRun doesn't have operator tracking - use simplified metric
  const printingProductivity = {
    _avg: {
      pieces_per_hour: 0,
      efficiency_percentage: 0,
    },
  };

  // Next payroll date estimation
  const nextPayrollDate = new Date();
  const currentDate = nextPayrollDate.getDate();
  if (currentDate <= 15) {
    nextPayrollDate.setDate(31); // End of month
    if (nextPayrollDate.getDate() !== 31) {
      nextPayrollDate.setDate(0); // Last day of month
    }
  } else {
    nextPayrollDate.setMonth(nextPayrollDate.getMonth() + 1);
    nextPayrollDate.setDate(15);
  }

  return {
    // Basic counts
    total_employees: totalEmployees,
    active_employees: activeEmployees,
    present_today: presentToday,
    absent_today: absentToday,

    // Pending approvals
    overtime_requests: pendingOvertimeRequests,
    pending_leaves: pendingLeaveRequests,

    // Financial
    total_payroll_cost: currentMonthPayroll._sum.net_pay || 0,
    upcoming_payroll: nextPayrollDate.toISOString().split("T")[0],

    // Analytics
    average_tenure_months: Math.round(averageTenureMonths * 10) / 10,
    attendance_rate:
      activeEmployees > 0 ? (presentToday / activeEmployees) * 100 : 0,

    // Productivity
    avg_sewing_efficiency: sewingProductivity._avg.efficiency_percentage || 0,
    avg_printing_efficiency:
      printingProductivity._avg.efficiency_percentage || 0,
    avg_pieces_per_hour:
      ((sewingProductivity._avg.pieces_per_hour || 0) +
        (printingProductivity._avg.pieces_per_hour || 0)) /
      2,

    // Distributions
    department_distribution: departmentStats.map(dept => ({
      department: dept.department,
      count: dept._count.id,
    })),
    position_distribution: positionStats.map(position => ({
      position: position.position,
      count: position._count.id,
    })),
    salary_type_distribution: salaryTypeStats.map(salaryType => ({
      salary_type: salaryType.salary_type,
      count: salaryType._count.id,
    })),

    // Last payroll info
    last_payroll: lastPayrollRun
      ? {
          period: `${lastPayrollRun.period_start.toISOString().split("T")[0]} - ${lastPayrollRun.period_end.toISOString().split("T")[0]}`,
          employee_count: lastPayrollRun._count.earnings,
          status: lastPayrollRun.status,
        }
      : null,
  };
}
