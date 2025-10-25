"use strict";
/**
 * Authentication Guards & Route Protection
 *
 * Middleware utilities for protecting routes and checking permissions.
 * Use these guards in API routes to ensure proper authentication and authorization.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.UserRole = void 0;
exports.getUserFromRequest = getUserFromRequest;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.requireAuth = requireAuth;
exports.requirePermission = requirePermission;
exports.requireAnyPermission = requireAnyPermission;
exports.requireAllPermissions = requireAllPermissions;
exports.requireRole = requireRole;
const api_response_1 = require("./api-response");
const logger_1 = require("./logger");
/**
 * User roles in the system
 */
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["SUPERVISOR"] = "supervisor";
    UserRole["OPERATOR"] = "operator";
    UserRole["CLIENT"] = "client";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Permissions for different resources
 */
var Permission;
(function (Permission) {
    // Order permissions
    Permission["ORDERS_VIEW"] = "orders.view";
    Permission["ORDERS_CREATE"] = "orders.create";
    Permission["ORDERS_UPDATE"] = "orders.update";
    Permission["ORDERS_DELETE"] = "orders.delete";
    // Client permissions
    Permission["CLIENTS_VIEW"] = "clients.view";
    Permission["CLIENTS_CREATE"] = "clients.create";
    Permission["CLIENTS_UPDATE"] = "clients.update";
    Permission["CLIENTS_DELETE"] = "clients.delete";
    // Finance permissions
    Permission["FINANCE_VIEW"] = "finance.view";
    Permission["FINANCE_CREATE"] = "finance.create";
    Permission["FINANCE_UPDATE"] = "finance.update";
    Permission["FINANCE_DELETE"] = "finance.delete";
    // HR permissions
    Permission["HR_VIEW"] = "hr.view";
    Permission["HR_CREATE"] = "hr.create";
    Permission["HR_UPDATE"] = "hr.update";
    Permission["HR_DELETE"] = "hr.delete";
    // Production permissions
    Permission["PRODUCTION_VIEW"] = "production.view";
    Permission["PRODUCTION_CREATE"] = "production.create";
    Permission["PRODUCTION_UPDATE"] = "production.update";
    // Admin permissions
    Permission["ADMIN_VIEW"] = "admin.view";
    Permission["ADMIN_MANAGE_USERS"] = "admin.manage_users";
    Permission["ADMIN_MANAGE_SETTINGS"] = "admin.manage_settings";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Role-based permission mapping
 */
const RolePermissions = {
    [UserRole.SUPER_ADMIN]: [
        // Super admin has all permissions
        ...Object.values(Permission),
    ],
    [UserRole.ADMIN]: [
        Permission.ORDERS_VIEW,
        Permission.ORDERS_CREATE,
        Permission.ORDERS_UPDATE,
        Permission.ORDERS_DELETE,
        Permission.CLIENTS_VIEW,
        Permission.CLIENTS_CREATE,
        Permission.CLIENTS_UPDATE,
        Permission.CLIENTS_DELETE,
        Permission.FINANCE_VIEW,
        Permission.FINANCE_CREATE,
        Permission.FINANCE_UPDATE,
        Permission.HR_VIEW,
        Permission.HR_CREATE,
        Permission.HR_UPDATE,
        Permission.PRODUCTION_VIEW,
        Permission.PRODUCTION_CREATE,
        Permission.PRODUCTION_UPDATE,
        Permission.ADMIN_VIEW,
    ],
    [UserRole.MANAGER]: [
        Permission.ORDERS_VIEW,
        Permission.ORDERS_CREATE,
        Permission.ORDERS_UPDATE,
        Permission.CLIENTS_VIEW,
        Permission.CLIENTS_CREATE,
        Permission.CLIENTS_UPDATE,
        Permission.FINANCE_VIEW,
        Permission.HR_VIEW,
        Permission.PRODUCTION_VIEW,
        Permission.PRODUCTION_CREATE,
        Permission.PRODUCTION_UPDATE,
    ],
    [UserRole.SUPERVISOR]: [
        Permission.ORDERS_VIEW,
        Permission.ORDERS_CREATE,
        Permission.CLIENTS_VIEW,
        Permission.PRODUCTION_VIEW,
        Permission.PRODUCTION_CREATE,
        Permission.PRODUCTION_UPDATE,
    ],
    [UserRole.OPERATOR]: [
        Permission.ORDERS_VIEW,
        Permission.PRODUCTION_VIEW,
        Permission.PRODUCTION_UPDATE,
    ],
    [UserRole.CLIENT]: [
        Permission.ORDERS_VIEW, // Only their own orders
    ],
    [UserRole.VIEWER]: [
        Permission.ORDERS_VIEW,
        Permission.CLIENTS_VIEW,
        Permission.PRODUCTION_VIEW,
    ],
};
/**
 * Extract user from request with JWT verification
 */
async function getUserFromRequest(request) {
    try {
        // Import JWT utilities
        const { verifyAccessToken, extractTokenFromHeader } = await Promise.resolve().then(() => __importStar(require("./jwt")));
        // Check for Authorization header
        const authHeader = request.headers.get("Authorization");
        if (authHeader) {
            const token = extractTokenFromHeader(authHeader);
            if (token) {
                const payload = verifyAccessToken(token);
                if (payload) {
                    logger_1.authLogger.debug("User authenticated via JWT token", {
                        userId: payload.userId,
                    });
                    return {
                        id: payload.userId,
                        email: payload.email,
                        role: payload.role,
                        workspace_id: payload.workspaceId,
                    };
                }
                else {
                    logger_1.authLogger.warn("Invalid or expired JWT token");
                }
            }
        }
        // Check for session cookie with JWT
        const sessionCookie = request.cookies.get("auth_token");
        if (sessionCookie?.value) {
            const payload = verifyAccessToken(sessionCookie.value);
            if (payload) {
                logger_1.authLogger.debug("User authenticated via session cookie", {
                    userId: payload.userId,
                });
                return {
                    id: payload.userId,
                    email: payload.email,
                    role: payload.role,
                    workspace_id: payload.workspaceId,
                };
            }
        }
        // Production mode: require valid authentication
        logger_1.authLogger.debug("No valid authentication found");
        return null;
    }
    catch (error) {
        logger_1.authLogger.error("Failed to extract user from request", error);
        return null;
    }
}
/**
 * Check if user has a specific permission
 */
function hasPermission(user, permission) {
    // Use custom permissions if provided
    if (user.permissions) {
        return user.permissions.includes(permission);
    }
    // Otherwise check role-based permissions
    const rolePermissions = RolePermissions[user.role] || [];
    return rolePermissions.includes(permission);
}
/**
 * Check if user has any of the specified permissions
 */
function hasAnyPermission(user, permissions) {
    return permissions.some(permission => hasPermission(user, permission));
}
/**
 * Check if user has all of the specified permissions
 */
function hasAllPermissions(user, permissions) {
    return permissions.every(permission => hasPermission(user, permission));
}
/**
 * Require authentication middleware
 * Returns user if authenticated, otherwise returns 401 response
 */
async function requireAuth(request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        logger_1.authLogger.warn("Unauthenticated request", {
            path: request.nextUrl.pathname,
            method: request.method,
        });
        return (0, api_response_1.apiUnauthorized)("Authentication required");
    }
    return user;
}
/**
 * Require specific permission middleware
 * Returns user if authorized, otherwise returns 401/403 response
 */
async function requirePermission(request, permission) {
    const user = await getUserFromRequest(request);
    if (!user) {
        logger_1.authLogger.warn("Unauthenticated request", {
            path: request.nextUrl.pathname,
            method: request.method,
            permission,
        });
        return (0, api_response_1.apiUnauthorized)("Authentication required");
    }
    if (!hasPermission(user, permission)) {
        logger_1.authLogger.warn("Unauthorized request", {
            path: request.nextUrl.pathname,
            method: request.method,
            userId: user.id,
            userRole: user.role,
            permission,
        });
        return (0, api_response_1.apiForbidden)("Insufficient permissions");
    }
    return user;
}
/**
 * Require any of the specified permissions
 */
async function requireAnyPermission(request, permissions) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return (0, api_response_1.apiUnauthorized)("Authentication required");
    }
    if (!hasAnyPermission(user, permissions)) {
        logger_1.authLogger.warn("Unauthorized request - missing any permission", {
            userId: user.id,
            userRole: user.role,
            requiredPermissions: permissions,
        });
        return (0, api_response_1.apiForbidden)("Insufficient permissions");
    }
    return user;
}
/**
 * Require all of the specified permissions
 */
async function requireAllPermissions(request, permissions) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return (0, api_response_1.apiUnauthorized)("Authentication required");
    }
    if (!hasAllPermissions(user, permissions)) {
        logger_1.authLogger.warn("Unauthorized request - missing all permissions", {
            userId: user.id,
            userRole: user.role,
            requiredPermissions: permissions,
        });
        return (0, api_response_1.apiForbidden)("Insufficient permissions");
    }
    return user;
}
/**
 * Require specific role
 */
async function requireRole(request, roles) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return (0, api_response_1.apiUnauthorized)("Authentication required");
    }
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
        logger_1.authLogger.warn("Unauthorized request - invalid role", {
            userId: user.id,
            userRole: user.role,
            requiredRoles: allowedRoles,
        });
        return (0, api_response_1.apiForbidden)("Insufficient permissions");
    }
    return user;
}
/**
 * Example usage in API routes:
 *
 * import { requireAuth, requirePermission, Permission } from '@/lib/auth-guards'
 *
 * export async function GET(request: NextRequest) {
 *   // Require authentication
 *   const userOrResponse = await requireAuth(request)
 *   if (userOrResponse instanceof NextResponse) return userOrResponse
 *   const user = userOrResponse
 *
 *   // Now you have authenticated user
 *   // ...
 * }
 *
 * export async function POST(request: NextRequest) {
 *   // Require specific permission
 *   const userOrResponse = await requirePermission(request, Permission.ORDERS_CREATE)
 *   if (userOrResponse instanceof NextResponse) return userOrResponse
 *   const user = userOrResponse
 *
 *   // User is authorized to create orders
 *   // ...
 * }
 */
