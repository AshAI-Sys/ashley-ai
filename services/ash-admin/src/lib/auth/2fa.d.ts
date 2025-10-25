/**
 * Two-Factor Authentication (2FA) Library
 * Implements TOTP (Time-based One-Time Password) authentication
 * Compatible with Google Authenticator, Authy, and other TOTP apps
 */
/**
 * Generate a random secret for TOTP
 * Returns base32 encoded secret
 */
export declare function generateSecret(): string;
/**
 * Verify a TOTP code
 * Checks current time and allows a window for clock drift
 */
export declare function verifyTOTP(secret: string, token: string): boolean;
/**
 * Generate QR code URL for authenticator apps
 */
export declare function generateQRCodeURL(secret: string, accountName: string, issuer?: string): string;
/**
 * Generate backup codes for 2FA
 * Returns an array of 10 random 8-character codes
 */
export declare function generateBackupCodes(count?: number): string[];
/**
 * Hash backup code for storage
 */
export declare function hashBackupCode(code: string): string;
/**
 * Verify backup code
 */
export declare function verifyBackupCode(code: string, hashedCodes: string[]): boolean;
/**
 * Client-side browser implementation (no crypto module)
 * For use in React components
 */
export declare const clientSide2FA: {
    /**
     * Verify TOTP code (client-side)
     * Note: In production, always verify on server-side
     */
    verifyTOTP: (secret: string, token: string) => Promise<boolean>;
    /**
     * Get QR code data URL for display
     */
    getQRCodeDataURL: (secret: string, accountName: string) => Promise<string>;
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
export declare function initializeTwoFactor(email: string): TwoFactorSetup;
/**
 * Validate 2FA token format
 */
export declare function isValidTokenFormat(token: string): boolean;
/**
 * Format backup code for display
 */
export declare function formatBackupCode(code: string): string;
