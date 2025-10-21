"use client";

import { ReactNode } from "react";
import { useAuth } from "../lib/auth-context";
import { hasAnyPermission, Permission, Role } from "../lib/rbac";

interface PermissionGateProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: Role[];
  requiredPermission?: Permission;
  requiredRole?: Role;
  fallback?: ReactNode;
  department?: string;
}

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
export default function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requiredPermission,
  requiredRole,
  fallback = null,
  department,
}: PermissionGateProps) {
  const { user } = useAuth();

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

      const allowedDepts =
        crossDepartmentAccess[
          user.department as keyof typeof crossDepartmentAccess
        ] || [];
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
    const hasRequiredRole = allRoles.includes(user.role as Role);
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

    const hasRequiredPermission = hasAnyPermission(
      userPermissions as Permission[],
      allPermissions
    );
    if (!hasRequiredPermission) {
      return <>{fallback}</>;
    }
  }

  // If no specific requirements, show content (default behavior)
  return <>{children}</>;
}

// Higher-order component version
export function withPermissions(
  Component: React.ComponentType<any>,
  permissionConfig: Omit<PermissionGateProps, "children">
) {
  return function PermissionWrappedComponent(props: any) {
    return (
      <PermissionGate {...permissionConfig}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

// Utility hook for checking permissions in components
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;

    let userPermissions = user.permissions || [];
    if (userPermissions.length === 0) {
      const { getRoleBasedPermissions } = require("../lib/rbac");
      userPermissions = getRoleBasedPermissions(user.role);
    }

    return userPermissions.includes(permission);
  };

  const hasAnyOfPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;

    let userPermissions = user.permissions || [];
    if (userPermissions.length === 0) {
      const { getRoleBasedPermissions } = require("../lib/rbac");
      userPermissions = getRoleBasedPermissions(user.role);
    }

    return hasAnyPermission(userPermissions as Permission[], permissions);
  };

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role as Role) : false;
  };

  const canAccessDepartment = (department: string): boolean => {
    if (!user || !user.department) return false;
    if (user.role === "admin" || user.department === "Administration")
      return true;
    if (user.department === department) return true;

    // Cross-department access rules
    const crossDepartmentAccess = {
      Sales: ["Design"],
      Production: ["Design", "Quality"],
      Quality: ["Production"],
      Finance: ["Sales", "HR"],
    };

    const allowedDepartments =
      crossDepartmentAccess[
        user.department as keyof typeof crossDepartmentAccess
      ] || [];
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
