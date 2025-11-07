import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=query
 * Global search across orders, clients, and products
 */
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          orders: [],
          clients: [],
          products: [],
          total: 0,
        },
      });
    }

    const workspaceId = user.workspaceId;
    const searchTerm = query.trim();

    // Search orders
    const orders = await prisma.order.findMany({
      where: {
        workspace_id: workspaceId,
        OR: [
          { order_number: { contains: searchTerm, mode: 'insensitive' } },
          { po_number: { contains: searchTerm, mode: 'insensitive' } },
          { design_name: { contains: searchTerm, mode: 'insensitive' } },
          { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
      orderBy: { created_at: 'desc' },
    });

    // Search clients
    const clients = await prisma.client.findMany({
      where: {
        workspace_id: workspaceId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { contact_person: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { created_at: 'desc' },
    });

    // Search inventory products - using FinishedUnit model
    let products: any[] = [];
    try {
      const finishedUnits = await prisma.finishedUnit.findMany({
        where: {
          workspace_id: workspaceId,
          OR: [
            { sku: { contains: searchTerm, mode: 'insensitive' } },
            { serial: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { created_at: 'desc' },
      });
      products = finishedUnits.map((unit) => ({
        id: unit.id,
        name: unit.sku,
        sku: unit.sku,
        price: unit.price ? Number(unit.price) : 0,
      }));
    } catch (error) {
      // Product search failed, ignore error
      console.log('Product search skipped:', error);
    }

    const total = orders.length + clients.length + products.length;

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          type: 'order',
          title: order.order_number,
          subtitle: order.client.name,
          description: order.design_name || 'Order',
          status: order.status,
          url: `/orders/${order.id}`,
        })),
        clients: clients.map((client) => ({
          id: client.id,
          type: 'client',
          title: client.name,
          subtitle: client.contact_person,
          description: client.email,
          url: `/clients/${client.id}`,
        })),
        products: products.map((product) => ({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: product.sku,
          description: `₱${product.price?.toFixed(2) || '0.00'}`,
          url: `/inventory/product/${product.id}`,
        })),
        total,
        query: searchTerm,
      },
    });
  } catch (error: any) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
});
