"use strict";
// ASH AI Authentication Middleware
// Middleware for protecting routes and API endpoints
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTECTED_API_ROUTES = exports.PUBLIC_ROUTES = exports.PROTECTED_ROUTES = void 0;
exports.authMiddleware = authMiddleware;
exports.requirePermissions = requirePermissions;
exports.requireRoles = requireRoles;
exports.rateLimit = rateLimit;
const server_1 = require("next/server");
const jwt_1 = require("next-auth/jwt");
const types_1 = require("./types");
const utils_1 = require("./utils");
// Default protected routes
exports.PROTECTED_ROUTES = [
    // Admin routes
    {
        path: "/admin",
        roles: [types_1.UserRole.ADMIN, types_1.UserRole.MANAGER],
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
        permissions: [
            "production.cutting.issue",
            "production.print.run",
            "production.sew.run",
        ],
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
        roles: [types_1.UserRole.ADMIN, types_1.UserRole.MANAGER],
        requireAuth: true,
    },
];
// Public routes that don't require authentication
exports.PUBLIC_ROUTES = [
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
exports.PROTECTED_API_ROUTES = [
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
        roles: [types_1.UserRole.ADMIN],
        requireAuth: true,
    },
];
// Middleware function for Next.js
async function authMiddleware(request) {
    const { pathname } = request.nextUrl;
    // Skip middleware for public routes
    if (isPublicRoute(pathname)) {
        return server_1.NextResponse.next();
    }
    // Handle API routes
    if (pathname.startsWith("/api/")) {
        return handleApiRoute(request);
    }
    // Handle web routes
    return handleWebRoute(request);
}
// Check if route is public
function isPublicRoute(pathname) {
    return exports.PUBLIC_ROUTES.some(route => {
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
async function handleApiRoute(request) {
    const { pathname } = request.nextUrl;
    // Find matching route configuration
    const routeConfig = exports.PROTECTED_API_ROUTES.find(config => pathname.startsWith(config.path));
    if (!routeConfig) {
        return server_1.NextResponse.next();
    }
    // Check for API token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return new server_1.NextResponse(JSON.stringify({ error: "Missing or invalid authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const token = authHeader.substring(7);
    const payload = (0, utils_1.verifyAccessToken)(token);
    if (!payload) {
        return new server_1.NextResponse(JSON.stringify({ error: "Invalid or expired token" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userRole = payload.role;
    // Check role requirements
    if (routeConfig.roles && !routeConfig.roles.includes(userRole)) {
        return new server_1.NextResponse(JSON.stringify({ error: "Insufficient permissions" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
    // Check permission requirements
    if (routeConfig.permissions) {
        const hasRequiredPermission = routeConfig.permissions.some(permission => (0, utils_1.hasPermission)(userRole, permission));
        if (!hasRequiredPermission) {
            return new server_1.NextResponse(JSON.stringify({ error: "Insufficient permissions" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
    }
    // Add user context to request headers
    const response = server_1.NextResponse.next();
    response.headers.set("x-user-id", payload.sub);
    response.headers.set("x-user-role", userRole);
    response.headers.set("x-workspace-id", payload.workspace_id);
    return response;
}
// Handle web route protection
async function handleWebRoute(request) {
    const { pathname } = request.nextUrl;
    // Get session token
    const token = await (0, jwt_1.getToken)({ req: request });
    // Find matching route configuration
    const routeConfig = exports.PROTECTED_ROUTES.find(config => pathname.startsWith(config.path));
    if (!routeConfig) {
        return server_1.NextResponse.next();
    }
    // Require authentication
    if (routeConfig.requireAuth && !token) {
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return server_1.NextResponse.redirect(signInUrl);
    }
    if (!token) {
        return server_1.NextResponse.next();
    }
    const userRole = token.role;
    // Check role requirements
    if (routeConfig.roles && !routeConfig.roles.includes(userRole)) {
        return server_1.NextResponse.redirect(new URL("/auth/error?error=AccessDenied", request.url));
    }
    // Check permission requirements
    if (routeConfig.permissions) {
        const hasRequiredPermission = routeConfig.permissions.some(permission => (0, utils_1.hasPermission)(userRole, permission));
        if (!hasRequiredPermission) {
            return server_1.NextResponse.redirect(new URL("/auth/error?error=AccessDenied", request.url));
        }
    }
    return server_1.NextResponse.next();
}
// Utility function to check permissions in API handlers
function requirePermissions(permissions) {
    return (userRole) => {
        return permissions.some(permission => (0, utils_1.hasPermission)(userRole, permission));
    };
}
// Utility function to check roles in API handlers
function requireRoles(roles) {
    return (userRole) => {
        return roles.includes(userRole);
    };
}
// Rate limiting middleware (basic implementation)
const requestCounts = new Map();
function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000 // 15 minutes
) {
    return (request) => {
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
            return new server_1.NextResponse(JSON.stringify({ error: "Too many requests" }), {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": maxRequests.toString(),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": Math.ceil(userRequests.resetTime / 1000).toString(),
                },
            });
        }
        // Increment counter
        userRequests.count++;
        requestCounts.set(identifier, userRequests);
        return null; // Allow request
    };
}
