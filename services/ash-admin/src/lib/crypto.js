"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.generateEncryptionKey = generateEncryptionKey;
exports.hash = hash;
exports.verifyHash = verifyHash;
const crypto_1 = __importDefault(require("crypto"));
// CRITICAL: ENCRYPTION_KEY must be set in environment variables
// This should be a 32-byte (256-bit) key for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    throw new Error("CRITICAL SECURITY ERROR: ENCRYPTION_KEY environment variable is not set!");
}
// Ensure key is exactly 32 bytes
const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
/**
 * Encrypt sensitive data (like 2FA secrets)
 * Uses AES-256-GCM for authenticated encryption
 */
function encrypt(text) {
    try {
        // Generate a random initialization vector
        const iv = crypto_1.default.randomBytes(16);
        // Create cipher
        const cipher = crypto_1.default.createCipheriv("aes-256-gcm", KEY_BUFFER, iv);
        // Encrypt the text
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        // Get the auth tag
        const authTag = cipher.getAuthTag();
        // Return IV + Auth Tag + Encrypted Data (all hex encoded)
        return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
    }
    catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt data");
    }
}
/**
 * Decrypt sensitive data (like 2FA secrets)
 * Uses AES-256-GCM for authenticated decryption
 */
function decrypt(encryptedData) {
    try {
        // Split the encrypted data
        const parts = encryptedData.split(":");
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted data format");
        }
        const iv = Buffer.from(parts[0], "hex");
        const authTag = Buffer.from(parts[1], "hex");
        const encrypted = parts[2];
        // Create decipher
        const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", KEY_BUFFER, iv);
        decipher.setAuthTag(authTag);
        // Decrypt the text
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt data");
    }
}
/**
 * Generate a secure random key (for initial setup)
 * Returns a 32-byte hex string suitable for ENCRYPTION_KEY
 */
function generateEncryptionKey() {
    return crypto_1.default.randomBytes(32).toString("hex");
}
/**
 * Hash sensitive data (one-way, for verification only)
 * Use this for backup codes that need to be verified but not decrypted
 */
function hash(text) {
    return crypto_1.default.createHash("sha256").update(text).digest("hex");
}
/**
 * Verify a hash matches the original text
 */
function verifyHash(text, hashedText) {
    const textHash = hash(text);
    return crypto_1.default.timingSafeEqual(Buffer.from(textHash), Buffer.from(hashedText));
}
