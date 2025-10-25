"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PermissionGate;
exports.withPermissions = withPermissions;
exports.usePermissions = usePermissions;
const auth_context_1 = require("../lib/auth-context");
const rbac_1 = require("../lib/rbac");
/**
 * PermissionGate component to control visibility based on user permissions and roles
 *
 * @param permissions - Array of permissions, user needs ANY of these to see content
 * @param roles - Array of roles, user needs to have ANY of these roles
 * @param requiredPermission - Single permission required
 * @param requiredRole - Single role required
 * @param fallback - Component to show when access is denied
 * @param department - Department restriction (optional)
 */
function PermissionGate({ children, permissions = [], roles = [], requiredPermission, requiredRole, fallback = null, department, }) {
    const { user } = (0, auth_context_1.useAuth)();
    // If no user is authenticated, deny access
    if (!user) {
        return <>{fallback}</>;
    }
    // Combine single permission/role with arrays
    const allPermissions = [
        ...permissions,
        ...(requiredPermission ? [requiredPermission] : []),
    ];
    const allRoles = [...roles, ...(requiredRole ? [requiredRole] : [])];
    // Check department restrictions
    if (department && user.department && user.department !== "Administration") {
        if (user.department !== department) {
            // Allow certain cross-department access
            const crossDepartmentAccess = {
                Sales: ["Design"],
                Production: ["Design", "Quality"],
                Quality: ["Production"],
                Finance: ["Sales", "HR"],
            };
            const allowedDepts = crossDepartmentAccess[user.department] || [];
            if (!allowedDepts.includes(department)) {
                return <>{fallback}</>;
            }
        }
    }
    // Admin users have access to everything
    if (user.role === "admin") {
        return <>{children}</>;
    }
    // Check role requirements
    if (allRoles.length > 0) {
        const hasRequiredRole = allRoles.includes(user.role);
        if (!hasRequiredRole) {
            return <>{fallback}</>;
        }
    }
    // Check permission requirements
    if (allPermissions.length > 0) {
        // Get user permissions from role if not provided
        let userPermissions = user.permissions || [];
        if (userPermissions.length === 0) {
            const { getRoleBasedPermissions } = require("../lib/rbac");
            userPermissions = getRoleBasedPermissions(user.role);
        }
        const hasRequiredPermission = (0, rbac_1.hasAnyPermission)(userPermissions, allPermissions);
        if (!hasRequiredPermission) {
            return <>{fallback}</>;
        }
    }
    // If no specific requirements, show content (default behavior)
    return <>{children}</>;
}
// Higher-order component version
function withPermissions(Component, permissionConfig) {
    return function PermissionWrappedComponent(props) {
        return (<PermissionGate {...permissionConfig}>
        <Component {...props}/>
      </PermissionGate>);
    };
}
// Utility hook for checking permissions in components
function usePermissions() {
    const { user } = (0, auth_context_1.useAuth)();
    const hasPermission = (permission) => {
        if (!user)
            return false;
        if (user.role === "admin")
            return true;
        let userPermissions = user.permissions || [];
        if (userPermissions.length === 0) {
            const { getRoleBasedPermissions } = require("../lib/rbac");
            userPermissions = getRoleBasedPermissions(user.role);
        }
        return userPermissions.includes(permission);
    };
    const hasAnyOfPermissions = (permissions) => {
        if (!user)
            return false;
        if (user.role === "admin")
            return true;
        let userPermissions = user.permissions || [];
        if (userPermissions.length === 0) {
            const { getRoleBasedPermissions } = require("../lib/rbac");
            userPermissions = getRoleBasedPermissions(user.role);
        }
        return (0, rbac_1.hasAnyPermission)(userPermissions, permissions);
    };
    const hasRole = (role) => {
        return user?.role === role;
    };
    const hasAnyRole = (roles) => {
        return user ? roles.includes(user.role) : false;
    };
    const canAccessDepartment = (department) => {
        if (!user || !user.department)
            return false;
        if (user.role === "admin" || user.department === "Administration")
            return true;
        if (user.department === department)
            return true;
        // Cross-department access rules
        const crossDepartmentAccess = {
            Sales: ["Design"],
            Production: ["Design", "Quality"],
            Quality: ["Production"],
            Finance: ["Sales", "HR"],
        };
        const allowedDepartments = crossDepartmentAccess[user.department] || [];
        return allowedDepartments.includes(department);
    };
    return {
        user,
        hasPermission,
        hasAnyOfPermissions,
        hasRole,
        hasAnyRole,
        canAccessDepartment,
        isAdmin: user?.role === "admin",
        isManager: user?.role === "manager",
    };
}
