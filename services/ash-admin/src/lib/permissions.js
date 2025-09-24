"use strict";
// Role-based access control utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.DEPARTMENT_ACCESS = void 0;
exports.hasAccess = hasAccess;
exports.getAccessibleNavigation = getAccessibleNavigation;
exports.canCreate = canCreate;
exports.canEdit = canEdit;
exports.canDelete = canDelete;
exports.canApprove = canApprove;
exports.getRoleInfo = getRoleInfo;
// Department-based access mapping
exports.DEPARTMENT_ACCESS = {
    'Cutting': ['/cutting', '/dashboard'],
    'Printing': ['/printing', '/dashboard'],
    'Sewing': ['/sewing', '/dashboard'],
    'Quality': ['/quality-control', '/dashboard'],
    'Finishing': ['/finishing-packing', '/dashboard'],
    'Delivery': ['/delivery', '/dashboard'],
    'Finance': ['/finance', '/dashboard'],
    'HR': ['/hr-payroll', '/dashboard'],
    'Maintenance': ['/maintenance', '/dashboard'],
    'Administration': [], // Full access
    'Management': [] // Full access
};
// Role-based access mapping
exports.ROLE_PERMISSIONS = {
    admin: {
        description: 'Full system access',
        departments: ['*'], // All departments
        canAccess: [
            '/dashboard', '/clients', '/orders', '/designs',
            '/cutting', '/printing', '/sewing', '/quality-control',
            '/finishing-packing', '/delivery', '/finance', '/hr-payroll',
            '/maintenance', '/client-portal', '/merchandising-ai',
            '/automation', '/analytics'
        ],
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canApprove: true
    },
    manager: {
        description: 'Department and team management',
        departments: ['*'], // Can see all but edit own department
        canAccess: [
            '/dashboard', '/clients', '/orders', '/designs',
            '/cutting', '/printing', '/sewing', '/quality-control',
            '/finishing-packing', '/delivery', '/finance', '/hr-payroll',
            '/maintenance', '/analytics'
        ],
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canApprove: true
    },
    supervisor: {
        description: 'Team supervision and operations',
        departments: [], // Based on employee department
        canAccess: ['/dashboard'], // Plus department-specific access
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canApprove: true
    },
    operator: {
        description: 'Production operations',
        departments: [], // Based on employee department
        canAccess: ['/dashboard'], // Plus department-specific access
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canApprove: false
    },
    employee: {
        description: 'Basic system access',
        departments: [], // Based on employee department
        canAccess: ['/dashboard'], // Plus limited department access
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canApprove: false
    }
};
// Check if user has access to a specific route
function hasAccess(user, route) {
    const role = user.role;
    const department = user.department;
    // Admin has access to everything
    if (role === 'admin')
        return true;
    // Manager has access to most things
    if (role === 'manager') {
        return exports.ROLE_PERMISSIONS.manager.canAccess.includes(route);
    }
    // Get role permissions
    const rolePerms = exports.ROLE_PERMISSIONS[role];
    if (!rolePerms)
        return false;
    // Check if route is in role's base access
    if (rolePerms.canAccess.includes(route))
        return true;
    // Check department-specific access
    const deptAccess = exports.DEPARTMENT_ACCESS[department];
    if (deptAccess && deptAccess.includes(route))
        return true;
    return false;
}
// Get accessible navigation items for user
function getAccessibleNavigation(user) {
    const allNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: 'Home', department: '*' },
        { name: 'Clients', href: '/clients', icon: 'Building2', department: 'Management' },
        { name: 'Orders', href: '/orders', icon: 'ShoppingCart', department: 'Management' },
        { name: 'Design & Approval', href: '/designs', icon: 'Palette', department: 'Management' },
        { name: 'Cutting Operations', href: '/cutting', icon: 'Scissors', department: 'Cutting' },
        { name: 'Printing Operations', href: '/printing', icon: 'Printer', department: 'Printing' },
        { name: 'Sewing Operations', href: '/sewing', icon: 'PocketKnife', department: 'Sewing' },
        { name: 'Quality Control', href: '/quality-control', icon: 'CheckCircle', department: 'Quality' },
        { name: 'Finishing & Packing', href: '/finishing-packing', icon: 'Package', department: 'Finishing' },
        { name: 'Delivery Management', href: '/delivery', icon: 'Truck', department: 'Delivery' },
        { name: 'Finance', href: '/finance', icon: 'DollarSign', department: 'Finance' },
        { name: 'HR & Payroll', href: '/hr-payroll', icon: 'Users', department: 'HR' },
        { name: 'Maintenance', href: '/maintenance', icon: 'Wrench', department: 'Maintenance' },
        { name: 'Client Portal', href: '/client-portal', icon: 'Globe', department: 'Management' },
        { name: 'Merchandising AI', href: '/merchandising-ai', icon: 'Bot', department: 'Management' },
        { name: 'Automation Engine', href: '/automation', icon: 'Zap', department: 'Management' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart3', department: 'Management' },
    ];
    return allNavigation.filter(item => {
        // Always show dashboard
        if (item.href === '/dashboard')
            return true;
        // Check if user has access to this route
        return hasAccess(user, item.href);
    });
}
// Check specific permissions
function canCreate(user) {
    return exports.ROLE_PERMISSIONS[user.role]?.canCreate || false;
}
function canEdit(user) {
    return exports.ROLE_PERMISSIONS[user.role]?.canEdit || false;
}
function canDelete(user) {
    return exports.ROLE_PERMISSIONS[user.role]?.canDelete || false;
}
function canApprove(user) {
    return exports.ROLE_PERMISSIONS[user.role]?.canApprove || false;
}
// Get user's role display info
function getRoleInfo(role) {
    return exports.ROLE_PERMISSIONS[role] || { description: 'Unknown role' };
}
