import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/inventory/stock-ledger
 * Fetch stock ledger history with filters and pagination
 * Requires: inventory:view permission
 */
export const GET = requirePermission('inventory:view')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;

      // Parse query parameters
      const variant_id = searchParams.get('variant_id');
      const location_id = searchParams.get('location_id');
      const transaction_type = searchParams.get('transaction_type');
      const reference_type = searchParams.get('reference_type');
      const start_date = searchParams.get('start_date');
      const end_date = searchParams.get('end_date');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        workspace_id,
      };

      if (variant_id) {
        where.variant_id = variant_id;
      }

      if (location_id) {
        where.location_id = location_id;
      }

      if (transaction_type) {
        where.transaction_type = transaction_type;
      }

      if (reference_type) {
        where.reference_type = reference_type;
      }

      // Date range filter
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) {
          where.created_at.gte = new Date(start_date);
        }
        if (end_date) {
          where.created_at.lte = new Date(end_date);
        }
      }

      // Fetch stock ledger entries with related data
      const [entries, total] = await Promise.all([
        db.stockLedger.findMany({
          where,
          include: {
            variant: {
              include: {
                product: true,
              },
            },
            location: true,
            user: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limit,
        }),
        db.stockLedger.count({ where }),
      ]);

      // Calculate statistics
      const stats = await db.stockLedger.groupBy({
        by: ['transaction_type'],
        where: {
          workspace_id,
          created_at: start_date || end_date ? {
            ...(start_date ? { gte: new Date(start_date) } : {}),
            ...(end_date ? { lte: new Date(end_date) } : {}),
          } : undefined,
        },
        _count: {
          id: true,
        },
        _sum: {
          quantity_change: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        statistics: stats.reduce((acc: any, stat) => {
          acc[stat.transaction_type] = {
            count: stat._count.id,
            total_quantity: stat._sum.quantity_change || 0,
          };
          return acc;
        }, {}),
      });
    } catch (error: any) {
      console.error('[INVENTORY] Stock ledger fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch stock ledger' },
        { status: 500 }
      );
    }
  }
);
