/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { authLogger } from "../../../../lib/logger";
import { logAuthEvent } from "../../../../lib/audit-logger";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * POST /api/auth/logout
 * Logout current user and clear session
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // User is already authenticated via requireAuth wrapper
    const userId = user.id;
    const workspaceId = user.workspace_id;

    // Log logout event
    await logAuthEvent("LOGOUT", workspaceId, userId, request, {
      email: user.email,
    });

    authLogger.info("User logged out", {
      userId: userId,
      email: user.email,
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
    authLogger.error("Logout error", error);

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