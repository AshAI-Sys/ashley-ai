import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * POST /api/inventory/adjust
 * Adjust stock levels (add or remove inventory)
 * Requires: inventory:adjust permission
 */
export const POST = requirePermission('inventory:adjust')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { variant_id, location_id, quantity_change, notes, reason } = body;

      if (!variant_id || !location_id || quantity_change === undefined || !notes || !reason) {
        return NextResponse.json({ error: 'Missing required fields (variant_id, location_id, quantity_change, notes, reason)' }, { status: 400 });
      }

      // Use authenticated user's workspace and ID
      const workspace_id = user.workspaceId;
      const performed_by = user.id;

      // Get current stock before adjustment
      const currentStock = await db.stockLedger.aggregate({
        where: { workspace_id, variant_id, location_id },
        _sum: { quantity_change: true }
      });

      const quantity_before = currentStock._sum.quantity_change || 0;
      const quantity_after = quantity_before + quantity_change;

      // Prevent negative stock unless it's a correction
      if (quantity_after < 0 && !reason.toLowerCase().includes('correction')) {
        return NextResponse.json({
          error: `Adjustment would result in negative stock. Current: ${quantity_before}, Change: ${quantity_change}, Result: ${quantity_after}`
        }, { status: 400 });
      }

      // Create stock ledger entry for the adjustment
      const adjustment = await db.stockLedger.create({
        data: {
          workspace_id,
          variant_id,
          location_id,
          transaction_type: 'ADJUSTMENT',
          quantity_change,
          quantity_before,
          quantity_after,
          reference_type: 'ADJUSTMENT',
          performed_by,
          notes: `${reason} - ${notes} (by ${user.email})`
        }
      });

      return NextResponse.json({
        success: true,
        adjustment_id: adjustment.id,
        previous_quantity: quantity_before,
        new_quantity: quantity_after,
        change: quantity_change
      });
    } catch (error: any) {
      console.error('[INVENTORY] Stock adjustment error:', error);
      return NextResponse.json({ error: error.message || 'Failed to adjust stock' }, { status: 500 });
    }
  }
);
