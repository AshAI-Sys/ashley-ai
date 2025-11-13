import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/hr/benefit-types/[id]
 * Update a benefit type
 * Requires: hr:manage permission
 */
export const PATCH = requirePermission('hr:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;
      const body = await request.json();

      const existing = await db.benefitType.findFirst({
        where: { id, workspace_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Benefit type not found' },
          { status: 404 }
        );
      }

      const updated = await db.benefitType.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.employee_contribution !== undefined && {
            employee_contribution: body.employee_contribution ? parseFloat(body.employee_contribution) : null,
          }),
          ...(body.employer_contribution !== undefined && {
            employer_contribution: body.employer_contribution ? parseFloat(body.employer_contribution) : null,
          }),
          ...(body.contribution_percentage !== undefined && {
            contribution_percentage: body.contribution_percentage ? parseFloat(body.contribution_percentage) : null,
          }),
          ...(body.is_mandatory !== undefined && { is_mandatory: body.is_mandatory }),
          ...(body.is_active !== undefined && { is_active: body.is_active }),
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('[HR] Benefit type update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update benefit type' },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/hr/benefit-types/[id]
 * Delete a benefit type
 * Requires: hr:manage permission
 */
export const DELETE = requirePermission('hr:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      const existing = await db.benefitType.findFirst({
        where: { id, workspace_id },
        include: {
          _count: {
            select: {
              employee_benefits: true,
            },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Benefit type not found' },
          { status: 404 }
        );
      }

      if (existing._count.employee_benefits > 0) {
        const updated = await db.benefitType.update({
          where: { id },
          data: { is_active: false },
        });

        return NextResponse.json({
          success: true,
          message: 'Benefit type deactivated (has related records)',
          data: updated,
        });
      }

      await db.benefitType.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Benefit type deleted successfully',
      });
    } catch (error: any) {
      console.error('[HR] Benefit type deletion error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete benefit type' },
        { status: 500 }
      );
    }
  }
);
