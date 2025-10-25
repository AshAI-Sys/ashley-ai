/**
 * Authentication Guards & Route Protection
 *
 * Middleware utilities for protecting routes and checking permissions.
 * Use these guards in API routes to ensure proper authentication and authorization.
 */
import { NextRequest, NextResponse } from "next/server";
/**
 * User roles in the system
 */
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MANAGER = "manager",
    SUPERVISOR = "supervisor",
    OPERATOR = "operator",
    CLIENT = "client",
    VIEWER = "viewer"
}
/**
 * Permissions for different resources
 */
export declare enum Permission {
    ORDERS_VIEW = "orders.view",
    ORDERS_CREATE = "orders.create",
    ORDERS_UPDATE = "orders.update",
    ORDERS_DELETE = "orders.delete",
    CLIENTS_VIEW = "clients.view",
    CLIENTS_CREATE = "clients.create",
    CLIENTS_UPDATE = "clients.update",
    CLIENTS_DELETE = "clients.delete",
    FINANCE_VIEW = "finance.view",
    FINANCE_CREATE = "finance.create",
    FINANCE_UPDATE = "finance.update",
    FINANCE_DELETE = "finance.delete",
    HR_VIEW = "hr.view",
    HR_CREATE = "hr.create",
    HR_UPDATE = "hr.update",
    HR_DELETE = "hr.delete",
    PRODUCTION_VIEW = "production.view",
    PRODUCTION_CREATE = "production.create",
    PRODUCTION_UPDATE = "production.update",
    ADMIN_VIEW = "admin.view",
    ADMIN_MANAGE_USERS = "admin.manage_users",
    ADMIN_MANAGE_SETTINGS = "admin.manage_settings"
}
/**
 * User interface from session/token
 */
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    workspace_id: string;
    permissions?: Permission[];
}
/**
 * Extract user from request with JWT verification
 */
export declare function getUserFromRequest(request: NextRequest): Promise<AuthUser | null>;
/**
 * Check if user has a specific permission
 */
export declare function hasPermission(user: AuthUser, permission: Permission): boolean;
/**
 * Check if user has any of the specified permissions
 */
export declare function hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean;
/**
 * Check if user has all of the specified permissions
 */
export declare function hasAllPermissions(user: AuthUser, permissions: Permission[]): boolean;
/**
 * Require authentication middleware
 * Returns user if authenticated, otherwise returns 401 response
 */
export declare function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse>;
/**
 * Require specific permission middleware
 * Returns user if authorized, otherwise returns 401/403 response
 */
export declare function requirePermission(request: NextRequest, permission: Permission): Promise<AuthUser | NextResponse>;
/**
 * Require any of the specified permissions
 */
export declare function requireAnyPermission(request: NextRequest, permissions: Permission[]): Promise<AuthUser | NextResponse>;
/**
 * Require all of the specified permissions
 */
export declare function requireAllPermissions(request: NextRequest, permissions: Permission[]): Promise<AuthUser | NextResponse>;
/**
 * Require specific role
 */
export declare function requireRole(request: NextRequest, roles: UserRole | UserRole[]): Promise<AuthUser | NextResponse>;
/**
 * Example usage in API routes:
 *
 * import { requireAuth, requirePermission, Permission } from '@/lib/auth-guards'
 *
 * export async function GET(request: NextRequest) {
 *   // Require authentication
 *   const userOrResponse = await requireAuth(request)
 *   if (userOrResponse instanceof NextResponse) return userOrResponse
 *   const user = userOrResponse
 *
 *   // Now you have authenticated user
 *   // ...
 * }
 *
 * export async function POST(request: NextRequest) {
 *   // Require specific permission
 *   const userOrResponse = await requirePermission(request, Permission.ORDERS_CREATE)
 *   if (userOrResponse instanceof NextResponse) return userOrResponse
 *   const user = userOrResponse
 *
 *   // User is authorized to create orders
 *   // ...
 * }
 */
