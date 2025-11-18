import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/delivery/drivers
 * Fetch all drivers with filters
 * Requires: delivery:view permission
 */
export const GET = requirePermission('delivery:read')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;
      const status = searchParams.get('status');
      const employment_type = searchParams.get('employment_type');
      const search = searchParams.get('search');

      // Build where clause
      const where: any = { workspace_id };

      if (status) {
        where.status = status;
      }

      if (employment_type) {
        where.employment_type = employment_type;
      }

      if (search) {
        where.OR = [
          { driver_code: { contains: search, mode: 'insensitive' } },
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { license_number: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Fetch drivers
      const drivers = await db.driver.findMany({
        where,
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
        orderBy: {
          driver_code: 'asc',
        },
      });

      return NextResponse.json({
        success: true,
        data: drivers,
      });
    } catch (error: any) {
      console.error('[DELIVERY] Drivers fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch drivers' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/delivery/drivers
 * Create a new driver
 * Requires: delivery:manage permission
 */
export const POST = requirePermission('delivery:create')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        driver_code,
        user_id,
        first_name,
        last_name,
        phone_number,
        email,
        license_number,
        license_expiry,
        vehicle_type,
        vehicle_plate_number,
        vehicle_model,
        employment_type,
        date_hired,
        emergency_contact,
        emergency_phone,
        notes,
      } = body;

      // Validate required fields
      if (!driver_code || !first_name || !last_name || !phone_number ||
          !license_number || !license_expiry || !vehicle_type || !vehicle_plate_number || !date_hired) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Check for duplicate driver_code
      const existingCode = await db.driver.findUnique({
        where: {
          workspace_id_driver_code: {
            workspace_id,
            driver_code,
          },
        },
      });

      if (existingCode) {
        return NextResponse.json(
          { error: `Driver with code "${driver_code}" already exists` },
          { status: 400 }
        );
      }

      // Check for duplicate license_number
      const existingLicense = await db.driver.findUnique({
        where: {
          workspace_id_license_number: {
            workspace_id,
            license_number,
          },
        },
      });

      if (existingLicense) {
        return NextResponse.json(
          { error: `Driver with license number "${license_number}" already exists` },
          { status: 400 }
        );
      }

      // Create driver
      const driver = await db.driver.create({
        data: {
          workspace_id,
          driver_code,
          user_id,
          first_name,
          last_name,
          phone_number,
          email,
          license_number,
          license_expiry: new Date(license_expiry),
          vehicle_type,
          vehicle_plate_number,
          vehicle_model,
          employment_type: employment_type || 'FULL_TIME',
          status: 'ACTIVE',
          date_hired: new Date(date_hired),
          emergency_contact,
          emergency_phone,
          notes,
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
        data: driver,
      });
    } catch (error: any) {
      console.error('[DELIVERY] Driver creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create driver' },
        { status: 500 }
      );
    }
  }
);
