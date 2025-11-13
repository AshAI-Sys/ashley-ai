import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/leave-types/[id]
 * Fetch a single leave type by ID
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:view')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      const leaveType = await db.leaveType.findFirst({
        where: {
          id,
          workspace_id,
        },
        include: {
          _count: {
            select: {
              leave_requests: true,
              leave_balances: true,
            },
          },
        },
      });

      if (!leaveType) {
        return NextResponse.json(
          { error: 'Leave type not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: leaveType,
      });
    } catch (error: any) {
      console.error('[HR] Leave type fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leave type' },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/hr/leave-types/[id]
 * Update a leave type
 * Requires: hr:manage permission
 */
export const PATCH = requirePermission('hr:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;
      const body = await request.json();

      // Check if leave type exists
      const existing = await db.leaveType.findFirst({
        where: { id, workspace_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Leave type not found' },
          { status: 404 }
        );
      }

      // Check for duplicate code if code is being updated
      if (body.code && body.code !== existing.code) {
        const duplicate = await db.leaveType.findUnique({
          where: {
            workspace_id_code: {
              workspace_id,
              code: body.code.toUpperCase(),
            },
          },
        });

        if (duplicate) {
          return NextResponse.json(
            { error: `Leave type with code "${body.code}" already exists` },
            { status: 400 }
          );
        }
      }

      // Update leave type
      const updated = await db.leaveType.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.code && { code: body.code.toUpperCase() }),
          ...(body.days_per_year !== undefined && { days_per_year: parseFloat(body.days_per_year) }),
          ...(body.is_paid !== undefined && { is_paid: body.is_paid }),
          ...(body.requires_proof !== undefined && { requires_proof: body.requires_proof }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.is_active !== undefined && { is_active: body.is_active }),
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('[HR] Leave type update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update leave type' },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/hr/leave-types/[id]
 * Delete a leave type (soft delete by setting is_active = false)
 * Requires: hr:manage permission
 */
export const DELETE = requirePermission('hr:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      // Check if leave type exists
      const existing = await db.leaveType.findFirst({
        where: { id, workspace_id },
        include: {
          _count: {
            select: {
              leave_requests: true,
              leave_balances: true,
            },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Leave type not found' },
          { status: 404 }
        );
      }

      // Check if leave type has related records
      if (existing._count.leave_requests > 0 || existing._count.leave_balances > 0) {
        // Soft delete - set is_active to false
        const updated = await db.leaveType.update({
          where: { id },
          data: { is_active: false },
        });

        return NextResponse.json({
          success: true,
          message: 'Leave type deactivated (has related records)',
          data: updated,
        });
      }

      // Hard delete if no related records
      await db.leaveType.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Leave type deleted successfully',
      });
    } catch (error: any) {
      console.error('[HR] Leave type deletion error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete leave type' },
        { status: 500 }
      );
    }
  }
);
