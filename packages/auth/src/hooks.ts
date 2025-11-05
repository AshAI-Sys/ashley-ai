// ASH AI Authentication React Hooks
// Custom hooks for authentication and authorization

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole, Permission, AuthUser } from "./types";
import { hasPermission, hasAnyPermission, checkPermission } from "./utils";

// Main authentication hook
export function useAuth() {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name!,
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
export function usePermissions() {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(permission =>
      hasPermission(user.role, permission)
    );
  };

  const canWithContext = (
    permission: Permission,
    resource?: { workspace_id: string; owner_id?: string; brand_id?: string },
    options?: { requireOwnership?: boolean; requireSameBrand?: boolean }
  ): boolean => {
    if (!user) return false;
    return checkPermission({ user, resource }, permission, options);
  };

  return { can, canAny, canAll, canWithContext };
}

// Hook for role-based access
export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);
  const isManager = (): boolean => hasRole(UserRole.MANAGER);
  const isCSR = (): boolean => hasRole(UserRole.CSR);
  const isClient = (): boolean => hasRole(UserRole.CLIENT);

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
export function useWorkspace() {
  const { user } = useAuth();

  return {
    workspaceId: user?.workspace_id,
    workspaceName: user?.workspace_name,
    isWorkspaceMember: (workspaceId: string): boolean => {
      return user?.workspace_id === workspaceId;
    },
  };
}

// Hook for protected routes (client-side)
export function useRequireAuth(options?: {
  redirectTo?: string;
  roles?: UserRole[];
  permissions?: Permission[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { hasAnyRole } = useRole();
  const { canAny } = usePermissions();
  const router = useRouter();

  useEffect(() => {
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
export function useRequireAdmin(redirectTo?: string) {
  return useRequireAuth({
    redirectTo,
    roles: [UserRole.ADMIN],
  });
}

// Hook for manager+ access
export function useRequireManager(redirectTo?: string) {
  return useRequireAuth({
    redirectTo,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  });
}

// Hook for user preferences
export function useUserPreferences() {
  const { user } = useAuth();

  // This would integrate with a user preferences system
  // For now, return placeholder functions
  return {
    theme: "light" as "light" | "dark",
    language: "en" as string,
    timezone: "Asia/Manila" as string,
    setTheme: (theme: "light" | "dark") => {
      // TODO: Implement theme persistence
    },
    setLanguage: (language: string) => {
      // TODO: Implement language persistence
    },
  };
}

// Hook for 2FA status
export function use2FA() {
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
    verify: async (token: string) => {
      // TODO: Implement 2FA verification
      throw new Error("2FA not implemented yet");
    },
  };
}

// Hook for session management
export function useSessionManagement() {
  const { data: session } = useSession();

  const refreshSession = async () => {
    // Trigger session refresh
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  const extendSession = async () => {
    // TODO: Implement session extension
    await refreshSession();
  };

  const getSessionTimeRemaining = (): number => {
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
