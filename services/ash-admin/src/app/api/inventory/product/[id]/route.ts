import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

// Force dynamic route (don't pre-render during build)
export const dynamic = 'force-dynamic';

/**
 * GET /api/inventory/product/:id?v=:variantId
 * Scan QR code and get product + stock info
 * Requires: inventory:read permission
 */
export const GET = requirePermission('inventory:read')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('v');

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID (v) is required' },
        { status: 400 }
      );
    }

    // Use authenticated user's workspace
    const workspace_id = user.workspaceId;

    // Get product with variant (filtered by workspace)
    const product = await db.inventoryProduct.findFirst({
      where: {
        id: productId,
        workspace_id, // Only products in user's workspace
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { id: variantId },
        },
      },
    });

    if (!product || product.variants.length === 0) {
      return NextResponse.json(
        { error: 'Product or variant not found' },
        { status: 404 }
      );
    }

    const variant = product.variants[0]!; // Safe because we checked length above

    // Get current stock by location (filtered by workspace)
    const stockByLocation = await db.stockLedger.groupBy({
      by: ['location_id'],
      where: {
        workspace_id,
        variant_id: variantId,
      },
      _sum: {
        quantity_change: true,
      },
    });

    // Get location names (filtered by workspace)
    const locations = await db.storeLocation.findMany({
      where: {
        workspace_id,
        id: {
          in: stockByLocation.map(s => s.location_id),
        },
      },
    });

    const stockInfo = stockByLocation.map(stock => {
      const location = locations.find(l => l.id === stock.location_id);
      return {
        location_code: location?.location_code || '',
        location_name: location?.location_name || '',
        quantity: stock._sum.quantity_change || 0,
      };
    });

    const totalQuantity = stockInfo.reduce((sum, s) => sum + s.quantity, 0);

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        photo_url: product.photo_url,
        base_sku: product.base_sku,
        category: product.category?.name || null,
        category_id: product.category_id,
        brand: product.brand?.name || null,
        brand_id: product.brand_id,
      },
      variant: {
        id: variant.id,
        variant_name: variant.variant_name,
        sku: variant.sku,
        barcode: variant.barcode,
        qr_code: variant.qr_code,
        price: variant.price,
        size: variant.size,
        color: variant.color,
      },
      stock: {
        total_quantity: totalQuantity,
        by_location: stockInfo,
        is_out_of_stock: totalQuantity <= 0,
      },
    });
  } catch (error: any) {
    console.error('[INVENTORY] Product scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
});
