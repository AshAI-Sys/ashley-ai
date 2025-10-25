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
export declare const ALLOWED_FILE_TYPES: {
    images: string[];
    documents: string[];
    spreadsheets: string[];
    all: string[];
};
export declare const MAX_FILE_SIZE: number;
export declare const MAX_FILENAME_LENGTH = 255;
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
 * Validate file upload
 */
export declare function validateFile(file: File, allowedTypes?: string[], maxSize?: number): Promise<FileValidationResult>;
/**
 * Sanitize filename to prevent security issues
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Generate a unique safe filename
 */
export declare function generateSafeFilename(originalName: string, prefix?: string): string;
/**
 * Validate multiple files
 */
export declare function validateFiles(files: File[], allowedTypes?: string[], maxSize?: number): Promise<{
    valid: boolean;
    results: FileValidationResult[];
}>;
/**
 * Get allowed extensions for display
 */
export declare function getAllowedExtensions(allowedTypes: string[]): string[];
