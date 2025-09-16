"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const server_1 = require("next/server");
const rate_limit_1 = require("@/lib/rate-limit");
const validation_1 = require("@/lib/validation");
exports.POST = (0, rate_limit_1.rateLimit)(rate_limit_1.authRateLimit)(async (request) => {
    try {
        const body = await request.json();
        const { email, password } = body;
        // Validate required fields
        const errors = [];
        const emailError = (0, validation_1.validateRequired)(email, 'email');
        const passwordError = (0, validation_1.validateRequired)(password, 'password');
        if (emailError)
            errors.push(emailError);
        if (passwordError)
            errors.push(passwordError);
        if (errors.length > 0) {
            return (0, validation_1.createValidationErrorResponse)(errors);
        }
        // Sanitize inputs
        const sanitizedEmail = (0, validation_1.sanitizeInput)(email);
        const sanitizedPassword = (0, validation_1.sanitizeInput)(password);
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return server_1.NextResponse.json({
                success: false,
                message: 'Invalid email format'
            }, { status: 400 });
        }
        // Demo authentication - accept specific credentials for security demo
        if (sanitizedEmail === 'admin@ashleyai.com' && sanitizedPassword === 'demo123') {
            return server_1.NextResponse.json({
                success: true,
                access_token: 'demo-jwt-token-12345',
                user: {
                    id: 'demo-user-1',
                    email: sanitizedEmail,
                    name: 'Demo User',
                    role: 'admin',
                    workspaceId: 'demo-workspace-1'
                }
            }, { status: 200 });
        }
        // Invalid credentials
        return server_1.NextResponse.json({
            success: false,
            message: 'Invalid credentials'
        }, { status: 401 });
    }
    catch (error) {
        console.error('Login error:', error);
        return server_1.NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
});
