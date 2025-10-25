/**
 * Encrypt sensitive data (like 2FA secrets)
 * Uses AES-256-GCM for authenticated encryption
 */
export declare function encrypt(text: string): string;
/**
 * Decrypt sensitive data (like 2FA secrets)
 * Uses AES-256-GCM for authenticated decryption
 */
export declare function decrypt(encryptedData: string): string;
/**
 * Generate a secure random key (for initial setup)
 * Returns a 32-byte hex string suitable for ENCRYPTION_KEY
 */
export declare function generateEncryptionKey(): string;
/**
 * Hash sensitive data (one-way, for verification only)
 * Use this for backup codes that need to be verified but not decrypted
 */
export declare function hash(text: string): string;
/**
 * Verify a hash matches the original text
 */
export declare function verifyHash(text: string, hashedText: string): boolean;
