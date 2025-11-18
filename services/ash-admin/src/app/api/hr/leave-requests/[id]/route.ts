import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/leave-requests/[id]
 * Fetch a single leave request by ID
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:read')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      const leaveRequest = await db.leaveRequest.findFirst({
        where: { id, workspace_id },
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
      });

      if (!leaveRequest) {
        return NextResponse.json(
          { error: 'Leave request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: leaveRequest,
      });
    } catch (error: any) {
      console.error('[HR] Leave request fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leave request' },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/hr/leave-requests/[id]
 * Update leave request status (approve/reject) or edit details
 * Requires: hr:manage permission
 */
export const PATCH = requirePermission('hr:update')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;
      const body = await request.json();
      const { status, rejection_reason } = body;

      // Check if leave request exists
      const existing = await db.leaveRequest.findFirst({
        where: { id, workspace_id },
        include: {
          leave_type: true,
        },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Leave request not found' },
          { status: 404 }
        );
      }

      // If approving, update leave balance
      if (status === 'APPROVED' && existing.status !== 'APPROVED') {
        const year = new Date().getFullYear();

        // Get or create leave balance
        let balance = await db.leaveBalance.findUnique({
          where: {
            workspace_id_employee_id_leave_type_id_year: {
              workspace_id,
              employee_id: existing.employee_id,
              leave_type_id: existing.leave_type_id,
              year,
            },
          },
        });

        if (!balance) {
          // Create new balance with default days from leave type
          balance = await db.leaveBalance.create({
            data: {
              workspace_id,
              employee_id: existing.employee_id,
              leave_type_id: existing.leave_type_id,
              year,
              total_days: existing.leave_type.days_per_year,
              used_days: 0,
              remaining_days: existing.leave_type.days_per_year,
            },
          });
        }

        // Update balance - deduct used days
        await db.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used_days: balance.used_days + existing.days_requested,
            remaining_days: balance.remaining_days - existing.days_requested,
          },
        });
      }

      // If rejecting, require rejection reason
      if (status === 'REJECTED' && !rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      // Update leave request
      const updated = await db.leaveRequest.update({
        where: { id },
        data: {
          status,
          ...(status === 'APPROVED' || status === 'REJECTED'
            ? {
                approved_by: user.id,
                approved_at: new Date(),
              }
            : {}),
          ...(rejection_reason && { rejection_reason }),
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
          approver: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('[HR] Leave request update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update leave request' },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/hr/leave-requests/[id]
 * Delete a leave request (only if PENDING)
 * Requires: hr:manage permission
 */
export const DELETE = requirePermission('hr:update')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      // Check if leave request exists
      const existing = await db.leaveRequest.findFirst({
        where: { id, workspace_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Leave request not found' },
          { status: 404 }
        );
      }

      // Only allow deletion of PENDING requests
      if (existing.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only pending leave requests can be deleted' },
          { status: 400 }
        );
      }

      await db.leaveRequest.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Leave request deleted successfully',
      });
    } catch (error: any) {
      console.error('[HR] Leave request deletion error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete leave request' },
        { status: 500 }
      );
    }
  }
);
