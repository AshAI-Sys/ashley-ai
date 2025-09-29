import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticator } from 'otplib'

const Verify2FASchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  token: z.string().length(6, 'Token must be 6 digits'),
  remember_device: z.boolean().default(false)
})

// POST - Verify 2FA token during login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, token, remember_device } = Verify2FASchema.parse(body)

    // In a real implementation, get user's 2FA secret from database
    const user2FAData = await getUserTwoFactorData(user_id)

    if (!user2FAData || !user2FAData.is_2fa_enabled) {
      return NextResponse.json(
        { success: false, error: 'Two-factor authentication is not enabled for this user' },
        { status: 400 }
      )
    }

    // Verify the TOTP token
    const isValidTotp = authenticator.verify({
      token,
      secret: user2FAData.secret
    })

    // Check if it's a backup code if TOTP fails
    let isValidBackup = false
    let usedBackupCode = null

    if (!isValidTotp && user2FAData.backup_codes) {
      const backupIndex = user2FAData.backup_codes.indexOf(token.toUpperCase())
      if (backupIndex !== -1) {
        isValidBackup = true
        usedBackupCode = token.toUpperCase()
        // In real implementation, remove the used backup code
      }
    }

    if (!isValidTotp && !isValidBackup) {
      // Log failed 2FA attempt
      await logAuditEvent(user_id, 'USER_2FA_FAILED', 'Failed two-factor authentication attempt', {
        ip_address: getClientIP(request),
        user_agent: request.headers.get('user-agent'),
        attempt_type: 'totp_or_backup'
      })

      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Generate device token if "remember device" is selected
    let deviceToken = null
    if (remember_device) {
      deviceToken = generateDeviceToken()
      // In real implementation, save device token to database with expiration
    }

    // Log successful 2FA verification
    await logAuditEvent(user_id, 'USER_2FA_SUCCESS', 'Successfully verified two-factor authentication', {
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent'),
      method: isValidTotp ? 'totp' : 'backup_code',
      remember_device,
      ...(usedBackupCode && { backup_code_used: usedBackupCode })
    })

    // Generate final authentication token
    const authToken = generateAuthToken(user_id)

    return NextResponse.json({
      success: true,
      data: {
        auth_token: authToken,
        device_token: deviceToken,
        ...(usedBackupCode && {
          warning: 'You used a backup code. Consider generating new ones.',
          backup_codes_remaining: (user2FAData.backup_codes?.length || 0) - 1
        })
      },
      message: 'Two-factor authentication verified successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error verifying 2FA:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify two-factor authentication' },
      { status: 500 }
    )
  }
}

// Demo function to get user's 2FA data
async function getUserTwoFactorData(userId: string) {
  // In real implementation, this would query the database
  return {
    user_id: userId,
    is_2fa_enabled: true,
    secret: 'JBSWY3DPEHPK3PXP', // Demo secret
    backup_codes: [
      'ABC12345', 'DEF67890', 'GHI11111', 'JKL22222', 'MNO33333',
      'PQR44444', 'STU55555', 'VWX66666', 'YZA77777', 'BCD88888'
    ],
    created_at: new Date().toISOString(),
    last_used_at: null
  }
}

// Generate device token for "remember device" feature
function generateDeviceToken(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Generate final authentication token
function generateAuthToken(userId: string): string {
  // In real implementation, this would be a proper JWT
  return `auth_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         'unknown'
}

// Log audit event
async function logAuditEvent(
  userId: string,
  action: string,
  description: string,
  metadata?: any
) {
  try {
    console.log('2FA VERIFICATION AUDIT:', {
      user_id: userId,
      action,
      description,
      metadata,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error logging 2FA verification audit:', error)
  }
}