import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logSecurityEvent, logAPIRequest } from './lib/audit-logger'

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers configuration
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'self';",
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'http://localhost:3003',
]

// IP Whitelist for admin routes (optional)
const adminIPWhitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || []

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = {
  '/api/auth/login': 5,      // 5 login attempts per minute
  '/api/auth/register': 3,   // 3 registration attempts per minute
  '/api/auth/2fa': 5,        // 5 2FA attempts per minute
  'default': 100,            // 100 requests per minute for other routes
}

function getRateLimitKey(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  return `${ip}:${request.nextUrl.pathname}`
}

function getRateLimitForPath(pathname: string): number {
  for (const [path, limit] of Object.entries(RATE_LIMIT_MAX_REQUESTS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return limit
    }
  }
  return RATE_LIMIT_MAX_REQUESTS.default
}

function checkRateLimit(request: NextRequest): boolean {
  const key = getRateLimitKey(request)
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Determine rate limit for this path
  const maxRequests = getRateLimitForPath(request.nextUrl.pathname)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

function checkIPWhitelist(request: NextRequest): boolean {
  if (adminIPWhitelist.length === 0) return true // No whitelist configured
  
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  return adminIPWhitelist.includes(ip)
}

function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin') || ''
  
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    return handleCORS(request, response)
  }

  // Check rate limiting
  if (!checkRateLimit(request)) {
    // Log rate limit event
    logSecurityEvent('RATE_LIMIT_EXCEEDED', request, {
      path: pathname,
      limit: getRateLimitForPath(pathname)
    }).catch(err => console.error('Failed to log rate limit event:', err))

    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        }
      }
    )
  }

  // Check IP whitelist for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!checkIPWhitelist(request)) {
      // Log IP block event
      logSecurityEvent('IP_BLOCKED', request, {
        path: pathname,
        reason: 'IP not in whitelist'
      }).catch(err => console.error('Failed to log IP block event:', err))

      return new NextResponse(
        JSON.stringify({ error: 'Access denied from your IP address' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  // Continue with the request and add security headers
  const response = NextResponse.next()
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CORS headers
  return handleCORS(request, response)
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
