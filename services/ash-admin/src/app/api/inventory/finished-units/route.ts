/**
 * API for Finished Units Inventory Management
 * Handles product images, crate tracking, and stock status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

// GET all finished units with inventory information
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const crate_number = searchParams.get('crate_number');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      workspace_id: workspaceId,
    };

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (crate_number) {
      where.crate_number = crate_number;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } },
        { serial: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch finished units with order details
    const finishedUnits = await prisma.finishedUnit.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            design_name: true,
            total_amount: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { crate_number: 'asc' },
        { created_at: 'desc' },
      ],
    });

    // Group by SKU and aggregate stock information
    const inventoryMap = new Map();

    finishedUnits.forEach((unit) => {
      const key = `${unit.sku}-${unit.size_code}-${unit.color || 'default'}-${unit.brand || 'default'}`;

      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          sku: unit.sku,
          product_name: unit.order.design_name || 'Unknown Product',
          category: unit.category || 'APPAREL',
          brand: unit.brand,
          size_code: unit.size_code,
          color: unit.color,
          product_image_url: unit.product_image_url,
          price: unit.price ? parseFloat(unit.price.toString()) : null,
          sale_price: unit.sale_price ? parseFloat(unit.sale_price.toString()) : null,
          crate_numbers: new Set(),
          total_quantity: 0,
          packed_quantity: 0,
          available_quantity: 0,
          units: [],
        });
      }

      const inventory = inventoryMap.get(key);
      if (unit.crate_number) {
        inventory.crate_numbers.add(unit.crate_number);
      }
      inventory.total_quantity += 1;
      if (unit.packed) {
        inventory.packed_quantity += 1;
      } else {
        inventory.available_quantity += 1;
      }
      inventory.units.push(unit);
    });

    // Convert to array and format
    const inventory = Array.from(inventoryMap.values()).map((item) => ({
      ...item,
      crate_numbers: Array.from(item.crate_numbers).sort(),
      status: item.available_quantity > 0 ? 'available' : 'out_of_stock',
    }));

    return NextResponse.json({
      success: true,
      data: inventory,
      total: inventory.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching finished units:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch finished units inventory' },
      { status: 500 }
    );
  }
});

// POST create or update finished unit with image
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const {
      order_id,
      sku,
      size_code,
      color,
      serial,
      product_image_url,
      crate_number,
      category,
      brand,
      packed = false,
    } = body;

    if (!order_id || !sku || !size_code) {
      return NextResponse.json(
        { success: false, error: 'order_id, sku, and size_code are required' },
        { status: 400 }
      );
    }

    const finishedUnit = await prisma.finishedUnit.create({
      data: {
        workspace_id: workspaceId,
        order_id,
        sku,
        size_code,
        color,
        serial,
        product_image_url,
        crate_number,
        category,
        brand,
        packed,
      },
      include: {
        order: {
          select: {
            order_number: true,
            design_name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Finished unit created successfully',
      data: finishedUnit,
    });
  } catch (error: unknown) {
    console.error('Error creating finished unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create finished unit' },
      { status: 500 }
    );
  }
});

// PUT update finished unit (image, crate, category)
export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const {
      id,
      product_image_url,
      crate_number,
      category,
      brand,
      packed,
      color,
      serial,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const finishedUnit = await prisma.finishedUnit.update({
      where: {
        id,
        workspace_id: workspaceId,
      },
      data: {
        ...(product_image_url !== undefined && { product_image_url }),
        ...(crate_number !== undefined && { crate_number }),
        ...(category !== undefined && { category }),
        ...(brand !== undefined && { brand }),
        ...(packed !== undefined && { packed }),
        ...(color !== undefined && { color }),
        ...(serial !== undefined && { serial }),
      },
      include: {
        order: {
          select: {
            order_number: true,
            design_name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Finished unit updated successfully',
      data: finishedUnit,
    });
  } catch (error: unknown) {
    console.error('Error updating finished unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update finished unit' },
      { status: 500 }
    );
  }
});

// PATCH bulk update finished units (for batch operations)
export const PATCH = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ids array is required' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'updates object is required' },
        { status: 400 }
      );
    }

    const result = await prisma.finishedUnit.updateMany({
      where: {
        id: { in: ids },
        workspace_id: workspaceId,
      },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} finished units updated successfully`,
      count: result.count,
    });
  } catch (error: unknown) {
    console.error('Error bulk updating finished units:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update finished units' },
      { status: 500 }
    );
  }
});

// DELETE finished unit
export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    await prisma.finishedUnit.delete({
      where: {
        id,
        workspace_id: workspaceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Finished unit deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting finished unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete finished unit' },
      { status: 500 }
    );
  }
});
