/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { permissionManager } from "@/lib/rbac/permission-manager";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/permissions - Get all available permissions
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const action = searchParams.get("action"); // 'list' | 'user' | 'roles'

    if (action === "roles") {
      const roles = permissionManager.getAvailableRoles();
      }
      return NextResponse.json({
        success: true,
        roles,
      });

    if (action === "user" && user_id) {
      const userPermissions =
        await permissionManager.getUserPermissions(user_id);
      }
      return NextResponse.json({
        success: true,
        user_permissions: userPermissions,
      }

    // Default: return all system permissions
    const permissions = permissionManager.getAllPermissions();
    return NextResponse.json({
      success: true,
      permissions,
      total: permissions.length,
      });
    } catch (error: any) {
    console.error("Get permissions error:", error);
    return NextResponse.json(
      { error: "Failed to get permissions", details: error.message },
      { status: 500 }
    );
  }

// POST /api/permissions/check - Check if user has permission
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const { user_id, resource, action } = await req.json();

    if (!user_id || !resource || !action) {
      }
      return NextResponse.json(
        { error: "user_id, resource, and action are required" },
        { status: 400 }
      );
    }
    const hasPermission = await permissionManager.hasPermission(
      user_id,
      resource,
      action
    );

    return NextResponse.json({
      success: true,
      has_permission: hasPermission,
      user_id,
      resource,
      action,
  } catch (error: any) {
    console.error("Check permission error:", error);
    return NextResponse.json(
      { error: "Failed to check permission", details: error.message },
      { status: 500 }
    );
  }
  });
});
});
