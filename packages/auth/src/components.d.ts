import React from "react";
import { UserRole, Permission } from "./types";
interface ProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}
interface RoleGuardProps extends ProtectedProps {
  roles: UserRole | UserRole[];
  requireAll?: boolean;
}
interface PermissionGuardProps extends ProtectedProps {
  permissions: Permission | Permission[];
  requireAll?: boolean;
}
interface AuthGuardProps extends ProtectedProps {
  requireAuth?: boolean;
}
export declare function AuthGuard({
  children,
  fallback,
  loading,
  requireAuth,
}: AuthGuardProps): React.JSX.Element;
export declare function RoleGuard({
  children,
  roles,
  requireAll,
  fallback,
  loading,
}: RoleGuardProps): React.JSX.Element;
export declare function PermissionGuard({
  children,
  permissions,
  requireAll,
  fallback,
  loading,
}: PermissionGuardProps): React.JSX.Element;
export declare function AdminGuard({
  children,
  fallback,
  loading,
}: ProtectedProps): React.JSX.Element;
export declare function ManagerGuard({
  children,
  fallback,
  loading,
}: ProtectedProps): React.JSX.Element;
export declare function UserProfile({
  showRole,
  showWorkspace,
  className,
}: {
  showRole?: boolean;
  showWorkspace?: boolean;
  className?: string;
}): React.JSX.Element;
export declare function PermissionIndicator({
  permission,
  showIcon,
}: {
  permission: Permission;
  showIcon?: boolean;
}): React.JSX.Element;
export declare function RoleBadge({
  role,
  className,
}: {
  role?: UserRole;
  className?: string;
}): React.JSX.Element;
export declare function AuthLoadingSpinner(): React.JSX.Element;
export declare function UnauthorizedMessage({
  message,
  showContactSupport,
}: {
  message?: string;
  showContactSupport?: boolean;
}): React.JSX.Element;
export declare function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    roles?: UserRole[];
    permissions?: Permission[];
    fallback?: React.ComponentType;
  }
): {
  (props: P): React.JSX.Element;
  displayName: string;
};
interface ContextMenuItem {
  label: string;
  action: () => void;
  roles?: UserRole[];
  permissions?: Permission[];
  icon?: React.ReactNode;
}
export declare function ProtectedContextMenu({
  items,
  children,
}: {
  items: ContextMenuItem[];
  children: React.ReactNode;
}): React.JSX.Element;
export {};
