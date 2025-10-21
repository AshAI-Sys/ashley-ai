/**
 * Authentication Utilities for Production
 * Real password hashing, JWT tokens, and session management
 */

import { SignJWT, jwtVerify } from "jose";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";

// JWT Configuration
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_ISSUER = "ashley-ai";
const JWT_AUDIENCE = "ashley-ai-users";
const JWT_EXPIRY = "7d"; // 7 days

// Password Configuration
const SALT_ROUNDS = 12; // bcrypt salt rounds for secure hashing

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for an authenticated user
 */
export async function generateToken(payload: {
  userId: string;
  email: string;
  role: string;
  workspaceId: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT({
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    workspaceId: payload.workspaceId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<{
  userId: string;
  email: string;
  role: string;
  workspaceId: string;
} | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      workspaceId: payload.workspaceId as string,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Generate a secure random token (for password reset, etc.)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Hash sensitive data (for 2FA secrets, etc.)
 */
export function hashSensitiveData(data: string): string {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(JWT_SECRET, "salt", 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decryptSensitiveData(encrypted: string): string {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(JWT_SECRET, "salt", 32);

  const [ivHex, encryptedData] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
