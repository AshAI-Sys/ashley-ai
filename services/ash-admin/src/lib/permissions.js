"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAccess = hasAccess;
exports.getAccessibleNavigation = getAccessibleNavigation;
exports.canCreate = canCreate;
exports.canEdit = canEdit;
exports.canDelete = canDelete;
exports.canApprove = canApprove;
exports.getRoleInfo = getRoleInfo;
// Role-based access control utilities
const rbac_1 = require("./rbac");
// Legacy role mapping for backwards compatibility (now using RBAC system)
// Check if user has access to a specific route
function hasAccess(user, route) {
    // If no permissions are provided, get them from the role
    let userPermissions = user.permissions;
    if (!userPermissions || userPermissions.length === 0) {
        const { getRoleBasedPermissions } = require('./rbac');
        userPermissions = getRoleBasedPermissions(user.role);
    }
    // Convert route to page key (remove leading slash)
    const pageKey = route.replace('/', '');
    // Use our RBAC system to check access
    return (0, rbac_1.canAccessPage)(userPermissions, pageKey);
}
// Get accessible navigation items for user
function getAccessibleNavigation(user) {
    const allNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: 'Home', department: '*', permission: 'dashboard.view' },
        { name: 'Clients', href: '/clients', icon: 'Building2', department: 'Management', permission: 'clients.view' },
        { name: 'Orders', href: '/orders', icon: 'ShoppingCart', department: 'Management', permission: 'orders.view' },
        { name: 'Design & Approval', href: '/designs', icon: 'Palette', department: 'Management', permission: 'designs.view' },
        { name: 'Cutting Operations', href: '/cutting', icon: 'Scissors', department: 'Cutting', permission: 'cutting.view' },
        { name: 'Printing Operations', href: '/printing', icon: 'Printer', department: 'Printing', permission: 'printing.view' },
        { name: 'Sewing Operations', href: '/sewing', icon: 'PocketKnife', department: 'Sewing', permission: 'sewing.view' },
        { name: 'Quality Control', href: '/quality-control', icon: 'CheckCircle', department: 'Quality', permission: 'quality.view' },
        { name: 'Finishing & Packing', href: '/finishing-packing', icon: 'Package', department: 'Finishing', permission: 'finishing.view' },
        { name: 'Delivery Management', href: '/delivery', icon: 'Truck', department: 'Delivery', permission: 'delivery.view' },
        { name: 'Finance', href: '/finance', icon: 'DollarSign', department: 'Finance', permission: 'finance.view' },
        { name: 'HR & Payroll', href: '/hr-payroll', icon: 'Users', department: 'HR', permission: 'hr.view' },
        { name: 'Maintenance', href: '/maintenance', icon: 'Wrench', department: 'Maintenance', permission: 'maintenance.view' },
        { name: 'User Management', href: '/admin/users', icon: 'Users', department: 'Administration', permission: 'admin.users' },
        { name: 'Employee Onboarding', href: '/admin/onboarding', icon: 'UserPlus', department: 'Administration', permission: 'admin.onboarding' },
        { name: 'Audit Logs', href: '/admin/audit', icon: 'Shield', department: 'Administration', permission: 'admin.audit' },
        { name: 'Reports & Analytics', href: '/admin/reports', icon: 'BarChart3', department: 'Administration', permission: 'admin.reports' },
        { name: 'Merchandising AI', href: '/merchandising', icon: 'Bot', department: 'Management', permission: 'merchandising.view' },
        { name: 'Automation Engine', href: '/automation', icon: 'Zap', department: 'Management', permission: 'automation.view' },
    ];
    // Admin users get access to ALL navigation items
    if (user.role === 'admin' || user.role === 'Admin') {
        return allNavigation;
    }
    // Admin users with '*' permissions get access to ALL navigation items
    if (user.permissions && (user.permissions.includes('*') || user.permissions.includes('all'))) {
        return allNavigation;
    }
    const userPermissions = user.permissions || [];
    return allNavigation.filter(item => {
        // Always show dashboard for all users
        if (item.href === '/dashboard')
            return true;
        // Check specific permission or wildcard for department
        const requiredPermission = item.permission;
        const departmentWildcard = requiredPermission.split('.')[0] + '.*';
        return userPermissions.includes(requiredPermission) ||
            userPermissions.includes(departmentWildcard);
    });
}
// Check specific permissions using RBAC system
function canCreate(user, context) {
    // If no permissions are provided, get them from the role
    let userPermissions = user.permissions;
    if (!userPermissions || userPermissions.length === 0) {
        const { getRoleBasedPermissions } = require('./rbac');
        userPermissions = getRoleBasedPermissions(user.role);
    }
    // Check for create permissions in the specific context
    const createPermissions = userPermissions.filter(p => p.includes(':create'));
    return createPermissions.length > 0;
}
function canEdit(user, context) {
    // If no permissions are provided, get them from the role
    let userPermissions = user.permissions;
    if (!userPermissions || userPermissions.length === 0) {
        const { getRoleBasedPermissions } = require('./rbac');
        userPermissions = getRoleBasedPermissions(user.role);
    }
    // Check for update permissions in the specific context
    const updatePermissions = userPermissions.filter(p => p.includes(':update'));
    return updatePermissions.length > 0;
}
function canDelete(user, context) {
    // If no permissions are provided, get them from the role
    let userPermissions = user.permissions;
    if (!userPermissions || userPermissions.length === 0) {
        const { getRoleBasedPermissions } = require('./rbac');
        userPermissions = getRoleBasedPermissions(user.role);
    }
    // Check for delete permissions in the specific context
    const deletePermissions = userPermissions.filter(p => p.includes(':delete'));
    return deletePermissions.length > 0;
}
function canApprove(user, context) {
    // If no permissions are provided, get them from the role
    let userPermissions = user.permissions;
    if (!userPermissions || userPermissions.length === 0) {
        const { getRoleBasedPermissions } = require('./rbac');
        userPermissions = getRoleBasedPermissions(user.role);
    }
    // Check for approve permissions in the specific context
    const approvePermissions = userPermissions.filter(p => p.includes(':approve'));
    return approvePermissions.length > 0;
}
// Get user's role display info
function getRoleInfo(role) {
    const roleDescriptions = {
        admin: { description: 'Full system access' },
        manager: { description: 'Department management' },
        designer: { description: 'Design workflow' },
        cutting_operator: { description: 'Cutting operations' },
        printing_operator: { description: 'Printing operations' },
        sewing_operator: { description: 'Sewing operations' },
        qc_inspector: { description: 'Quality control' },
        finishing_operator: { description: 'Finishing & packing' },
        warehouse_staff: { description: 'Delivery & warehouse' },
        finance_staff: { description: 'Finance operations' },
        hr_staff: { description: 'HR operations' },
        maintenance_tech: { description: 'Maintenance' }
    };
    return roleDescriptions[role] || { description: 'Unknown role' };
}
