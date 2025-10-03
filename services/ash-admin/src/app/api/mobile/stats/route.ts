import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/mobile/stats - Get operator dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'default-workspace';
    const userId = req.headers.get('x-user-id') || 'mobile-user';

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get operator info
    const operator = await prisma.employee.findFirst({
      where: {
        workspace_id: workspaceId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        position: true,
      },
    });

    // Get today's attendance
    const attendance = await prisma.attendanceLog.findFirst({
      where: {
        employee_id: operator?.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Calculate today's work hours
    let todayHours = 0;
    if (attendance && attendance.time_in) {
      const timeIn = new Date(attendance.time_in);
      const timeOut = attendance.time_out ? new Date(attendance.time_out) : new Date();
      todayHours = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);
      todayHours = Math.round(todayHours * 10) / 10; // Round to 1 decimal
    }

    // Get active tasks (simplified - using bundles as tasks)
    const activeTasks = await prisma.bundle.findMany({
      where: {
        workspace_id: workspaceId,
        status: 'IN_PROGRESS',
      },
      include: {
        order: {
          select: {
            order_number: true,
          },
        },
      },
      take: 10,
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calculate today's output (simplified)
    const todayOutput = activeTasks.reduce((sum, bundle) => {
      return sum + (bundle.quantity || 0);
    }, 0);

    // Generate weekly performance data
    const weeklyData = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weeklyData.push({
        day: daysOfWeek[date.getDay()],
        efficiency: Math.floor(Math.random() * 40) + 60, // Mock data: 60-100%
        output: Math.floor(Math.random() * 100) + 50, // Mock data: 50-150 units
      });
    }

    // Mock alerts
    const alerts = [
      {
        id: '1',
        title: 'Quality Check Required',
        message: 'Bundle #12345 needs QC inspection',
        severity: 'medium',
      },
    ];

    const stats = {
      todayOutput,
      todayEfficiency: 85, // Mock - would calculate from actual data
      todayHours,
      activeTasks: activeTasks.map(bundle => ({
        id: bundle.id,
        order_number: bundle.order?.order_number || 'N/A',
        description: `Bundle ${bundle.bundle_number}`,
        priority: 'Normal',
        completed: Math.floor(bundle.quantity * 0.6), // Mock progress
        target: bundle.quantity,
      })),
      weeklyData,
      alerts,
    };

    return NextResponse.json({
      success: true,
      stats,
      operator: operator
        ? {
            id: operator.id,
            name: `${operator.first_name} ${operator.last_name}`,
            position: operator.position,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Mobile stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stats: {
          todayOutput: 0,
          todayEfficiency: 0,
          todayHours: 0,
          activeTasks: [],
          weeklyData: [],
          alerts: [],
        },
      },
      { status: 200 } // Return 200 with empty data instead of error
    );
  }
}
