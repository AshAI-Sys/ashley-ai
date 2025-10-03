import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_WORKSPACE_ID = 'demo-workspace-1'

/**
 * Mobile Dashboard Stats API
 * Returns personalized stats for the current production worker
 */
export async function GET(request: NextRequest) {
  try {
    // In production, get employee_id from session/auth
    // For now, using demo employee or first employee
    const employee = await prisma.employee.findFirst({
      where: {
        workspace_id: DEFAULT_WORKSPACE_ID,
        is_active: true,
      },
      orderBy: { created_at: 'asc' },
    })

    if (!employee) {
      return NextResponse.json({
        success: true,
        data: {
          tasks_pending: 0,
          tasks_completed_today: 0,
          pieces_produced_today: 0,
          efficiency_percentage: 0,
          current_shift: 'Day Shift',
          hours_worked_today: 0,
        },
      })
    }

    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    const endOfToday = new Date(today.setHours(23, 59, 59, 999))

    // Run all queries in parallel
    const [
      attendance,
      sewingOperatorStats,
      printOperatorStats,
    ] = await Promise.all([
      // Today's attendance
      prisma.attendanceLog.findFirst({
        where: {
          employee_id: employee.id,
          date: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // Sewing production stats
      prisma.sewingRunOperator.aggregate({
        where: {
          employee_id: employee.id,
          sewing_run: {
            start_time: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        },
        _sum: {
          pieces_completed: true,
        },
        _avg: {
          efficiency_percentage: true,
        },
      }),

      // Print production stats
      prisma.printRunOperator.aggregate({
        where: {
          employee_id: employee.id,
          print_run: {
            start_time: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        },
        _sum: {
          pieces_completed: true,
        },
        _avg: {
          efficiency_percentage: true,
        },
      }),
    ])

    // Calculate total pieces produced today
    const sewingPieces = sewingOperatorStats._sum.pieces_completed || 0
    const printPieces = printOperatorStats._sum.pieces_completed || 0
    const totalPieces = sewingPieces + printPieces

    // Calculate average efficiency
    const sewingEfficiency = sewingOperatorStats._avg.efficiency_percentage || 0
    const printEfficiency = printOperatorStats._avg.efficiency_percentage || 0
    const avgEfficiency = sewingPieces > 0 || printPieces > 0
      ? ((sewingEfficiency * sewingPieces) + (printEfficiency * printPieces)) / totalPieces
      : 0

    // Calculate hours worked today
    let hoursWorked = 0
    if (attendance) {
      if (attendance.time_in) {
        const timeIn = new Date(attendance.time_in)
        const timeOut = attendance.time_out ? new Date(attendance.time_out) : new Date()
        const breakMinutes = attendance.break_minutes || 0
        const workedMinutes = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60) - breakMinutes
        hoursWorked = workedMinutes / 60
      }
    }

    // Determine current shift based on time
    const currentHour = new Date().getHours()
    let currentShift = 'Day Shift'
    if (currentHour >= 6 && currentHour < 14) {
      currentShift = 'Morning Shift'
    } else if (currentHour >= 14 && currentHour < 22) {
      currentShift = 'Afternoon Shift'
    } else if (currentHour >= 22 || currentHour < 6) {
      currentShift = 'Night Shift'
    }

    // Count pending tasks
    const [pendingSewingTasks, pendingPrintTasks] = await Promise.all([
      prisma.sewingRunOperator.count({
        where: {
          employee_id: employee.id,
          sewing_run: {
            status: {
              in: ['in_progress', 'pending'],
            },
          },
        },
      }),
      prisma.printRunOperator.count({
        where: {
          employee_id: employee.id,
          print_run: {
            status: {
              in: ['in_progress', 'pending'],
            },
          },
        },
      }),
    ])

    const tasksPending = pendingSewingTasks + pendingPrintTasks

    // Count completed tasks today
    const [completedSewingTasks, completedPrintTasks] = await Promise.all([
      prisma.sewingRunOperator.count({
        where: {
          employee_id: employee.id,
          sewing_run: {
            status: 'completed',
            end_time: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        },
      }),
      prisma.printRunOperator.count({
        where: {
          employee_id: employee.id,
          print_run: {
            status: 'completed',
            end_time: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        },
      }),
    ])

    const tasksCompletedToday = completedSewingTasks + completedPrintTasks

    return NextResponse.json({
      success: true,
      data: {
        employee_name: employee.name,
        employee_id: employee.employee_id,
        department: employee.department,
        position: employee.position,
        tasks_pending: tasksPending,
        tasks_completed_today: tasksCompletedToday,
        pieces_produced_today: totalPieces,
        efficiency_percentage: Math.round(avgEfficiency * 10) / 10,
        current_shift: currentShift,
        hours_worked_today: Math.round(hoursWorked * 10) / 10,
        attendance_status: attendance ? (attendance.time_out ? 'CLOCKED_OUT' : 'CLOCKED_IN') : 'NOT_CLOCKED_IN',
      },
    })
  } catch (error) {
    console.error('Mobile stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard stats',
      },
      { status: 500 }
    )
  }
}
