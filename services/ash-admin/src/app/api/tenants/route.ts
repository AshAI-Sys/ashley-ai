/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { tenantManager } from "@/lib/multi-tenant/tenant-manager";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


// POST /api/tenants - Create new tenant workspace
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const {
      name,
      slug,
      subscription_tier = "FREE",
      max_users = 5,
      max_orders_per_month = 50,
      features_enabled = [],
      storage_quota_gb = 5,
      custom_domain,
      branding,
    } = await req.json();

    if (!name || !slug) {
      
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }
    const result = await tenantManager.createTenant({
      name,
      slug,
      subscription_tier,
      max_users,
      max_orders_per_month,
      features_enabled,
      storage_quota_gb,
      custom_domain,
      branding,
    });

    return NextResponse.json(
      {
        ...result,
        message: "Tenant created successfully",
      },
      { status: 201 }
    );
  
  } catch (error: any) {
    console.error("Create tenant error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant", details: error.message },
      { status: 500 }
    );
  }
});

// GET /api/tenants?workspace_id=xxx - Get tenant information
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const workspace_id = searchParams.get("workspace_id");

    if (!workspace_id) {
      
      return NextResponse.json(
        { error: "workspace_id parameter required" },
        { status: 400 }
      );
    }
    const config = await tenantManager.getTenantConfig(workspace_id);

    if (!config) {
      
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }
        const limits = await tenantManager.checkLimits(workspace_id);
    const stats = await tenantManager.getTenantStats(workspace_id);

    return NextResponse.json({
      config,
      limits,
      stats,
    });
  } catch (error: any) {
    console.error("Get tenant error:", error);
    return NextResponse.json(
      { error: "Failed to get tenant", details: error.message },
      { status: 500 }
    );
  }
});

// PUT /api/tenants - Update tenant configuration
export const PUT = requireAuth(async (req: NextRequest, _user) => {
  try {
    const { workspace_id, ...updates } = await req.json();

    if (!workspace_id) {
      
      return NextResponse.json(
        { error: "workspace_id is required" },
        { status: 400 }
      );
    }
        const success = await tenantManager.updateTenantConfig(
      workspace_id,
      updates
    );

    if (!success) {
      
      return NextResponse.json(
        { error: "Failed to update tenant configuration" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: "Tenant configuration updated",
    });
  } catch (error: any) {
    console.error("Update tenant error:", error);
    return NextResponse.json(
      { error: "Failed to update tenant", details: error.message },
      { status: 500 }
    );
  }
});

// DELETE /api/tenants?workspace_id=xxx&confirmation=slug - Delete tenant
export const DELETE = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const workspace_id = searchParams.get("workspace_id");
    const confirmation = searchParams.get("confirmation");

    if (!workspace_id || !confirmation) {
      
      return NextResponse.json(
        { error: "workspace_id and confirmation (slug) are required" },
        { status: 400 }
      );
    }
    const success = await tenantManager.deleteTenant(
      workspace_id,
      confirmation
    );

    if (!success) {

      return NextResponse.json(
        { error: "Failed to delete tenant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Tenant deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete tenant error:", error);
    return NextResponse.json(
      { error: "Failed to delete tenant", details: error.message },
      { status: 500 }
    );
  }
});
