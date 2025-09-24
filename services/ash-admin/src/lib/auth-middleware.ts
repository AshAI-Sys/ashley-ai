import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, apiRateLimit } from './rate-limit'
import { verifyToken, JWTPayload } from './jwt'
import { Permission, Role, getAllPermissionsForRole, hasPermission, hasAnyPermission } from './rbac'

export interface AuthUser {
  id: string
  email: string
  role: Role
  workspaceId: string
  permissions: Permission[]
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // Development mode fallback - only in development
    if (process.env.NODE_ENV === 'development' && token === 'demo-jwt-token-12345') {
      console.warn('Using demo authentication token - DEVELOPMENT ONLY')
      const role: Role = 'admin'
      return {
        id: 'demo-user-1',
        email: 'admin@ashleyai.com',
        role,
        workspaceId: 'demo-workspace-1',
        permissions: getAllPermissionsForRole(role)
      }
    }

    // Proper JWT validation
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const role = payload.role as Role
    return {
      id: payload.userId,
      email: payload.email,
      role,
      workspaceId: payload.workspaceId,
      permissions: getAllPermissionsForRole(role)
    }

    // TODO: Implement proper JWT validation
    // const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // return decoded as AuthUser

    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return rateLimit(apiRateLimit)(async (request: NextRequest) => {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid authentication token required' },
        { status: 401 }
      )
    }

    return handler(request, user)
  })
}

// Permission-based middleware functions
export function requirePermission(permission: Permission) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
    return requireAuth(async (request: NextRequest, user: AuthUser) => {
      if (!hasPermission(user.permissions, permission)) {
        return NextResponse.json(
          { error: `Access denied. Required permission: ${permission}` },
          { status: 403 }
        )
      }
      return handler(request, user)
    })
  }
}

export function requireAnyPermission(permissions: Permission[]) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
    return requireAuth(async (request: NextRequest, user: AuthUser) => {
      if (!hasAnyPermission(user.permissions, permissions)) {
        return NextResponse.json(
          { error: `Access denied. Required permissions: ${permissions.join(' or ')}` },
          { status: 403 }
        )
      }
      return handler(request, user)
    })
  }
}

export function requireRole(role: Role) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
    return requireAuth(async (request: NextRequest, user: AuthUser) => {
      if (user.role !== role) {
        return NextResponse.json(
          { error: `Access denied. Required role: ${role}` },
          { status: 403 }
        )
      }
      return handler(request, user)
    })
  }
}

export function requireAdmin() {
  return requireRole('admin')
}

export function validateWorkspaceAccess(userWorkspaceId: string, requestedWorkspaceId: string): boolean {
  // For demo, allow access to demo workspace
  if (userWorkspaceId === 'demo-workspace-1' && requestedWorkspaceId === 'demo-workspace-1') {
    return true
  }

  // In production, implement proper workspace access control
  return userWorkspaceId === requestedWorkspaceId
}