"use strict";
/**
 * Two-Factor Authentication (2FA) Library
 * Implements TOTP (Time-based One-Time Password) authentication
 * Compatible with Google Authenticator, Authy, and other TOTP apps
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSide2FA = void 0;
exports.generateSecret = generateSecret;
exports.verifyTOTP = verifyTOTP;
exports.generateQRCodeURL = generateQRCodeURL;
exports.generateBackupCodes = generateBackupCodes;
exports.hashBackupCode = hashBackupCode;
exports.verifyBackupCode = verifyBackupCode;
exports.initializeTwoFactor = initializeTwoFactor;
exports.isValidTokenFormat = isValidTokenFormat;
exports.formatBackupCode = formatBackupCode;
const crypto = __importStar(require("crypto"));
const TOTP_WINDOW = 1; // Allow 1 step before and after current time
const TOTP_STEP = 30; // 30 seconds per step
const TOTP_DIGITS = 6; // 6-digit codes
/**
 * Generate a random secret for TOTP
 * Returns base32 encoded secret
 */
function generateSecret() {
    const buffer = crypto.randomBytes(20);
    return base32Encode(buffer);
}
/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0;
    let value = 0;
    let output = "";
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
}
/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(input) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleanInput = input.toUpperCase().replace(/=+$/, "");
    let bits = 0;
    let value = 0;
    const output = [];
    for (let i = 0; i < cleanInput.length; i++) {
        const idx = alphabet.indexOf(cleanInput[i]);
        if (idx === -1)
            throw new Error("Invalid base32 character");
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return Buffer.from(output);
}
/**
 * Generate TOTP code for a given time
 */
function generateTOTP(secret, time) {
    const epoch = Math.floor((time || Date.now()) / 1000);
    const counter = Math.floor(epoch / TOTP_STEP);
    const secretBuffer = base32Decode(secret);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac("sha1", secretBuffer);
    hmac.update(counterBuffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);
    const otp = binary % Math.pow(10, TOTP_DIGITS);
    return otp.toString().padStart(TOTP_DIGITS, "0");
}
/**
 * Verify a TOTP code
 * Checks current time and allows a window for clock drift
 */
function verifyTOTP(secret, token) {
    const epoch = Math.floor(Date.now() / 1000);
    // Check current time and adjacent windows
    for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
        const time = (epoch + i * TOTP_STEP) * 1000;
        const expectedToken = generateTOTP(secret, time);
        if (token === expectedToken) {
            return true;
        }
    }
    return false;
}
/**
 * Generate QR code URL for authenticator apps
 */
function generateQRCodeURL(secret, accountName, issuer = "Ashley AI") {
    const label = encodeURIComponent(`${issuer}:${accountName}`);
    const params = new URLSearchParams({
        secret,
        issuer,
        algorithm: "SHA1",
        digits: TOTP_DIGITS.toString(),
        period: TOTP_STEP.toString(),
    });
    return `otpauth://totp/${label}?${params.toString()}`;
}
/**
 * Generate backup codes for 2FA
 * Returns an array of 10 random 8-character codes
 */
function generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()
            .match(/.{1,4}/g)
            ?.join("-") || "";
        codes.push(code);
    }
    return codes;
}
/**
 * Hash backup code for storage
 */
function hashBackupCode(code) {
    return crypto.createHash("sha256").update(code).digest("hex");
}
/**
 * Verify backup code
 */
function verifyBackupCode(code, hashedCodes) {
    const hashedInput = hashBackupCode(code);
    return hashedCodes.includes(hashedInput);
}
/**
 * Client-side browser implementation (no crypto module)
 * For use in React components
 */
exports.clientSide2FA = {
    /**
     * Verify TOTP code (client-side)
     * Note: In production, always verify on server-side
     */
    verifyTOTP: async (secret, token) => {
        // This is a placeholder for client-side verification
        // In production, always verify on the server
        const response = await fetch("/api/auth/verify-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
        const data = await response.json();
        return data.valid;
    },
    /**
     * Get QR code data URL for display
     */
    getQRCodeDataURL: async (secret, accountName) => {
        const otpauthURL = generateQRCodeURL(secret, accountName);
        // Use a QR code library to generate the image
        // For now, return the URL - implement QR generation in the component
        return otpauthURL;
    },
};
/**
 * Initialize 2FA setup
 */
function initializeTwoFactor(email) {
    const secret = generateSecret();
    const qrCodeURL = generateQRCodeURL(secret, email);
    const backupCodes = generateBackupCodes();
    return {
        secret,
        qrCodeURL,
        backupCodes,
    };
}
/**
 * Validate 2FA token format
 */
function isValidTokenFormat(token) {
    return /^\d{6}$/.test(token);
}
/**
 * Format backup code for display
 */
function formatBackupCode(code) {
    return code.replace(/(.{4})/g, "$1-").slice(0, -1);
}
