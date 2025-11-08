/**
 * CRUD operations for Inventory Products
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';
import { withAudit } from '@/lib/audit-middleware';
import { syncAfterChange } from '@/lib/google-sheets-auto-sync';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET all products
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // Search by category name
    const category_id = searchParams.get('category_id'); // Filter by category ID
    const brand_id = searchParams.get('brand_id'); // Filter by brand ID
    const is_active = searchParams.get('is_active');

    const products = await prisma.inventoryProduct.findMany({
      where: {
        workspace_id: workspaceId,
        ...(category && {
          category: {
            name: { contains: category, mode: 'insensitive' }
          }
        }),
        ...(category_id && { category_id }),
        ...(brand_id && { brand_id }),
        ...(is_active !== null && { is_active: is_active === 'true' }),
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { is_active: true },
        },
        _count: {
          select: {
            variants: true,
          },
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
export const POST = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const body = await request.json();
        const { name, description, photo_url, base_sku, category_id, brand_id, is_active } = body;

        if (!name || !base_sku) {
          return NextResponse.json(
            { success: false, error: 'name and base_sku are required' },
            { status: 400 }
          );
        }

        // Check if SKU already exists in workspace
        const existingSKU = await prisma.inventoryProduct.findFirst({
          where: {
            workspace_id: workspaceId,
            base_sku,
          },
        });

        if (existingSKU) {
          return NextResponse.json(
            { success: false, error: 'Product with this SKU already exists' },
            { status: 400 }
          );
        }

        // Verify category exists if provided
        if (category_id) {
          const category = await prisma.category.findFirst({
            where: {
              id: category_id,
              workspace_id: workspaceId,
            },
          });

          if (!category) {
            return NextResponse.json(
              { success: false, error: 'Category not found' },
              { status: 404 }
            );
          }
        }

        // Verify brand exists if provided
        if (brand_id) {
          const brand = await prisma.inventoryBrand.findFirst({
            where: {
              id: brand_id,
              workspace_id: workspaceId,
            },
          });

          if (!brand) {
            return NextResponse.json(
              { success: false, error: 'Brand not found' },
              { status: 404 }
            );
          }
        }

        const product = await prisma.inventoryProduct.create({
          data: {
            workspace_id: workspaceId,
            name,
            description,
            photo_url,
            base_sku,
            category_id,
            brand_id,
            is_active: is_active !== undefined ? is_active : true,
          },
          include: {
            category: true,
            brand: true,
            _count: {
              select: {
                variants: true,
              },
            },
          },
        });

        // Trigger auto-sync to Google Sheets (non-blocking)
        await syncAfterChange(workspaceId, 'inventory');

        return NextResponse.json({
          success: true,
          message: 'Product created successfully',
          data: product,
        }, { status: 201 });
      } catch (error: unknown) {
        console.error('Error creating product:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create product' },
          { status: 500 }
        );
      }
    },
    { resource: 'inventory_product', action: 'CREATE' }
  )
);

// PUT update product
export const PUT = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const body = await request.json();
        const { id, name, description, photo_url, category_id, brand_id, is_active, base_sku } = body;

        if (!id) {
          return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
        }

        // Verify product exists and belongs to workspace
        const existing = await prisma.inventoryProduct.findFirst({
          where: {
            id,
            workspace_id: workspaceId,
          },
        });

        if (!existing) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        }

        // Check SKU uniqueness if being updated
        if (base_sku && base_sku !== existing.base_sku) {
          const existingSKU = await prisma.inventoryProduct.findFirst({
            where: {
              workspace_id: workspaceId,
              base_sku,
              id: { not: id },
            },
          });

          if (existingSKU) {
            return NextResponse.json(
              { success: false, error: 'Product with this SKU already exists' },
              { status: 400 }
            );
          }
        }

        // Verify category exists if provided
        if (category_id !== undefined && category_id !== null) {
          const category = await prisma.category.findFirst({
            where: {
              id: category_id,
              workspace_id: workspaceId,
            },
          });

          if (!category) {
            return NextResponse.json(
              { success: false, error: 'Category not found' },
              { status: 404 }
            );
          }
        }

        // Verify brand exists if provided
        if (brand_id !== undefined && brand_id !== null) {
          const brand = await prisma.inventoryBrand.findFirst({
            where: {
              id: brand_id,
              workspace_id: workspaceId,
            },
          });

          if (!brand) {
            return NextResponse.json(
              { success: false, error: 'Brand not found' },
              { status: 404 }
            );
          }
        }

        const product = await prisma.inventoryProduct.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(base_sku && { base_sku }),
            ...(description !== undefined && { description }),
            ...(photo_url !== undefined && { photo_url }),
            ...(category_id !== undefined && { category_id }),
            ...(brand_id !== undefined && { brand_id }),
            ...(is_active !== undefined && { is_active }),
          },
          include: {
            category: true,
            brand: true,
            _count: {
              select: {
                variants: true,
              },
            },
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
    },
    { resource: 'inventory_product', action: 'UPDATE' }
  )
);

// DELETE product
export const DELETE = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
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
    },
    { resource: 'inventory_product', action: 'DELETE' }
  )
);
