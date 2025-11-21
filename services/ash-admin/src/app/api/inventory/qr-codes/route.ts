import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { createErrorResponse } from '@/lib/error-sanitization';

/**
 * QR Code Management API
 * Comprehensive QR code generation, tracking, and lifecycle management
 *
 * POST /api/inventory/qr-codes - Generate and save QR codes
 * GET /api/inventory/qr-codes - List all QR codes with filters
 * PATCH /api/inventory/qr-codes - Update QR code status
 * DELETE /api/inventory/qr-codes - Delete/deactivate QR codes
 */

// Force dynamic route
export const dynamic = 'force-dynamic';

// Constants
const MAX_QR_CODES_PER_REQUEST = 500;
const MIN_QR_SIZE = 100;
const MAX_QR_SIZE = 1000;
const QR_TYPES = ['PRODUCT', 'VARIANT', 'BUNDLE', 'BATCH'] as const;
const WORKFLOW_TYPES = ['INVENTORY_FIRST', 'ORDER_FIRST'] as const;

// Helper function to generate QR code image
async function generateQRCodeImage(data: string, size: number): Promise<string> {
  return QRCode.toDataURL(data, { width: size, margin: 2 });
}

// Helper function to create QR data objects for batch insert
interface QRCodeData {
  workspace_id: string;
  qr_code: string;
  qr_type: string;
  product_id?: string;
  variant_id?: string;
  category_id?: string | null;
  brand_id?: string | null;
  batch_id?: string;
  order_id?: string;
  workflow_type: string;
  status: string;
  generated_by: string;
}

/**
 * POST - Generate QR Codes (OPTIMIZED)
 *
 * Body:
 * - qr_type: 'PRODUCT' | 'VARIANT' | 'BUNDLE' | 'BATCH'
 * - workflow_type: 'INVENTORY_FIRST' | 'ORDER_FIRST'
 * - product_ids?: string[] - For product-level QR codes
 * - variant_ids?: string[] - For variant-level QR codes
 * - category_id?: string - For batch generation by category
 * - brand_id?: string - For batch generation by brand
 * - order_id?: string - For order-first workflow
 * - batch_id?: string - For tracking batch printing
 * - format?: 'png' | 'svg' | 'dataurl' (default: 'dataurl')
 * - size?: number (default: 300)
 */
export const POST = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        qr_type,
        workflow_type = 'INVENTORY_FIRST',
        product_ids,
        variant_ids,
        category_id,
        brand_id,
        order_id,
        batch_id,
        format = 'dataurl',
        size = 300,
      } = body;

      const workspace_id = user.workspaceId;
      const generated_by = user.id;

      // Input Validation
      if (!qr_type || !QR_TYPES.includes(qr_type)) {
        return NextResponse.json(
          { error: `qr_type must be one of: ${QR_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      if (!WORKFLOW_TYPES.includes(workflow_type)) {
        return NextResponse.json(
          { error: `workflow_type must be one of: ${WORKFLOW_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate size parameter
      const validSize = Math.min(Math.max(size, MIN_QR_SIZE), MAX_QR_SIZE);

      // Validate array sizes
      if (product_ids && product_ids.length > MAX_QR_CODES_PER_REQUEST) {
        return NextResponse.json(
          { error: `Maximum ${MAX_QR_CODES_PER_REQUEST} products per request` },
          { status: 400 }
        );
      }

      if (variant_ids && variant_ids.length > MAX_QR_CODES_PER_REQUEST) {
        return NextResponse.json(
          { error: `Maximum ${MAX_QR_CODES_PER_REQUEST} variants per request` },
          { status: 400 }
        );
      }

      let generatedQRCodes: any[] = [];
      let qrDataObjects: QRCodeData[] = [];

      // OPTIMIZATION: Generate QR codes based on type with parallel processing
      if (qr_type === 'PRODUCT' && product_ids && product_ids.length > 0) {
        // Fetch all products in one query
        const products = await db.inventoryProduct.findMany({
          where: {
            id: { in: product_ids },
            workspace_id,
          },
          include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        });

        // OPTIMIZATION: Parallel QR code generation
        const qrGenerationPromises = products.map(async (product) => {
          const qrData = `https://inventory.ashleyai.com/p/${product.id}`;
          const qrCodeImage = await generateQRCodeImage(qrData, validSize);

          return {
            qrData,
            qrCodeImage,
            product,
            data: {
              workspace_id,
              qr_code: qrData,
              qr_type: 'PRODUCT',
              product_id: product.id,
              category_id: product.category_id,
              brand_id: product.brand_id,
              batch_id,
              order_id,
              workflow_type,
              status: 'GENERATED',
              generated_by,
            } as QRCodeData,
          };
        });

        const results = await Promise.all(qrGenerationPromises);

        qrDataObjects = results.map((r) => r.data);

        // OPTIMIZATION: Batch insert all QR codes at once
        const createdQRCodes = await db.$transaction(
          qrDataObjects.map((data) => db.qRCode.create({ data }))
        );

        generatedQRCodes = results.map((r, i) => ({
          ...createdQRCodes[i],
          qr_code_image: r.qrCodeImage,
          product_name: r.product.name,
          category: r.product.category?.name,
          brand: r.product.brand?.name,
        }));

      } else if (qr_type === 'VARIANT' && variant_ids && variant_ids.length > 0) {
        // Fetch all variants in one query
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
                category_id: true,
                brand_id: true,
                category: { select: { name: true } },
                brand: { select: { name: true } },
              },
            },
          },
        });

        // OPTIMIZATION: Parallel QR code generation
        const qrGenerationPromises = variants.map(async (variant) => {
          const qrData = `https://inventory.ashleyai.com/i/${variant.product.id}?v=${variant.id}`;
          const qrCodeImage = await generateQRCodeImage(qrData, validSize);

          return {
            qrData,
            qrCodeImage,
            variant,
            data: {
              workspace_id,
              qr_code: qrData,
              qr_type: 'VARIANT',
              product_id: variant.product_id,
              variant_id: variant.id,
              category_id: variant.product.category_id,
              brand_id: variant.product.brand_id,
              batch_id,
              order_id,
              workflow_type,
              status: 'GENERATED',
              generated_by,
            } as QRCodeData,
          };
        });

        const results = await Promise.all(qrGenerationPromises);

        qrDataObjects = results.map((r) => r.data);

        // OPTIMIZATION: Batch insert with transaction
        const createdQRCodes = await db.$transaction(
          qrDataObjects.map((data) => db.qRCode.create({ data }))
        );

        generatedQRCodes = results.map((r, i) => ({
          ...createdQRCodes[i],
          qr_code_image: r.qrCodeImage,
          product_name: r.variant.product.name,
          variant_name: r.variant.variant_name,
          sku: r.variant.sku,
          category: r.variant.product.category?.name,
          brand: r.variant.product.brand?.name,
        }));

      } else if ((category_id || brand_id) && qr_type === 'BATCH') {
        // Batch generation by category or brand
        const where: any = { workspace_id, is_active: true };
        if (category_id) where.category_id = category_id;
        if (brand_id) where.brand_id = brand_id;

        const products = await db.inventoryProduct.findMany({
          where,
          include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            variants: {
              where: { is_active: true },
              select: { id: true, variant_name: true, sku: true },
            },
          },
          take: 100, // Limit to prevent performance issues
        });

        const batchIdGenerated = batch_id || `BATCH-${Date.now()}`;

        // OPTIMIZATION: Flatten variants and process in parallel
        const allVariants = products.flatMap((product) =>
          product.variants.map((variant) => ({ product, variant }))
        );

        // Validate total count
        if (allVariants.length > MAX_QR_CODES_PER_REQUEST) {
          return NextResponse.json(
            { error: `Batch would generate ${allVariants.length} QR codes. Maximum is ${MAX_QR_CODES_PER_REQUEST}. Please use more specific filters.` },
            { status: 400 }
          );
        }

        // OPTIMIZATION: Parallel QR generation for all variants
        const qrGenerationPromises = allVariants.map(async ({ product, variant }) => {
          const qrData = `https://inventory.ashleyai.com/i/${product.id}?v=${variant.id}`;
          const qrCodeImage = await generateQRCodeImage(qrData, validSize);

          return {
            qrData,
            qrCodeImage,
            product,
            variant,
            data: {
              workspace_id,
              qr_code: qrData,
              qr_type: 'VARIANT',
              product_id: product.id,
              variant_id: variant.id,
              category_id: product.category_id,
              brand_id: product.brand_id,
              batch_id: batchIdGenerated,
              order_id,
              workflow_type,
              status: 'GENERATED',
              generated_by,
            } as QRCodeData,
          };
        });

        const results = await Promise.all(qrGenerationPromises);

        qrDataObjects = results.map((r) => r.data);

        // OPTIMIZATION: Batch insert with transaction
        const createdQRCodes = await db.$transaction(
          qrDataObjects.map((data) => db.qRCode.create({ data }))
        );

        generatedQRCodes = results.map((r, i) => ({
          ...createdQRCodes[i],
          qr_code_image: r.qrCodeImage,
          product_name: r.product.name,
          variant_name: r.variant.variant_name,
          sku: r.variant.sku,
          category: r.product.category?.name,
          brand: r.product.brand?.name,
        }));

      } else {
        return NextResponse.json(
          { error: 'Invalid parameters. Please provide product_ids, variant_ids, or category_id/brand_id for batch generation' },
          { status: 400 }
        );
      }

      console.log(`[QR CODES] Generated ${generatedQRCodes.length} QR codes for workspace ${workspace_id}`);

      return NextResponse.json({
        success: true,
        count: generatedQRCodes.length,
        qr_type,
        workflow_type,
        batch_id: batch_id || generatedQRCodes[0]?.batch_id,
        qr_codes: generatedQRCodes,
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
 * GET - List QR Codes
 *
 * Query params:
 * - status?: 'GENERATED' | 'PRINTED' | 'ASSIGNED' | 'SCANNED' | 'INACTIVE'
 * - qr_type?: 'PRODUCT' | 'VARIANT' | 'BUNDLE' | 'BATCH'
 * - workflow_type?: 'INVENTORY_FIRST' | 'ORDER_FIRST'
 * - category_id?: string
 * - brand_id?: string
 * - product_id?: string
 * - batch_id?: string
 * - order_id?: string
 * - search?: string
 * - limit?: number (default: 50)
 * - offset?: number (default: 0)
 */
export const GET = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const qr_type = searchParams.get('qr_type');
      const workflow_type = searchParams.get('workflow_type');
      const category_id = searchParams.get('category_id');
      const brand_id = searchParams.get('brand_id');
      const product_id = searchParams.get('product_id');
      const batch_id = searchParams.get('batch_id');
      const order_id = searchParams.get('order_id');
      const search = searchParams.get('search');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200); // Max 200
      const offset = parseInt(searchParams.get('offset') || '0');

      const workspace_id = user.workspaceId;

      const where: any = {
        workspace_id,
        is_active: true,
      };

      if (status) where.status = status;
      if (qr_type) where.qr_type = qr_type;
      if (workflow_type) where.workflow_type = workflow_type;
      if (category_id) where.category_id = category_id;
      if (brand_id) where.brand_id = brand_id;
      if (product_id) where.product_id = product_id;
      if (batch_id) where.batch_id = batch_id;
      if (order_id) where.order_id = order_id;

      // OPTIMIZATION: Use Promise.all for parallel queries
      const [qrCodes, total, stats] = await Promise.all([
        db.qRCode.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                base_sku: true,
                photo_url: true,
              },
            },
            variant: {
              select: {
                id: true,
                variant_name: true,
                sku: true,
                size: true,
                color: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
                code: true,
                logo_url: true,
              },
            },
            order: {
              select: {
                id: true,
                order_number: true,
                status: true,
              },
            },
            generator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
        }),
        db.qRCode.count({ where }),
        db.qRCode.groupBy({
          by: ['status'],
          where: { workspace_id, is_active: true },
          _count: true,
        }),
      ]);

      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        success: true,
        count: qrCodes.length,
        total,
        limit,
        offset,
        has_more: offset + qrCodes.length < total,
        stats: statusCounts,
        qr_codes: qrCodes,
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
 * PATCH - Update QR Code Status/Details
 *
 * Body:
 * - qr_code_ids: string[] - Array of QR code IDs to update
 * - status?: 'GENERATED' | 'PRINTED' | 'ASSIGNED' | 'SCANNED' | 'INACTIVE'
 * - increment_print_count?: boolean - Increment print count
 * - increment_scan_count?: boolean - Increment scan count
 * - notes?: string
 * - metadata?: object
 */
export const PATCH = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        qr_code_ids,
        status,
        increment_print_count,
        increment_scan_count,
        notes,
        metadata,
      } = body;

      if (!qr_code_ids || !Array.isArray(qr_code_ids) || qr_code_ids.length === 0) {
        return NextResponse.json(
          { error: 'qr_code_ids array is required' },
          { status: 400 }
        );
      }

      // Validate array size
      if (qr_code_ids.length > MAX_QR_CODES_PER_REQUEST) {
        return NextResponse.json(
          { error: `Maximum ${MAX_QR_CODES_PER_REQUEST} QR codes per request` },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      const updateData: any = {
        updated_at: new Date(),
      };

      if (status) {
        const validStatuses = ['GENERATED', 'PRINTED', 'ASSIGNED', 'SCANNED', 'INACTIVE'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: `status must be one of: ${validStatuses.join(', ')}` },
            { status: 400 }
          );
        }
        updateData.status = status;
      }

      if (notes !== undefined) updateData.notes = notes;
      if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);

      // OPTIMIZATION: Handle scan/print tracking with batch update
      if (increment_scan_count || increment_print_count) {
        const qrCodes = await db.qRCode.findMany({
          where: {
            id: { in: qr_code_ids },
            workspace_id,
          },
          select: { id: true, scan_count: true, print_count: true, first_scanned_at: true },
        });

        // OPTIMIZATION: Use transaction for batch updates
        await db.$transaction(
          qrCodes.map((qrCode) => {
            const updatePayload: any = { ...updateData };

            if (increment_scan_count) {
              updatePayload.scan_count = qrCode.scan_count + 1;
              updatePayload.last_scanned_at = new Date();
              if (!qrCode.first_scanned_at) {
                updatePayload.first_scanned_at = new Date();
              }
              if (!status) {
                updatePayload.status = 'SCANNED';
              }
            }

            if (increment_print_count) {
              updatePayload.print_count = qrCode.print_count + 1;
              if (!status) {
                updatePayload.status = 'PRINTED';
              }
            }

            return db.qRCode.update({
              where: { id: qrCode.id },
              data: updatePayload,
            });
          })
        );
      } else {
        // Standard batch update
        await db.qRCode.updateMany({
          where: {
            id: { in: qr_code_ids },
            workspace_id,
          },
          data: updateData,
        });
      }

      console.log(`[QR CODES] Updated ${qr_code_ids.length} QR codes for workspace ${workspace_id}`);

      return NextResponse.json({
        success: true,
        updated_count: qr_code_ids.length,
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
 * DELETE - Delete/Deactivate QR Codes
 *
 * Body:
 * - qr_code_ids: string[] - Array of QR code IDs to delete
 * - permanent?: boolean - Permanently delete (default: false, just deactivate)
 */
export const DELETE = requirePermission('inventory:report')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { qr_code_ids, permanent = false } = body;

      if (!qr_code_ids || !Array.isArray(qr_code_ids) || qr_code_ids.length === 0) {
        return NextResponse.json(
          { error: 'qr_code_ids array is required' },
          { status: 400 }
        );
      }

      // Validate array size
      if (qr_code_ids.length > MAX_QR_CODES_PER_REQUEST) {
        return NextResponse.json(
          { error: `Maximum ${MAX_QR_CODES_PER_REQUEST} QR codes per request` },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      if (permanent) {
        // Permanently delete
        await db.qRCode.deleteMany({
          where: {
            id: { in: qr_code_ids },
            workspace_id,
          },
        });
      } else {
        // Soft delete (deactivate) - OPTIMIZATION: Use updateMany
        await db.qRCode.updateMany({
          where: {
            id: { in: qr_code_ids },
            workspace_id,
          },
          data: {
            is_active: false,
            status: 'INACTIVE',
            updated_at: new Date(),
          },
        });
      }

      console.log(`[QR CODES] Deleted ${qr_code_ids.length} QR codes (permanent: ${permanent}) for workspace ${workspace_id}`);

      return NextResponse.json({
        success: true,
        deleted_count: qr_code_ids.length,
        permanent,
      });
    } catch (error) {
      return createErrorResponse(error, 500, {
        userId: user.id,
        path: request.url,
      });
    }
  }
);
