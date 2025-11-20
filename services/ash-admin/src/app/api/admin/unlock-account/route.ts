/**
 * Admin Endpoint: Unlock Account
 *
 * POST /api/admin/unlock-account
 * Body: { email: string }
 *
 * Emergency endpoint to unlock rate-limited accounts
 * SECURITY: Requires admin:update permission via RBAC
 */

import { NextRequest, NextResponse } from 'next/server';
import { unlockAccount, isAccountLocked } from '@/lib/account-lockout';
import { authLogger } from '@/lib/logger';
import { requirePermission } from '@/lib/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/unlock-account
 * Unlock a locked user account
 * SECURITY: Requires admin:update permission
 */
export const POST = requirePermission("admin:update")(async (request: NextRequest, admin) => {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Prevent admins from unlocking their own account (use password reset instead)
    if (email === admin.email) {
      authLogger.warn('Admin attempted to unlock own account', {
        adminId: admin.id,
        adminEmail: admin.email,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Cannot unlock your own account. Use password reset instead.',
        },
        { status: 403 }
      );
    }

    // Check current lockout status
    const statusBefore = await isAccountLocked(email);

    // Unlock the account
    await unlockAccount(email, 'admin-rbac');

    // Verify unlock succeeded
    const statusAfter = await isAccountLocked(email);

    // Log admin action with full audit trail
    authLogger.info('Account unlocked via admin RBAC', {
      adminId: admin.id,
      adminEmail: admin.email,
      targetEmail: email,
      wasLocked: statusBefore.isLocked,
      previousAttempts: statusBefore.failedAttempts,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account unlocked successfully',
        email,
        unlockedBy: {
          id: admin.id,
          email: admin.email,
        },
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
      {
        adminId: admin.id,
        timestamp: new Date().toISOString()
      }
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
});

/**
 * GET /api/admin/unlock-account?email={email}
 * Check account lockout status
 * SECURITY: Requires admin:read permission
 */
export const GET = requirePermission("admin:read")(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Get lockout status
    const status = await isAccountLocked(email);

    // Log status check for audit trail
    authLogger.info('Account lockout status checked', {
      adminId: admin.id,
      adminEmail: admin.email,
      targetEmail: email,
      isLocked: status.isLocked,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        email,
        status,
        checkedBy: {
          id: admin.id,
          email: admin.email,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    authLogger.error(
      'Error checking account lockout status',
      error instanceof Error ? error : undefined,
      {
        adminId: admin.id,
        timestamp: new Date().toISOString()
      }
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
});
