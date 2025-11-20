import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/auto-reorder
 * Fetch all auto-reorder settings for the authenticated user's workspace
 *
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const enabled = searchParams.get("enabled");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = { workspace_id };

    // Filter by enabled status
    if (enabled !== null && enabled !== undefined) {
      where.enabled = enabled === "true";
    }

    // Search filter (search material inventory)
    if (search) {
      where.material_inventory_id = { contains: search };
    }

    const skip = (page - 1) * limit;

    const [settings, totalCount] = await Promise.all([
      prisma.autoReorderSetting.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.autoReorderSetting.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      settings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[API] Error fetching auto-reorder settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auto-reorder settings" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/inventory/auto-reorder
 * Create new auto-reorder setting in the authenticated user's workspace
 *
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const body = await request.json();

    const {
      material_inventory_id,
      enabled = true,
      reorder_point,
      reorder_quantity,
      preferred_supplier_id,
      lead_time_days,
      safety_stock_days = 7,
      notes,
    } = body;

    // Validate required fields
    if (!material_inventory_id || !reorder_point || !reorder_quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "material_inventory_id, reorder_point, and reorder_quantity are required"
        },
        { status: 400 }
      );
    }

    // Check if material_inventory exists
    const materialInventory = await prisma.materialInventory.findFirst({
      where: {
        id: material_inventory_id,
        workspace_id,
      },
    });

    if (!materialInventory) {
      return NextResponse.json(
        { success: false, error: "Material inventory not found" },
        { status: 404 }
      );
    }

    // Check if auto-reorder setting already exists for this material
    const existing = await prisma.autoReorderSetting.findUnique({
      where: { material_inventory_id },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Auto-reorder setting already exists for this material"
        },
        { status: 409 }
      );
    }

    // Verify preferred_supplier exists if provided
    if (preferred_supplier_id) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: preferred_supplier_id,
          workspace_id,
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { success: false, error: "Preferred supplier not found" },
          { status: 404 }
        );
      }
    }

    // Create auto-reorder setting
    const setting = await prisma.autoReorderSetting.create({
      data: {
        workspace_id,
        material_inventory_id,
        enabled,
        reorder_point,
        reorder_quantity,
        preferred_supplier_id,
        lead_time_days,
        safety_stock_days,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Auto-reorder setting created successfully",
      setting,
    });
  } catch (error) {
    console.error("[API] Error creating auto-reorder setting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create auto-reorder setting" },
      { status: 500 }
    );
  }
});
