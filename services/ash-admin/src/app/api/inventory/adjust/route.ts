/**
 * POST /api/inventory/adjust
 * Manual stock adjustment (for damaged items, corrections, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspace_id: workspaceId, id: user_id } = user;
    const body = await request.json();
    const {
      variant_id,
      location_code,
      adjustment_type, // 'ADD' or 'SUBTRACT'
      quantity,
      reason, // Required for audit trail
      notes,
    } = body;

    // Validation
    if (!variant_id || !location_code || !adjustment_type || !quantity || !reason) {
      return NextResponse.json(
        { success: false, error: 'variant_id, location_code, adjustment_type, quantity, and reason are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    if (!['ADD', 'SUBTRACT'].includes(adjustment_type)) {
      return NextResponse.json(
        { success: false, error: 'adjustment_type must be ADD or SUBTRACT' },
        { status: 400 }
      );
    }

    // Get location
    const location = await prisma.storeLocation.findFirst({
      where: { workspace_id: workspaceId, location_code },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: `Location ${location_code} not found` },
        { status: 404 }
      );
    }

    // Get variant to verify it exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: variant_id },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Product variant not found' },
        { status: 404 }
      );
    }

    // Get current stock
    const currentStock = await prisma.stockLedger.groupBy({
      by: ['variant_id'],
      where: {
        workspace_id: workspaceId,
        variant_id,
        location_id: location.id,
      },
      _sum: { quantity_change: true },
    });

    const quantity_before = currentStock[0]?._sum.quantity_change || 0;
    const quantity_change = adjustment_type === 'ADD' ? quantity : -quantity;
    const quantity_after = quantity_before + quantity_change;

    // Check if subtraction results in negative stock
    if (quantity_after < 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot subtract ${quantity} from current stock of ${quantity_before}`,
        },
        { status: 400 }
      );
    }

    // Create adjustment record
    const adjustment = await prisma.stockLedger.create({
      data: {
        workspace_id: workspaceId,
        variant_id,
        location_id: location.id,
        transaction_type: 'ADJUSTMENT',
        quantity_change,
        quantity_before,
        quantity_after,
        reference_type: 'ADJUSTMENT',
        reference_id: `ADJ-${Date.now()}`,
        performed_by: user_id,
        notes: `${reason}${notes ? ` - ${notes}` : ''}`,
      },
      include: {
        variant: {
          include: { product: true },
        },
        location: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        adjustment_id: adjustment.id,
        product: variant.product.name,
        variant: variant.variant_name,
        location: location.location_name,
        adjustment_type,
        quantity,
        quantity_before,
        quantity_after,
        reason,
        notes,
        performed_by: user_id,
        timestamp: adjustment.created_at,
      },
    });
  } catch (error: unknown) {
    console.error('Error adjusting stock:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to adjust stock', details: message },
      { status: 500 }
    );
  }
}
