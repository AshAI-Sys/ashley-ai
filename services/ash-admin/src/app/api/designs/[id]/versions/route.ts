import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guards";

// GET /api/designs/[id]/versions
// Get all versions of a design asset
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(req, async (user) => {
    try {
      const { id } = params;
      const workspaceId = user.workspace_id || user.workspaceId;

      // First verify the design asset exists and belongs to this workspace
      const designAsset = await prisma.designAsset.findFirst({
        where: {
          id,
          workspace_id: workspaceId,
        },
      });

      if (!designAsset) {
        return NextResponse.json(
          { success: false, message: "Design not found" },
          { status: 404 }
        );
      }

      // Get all versions of this design
      const versions = await prisma.designVersion.findMany({
        where: {
          asset_id: id,
        },
        orderBy: {
          version: "desc",
        },
        include: {
          comments: {
            orderBy: {
              created_at: "desc",
            },
          },
          file_validations: true,
          mockups: true,
        },
      });

      // Parse JSON fields for each version
      const versionsWithParsedData = versions.map((v) => ({
        ...v,
        files: JSON.parse(v.files || "[]"),
        placements: JSON.parse(v.placements || "[]"),
        palette: v.palette ? JSON.parse(v.palette) : null,
        meta: v.meta ? JSON.parse(v.meta) : null,
      }));

      return NextResponse.json({
        success: true,
        versions: versionsWithParsedData,
        current_version: designAsset.current_version,
      });
    } catch (error) {
      console.error("Design versions fetch error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  });
}

// POST /api/designs/[id]/versions
// Create a new version of a design asset
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(req, async (user) => {
    try {
      const { id } = params;
      const workspaceId = user.workspace_id || user.workspaceId;
      const userId = user.id || user.user_id;

      // First verify the design asset exists and belongs to this workspace
      const designAsset = await prisma.designAsset.findFirst({
        where: {
          id,
          workspace_id: workspaceId,
        },
      });

      if (!designAsset) {
        return NextResponse.json(
          { success: false, message: "Design not found" },
          { status: 404 }
        );
      }

      const body = await req.json();
      const { files, placements, palette, meta } = body;

      // Get the next version number
      const latestVersion = await prisma.designVersion.findFirst({
        where: { asset_id: id },
        orderBy: { version: "desc" },
      });

      const nextVersion = (latestVersion?.version || 0) + 1;

      // Create new version
      const newVersion = await prisma.designVersion.create({
        data: {
          asset_id: id,
          version: nextVersion,
          files: JSON.stringify(files || []),
          placements: JSON.stringify(placements || []),
          palette: palette ? JSON.stringify(palette) : null,
          meta: meta ? JSON.stringify(meta) : null,
          created_by: userId,
        },
        include: {
          file_validations: true,
          mockups: true,
        },
      });

      // Update the design asset's current version
      await prisma.designAsset.update({
        where: { id },
        data: { current_version: nextVersion },
      });

      return NextResponse.json({
        success: true,
        message: `Version ${nextVersion} created successfully`,
        version: {
          ...newVersion,
          files: JSON.parse(newVersion.files || "[]"),
          placements: JSON.parse(newVersion.placements || "[]"),
          palette: newVersion.palette ? JSON.parse(newVersion.palette) : null,
          meta: newVersion.meta ? JSON.parse(newVersion.meta) : null,
        },
      });
    } catch (error) {
      console.error("Design version creation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  });
}
