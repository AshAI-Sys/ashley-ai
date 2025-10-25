/**
 * Server-side 2FA utilities (without QR code generation)
 * QR code generation should be done client-side
 */
/**
 * Encrypt a secret before storing in database
 */
export declare function encryptSecret(secret: string): {
    encrypted: string;
    iv: string;
};
/**
 * Decrypt a secret from database
 */
export declare function decryptSecret(encrypted: string, iv: string): string;
/**
 * Generate a new 2FA secret for a user
 */
export declare function generate2FASecret(userEmail: string, appName?: string): {
    secret: string;
    otpauth_url: string;
};
/**
 * Verify a TOTP token
 */
export declare function verifyToken(secret: string, token: string): boolean;
/**
 * Generate backup codes (8 codes, 8 characters each)
 */
export declare function generateBackupCodes(count?: number): string[];
/**
 * Hash backup codes before storing (bcrypt)
 */
export declare function hashBackupCodes(codes: string[]): Promise<string[]>;
/**
 * Verify a backup code against hashed codes
 */
export declare function verifyBackupCode(code: string, hashedCodes: string[]): Promise<{
    valid: boolean;
    usedIndex: number;
}>;
/**
 * Complete 2FA setup flow (server-side only - NO QR CODE)
 * QR code generation must be done client-side
 */
export interface Setup2FAResult {
    secret: string;
    encrypted_secret: string;
    iv: string;
    otpauth_url: string;
    backup_codes: string[];
    backup_codes_hashed: string[];
}
export declare function setup2FA(userEmail: string): Promise<Setup2FAResult>;
/**
 * Verify 2FA during login
 */
export declare function verify2FA(encryptedSecret: string, iv: string, token: string, backupCodesHashed?: string[]): Promise<{
    valid: boolean;
    usedBackupCode: boolean;
    backupCodeIndex?: number;
}>;
