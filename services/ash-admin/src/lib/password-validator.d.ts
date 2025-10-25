/**
 * Password Complexity Validator
 *
 * Enforces strong password requirements based on NIST guidelines
 */
export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong" | "very-strong";
    score: number;
}
/**
 * Validate password strength and complexity
 */
export declare function validatePassword(password: string): PasswordValidationResult;
/**
 * Generate password strength feedback
 */
export declare function getPasswordFeedback(result: PasswordValidationResult): string[];
/**
 * Check if password has been compromised (HIBP check simulation)
 * In production, integrate with Have I Been Pwned API
 */
export declare function checkPasswordBreached(password: string): Promise<boolean>;
/**
 * Generate a strong random password
 */
export declare function generateStrongPassword(length?: number): string;
