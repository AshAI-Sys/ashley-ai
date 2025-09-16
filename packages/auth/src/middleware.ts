// ASH AI Authentication Middleware
// Middleware for protecting routes and API endpoints

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole, Permission } from "./types";
import { hasPermission, verifyAccessToken } from "./utils";

// Route protection configuration
export interface RouteConfig {
  path: string;
  roles?: UserRole[];
  permissions?: Permission[];
  requireAuth?: boolean;
}

// Default protected routes
export const PROTECTED_ROUTES: RouteConfig[] = [
  // Admin routes
  {
    path: "/admin",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    requireAuth: true,
  },
  
  // Orders and production
  {
    path: "/orders",
    permissions: ["orders.view"],
    requireAuth: true,
  },
  {
    path: "/orders/create",
    permissions: ["orders.create"],
    requireAuth: true,
  },
  {
    path: "/orders/[id]/edit",
    permissions: ["orders.edit"],
    requireAuth: true,
  },
  
  // Design and assets
  {
    path: "/designs",
    permissions: ["design.view"],
    requireAuth: true,
  },
  {
    path: "/designs/upload",
    permissions: ["design.upload"],
    requireAuth: true,
  },
  
  // Production
  {
    path: "/production",
    permissions: ["production.cutting.issue", "production.print.run", "production.sew.run"],
    requireAuth: true,
  },
  
  // Quality Control
  {
    path: "/qc",
    permissions: ["qc.create", "qc.sample"],
    requireAuth: true,
  },
  
  // Settings
  {
    path: "/settings",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    requireAuth: true,
  },
];

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup", 
  "/auth/error",
  "/auth/verify",
  "/portal/approvals",
  "/api/auth",
  "/api/health",
];

// API route protection
export const PROTECTED_API_ROUTES: RouteConfig[] = [
  // Orders API
  {
    path: "/api/v1/orders",
    permissions: ["orders.view"],
    requireAuth: true,
  },
  {
    path: "/api/v1/orders/create",
    permissions: ["orders.create"],
    requireAuth: true,
  },
  
  // Clients API
  {
    path: "/api/v1/clients",
    permissions: ["clients.view"],
    requireAuth: true,
  },
  
  // Admin API
  {
    path: "/api/v1/admin",
    roles: [UserRole.ADMIN],
    requireAuth: true,
  },
];

// Middleware function for Next.js
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Handle API routes
  if (pathname.startsWith("/api/")) {
    return handleApiRoute(request);
  }
  
  // Handle web routes
  return handleWebRoute(request);
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route.includes("[")) {
      // Handle dynamic routes
      const pattern = route.replace(/\[.*?\]/g, "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname.startsWith(route);
  });
}

// Handle API route protection
async function handleApiRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Find matching route configuration
  const routeConfig = PROTECTED_API_ROUTES.find(config => 
    pathname.startsWith(config.path)
  );
  
  if (!routeConfig) {
    return NextResponse.next();
  }
  
  // Check for API token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse(
      JSON.stringify({ error: "Missing or invalid authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const userRole = payload.role as UserRole;
  
  // Check role requirements
  if (routeConfig.roles && !routeConfig.roles.includes(userRole)) {
    return new NextResponse(
      JSON.stringify({ error: "Insufficient permissions" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Check permission requirements
  if (routeConfig.permissions) {
    const hasRequiredPermission = routeConfig.permissions.some(permission =>
      hasPermission(userRole, permission)
    );
    
    if (!hasRequiredPermission) {
      return new NextResponse(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  
  // Add user context to request headers
  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.sub as string);
  response.headers.set("x-user-role", userRole);
  response.headers.set("x-workspace-id", payload.workspace_id as string);
  
  return response;
}

// Handle web route protection
async function handleWebRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token
  const token = await getToken({ req: request });
  
  // Find matching route configuration
  const routeConfig = PROTECTED_ROUTES.find(config => 
    pathname.startsWith(config.path)
  );
  
  if (!routeConfig) {
    return NextResponse.next();
  }
  
  // Require authentication
  if (routeConfig.requireAuth && !token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  if (!token) {
    return NextResponse.next();
  }
  
  const userRole = token.role as UserRole;
  
  // Check role requirements
  if (routeConfig.roles && !routeConfig.roles.includes(userRole)) {
    return NextResponse.redirect(new URL("/auth/error?error=AccessDenied", request.url));
  }
  
  // Check permission requirements
  if (routeConfig.permissions) {
    const hasRequiredPermission = routeConfig.permissions.some(permission =>
      hasPermission(userRole, permission)
    );
    
    if (!hasRequiredPermission) {
      return NextResponse.redirect(new URL("/auth/error?error=AccessDenied", request.url));
    }
  }
  
  return NextResponse.next();
}

// Utility function to check permissions in API handlers
export function requirePermissions(permissions: Permission[]) {
  return (userRole: UserRole): boolean => {
    return permissions.some(permission => hasPermission(userRole, permission));
  };
}

// Utility function to check roles in API handlers
export function requireRoles(roles: UserRole[]) {
  return (userRole: UserRole): boolean => {
    return roles.includes(userRole);
  };
}

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (request: NextRequest): NextResponse | null => {
    const identifier = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    const userRequests = requestCounts.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize counter
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Allow request
    }
    
    if (userRequests.count >= maxRequests) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        { 
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(userRequests.resetTime / 1000).toString(),
          }
        }
      );
    }
    
    // Increment counter
    userRequests.count++;
    requestCounts.set(identifier, userRequests);
    
    return null; // Allow request
  };
}