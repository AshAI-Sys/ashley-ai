import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/delivery/drivers/[id]
 * Fetch a single driver by ID
 * Requires: delivery:view permission
 */
export const GET = requirePermission('delivery:view')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      const driver = await db.driver.findFirst({
        where: { id, workspace_id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          _count: {
            select: {
              driver_assignments: true,
              driver_performances: true,
            },
          },
        },
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: driver,
      });
    } catch (error: any) {
      console.error('[DELIVERY] Driver fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch driver' },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/delivery/drivers/[id]
 * Update driver information
 * Requires: delivery:manage permission
 */
export const PATCH = requirePermission('delivery:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;
      const body = await request.json();

      const existing = await db.driver.findFirst({
        where: { id, workspace_id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }

      const updated = await db.driver.update({
        where: { id },
        data: {
          ...(body.first_name && { first_name: body.first_name }),
          ...(body.last_name && { last_name: body.last_name }),
          ...(body.phone_number && { phone_number: body.phone_number }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.license_expiry && { license_expiry: new Date(body.license_expiry) }),
          ...(body.vehicle_type && { vehicle_type: body.vehicle_type }),
          ...(body.vehicle_plate_number && { vehicle_plate_number: body.vehicle_plate_number }),
          ...(body.vehicle_model !== undefined && { vehicle_model: body.vehicle_model }),
          ...(body.employment_type && { employment_type: body.employment_type }),
          ...(body.status && { status: body.status }),
          ...(body.date_terminated && { date_terminated: new Date(body.date_terminated) }),
          ...(body.emergency_contact !== undefined && { emergency_contact: body.emergency_contact }),
          ...(body.emergency_phone !== undefined && { emergency_phone: body.emergency_phone }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('[DELIVERY] Driver update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update driver' },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/delivery/drivers/[id]
 * Delete/deactivate driver
 * Requires: delivery:manage permission
 */
export const DELETE = requirePermission('delivery:manage')(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const workspace_id = user.workspaceId;
      const { id } = params;

      const existing = await db.driver.findFirst({
        where: { id, workspace_id },
        include: {
          _count: {
            select: {
              driver_assignments: true,
            },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }

      // Soft delete - set status to INACTIVE
      const updated = await db.driver.update({
        where: { id },
        data: {
          status: 'INACTIVE',
          date_terminated: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Driver deactivated',
        data: updated,
      });
    } catch (error: any) {
      console.error('[DELIVERY] Driver deletion error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete driver' },
        { status: 500 }
      );
    }
  }
);
