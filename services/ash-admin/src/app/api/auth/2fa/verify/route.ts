import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify2FA } from "@/lib/2fa-server";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from "@/lib/error-sanitization";

export const dynamic = 'force-dynamic';


const prisma = db;

// POST /api/auth/2fa/verify - Verify 2FA token and enable 2FA
export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const { user_id, token, enable_2fa = false } = body;

    if (!user_id || !token) {
      return NextResponse.json(
        { error: "user_id and token are required" },
        { status: 400 }
      );
    }

    // Get user with 2FA settings
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.two_factor_secret) {
      return NextResponse.json(
        {
          error: "2FA not setup for this user. Call /api/auth/2fa/setup first",
        },
        { status: 400 }
      );
    }

    // Parse encrypted secret
    const secretData = JSON.parse(user.two_factor_secret);
    const backupCodes = user.two_factor_backup_codes
      ? JSON.parse(user.two_factor_backup_codes)
      : [];

    // Verify token
    const result = await verify2FA(
      secretData.encrypted,
      secretData.iv,
      token,
      backupCodes
    );

    if (!result.valid) {
      
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 401 }
      );
    }

    // If backup code was used, remove it from the list
    if (result.usedBackupCode && result.backupCodeIndex !== undefined) {
      backupCodes.splice(result.backupCodeIndex, 1);
      await prisma.user.update({
        where: { id: user_id },
        data: {
          two_factor_backup_codes: JSON.stringify(backupCodes),
        },
      });
    }

    // If this is the first verification (enabling 2FA), enable it now
    if (enable_2fa && !user.two_factor_enabled) {
      await prisma.user.update({
        where: { id: user_id },
        data: {
          two_factor_enabled: true,
        },
      });
    }

    return NextResponse.json({
      valid: true,
      used_backup_code: result.usedBackupCode,
      remaining_backup_codes: backupCodes.length,
      message: result.usedBackupCode
        ? "Backup code verified. Please generate new backup codes."
        : "2FA code verified successfully",
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      path: request.url,
    });
  }
});
