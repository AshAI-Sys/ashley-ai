/**
 * CRUD operations for Inventory Categories
 * Supports hierarchical categories (parent/subcategories)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';
import { withAudit } from '@/lib/audit-middleware';

export const dynamic = 'force-dynamic';

// Validation schemas
const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

const UpdateCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

// GET all categories
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');
    const parent_id = searchParams.get('parent_id');
    const include_subcategories = searchParams.get('include_subcategories') === 'true';

    const categories = await db.category.findMany({
      where: {
        workspace_id: workspaceId,
        ...(is_active !== null && { is_active: is_active === 'true' }),
        ...(parent_id && { parent_id }),
      },
      include: {
        parent: true,
        ...(include_subcategories && {
          subcategories: {
            where: { is_active: true },
          },
        }),
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
      },
      orderBy: [
        { parent_id: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
});

// POST create new category
export const POST = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const body = await request.json();
        const validatedData = CreateCategorySchema.parse(body);

        // Check if category name already exists in workspace
        const existing = await db.category.findFirst({
          where: {
            workspace_id: workspaceId,
            name: validatedData.name,
          },
        });

        if (existing) {
          return NextResponse.json(
            { success: false, error: 'Category name already exists' },
            { status: 400 }
          );
        }

        // If parent_id is provided, verify it exists
        if (validatedData.parent_id) {
          const parent = await db.category.findFirst({
            where: {
              id: validatedData.parent_id,
              workspace_id: workspaceId,
            },
          });

          if (!parent) {
            return NextResponse.json(
              { success: false, error: 'Parent category not found' },
              { status: 404 }
            );
          }
        }

        const category = await db.category.create({
          data: {
            workspace_id: workspaceId,
            name: validatedData.name,
            code: validatedData.code,
            description: validatedData.description,
            parent_id: validatedData.parent_id,
            is_active: validatedData.is_active,
          },
          include: {
            parent: true,
            _count: {
              select: {
                products: true,
                subcategories: true,
              },
            },
          },
        });

        return NextResponse.json(
          { success: true, data: category, message: 'Category created successfully' },
          { status: 201 }
        );
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          );
        }

        console.error('Error creating category:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create category' },
          { status: 500 }
        );
      }
    },
    { resource: 'category', action: 'CREATE' }
  )
);

// PUT update category
export const PUT = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const body = await request.json();
        const validatedData = UpdateCategorySchema.parse(body);

        // Verify category exists and belongs to workspace
        const existing = await db.category.findFirst({
          where: {
            id: validatedData.id,
            workspace_id: workspaceId,
          },
        });

        if (!existing) {
          return NextResponse.json(
            { success: false, error: 'Category not found' },
            { status: 404 }
          );
        }

        // If updating name, check for duplicates
        if (validatedData.name && validatedData.name !== existing.name) {
          const duplicate = await db.category.findFirst({
            where: {
              workspace_id: workspaceId,
              name: validatedData.name,
              id: { not: validatedData.id },
            },
          });

          if (duplicate) {
            return NextResponse.json(
              { success: false, error: 'Category name already exists' },
              { status: 400 }
            );
          }
        }

        // If updating parent_id, verify it exists and prevent circular reference
        if (validatedData.parent_id !== undefined) {
          if (validatedData.parent_id === validatedData.id) {
            return NextResponse.json(
              { success: false, error: 'Category cannot be its own parent' },
              { status: 400 }
            );
          }

          if (validatedData.parent_id) {
            const parent = await db.category.findFirst({
              where: {
                id: validatedData.parent_id,
                workspace_id: workspaceId,
              },
            });

            if (!parent) {
              return NextResponse.json(
                { success: false, error: 'Parent category not found' },
                { status: 404 }
              );
            }
          }
        }

        const category = await db.category.update({
          where: { id: validatedData.id },
          data: {
            ...(validatedData.name && { name: validatedData.name }),
            ...(validatedData.code !== undefined && { code: validatedData.code }),
            ...(validatedData.description !== undefined && { description: validatedData.description }),
            ...(validatedData.parent_id !== undefined && { parent_id: validatedData.parent_id }),
            ...(validatedData.is_active !== undefined && { is_active: validatedData.is_active }),
          },
          include: {
            parent: true,
            _count: {
              select: {
                products: true,
                subcategories: true,
              },
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: category,
          message: 'Category updated successfully',
        });
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          );
        }

        console.error('Error updating category:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update category' },
          { status: 500 }
        );
      }
    },
    { resource: 'category', action: 'UPDATE' }
  )
);

// DELETE category
export const DELETE = requireAuth(
  withAudit(
    async (request: NextRequest, user) => {
      try {
        const { workspaceId } = user;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Category ID is required' },
            { status: 400 }
          );
        }

        // Verify category exists and belongs to workspace
        const category = await db.category.findFirst({
          where: {
            id,
            workspace_id: workspaceId,
          },
          include: {
            _count: {
              select: {
                products: true,
                subcategories: true,
              },
            },
          },
        });

        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category not found' },
            { status: 404 }
          );
        }

        // Check if category has products
        if (category._count.products > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot delete category with ${category._count.products} product(s). Please reassign or delete products first.`,
            },
            { status: 400 }
          );
        }

        // Check if category has subcategories
        if (category._count.subcategories > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot delete category with ${category._count.subcategories} subcategory(ies). Please delete subcategories first.`,
            },
            { status: 400 }
          );
        }

        await db.category.delete({
          where: { id },
        });

        return NextResponse.json({
          success: true,
          message: 'Category deleted successfully',
        });
      } catch (error: unknown) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete category' },
          { status: 500 }
        );
      }
    },
    { resource: 'category', action: 'DELETE' }
  )
);
