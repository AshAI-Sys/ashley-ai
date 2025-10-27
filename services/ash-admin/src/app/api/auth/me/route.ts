/* eslint-disable */
import { NextRequest } from "next/server";
import { apiSuccess, apiServerError } from "../../../../lib/api-response";
import { authLogger } from "../../../../lib/logger";
import { prisma } from "../../../../lib/db";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // User is already authenticated via requireAuth wrapper

    // Fetch full user details from database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        position: true,
        department: true,
        workspace_id: true,
        is_active: true,
        created_at: true,
        last_login_at: true,
      },
    });

    if (!user) {
      authLogger.warn("User not found in database", { userId: authUser.id   });    return apiServerError("User not found");
    }

    authLogger.debug("User authenticated successfully", { userId: user.id   });    return apiSuccess({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      position: user.position,
      department: user.department,
      workspaceId: user.workspace_id,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
    });
  } catch (error) {
    authLogger.error("Auth verification error", error);
    return apiServerError(error);
  }
});