/**
 * POST /api/inventory/delivery
 * Add new stock delivery to warehouse
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
      receiving_location_code = 'WH_MAIN',
      supplier_name,
      items, // Array of { variant_id, quantity, notes }
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    // Get receiving location
    const location = await prisma.storeLocation.findFirst({
      where: { workspace_id: workspaceId, location_code: receiving_location_code },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: `Location ${receiving_location_code} not found` },
        { status: 404 }
      );
    }

    // Generate delivery number
    const deliveryCount = await prisma.warehouseDelivery.count({ where: { workspace_id: workspaceId } });
    const delivery_number = `DEL-${String(deliveryCount + 1).padStart(6, '0')}`;

    // Create delivery with transaction
    const delivery = await prisma.$transaction(async (tx) => {
      const newDelivery = await tx.warehouseDelivery.create({
        data: {
          workspace_id: workspaceId,
          delivery_number,
          supplier_name,
          receiving_location_id: location.id,
          status: 'RECEIVED',
          notes,
          received_by: user_id,
          received_at: new Date(),
          items: {
            create: items.map((item: { variant_id: string; quantity: number; notes?: string }) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Add stock to warehouse location
      for (const item of items) {
        const currentStock = await tx.stockLedger.groupBy({
          by: ['variant_id'],
          where: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: location.id,
          },
          _sum: { quantity_change: true },
        });

        const quantity_before = currentStock[0]?._sum.quantity_change || 0;
        const quantity_after = quantity_before + item.quantity;

        await tx.stockLedger.create({
          data: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: location.id,
            transaction_type: 'IN',
            quantity_change: item.quantity,
            quantity_before,
            quantity_after,
            reference_type: 'DELIVERY',
            reference_id: newDelivery.id,
            performed_by: user_id,
            notes: `Delivery ${delivery_number}`,
          },
        });
      }

      return newDelivery;
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery recorded successfully',
      data: delivery,
    });
  } catch (error: unknown) {
    console.error('Error recording delivery:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to record delivery', details: message },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const deliveries = await prisma.warehouseDelivery.findMany({
      where: { workspace_id: workspaceId },
      include: {
        items: true,
        receiving_location: true,
        receiver: {
          select: { first_name: true, last_name: true },
        },
      },
      orderBy: { delivery_date: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: deliveries });
  } catch (error: unknown) {
    console.error('Error fetching deliveries:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deliveries', details: message },
      { status: 500 }
    );
  }
});
