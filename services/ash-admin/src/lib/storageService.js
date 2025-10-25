"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class StorageService {
    constructor() {
        this.s3Client = null;
        this.provider = process.env.ASH_STORAGE_PROVIDER || "local";
        this.bucket = process.env.ASH_AWS_BUCKET || "ash-ai-files";
        this.uploadDir = process.env.UPLOAD_DIR || "./uploads";
        // Initialize S3 client for AWS or Cloudflare R2
        if (this.provider === "aws" || this.provider === "cloudflare") {
            const endpoint = this.provider === "cloudflare"
                ? process.env.CLOUDFLARE_R2_ENDPOINT
                : undefined;
            this.s3Client = new client_s3_1.S3Client({
                region: process.env.ASH_AWS_REGION || "ap-southeast-1",
                endpoint,
                credentials: {
                    accessKeyId: process.env.ASH_AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: process.env.ASH_AWS_SECRET_ACCESS_KEY || "",
                },
            });
        }
    }
    /**
     * Generate a unique file key with optional folder structure
     */
    generateFileKey(originalName, folder) {
        const ext = path_1.default.extname(originalName);
        const randomId = (0, crypto_1.randomBytes)(16).toString("hex");
        const timestamp = Date.now();
        const fileName = `${timestamp}-${randomId}${ext}`;
        return folder ? `${folder}/${fileName}` : fileName;
    }
    /**
     * Upload a file to storage (S3, Cloudflare R2, or local filesystem)
     */
    async upload(file, originalName, options = {}) {
        const fileKey = options.fileName || this.generateFileKey(originalName, options.folder);
        const contentType = options.contentType || this.guessContentType(originalName);
        if (this.provider === "local") {
            return this.uploadLocal(file, fileKey, contentType);
        }
        else if (this.s3Client) {
            return this.uploadS3(file, fileKey, contentType, options.makePublic);
        }
        else {
            throw new Error("Storage provider not configured");
        }
    }
    /**
     * Upload to local filesystem
     */
    async uploadLocal(file, fileKey, contentType) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        const dir = path_1.default.dirname(filePath);
        // Ensure directory exists
        await promises_1.default.mkdir(dir, { recursive: true });
        // Write file
        await promises_1.default.writeFile(filePath, file);
        return {
            key: fileKey,
            url: `/uploads/${fileKey}`,
            size: file.length,
            contentType,
        };
    }
    /**
     * Upload to S3 or Cloudflare R2
     */
    async uploadS3(file, fileKey, contentType, makePublic) {
        if (!this.s3Client) {
            throw new Error("S3 client not initialized");
        }
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
            Body: file,
            ContentType: contentType,
            ACL: makePublic ? "public-read" : "private",
        });
        await this.s3Client.send(command);
        // Generate URL
        const url = makePublic
            ? this.getPublicUrl(fileKey)
            : await this.getSignedUrl(fileKey, 3600); // 1 hour expiry
        return {
            key: fileKey,
            url,
            size: file.length,
            contentType,
        };
    }
    /**
     * Get a signed URL for private file access
     */
    async getSignedUrl(fileKey, expiresIn = 3600) {
        if (this.provider === "local") {
            return `/uploads/${fileKey}`;
        }
        if (!this.s3Client) {
            throw new Error("S3 client not initialized");
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    /**
     * Get public URL for a file
     */
    getPublicUrl(fileKey) {
        if (this.provider === "local") {
            return `/uploads/${fileKey}`;
        }
        if (this.provider === "cloudflare") {
            const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
            return `https://${accountId}.r2.cloudflarestorage.com/${this.bucket}/${fileKey}`;
        }
        // AWS S3
        const region = process.env.ASH_AWS_REGION || "ap-southeast-1";
        return `https://${this.bucket}.s3.${region}.amazonaws.com/${fileKey}`;
    }
    /**
     * Delete a file from storage
     */
    async delete(fileKey) {
        try {
            if (this.provider === "local") {
                const filePath = path_1.default.join(this.uploadDir, fileKey);
                await promises_1.default.unlink(filePath);
                return true;
            }
            if (!this.s3Client) {
                throw new Error("S3 client not initialized");
            }
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            console.error("Error deleting file:", error);
            return false;
        }
    }
    /**
     * Check if a file exists
     */
    async exists(fileKey) {
        try {
            if (this.provider === "local") {
                const filePath = path_1.default.join(this.uploadDir, fileKey);
                await promises_1.default.access(filePath);
                return true;
            }
            if (!this.s3Client) {
                throw new Error("S3 client not initialized");
            }
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Guess content type from file extension
     */
    guessContentType(fileName) {
        const ext = path_1.default.extname(fileName).toLowerCase();
        const mimeTypes = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls": "application/vnd.ms-excel",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".zip": "application/zip",
            ".txt": "text/plain",
            ".csv": "text/csv",
            ".json": "application/json",
            ".xml": "application/xml",
            ".ai": "application/postscript",
            ".psd": "image/vnd.adobe.photoshop",
        };
        return mimeTypes[ext] || "application/octet-stream";
    }
}
exports.StorageService = StorageService;
// Singleton instance
exports.storageService = new StorageService();
