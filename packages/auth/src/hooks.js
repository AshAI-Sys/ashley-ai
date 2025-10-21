// ASH AI Authentication React Hooks
// Custom hooks for authentication and authorization
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
exports.usePermissions = usePermissions;
exports.useRole = useRole;
exports.useWorkspace = useWorkspace;
exports.useRequireAuth = useRequireAuth;
exports.useRequireAdmin = useRequireAdmin;
exports.useRequireManager = useRequireManager;
exports.useUserPreferences = useUserPreferences;
exports.use2FA = use2FA;
exports.useSessionManagement = useSessionManagement;
const react_1 = require("next-auth/react");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
const types_1 = require("./types");
const utils_1 = require("./utils");
// Main authentication hook
function useAuth() {
  const { data: session, status } = (0, react_1.useSession)();
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        workspace_id: session.user.workspace_id,
        workspace_name: session.user.workspace_name,
        permissions: session.user.permissions,
        requires_2fa: session.user.requires_2fa,
        avatar_url: session.user.image || undefined,
      }
    : null;
  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    session,
  };
}
// Hook for checking user permissions
function usePermissions() {
  const { user } = useAuth();
  const can = permission => {
    if (!user) return false;
    return (0, utils_1.hasPermission)(user.role, permission);
  };
  const canAny = permissions => {
    if (!user) return false;
    return (0, utils_1.hasAnyPermission)(user.role, permissions);
  };
  const canAll = permissions => {
    if (!user) return false;
    return permissions.every(permission =>
      (0, utils_1.hasPermission)(user.role, permission)
    );
  };
  const canWithContext = (permission, resource, options) => {
    if (!user) return false;
    return (0, utils_1.checkPermission)(
      { user, resource },
      permission,
      options
    );
  };
  return { can, canAny, canAll, canWithContext };
}
// Hook for role-based access
function useRole() {
  const { user } = useAuth();
  const hasRole = role => {
    return user?.role === role;
  };
  const hasAnyRole = roles => {
    if (!user) return false;
    return roles.includes(user.role);
  };
  const isAdmin = () => hasRole(types_1.UserRole.ADMIN);
  const isManager = () => hasRole(types_1.UserRole.MANAGER);
  const isCSR = () => hasRole(types_1.UserRole.CSR);
  const isClient = () => hasRole(types_1.UserRole.CLIENT);
  return {
    role: user?.role,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isCSR,
    isClient,
  };
}
// Hook for workspace context
function useWorkspace() {
  const { user } = useAuth();
  return {
    workspaceId: user?.workspace_id,
    workspaceName: user?.workspace_name,
    isWorkspaceMember: workspaceId => {
      return user?.workspace_id === workspaceId;
    },
  };
}
// Hook for protected routes (client-side)
function useRequireAuth(options) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { hasAnyRole } = useRole();
  const { canAny } = usePermissions();
  const router = (0, navigation_1.useRouter)();
  (0, react_2.useEffect)(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(options?.redirectTo || "/auth/signin");
      return;
    }
    if (options?.roles && !hasAnyRole(options.roles)) {
      router.push("/auth/error?error=AccessDenied");
      return;
    }
    if (options?.permissions && !canAny(options.permissions)) {
      router.push("/auth/error?error=AccessDenied");
      return;
    }
  }, [isLoading, isAuthenticated, user, router, options]);
  return { user, isLoading, isAuthenticated };
}
// Hook for admin-only access
function useRequireAdmin(redirectTo) {
  return useRequireAuth({
    redirectTo,
    roles: [types_1.UserRole.ADMIN],
  });
}
// Hook for manager+ access
function useRequireManager(redirectTo) {
  return useRequireAuth({
    redirectTo,
    roles: [types_1.UserRole.ADMIN, types_1.UserRole.MANAGER],
  });
}
// Hook for user preferences
function useUserPreferences() {
  const { user } = useAuth();
  // This would integrate with a user preferences system
  // For now, return placeholder functions
  return {
    theme: "light",
    language: "en",
    timezone: "Asia/Manila",
    setTheme: theme => {
      // TODO: Implement theme persistence
    },
    setLanguage: language => {
      // TODO: Implement language persistence
    },
  };
}
// Hook for 2FA status
function use2FA() {
  const { user } = useAuth();
  return {
    isEnabled: user?.requires_2fa || false,
    isRequired: user?.requires_2fa || false,
    enable: async () => {
      // TODO: Implement 2FA enablement
      throw new Error("2FA not implemented yet");
    },
    disable: async () => {
      // TODO: Implement 2FA disabling
      throw new Error("2FA not implemented yet");
    },
    verify: async token => {
      // TODO: Implement 2FA verification
      throw new Error("2FA not implemented yet");
    },
  };
}
// Hook for session management
function useSessionManagement() {
  const { session } = (0, react_1.useSession)();
  const refreshSession = async () => {
    // Trigger session refresh
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };
  const extendSession = async () => {
    // TODO: Implement session extension
    await refreshSession();
  };
  const getSessionTimeRemaining = () => {
    if (!session?.expires) return 0;
    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    return Math.max(0, expiresAt - now);
  };
  return {
    expiresAt: session?.expires,
    timeRemaining: getSessionTimeRemaining(),
    refreshSession,
    extendSession,
  };
}
