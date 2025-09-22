"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRequest = authenticateRequest;
exports.requireAuth = requireAuth;
exports.validateWorkspaceAccess = validateWorkspaceAccess;
const server_1 = require("next/server");
const rate_limit_1 = require("./rate-limit");
const jwt_1 = require("./jwt");
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
            return {
                id: 'demo-user-1',
                email: 'admin@ashleyai.com',
                role: 'admin',
                workspaceId: 'demo-workspace-1'
            };
        }
        // Proper JWT validation
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            return null;
        }
        return {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            workspaceId: payload.workspaceId
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
function validateWorkspaceAccess(userWorkspaceId, requestedWorkspaceId) {
    // For demo, allow access to demo workspace
    if (userWorkspaceId === 'demo-workspace-1' && requestedWorkspaceId === 'demo-workspace-1') {
        return true;
    }
    // In production, implement proper workspace access control
    return userWorkspaceId === requestedWorkspaceId;
}
