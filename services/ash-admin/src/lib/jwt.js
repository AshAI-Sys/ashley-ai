"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.generateTokenPair = generateTokenPair;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.refreshAccessToken = refreshAccessToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
exports.isTokenExpiringSoon = isTokenExpiringSoon;
exports.refreshToken = refreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
// CRITICAL: JWT_SECRET must be set in environment variables
// Never use a fallback in production!
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
if (!JWT_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!");
}
// Type-safe secret (guaranteed to be non-empty after the check above)
const SECRET = JWT_SECRET;
/**
 * Generate access token (short-lived, 15 minutes)
 */
function generateAccessToken(payload) {
    try {
        const token = jsonwebtoken_1.default.sign({ ...payload, type: "access" }, SECRET, {
            expiresIn: JWT_ACCESS_EXPIRES_IN,
            algorithm: "HS256",
        });
        logger_1.authLogger.debug("Access token generated", { userId: payload.userId });
        return token;
    }
    catch (error) {
        logger_1.authLogger.error("Failed to generate access token", error);
        throw new Error("Token generation failed");
    }
}
/**
 * Generate refresh token (long-lived, 7 days)
 */
function generateRefreshToken(payload) {
    try {
        const token = jsonwebtoken_1.default.sign({ ...payload, type: "refresh" }, SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
            algorithm: "HS256",
        });
        logger_1.authLogger.debug("Refresh token generated", { userId: payload.userId });
        return token;
    }
    catch (error) {
        logger_1.authLogger.error("Failed to generate refresh token", error);
        throw new Error("Token generation failed");
    }
}
/**
 * Generate both access and refresh tokens
 */
function generateTokenPair(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    // Calculate expiry time (15 minutes in seconds)
    const expiresIn = 15 * 60;
    return {
        accessToken,
        refreshToken,
        expiresIn,
    };
}
/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateAccessToken or generateTokenPair instead
 */
function generateToken(payload) {
    return generateAccessToken(payload);
}
/**
 * Verify and decode JWT token
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET, {
            algorithms: ["HS256"],
        });
        logger_1.authLogger.debug("Token verified successfully", { userId: decoded.userId });
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.authLogger.debug("Invalid JWT token", { error: error.message });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            logger_1.authLogger.debug("JWT token expired", { error: error.message });
        }
        else {
            logger_1.authLogger.error("JWT verification error", error);
        }
        return null;
    }
}
/**
 * Verify access token specifically
 */
function verifyAccessToken(token) {
    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }
    if (payload.type && payload.type !== "access") {
        logger_1.authLogger.warn("Token type mismatch: expected access token");
        return null;
    }
    return payload;
}
/**
 * Verify refresh token specifically
 */
function verifyRefreshToken(token) {
    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }
    if (payload.type && payload.type !== "refresh") {
        logger_1.authLogger.warn("Token type mismatch: expected refresh token");
        return null;
    }
    return payload;
}
/**
 * Refresh access token using refresh token
 */
function refreshAccessToken(refreshToken) {
    try {
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            logger_1.authLogger.warn("Invalid refresh token");
            return null;
        }
        // Generate new access token with same payload
        const newAccessToken = generateAccessToken({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            workspaceId: payload.workspaceId,
        });
        logger_1.authLogger.info("Access token refreshed", { userId: payload.userId });
        return newAccessToken;
    }
    catch (error) {
        logger_1.authLogger.error("Failed to refresh access token", error);
        return null;
    }
}
/**
 * Extract token from Authorization header
 */
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    return parts[1] || null;
}
/**
 * Check if token is about to expire (within 5 minutes)
 */
function isTokenExpiringSoon(payload) {
    if (!payload.exp) {
        return false;
    }
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    const fiveMinutes = 5 * 60;
    return timeUntilExpiry < fiveMinutes;
}
/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use refreshAccessToken instead
 */
function refreshToken(token) {
    return refreshAccessToken(token);
}
