import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission, validateWorkspaceAccess } from '@/lib/auth-middleware';

// Force dynamic route
export const dynamic = 'force-dynamic';

/**
 * POST /api/inventory/sales
 * Process a sale and deduct stock
 * Requires: inventory:sell permission
 */
export const POST = requirePermission('inventory:sell')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        location_id,
        items, // [{ variant_id, quantity, price }]
        payment_method,
        amount_paid,
        notes,
      } = body;

      // Validate required fields
      if (!location_id || !items || items.length === 0) {
        return NextResponse.json(
          { error: 'Missing required fields (location_id, items)' },
          { status: 400 }
        );
      }

      // Use authenticated user's workspace and ID
      const workspace_id = user.workspaceId;
      const cashier_id = user.id;

      // Calculate total
      const total_amount = items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.price,
        0
      );

      // Validate payment amount for cash transactions
      if (payment_method === 'CASH' && amount_paid && amount_paid < total_amount) {
        return NextResponse.json(
          { error: 'Insufficient payment amount' },
          { status: 400 }
        );
      }

      // Create sale transaction
      const sale = await db.retailSale.create({
        data: {
          workspace_id,
          location_id,
          cashier_id,
          total_amount,
          payment_method,
          amount_paid: amount_paid || total_amount,
          change_given: (amount_paid || total_amount) - total_amount,
          notes,
          items: {
            create: items.map((item: any) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.quantity * item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Deduct stock from location for each item
      for (const item of items) {
        // Get current stock
        const currentStock = await db.stockLedger.aggregate({
          where: {
            workspace_id,
            variant_id: item.variant_id,
            location_id,
          },
          _sum: {
            quantity_change: true,
          },
        });

        const quantity_before = currentStock._sum.quantity_change || 0;
        const quantity_after = quantity_before - item.quantity;

        // Warn if overselling but allow (business decision)
        if (quantity_after < 0) {
          console.warn(
            `[INVENTORY] Overselling detected: variant ${item.variant_id}, location ${location_id}, new quantity: ${quantity_after}`
          );
        }

        // Create stock ledger entry (negative for OUT)
        await db.stockLedger.create({
          data: {
            workspace_id,
            variant_id: item.variant_id,
            location_id,
            transaction_type: 'SALE',
            quantity_change: -item.quantity,
            quantity_before,
            quantity_after,
            reference_type: 'SALE',
            reference_id: sale.id,
            performed_by: cashier_id,
            notes: `Sale by ${user.email}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        sale_id: sale.id,
        sale,
      });
    } catch (error: any) {
      console.error('[INVENTORY] Sales processing error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to process sale' },
        { status: 500 }
      );
    }
  }
);
