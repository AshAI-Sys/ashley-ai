export interface UploadOptions {
    folder?: string;
    fileName?: string;
    contentType?: string;
    makePublic?: boolean;
}
export interface UploadResult {
    key: string;
    url: string;
    size: number;
    contentType: string;
}
export declare class StorageService {
    private s3Client;
    private bucket;
    private provider;
    private uploadDir;
    constructor();
    /**
     * Generate a unique file key with optional folder structure
     */
    private generateFileKey;
    /**
     * Upload a file to storage (S3, Cloudflare R2, or local filesystem)
     */
    upload(file: Buffer | Uint8Array, originalName: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Upload to local filesystem
     */
    private uploadLocal;
    /**
     * Upload to S3 or Cloudflare R2
     */
    private uploadS3;
    /**
     * Get a signed URL for private file access
     */
    getSignedUrl(fileKey: string, expiresIn?: number): Promise<string>;
    /**
     * Get public URL for a file
     */
    getPublicUrl(fileKey: string): string;
    /**
     * Delete a file from storage
     */
    delete(fileKey: string): Promise<boolean>;
    /**
     * Check if a file exists
     */
    exists(fileKey: string): Promise<boolean>;
    /**
     * Guess content type from file extension
     */
    private guessContentType;
}
export declare const storageService: StorageService;
