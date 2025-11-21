import { NextRequest, NextResponse } from "next/server";
import { verifyToken} from "./jwt";
import {
  Permission,
  Role,
  getAllPermissionsForRole,
  hasPermission,
  hasAnyPermission,
} from "./rbac";
import { createRateLimiter, RateLimitPresets } from "./security/rate-limit";

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

    // Proper JWT validation with blacklist and revocation checking
    const payload = await verifyToken(token);
    if (!payload) {
      console.error("[AUTH] JWT verification failed - token invalid, expired, blacklisted, or revoked");
      return null;
    }
    console.log("[AUTH] JWT verified successfully for user:", payload.userId);

    // Validate session is active and not revoked (optional - JWT is primary auth)
    // COMMENTED OUT - session-manager was deleted as dead code
    // try {
    //   const isValidSession = await validateSession(token);
    //   if (isValidSession) {
    //     console.log("[AUTH] Session validated successfully");
    //   } else {
    //     console.warn("[AUTH] Session validation failed - continuing with JWT-only auth");
    //     // Allow JWT-only authentication as fallback
    //   }
    // } catch (sessionError) {
    //   console.error("[AUTH] Session validation error:", sessionError);
    //   console.warn("[AUTH] Continuing with JWT-only authentication as fallback");
    //   // Continue with JWT validation only
    // }

    // Using JWT-only authentication (no session validation)

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

// Rate limiters for different HTTP methods
const readRateLimiter = createRateLimiter({
  ...RateLimitPresets.GENEROUS, // 100 req/min for GET requests
  keyGenerator: (req) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.substring(7);
    // Use IP for unauthenticated, user ID for authenticated
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
               req.headers.get("x-real-ip") || "unknown";
    return token ? `user:${token.substring(0, 10)}:${ip}` : `ip:${ip}`;
  },
});

const writeRateLimiter = createRateLimiter({
  ...RateLimitPresets.MODERATE, // 30 req/min for POST/PUT/DELETE
  keyGenerator: (req) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.substring(7);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
               req.headers.get("x-real-ip") || "unknown";
    return token ? `user:${token.substring(0, 10)}:${ip}` : `ip:${ip}`;
  },
});

export function requireAuth<T = any>(
  handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    // Apply rate limiting based on HTTP method
    const method = request.method.toUpperCase();
    const isReadOperation = method === "GET" || method === "HEAD";
    const rateLimiter = isReadOperation ? readRateLimiter : writeRateLimiter;

    // Check rate limit
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded - return 429
    }

    // Authenticate user
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Valid authentication token required" },
        { status: 401 }
      );
    }

    return handler(request, user, context);
  };
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
