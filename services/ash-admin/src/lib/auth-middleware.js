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
async function authenticateRequest(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.substring(7);
        // Development mode fallback - only in development
        if (process.env.NODE_ENV === 'development' && token === 'demo-jwt-token-12345') {
            console.warn('Using demo authentication token - DEVELOPMENT ONLY');
            const role = 'admin';
            return {
                id: 'demo-user-1',
                email: 'admin@ashleyai.com',
                role,
                workspaceId: 'demo-workspace-1',
                permissions: (0, rbac_1.getAllPermissionsForRole)(role)
            };
        }
        // Proper JWT validation
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            return null;
        }
        const role = payload.role;
        return {
            id: payload.userId,
            email: payload.email,
            role,
            workspaceId: payload.workspaceId,
            permissions: (0, rbac_1.getAllPermissionsForRole)(role)
        };
        // TODO: Implement proper JWT validation
        // const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // return decoded as AuthUser
        return null;
    }
    catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}
function requireAuth(handler) {
    return (0, rate_limit_1.rateLimit)(rate_limit_1.apiRateLimit)(async (request) => {
        const user = await authenticateRequest(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'Unauthorized - Valid authentication token required' }, { status: 401 });
        }
        return handler(request, user);
    });
}
// Permission-based middleware functions
function requirePermission(permission) {
    return function (handler) {
        return requireAuth(async (request, user) => {
            if (!(0, rbac_1.hasPermission)(user.permissions, permission)) {
                return server_1.NextResponse.json({ error: `Access denied. Required permission: ${permission}` }, { status: 403 });
            }
            return handler(request, user);
        });
    };
}
function requireAnyPermission(permissions) {
    return function (handler) {
        return requireAuth(async (request, user) => {
            if (!(0, rbac_1.hasAnyPermission)(user.permissions, permissions)) {
                return server_1.NextResponse.json({ error: `Access denied. Required permissions: ${permissions.join(' or ')}` }, { status: 403 });
            }
            return handler(request, user);
        });
    };
}
function requireRole(role) {
    return function (handler) {
        return requireAuth(async (request, user) => {
            if (user.role !== role) {
                return server_1.NextResponse.json({ error: `Access denied. Required role: ${role}` }, { status: 403 });
            }
            return handler(request, user);
        });
    };
}
function requireAdmin() {
    return requireRole('admin');
}
function validateWorkspaceAccess(userWorkspaceId, requestedWorkspaceId) {
    // For demo, allow access to demo workspace
    if (userWorkspaceId === 'demo-workspace-1' && requestedWorkspaceId === 'demo-workspace-1') {
        return true;
    }
    // In production, implement proper workspace access control
    return userWorkspaceId === requestedWorkspaceId;
}
