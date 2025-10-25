"use strict";
/**
 * Server-side 2FA utilities (without QR code generation)
 * QR code generation should be done client-side
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
exports.generate2FASecret = generate2FASecret;
exports.verifyToken = verifyToken;
exports.generateBackupCodes = generateBackupCodes;
exports.hashBackupCodes = hashBackupCodes;
exports.verifyBackupCode = verifyBackupCode;
exports.setup2FA = setup2FA;
exports.verify2FA = verify2FA;
const speakeasy_1 = __importDefault(require("speakeasy"));
const crypto_1 = require("crypto");
// Encryption for 2FA secrets (AES-256)
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ||
    "ashley-ai-encryption-key-2025-production-32bytes"; // Must be 32 bytes
/**
 * Encrypt a secret before storing in database
 */
function encryptSecret(secret) {
    const iv = (0, crypto_1.randomBytes)(16);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(secret, "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
        encrypted,
        iv: iv.toString("hex"),
    };
}
/**
 * Decrypt a secret from database
 */
function decryptSecret(encrypted, iv) {
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
/**
 * Generate a new 2FA secret for a user
 */
function generate2FASecret(userEmail, appName = "Ashley AI") {
    const secret = speakeasy_1.default.generateSecret({
        name: `${appName} (${userEmail})`,
        length: 32,
    });
    return {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
    };
}
/**
 * Verify a TOTP token
 */
function verifyToken(secret, token) {
    return speakeasy_1.default.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 2, // Allow 2 time steps before/after for clock drift
    });
}
/**
 * Generate backup codes (8 codes, 8 characters each)
 */
function generateBackupCodes(count = 8) {
    const codes = [];
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < count; i++) {
        let code = "";
        for (let j = 0; j < 8; j++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        // Format as XXXX-XXXX for readability
        codes.push(code.slice(0, 4) + "-" + code.slice(4));
    }
    return codes;
}
/**
 * Hash backup codes before storing (bcrypt)
 */
async function hashBackupCodes(codes) {
    const bcrypt = require("bcryptjs");
    const hashedCodes = await Promise.all(codes.map(code => bcrypt.hash(code, 10)));
    return hashedCodes;
}
/**
 * Verify a backup code against hashed codes
 */
async function verifyBackupCode(code, hashedCodes) {
    const bcrypt = require("bcryptjs");
    for (let i = 0; i < hashedCodes.length; i++) {
        const isValid = await bcrypt.compare(code, hashedCodes[i]);
        if (isValid) {
            return { valid: true, usedIndex: i };
        }
    }
    return { valid: false, usedIndex: -1 };
}
async function setup2FA(userEmail) {
    // Generate secret
    const { secret, otpauth_url } = generate2FASecret(userEmail);
    // Encrypt secret for storage
    const { encrypted, iv } = encryptSecret(secret);
    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    const backupCodesHashed = await hashBackupCodes(backupCodes);
    return {
        secret, // Return plaintext to show to user once (don't store)
        encrypted_secret: encrypted, // Store this in database
        iv, // Store this with encrypted_secret
        otpauth_url: otpauth_url, // Client will generate QR from this
        backup_codes: backupCodes, // Show to user once, then discard
        backup_codes_hashed: backupCodesHashed, // Store these in database
    };
}
/**
 * Verify 2FA during login
 */
async function verify2FA(encryptedSecret, iv, token, backupCodesHashed) {
    // Try TOTP token first
    const decryptedSecret = decryptSecret(encryptedSecret, iv);
    const totpValid = verifyToken(decryptedSecret, token);
    if (totpValid) {
        return { valid: true, usedBackupCode: false };
    }
    // If TOTP fails and backup codes are provided, try backup code
    if (backupCodesHashed && backupCodesHashed.length > 0) {
        const backupResult = await verifyBackupCode(token, backupCodesHashed);
        if (backupResult.valid) {
            return {
                valid: true,
                usedBackupCode: true,
                backupCodeIndex: backupResult.usedIndex,
            };
        }
    }
    return { valid: false, usedBackupCode: false };
}
