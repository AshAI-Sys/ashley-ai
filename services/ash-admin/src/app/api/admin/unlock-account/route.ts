/**
 * Admin Endpoint: Unlock Account
 *
 * POST /api/admin/unlock-account
 * Body: { email: string, adminPassword: string }
 *
 * Emergency endpoint to unlock rate-limited accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { unlockAccount, isAccountLocked } from '@/lib/account-lockout';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Emergency admin password (should match ADMIN_UNLOCK_PASSWORD env var)
const ADMIN_PASSWORD = process.env.ADMIN_UNLOCK_PASSWORD || 'AshleyAI2025Emergency!';

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
      console.warn(`❌ Invalid admin password attempt for unlocking: ${email}`);
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

    console.log(`✅ Account unlocked via admin API: ${email}`);
    console.log(`   Before: locked=${statusBefore.isLocked}, attempts=${statusBefore.failedAttempts}`);
    console.log(`   After:  locked=${statusAfter.isLocked}, attempts=${statusAfter.failedAttempts}`);

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
  } catch (error: any) {
    console.error('❌ Error unlocking account:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlock account',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check lockout status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const adminPassword = searchParams.get('adminPassword');

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
  } catch (error: any) {
    console.error('❌ Error checking account lockout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check lockout status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
