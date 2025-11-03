import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * POST /api/inventory/delivery
 * Receive warehouse delivery
 * Requires: inventory:receive permission
 */
export const POST = requirePermission('inventory:receive')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { receiving_location_id, supplier_name, items, notes } = body;

      if (!receiving_location_id || !items || items.length === 0) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Use authenticated user's workspace and ID
      const workspace_id = user.workspaceId;
      const received_by = user.id;

      const deliveryCount = await db.warehouseDelivery.count({ where: { workspace_id } });
      const paddedNum = String(deliveryCount + 1).padStart(6, '0');
      const delivery_number = `DEL-${paddedNum}`;

      const delivery = await db.warehouseDelivery.create({
        data: {
          workspace_id, delivery_number, supplier_name, receiving_location_id,
          status: 'RECEIVED', notes, received_by, received_at: new Date(),
          items: { 
            create: items.map((item: any) => ({ 
              variant_id: item.variant_id, 
              quantity: item.quantity, 
              notes: item.notes 
            })) 
          }
        },
        include: { items: true }
      });

      for (const item of items) {
        const currentStock = await db.stockLedger.aggregate({
          where: { workspace_id, variant_id: item.variant_id, location_id: receiving_location_id },
          _sum: { quantity_change: true }
        });
        
        const quantity_before = currentStock._sum.quantity_change || 0;
        const quantity_after = quantity_before + item.quantity;
        
        await db.stockLedger.create({
          data: {
            workspace_id, variant_id: item.variant_id, location_id: receiving_location_id,
            transaction_type: 'IN', quantity_change: item.quantity,
            quantity_before, quantity_after, reference_type: 'DELIVERY',
            reference_id: delivery.id, performed_by: received_by, 
            notes: `Delivery ${delivery_number} by ${user.email}`
          }
        });
      }

      return NextResponse.json({ success: true, delivery_id: delivery.id, delivery_number, delivery });
    } catch (error: any) {
      console.error('[INVENTORY] Delivery error:', error);
      return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
  }
);
