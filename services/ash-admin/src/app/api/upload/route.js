"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const cloudinary_1 = require("cloudinary");
const auth_middleware_1 = require("@/lib/auth-middleware");
const file_validator_1 = require("@/lib/file-validator");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// POST /api/upload - Upload file to Cloudinary
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const folder = formData.get("folder") || "ashley-ai";
        const type = formData.get("type") || "image"; // image, document, video
        if (!file) {
            return server_1.NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        // Determine allowed file types based on upload type
        let allowedTypes = file_validator_1.ALLOWED_FILE_TYPES.all;
        if (type === "image") {
            allowedTypes = file_validator_1.ALLOWED_FILE_TYPES.images;
        }
        else if (type === "document") {
            allowedTypes = [
                ...file_validator_1.ALLOWED_FILE_TYPES.documents,
                ...file_validator_1.ALLOWED_FILE_TYPES.spreadsheets,
            ];
            // Validate file
            const validation = await (0, file_validator_1.validateFile)(file, allowedTypes, file_validator_1.MAX_FILE_SIZE);
            if (!validation.valid) {
                return server_1.NextResponse.json({
                    error: validation.error,
                    code: "FILE_VALIDATION_FAILED",
                }, { status: 400 });
            }
            // Check if Cloudinary is configured
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
                return server_1.NextResponse.json({
                    error: "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
                    configuration_needed: true,
                }, { status: 503 });
            }
            // Generate safe filename
            const safeFilename = (0, file_validator_1.generateSafeFilename)(file.name, folder);
            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            // Upload to Cloudinary with safe filename
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: folder,
                    public_id: safeFilename.split(".")[0], // Remove extension, Cloudinary adds it
                    resource_type: type === "document" ? "raw" : "auto",
                    transformation: type === "image"
                        ? [{ quality: "auto", fetch_format: "auto" }]
                        : undefined,
                }, (error, result) => {
                    ;
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                uploadStream.end(buffer);
                return server_1.NextResponse.json({
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    resource_type: result.resource_type,
                    width: result.width,
                    height: result.height,
                    bytes: result.bytes,
                    created_at: result.created_at,
                });
                try { }
                catch (error) {
                    console.error("Error uploading file:", error);
                    return server_1.NextResponse.json({
                        error: "Failed to upload file",
                        details: error.message,
                    }, { status: 500 });
                }
                // DELETE /api/upload - Delete file from Cloudinary
                export const DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
                    try {
                        const { searchParams } = new URL(request.url);
                        const publicId = searchParams.get("public_id");
                        if (!publicId) {
                            return server_1.NextResponse.json({ error: "public_id is required" }, { status: 400 });
                        }
                        const result = await cloudinary_1.v2.uploader.destroy(publicId);
                        return server_1.NextResponse.json({
                            success: result.result === "ok",
                            result: result.result,
                        });
                    }
                    catch (error) {
                        console.error("Error deleting file:", error);
                        return server_1.NextResponse.json({
                            error: "Failed to delete file",
                            details: error.message,
                        }, { status: 500 });
                    }
                    // GET /api/upload - Check upload configuration status
                    export async function GET() {
                        return server_1.NextResponse.json({
                            configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
                            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
                        });
                    }
                });
            });
        }
    }
    finally {
    }
});
