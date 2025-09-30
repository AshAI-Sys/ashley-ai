"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
// Temporarily disabled rate limiting for login
// import { rateLimit, authRateLimit } from '../../../../lib/rate-limit'
const jwt_1 = require("../../../../lib/jwt");
const error_handling_1 = require("../../../../lib/error-handling");
// Temporarily disable database dependency for login
// import { prisma } from '../../../../lib/db'
// import bcrypt from 'bcryptjs'
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
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
    // Employee-specific accounts with different roles and access
    const employeeAccounts = [
        // Admin Accounts
        {
            email: 'admin@ashleyai.com',
            password: 'admin123',
            role: 'admin',
            name: 'Ashley AI Admin',
            position: 'System Administrator',
            department: 'Administration',
            employeeId: 'EMP-001',
            permissions: ['*'] // All access
        },
        {
            email: 'manager@ashleyai.com',
            password: 'manager123',
            role: 'manager',
            name: 'Production Manager',
            position: 'Production Manager',
            department: 'Production',
            employeeId: 'EMP-002',
            permissions: ['orders.view', 'orders.edit', 'production.*', 'quality.*', 'employees.view', 'reports.view']
        },
        // Design Department
        {
            email: 'designer@ashleyai.com',
            password: 'design123',
            role: 'designer',
            name: 'Maria Santos',
            position: 'Senior Designer',
            department: 'Design',
            employeeId: 'EMP-003',
            permissions: ['designs.*', 'orders.view', 'clients.view']
        },
        // Cutting Department
        {
            email: 'cutting.supervisor@ashleyai.com',
            password: 'cutting123',
            role: 'cutting_supervisor',
            name: 'Juan Dela Cruz',
            position: 'Cutting Supervisor',
            department: 'Cutting',
            employeeId: 'EMP-004',
            permissions: ['cutting.*', 'orders.view', 'production.view']
        },
        {
            email: 'cutting.operator@ashleyai.com',
            password: 'operator123',
            role: 'cutting_operator',
            name: 'Pedro Garcia',
            position: 'Cutting Operator',
            department: 'Cutting',
            employeeId: 'EMP-005',
            permissions: ['cutting.view', 'cutting.operate', 'production.view']
        },
        // Printing Department
        {
            email: 'printing.supervisor@ashleyai.com',
            password: 'printing123',
            role: 'printing_supervisor',
            name: 'Ana Reyes',
            position: 'Printing Supervisor',
            department: 'Printing',
            employeeId: 'EMP-006',
            permissions: ['printing.*', 'orders.view', 'production.view']
        },
        // Sewing Department
        {
            email: 'sewing.supervisor@ashleyai.com',
            password: 'sewing123',
            role: 'sewing_supervisor',
            name: 'Rosa Martinez',
            position: 'Sewing Supervisor',
            department: 'Sewing',
            employeeId: 'EMP-007',
            permissions: ['sewing.*', 'orders.view', 'production.view']
        },
        {
            email: 'sewing.operator@ashleyai.com',
            password: 'sewing123',
            role: 'sewing_operator',
            name: 'Carmen Lopez',
            position: 'Sewing Operator',
            department: 'Sewing',
            employeeId: 'EMP-008',
            permissions: ['sewing.view', 'sewing.operate']
        },
        // Quality Control
        {
            email: 'qc.inspector@ashleyai.com',
            password: 'qc123',
            role: 'qc_inspector',
            name: 'Miguel Torres',
            position: 'QC Inspector',
            department: 'Quality Control',
            employeeId: 'EMP-009',
            permissions: ['quality.*', 'orders.view', 'production.view']
        },
        // Warehouse/Finishing
        {
            email: 'warehouse.staff@ashleyai.com',
            password: 'warehouse123',
            role: 'warehouse_staff',
            name: 'Jose Hernandez',
            position: 'Warehouse Staff',
            department: 'Warehouse',
            employeeId: 'EMP-010',
            permissions: ['finishing.*', 'delivery.view', 'inventory.view']
        },
        // Delivery
        {
            email: 'delivery.coordinator@ashleyai.com',
            password: 'delivery123',
            role: 'delivery_coordinator',
            name: 'Mark Cruz',
            position: 'Delivery Coordinator',
            department: 'Logistics',
            employeeId: 'EMP-011',
            permissions: ['delivery.*', 'orders.view', 'clients.view']
        },
        // HR
        {
            email: 'hr.staff@ashleyai.com',
            password: 'hr123',
            role: 'hr_staff',
            name: 'Linda Aquino',
            position: 'HR Staff',
            department: 'Human Resources',
            employeeId: 'EMP-012',
            permissions: ['hr.*', 'employees.*', 'payroll.*', 'reports.view']
        },
        // Finance
        {
            email: 'finance.staff@ashleyai.com',
            password: 'finance123',
            role: 'finance_staff',
            name: 'Robert Tan',
            position: 'Finance Staff',
            department: 'Finance',
            employeeId: 'EMP-013',
            permissions: ['finance.*', 'orders.view', 'clients.view', 'reports.*']
        },
        // Customer Service Representative
        {
            email: 'csr@ashleyai.com',
            password: 'csr123',
            role: 'csr',
            name: 'Grace Mendoza',
            position: 'Customer Service Rep',
            department: 'Customer Service',
            employeeId: 'EMP-014',
            permissions: ['clients.*', 'orders.view', 'orders.create', 'communication.*']
        }
    ];
    const employeeAccount = employeeAccounts.find(account => account.email === email.toLowerCase() && account.password === password);
    if (employeeAccount) {
        // Generate proper JWT token
        const userData = {
            userId: employeeAccount.employeeId,
            email: employeeAccount.email,
            role: employeeAccount.role,
            workspaceId: 'ashleyai-workspace-1'
        };
        const token = (0, jwt_1.generateToken)(userData);
        const responseData = {
            access_token: token,
            user: {
                id: employeeAccount.employeeId,
                email: employeeAccount.email,
                name: employeeAccount.name,
                role: employeeAccount.role,
                position: employeeAccount.position,
                department: employeeAccount.department,
                workspaceId: 'ashleyai-workspace-1',
                permissions: employeeAccount.permissions
            }
        };
        return (0, error_handling_1.createSuccessResponse)(responseData, 200);
    }
    // For now, all other logins fail - focus on demo accounts only
    throw new error_handling_1.AuthenticationError('Invalid email or password - Use demo accounts for testing');
});
