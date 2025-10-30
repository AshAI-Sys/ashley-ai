/**
 * CRUD operations for Product Variants
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    const variants = await prisma.productVariant.findMany({
      where: product_id ? { product_id } : {},
      include: { product: true },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: variants });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to fetch variants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, variant_name, sku, barcode, price, cost, size, color } = body;

    const variant = await prisma.productVariant.create({
      data: { product_id, variant_name, sku, barcode, price, cost, size, color },
    });

    return NextResponse.json({ success: true, data: variant });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to create variant' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    const variant = await prisma.productVariant.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: variant });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to update variant' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await prisma.productVariant.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Variant deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to delete variant' }, { status: 500 });
  }
}
