// ASH AI Authentication Utilities
// Helper functions for password hashing, permissions, and token management

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
  PermissionContext,
} from "./types";

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Permission utilities
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Advanced permission checking with context
export function checkPermission(
  context: PermissionContext,
  permission: Permission,
  options?: {
    requireOwnership?: boolean;
    requireSameBrand?: boolean;
    requireSameWorkspace?: boolean;
  }
): boolean {
  const { user, resource } = context;
  const opts = { requireSameWorkspace: true, ...options };

  // Check basic role permission
  if (!hasPermission(user.role, permission)) {
    return false;
  }

  // Check workspace isolation
  if (
    opts.requireSameWorkspace &&
    resource?.workspace_id !== user.workspace_id
  ) {
    return false;
  }

  // Check ownership
  if (opts.requireOwnership && resource?.owner_id !== user.id) {
    // Admins and managers can override ownership
    if (![UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
      return false;
    }
  }

  // Check brand access
  if (opts.requireSameBrand && resource?.brand_id) {
    // TODO: Implement brand-level access control if needed
    // This would require additional user-brand relationships in the database
  }

  return true;
}

// JWT utilities for API tokens
export function generateAccessToken(payload: Record<string, unknown>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1h",
    issuer: "ash-ai",
    audience: "ash-ai-api",
  });
}

export function generateRefreshToken(): string {
  return nanoid(64);
}

export function verifyAccessToken(
  token: string
): Record<string, unknown> | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  try {
    return jwt.verify(token, secret, {
      issuer: "ash-ai",
      audience: "ash-ai-api",
    }) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Role hierarchy utilities
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
  const hierarchy = {
    [UserRole.ADMIN]: 10,
    [UserRole.MANAGER]: 8,
    [UserRole.CSR]: 6,
    [UserRole.GRAPHIC_ARTIST]: 4,
    [UserRole.QC_INSPECTOR]: 4,
    [UserRole.PRODUCTION_OPERATOR]: 3,
    [UserRole.WAREHOUSE_STAFF]: 2,
    [UserRole.CLIENT]: 1,
  };

  return hierarchy[role1] > hierarchy[role2];
}

export function canManageUser(
  managerRole: UserRole,
  targetRole: UserRole
): boolean {
  // Admins can manage everyone except other admins
  if (managerRole === UserRole.ADMIN) {
    return targetRole !== UserRole.ADMIN;
  }

  // Managers can manage non-admin, non-manager roles
  if (managerRole === UserRole.MANAGER) {
    return ![UserRole.ADMIN, UserRole.MANAGER].includes(targetRole);
  }

  return false;
}

// Workspace utilities
export function generateWorkspaceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 50);
}

// Session utilities
export function sanitizeUser(user: any) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

// 2FA utilities (placeholder for future implementation)
export function generate2FASecret(): string {
  // TODO: Implement proper 2FA secret generation
  return nanoid(32);
}

export function verify2FAToken(secret: string, token: string): boolean {
  // TODO: Implement proper 2FA token verification (TOTP)
  return false;
}

// Rate limiting helpers
export function createRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}

export function isRateLimited(
  attempts: number,
  timeWindow: number,
  maxAttempts: number
): boolean {
  return attempts >= maxAttempts;
}

// Audit logging helpers
export function createAuditLog(
  action: string,
  details: Record<string, unknown>
) {
  return {
    action,
    timestamp: new Date().toISOString(),
    details,
    trace_id: nanoid(16),
  };
}

// Password policy validation
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export function validatePassword(
  password: string,
  policy = DEFAULT_PASSWORD_POLICY
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(
      `Password must be at least ${policy.minLength} characters long`
    );
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Token blacklist utilities (for logout)
const tokenBlacklist = new Set<string>();

export function blacklistToken(tokenJti: string): void {
  tokenBlacklist.add(tokenJti);

  // Clean up expired tokens periodically
  setTimeout(
    () => {
      tokenBlacklist.delete(tokenJti);
    },
    24 * 60 * 60 * 1000
  ); // 24 hours
}

export function isTokenBlacklisted(tokenJti: string): boolean {
  return tokenBlacklist.has(tokenJti);
}
