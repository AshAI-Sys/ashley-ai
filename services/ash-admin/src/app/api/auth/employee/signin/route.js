"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const database_1 = require("@ash-ai/database");
const api_utils_1 = require("@/lib/api-utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'ash-ai-employee-secret';
async function POST(request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return (0, api_utils_1.createErrorResponse)('Email and password are required', 400);
        }
        // Find employee by email
        const employee = await database_1.prisma.employee.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                workspace: true
            }
        });
        if (!employee) {
            return (0, api_utils_1.createErrorResponse)('Invalid email or password', 401);
        }
        if (!employee.is_active) {
            return (0, api_utils_1.createErrorResponse)('Employee account is inactive', 401);
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, employee.password_hash);
        if (!isValidPassword) {
            return (0, api_utils_1.createErrorResponse)('Invalid email or password', 401);
        }
        // Update last login
        await database_1.prisma.employee.update({
            where: { id: employee.id },
            data: { last_login: new Date() }
        });
        // Get role-based permissions
        const rolePermissions = getRolePermissions(employee.role, employee.position);
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            employeeId: employee.id,
            email: employee.email,
            role: employee.role,
            position: employee.position,
            department: employee.department,
            permissions: rolePermissions,
            workspaceId: employee.workspace_id
        }, JWT_SECRET, { expiresIn: '8h' } // 8 hour work shift
        );
        const employeeData = {
            id: employee.id,
            email: employee.email,
            first_name: employee.first_name,
            last_name: employee.last_name,
            role: employee.role,
            position: employee.position,
            department: employee.department,
            employee_number: employee.employee_number,
            permissions: rolePermissions,
            workspace: {
                id: employee.workspace.id,
                name: employee.workspace.name
            }
        };
        const response = (0, api_utils_1.createSuccessResponse)({
            employee: employeeData,
            token,
            message: `Welcome ${employee.first_name}! Logged in as ${employee.role}`
        });
        // Set HTTP-only cookie for security
        response.cookies.set('employee-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });
        return response;
    }
    catch (error) {
        console.error('Employee login error:', error);
        return (0, api_utils_1.createErrorResponse)('Login failed', 500);
    }
}
// Role-based permissions system
function getRolePermissions(role, position) {
    const basePermissions = {
        // Common permissions for all employees
        profile: ['view', 'edit_own'],
        attendance: ['view_own', 'checkin', 'checkout'],
        notifications: ['view_own']
    };
    const rolePermissions = {
        admin: {
            ...basePermissions,
            employees: ['view', 'create', 'edit', 'delete'],
            orders: ['view', 'create', 'edit', 'delete'],
            production: ['view', 'create', 'edit', 'delete'],
            quality: ['view', 'create', 'edit', 'delete'],
            finance: ['view', 'create', 'edit', 'delete'],
            reports: ['view', 'create', 'export'],
            settings: ['view', 'edit']
        },
        manager: {
            ...basePermissions,
            employees: ['view', 'edit'],
            orders: ['view', 'create', 'edit'],
            production: ['view', 'create', 'edit'],
            quality: ['view', 'create', 'edit'],
            finance: ['view'],
            reports: ['view', 'create']
        },
        supervisor: {
            ...basePermissions,
            employees: ['view_team'],
            orders: ['view'],
            production: ['view', 'edit_assigned'],
            quality: ['view', 'create', 'edit_assigned'],
            reports: ['view']
        },
        operator: {
            ...basePermissions,
            production: ['view_assigned', 'update_progress'],
            quality: ['view_assigned', 'report_issues'],
            orders: ['view_assigned']
        },
        employee: {
            ...basePermissions,
            tasks: ['view_assigned', 'update_progress'],
            production: ['view_assigned']
        }
    };
    // Position-specific permissions
    const positionPermissions = {
        'Cutting Operator': {
            cutting: ['view', 'create', 'edit'],
            bundles: ['view', 'create', 'scan']
        },
        'Printing Operator': {
            printing: ['view', 'create', 'edit'],
            print_runs: ['view', 'create', 'update']
        },
        'Sewing Operator': {
            sewing: ['view', 'create', 'edit'],
            sewing_runs: ['view', 'create', 'update']
        },
        'QC Inspector': {
            quality: ['view', 'create', 'edit'],
            inspections: ['view', 'create', 'update'],
            defects: ['view', 'create', 'report']
        },
        'Packing Operator': {
            finishing: ['view', 'create', 'edit'],
            packing: ['view', 'create', 'update']
        },
        'Warehouse Staff': {
            inventory: ['view', 'update'],
            shipping: ['view', 'create', 'update']
        }
    };
    return {
        ...rolePermissions[role] || rolePermissions['employee'],
        ...positionPermissions[position] || {}
    };
}
