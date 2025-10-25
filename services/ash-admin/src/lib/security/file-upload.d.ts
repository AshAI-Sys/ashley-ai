/**
 * File upload security configuration
 */
export interface FileUploadConfig {
    /**
     * Maximum file size in bytes (default: 10MB)
     */
    maxSize?: number;
    /**
     * Allowed MIME types
     */
    allowedMimeTypes?: string[];
    /**
     * Allowed file extensions
     */
    allowedExtensions?: string[];
    /**
     * Validate file content (magic bytes)
     */
    validateMagicBytes?: boolean;
    /**
     * Scan for malware (requires ClamAV or similar)
     */
    scanMalware?: boolean;
}
/**
 * Default configuration for image uploads
 */
export declare const IMAGE_UPLOAD_CONFIG: FileUploadConfig;
/**
 * Default configuration for document uploads
 */
export declare const DOCUMENT_UPLOAD_CONFIG: FileUploadConfig;
/**
 * Validation result
 */
export interface FileValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    file?: {
        name: string;
        size: number;
        mimeType: string;
        extension: string;
        hash: string;
    };
}
/**
 * Validate uploaded file
 */
export declare function validateFileUpload(file: File, config?: FileUploadConfig): Promise<FileValidationResult>;
/**
 * Sanitize file name
 */
export declare function sanitizeFileName(fileName: string): string;
/**
 * Generate secure random filename
 */
export declare function generateSecureFileName(originalName: string): string;
