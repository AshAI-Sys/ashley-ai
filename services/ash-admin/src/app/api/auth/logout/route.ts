/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { authLogger } from "../../../../lib/logger";
import { logAuthEvent } from "../../../../lib/audit-logger";
import { requireAuth } from "@/lib/auth-middleware";
import { verifyAccessToken, verifyRefreshToken } from "../../../../lib/jwt";
import { blacklistToken } from "../../../../lib/token-blacklist";

export const dynamic = 'force-dynamic';


/**
 * POST /api/auth/logout
 * Logout current user and clear session
 *
 * SECURITY ENHANCEMENTS:
 * - Blacklists both access and refresh tokens before clearing cookies
 * - Prevents logged-out users from reusing saved JWT tokens
 * - Audit logging for compliance
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // User is already authenticated via requireAuth wrapper
    const userId = user.id;
    const workspaceId = user.workspaceId;

    // SECURITY: Blacklist tokens before clearing cookies
    // This prevents the user from reusing saved tokens after logout

    // Get access token from cookie or Authorization header
    const accessToken =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (accessToken) {
      const accessPayload = await verifyAccessToken(accessToken);
      if (accessPayload) {
        await blacklistToken(accessPayload, "LOGOUT");
      }
    }

    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        await blacklistToken(refreshPayload, "LOGOUT");
      }
    }

    // Log logout event
    await logAuthEvent("LOGOUT", workspaceId, userId, request, {
      email: user.email,
    });

    authLogger.info("User logged out", {
      userId: userId,
      email: user.email,
      tokensBlacklisted: true,
    });

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear auth_token cookie
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Clear refresh_token cookie
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Clear session cookie if it exists
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
      });
    
      return response;
  } catch (error) {
    authLogger.error("Logout error", error as Error);

    // Still return success and clear cookies even if there's an error
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("session", "", { maxAge: 0, path: "/" });

    return response;
  }
});
