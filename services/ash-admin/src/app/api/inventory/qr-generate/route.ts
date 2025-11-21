import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { createErrorResponse } from '@/lib/error-sanitization';

/**
 * Generate QR codes for product variants
 * POST /api/inventory/qr-generate
 *
 * Permissions: inventory:admin (admin only)
 *
 * Request body:
 * - variant_ids: string[] - Array of variant IDs to generate QR codes for
 * - format: 'png' | 'svg' | 'dataurl' (optional, default: 'dataurl')
 * - size: number (optional, default: 300)
 *
 * Response:
 * - qr_codes: Array of generated QR codes with variant info
 */

// Force dynamic route (don't pre-render during build)
export const dynamic = 'force-dynamic';

export const POST = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { variant_ids, format = 'dataurl', size = 300 } = body;

      // Validate input
      if (!variant_ids || !Array.isArray(variant_ids) || variant_ids.length === 0) {
        return NextResponse.json(
          { error: 'variant_ids array is required' },
          { status: 400 }
        );
      }

      if (variant_ids.length > 100) {
        return NextResponse.json(
          { error: 'Maximum 100 variants per request' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Get variant details
      const variants = await db.productVariant.findMany({
        where: {
          id: { in: variant_ids },
          product: { workspace_id },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              base_sku: true,
              category: true,
            },
          },
        },
      });

      if (variants.length === 0) {
        return NextResponse.json(
          { error: 'No variants found for the provided IDs' },
          { status: 404 }
        );
      }

      // Generate QR codes
      const qr_codes = await Promise.all(
        variants.map(async (variant) => {
          // QR code data format: https://inventory.yourdomain.com/i/{product_id}?v={variant_id}
          const qrData = `https://inventory.ashleyai.com/i/${variant.product.id}?v=${variant.id}`;

          let qrCode: string;

          try {
            if (format === 'svg') {
              qrCode = await QRCode.toString(qrData, {
                type: 'svg',
                width: size,
              });
            } else if (format === 'png') {
              const buffer = await QRCode.toBuffer(qrData, {
                width: size,
                type: 'png',
              });
              qrCode = buffer.toString('base64');
            } else {
              // dataurl (default)
              qrCode = await QRCode.toDataURL(qrData, {
                width: size,
                margin: 2,
              });
            }
          } catch (qrError) {
            // Error will be caught and sanitized by outer handler
            throw new Error(`Failed to generate QR code for variant ${variant.id}`);
          }

          return {
            variant_id: variant.id,
            product_id: variant.product.id,
            product_name: variant.product.name,
            variant_name: variant.variant_name,
            sku: variant.sku,
            barcode: variant.barcode,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            qr_code: qrCode,
            qr_data: qrData,
            format,
          };
        })
      );

      console.log(`[QR GENERATE] Generated ${qr_codes.length} QR codes for workspace ${workspace_id}`);

      return NextResponse.json({
        success: true,
        count: qr_codes.length,
        format,
        qr_codes,
      });
    } catch (error) {
      return createErrorResponse(error, 500, {
        userId: user.id,
        path: request.url,
      });
    }
  }
);

/**
 * Get all variants for QR code generation
 * GET /api/inventory/qr-generate
 *
 * Query params:
 * - search: string (optional) - Search by product name or SKU
 * - category: string (optional) - Filter by category
 *
 * Response:
 * - variants: Array of variants available for QR generation
 */
export const GET = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const category = searchParams.get('category');

      const workspace_id = user.workspaceId;

      const where: any = {
        product: { workspace_id },
      };

      // Apply search filter
      if (search) {
        where.OR = [
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { sku: { contains: search, mode: 'insensitive' } },
          { variant_name: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Apply category filter
      if (category) {
        where.product = {
          ...where.product,
          category,
        };
      }

      const variants = await db.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              base_sku: true,
              category: true,
              photo_url: true,
            },
          },
        },
        orderBy: [
          { product: { name: 'asc' } },
          { variant_name: 'asc' },
        ],
        take: 200, // Limit to prevent performance issues
      });

      return NextResponse.json({
        success: true,
        count: variants.length,
        variants: variants.map((v) => ({
          variant_id: v.id,
          product_id: v.product.id,
          product_name: v.product.name,
          variant_name: v.variant_name,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: v.price,
          has_qr_code: !!v.qr_code,
          category: v.product.category,
        })),
      });
    } catch (error) {
      return createErrorResponse(error, 500, {
        userId: user.id,
        path: request.url,
      });
    }
  }
);
