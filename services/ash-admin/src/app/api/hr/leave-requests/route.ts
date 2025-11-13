import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/leave-requests
 * Fetch leave requests with filters and pagination
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:view')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;

      // Parse query parameters
      const employee_id = searchParams.get('employee_id');
      const status = searchParams.get('status');
      const leave_type_id = searchParams.get('leave_type_id');
      const start_date = searchParams.get('start_date');
      const end_date = searchParams.get('end_date');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { workspace_id };

      if (employee_id) {
        where.employee_id = employee_id;
      }

      if (status) {
        where.status = status;
      }

      if (leave_type_id) {
        where.leave_type_id = leave_type_id;
      }

      // Date range filter
      if (start_date || end_date) {
        where.start_date = {};
        if (start_date) {
          where.start_date.gte = new Date(start_date);
        }
        if (end_date) {
          where.start_date.lte = new Date(end_date);
        }
      }

      // Fetch leave requests
      const [requests, total] = await Promise.all([
        db.leaveRequest.findMany({
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
            approver: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limit,
        }),
        db.leaveRequest.count({ where }),
      ]);

      // Calculate statistics
      const stats = await db.leaveRequest.groupBy({
        by: ['status'],
        where: { workspace_id },
        _count: { id: true },
      });

      return NextResponse.json({
        success: true,
        data: requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        statistics: stats.reduce((acc: any, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {}),
      });
    } catch (error: any) {
      console.error('[HR] Leave requests fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leave requests' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/hr/leave-requests
 * Create a new leave request
 * Requires: hr:manage permission
 */
export const POST = requirePermission('hr:manage')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        days_requested,
        reason,
        proof_document,
      } = body;

      // Validate required fields
      if (!employee_id || !leave_type_id || !start_date || !end_date || !days_requested || !reason) {
        return NextResponse.json(
          { error: 'Missing required fields' },
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
        where: { id: leave_type_id, workspace_id, is_active: true },
      });

      if (!leaveType) {
        return NextResponse.json(
          { error: 'Leave type not found or inactive' },
          { status: 404 }
        );
      }

      // Check if proof is required
      if (leaveType.requires_proof && !proof_document) {
        return NextResponse.json(
          { error: `Proof document is required for ${leaveType.name}` },
          { status: 400 }
        );
      }

      // Get current year leave balance
      const year = new Date().getFullYear();
      const balance = await db.leaveBalance.findUnique({
        where: {
          workspace_id_employee_id_leave_type_id_year: {
            workspace_id,
            employee_id,
            leave_type_id,
            year,
          },
        },
      });

      // Check if employee has sufficient balance
      if (balance && balance.remaining_days < parseFloat(days_requested)) {
        return NextResponse.json(
          {
            error: `Insufficient leave balance. Available: ${balance.remaining_days} days, Requested: ${days_requested} days`,
          },
          { status: 400 }
        );
      }

      // Create leave request
      const leaveRequest = await db.leaveRequest.create({
        data: {
          workspace_id,
          employee_id,
          leave_type_id,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          days_requested: parseFloat(days_requested),
          reason,
          proof_document,
          status: 'PENDING',
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
        data: leaveRequest,
      });
    } catch (error: any) {
      console.error('[HR] Leave request creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create leave request' },
        { status: 500 }
      );
    }
  }
);
