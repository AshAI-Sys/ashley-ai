/**
 * Two-Factor Authentication (2FA) Library
 * Implements TOTP (Time-based One-Time Password) authentication
 * Compatible with Google Authenticator, Authy, and other TOTP apps
 */

import * as crypto from "crypto";

const TOTP_WINDOW = 1; // Allow 1 step before and after current time
const TOTP_STEP = 30; // 30 seconds per step
const TOTP_DIGITS = 6; // 6-digit codes

/**
 * Generate a random secret for TOTP
 * Returns base32 encoded secret
 */
export function generateSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanInput = input.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const idx = alphabet.indexOf(cleanInput[i]);
    if (idx === -1) throw new Error("Invalid base32 character");

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Generate TOTP code for a given time
 */
function generateTOTP(secret: string, time?: number): string {
  const epoch = Math.floor((time || Date.now()) / 1000);
  const counter = Math.floor(epoch / TOTP_STEP);

  const secretBuffer = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secretBuffer);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Verify a TOTP code
 * Checks current time and allows a window for clock drift
 */
export function verifyTOTP(secret: string, token: string): boolean {
  const epoch = Math.floor(Date.now() / 1000);

  // Check current time and adjacent windows
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    const time = (epoch + i * TOTP_STEP) * 1000;
    const expectedToken = generateTOTP(secret, time);

    if (token === expectedToken) {
      return true;
    }
  }

  return false;
}

/**
 * Generate QR code URL for authenticator apps
 */
export function generateQRCodeURL(
  secret: string,
  accountName: string,
  issuer: string = "Ashley AI"
): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: TOTP_DIGITS.toString(),
    period: TOTP_STEP.toString(),
  });

  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Generate backup codes for 2FA
 * Returns an array of 10 random 8-character codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code =
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()
        .match(/.{1,4}/g)
        ?.join("-") || "";
    codes.push(code);
  }

  return codes;
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.includes(hashedInput);
}

/**
 * Client-side browser implementation (no crypto module)
 * For use in React components
 */
export const clientSide2FA = {
  /**
   * Verify TOTP code (client-side)
   * Note: In production, always verify on server-side
   */
  verifyTOTP: async (secret: string, token: string): Promise<boolean> => {
    // This is a placeholder for client-side verification
    // In production, always verify on the server
    const response = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data.valid;
  },

  /**
   * Get QR code data URL for display
   */
  getQRCodeDataURL: async (
    secret: string,
    accountName: string
  ): Promise<string> => {
    const otpauthURL = generateQRCodeURL(secret, accountName);

    // Use a QR code library to generate the image
    // For now, return the URL - implement QR generation in the component
    return otpauthURL;
  },
};

/**
 * 2FA Status Type
 */
export interface TwoFactorStatus {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  qrCodeURL?: string;
}

/**
 * 2FA Setup Data
 */
export interface TwoFactorSetup {
  secret: string;
  qrCodeURL: string;
  backupCodes: string[];
}

/**
 * Initialize 2FA setup
 */
export function initializeTwoFactor(email: string): TwoFactorSetup {
  const secret = generateSecret();
  const qrCodeURL = generateQRCodeURL(secret, email);
  const backupCodes = generateBackupCodes();

  return {
    secret,
    qrCodeURL,
    backupCodes,
  };
}

/**
 * Validate 2FA token format
 */
export function isValidTokenFormat(token: string): boolean {
  return /^\d{6}$/.test(token);
}

/**
 * Format backup code for display
 */
export function formatBackupCode(code: string): string {
  return code.replace(/(.{4})/g, "$1-").slice(0, -1);
}
