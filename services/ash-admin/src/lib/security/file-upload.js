"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENT_UPLOAD_CONFIG = exports.IMAGE_UPLOAD_CONFIG = void 0;
exports.validateFileUpload = validateFileUpload;
exports.sanitizeFileName = sanitizeFileName;
exports.generateSecureFileName = generateSecureFileName;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Magic bytes for common file types
 * Used to verify actual file type vs declared MIME type
 */
const MAGIC_BYTES = {
    // Images
    "image/jpeg": ["FFD8FF"],
    "image/png": ["89504E47"],
    "image/gif": ["474946"],
    "image/webp": ["52494646"], // RIFF
    "image/svg+xml": ["3C737667", "3C3F786D"], // <svg or <?xml
    // Documents
    "application/pdf": ["25504446"],
    "application/zip": ["504B0304", "504B0506"],
    "application/x-rar": ["526172211A07"],
    // Office documents (ZIP-based)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        "504B0304",
    ],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        "504B0304",
    ],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
        "504B0304",
    ],
    // Text
    "text/plain": [], // Any bytes are valid for text
    "text/csv": [],
    "application/json": [],
};
/**
 * Default configuration for image uploads
 */
exports.IMAGE_UPLOAD_CONFIG = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    validateMagicBytes: true,
    scanMalware: false,
};
/**
 * Default configuration for document uploads
 */
exports.DOCUMENT_UPLOAD_CONFIG = {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "text/plain",
    ],
    allowedExtensions: [".pdf", ".docx", ".xlsx", ".csv", ".txt"],
    validateMagicBytes: true,
    scanMalware: true,
};
/**
 * Validate uploaded file
 */
async function validateFileUpload(file, config = exports.IMAGE_UPLOAD_CONFIG) {
    const errors = [];
    const warnings = [];
    // Get file info
    const fileName = sanitizeFileName(file.name);
    const fileSize = file.size;
    const mimeType = file.type;
    const extension = getFileExtension(fileName);
    // 1. Check file size
    const maxSize = config.maxSize || 10 * 1024 * 1024;
    if (fileSize > maxSize) {
        errors.push(`File size (${formatBytes(fileSize)}) exceeds maximum allowed (${formatBytes(maxSize)})`);
    }
    if (fileSize === 0) {
        errors.push("File is empty");
    }
    // 2. Check MIME type
    if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
        if (!config.allowedMimeTypes.includes(mimeType)) {
            errors.push(`File type '${mimeType}' is not allowed. Allowed types: ${config.allowedMimeTypes.join(", ")}`);
        }
    }
    // 3. Check file extension
    if (config.allowedExtensions && config.allowedExtensions.length > 0) {
        if (!config.allowedExtensions.includes(extension.toLowerCase())) {
            errors.push(`File extension '${extension}' is not allowed. Allowed extensions: ${config.allowedExtensions.join(", ")}`);
        }
    }
    // 4. Validate magic bytes (file signature)
    if (config.validateMagicBytes && errors.length === 0) {
        const isValidSignature = await validateMagicBytes(file, mimeType);
        if (!isValidSignature) {
            errors.push("File content does not match declared file type (possible file type spoofing)");
        }
    }
    // 5. Check for dangerous content
    const dangerousPatterns = await checkDangerousContent(file);
    if (dangerousPatterns.length > 0) {
        errors.push(`File contains potentially dangerous content: ${dangerousPatterns.join(", ")}`);
    }
    // 6. Generate file hash
    let fileHash = "";
    if (errors.length === 0) {
        fileHash = await calculateFileHash(file);
    }
    // 7. Check file name for suspicious patterns
    if (hasNullByte(fileName)) {
        errors.push("File name contains null bytes");
    }
    if (hasPathTraversal(fileName)) {
        errors.push("File name contains path traversal characters");
    }
    // 8. Malware scanning (if configured and available)
    if (config.scanMalware && errors.length === 0) {
        // Placeholder for malware scanning
        // In production, integrate with ClamAV or similar
        warnings.push("Malware scanning not implemented");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        file: errors.length === 0
            ? {
                name: fileName,
                size: fileSize,
                mimeType,
                extension,
                hash: fileHash,
            }
            : undefined,
    };
}
/**
 * Validate magic bytes (file signature)
 */
async function validateMagicBytes(file, mimeType) {
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures || signatures.length === 0) {
        // No signature defined, skip validation
        return true;
    }
    try {
        // Read first 16 bytes
        const arrayBuffer = await file.slice(0, 16).arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const hex = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, "0").toUpperCase())
            .join("");
        // Check if file starts with any of the valid signatures
        return signatures.some(signature => hex.startsWith(signature));
    }
    catch (error) {
        console.error("Error validating magic bytes:", error);
        return false;
    }
}
/**
 * Check for dangerous content patterns
 */
async function checkDangerousContent(file) {
    const dangerous = [];
    try {
        // Read file as text to check for dangerous patterns
        const text = await file.text();
        // Check for script tags (XSS in SVG/HTML)
        if (/<script[^>]*>[\s\S]*?<\/script>/i.test(text)) {
            dangerous.push("script tags");
        }
        // Check for PHP code
        if (/<\?php/i.test(text)) {
            dangerous.push("PHP code");
        }
        // Check for executable content
        if (/\beval\s*\(/i.test(text)) {
            dangerous.push("eval() function");
        }
        // Check for data URIs in SVG
        if (file.type === "image/svg+xml" && /data:text\/html/i.test(text)) {
            dangerous.push("HTML data URI in SVG");
        }
        // Check for external references in SVG
        if (file.type === "image/svg+xml" &&
            /<use[^>]*xlink:href\s*=/i.test(text)) {
            dangerous.push("external references in SVG");
        }
    }
    catch (error) {
        // File is binary, cannot check for text patterns
    }
    return dangerous;
}
/**
 * Calculate SHA-256 hash of file
 */
async function calculateFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto_1.default.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
/**
 * Sanitize file name
 */
function sanitizeFileName(fileName) {
    return fileName
        .replace(/[^\w\s.-]/g, "") // Remove special characters except . - _
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/\.+/g, ".") // Replace multiple dots with single dot
        .substring(0, 255); // Limit length
}
/**
 * Get file extension
 */
function getFileExtension(fileName) {
    const lastDot = fileName.lastIndexOf(".");
    return lastDot !== -1 ? fileName.substring(lastDot) : "";
}
/**
 * Check for null byte injection
 */
function hasNullByte(str) {
    return str.includes("\0");
}
/**
 * Check for path traversal
 */
function hasPathTraversal(str) {
    return /\.\.[\/\\]/.test(str) || str.includes("../") || str.includes("..\\");
}
/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
/**
 * Generate secure random filename
 */
function generateSecureFileName(originalName) {
    const extension = getFileExtension(originalName);
    const timestamp = Date.now();
    const random = crypto_1.default.randomBytes(8).toString("hex");
    return `${timestamp}-${random}${extension}`;
}
