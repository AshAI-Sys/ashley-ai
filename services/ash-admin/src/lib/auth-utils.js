"use strict";
/**
 * Authentication Utilities for Production
 * Real password hashing, JWT tokens, and session management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateSecureToken = generateSecureToken;
exports.validatePassword = validatePassword;
exports.generateSessionId = generateSessionId;
exports.hashSensitiveData = hashSensitiveData;
exports.decryptSensitiveData = decryptSensitiveData;
const jose_1 = require("jose");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto_1.default.randomBytes(32).toString("hex");
const JWT_ISSUER = "ashley-ai";
const JWT_AUDIENCE = "ashley-ai-users";
const JWT_EXPIRY = "7d"; // 7 days
// Password Configuration
const SALT_ROUNDS = 12; // bcrypt salt rounds for secure hashing
/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
/**
 * Generate a JWT token for an authenticated user
 */
async function generateToken(payload) {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose_1.SignJWT({
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
async function verifyToken(token) {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await (0, jose_1.jwtVerify)(token, secret, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        });
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            workspaceId: payload.workspaceId,
        };
    }
    catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}
/**
 * Generate a secure random token (for password reset, etc.)
 */
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString("hex");
}
/**
 * Validate password strength
 */
function validatePassword(password) {
    const errors = [];
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
function generateSessionId() {
    return crypto_1.default.randomUUID();
}
/**
 * Hash sensitive data (for 2FA secrets, etc.)
 */
function hashSensitiveData(data) {
    const algorithm = "aes-256-cbc";
    const key = crypto_1.default.scryptSync(JWT_SECRET, "salt", 32);
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}
/**
 * Decrypt sensitive data
 */
function decryptSensitiveData(encrypted) {
    const algorithm = "aes-256-cbc";
    const key = crypto_1.default.scryptSync(JWT_SECRET, "salt", 32);
    const [ivHex, encryptedData] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
