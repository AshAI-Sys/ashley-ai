// ASH AI Authentication React Components
// Reusable authentication and authorization components
"use client";
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = AuthGuard;
exports.RoleGuard = RoleGuard;
exports.PermissionGuard = PermissionGuard;
exports.AdminGuard = AdminGuard;
exports.ManagerGuard = ManagerGuard;
exports.UserProfile = UserProfile;
exports.PermissionIndicator = PermissionIndicator;
exports.RoleBadge = RoleBadge;
exports.AuthLoadingSpinner = AuthLoadingSpinner;
exports.UnauthorizedMessage = UnauthorizedMessage;
exports.withAuth = withAuth;
exports.ProtectedContextMenu = ProtectedContextMenu;
const react_1 = __importDefault(require("react"));
const hooks_1 = require("./hooks");
const types_1 = require("./types");
// Authentication guard - protects content behind login
function AuthGuard({
  children,
  fallback = null,
  loading = <div>Loading...</div>,
  requireAuth = true,
}) {
  const { isAuthenticated, isLoading } = (0, hooks_1.useAuth)();
  if (isLoading) {
    return <>{loading}</>;
  }
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
// Role-based guard - protects content based on user roles
function RoleGuard({
  children,
  roles,
  requireAll = false,
  fallback = null,
  loading = <div>Loading...</div>,
}) {
  const { isLoading } = (0, hooks_1.useAuth)();
  const { hasRole, hasAnyRole } = (0, hooks_1.useRole)();
  if (isLoading) {
    return <>{loading}</>;
  }
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasAccess = requireAll
    ? roleArray.every(role => hasRole(role))
    : hasAnyRole(roleArray);
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
// Permission-based guard - protects content based on permissions
function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  loading = <div>Loading...</div>,
}) {
  const { isLoading } = (0, hooks_1.useAuth)();
  const { can, canAny, canAll } = (0, hooks_1.usePermissions)();
  if (isLoading) {
    return <>{loading}</>;
  }
  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];
  const hasAccess = requireAll
    ? canAll(permissionArray)
    : canAny(permissionArray);
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
// Admin-only guard
function AdminGuard({ children, fallback = null, loading }) {
  return (
    <RoleGuard
      roles={types_1.UserRole.ADMIN}
      fallback={fallback}
      loading={loading}
    >
      {children}
    </RoleGuard>
  );
}
// Manager+ guard (Admin or Manager)
function ManagerGuard({ children, fallback = null, loading }) {
  return (
    <RoleGuard
      roles={[types_1.UserRole.ADMIN, types_1.UserRole.MANAGER]}
      fallback={fallback}
      loading={loading}
    >
      {children}
    </RoleGuard>
  );
}
// User profile display component
function UserProfile({
  showRole = true,
  showWorkspace = true,
  className = "",
}) {
  const { user } = (0, hooks_1.useAuth)();
  if (!user) return null;
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
          <span className="text-sm font-medium text-gray-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{user.name}</span>

        {showRole && (
          <span className="text-xs text-gray-500">
            {user.role.replace("_", " ").toLowerCase()}
          </span>
        )}

        {showWorkspace && (
          <span className="text-xs text-gray-400">{user.workspace_name}</span>
        )}
      </div>
    </div>
  );
}
// Permission indicator component
function PermissionIndicator({ permission, showIcon = true }) {
  const { can } = (0, hooks_1.usePermissions)();
  const hasPermission = can(permission);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        hasPermission
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
      title={`Permission: ${permission}`}
    >
      {showIcon && <span className="mr-1">{hasPermission ? "✓" : "✗"}</span>}
      {permission}
    </span>
  );
}
// Role badge component
function RoleBadge({ role, className = "" }) {
  const { role: userRole } = (0, hooks_1.useRole)();
  const displayRole = role || userRole;
  if (!displayRole) return null;
  const getRoleColor = role => {
    switch (role) {
      case types_1.UserRole.ADMIN:
        return "bg-red-100 text-red-800";
      case types_1.UserRole.MANAGER:
        return "bg-blue-100 text-blue-800";
      case types_1.UserRole.CSR:
        return "bg-green-100 text-green-800";
      case types_1.UserRole.GRAPHIC_ARTIST:
        return "bg-purple-100 text-purple-800";
      case types_1.UserRole.QC_INSPECTOR:
        return "bg-yellow-100 text-yellow-800";
      case types_1.UserRole.PRODUCTION_OPERATOR:
        return "bg-orange-100 text-orange-800";
      case types_1.UserRole.WAREHOUSE_STAFF:
        return "bg-gray-100 text-gray-800";
      case types_1.UserRole.CLIENT:
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleColor(displayRole)} ${className}`}
    >
      {displayRole.replace("_", " ")}
    </span>
  );
}
// Loading states for authentication
function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
    </div>
  );
}
// Unauthorized access message
function UnauthorizedMessage({
  message = "You don't have permission to access this content.",
  showContactSupport = true,
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto h-12 w-12 text-red-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>

      <p className="mt-1 text-sm text-gray-500">{message}</p>

      {showContactSupport && (
        <p className="mt-2 text-xs text-gray-400">
          If you believe this is an error, please contact your administrator.
        </p>
      )}
    </div>
  );
}
// Higher-order component for protecting entire pages
function withAuth(Component, options) {
  const WrappedComponent = props => {
    const fallback = options?.fallback ? (
      <options.fallback />
    ) : (
      <UnauthorizedMessage />
    );
    if (options?.roles) {
      return (
        <AuthGuard>
          <RoleGuard roles={options.roles} fallback={fallback}>
            <Component {...props} />
          </RoleGuard>
        </AuthGuard>
      );
    }
    if (options?.permissions) {
      return (
        <AuthGuard>
          <PermissionGuard
            permissions={options.permissions}
            fallback={fallback}
          >
            <Component {...props} />
          </PermissionGuard>
        </AuthGuard>
      );
    }
    return (
      <AuthGuard fallback={fallback}>
        <Component {...props} />
      </AuthGuard>
    );
  };
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
function ProtectedContextMenu({ items, children }) {
  const { hasAnyRole } = (0, hooks_1.useRole)();
  const { canAny } = (0, hooks_1.usePermissions)();
  const filteredItems = items.filter(item => {
    if (item.roles && !hasAnyRole(item.roles)) return false;
    if (item.permissions && !canAny(item.permissions)) return false;
    return true;
  });
  if (filteredItems.length === 0) {
    return <>{children}</>;
  }
  // This would integrate with your preferred context menu library
  // For now, just render the children
  return <>{children}</>;
}
