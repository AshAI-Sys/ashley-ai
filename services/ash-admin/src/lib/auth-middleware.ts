import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, apiRateLimit } from './rate-limit'

export interface AuthUser {
  id: string
  email: string
  role: string
  workspaceId: string
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // For demo purposes, accept the demo token
    // In production, this should validate a real JWT
    if (token === 'demo-jwt-token-12345') {
      return {
        id: 'demo-user-1',
        email: 'admin@ashleyai.com',
        role: 'admin',
        workspaceId: 'demo-workspace-1'
      }
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

export function validateWorkspaceAccess(userWorkspaceId: string, requestedWorkspaceId: string): boolean {
  // For demo, allow access to demo workspace
  if (userWorkspaceId === 'demo-workspace-1' && requestedWorkspaceId === 'demo-workspace-1') {
    return true
  }

  // In production, implement proper workspace access control
  return userWorkspaceId === requestedWorkspaceId
}