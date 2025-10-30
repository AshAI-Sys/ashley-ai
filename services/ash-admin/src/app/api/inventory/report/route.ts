/**
 * GET /api/inventory/report
 * Get stock report by location, product, variant
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspace_id } = authResult.user;
    const { searchParams } = new URL(request.url);
    const location_code = searchParams.get('location');
    const product_id = searchParams.get('product_id');
    const low_stock_only = searchParams.get('low_stock') === 'true';
    const threshold = parseInt(searchParams.get('threshold') || '10', 10);

    // Build filters
    const locationFilter = location_code
      ? { location: { location_code } }
      : {};

    const variantFilter = product_id
      ? { variant: { product_id } }
      : {};

    // Get all stock ledger entries grouped by variant and location
    const stockByVariantLocation = await prisma.stockLedger.groupBy({
      by: ['variant_id', 'location_id'],
      where: {
        workspace_id,
        ...locationFilter,
        ...variantFilter,
      },
      _sum: {
        quantity_change: true,
      },
    });

    // Get variant and location details
    const variantIds = [...new Set(stockByVariantLocation.map((s) => s.variant_id))];
    const locationIds = [...new Set(stockByVariantLocation.map((s) => s.location_id))];

    const [variants, locations] = await Promise.all([
      prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      }),
      prisma.storeLocation.findMany({
        where: { id: { in: locationIds } },
      }),
    ]);

    // Build report
    const report = stockByVariantLocation.map((stock) => {
      const variant = variants.find((v) => v.id === stock.variant_id);
      const location = locations.find((l) => l.id === stock.location_id);
      const quantity = stock._sum.quantity_change || 0;

      return {
        variant_id: stock.variant_id,
        location_id: stock.location_id,
        product_id: variant?.product.id,
        product_name: variant?.product.name,
        variant_name: variant?.variant_name,
        sku: variant?.sku,
        price: variant?.price,
        photo_url: variant?.product.photo_url,
        location_name: location?.location_name,
        location_code: location?.location_code,
        location_type: location?.location_type,
        quantity,
        is_low_stock: quantity <= threshold,
        is_out_of_stock: quantity <= 0,
      };
    });

    // Filter low stock if requested
    const filteredReport = low_stock_only
      ? report.filter((item) => item.is_low_stock)
      : report;

    // Sort by quantity (low stock first)
    filteredReport.sort((a, b) => a.quantity - b.quantity);

    // Calculate summary
    const summary = {
      total_products: [...new Set(filteredReport.map((r) => r.product_id))].length,
      total_variants: filteredReport.length,
      total_quantity: filteredReport.reduce((sum, r) => sum + r.quantity, 0),
      low_stock_count: filteredReport.filter((r) => r.is_low_stock).length,
      out_of_stock_count: filteredReport.filter((r) => r.is_out_of_stock).length,
      locations: [...new Set(filteredReport.map((r) => r.location_code))],
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        items: filteredReport,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating inventory report:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to generate report', details: message },
      { status: 500 }
    );
  }
}
