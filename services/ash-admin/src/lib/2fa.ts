import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// Encryption for 2FA secrets (AES-256)
const ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ashley-ai-encryption-key-2025-production-32bytes' // Must be 32 bytes

/**
 * Encrypt a secret before storing in database
 */
export function encryptSecret(secret: string): { encrypted: string; iv: string } {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return {
    encrypted,
    iv: iv.toString('hex'),
  }
}

/**
 * Decrypt a secret from database
 */
export function decryptSecret(encrypted: string, iv: string): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    Buffer.from(iv, 'hex')
  )
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Generate a new 2FA secret for a user
 */
export function generate2FASecret(userEmail: string, appName: string = 'Ashley AI') {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    length: 32,
  })

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  }
}

/**
 * Generate QR code as data URL for displaying to user
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl)
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Verify a TOTP token
 */
export function verifyToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow 2 time steps before/after for clock drift
  })
}

/**
 * Generate backup codes (8 codes, 8 characters each)
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  for (let i = 0; i < count; i++) {
    let code = ''
    for (let j = 0; j < 8; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    // Format as XXXX-XXXX for readability
    codes.push(code.slice(0, 4) + '-' + code.slice(4))
  }

  return codes
}

/**
 * Hash backup codes before storing (bcrypt)
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = require('bcryptjs')
  const hashedCodes = await Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  )
  return hashedCodes
}

/**
 * Verify a backup code against hashed codes
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; usedIndex: number }> {
  const bcrypt = require('bcryptjs')

  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i])
    if (isValid) {
      return { valid: true, usedIndex: i }
    }
  }

  return { valid: false, usedIndex: -1 }
}

/**
 * Complete 2FA setup flow
 */
export interface Setup2FAResult {
  secret: string
  encrypted_secret: string
  iv: string
  qr_code: string
  backup_codes: string[]
  backup_codes_hashed: string[]
}

export async function setup2FA(userEmail: string): Promise<Setup2FAResult> {
  // Generate secret
  const { secret, otpauth_url } = generate2FASecret(userEmail)

  // Encrypt secret for storage
  const { encrypted, iv } = encryptSecret(secret)

  // Generate QR code
  const qrCode = await generateQRCode(otpauth_url!)

  // Generate backup codes
  const backupCodes = generateBackupCodes(8)
  const backupCodesHashed = await hashBackupCodes(backupCodes)

  return {
    secret, // Return plaintext to show to user once (don't store)
    encrypted_secret: encrypted, // Store this in database
    iv, // Store this with encrypted_secret
    qr_code: qrCode, // Show to user
    backup_codes: backupCodes, // Show to user once, then discard
    backup_codes_hashed: backupCodesHashed, // Store these in database
  }
}

/**
 * Verify 2FA during login
 */
export async function verify2FA(
  encryptedSecret: string,
  iv: string,
  token: string,
  backupCodesHashed?: string[]
): Promise<{ valid: boolean; usedBackupCode: boolean; backupCodeIndex?: number }> {
  // Try TOTP token first
  const decryptedSecret = decryptSecret(encryptedSecret, iv)
  const totpValid = verifyToken(decryptedSecret, token)

  if (totpValid) {
    return { valid: true, usedBackupCode: false }
  }

  // If TOTP fails and backup codes are provided, try backup code
  if (backupCodesHashed && backupCodesHashed.length > 0) {
    const backupResult = await verifyBackupCode(token, backupCodesHashed)
    if (backupResult.valid) {
      return {
        valid: true,
        usedBackupCode: true,
        backupCodeIndex: backupResult.usedIndex,
      }
    }
  }

  return { valid: false, usedBackupCode: false }
}
