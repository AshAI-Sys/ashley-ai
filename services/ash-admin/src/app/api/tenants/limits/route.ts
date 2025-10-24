/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { tenantManager } from "@/lib/multi-tenant/tenant-manager";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/tenants/limits?workspace_id=xxx - Check tenant limits
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const workspace_id = searchParams.get("workspace_id");

    if (!workspace_id) {
      }
      return NextResponse.json(
        { error: "workspace_id parameter required" },
        { status: 400 }
      );
    }
    const limits = await tenantManager.checkLimits(workspace_id);

    // Calculate percentages
    const usersPercent = (limits.users.current / limits.users.max) * 100;
    const ordersPercent =
      (limits.orders.current_month / limits.orders.max) * 100;
    const storagePercent =
      (limits.storage.used_gb / limits.storage.max_gb) * 100;

    // Determine warnings
    const warnings: string[] = [];

    if (usersPercent >= 90) {
      warnings.push(
        `User limit almost reached (${limits.users.current}/${limits.users.max})`
      );
    }
    });

    if (ordersPercent >= 90) {
      warnings.push(
        `Monthly order limit almost reached (${limits.orders.current_month}/${limits.orders.max})`
      );
    }
    });

    if (storagePercent >= 90) {
      warnings.push(
        `Storage quota almost full (${limits.storage.used_gb.toFixed(2)}GB/${limits.storage.max_gb}GB)`
      );
    }
    return NextResponse.json({
      success: true,
      limits,
      usage_percentages: {
        users: Math.round(usersPercent * 100) / 100,
        orders: Math.round(ordersPercent * 100) / 100,
        storage: Math.round(storagePercent * 100) / 100,
      },
      warnings,
      needs_upgrade: warnings.length > 0,
  } catch (error: any) {
    console.error("Check limits error:", error);
    return NextResponse.json(
      { error: "Failed to check limits", details: error.message },
      { status: 500 }
    );
  }
  });
});
