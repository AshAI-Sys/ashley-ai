/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken, verifyRefreshToken } from "../../../../lib/jwt";
import { authLogger } from "../../../../lib/logger";
import { requireAuth } from "@/lib/auth-middleware";
import {
  apiSuccess,
  apiUnauthorized,
  apiServerError,
} from "../../../../lib/api-response";
import { blacklistToken } from "../../../../lib/token-blacklist";

export const dynamic = 'force-dynamic';


/**
 * POST /api/auth/refresh
 * Refresh an expired access token using a valid refresh token
 *
 * SECURITY ENHANCEMENTS:
 * - Implements refresh token rotation (generates NEW refresh token)
 * - Blacklists old refresh token to prevent reuse
 * - Prevents stolen refresh tokens from being used indefinitely
 */
export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    // Try to get refresh token from cookie or request body
    let oldRefreshToken = request.cookies.get("refresh_token")?.value;

    if (!oldRefreshToken) {
      const body = await request.json().catch(() => ({}));
      oldRefreshToken = body.refresh_token;
    }

    if (!oldRefreshToken) {
      authLogger.warn("Refresh token missing in request");
      return apiUnauthorized("Refresh token required");
    }

    // SECURITY: Verify refresh token and generate NEW token pair (rotation)
    const newTokenPair = await refreshAccessToken(oldRefreshToken);

    if (!newTokenPair) {
      authLogger.warn("Invalid or expired refresh token");
      return apiUnauthorized("Invalid or expired refresh token");
    }

    // SECURITY: Blacklist the old refresh token to prevent reuse
    const oldPayload = await verifyRefreshToken(oldRefreshToken);
    if (oldPayload) {
      await blacklistToken(oldPayload, "REFRESH_ROTATION");

      authLogger.info("Token pair refreshed with rotation", {
        userId: oldPayload.userId,
        email: oldPayload.email,
        oldTokenBlacklisted: true,
      });
    }

    // Return new token pair
    const response = NextResponse.json({
      success: true,
      access_token: newTokenPair.accessToken,
      refresh_token: newTokenPair.refreshToken, // NEW refresh token
      expires_in: 15 * 60, // 15 minutes in seconds
    });

    // Update auth_token cookie with new access token
    response.cookies.set("auth_token", newTokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Update refresh_token cookie with NEW refresh token
    response.cookies.set("refresh_token", newTokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    authLogger.error("Token refresh error", error);
    return apiServerError(error);
  }
});
