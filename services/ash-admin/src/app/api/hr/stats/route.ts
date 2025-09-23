import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    const endOfToday = new Date(today.setHours(23, 59, 59, 999))
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Run all queries in parallel
    const [
      totalEmployees,
      activeEmployees,
      todayAttendance,
      pendingOvertimeRequests,
      pendingLeaveRequests,
      currentMonthPayroll,
      todayAbsences,
      lastPayrollRun
    ] = await Promise.all([
      // Total employees
      prisma.employee.count({
        where: { workspace_id: 'default' }
      }),

      // Active employees
      prisma.employee.count({
        where: {
          workspace_id: 'default',
          is_active: true
        }
      }),

      // Today's attendance - employees who checked in
      prisma.attendanceLog.count({
        where: {
          workspace_id: 'default',
          date: {
            gte: startOfToday,
            lte: endOfToday
          },
          time_in: { not: null },
          status: 'APPROVED'
        }
      }),

      // Pending overtime requests - using attendance with overtime
      prisma.attendanceLog.count({
        where: {
          workspace_id: 'default',
          overtime_minutes: { gt: 0 },
          status: 'PENDING'
        }
      }),

      // Pending leave requests (this would be a separate table in full implementation)
      0, // Mock for now

      // Current month's payroll cost estimate
      prisma.payrollEarning.aggregate({
        where: {
          workspace_id: 'default',
          payroll_period: {
            period_start: {
              gte: thisMonth
            }
          }
        },
        _sum: {
          net_pay: true
        }
      }),

      // Today's absences (active employees who didn't check in)
      prisma.employee.count({
        where: {
          workspace_id: 'default',
          is_active: true,
          attendance: {
            none: {
              date: {
                gte: startOfToday,
                lte: endOfToday
              },
              time_in: { not: null },
              status: 'APPROVED'
            }
          }
        }
      }),

      // Last payroll period
      prisma.payrollPeriod.findFirst({
        where: { workspace_id: 'default' },
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              earnings: true
            }
          }
        }
      })
    ])

    const presentToday = todayAttendance
    const absentToday = todayAbsences

    // Calculate department distribution
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      where: {
        workspace_id: 'default',
        is_active: true
      },
      _count: {
        id: true
      }
    })

    // Calculate position distribution
    const positionStats = await prisma.employee.groupBy({
      by: ['position'],
      where: {
        workspace_id: 'default',
        is_active: true
      },
      _count: {
        id: true
      }
    })

    // Calculate salary type distribution
    const salaryTypeStats = await prisma.employee.groupBy({
      by: ['salary_type'],
      where: {
        workspace_id: 'default',
        is_active: true
      },
      _count: {
        id: true
      }
    })

    // Calculate average tenure
    const employeesWithTenure = await prisma.employee.findMany({
      where: {
        workspace_id: 'default',
        is_active: true,
        hire_date: { not: null }
      },
      select: {
        hire_date: true
      }
    })

    let averageTenureMonths = 0
    if (employeesWithTenure.length > 0) {
      const totalMonths = employeesWithTenure.reduce((sum, emp) => {
        const months = (today.getTime() - emp.hire_date!.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        return sum + months
      }, 0)
      averageTenureMonths = totalMonths / employeesWithTenure.length
    }

    // Productivity metrics (from production runs)
    const [sewingProductivity, printingProductivity] = await Promise.all([
      prisma.sewingRunOperator.aggregate({
        where: {
          sewing_run: {
            start_time: {
              gte: thisMonth
            }
          }
        },
        _avg: {
          pieces_per_hour: true,
          efficiency_percentage: true
        }
      }),
      prisma.printRunOperator.aggregate({
        where: {
          print_run: {
            start_time: {
              gte: thisMonth
            }
          }
        },
        _avg: {
          pieces_per_hour: true,
          efficiency_percentage: true
        }
      })
    ])

    // Next payroll date estimation
    const nextPayrollDate = new Date()
    const currentDate = nextPayrollDate.getDate()
    if (currentDate <= 15) {
      nextPayrollDate.setDate(31) // End of month
      if (nextPayrollDate.getDate() !== 31) {
        nextPayrollDate.setDate(0) // Last day of month
      }
    } else {
      nextPayrollDate.setMonth(nextPayrollDate.getMonth() + 1)
      nextPayrollDate.setDate(15)
    }

    return NextResponse.json({
      success: true,
      data: {
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
        upcoming_payroll: nextPayrollDate.toISOString().split('T')[0],

        // Analytics
        average_tenure_months: Math.round(averageTenureMonths * 10) / 10,
        attendance_rate: activeEmployees > 0 ? (presentToday / activeEmployees) * 100 : 0,

        // Productivity
        avg_sewing_efficiency: sewingProductivity._avg.efficiency_percentage || 0,
        avg_printing_efficiency: printingProductivity._avg.efficiency_percentage || 0,
        avg_pieces_per_hour: ((sewingProductivity._avg.pieces_per_hour || 0) +
                               (printingProductivity._avg.pieces_per_hour || 0)) / 2,

        // Distributions
        department_distribution: departmentStats.map(dept => ({
          department: dept.department,
          count: dept._count.id
        })),
        position_distribution: positionStats.map(position => ({
          position: position.position,
          count: position._count.id
        })),
        salary_type_distribution: salaryTypeStats.map(salaryType => ({
          salary_type: salaryType.salary_type,
          count: salaryType._count.id
        })),

        // Last payroll info
        last_payroll: lastPayrollRun ? {
          period: `${lastPayrollRun.period_start.toISOString().split('T')[0]} - ${lastPayrollRun.period_end.toISOString().split('T')[0]}`,
          employee_count: lastPayrollRun._count.earnings,
          status: lastPayrollRun.status
        } : null
      }
    })

  } catch (error) {
    console.error('Error calculating HR stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate HR statistics' },
      { status: 500 }
    )
  }
}