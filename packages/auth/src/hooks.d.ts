import { UserRole, Permission, AuthUser } from "./types";
export declare function useAuth(): {
    user: AuthUser;
    isAuthenticated: boolean;
    isLoading: boolean;
    session: import("next-auth").Session;
};
export declare function usePermissions(): {
    can: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
    canAll: (permissions: Permission[]) => boolean;
    canWithContext: (permission: Permission, resource?: {
        workspace_id: string;
        owner_id?: string;
        brand_id?: string;
    }, options?: {
        requireOwnership?: boolean;
        requireSameBrand?: boolean;
    }) => boolean;
};
export declare function useRole(): {
    role: UserRole;
    hasRole: (role: UserRole) => boolean;
    hasAnyRole: (roles: UserRole[]) => boolean;
    isAdmin: () => boolean;
    isManager: () => boolean;
    isCSR: () => boolean;
    isClient: () => boolean;
};
export declare function useWorkspace(): {
    workspaceId: string;
    workspaceName: string;
    isWorkspaceMember: (workspaceId: string) => boolean;
};
export declare function useRequireAuth(options?: {
    redirectTo?: string;
    roles?: UserRole[];
    permissions?: Permission[];
}): {
    user: AuthUser;
    isLoading: boolean;
    isAuthenticated: boolean;
};
export declare function useRequireAdmin(redirectTo?: string): {
    user: AuthUser;
    isLoading: boolean;
    isAuthenticated: boolean;
};
export declare function useRequireManager(redirectTo?: string): {
    user: AuthUser;
    isLoading: boolean;
    isAuthenticated: boolean;
};
export declare function useUserPreferences(): {
    theme: "light" | "dark";
    language: string;
    timezone: string;
    setTheme: (theme: "light" | "dark") => void;
    setLanguage: (language: string) => void;
};
export declare function use2FA(): {
    isEnabled: boolean;
    isRequired: boolean;
    enable: () => Promise<never>;
    disable: () => Promise<never>;
    verify: (token: string) => Promise<never>;
};
export declare function useSessionManagement(): {
    expiresAt: any;
    timeRemaining: number;
    refreshSession: () => Promise<void>;
    extendSession: () => Promise<void>;
};
