"use strict";
// ASH AI Authentication Utilities
// Helper functions for password hashing, permissions, and token management
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PASSWORD_POLICY = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.checkPermission = checkPermission;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.isHigherRole = isHigherRole;
exports.canManageUser = canManageUser;
exports.generateWorkspaceSlug = generateWorkspaceSlug;
exports.sanitizeUser = sanitizeUser;
exports.generate2FASecret = generate2FASecret;
exports.verify2FAToken = verify2FAToken;
exports.createRateLimitKey = createRateLimitKey;
exports.isRateLimited = isRateLimited;
exports.createAuditLog = createAuditLog;
exports.validatePassword = validatePassword;
exports.blacklistToken = blacklistToken;
exports.isTokenBlacklisted = isTokenBlacklisted;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const types_1 = require("./types");
// Password utilities
async function hashPassword(password) {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
}
async function verifyPassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
// Permission utilities
function hasPermission(userRole, permission) {
    const rolePermissions = types_1.ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(permission);
}
function hasAnyPermission(userRole, permissions) {
    return permissions.some(permission => hasPermission(userRole, permission));
}
function hasAllPermissions(userRole, permissions) {
    return permissions.every(permission => hasPermission(userRole, permission));
}
// Advanced permission checking with context
function checkPermission(context, permission, options) {
    const { user, resource } = context;
    const opts = { requireSameWorkspace: true, ...options };
    // Check basic role permission
    if (!hasPermission(user.role, permission)) {
        return false;
    }
    // Check workspace isolation
    if (opts.requireSameWorkspace && resource?.workspace_id !== user.workspace_id) {
        return false;
    }
    // Check ownership
    if (opts.requireOwnership && resource?.owner_id !== user.id) {
        // Admins and managers can override ownership
        if (![types_1.UserRole.ADMIN, types_1.UserRole.MANAGER].includes(user.role)) {
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
function generateAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: "1h",
        issuer: "ash-ai",
        audience: "ash-ai-api",
    });
}
function generateRefreshToken() {
    return (0, nanoid_1.nanoid)(64);
}
function verifyAccessToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    try {
        return jsonwebtoken_1.default.verify(token, secret, {
            issuer: "ash-ai",
            audience: "ash-ai-api",
        });
    }
    catch {
        return null;
    }
}
// Role hierarchy utilities
function isHigherRole(role1, role2) {
    const hierarchy = {
        [types_1.UserRole.ADMIN]: 10,
        [types_1.UserRole.MANAGER]: 8,
        [types_1.UserRole.CSR]: 6,
        [types_1.UserRole.GRAPHIC_ARTIST]: 4,
        [types_1.UserRole.QC_INSPECTOR]: 4,
        [types_1.UserRole.PRODUCTION_OPERATOR]: 3,
        [types_1.UserRole.WAREHOUSE_STAFF]: 2,
        [types_1.UserRole.CLIENT]: 1,
    };
    return hierarchy[role1] > hierarchy[role2];
}
function canManageUser(managerRole, targetRole) {
    // Admins can manage everyone except other admins
    if (managerRole === types_1.UserRole.ADMIN) {
        return targetRole !== types_1.UserRole.ADMIN;
    }
    // Managers can manage non-admin, non-manager roles
    if (managerRole === types_1.UserRole.MANAGER) {
        return ![types_1.UserRole.ADMIN, types_1.UserRole.MANAGER].includes(targetRole);
    }
    return false;
}
// Workspace utilities
function generateWorkspaceSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .substring(0, 50);
}
// Session utilities
function sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
}
// 2FA utilities (placeholder for future implementation)
function generate2FASecret() {
    // TODO: Implement proper 2FA secret generation
    return (0, nanoid_1.nanoid)(32);
}
function verify2FAToken(secret, token) {
    // TODO: Implement proper 2FA token verification (TOTP)
    return false;
}
// Rate limiting helpers
function createRateLimitKey(identifier, action) {
    return `ratelimit:${action}:${identifier}`;
}
function isRateLimited(attempts, timeWindow, maxAttempts) {
    return attempts >= maxAttempts;
}
// Audit logging helpers
function createAuditLog(action, details) {
    return {
        action,
        timestamp: new Date().toISOString(),
        details,
        trace_id: (0, nanoid_1.nanoid)(16),
    };
}
exports.DEFAULT_PASSWORD_POLICY = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
};
function validatePassword(password, policy = exports.DEFAULT_PASSWORD_POLICY) {
    const errors = [];
    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
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
const tokenBlacklist = new Set();
function blacklistToken(tokenJti) {
    tokenBlacklist.add(tokenJti);
    // Clean up expired tokens periodically
    setTimeout(() => {
        tokenBlacklist.delete(tokenJti);
    }, 24 * 60 * 60 * 1000); // 24 hours
}
function isTokenBlacklisted(tokenJti) {
    return tokenBlacklist.has(tokenJti);
}
