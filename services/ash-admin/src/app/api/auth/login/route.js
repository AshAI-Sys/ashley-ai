"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const rate_limit_1 = require("../../../../lib/rate-limit");
const jwt_1 = require("../../../../lib/jwt");
const error_handling_1 = require("../../../../lib/error-handling");
exports.POST = (0, rate_limit_1.rateLimit)(rate_limit_1.authRateLimit)((0, error_handling_1.withErrorHandling)(async (request) => {
    const body = await request.json();
    const { email, password } = body;
    // Validate required fields
    const requiredFieldsError = (0, error_handling_1.validateRequiredFields)(body, ['email', 'password']);
    if (requiredFieldsError) {
        throw requiredFieldsError;
    }
    // Validate email format
    const emailError = (0, error_handling_1.validateEmail)(email, 'email');
    if (emailError) {
        throw emailError;
    }
    // Demo authentication - accept specific credentials for development
    if (email === 'admin@ashleyai.com' && password === 'demo123') {
        // Generate proper JWT token
        const userData = {
            userId: 'demo-user-1',
            email: 'admin@ashleyai.com',
            role: 'admin',
            workspaceId: 'demo-workspace-1'
        };
        const token = (0, jwt_1.generateToken)(userData);
        const responseData = {
            access_token: token,
            user: {
                id: 'demo-user-1',
                email: email,
                name: 'Demo User',
                role: 'admin',
                workspaceId: 'demo-workspace-1'
            }
        };
        return (0, error_handling_1.createSuccessResponse)(responseData, 200);
    }
    // Invalid credentials
    throw new error_handling_1.AuthenticationError('Invalid email or password');
}));
