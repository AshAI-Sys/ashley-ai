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
        { name: 'Merchandising AI', href: '/merchandising', icon: 'Bot', department: 'Management' },
        { name: 'Automation Engine', href: '/automation', icon: 'Zap', department: 'Management' },
    ];
    return allNavigation.filter(item => {
        // Always show dashboard (everyone can see dashboard, filtered by their permissions)
        if (item.href === '/dashboard')
            return true;
        // Check if user has access to this route using RBAC
        return hasAccess(user, item.href);
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
