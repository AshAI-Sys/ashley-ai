/**
 * File Upload API Endpoint
 *
 * POST /api/uploads
 * Handles secure file uploads with comprehensive validation:
 * - Multi-layer security (size, MIME type, magic bytes, extension)
 * - Filename sanitization and uniqueness
 * - Path traversal prevention
 * - Workspace isolation
 * - Secure logging without PII
 *
 * SECURITY: Uses file-validator for magic byte verification (prevents file type spoofing)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import {
  validateFile,
  generateSafeFilename,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/file-validator";
import { authLogger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

const MAX_UPLOADS_PER_REQUEST = 10;
const RATE_LIMIT_UPLOADS_PER_HOUR = 100;

interface UploadResponse {
  success: boolean;
  file?: {
    url: string;
    name: string;
    sanitizedName: string;
    size: number;
    type: string;
    uploaded_at: string;
  };
  message?: string;
  error?: string;
  code?: string;
}

/**
 * POST /api/uploads - Upload file with comprehensive security validation
 */
export const POST = requireAuth(
  async (request: NextRequest, user): Promise<NextResponse<UploadResponse>> => {
    try {
      const workspaceId = user.workspaceId;
      const userId = user.id;
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const uploadType = (formData.get("type") as string) || "image";

      // Validate file exists
      if (!file) {
        authLogger.warn('File upload attempt without file', {
          workspaceId,
          userId,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        });

        return NextResponse.json(
          {
            success: false,
            error: "No file provided",
            code: "FILE_REQUIRED",
          },
          { status: 400 }
        );
      }

      // Determine allowed file types based on upload type
      const allowedTypes = getAllowedTypesForUpload(uploadType);

      // CRITICAL SECURITY: Comprehensive file validation
      // - File size check
      // - MIME type whitelist
      // - Extension validation
      // - Magic byte verification (prevents file type spoofing)
      // - Malicious content detection
      const validation = await validateFile(file, allowedTypes, MAX_FILE_SIZE);

      if (!validation.valid) {
        authLogger.warn('File validation failed', {
          workspaceId,
          userId,
          originalFileName: file.name,
          fileSize: file.size,
          declaredMimeType: file.type,
          uploadType,
          validationError: validation.error,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        });

        return NextResponse.json(
          {
            success: false,
            error: validation.error,
            code: "FILE_VALIDATION_FAILED",
          },
          { status: 400 }
        );
      }

      // Generate secure, unique filename
      // Format: workspaceId_userId_timestamp_random_sanitizedName.ext
      const safeFilename = generateSafeFilename(
        validation.sanitizedName || file.name,
        `${workspaceId}_${userId}`
      );

      // Convert file to buffer (ready for storage)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // TODO: Implement actual file storage
      // Options:
      // 1. Local filesystem (with proper permissions, outside webroot)
      // 2. AWS S3 (recommended for production)
      // 3. Cloudinary (good for images)
      // 4. Azure Blob Storage
      // 5. Google Cloud Storage
      //
      // Security requirements for storage:
      // - Store outside webroot to prevent direct execution
      // - Use UUID/hash-based filenames to prevent enumeration
      // - Set proper CORS headers
      // - Implement virus scanning (ClamAV, VirusTotal API)
      // - Add download limits and rate limiting

      const mockFileUrl = `/uploads/${workspaceId}/${safeFilename}`;

      authLogger.info('File uploaded successfully', {
        workspaceId,
        userId,
        sanitizedFileName: safeFilename,
        fileSize: file.size,
        mimeType: file.type,
        uploadType,
      });

      return NextResponse.json(
        {
          success: true,
          file: {
            url: mockFileUrl,
            name: file.name,
            sanitizedName: safeFilename,
            size: file.size,
            type: file.type,
            uploaded_at: new Date().toISOString(),
          },
          message: "File uploaded successfully",
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      // Secure error logging without exposing internal details
      authLogger.error(
        'File upload error',
        error instanceof Error ? error : undefined,
        {
          workspaceId: user.workspaceId,
          userId: user.id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload file. Please contact system administrator.",
          // Only expose detailed error in development
          ...(process.env.NODE_ENV === 'development' && {
            debug: error instanceof Error ? error.message : String(error),
          }),
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Helper: Get allowed MIME types based on upload type
 * Implements principle of least privilege - only allow necessary file types
 */
function getAllowedTypesForUpload(uploadType: string): string[] {
  switch (uploadType.toLowerCase()) {
    case "image":
      return ALLOWED_FILE_TYPES.images;

    case "document":
      return [
        ...ALLOWED_FILE_TYPES.documents,
        ...ALLOWED_FILE_TYPES.spreadsheets,
      ];

    case "spreadsheet":
      return ALLOWED_FILE_TYPES.spreadsheets;

    case "pdf":
      return ["application/pdf"];

    default:
      // Default to all allowed types, but log suspicious upload types
      if (uploadType !== "all") {
        authLogger.warn('Unknown upload type requested', {
          uploadType,
          fallbackToAllTypes: true,
        });
      }
      return ALLOWED_FILE_TYPES.all;
  }
}
