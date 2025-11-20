/**
 * Session Revocation Endpoint
 *
 * POST /api/auth/revoke-sessions
 *
 * Admin endpoint to revoke all sessions for a specific user.
 * Use cases:
 * - Security incidents (compromised account)
 * - Password changes (force re-login)
 * - Account suspension
 * - Forced logout across all devices
 *
 * SECURITY: Requires admin permission
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-middleware";
import { revokeAllUserSessions, restoreUserSessions } from "@/lib/token-blacklist";
import { authLogger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

interface RevokeSessionsRequest {
  userId: string;
  reason?: string;
  restore?: boolean; // Set to true to restore access
}

interface RevokeSessionsResponse {
  success: boolean;
  message: string;
  userId: string;
  action: 'revoked' | 'restored';
  error?: string;
}

/**
 * POST /api/auth/revoke-sessions
 * Revoke or restore all sessions for a user
 */
export const POST = requirePermission("admin:update")(
  async (request: NextRequest, admin): Promise<NextResponse<RevokeSessionsResponse>> => {
    try {
      const body: RevokeSessionsRequest = await request.json();
      const { userId, reason = "Admin action", restore = false } = body;

      // Validate required fields
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            message: "userId is required",
            userId: "",
            action: "revoked",
            error: "MISSING_USER_ID",
          },
          { status: 400 }
        );
      }

      // Prevent admins from revoking their own sessions
      if (userId === admin.id && !restore) {
        authLogger.warn("Admin attempted to revoke their own sessions", {
          adminId: admin.id,
          targetUserId: userId,
        });

        return NextResponse.json(
          {
            success: false,
            message: "Cannot revoke your own sessions. Use logout instead.",
            userId,
            action: "revoked",
            error: "SELF_REVOCATION_DENIED",
          },
          { status: 403 }
        );
      }

      let success: boolean;
      let action: 'revoked' | 'restored';

      if (restore) {
        // Restore user sessions
        success = await restoreUserSessions(userId);
        action = 'restored';

        if (success) {
          authLogger.warn("User sessions restored by admin", {
            adminId: admin.id,
            adminEmail: admin.email,
            targetUserId: userId,
            reason,
          });
        }
      } else {
        // Revoke all user sessions
        success = await revokeAllUserSessions(userId);
        action = 'revoked';

        if (success) {
          authLogger.warn("All user sessions revoked by admin", {
            adminId: admin.id,
            adminEmail: admin.email,
            targetUserId: userId,
            reason,
          });
        }
      }

      if (!success) {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update user sessions. Redis may be unavailable.",
            userId,
            action,
            error: "REDIS_UNAVAILABLE",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: restore
            ? "User sessions restored successfully. User can now log in again."
            : "All user sessions revoked successfully. User must log in again.",
          userId,
          action,
        },
        { status: 200 }
      );
    } catch (error) {
      authLogger.error(
        "Session revocation error",
        error instanceof Error ? error : undefined,
        {
          adminId: admin.id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while updating user sessions",
          userId: "",
          action: "revoked",
          error: "INTERNAL_ERROR",
          ...(process.env.NODE_ENV === 'development' && {
            debug: error instanceof Error ? error.message : String(error),
          }),
        },
        { status: 500 }
      );
    }
  }
);

/**
 * GET /api/auth/revoke-sessions?userId={userId}
 * Check if user sessions are currently revoked
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // This would require adding a check function to token-blacklist.ts
    // For now, return a simple response
    return NextResponse.json({
      message: "Session revocation status check not yet implemented",
      userId,
    });
  } catch (error) {
    authLogger.error("Session revocation check error", error as Error);

    return NextResponse.json(
      { error: "Failed to check session status" },
      { status: 500 }
    );
  }
}
