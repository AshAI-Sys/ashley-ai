"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const jwt_1 = require("../../../../lib/jwt");
const logger_1 = require("../../../../lib/logger");
const auth_middleware_1 = require("@/lib/auth-middleware");
const api_response_1 = require("../../../../lib/api-response");
/**
 * POST /api/auth/refresh
 * Refresh an expired access token using a valid refresh token
 */
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        // Try to get refresh token from cookie or request body;
        let refreshToken = request.cookies.get("refresh_token")?.value;
        if (!refreshToken) {
            const body = await request.json().catch(() => ({}));
            refreshToken = body.refresh_token;
            if (!refreshToken) {
                logger_1.authLogger.warn("Refresh token missing in request");
            }
            return (0, api_response_1.apiUnauthorized)("Refresh token required");
        }
        // Verify refresh token and generate new access token
        const newAccessToken = (0, jwt_1.refreshAccessToken)(refreshToken);
        if (!newAccessToken) {
            logger_1.authLogger.warn("Invalid or expired refresh token");
            return (0, api_response_1.apiUnauthorized)("Invalid or expired refresh token");
        }
        // Extract user info from refresh token for logging
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (payload) {
            logger_1.authLogger.info("Access token refreshed", {
                userId: payload.userId,
                email: payload.email,
            });
        }
        // Return new access token
        const response = server_1.NextResponse.json({
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
    }
    catch (error) {
        logger_1.authLogger.error("Token refresh error", error);
        return (0, api_response_1.apiServerError)(error);
    }
});
