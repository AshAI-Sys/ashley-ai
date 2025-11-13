import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/hr/employee-benefits/[id]
 * Update employee benefit (e.g., change status to INACTIVE)
 * Requires: hr:manage permission
 */
export const PATCH = requirePermission('hr:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;
      const body = await request.json();

      const existing = await db.employeeBenefit.findFirst({
        where: { id, workspace_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Employee benefit not found' },
          { status: 404 }
        );
      }

      const updated = await db.employeeBenefit.update({
        where: { id },
        data: {
          ...(body.effective_end_date !== undefined && {
            effective_end_date: body.effective_end_date ? new Date(body.effective_end_date) : null,
          }),
          ...(body.employee_contribution !== undefined && {
            employee_contribution: parseFloat(body.employee_contribution),
          }),
          ...(body.employer_contribution !== undefined && {
            employer_contribution: parseFloat(body.employer_contribution),
          }),
          ...(body.policy_number !== undefined && { policy_number: body.policy_number }),
          ...(body.status && { status: body.status }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
        include: {
          employee: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          benefit_type: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('[HR] Employee benefit update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update employee benefit' },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/hr/employee-benefits/[id]
 * Delete employee benefit (set status to TERMINATED)
 * Requires: hr:manage permission
 */
export const DELETE = requirePermission('hr:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      const existing = await db.employeeBenefit.findFirst({
        where: { id, workspace_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Employee benefit not found' },
          { status: 404 }
        );
      }

      // Soft delete - set status to TERMINATED
      const updated = await db.employeeBenefit.update({
        where: { id },
        data: {
          status: 'TERMINATED',
          effective_end_date: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Employee benefit terminated',
        data: updated,
      });
    } catch (error: any) {
      console.error('[HR] Employee benefit deletion error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete employee benefit' },
        { status: 500 }
      );
    }
  }
);
