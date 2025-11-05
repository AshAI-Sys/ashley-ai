/**
 * Workspace Management Utility
 *
 * Provides utilities for managing workspace context throughout the application.
 * This replaces hardcoded workspace IDs with a flexible, multi-tenant approach.
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * No default workspace in production
 * Workspace ID must come from authenticated user session
 */

/**
 * Get workspace ID from various sources
 * Priority order:
 * 1. Request headers (X-Workspace-ID)
 * 2. JWT token (Authorization header)
 * 3. Cookies (workspace_id)
 * 4. Query parameters (?workspaceId=...)
 *
 * IMPORTANT: Returns null if no workspace found - requires authentication
 */
export async function getWorkspaceId(
  request?: NextRequest
): Promise<string | null> {
  // Try to get from request headers
  if (request) {
    const headerWorkspaceId = request.headers.get("X-Workspace-ID");
    if (headerWorkspaceId) {
      return headerWorkspaceId;
    }

    // Try to extract from JWT token in Authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const workspaceId = await getWorkspaceFromToken(token);
      if (workspaceId) {
        return workspaceId;
      }
    }

    // Try to get from query parameters
    const url = new URL(request.url);
    const queryWorkspaceId = url.searchParams.get("workspaceId");
    if (queryWorkspaceId) {
      return queryWorkspaceId;
    }

    // Try to get from cookies
    const cookieWorkspaceId = request.cookies.get("workspace_id")?.value;
    if (cookieWorkspaceId) {
      return cookieWorkspaceId;
    }
  }

  // Try to get from server-side cookies
  try {
    const cookieStore = cookies();
    const workspaceCookie = cookieStore.get("workspace_id");
    if (workspaceCookie?.value) {
      return workspaceCookie.value;
    }
  } catch (error) {
    // Cookies may not be available in all contexts
    console.warn("Failed to read workspace cookie:", error);
  }

  // No workspace found - user must authenticate
  return null;
}

/**
 * Get workspace ID from request (async version for API routes with JWT support)
 * Priority order:
 * 1. Request headers (X-Workspace-ID)
 * 2. JWT token (Authorization header)
 * 3. Cookies (workspace_id)
 * 4. Query parameters (?workspaceId=...)
 *
 * Returns null if no workspace found - requires authentication
 */
export async function getWorkspaceIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  // Try request headers first
  const headerWorkspaceId = request.headers.get("X-Workspace-ID");
  if (headerWorkspaceId) {
    return headerWorkspaceId;
  }

  // Try to extract from JWT token in Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const workspaceId = await getWorkspaceFromToken(token);
    if (workspaceId) {
      return workspaceId;
    }
  }

  // Try query parameters
  const url = new URL(request.url);
  const queryWorkspaceId = url.searchParams.get("workspaceId");
  if (queryWorkspaceId) {
    return queryWorkspaceId;
  }

  // Try cookies
  const cookieWorkspaceId = request.cookies.get("workspace_id")?.value;
  if (cookieWorkspaceId) {
    return cookieWorkspaceId;
  }

  // No workspace found - user must authenticate
  return null;
}

/**
 * Set workspace ID in cookies
 * This should be called after user authentication
 */
export function setWorkspaceId(workspaceId: string): void {
  try {
    const cookieStore = cookies();
    cookieStore.set("workspace_id", workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (error) {
    console.error("Failed to set workspace cookie:", error);
  }
}

/**
 * Validate workspace ID format
 */
export function isValidWorkspaceId(workspaceId: string): boolean {
  // Workspace IDs should be alphanumeric with hyphens
  return (
    /^[a-zA-Z0-9-_]+$/.test(workspaceId) &&
    workspaceId.length > 0 &&
    workspaceId.length <= 50
  );
}

/**
 * Get workspace context from JWT token
 * Extracts workspace ID from authenticated JWT token payload
 */
export async function getWorkspaceFromToken(
  token: string
): Promise<string | null> {
  try {
    // Get JWT secret from environment
    const JWT_SECRET =
      process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

    if (!JWT_SECRET) {
      console.warn(
        "JWT_SECRET not configured, cannot extract workspace from token"
      );
      return null;
    }

    // Verify and decode the JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "ashley-ai",
      audience: "ashley-ai-users",
    });

    // Extract workspace ID from token payload
    const workspaceId = payload.workspaceId as string | undefined;

    if (!workspaceId) {
      console.warn("Token does not contain workspaceId field");
      return null;
    }

    // Validate workspace ID format
    if (!isValidWorkspaceId(workspaceId)) {
      console.warn("Invalid workspace ID format in token:", workspaceId);
      return null;
    }

    return workspaceId;
  } catch (error) {
    // Token is invalid, expired, or malformed
    if (error instanceof Error) {
      console.warn("Failed to extract workspace from token:", error.message);
    } else {
      console.warn("Failed to extract workspace from token:", error);
    }
    return null;
  }
}

/**
 * Workspace context type for use in API routes and components
 */
export interface WorkspaceContext {
  workspaceId: string;
  isDefault: boolean;
}

/**
 * Get full workspace context with metadata
 * Returns null if no workspace found
 */
export async function getWorkspaceContext(
  request?: NextRequest
): Promise<WorkspaceContext | null> {
  const workspaceId = await getWorkspaceId(request);
  if (!workspaceId) {
    return null;
  }
  return {
    workspaceId,
    isDefault: false, // No default workspace in production
  };
}
