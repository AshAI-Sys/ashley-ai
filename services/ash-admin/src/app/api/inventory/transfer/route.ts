/**
 * POST /api/inventory/transfer
 * Transfer stock from one location to another (typically WH_MAIN → STORE_MAIN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId, id: user_id } = user;
    const body = await request.json();
    const {
      from_location_code,
      to_location_code,
      items, // Array of { variant_id, quantity }
      notes,
    } = body;

    // Validation
    if (!from_location_code || !to_location_code) {
      return NextResponse.json(
        { success: false, error: 'Source and destination locations are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (from_location_code === to_location_code) {
      return NextResponse.json(
        { success: false, error: 'Source and destination must be different' },
        { status: 400 }
      );
    }

    // Get locations
    const [fromLocation, toLocation] = await Promise.all([
      prisma.storeLocation.findFirst({
        where: { workspace_id: workspaceId, location_code: from_location_code },
      }),
      prisma.storeLocation.findFirst({
        where: { workspace_id: workspaceId, location_code: to_location_code },
      }),
    ]);

    if (!fromLocation || !toLocation) {
      return NextResponse.json(
        { success: false, error: 'Invalid location(s)' },
        { status: 404 }
      );
    }

    // Execute transfer in transaction
    const transfer = await prisma.$transaction(async (tx) => {
      const transferId = `TRANSFER-${Date.now()}`;
      const results = [];

      for (const item of items) {
        // Get current stock at source location
        const sourceStock = await tx.stockLedger.groupBy({
          by: ['variant_id'],
          where: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: fromLocation.id,
          },
          _sum: { quantity_change: true },
        });

        const source_quantity_before = sourceStock[0]?._sum.quantity_change || 0;
        const source_quantity_after = source_quantity_before - item.quantity;

        // Check if sufficient stock
        if (source_quantity_after < 0) {
          throw new Error(
            `Insufficient stock at ${from_location_code} for variant ${item.variant_id}. Available: ${source_quantity_before}, Required: ${item.quantity}`
          );
        }

        // Get current stock at destination location
        const destStock = await tx.stockLedger.groupBy({
          by: ['variant_id'],
          where: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: toLocation.id,
          },
          _sum: { quantity_change: true },
        });

        const dest_quantity_before = destStock[0]?._sum.quantity_change || 0;
        const dest_quantity_after = dest_quantity_before + item.quantity;

        // Deduct from source
        await tx.stockLedger.create({
          data: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: fromLocation.id,
            transaction_type: 'OUT',
            quantity_change: -item.quantity,
            quantity_before: source_quantity_before,
            quantity_after: source_quantity_after,
            reference_type: 'TRANSFER',
            reference_id: transferId,
            performed_by: user_id,
            notes: `Transfer to ${to_location_code}: ${notes || ''}`,
          },
        });

        // Add to destination
        await tx.stockLedger.create({
          data: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: toLocation.id,
            transaction_type: 'IN',
            quantity_change: item.quantity,
            quantity_before: dest_quantity_before,
            quantity_after: dest_quantity_after,
            reference_type: 'TRANSFER',
            reference_id: transferId,
            performed_by: user_id,
            notes: `Transfer from ${from_location_code}: ${notes || ''}`,
          },
        });

        results.push({
          variant_id: item.variant_id,
          quantity: item.quantity,
          from: {
            location: from_location_code,
            before: source_quantity_before,
            after: source_quantity_after,
          },
          to: {
            location: to_location_code,
            before: dest_quantity_before,
            after: dest_quantity_after,
          },
        });
      }

      return {
        transfer_id: transferId,
        from_location: from_location_code,
        to_location: to_location_code,
        items: results,
        performed_by: user_id,
        notes,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Stock transferred successfully',
      data: transfer,
    });
  } catch (error: unknown) {
    console.error('Error transferring stock:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to transfer stock', details: message },
      { status: 500 }
    );
  }
});
