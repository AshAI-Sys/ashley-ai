import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/leave-balances
 * Fetch leave balances with filters
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:read')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;

      const employee_id = searchParams.get('employee_id');
      const leave_type_id = searchParams.get('leave_type_id');
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

      // Build where clause
      const where: any = { workspace_id, year };

      if (employee_id) {
        where.employee_id = employee_id;
      }

      if (leave_type_id) {
        where.leave_type_id = leave_type_id;
      }

      // Fetch leave balances
      const balances = await db.leaveBalance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employee_number: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true,
              department: true,
            },
          },
          leave_type: true,
        },
        orderBy: [
          { employee: { first_name: 'asc' } },
          { leave_type: { name: 'asc' } },
        ],
      });

      return NextResponse.json({
        success: true,
        data: balances,
      });
    } catch (error: any) {
      console.error('[HR] Leave balances fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leave balances' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/hr/leave-balances
 * Create or update leave balance for an employee
 * Requires: hr:manage permission
 */
export const POST = requirePermission('hr:update')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        employee_id,
        leave_type_id,
        year,
        total_days,
        carried_over_days,
      } = body;

      // Validate required fields
      if (!employee_id || !leave_type_id || !year || total_days === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields (employee_id, leave_type_id, year, total_days)' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Validate employee exists
      const employee = await db.employee.findFirst({
        where: { id: employee_id, workspace_id },
      });

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        );
      }

      // Validate leave type exists
      const leaveType = await db.leaveType.findFirst({
        where: { id: leave_type_id, workspace_id },
      });

      if (!leaveType) {
        return NextResponse.json(
          { error: 'Leave type not found' },
          { status: 404 }
        );
      }

      // Check if balance already exists
      const existing = await db.leaveBalance.findUnique({
        where: {
          workspace_id_employee_id_leave_type_id_year: {
            workspace_id,
            employee_id,
            leave_type_id,
            year: parseInt(year),
          },
        },
      });

      if (existing) {
        // Update existing balance
        const updated = await db.leaveBalance.update({
          where: { id: existing.id },
          data: {
            total_days: parseFloat(total_days),
            carried_over_days: carried_over_days ? parseFloat(carried_over_days) : 0,
            remaining_days: parseFloat(total_days) + (carried_over_days ? parseFloat(carried_over_days) : 0) - existing.used_days,
          },
          include: {
            employee: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            leave_type: true,
          },
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Leave balance updated',
        });
      }

      // Create new balance
      const balance = await db.leaveBalance.create({
        data: {
          workspace_id,
          employee_id,
          leave_type_id,
          year: parseInt(year),
          total_days: parseFloat(total_days),
          used_days: 0,
          carried_over_days: carried_over_days ? parseFloat(carried_over_days) : 0,
          remaining_days: parseFloat(total_days) + (carried_over_days ? parseFloat(carried_over_days) : 0),
        },
        include: {
          employee: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          leave_type: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: balance,
        message: 'Leave balance created',
      });
    } catch (error: any) {
      console.error('[HR] Leave balance creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create leave balance' },
        { status: 500 }
      );
    }
  }
);
