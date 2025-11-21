import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';
import { createErrorResponse } from '@/lib/error-sanitization';

export const dynamic = 'force-dynamic';

/**
 * GET /api/inventory/report
 * Get inventory report with stock levels by location
 * Requires: inventory:report permission
 */
export const GET = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const location_id = searchParams.get('location_id');

      // Use authenticated user's workspace
      const workspace_id = user.workspaceId;

      // Get stock aggregation by variant and location
      const stockQuery: any = {
        where: { workspace_id },
        by: ['variant_id', 'location_id'],
        _sum: { quantity_change: true }
      };

      if (location_id) {
        stockQuery.where.location_id = location_id;
      }

      const stockData = await db.stockLedger.groupBy(stockQuery);

      // Get variant details (filtered by workspace)
      const variantIds = [...new Set(stockData.map(s => s.variant_id))];
      const variants = await db.productVariant.findMany({
        where: { 
          id: { in: variantIds },
          product: { workspace_id } // Filter variants by workspace
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              photo_url: true,
              category: true,
              base_sku: true
            }
          }
        }
      });

      // Get location details (filtered by workspace)
      const locationIds = [...new Set(stockData.map(s => s.location_id))];
      const locations = await db.storeLocation.findMany({
        where: { 
          id: { in: locationIds },
          workspace_id // Filter locations by workspace
        }
      });

      // Build the report
      const report = stockData.map(stock => {
        const variant = variants.find(v => v.id === stock.variant_id);
        const location = locations.find(l => l.id === stock.location_id);
        const quantity = stock._sum?.quantity_change || 0;
        const value = quantity * (variant?.price || 0);
        const reorder_point = 10; // Default reorder point
        const is_low_stock = quantity <= reorder_point;

        return {
          product_id: variant?.product.id,
          product_name: variant?.product.name,
          product_category: variant?.product.category,
          variant_id: variant?.id,
          variant_name: variant?.variant_name,
          sku: variant?.sku,
          size: variant?.size,
          color: variant?.color,
          location_id: location?.id,
          location_code: location?.location_code,
          location_name: location?.location_name,
          quantity,
          unit_price: variant?.price || 0,
          total_value: value,
          reorder_point,
          is_low_stock,
          is_out_of_stock: quantity <= 0
        };
      });

      // Calculate summary statistics
      const total_items = report.length;
      const total_quantity = report.reduce((sum, item) => sum + item.quantity, 0);
      const total_value = report.reduce((sum, item) => sum + item.total_value, 0);
      const low_stock_count = report.filter(item => item.is_low_stock).length;
      const out_of_stock_count = report.filter(item => item.is_out_of_stock).length;

      // Group by location for summary
      const by_location = locationIds.map(locId => {
        const loc = locations.find(l => l.id === locId);
        const items = report.filter(r => r.location_id === locId);
        return {
          location_id: locId,
          location_code: loc?.location_code,
          location_name: loc?.location_name,
          total_items: items.length,
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          total_value: items.reduce((sum, item) => sum + item.total_value, 0),
          low_stock_items: items.filter(item => item.is_low_stock).length,
          out_of_stock_items: items.filter(item => item.is_out_of_stock).length
        };
      });

      return NextResponse.json({
        success: true,
        summary: {
          total_items,
          total_quantity,
          total_value,
          low_stock_count,
          out_of_stock_count,
          by_location
        },
        items: report
      });
    } catch (error) {
      return createErrorResponse(error, 500, {
        userId: user.id,
        path: request.url,
      });
    }
  }
);
