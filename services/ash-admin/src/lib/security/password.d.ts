export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
    strength: "weak" | "fair" | "good" | "strong" | "very-strong";
    score: number;
}
export interface PasswordRequirements {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    rejectCommonPasswords: boolean;
}
/**
 * Default password requirements (secure configuration)
 */
export declare const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements;
/**
 * Validate password against security requirements
 */
export declare function validatePassword(password: string, requirements?: PasswordRequirements): PasswordValidationResult;
/**
 * Hash password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare password with hash
 */
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate a secure random password
 */
export declare function generateSecurePassword(length?: number): string;
/**
 * Check if password has been pwned (using k-anonymity)
 * This is optional and requires external API call
 */
export declare function checkPasswordPwned(password: string): Promise<{
    pwned: boolean;
    count: number;
}>;
