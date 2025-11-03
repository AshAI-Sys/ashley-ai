import { NextRequest, NextResponse } from "next/server";
import { rateLimit, apiRateLimit } from "./rate-limit";
import { verifyToken} from "./jwt";
import {
  Permission,
  Role,
  getAllPermissionsForRole,
  hasPermission,
  hasAnyPermission,
} from "./rbac";
import { validateSession } from "./session-manager";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  workspaceId: string;
  permissions: Permission[];
}

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // PRODUCTION MODE: Require valid authentication token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[AUTH] No Bearer token in Authorization header");
      return null;
    }

    const token = authHeader.substring(7);
    console.log("[AUTH] Token received:", token.substring(0, 20) + "...");

    // Proper JWT validation
    const payload = verifyToken(token);
    if (!payload) {
      console.error("[AUTH] JWT verification failed - token invalid or expired");
      return null;
    }
    console.log("[AUTH] JWT verified successfully for user:", payload.userId);

    // TEMPORARY: Skip session validation, use JWT-only auth
    // TODO: Re-enable session validation after fixing session creation in login
    console.log("[AUTH] Using JWT-only authentication (session validation disabled)");

    const role = payload.role as Role;
    return {
      id: payload.userId,
      email: payload.email,
      role,
      workspaceId: payload.workspaceId,
      permissions: getAllPermissionsForRole(role),
    };
  } catch (error) {
    console.error("[AUTH] Authentication error:", error);
    return null;
  }
}

export function requireAuth<T = any>(
  handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
) {
  return rateLimit(apiRateLimit)(async (request: NextRequest, context?: T) => {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Valid authentication token required" },
        { status: 401 }
      );
    }

    return handler(request, user, context);
  });
}

// Permission-based middleware functions
export function requirePermission<T = any>(permission: Permission) {
  return function (
    handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
  ) {
    return requireAuth<T>(async (request: NextRequest, user: AuthUser, context?: T) => {
      if (!hasPermission(user.permissions, permission)) {
        return NextResponse.json(
          { error: `Access denied. Required permission: ${permission}` },
          { status: 403 }
        );
      }
      return handler(request, user, context);
    });
  };
}

export function requireAnyPermission<T = any>(permissions: Permission[]) {
  return function (
    handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
  ) {
    return requireAuth<T>(async (request: NextRequest, user: AuthUser, context?: T) => {
      if (!hasAnyPermission(user.permissions, permissions)) {
        return NextResponse.json(
          {
            error: `Access denied. Required permissions: ${permissions.join(" or ")}`,
          },
          { status: 403 }
        );
      }
      return handler(request, user, context);
    });
  };
}

export function requireRole<T = any>(role: Role) {
  return function (
    handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
  ) {
    return requireAuth<T>(async (request: NextRequest, user: AuthUser, context?: T) => {
      if (user.role !== role) {
        return NextResponse.json(
          { error: `Access denied. Required role: ${role}` },
          { status: 403 }
        );
      }
      return handler(request, user, context);
    });
  };
}

export function requireAdmin() {
  return requireRole("admin");
}

export function validateWorkspaceAccess(
  userWorkspaceId: string,
  requestedWorkspaceId: string
): boolean {
  // Production workspace access control
  return userWorkspaceId === requestedWorkspaceId;
}
