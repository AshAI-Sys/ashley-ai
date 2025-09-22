"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const jwt_1 = require("../../../lib/jwt");
const error_handling_1 = require("../../../lib/error-handling");
// Test JWT authentication without database dependencies
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
    const body = await request.json();
    const { email, password } = body;
    // Simple demo authentication
    if (email === 'admin@ashleyai.com' && password === 'demo123') {
        const userData = {
            userId: 'demo-user-1',
            email: 'admin@ashleyai.com',
            role: 'admin',
            workspaceId: 'demo-workspace-1'
        };
        const token = (0, jwt_1.generateToken)(userData);
        return (0, error_handling_1.createSuccessResponse)({
            access_token: token,
            user: userData,
            tokenType: 'Bearer',
            expiresIn: '24h'
        });
    }
    throw new error_handling_1.AuthenticationError('Invalid credentials');
});
exports.GET = (0, error_handling_1.withErrorHandling)(async (request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        throw new error_handling_1.AuthenticationError('Authorization header required');
    }
    const token = authHeader.substring(7);
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload) {
        throw new error_handling_1.AuthenticationError('Invalid or expired token');
    }
    return (0, error_handling_1.createSuccessResponse)({
        valid: true,
        payload: payload,
        message: 'Token is valid'
    });
});
