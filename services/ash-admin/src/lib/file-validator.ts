/**
 * Comprehensive File Upload Validator
 *
 * Implements multi-layer file validation:
 * - File size limits
 * - MIME type whitelist
 * - Extension validation
 * - Magic byte (file signature) verification
 * - Filename sanitization
 * - Path traversal prevention
 */

export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  spreadsheets: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  all: [] as string[], // Populated below
};

// Combine all allowed types
ALLOWED_FILE_TYPES.all = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.spreadsheets,
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILENAME_LENGTH = 255;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  fileInfo?: {
    originalName: string;
    size: number;
    mimeType: string;
    extension: string;
  };
}

/**
 * Magic bytes signatures for common file types
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [
    [0xff, 0xd8, 0xff, 0xe0], // JFIF
    [0xff, 0xd8, 0xff, 0xe1], // Exif
    [0xff, 0xd8, 0xff, 0xe2], // Canon
  ],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  "image/webp": [
    [
      0x52,
      0x49,
      0x46,
      0x46,
      undefined,
      undefined,
      undefined,
      undefined,
      0x57,
      0x45,
      0x42,
      0x50,
    ],
  ],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  "application/zip": [[0x50, 0x4b, 0x03, 0x04]], // Also covers DOCX, XLSX
};

/**
 * MIME type to file extension mapping
 */
const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx",
  ],
  "application/vnd.ms-excel": ["xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "text/csv": ["csv"],
};

/**
 * Validate file upload
 */
export async function validateFile(
  file: File,
  allowedTypes: string[] = ALLOWED_FILE_TYPES.all,
  maxSize: number = MAX_FILE_SIZE
): Promise<FileValidationResult> {
  // 1. Check if file exists
  if (!file) {
    return {
      valid: false,
      error: "No file provided",
    };
  }

  // 2. Validate file size
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds ${formatBytes(maxSize)} limit`,
    };
  }

  // 3. Validate MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // 4. Extract and validate file extension
  const ext = getFileExtension(file.name);
  if (!ext) {
    return {
      valid: false,
      error: "File has no extension",
    };
  }

  // 5. Verify extension matches MIME type
  const allowedExtensions = MIME_TO_EXTENSIONS[file.type] || [];
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension ".${ext}" does not match MIME type "${file.type}". Expected: ${allowedExtensions.map(e => `.${e}`).join(", ")}`,
    };
  }

  // 6. Validate magic bytes (file signature)
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (!validateMagicBytes(bytes, file.type)) {
    return {
      valid: false,
      error:
        "File signature does not match declared MIME type (possible file type spoofing)",
    };
  }

  // 7. Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);

  // 8. Additional security checks
  const securityCheck = performSecurityChecks(file.name, bytes);
  if (!securityCheck.valid) {
    return securityCheck;
  }

  return {
    valid: true,
    sanitizedName,
    fileInfo: {
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      extension: ext,
    },
  };
}

/**
 * Validate file magic bytes (signature)
 */
function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) {
    // No signature defined for this type, allow it
    return true;
  }

  // Check if bytes match any of the valid signatures
  return signatures.some(signature => {
    return signature.every((byte, index) => {
      // undefined means any byte is acceptable at this position
      return byte === undefined || bytes[index] === byte;
    });
  });
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string | null {
  const parts = filename.split(".");
  if (parts.length < 2) {
    return null;
  }
  return parts[parts.length - 1]!.toLowerCase();
}

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators (prevent directory traversal)
  let sanitized = filename.replace(/[\/\\]/g, "_");

  // Remove null bytes
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\x00/g, "");

  // Replace dangerous characters with underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Remove consecutive dots (prevent directory traversal)
  sanitized = sanitized.replace(/\.{2,}/g, ".");

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, "");

  // Limit filename length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf("."));
    const maxNameLength = MAX_FILENAME_LENGTH - (ext ? ext.length + 1 : 0);
    sanitized =
      nameWithoutExt.substring(0, maxNameLength) + (ext ? `.${ext}` : "");
  }

  // Ensure filename is not empty
  if (!sanitized || sanitized === ".") {
    sanitized = "file";
  }

  return sanitized;
}

/**
 * Generate a unique safe filename
 */
export function generateSafeFilename(
  originalName: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  const ext = getFileExtension(originalName) || "bin";
  const baseName = originalName.split(".")[0] || "file";
  const safeName = sanitizeFilename(baseName).substring(0, 30);

  const parts = [prefix, timestamp, randomString, safeName].filter(Boolean);
  return `${parts.join("_")}.${ext}`;
}

/**
 * Generate random string for filename
 */
function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i]! % chars.length];
  }

  return result;
}

/**
 * Perform additional security checks
 */
function performSecurityChecks(
  filename: string,
  bytes: Uint8Array
): FileValidationResult {
  // Check for PHP code in filename (double extension attack)
  if (/\.php\./i.test(filename)) {
    return {
      valid: false,
      error: "Suspicious filename detected",
    };
  }

  // Check for executable extensions
  const dangerousExtensions = [
    "exe",
    "com",
    "bat",
    "cmd",
    "sh",
    "bash",
    "ps1",
    "app",
    "deb",
    "rpm",
    "dmg",
    "pkg",
    "dll",
    "so",
    "jar",
    "js",
    "jsx",
    "ts",
    "tsx",
    "php",
    "asp",
    "aspx",
    "jsp",
    "py",
    "rb",
    "pl",
    "cgi",
  ];

  const ext = getFileExtension(filename);
  if (ext && dangerousExtensions.includes(ext)) {
    return {
      valid: false,
      error: "Executable file types are not allowed",
    };
  }

  // Check for embedded scripts in images (basic check)
  if (bytes.length > 100) {
    const sample = new TextDecoder().decode(bytes.slice(0, 1000));
    if (/<script/i.test(sample) || /<?php/i.test(sample)) {
      return {
        valid: false,
        error: "File contains suspicious content",
      };
    }
  }

  return { valid: true };
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Validate multiple files
 */
export async function validateFiles(
  files: File[],
  allowedTypes: string[] = ALLOWED_FILE_TYPES.all,
  maxSize: number = MAX_FILE_SIZE
): Promise<{ valid: boolean; results: FileValidationResult[] }> {
  const results = await Promise.all(
    files.map(file => validateFile(file, allowedTypes, maxSize))
  );

  const allValid = results.every(result => result.valid);

  return {
    valid: allValid,
    results,
  };
}

/**
 * Get allowed extensions for display
 */
export function getAllowedExtensions(allowedTypes: string[]): string[] {
  const extensions: string[] = [];

  for (const mimeType of allowedTypes) {
    const exts = MIME_TO_EXTENSIONS[mimeType];
    if (exts) {
      extensions.push(...exts);
    }
  }

  return [...new Set(extensions)].sort();
}
