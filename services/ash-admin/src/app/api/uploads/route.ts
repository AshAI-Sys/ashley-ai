import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// POST /api/uploads
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // TODO: Implement actual file upload to storage (S3, Cloudinary, etc.)
    // For now, return a mock successful upload response
    const mockFileUrl = `/uploads/${workspaceId}/${Date.now()}_${file.name}`;

    return NextResponse.json({
      success: true,
      file: {
        url: mockFileUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload file" },
      { status: 500 }
    );
  }
});
