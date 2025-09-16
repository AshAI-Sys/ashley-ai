import { UserRole, Permission, PermissionContext } from "./types";
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
export declare function hasPermission(userRole: UserRole, permission: Permission): boolean;
export declare function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean;
export declare function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean;
export declare function checkPermission(context: PermissionContext, permission: Permission, options?: {
    requireOwnership?: boolean;
    requireSameBrand?: boolean;
    requireSameWorkspace?: boolean;
}): boolean;
export declare function generateAccessToken(payload: Record<string, unknown>): string;
export declare function generateRefreshToken(): string;
export declare function verifyAccessToken(token: string): Record<string, unknown> | null;
export declare function isHigherRole(role1: UserRole, role2: UserRole): boolean;
export declare function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean;
export declare function generateWorkspaceSlug(name: string): string;
export declare function sanitizeUser(user: any): any;
export declare function generate2FASecret(): string;
export declare function verify2FAToken(secret: string, token: string): boolean;
export declare function createRateLimitKey(identifier: string, action: string): string;
export declare function isRateLimited(attempts: number, timeWindow: number, maxAttempts: number): boolean;
export declare function createAuditLog(action: string, details: Record<string, unknown>): {
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
    trace_id: string;
};
export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
}
export declare const DEFAULT_PASSWORD_POLICY: PasswordPolicy;
export declare function validatePassword(password: string, policy?: PasswordPolicy): {
    valid: boolean;
    errors: string[];
};
export declare function blacklistToken(tokenJti: string): void;
export declare function isTokenBlacklisted(tokenJti: string): boolean;
