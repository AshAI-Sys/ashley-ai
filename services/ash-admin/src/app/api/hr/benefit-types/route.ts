import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/benefit-types
 * Fetch all benefit types
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:read')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;
      const is_active = searchParams.get('is_active');
      const is_mandatory = searchParams.get('is_mandatory');

      // Build where clause
      const where: any = { workspace_id };

      if (is_active !== null) {
        where.is_active = is_active === 'true';
      }

      if (is_mandatory !== null) {
        where.is_mandatory = is_mandatory === 'true';
      }

      // Fetch benefit types
      const benefitTypes = await db.benefitType.findMany({
        where,
        include: {
          _count: {
            select: {
              employee_benefits: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return NextResponse.json({
        success: true,
        data: benefitTypes,
      });
    } catch (error: any) {
      console.error('[HR] Benefit types fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch benefit types' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/hr/benefit-types
 * Create a new benefit type
 * Requires: hr:manage permission
 */
export const POST = requirePermission('hr:update')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        name,
        code,
        description,
        employee_contribution,
        employer_contribution,
        contribution_percentage,
        is_mandatory,
        is_active,
      } = body;

      // Validate required fields
      if (!name || !code) {
        return NextResponse.json(
          { error: 'Missing required fields (name, code)' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Check for duplicate code
      const existing = await db.benefitType.findUnique({
        where: {
          workspace_id_code: {
            workspace_id,
            code,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Benefit type with code "${code}" already exists` },
          { status: 400 }
        );
      }

      // Create benefit type
      const benefitType = await db.benefitType.create({
        data: {
          workspace_id,
          name,
          code: code.toUpperCase(),
          description,
          employee_contribution: employee_contribution ? parseFloat(employee_contribution) : null,
          employer_contribution: employer_contribution ? parseFloat(employer_contribution) : null,
          contribution_percentage: contribution_percentage ? parseFloat(contribution_percentage) : null,
          is_mandatory: is_mandatory || false,
          is_active: is_active !== undefined ? is_active : true,
        },
      });

      return NextResponse.json({
        success: true,
        data: benefitType,
      });
    } catch (error: any) {
      console.error('[HR] Benefit type creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create benefit type' },
        { status: 500 }
      );
    }
  }
);
