/**
 * Workspace Management Utility
 *
 * Provides utilities for managing workspace context throughout the application.
 * This replaces hardcoded workspace IDs with a flexible, multi-tenant approach.
 */

import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Default workspace ID for demo/development purposes
 * In production, this should come from user session or JWT token
 */
const DEFAULT_WORKSPACE_ID = 'demo-workspace-1'

/**
 * Get workspace ID from various sources
 * Priority order:
 * 1. Request headers (X-Workspace-ID)
 * 2. Cookies (workspace_id)
 * 3. Query parameters (?workspaceId=...)
 * 4. Default workspace ID
 */
export async function getWorkspaceId(request?: NextRequest): Promise<string> {
  // Try to get from request headers
  if (request) {
    const headerWorkspaceId = request.headers.get('X-Workspace-ID')
    if (headerWorkspaceId) {
      return headerWorkspaceId
    }

    // Try to get from query parameters
    const url = new URL(request.url)
    const queryWorkspaceId = url.searchParams.get('workspaceId')
    if (queryWorkspaceId) {
      return queryWorkspaceId
    }

    // Try to get from cookies
    const cookieWorkspaceId = request.cookies.get('workspace_id')?.value
    if (cookieWorkspaceId) {
      return cookieWorkspaceId
    }
  }

  // Try to get from server-side cookies
  try {
    const cookieStore = cookies()
    const workspaceCookie = cookieStore.get('workspace_id')
    if (workspaceCookie?.value) {
      return workspaceCookie.value
    }
  } catch (error) {
    // Cookies may not be available in all contexts
    console.warn('Failed to read workspace cookie:', error)
  }

  // Fall back to default workspace
  return DEFAULT_WORKSPACE_ID
}

/**
 * Get workspace ID from request (synchronous version for API routes)
 */
export function getWorkspaceIdFromRequest(request: NextRequest): string {
  // Try request headers first
  const headerWorkspaceId = request.headers.get('X-Workspace-ID')
  if (headerWorkspaceId) {
    return headerWorkspaceId
  }

  // Try query parameters
  const url = new URL(request.url)
  const queryWorkspaceId = url.searchParams.get('workspaceId')
  if (queryWorkspaceId) {
    return queryWorkspaceId
  }

  // Try cookies
  const cookieWorkspaceId = request.cookies.get('workspace_id')?.value
  if (cookieWorkspaceId) {
    return cookieWorkspaceId
  }

  // Fall back to default
  return DEFAULT_WORKSPACE_ID
}

/**
 * Set workspace ID in cookies
 * This should be called after user authentication
 */
export function setWorkspaceId(workspaceId: string): void {
  try {
    const cookieStore = cookies()
    cookieStore.set('workspace_id', workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  } catch (error) {
    console.error('Failed to set workspace cookie:', error)
  }
}

/**
 * Validate workspace ID format
 */
export function isValidWorkspaceId(workspaceId: string): boolean {
  // Workspace IDs should be alphanumeric with hyphens
  return /^[a-zA-Z0-9-_]+$/.test(workspaceId) && workspaceId.length > 0 && workspaceId.length <= 50
}

/**
 * Get workspace context from JWT token (for future implementation)
 * This is a placeholder for when proper JWT authentication is implemented
 */
export function getWorkspaceFromToken(token: string): string | null {
  // TODO: Implement JWT token parsing to extract workspace ID
  // For now, return null to fall back to other methods
  return null
}

/**
 * Workspace context type for use in API routes and components
 */
export interface WorkspaceContext {
  workspaceId: string
  isDefault: boolean
}

/**
 * Get full workspace context with metadata
 */
export async function getWorkspaceContext(request?: NextRequest): Promise<WorkspaceContext> {
  const workspaceId = await getWorkspaceId(request)
  return {
    workspaceId,
    isDefault: workspaceId === DEFAULT_WORKSPACE_ID,
  }
}
