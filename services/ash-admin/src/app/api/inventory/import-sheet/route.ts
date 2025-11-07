import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

interface SheetRow {
  size: string;
  sku: string;
  crate: string;
  quantity: number;
  price: number;
  salePrice?: number;
  brand?: string;
  status: string;
}

export const POST = requireAuth(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    const { sheetData, productName, clientName, orderNumber } = body;

    if (!sheetData || !Array.isArray(sheetData)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sheet data' },
        { status: 400 }
      );
    }

    // Get or create workspace
    let workspace = await prisma.workspace.findFirst({
      where: { id: user.workspace_id || user.workspaceId }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'demo-workspace-1',
          slug: 'demo-workspace-1',
        }
      });
    }

    // Get or create client
    let client = await prisma.client.findFirst({
      where: {
        name: clientName || 'Reefer\'s Inn',
        workspace_id: workspace.id
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          workspace_id: workspace.id,
          name: clientName || 'Reefer\'s Inn',
          contact_person: 'John Doe',
          email: 'contact@reefersinn.com',
          phone: '+63 912 345 6789',
          address: 'Manila, Philippines',
        }
      });
    }

    // Get or create order
    let order = await prisma.order.findFirst({
      where: {
        order_number: orderNumber || 'ORD-IMPORT-001',
        workspace_id: workspace.id
      }
    });

    if (!order) {
      // Calculate total amount
      const totalAmount = sheetData.reduce((sum: number, row: SheetRow) => {
        return sum + (row.price * row.quantity);
      }, 0);

      order = await prisma.order.create({
        data: {
          workspace_id: workspace.id,
          client_id: client.id,
          order_number: orderNumber || 'ORD-IMPORT-001',
          design_name: productName || 'Imported Product',
          total_amount: totalAmount,
          status: 'PRODUCTION',
          delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      });
    }

    // Delete existing finished units for this order
    await prisma.finishedUnit.deleteMany({
      where: {
        order_id: order.id,
        workspace_id: workspace.id
      }
    });

    // Import each row from sheet
    let importedCount = 0;
    const errors: string[] = [];

    for (const row of sheetData as SheetRow[]) {
      try {
        const { size, sku, crate, quantity, price, salePrice, brand, status } = row;

        // Determine if packed based on status or quantity
        const isPacked = status?.toLowerCase().includes('out of stock') || quantity === 0;

        // Create units
        if (quantity > 0) {
          // Create multiple units for available stock
          for (let i = 1; i <= quantity; i++) {
            await prisma.finishedUnit.create({
              data: {
                workspace_id: workspace.id,
                order_id: order.id,
                sku: sku,
                size_code: size,
                color: 'Black',
                serial: `${sku}-${String(i).padStart(3, '0')}`,
                product_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                crate_number: crate,
                category: 'T-SHIRT',
                brand: brand || null,
                price: price,
                sale_price: salePrice || null,
                packed: false,
              }
            });
          }
          importedCount += quantity;
        } else {
          // Create one unit for out of stock items
          await prisma.finishedUnit.create({
            data: {
              workspace_id: workspace.id,
              order_id: order.id,
              sku: sku,
              size_code: size,
              color: 'Black',
              serial: `${sku}-001`,
              product_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
              crate_number: crate,
              category: 'T-SHIRT',
              brand: brand || null,
              price: price,
              sale_price: salePrice || null,
              packed: true, // Out of stock
            }
          });
          importedCount += 1;
        }
      } catch (error: any) {
        errors.push(`Error importing ${row.size}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} units`,
      order_number: order.order_number,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: unknown) {
    console.error('Error importing sheet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import sheet data' },
      { status: 500 }
    );
  }
});

export const dynamic = 'force-dynamic';
