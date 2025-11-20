/**
 * Authentication Endpoint: Login
 *
 * POST /api/auth/login
 * Body: { email: string, password: string }
 *
 * Security Features:
 * - Rate limiting (10 attempts per 15 minutes per IP)
 * - Account lockout integration (5 failed attempts = 30min lockout)
 * - Progressive delays (1s, 2s, 4s, 8s, 16s after each failed attempt)
 * - Generic error messages (prevents user enumeration)
 * - Secure logging without PII
 * - HTTP-only cookies for tokens
 * - bcrypt password verification
 *
 * SECURITY: Integrated with account-lockout system and rate-limiter
 */

import { NextRequest, NextResponse } from "next/server";
import { generateTokenPair } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { authLogger } from "@/lib/logger";
import {
  recordFailedLogin,
  isAccountLocked,
  clearFailedAttempts,
} from "@/lib/account-lockout";
import { RateLimiter, RATE_LIMIT_PRESETS, getUserIdentifier } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

// Prevent static generation
export const dynamic = "force-dynamic";

// Create rate limiter for login endpoint
// 10 attempts per 15 minutes with progressive delays
const loginRateLimiter = new RateLimiter(RATE_LIMIT_PRESETS.LOGIN);

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    position: string | null;
    department: string | null;
    workspaceId: string;
  };
  error?: string;
  code?: string;
  retry_after_seconds?: number;
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token pair
 */
export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  const startTime = Date.now();

  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      authLogger.warn('Login attempt with missing credentials', {
        hasEmail: !!email,
        hasPassword: !!password,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
          code: "MISSING_CREDENTIALS",
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // SECURITY: Check rate limit by IP address
    const rateLimitKey = getUserIdentifier(request);
    const rateLimitResult = await loginRateLimiter.check(rateLimitKey, request);

    if (!rateLimitResult.allowed && rateLimitResult.response) {
      authLogger.warn('Login rate limit exceeded', {
        email: normalizedEmail,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        retryAfter: rateLimitResult.retryAfter,
      });

      return rateLimitResult.response as NextResponse<LoginResponse>;
    }

    // SECURITY: Check if account is locked due to too many failed attempts
    const lockStatus = await isAccountLocked(normalizedEmail);

    if (lockStatus.isLocked) {
      const retryAfterSeconds = lockStatus.lockoutExpiresAt
        ? Math.ceil((new Date(lockStatus.lockoutExpiresAt).getTime() - Date.now()) / 1000)
        : 1800; // Default 30 minutes

      authLogger.warn('Login attempt on locked account', {
        email: normalizedEmail,
        failedAttempts: lockStatus.failedAttempts,
        lockoutExpiresAt: lockStatus.lockoutExpiresAt,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: "Account temporarily locked due to too many failed login attempts. Please try again later or contact support.",
          code: "ACCOUNT_LOCKED",
          retry_after_seconds: retryAfterSeconds,
        },
        {
          status: 423, // Locked
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
          },
        }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        is_active: true,
      },
      include: {
        workspace: true,
      },
    });

    // SECURITY: Use generic error message to prevent user enumeration
    const GENERIC_ERROR = "Invalid email or password";

    if (!user || !user.password_hash) {
      // Record failed attempt even if user doesn't exist (prevents enumeration timing attacks)
      await recordFailedLogin(normalizedEmail);

      authLogger.warn('Login failed - user not found or no password', {
        email: normalizedEmail,
        userExists: !!user,
        hasPassword: !!user?.password_hash,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        duration: Date.now() - startTime,
      });

      // Add artificial delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json(
        {
          success: false,
          error: GENERIC_ERROR,
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // Verify password using bcrypt (constant-time comparison)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Record failed login attempt
      await recordFailedLogin(normalizedEmail);

      authLogger.warn('Login failed - invalid password', {
        email: normalizedEmail,
        userId: user.id,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          success: false,
          error: GENERIC_ERROR,
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // ✅ SUCCESS: Valid credentials

    // Reset failed login attempts
    await clearFailedAttempts(normalizedEmail);

    // Generate JWT token pair (access + refresh tokens)
    const tokenPair = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as any,
      workspaceId: user.workspace_id,
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    authLogger.info('User logged in successfully', {
      userId: user.id,
      workspaceId: user.workspace_id,
      role: user.role,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      duration: Date.now() - startTime,
    });

    // Prepare response with user data
    const response = NextResponse.json(
      {
        success: true,
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        expires_in: tokenPair.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          position: user.position || null,
          department: user.department || null,
          workspaceId: user.workspace_id,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookies for tokens
    // Access token (15 minutes)
    response.cookies.set("auth_token", tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenPair.expiresIn,
      path: "/",
    });

    // Refresh token (7 days)
    response.cookies.set("refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    authLogger.error(
      'Login error',
      error instanceof Error ? error : undefined,
      {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        duration: Date.now() - startTime,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login. Please try again later.",
        code: "INTERNAL_ERROR",
        // Only expose detailed error in development
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}
