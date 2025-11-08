/**
 * CRUD operations for Inventory Brands
 * Note: This is different from client brands (Brand model)
 * InventoryBrand is for product branding (e.g., Nike, Adidas, Generic)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';
import { withAudit } from '@/lib/audit-middleware';

export const dynamic = 'force-dynamic';

// Validation schemas
const CreateInventoryBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  code: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

const UpdateInventoryBrandSchema = z.object({
  id: z.string().min(1, 'Brand ID is required'),
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')).nullable(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

// GET all inventory brands
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search');

    const brands = await db.inventoryBrand.findMany({
      where: {
        workspace_id: workspaceId,
        ...(is_active !== null && { is_active: is_active === 'true' }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error: unknown) {
    console.error('Error fetching inventory brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory brands' },
      { status: 500 }
    );
  }
});

// POST create new inventory brand
export const POST = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const body = await request.json();
        const validatedData = CreateInventoryBrandSchema.parse(body);

        // Check if brand name already exists in workspace
        const existing = await db.inventoryBrand.findFirst({
          where: {
            workspace_id: workspaceId,
            name: validatedData.name,
          },
        });

        if (existing) {
          return NextResponse.json(
            { success: false, error: 'Brand name already exists' },
            { status: 400 }
          );
        }

        // Auto-generate code from name if not provided
        const code = validatedData.code || validatedData.name
          .toUpperCase()
          .replace(/\s+/g, '_')
          .replace(/[^A-Z0-9_]/g, '')
          .substring(0, 10);

        const brand = await db.inventoryBrand.create({
          data: {
            workspace_id: workspaceId,
            name: validatedData.name,
            code,
            logo_url: validatedData.logo_url || null,
            description: validatedData.description,
            is_active: validatedData.is_active,
          },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        });

        return NextResponse.json(
          { success: true, data: brand, message: 'Brand created successfully' },
          { status: 201 }
        );
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          );
        }

        console.error('Error creating inventory brand:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create brand' },
          { status: 500 }
        );
      }
    },
    { resource: 'inventory_brand', action: 'CREATE' }
  )
);

// PUT update inventory brand
export const PUT = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const body = await request.json();
        const validatedData = UpdateInventoryBrandSchema.parse(body);

        // Verify brand exists and belongs to workspace
        const existing = await db.inventoryBrand.findFirst({
          where: {
            id: validatedData.id,
            workspace_id: workspaceId,
          },
        });

        if (!existing) {
          return NextResponse.json(
            { success: false, error: 'Brand not found' },
            { status: 404 }
          );
        }

        // If updating name, check for duplicates
        if (validatedData.name && validatedData.name !== existing.name) {
          const duplicate = await db.inventoryBrand.findFirst({
            where: {
              workspace_id: workspaceId,
              name: validatedData.name,
              id: { not: validatedData.id },
            },
          });

          if (duplicate) {
            return NextResponse.json(
              { success: false, error: 'Brand name already exists' },
              { status: 400 }
            );
          }
        }

        const brand = await db.inventoryBrand.update({
          where: { id: validatedData.id },
          data: {
            ...(validatedData.name && { name: validatedData.name }),
            ...(validatedData.code !== undefined && { code: validatedData.code }),
            ...(validatedData.logo_url !== undefined && { logo_url: validatedData.logo_url }),
            ...(validatedData.description !== undefined && { description: validatedData.description }),
            ...(validatedData.is_active !== undefined && { is_active: validatedData.is_active }),
          },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: brand,
          message: 'Brand updated successfully',
        });
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          );
        }

        console.error('Error updating inventory brand:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update brand' },
          { status: 500 }
        );
      }
    },
    { resource: 'inventory_brand', action: 'UPDATE' }
  )
);

// DELETE inventory brand
export const DELETE = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Brand ID is required' },
            { status: 400 }
          );
        }

        // Verify brand exists and belongs to workspace
        const brand = await db.inventoryBrand.findFirst({
          where: {
            id,
            workspace_id: workspaceId,
          },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        });

        if (!brand) {
          return NextResponse.json(
            { success: false, error: 'Brand not found' },
            { status: 404 }
          );
        }

        // Check if brand has products
        if (brand._count.products > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot delete brand with ${brand._count.products} product(s). Please reassign or delete products first.`,
            },
            { status: 400 }
          );
        }

        await db.inventoryBrand.delete({
          where: { id },
        });

        return NextResponse.json({
          success: true,
          message: 'Brand deleted successfully',
        });
      } catch (error: unknown) {
        console.error('Error deleting inventory brand:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete brand' },
          { status: 500 }
        );
      }
    },
    { resource: 'inventory_brand', action: 'DELETE' }
  )
);
