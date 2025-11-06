/**
 * CRUD operations for Inventory Products
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';
import { syncAfterChange } from '@/lib/google-sheets-auto-sync';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET all products
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const is_active = searchParams.get('is_active');

    const products = await prisma.inventoryProduct.findMany({
      where: {
        workspace_id: workspaceId,
        ...(category && { category }),
        ...(is_active !== null && { is_active: is_active === 'true' }),
      },
      include: {
        variants: {
          where: { is_active: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
});

// POST create new product
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const { name, description, photo_url, base_sku, category } = body;

    if (!name || !base_sku) {
      return NextResponse.json(
        { success: false, error: 'name and base_sku are required' },
        { status: 400 }
      );
    }

    const product = await prisma.inventoryProduct.create({
      data: {
        workspace_id: workspaceId,
        name,
        description,
        photo_url,
        base_sku,
        category,
      },
    });

    // Trigger auto-sync to Google Sheets (non-blocking)
    await syncAfterChange(workspaceId, 'inventory');

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
});

// PUT update product
export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const { id, name, description, photo_url, category, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const product = await prisma.inventoryProduct.update({
      where: { id, workspace_id: workspaceId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(photo_url !== undefined && { photo_url }),
        ...(category !== undefined && { category }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
});

// DELETE product
export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await prisma.inventoryProduct.delete({
      where: { id, workspace_id: workspaceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
});
