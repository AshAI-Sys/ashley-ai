import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * POST /api/inventory/transfer
 * Transfer stock between locations
 * Requires: inventory:transfer permission
 */
export const POST = requirePermission('inventory:transfer')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { from_location_id, to_location_id, items, notes } = body;

      if (!from_location_id || !to_location_id || !items || items.length === 0) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      if (from_location_id === to_location_id) {
        return NextResponse.json({ error: 'Cannot transfer to same location' }, { status: 400 });
      }

      // Use authenticated user's workspace and ID
      const workspace_id = user.workspaceId;
      const performed_by = user.id;

      const results = [];

      for (const item of items) {
        // Check if enough stock in source location
        const sourceStock = await db.stockLedger.aggregate({
          where: { workspace_id, variant_id: item.variant_id, location_id: from_location_id },
          _sum: { quantity_change: true }
        });
        
        const available = sourceStock._sum.quantity_change || 0;
        if (available < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for variant ${item.variant_id}. Available: ${available}, Requested: ${item.quantity}` 
          }, { status: 400 });
        }

        // Deduct from source location
        await db.stockLedger.create({
          data: {
            workspace_id,
            variant_id: item.variant_id,
            location_id: from_location_id,
            transaction_type: 'TRANSFER',
            quantity_change: -item.quantity,
            quantity_before: available,
            quantity_after: available - item.quantity,
            reference_type: 'TRANSFER',
            performed_by,
            notes: `Transfer to ${to_location_id} by ${user.email}`
          }
        });

        // Add to destination location
        const destStock = await db.stockLedger.aggregate({
          where: { workspace_id, variant_id: item.variant_id, location_id: to_location_id },
          _sum: { quantity_change: true }
        });
        
        const destAvailable = destStock._sum.quantity_change || 0;
        
        await db.stockLedger.create({
          data: {
            workspace_id,
            variant_id: item.variant_id,
            location_id: to_location_id,
            transaction_type: 'TRANSFER',
            quantity_change: item.quantity,
            quantity_before: destAvailable,
            quantity_after: destAvailable + item.quantity,
            reference_type: 'TRANSFER',
            performed_by,
            notes: `Transfer from ${from_location_id} by ${user.email}`
          }
        });

        results.push({ variant_id: item.variant_id, quantity: item.quantity, success: true });
      }

      return NextResponse.json({ success: true, transfers: results });
    } catch (error: any) {
      console.error('[INVENTORY] Transfer error:', error);
      return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
  }
);
