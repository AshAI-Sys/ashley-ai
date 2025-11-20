/**
 * Admin Endpoint: Unlock Account
 *
 * POST /api/admin/unlock-account
 * Body: { email: string, adminPassword: string }
 *
 * Emergency endpoint to unlock rate-limited accounts
 * SECURITY: Requires ADMIN_UNLOCK_PASSWORD environment variable
 */

import { NextRequest, NextResponse } from 'next/server';
import { unlockAccount, isAccountLocked } from '@/lib/account-lockout';
import { authLogger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Emergency admin password (MUST be set in environment - no fallback for security)
const ADMIN_PASSWORD = process.env.ADMIN_UNLOCK_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error(
    'ADMIN_UNLOCK_PASSWORD environment variable is required for admin unlock functionality. ' +
    'This is a security requirement - no default password is permitted.'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, adminPassword } = body;

    // Validate inputs
    if (!email || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and admin password are required',
        },
        { status: 400 }
      );
    }

    // Verify admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      // Log security event without exposing email in production
      authLogger.warn('Invalid admin password attempt for account unlock', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin password',
        },
        { status: 403 }
      );
    }

    // Check current lockout status
    const statusBefore = await isAccountLocked(email);

    // Unlock the account
    await unlockAccount(email, 'admin-api');

    // Verify unlock succeeded
    const statusAfter = await isAccountLocked(email);

    // Log admin action securely (no PII in production logs)
    authLogger.info('Account unlocked via admin API', {
      timestamp: new Date().toISOString(),
      wasLocked: statusBefore.isLocked,
      previousAttempts: statusBefore.failedAttempts,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account unlocked successfully',
        email,
        statusBefore: {
          isLocked: statusBefore.isLocked,
          failedAttempts: statusBefore.failedAttempts,
          lockoutExpiresAt: statusBefore.lockoutExpiresAt,
        },
        statusAfter: {
          isLocked: statusAfter.isLocked,
          failedAttempts: statusAfter.failedAttempts,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log error securely without exposing details to client
    authLogger.error(
      'Error unlocking account',
      error instanceof Error ? error : undefined,
      { timestamp: new Date().toISOString() }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlock account. Please contact system administrator.',
        // Only include debug info in development
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check lockout status
// SECURITY: Admin password MUST be sent via X-Admin-Password header, NOT URL parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Get admin password from header (NEVER from URL for security)
    const adminPassword = request.headers.get('X-Admin-Password');

    if (!email || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and admin password (via X-Admin-Password header) are required',
        },
        { status: 400 }
      );
    }

    // Verify admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      authLogger.warn('Invalid admin password attempt for lockout status check', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin password',
        },
        { status: 403 }
      );
    }

    // Get lockout status
    const status = await isAccountLocked(email);

    return NextResponse.json(
      {
        success: true,
        email,
        status,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    authLogger.error(
      'Error checking account lockout status',
      error instanceof Error ? error : undefined,
      { timestamp: new Date().toISOString() }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check lockout status. Please contact system administrator.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}
