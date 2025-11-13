import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/leave-types
 * Fetch all leave types with filters
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:view')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;
      const is_active = searchParams.get('is_active');
      const search = searchParams.get('search');

      // Build where clause
      const where: any = { workspace_id };

      if (is_active !== null) {
        where.is_active = is_active === 'true';
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Fetch leave types
      const leaveTypes = await db.leaveType.findMany({
        where,
        include: {
          _count: {
            select: {
              leave_requests: true,
              leave_balances: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return NextResponse.json({
        success: true,
        data: leaveTypes,
      });
    } catch (error: any) {
      console.error('[HR] Leave types fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leave types' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/hr/leave-types
 * Create a new leave type
 * Requires: hr:manage permission
 */
export const POST = requirePermission('hr:manage')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        name,
        code,
        days_per_year,
        is_paid,
        requires_proof,
        description,
        is_active,
      } = body;

      // Validate required fields
      if (!name || !code || days_per_year === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields (name, code, days_per_year)' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Check for duplicate code
      const existing = await db.leaveType.findUnique({
        where: {
          workspace_id_code: {
            workspace_id,
            code,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Leave type with code "${code}" already exists` },
          { status: 400 }
        );
      }

      // Create leave type
      const leaveType = await db.leaveType.create({
        data: {
          workspace_id,
          name,
          code: code.toUpperCase(),
          days_per_year: parseFloat(days_per_year),
          is_paid: is_paid !== undefined ? is_paid : true,
          requires_proof: requires_proof || false,
          description,
          is_active: is_active !== undefined ? is_active : true,
        },
      });

      return NextResponse.json({
        success: true,
        data: leaveType,
      });
    } catch (error: any) {
      console.error('[HR] Leave type creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create leave type' },
        { status: 500 }
      );
    }
  }
);
