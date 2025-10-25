"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
const server_1 = require("next/server");
// Note: Cannot import audit-logger here as it uses Prisma which doesn't work in Edge Runtime
// Security events will be logged from API routes instead
const csp_nonce_1 = require("./lib/csp-nonce");
// Note: Redis (ioredis) cannot be used in Edge Runtime middleware
// Using in-memory stores for rate limiting and CSRF tokens
const rateLimitStore = new Map();
const csrfTokenStore = new Map();
// Security headers configuration with CSP enabled
function getSecurityHeaders(nonce) {
    return {
        "X-DNS-Prefetch-Control": "on",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy": (0, csp_nonce_1.createCSPHeader)(nonce),
    };
}
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3001",
    "http://localhost:3003",
];
// IP Whitelist for admin routes (optional)
const adminIPWhitelist = process.env.ADMIN_IP_WHITELIST?.split(",") || [];
// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = {
    "/api/auth/login": 5, // 5 login attempts per minute
    "/api/auth/register": 3, // 3 registration attempts per minute
    "/api/auth/2fa": 5, // 5 2FA attempts per minute
    default: 100, // 100 requests per minute for other routes
};
function getRateLimitKey(request) {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    return `${ip}:${request.nextUrl.pathname}`;
}
function getRateLimitForPath(pathname) {
    for (const [path, limit] of Object.entries(RATE_LIMIT_MAX_REQUESTS)) {
        if (path !== "default" && pathname.startsWith(path)) {
            return limit;
        }
    }
    return RATE_LIMIT_MAX_REQUESTS.default;
}
async function checkRateLimit(request) {
    const key = getRateLimitKey(request);
    const maxRequests = getRateLimitForPath(request.nextUrl.pathname);
    // In-memory rate limiting
    const now = Date.now();
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (record.count >= maxRequests) {
        return false;
    }
    record.count++;
    return true;
}
function checkIPWhitelist(request) {
    if (adminIPWhitelist.length === 0)
        return true; // No whitelist configured
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    return adminIPWhitelist.includes(ip);
}
function handleCORS(request, response) {
    const origin = request.headers.get("origin") || "";
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        response.headers.set("Access-Control-Allow-Origin", origin || "*");
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    }
    return response;
}
function generateCSRFToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
function getSessionId(request) {
    return (request.cookies.get("session")?.value ||
        request.cookies.get("next-auth.session-token")?.value ||
        request.ip ||
        "anonymous");
}
async function verifyCSRFToken(request) {
    const sessionId = getSessionId(request);
    const csrfToken = request.headers.get("x-csrf-token") ||
        request.cookies.get("csrf-token")?.value;
    if (!csrfToken) {
        return false;
    }
    // In-memory CSRF token verification
    const storedToken = csrfTokenStore.get(sessionId);
    if (!storedToken || csrfToken !== storedToken.token) {
        return false;
    }
    if (storedToken.expires < Date.now()) {
        csrfTokenStore.delete(sessionId);
        return false;
    }
    return true;
}
async function storeCSRFToken(sessionId, token) {
    // In-memory CSRF token storage
    csrfTokenStore.set(sessionId, {
        token,
        expires: Date.now() + 3600000, // 1 hour
    });
}
async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Generate nonce for CSP (only used in development)
    const nonce = process.env.NODE_ENV === "development" ? (0, csp_nonce_1.generateNonce)() : "";
    // Handle preflight requests
    if (request.method === "OPTIONS") {
        const response = new server_1.NextResponse(null, { status: 204 });
        return handleCORS(request, response);
    }
    // Check rate limiting
    if (!(await checkRateLimit(request))) {
        // Note: Security events logged from API routes, not middleware
        console.warn("[Middleware] Rate limit exceeded:", pathname);
        return new server_1.NextResponse(JSON.stringify({ error: "Too many requests. Please try again later." }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": "60",
            },
        });
    }
    // Check IP whitelist for admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (!checkIPWhitelist(request)) {
            // Note: Security events logged from API routes, not middleware
            console.warn("[Middleware] IP blocked:", pathname);
            return new server_1.NextResponse(JSON.stringify({ error: "Access denied from your IP address" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
    // ===== CSRF PROTECTION =====
    // Generate CSRF token for GET requests to pages (not API)
    if (request.method === "GET" && !pathname.startsWith("/api/")) {
        const sessionId = getSessionId(request);
        const token = generateCSRFToken();
        await storeCSRFToken(sessionId, token);
        const response = server_1.NextResponse.next();
        // Set CSRF token in cookie
        response.cookies.set("csrf-token", token, {
            httpOnly: false, // Allow JavaScript to read
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600, // 1 hour
        });
        // Set nonce in header for client-side access
        response.headers.set("X-Nonce", nonce);
        // Add security headers with nonce
        const headers = getSecurityHeaders(nonce);
        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        // Add maximum security headers
        const maxSecurityHeaders = (0, csp_nonce_1.getMaxSecurityHeaders)();
        Object.entries(maxSecurityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        return handleCORS(request, response);
    }
    // Verify CSRF token for state-changing requests
    const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
    const isAPI = pathname.startsWith("/api/");
    const isAuthEndpoint = pathname.includes("/auth/login") || pathname.includes("/auth/register");
    const isWebhook = pathname.includes("/webhooks/");
    // Skip CSRF for development or specific endpoints
    const skipCSRF = process.env.NODE_ENV === "development" || isAuthEndpoint || isWebhook;
    if (isStateChanging && isAPI && !skipCSRF) {
        if (!(await verifyCSRFToken(request))) {
            // Note: Security events logged from API routes, not middleware
            console.warn("[Middleware] CSRF violation:", pathname, request.method);
            return new server_1.NextResponse(JSON.stringify({
                error: "Invalid or missing CSRF token",
                code: "CSRF_VALIDATION_FAILED",
            }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
    // Continue with the request and add security headers
    const response = server_1.NextResponse.next();
    // Set nonce in header
    response.headers.set("X-Nonce", nonce);
    // Add security headers with nonce
    const headers = getSecurityHeaders(nonce);
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    // Add CORS headers
    return handleCORS(request, response);
}
// Clean up expired CSRF tokens periodically (every 5 minutes)
if (typeof window === "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of csrfTokenStore.entries()) {
            if (value.expires < now) {
                csrfTokenStore.delete(key);
            }
        }
        for (const [key, value] of rateLimitStore.entries()) {
            if (value.resetTime < now) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}
// Configure which routes to run middleware on
exports.config = {
    matcher: [
        /*
         * Match all request paths except static files and images
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
