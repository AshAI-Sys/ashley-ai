import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import {
  validateFile,
  generateSafeFilename,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/file-validator";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "ashley-ai";
    const type = (formData.get("type") as string) || "image"; // image, document, video

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine allowed file types based on upload type
    let allowedTypes: string[] = ALLOWED_FILE_TYPES.all;
    if (type === "image") {
      allowedTypes = ALLOWED_FILE_TYPES.images;
    } else if (type === "document") {
      allowedTypes = [
        ...ALLOWED_FILE_TYPES.documents,
        ...ALLOWED_FILE_TYPES.spreadsheets,
      ];
    }

    // Validate file
    const validation = await validateFile(file, allowedTypes, MAX_FILE_SIZE);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: "FILE_VALIDATION_FAILED",
        },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
          configuration_needed: true,
        },
        { status: 503 }
      );
    }

    // Generate safe filename
    const safeFilename = generateSafeFilename(file.name, folder);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with safe filename
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: safeFilename.split(".")[0], // Remove extension, Cloudinary adds it
          resource_type: type === "document" ? "raw" : "auto",
          transformation:
            type === "image"
              ? [{ quality: "auto", fetch_format: "auto" }]
              : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete file from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("public_id");

    if (!publicId) {
      return NextResponse.json(
        { error: "public_id is required" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: result.result === "ok",
      result: result.result,
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        error: "Failed to delete file",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/upload - Check upload configuration status
export async function GET() {
  return NextResponse.json({
    configured: !!(
      process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
    ),
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
  });
}
