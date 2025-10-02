import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '../../../../../lib/auth-middleware'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { encrypt, decrypt, hash } from '../../../../../lib/crypto'
import { prisma } from '../../../../../lib/db'
import { logAuthEvent } from '../../../../../lib/audit-logger'

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

    // Encrypt and temporarily store the secret in the database
    // It will only be permanently saved after successful verification
    const encryptedSecret = encrypt(secret)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        two_factor_secret: encryptedSecret,
        two_factor_enabled: false,  // Not enabled until verified
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        manualEntryCode: secret,  // Shown only during initial setup
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
    // Get the user's stored 2FA secret from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { two_factor_secret: true }
    })

    if (!dbUser?.two_factor_secret) {
      return NextResponse.json(
        { success: false, error: 'No 2FA setup found. Please generate a new QR code first.' },
        { status: 400 }
      )
    }

    // Decrypt the secret
    const secret = decrypt(dbUser.two_factor_secret)

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret
    })

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      )
    }

    // Generate and hash backup codes
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = backupCodes.map(code => hash(code))

    // Enable 2FA and save backup codes (hashed)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        two_factor_enabled: true,
        two_factor_backup_codes: JSON.stringify(hashedBackupCodes)
      }
    })

    // Log audit event
    await logAuthEvent('2FA_ENABLED', user.workspaceId, user.id, undefined, {
      method: 'totp',
      backup_codes_generated: backupCodes.length
    })

    return NextResponse.json({
      success: true,
      data: {
        backupCodes,  // Return plain codes to user (only time they'll see them)
        message: '2FA has been successfully enabled for your account. Save your backup codes in a secure location.'
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
    // Remove 2FA secret and backup codes from user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null
      }
    })

    // Log audit event
    await logAuthEvent('2FA_DISABLED', user.workspaceId, user.id, undefined, {
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

