import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '../../../../../lib/auth-middleware'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

const Setup2FASchema = z.object({
  action: z.enum(['generate', 'verify', 'disable']),
  token: z.string().optional() // For verification
})

// POST - Setup/Manage 2FA
export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json()
    const { action, token } = Setup2FASchema.parse(body)

    switch (action) {
      case 'generate':
        return await generate2FASetup(user)

      case 'verify':
        if (!token) {
          return NextResponse.json(
            { success: false, error: 'Token is required for verification' },
            { status: 400 }
          )
        }
        return await verify2FASetup(user, token)

      case 'disable':
        return await disable2FA(user)

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

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

    console.error('Error in 2FA setup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process 2FA request' },
      { status: 500 }
    )
  }
})

// Generate 2FA setup (secret and QR code)
async function generate2FASetup(user: any) {
  try {
    // Generate a secret for the user
    const secret = authenticator.generateSecret()

    // Create the service name and account name for the QR code
    const serviceName = 'Ashley AI Manufacturing'
    const accountName = user.email || `${user.first_name} ${user.last_name}`

    // Generate the otpauth URL
    const otpauthUrl = authenticator.keyuri(accountName, serviceName, secret)

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    // In a real implementation, save the secret to the database temporarily
    // For demo purposes, we'll return it directly
    console.log(`2FA Setup for ${user.email}:`, { secret, otpauthUrl })

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCode: qrCodeDataUrl,
        manualEntryCode: secret,
        instructions: [
          '1. Install an authenticator app (Google Authenticator, Authy, etc.)',
          '2. Scan the QR code or manually enter the code shown below',
          '3. Enter the 6-digit code from your app to complete setup'
        ]
      },
      message: '2FA setup initiated. Complete verification to enable.'
    })

  } catch (error) {
    console.error('Error generating 2FA setup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate 2FA setup' },
      { status: 500 }
    )
  }
}

// Verify 2FA setup token
async function verify2FASetup(user: any, token: string) {
  try {
    // In a real implementation, get the secret from the database
    // For demo purposes, we'll simulate verification
    const demoSecret = 'JBSWY3DPEHPK3PXP' // This would come from temp storage

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: demoSecret
    })

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      )
    }

    // In real implementation, save the secret to the user's record and enable 2FA
    console.log(`2FA enabled for user: ${user.email}`)

    // Generate backup codes
    const backupCodes = generateBackupCodes()

    // Log audit event
    await logAuditEvent(user.id, 'USER_2FA_ENABLED', 'User enabled two-factor authentication', {
      method: 'totp',
      backup_codes_generated: backupCodes.length
    })

    return NextResponse.json({
      success: true,
      data: {
        backupCodes,
        message: '2FA has been successfully enabled for your account'
      },
      message: '2FA enabled successfully'
    })

  } catch (error) {
    console.error('Error verifying 2FA setup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify 2FA setup' },
      { status: 500 }
    )
  }
}

// Disable 2FA
async function disable2FA(user: any) {
  try {
    // In real implementation, remove 2FA secret and backup codes from user record
    console.log(`2FA disabled for user: ${user.email}`)

    // Log audit event
    await logAuditEvent(user.id, 'USER_2FA_DISABLED', 'User disabled two-factor authentication', {
      disabled_by: 'user',
      reason: 'user_request'
    })

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled for your account'
    })

  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}

// Generate backup codes
function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric backup codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}

// Log audit event
async function logAuditEvent(
  userId: string,
  action: string,
  description: string,
  metadata?: any
) {
  try {
    console.log('2FA AUDIT EVENT:', {
      user_id: userId,
      action,
      description,
      metadata,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error logging 2FA audit event:', error)
  }
}