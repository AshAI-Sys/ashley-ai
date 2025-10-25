"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const logger_1 = require("../../../../lib/logger");
const audit_logger_1 = require("../../../../lib/audit-logger");
const auth_middleware_1 = require("@/lib/auth-middleware");
/**
 * POST /api/auth/logout
 * Logout current user and clear session
 */
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        // Get user from auth (optional - still logout even if not authenticated);
        const userOrResponse = await (0, auth_middleware_1.requireAuth)(request);
        let userId;
        let workspaceId;
        if (!(userOrResponse instanceof Response)) {
            userId = userOrResponse.id;
            workspaceId = userOrResponse.workspace_id;
            // Log logout event
            await (0, audit_logger_1.logAuthEvent)("LOGOUT", workspaceId, userId, request, {
                email: userOrResponse.email,
            });
            logger_1.authLogger.info("User logged out", {
                userId: userId,
                email: userOrResponse.email,
            });
        }
        // Clear cookies
        const response = server_1.NextResponse.json({
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
    }
    catch (error) {
        logger_1.authLogger.error("Logout error", error);
        // Still return success and clear cookies even if there's an error
        const response = server_1.NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });
        response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
        response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
        response.cookies.set("session", "", { maxAge: 0, path: "/" });
        return response;
    }
});
