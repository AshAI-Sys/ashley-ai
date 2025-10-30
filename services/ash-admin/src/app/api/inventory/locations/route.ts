/**
 * CRUD operations for Store Locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;

    const locations = await prisma.storeLocation.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { location_code: 'asc' },
    });

    return NextResponse.json({ success: true, data: locations });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to fetch locations' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const { location_code, location_name, location_type, address } = body;

    if (!location_code || !location_name || !location_type) {
      return NextResponse.json(
        { success: false, error: 'location_code, location_name, and location_type are required' },
        { status: 400 }
      );
    }

    const location = await prisma.storeLocation.create({
      data: { workspace_id: workspaceId, location_code, location_name, location_type, address },
    });

    return NextResponse.json({ success: true, data: location });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to create location' }, { status: 500 });
  }
});

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const body = await request.json();
    const { id, ...data } = body;

    const location = await prisma.storeLocation.update({
      where: { id, workspace_id: workspaceId },
      data,
    });

    return NextResponse.json({ success: true, data: location });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to update location' }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { workspaceId } = user;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await prisma.storeLocation.delete({ where: { id, workspace_id: workspaceId } });

    return NextResponse.json({ success: true, message: 'Location deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to delete location' }, { status: 500 });
  }
});
