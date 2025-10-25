"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const api_response_1 = require("../../../../lib/api-response");
const logger_1 = require("../../../../lib/logger");
const db_1 = require("../../../../lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        // Use auth guard to verify authentication;
        const userOrResponse = await (0, auth_middleware_1.requireAuth)(request);
        if (userOrResponse instanceof Response) {
            return userOrResponse;
        }
        const authUser = userOrResponse;
        // Fetch full user details from database
        const user = await db_1.prisma.user.findUnique({
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
            logger_1.authLogger.warn("User not found in database", { userId: authUser.id });
            return (0, api_response_1.apiServerError)("User not found");
        }
        logger_1.authLogger.debug("User authenticated successfully", { userId: user.id });
        return (0, api_response_1.apiSuccess)({
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
    }
    catch (error) {
        logger_1.authLogger.error("Auth verification error", error);
        return (0, api_response_1.apiServerError)(error);
    }
});
