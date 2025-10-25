"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRequest = authenticateRequest;
exports.requireAuth = requireAuth;
exports.requirePermission = requirePermission;
exports.requireAnyPermission = requireAnyPermission;
exports.requireRole = requireRole;
exports.requireAdmin = requireAdmin;
exports.validateWorkspaceAccess = validateWorkspaceAccess;
const server_1 = require("next/server");
const rate_limit_1 = require("./rate-limit");
const jwt_1 = require("./jwt");
const rbac_1 = require("./rbac");
const session_manager_1 = require("./session-manager");
async function authenticateRequest(request) {
    try {
        // PRODUCTION MODE: Require valid authentication token
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            console.error("[AUTH] No Bearer token in Authorization header");
            return null;
        }
        const token = authHeader.substring(7);
        console.log("[AUTH] Token received:", token.substring(0, 20) + "...");
        // Proper JWT validation
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            console.error("[AUTH] JWT verification failed - token invalid or expired");
            return null;
        }
        console.log("[AUTH] JWT verified successfully for user:", payload.userId);
        // Validate session is active and not revoked (optional in development)
        try {
            const isValidSession = await (0, session_manager_1.validateSession)(token);
            if (!isValidSession) {
                console.warn("[AUTH] Session validation failed - continuing with JWT validation only");
                // In development, allow JWT-only authentication
                if (process.env.NODE_ENV === "production") {
                    console.error("[AUTH] Production mode - session validation required");
                    return null;
                }
            }
            else {
                console.log("[AUTH] Session validated successfully");
            }
        }
        catch (sessionError) {
            console.error("[AUTH] Session validation error:", sessionError);
            // In development, continue if JWT is valid
            if (process.env.NODE_ENV === "production") {
                return null;
            }
            console.warn("[AUTH] Development mode - continuing with JWT validation only");
        }
        const role = payload.role;
        return {
            id: payload.userId,
            email: payload.email,
            role,
            workspaceId: payload.workspaceId,
            permissions: (0, rbac_1.getAllPermissionsForRole)(role),
        };
    }
    catch (error) {
        console.error("[AUTH] Authentication error:", error);
        return null;
    }
}
function requireAuth(handler) {
    return (0, rate_limit_1.rateLimit)(rate_limit_1.apiRateLimit)(async (request, context) => {
        const user = await authenticateRequest(request);
        if (!user) {
            return server_1.NextResponse.json({ error: "Unauthorized - Valid authentication token required" }, { status: 401 });
        }
        return handler(request, user, context);
    });
}
// Permission-based middleware functions
function requirePermission(permission) {
    return function (handler) {
        return requireAuth(async (request, user, context) => {
            if (!(0, rbac_1.hasPermission)(user.permissions, permission)) {
                return server_1.NextResponse.json({ error: `Access denied. Required permission: ${permission}` }, { status: 403 });
            }
            return handler(request, user, context);
        });
    };
}
function requireAnyPermission(permissions) {
    return function (handler) {
        return requireAuth(async (request, user, context) => {
            if (!(0, rbac_1.hasAnyPermission)(user.permissions, permissions)) {
                return server_1.NextResponse.json({
                    error: `Access denied. Required permissions: ${permissions.join(" or ")}`,
                }, { status: 403 });
            }
            return handler(request, user, context);
        });
    };
}
function requireRole(role) {
    return function (handler) {
        return requireAuth(async (request, user, context) => {
            if (user.role !== role) {
                return server_1.NextResponse.json({ error: `Access denied. Required role: ${role}` }, { status: 403 });
            }
            return handler(request, user, context);
        });
    };
}
function requireAdmin() {
    return requireRole("admin");
}
function validateWorkspaceAccess(userWorkspaceId, requestedWorkspaceId) {
    // Production workspace access control
    return userWorkspaceId === requestedWorkspaceId;
}
