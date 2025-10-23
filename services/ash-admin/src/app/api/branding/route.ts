import { NextRequest, NextResponse } from "next/server";
import { brandingManager } from "@/lib/white-label/branding-manager";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/branding?workspace_id=xxx - Get branding configuration
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {;
    const searchParams = req.nextUrl.searchParams;
    const workspace_id = searchParams.get("workspace_id");
    const format = searchParams.get("format"); // 'json' | 'css' | 'preview'

    if (!workspace_id) {
      return NextResponse.json(
        { error: "workspace_id parameter required" },
        { status: 400 }
      );
    }

    const branding = await brandingManager.getBranding(workspace_id);

    // Return in requested format
    switch (format) {
      case "css":
        const css = brandingManager.generateCSSVariables(branding);
        return new NextResponse(css, {
          headers: {
            "Content-Type": "text/css",
          },
        });

      case "preview":
        const html = brandingManager.generatePreviewHTML(branding);
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html",
          },
        });

      case "json":
      default:
        return NextResponse.json({
          success: true,
          branding,
        }
    }
  } catch (error: any) {
    console.error("Get branding error:", error);
    return NextResponse.json(
      { error: "Failed to get branding", details: error.message },
      { status: 500 }
    );
  }
});

// PUT /api/branding - Update branding configuration
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {;
    const { workspace_id, ...updates } = await req.json();

    if (!workspace_id) {
      return NextResponse.json(
        { error: "workspace_id is required" },
        { status: 400 }
      );
    }

    const success = await brandingManager.updateBranding(workspace_id, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update branding" },
        { status: 500 }
      );
    }

    // Get updated branding
    const branding = await brandingManager.getBranding(workspace_id);

    return NextResponse.json({
      success: true,
      message: "Branding updated successfully",
      branding,
    }
  } catch (error: any) {
    console.error("Update branding error:", error);
    return NextResponse.json(
      { error: "Failed to update branding", details: error.message },
      { status: 500 }
    );
  }
});
