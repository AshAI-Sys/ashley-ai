/**
 * GET /api/inventory/product/:id
 * Fetch product details and stock info for QR scanner
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspace_id } = authResult.user;
    const productId = params.id;

    // Check if it's a variant_id from QR code (?v=variant_id)
    const url = new URL(request.url);
    const variantId = url.searchParams.get('v');

    if (variantId) {
      // Fetch specific variant with stock info
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: true,
          stock_ledger: {
            where: { workspace_id },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      });

      if (!variant) {
        return NextResponse.json(
          { success: false, error: 'Product variant not found' },
          { status: 404 }
        );
      }

      // Calculate current stock across all locations
      const stockByLocation = await prisma.stock_ledger.groupBy({
        by: ['location_id'],
        where: {
          workspace_id,
          variant_id: variantId,
        },
        _sum: {
          quantity_change: true,
        },
      });

      const locations = await prisma.storeLocation.findMany({
        where: {
          workspace_id,
          id: { in: stockByLocation.map((s) => s.location_id) },
        },
      });

      const stock = stockByLocation.map((s) => ({
        location_id: s.location_id,
        location_name: locations.find((l) => l.id === s.location_id)?.location_name || 'Unknown',
        location_code: locations.find((l) => l.id === s.location_id)?.location_code || 'Unknown',
        quantity: s._sum.quantity_change || 0,
      }));

      const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0);

      return NextResponse.json({
        success: true,
        data: {
          id: variant.id,
          product_id: variant.product.id,
          product_name: variant.product.name,
          variant_name: variant.variant_name,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.price,
          cost: variant.cost,
          photo_url: variant.product.photo_url,
          description: variant.product.description,
          category: variant.product.category,
          size: variant.size,
          color: variant.color,
          stock,
          total_stock: totalStock,
          is_out_of_stock: totalStock <= 0,
        },
      });
    } else {
      // Fetch product with all variants
      const product = await prisma.inventoryProduct.findFirst({
        where: {
          id: productId,
          workspace_id,
        },
        include: {
          variants: {
            where: { is_active: true },
            include: {
              stock_ledger: {
                where: { workspace_id },
                orderBy: { created_at: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: product,
      });
    }
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product', details: message },
      { status: 500 }
    );
  }
}
