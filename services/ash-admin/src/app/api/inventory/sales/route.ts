/**
 * POST /api/inventory/sales
 * Record sale and automatically deduct stock from STORE_MAIN
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // Get user workspace and ID
    const { workspaceId, id: user_id } = user;

    // Parse request body
    const body = await request.json();
    const {
      items, // Array of { variant_id, quantity, unit_price, discount }
      payment_method,
      tax_amount = 0,
      discount_amount = 0,
      notes,
    } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!payment_method) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Get STORE_MAIN location
    const storeLocation = await prisma.storeLocation.findFirst({
      where: {
        workspace_id: workspaceId,
        location_code: 'STORE_MAIN',
      },
    });

    if (!storeLocation) {
      return NextResponse.json(
        { success: false, error: 'STORE_MAIN location not found. Please create it first.' },
        { status: 404 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number; discount?: number }) =>
        sum + item.quantity * item.unit_price - (item.discount || 0),
      0
    );
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate sale number
    const saleCount = await prisma.retailSale.count({ where: { workspace_id: workspaceId } });
    const sale_number = `SALE-${String(saleCount + 1).padStart(6, '0')}`;

    // Create sale with transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.retailSale.create({
        data: {
          workspace_id: workspaceId,
          sale_number,
          subtotal,
          tax_amount,
          discount_amount,
          total_amount,
          payment_method,
          payment_status: 'PAID',
          cashier_id: user_id,
          notes,
          items: {
            create: items.map((item: { variant_id: string; quantity: number; unit_price: number; discount?: number }) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount: item.discount || 0,
              total_price: item.quantity * item.unit_price - (item.discount || 0),
            })),
          },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Deduct stock from STORE_MAIN and create stock ledger entries
      for (const item of items) {
        // Get current stock
        const currentStock = await tx.stockLedger.groupBy({
          by: ['variant_id'],
          where: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: storeLocation.id,
          },
          _sum: {
            quantity_change: true,
          },
        });

        const quantity_before = currentStock[0]?._sum.quantity_change || 0;
        const quantity_after = quantity_before - item.quantity;

        // Check if sufficient stock
        if (quantity_after < 0) {
          throw new Error(
            `Insufficient stock for variant ${item.variant_id}. Available: ${quantity_before}, Required: ${item.quantity}`
          );
        }

        // Create stock ledger entry
        await tx.stockLedger.create({
          data: {
            workspace_id: workspaceId,
            variant_id: item.variant_id,
            location_id: storeLocation.id,
            transaction_type: 'SALE',
            quantity_change: -item.quantity,
            quantity_before,
            quantity_after,
            reference_type: 'SALE',
            reference_id: newSale.id,
            performed_by: user_id,
            notes: `Sale ${sale_number}`,
          },
        });
      }

      return newSale;
    });

    return NextResponse.json({
      success: true,
      message: 'Sale recorded successfully',
      data: sale,
    });
  } catch (error: unknown) {
    console.error('Error recording sale:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to record sale', details: message },
      { status: 500 }
    );
  }
});

// GET all sales
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;

    const sales = await prisma.retailSale.findMany({
      where: { workspace_id: workspaceId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        cashier: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { sale_date: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: sales,
    });
  } catch (error: unknown) {
    console.error('Error fetching sales:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales', details: message },
      { status: 500 }
    );
  }
});
