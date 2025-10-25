"use strict";
// Role-Based Access Control (RBAC) System
// Defines roles, permissions, and access control for the Ashley AI system
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.NAVIGATION_PERMISSIONS = exports.ROLE_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.getRolePermissions = getRolePermissions;
exports.canAccessPage = canAccessPage;
exports.getAllPermissionsForRole = getAllPermissionsForRole;
exports.getRoleBasedPermissions = getRoleBasedPermissions;
// Role-based permissions mapping
exports.ROLE_PERMISSIONS = {
    // Admin - Full access to everything
    admin: [
        "clients:read",
        "clients:create",
        "clients:update",
        "clients:delete",
        "orders:read",
        "orders:create",
        "orders:update",
        "orders:delete",
        "designs:read",
        "designs:create",
        "designs:update",
        "designs:delete",
        "designs:approve",
        "cutting:read",
        "cutting:create",
        "cutting:update",
        "cutting:operate",
        "printing:read",
        "printing:create",
        "printing:update",
        "printing:operate",
        "sewing:read",
        "sewing:create",
        "sewing:update",
        "sewing:operate",
        "qc:read",
        "qc:create",
        "qc:update",
        "qc:inspect",
        "qc:approve",
        "finishing:read",
        "finishing:create",
        "finishing:update",
        "finishing:operate",
        "delivery:read",
        "delivery:create",
        "delivery:update",
        "delivery:dispatch",
        "finance:read",
        "finance:create",
        "finance:update",
        "finance:approve",
        "hr:read",
        "hr:create",
        "hr:update",
        "hr:delete",
        "payroll:read",
        "payroll:process",
        "maintenance:read",
        "maintenance:create",
        "maintenance:update",
        "automation:read",
        "automation:create",
        "automation:update",
        "analytics:read",
        "reports:generate",
        "admin:read",
        "admin:create",
        "admin:update",
        "admin:delete",
    ],
    // Manager - Department oversight
    manager: [
        "clients:read",
        "orders:read",
        "designs:read",
        "designs:approve",
        "cutting:read",
        "printing:read",
        "sewing:read",
        "qc:read",
        "finishing:read",
        "delivery:read",
        "analytics:read",
        "reports:generate",
        "hr:read",
    ],
    // Designer - Design workflow management
    designer: [
        "clients:read",
        "orders:read",
        "designs:read",
        "designs:create",
        "designs:update",
    ],
    // Production Operators - Specific to their operations
    cutting_operator: [
        "orders:read",
        "designs:read",
        "cutting:read",
        "cutting:create",
        "cutting:update",
        "cutting:operate",
    ],
    printing_operator: [
        "orders:read",
        "designs:read",
        "printing:read",
        "printing:create",
        "printing:update",
        "printing:operate",
    ],
    sewing_operator: [
        "orders:read",
        "designs:read",
        "sewing:read",
        "sewing:create",
        "sewing:update",
        "sewing:operate",
    ],
    // Quality Control Inspector
    qc_inspector: [
        "orders:read",
        "designs:read",
        "cutting:read",
        "printing:read",
        "sewing:read",
        "qc:read",
        "qc:create",
        "qc:update",
        "qc:inspect",
    ],
    // Finishing Operator
    finishing_operator: [
        "orders:read",
        "designs:read",
        "finishing:read",
        "finishing:create",
        "finishing:update",
        "finishing:operate",
    ],
    // Warehouse Staff
    warehouse_staff: [
        "orders:read",
        "delivery:read",
        "delivery:create",
        "delivery:update",
        "delivery:dispatch",
    ],
    // Finance Staff
    finance_staff: [
        "clients:read",
        "orders:read",
        "finance:read",
        "finance:create",
        "finance:update",
    ],
    // HR Staff
    hr_staff: [
        "hr:read",
        "hr:create",
        "hr:update",
        "payroll:read",
        "payroll:process",
    ],
    // Maintenance Technician
    maintenance_tech: [
        "maintenance:read",
        "maintenance:create",
        "maintenance:update",
    ],
};
// Navigation permissions - what sections users can see
exports.NAVIGATION_PERMISSIONS = {
    dashboard: [], // Everyone can see dashboard
    clients: ["clients:read"],
    orders: ["orders:read"],
    designs: ["designs:read"],
    cutting: ["cutting:read"],
    printing: ["printing:read"],
    sewing: ["sewing:read"],
    "quality-control": ["qc:read"],
    "finishing-packing": ["finishing:read"],
    delivery: ["delivery:read"],
    finance: ["finance:read"],
    "hr-payroll": ["hr:read", "payroll:read"],
    maintenance: ["maintenance:read"],
    automation: ["automation:read"],
    merchandising: ["analytics:read"],
};
// Helper functions
function hasPermission(userPermissions, requiredPermission) {
    return userPermissions.includes(requiredPermission);
}
function hasAnyPermission(userPermissions, requiredPermissions) {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
}
function getRolePermissions(role) {
    return exports.ROLE_PERMISSIONS[role] || [];
}
function canAccessPage(userPermissions, page) {
    const requiredPermissions = exports.NAVIGATION_PERMISSIONS[page];
    if (!requiredPermissions || requiredPermissions.length === 0)
        return true; // Public page or dashboard
    return hasAnyPermission(userPermissions, requiredPermissions);
}
// Role hierarchy (higher roles inherit lower role permissions)
exports.ROLE_HIERARCHY = {
    admin: [
        "manager",
        "designer",
        "cutting_operator",
        "printing_operator",
        "sewing_operator",
        "qc_inspector",
        "finishing_operator",
        "warehouse_staff",
        "finance_staff",
        "hr_staff",
        "maintenance_tech",
    ],
    manager: [
        "designer",
        "cutting_operator",
        "printing_operator",
        "sewing_operator",
        "qc_inspector",
        "finishing_operator",
    ],
    designer: [],
    cutting_operator: [],
    printing_operator: [],
    sewing_operator: [],
    qc_inspector: [],
    finishing_operator: [],
    warehouse_staff: [],
    finance_staff: [],
    hr_staff: [],
    maintenance_tech: [],
};
// Get all permissions for a role including inherited ones
function getAllPermissionsForRole(role) {
    const directPermissions = getRolePermissions(role);
    const inheritedRoles = exports.ROLE_HIERARCHY[role] || [];
    const inheritedPermissions = inheritedRoles.flatMap(inheritedRole => getRolePermissions(inheritedRole));
    return [...new Set([...directPermissions, ...inheritedPermissions])];
}
// Helper to convert legacy roles to RBAC permissions
function getRoleBasedPermissions(roleName) {
    // Map legacy role names to our RBAC roles
    const roleMap = {
        admin: "admin",
        Admin: "admin",
        manager: "manager",
        Manager: "manager",
        CSR: "designer",
        Worker: "cutting_operator",
        Client: "warehouse_staff",
        cutting_operator: "cutting_operator",
        printing_operator: "printing_operator",
        sewing_operator: "sewing_operator",
        qc_inspector: "qc_inspector",
        finishing_operator: "finishing_operator",
        finance_staff: "finance_staff",
        hr_staff: "hr_staff",
        maintenance_tech: "maintenance_tech",
    };
    const mappedRole = roleMap[roleName] || "cutting_operator";
    return getAllPermissionsForRole(mappedRole);
}
