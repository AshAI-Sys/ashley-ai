import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken, verifyRefreshToken } from "../../../../lib/jwt";
import { authLogger } from "../../../../lib/logger";
import { requireAuth } from "@/lib/auth-middleware";
import {
  apiSuccess,
  apiUnauthorized,
  apiServerError,
} from "../../../../lib/api-response";

/**
 * POST /api/auth/refresh
 * Refresh an expired access token using a valid refresh token
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // Try to get refresh token from cookie or request body
    let refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refresh_token;
    }

    if (!refreshToken) {
      authLogger.warn("Refresh token missing in request");
      return apiUnauthorized("Refresh token required");
    }

    // Verify refresh token and generate new access token
    const newAccessToken = refreshAccessToken(refreshToken);

    if (!newAccessToken) {
      authLogger.warn("Invalid or expired refresh token");
      return apiUnauthorized("Invalid or expired refresh token");
    }

    // Extract user info from refresh token for logging
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      authLogger.info("Access token refreshed", {
        userId: payload.userId,
        email: payload.email,
      });
    }

    // Return new access token
    const response = NextResponse.json({
      success: true,
      access_token: newAccessToken,
      expires_in: 15 * 60, // 15 minutes in seconds
    });

    // Update auth_token cookie with new access token
    response.cookies.set("auth_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error: any) {
    authLogger.error("Token refresh error", error);
    return apiServerError(error);
  }
};
