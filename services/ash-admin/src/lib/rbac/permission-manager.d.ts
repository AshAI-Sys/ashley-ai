export type PermissionAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "EXECUTE" | "APPROVE" | "EXPORT";
export type PermissionResource = "ORDERS" | "CLIENTS" | "PRODUCTION" | "QUALITY" | "FINANCE" | "HR" | "INVENTORY" | "REPORTS" | "USERS" | "SETTINGS" | "AI_FEATURES" | "MAINTENANCE" | "DELIVERIES" | "DESIGN";
export interface Permission {
    id: string;
    name: string;
    resource: PermissionResource;
    action: PermissionAction;
    description: string;
    conditions?: Record<string, any>;
}
export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    is_system_role: boolean;
    workspace_id: string;
}
export interface UserPermissions {
    user_id: string;
    workspace_id: string;
    role: string;
    permissions: Permission[];
    can(resource: PermissionResource, action: PermissionAction): boolean;
}
export declare class PermissionManager {
    private readonly SYSTEM_PERMISSIONS;
    private readonly SYSTEM_ROLES;
    getAllPermissions(): Permission[];
    hasPermission(user_id: string, resource: PermissionResource, action: PermissionAction): Promise<boolean>;
    getUserPermissions(user_id: string): Promise<UserPermissions>;
    getRolePermissions(role: string): Permission[];
    private matchesPermissionPattern;
    private checkPermission;
    assignPermissions(user_id: string, permissionNames: string[]): Promise<boolean>;
    createRole(workspace_id: string, name: string, description: string, permissionNames: string[]): Promise<Role>;
    getAvailableRoles(): Array<{
        id: string;
        name: string;
        description: string;
    }>;
}
export declare const permissionManager: PermissionManager;
