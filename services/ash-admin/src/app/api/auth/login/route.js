"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const rate_limit_1 = require("../../../../lib/rate-limit");
const jwt_1 = require("../../../../lib/jwt");
const error_handling_1 = require("../../../../lib/error-handling");
const db_1 = require("../../../../lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
    // Demo authentication - keep for fallback
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
                name: 'Demo Admin',
                role: 'admin',
                workspaceId: 'demo-workspace-1'
            }
        };
        return (0, error_handling_1.createSuccessResponse)(responseData, 200);
    }
    try {
        // Look for employee with matching email
        const employee = await db_1.prisma.employee.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!employee || !employee.is_active) {
            throw new error_handling_1.AuthenticationError('Invalid email or password');
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, employee.password_hash);
        if (!isPasswordValid) {
            throw new error_handling_1.AuthenticationError('Invalid email or password');
        }
        // Update last login
        await db_1.prisma.employee.update({
            where: { id: employee.id },
            data: { last_login: new Date() }
        });
        // Generate JWT token
        const userData = {
            userId: employee.id,
            email: employee.email,
            role: employee.role,
            workspaceId: employee.workspace_id
        };
        const token = (0, jwt_1.generateToken)(userData);
        const responseData = {
            access_token: token,
            user: {
                id: employee.id,
                email: employee.email,
                name: `${employee.first_name} ${employee.last_name}`,
                role: employee.role,
                position: employee.position,
                department: employee.department,
                workspaceId: employee.workspace_id,
                employeeNumber: employee.employee_number,
                permissions: employee.permissions ? JSON.parse(employee.permissions) : null
            }
        };
        return (0, error_handling_1.createSuccessResponse)(responseData, 200);
    }
    catch (error) {
        // If it's already an AuthenticationError, re-throw it
        if (error instanceof error_handling_1.AuthenticationError) {
            throw error;
        }
        console.error('Login error:', error);
        throw new error_handling_1.AuthenticationError('Authentication failed');
    }
}));
