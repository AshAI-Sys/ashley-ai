/**
 * Authentication Guards & Route Protection
 *
 * Middleware utilities for protecting routes and checking permissions.
 * Use these guards in API routes to ensure proper authentication and authorization.
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiUnauthorized, apiForbidden } from './api-response'
import { authLogger } from './logger'

/**
 * User roles in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operator',
  CLIENT = 'client',
  VIEWER = 'viewer',
}

/**
 * Permissions for different resources
 */
export enum Permission {
  // Order permissions
  ORDERS_VIEW = 'orders.view',
  ORDERS_CREATE = 'orders.create',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_DELETE = 'orders.delete',

  // Client permissions
  CLIENTS_VIEW = 'clients.view',
  CLIENTS_CREATE = 'clients.create',
  CLIENTS_UPDATE = 'clients.update',
  CLIENTS_DELETE = 'clients.delete',

  // Finance permissions
  FINANCE_VIEW = 'finance.view',
  FINANCE_CREATE = 'finance.create',
  FINANCE_UPDATE = 'finance.update',
  FINANCE_DELETE = 'finance.delete',

  // HR permissions
  HR_VIEW = 'hr.view',
  HR_CREATE = 'hr.create',
  HR_UPDATE = 'hr.update',
  HR_DELETE = 'hr.delete',

  // Production permissions
  PRODUCTION_VIEW = 'production.view',
  PRODUCTION_CREATE = 'production.create',
  PRODUCTION_UPDATE = 'production.update',

  // Admin permissions
  ADMIN_VIEW = 'admin.view',
  ADMIN_MANAGE_USERS = 'admin.manage_users',
  ADMIN_MANAGE_SETTINGS = 'admin.manage_settings',
}

/**
 * Role-based permission mapping
 */
const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(Permission),
  ],
  [UserRole.ADMIN]: [
    Permission.ORDERS_VIEW,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_UPDATE,
    Permission.ORDERS_DELETE,
    Permission.CLIENTS_VIEW,
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_UPDATE,
    Permission.CLIENTS_DELETE,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.HR_VIEW,
    Permission.HR_CREATE,
    Permission.HR_UPDATE,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_CREATE,
    Permission.PRODUCTION_UPDATE,
    Permission.ADMIN_VIEW,
  ],
  [UserRole.MANAGER]: [
    Permission.ORDERS_VIEW,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_UPDATE,
    Permission.CLIENTS_VIEW,
    Permission.CLIENTS_CREATE,
    Permission.CLIENTS_UPDATE,
    Permission.FINANCE_VIEW,
    Permission.HR_VIEW,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_CREATE,
    Permission.PRODUCTION_UPDATE,
  ],
  [UserRole.SUPERVISOR]: [
    Permission.ORDERS_VIEW,
    Permission.ORDERS_CREATE,
    Permission.CLIENTS_VIEW,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_CREATE,
    Permission.PRODUCTION_UPDATE,
  ],
  [UserRole.OPERATOR]: [
    Permission.ORDERS_VIEW,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_UPDATE,
  ],
  [UserRole.CLIENT]: [
    Permission.ORDERS_VIEW, // Only their own orders
  ],
  [UserRole.VIEWER]: [
    Permission.ORDERS_VIEW,
    Permission.CLIENTS_VIEW,
    Permission.PRODUCTION_VIEW,
  ],
}

/**
 * User interface from session/token
 */
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  workspace_id: string
  permissions?: Permission[]
}

/**
 * Extract user from request (mock implementation)
 * TODO: Replace with actual JWT token verification
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      // TODO: Verify JWT token and extract user
      // For now, return a mock user for demo purposes
      if (token === 'demo-token') {
        return {
          id: 'demo-user-1',
          email: 'admin@ashleyai.com',
          role: UserRole.ADMIN,
          workspace_id: 'demo-workspace-1',
        }
      }
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('session')
    if (sessionCookie) {
      // TODO: Verify session and extract user
      // For now, return a demo user if session exists
      return {
        id: 'demo-user-1',
        email: 'admin@ashleyai.com',
        role: UserRole.ADMIN,
        workspace_id: 'demo-workspace-1',
      }
    }

    // In demo mode, allow unauthenticated requests
    if (process.env.DEMO_MODE === 'true') {
      return {
        id: 'demo-user-1',
        email: 'admin@ashleyai.com',
        role: UserRole.ADMIN,
        workspace_id: 'demo-workspace-1',
      }
    }

    return null
  } catch (error) {
    authLogger.error('Failed to extract user from request', error)
    return null
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AuthUser, permission: Permission): boolean {
  // Use custom permissions if provided
  if (user.permissions) {
    return user.permissions.includes(permission)
  }

  // Otherwise check role-based permissions
  const rolePermissions = RolePermissions[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission))
}

/**
 * Require authentication middleware
 * Returns user if authenticated, otherwise returns 401 response
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getUserFromRequest(request)

  if (!user) {
    authLogger.warn('Unauthenticated request', {
      path: request.nextUrl.pathname,
      method: request.method,
    })
    return apiUnauthorized('Authentication required')
  }

  return user
}

/**
 * Require specific permission middleware
 * Returns user if authorized, otherwise returns 401/403 response
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<AuthUser | NextResponse> {
  const user = await getUserFromRequest(request)

  if (!user) {
    authLogger.warn('Unauthenticated request', {
      path: request.nextUrl.pathname,
      method: request.method,
      permission,
    })
    return apiUnauthorized('Authentication required')
  }

  if (!hasPermission(user, permission)) {
    authLogger.warn('Unauthorized request', {
      path: request.nextUrl.pathname,
      method: request.method,
      userId: user.id,
      userRole: user.role,
      permission,
    })
    return apiForbidden('Insufficient permissions')
  }

  return user
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: Permission[]
): Promise<AuthUser | NextResponse> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return apiUnauthorized('Authentication required')
  }

  if (!hasAnyPermission(user, permissions)) {
    authLogger.warn('Unauthorized request - missing any permission', {
      userId: user.id,
      userRole: user.role,
      requiredPermissions: permissions,
    })
    return apiForbidden('Insufficient permissions')
  }

  return user
}

/**
 * Require all of the specified permissions
 */
export async function requireAllPermissions(
  request: NextRequest,
  permissions: Permission[]
): Promise<AuthUser | NextResponse> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return apiUnauthorized('Authentication required')
  }

  if (!hasAllPermissions(user, permissions)) {
    authLogger.warn('Unauthorized request - missing all permissions', {
      userId: user.id,
      userRole: user.role,
      requiredPermissions: permissions,
    })
    return apiForbidden('Insufficient permissions')
  }

  return user
}

/**
 * Require specific role
 */
export async function requireRole(
  request: NextRequest,
  roles: UserRole | UserRole[]
): Promise<AuthUser | NextResponse> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return apiUnauthorized('Authentication required')
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  if (!allowedRoles.includes(user.role)) {
    authLogger.warn('Unauthorized request - invalid role', {
      userId: user.id,
      userRole: user.role,
      requiredRoles: allowedRoles,
    })
    return apiForbidden('Insufficient permissions')
  }

  return user
}

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
