import * as bcrypt from "bcryptjs";

/**
 * Common weak passwords to reject
 * Source: Top 100 most common passwords
 */
const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "123123",
  "baseball",
  "iloveyou",
  "trustno1",
  "1234567890",
  "sunshine",
  "master",
  "welcomeback",
  "shadow",
  "ashley",
  "football",
  "jesus",
  "michael",
  "ninja",
  "mustang",
  "password1",
  "000000",
  "admin",
  "letmein",
  "monkey",
  "654321",
  "starwars",
  "charlie",
  "aa123456",
  "donald",
  "password123",
  "qwerty123",
  "zxcvbnm",
  "welcome",
  "login",
  "solo",
  "abc123",
  "admin123",
  "flower",
  "passw0rd",
  "killer",
  "changeme",
  "hello",
  "123qwe",
  "bailey",
  "access",
  "passw0rd",
  "superman",
  "qazwsx",
]);

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
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  rejectCommonPasswords: true,
};

/**
 * Validate password against security requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(
      `Password must be at least ${requirements.minLength} characters long`
    );
  } else {
    score += 20;
    // Bonus points for extra length
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;
  }

  // Check uppercase
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (/[A-Z]/.test(password)) {
    score += 15;
  }

  // Check lowercase
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (/[a-z]/.test(password)) {
    score += 15;
  }

  // Check numbers
  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  } else if (/[0-9]/.test(password)) {
    score += 15;
  }

  // Check special characters
  if (
    requirements.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*()_+-=[]{};'\":|,.<>/?)"
    );
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  }

  // Check for common passwords
  if (requirements.rejectCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.has(lowerPassword)) {
      errors.push(
        "This password is too common. Please choose a more unique password"
      );
      score = Math.min(score, 20); // Cap score for common passwords
    }
  }

  // Check for sequential characters
  if (
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password
    )
  ) {
    errors.push("Password should not contain sequential characters");
    score -= 10;
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password should not contain repeated characters");
    score -= 10;
  }

  // Bonus for mixed character types
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const typeCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  if (typeCount === 4) score += 10;
  if (typeCount === 3) score += 5;

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine strength
  let strength: PasswordValidationResult["strength"];
  if (score >= 80) strength = "very-strong";
  else if (score >= 60) strength = "strong";
  else if (score >= 40) strength = "good";
  else if (score >= 20) strength = "fair";
  else strength = "weak";

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Industry standard for bcrypt
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = uppercase + lowercase + numbers + special;

  let password = "";

  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Check if password has been pwned (using k-anonymity)
 * This is optional and requires external API call
 */
export async function checkPasswordPwned(password: string): Promise<{
  pwned: boolean;
  count: number;
}> {
  try {
    // Hash the password with SHA-1
    const crypto = require("crypto");
    const hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HaveIBeenPwned API using k-anonymity
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`
    );
    if (!response.ok) {
      console.warn("Failed to check password against HIBP database");
      return { pwned: false, count: 0 };
    }

    const text = await response.text();
    const hashes = text.split("\n");

    for (const line of hashes) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix === suffix && count) {
        return { pwned: true, count: parseInt(count.trim()) };
      }
    }

    return { pwned: false, count: 0 };
  } catch (error) {
    console.error("Error checking password against HIBP:", error);
    return { pwned: false, count: 0 };
  }
}
