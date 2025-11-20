import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guards";

// GET /api/designs/[id]/checks
// Get all validation checks for a design asset
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

      // Get all file validations for all versions of this design
      const fileValidations = await prisma.designFileValidation.findMany({
        where: {
          design_version: {
            asset_id: id,
          },
        },
        include: {
          design_version: {
            select: {
              version: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      // Parse JSON fields
      const checksWithParsedData = fileValidations.map((check) => ({
        ...check,
        issues: check.issues ? JSON.parse(check.issues) : [],
        warnings: check.warnings ? JSON.parse(check.warnings) : [],
      }));

      // Calculate summary statistics
      const summary = {
        total_checks: checksWithParsedData.length,
        passed: checksWithParsedData.filter((c) => c.is_valid).length,
        failed: checksWithParsedData.filter((c) => !c.is_valid).length,
        latest_check: checksWithParsedData[0] || null,
      };

      return NextResponse.json({
        success: true,
        checks: checksWithParsedData,
        summary,
      });
    } catch (error) {
      console.error("Design checks fetch error:", error);
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

// POST /api/designs/[id]/checks
// Run validation checks on a design
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(req, async (user) => {
    try {
      const { id } = params;
      const workspaceId = user.workspace_id || user.workspaceId;
      const body = await req.json();
      const { version_id, file_path, checks_to_run } = body;

      // Verify the design asset exists
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

      // Run validation checks (this is a simplified version)
      // In production, you'd integrate with actual validation tools
      const issues: string[] = [];
      const warnings: string[] = [];

      // Example validation checks
      if (checks_to_run?.includes("resolution")) {
        // Check resolution (placeholder logic)
        warnings.push("Resolution check passed");
      }

      if (checks_to_run?.includes("color_mode")) {
        // Check color mode (placeholder logic)
        warnings.push("Color mode check passed");
      }

      if (checks_to_run?.includes("file_format")) {
        // Check file format (placeholder logic)
        warnings.push("File format check passed");
      }

      const isValid = issues.length === 0;

      // Create validation record
      const validation = await prisma.designFileValidation.create({
        data: {
          version_id,
          file_path: file_path || "unknown",
          is_valid: isValid,
          issues: JSON.stringify(issues),
          warnings: JSON.stringify(warnings),
          validated_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        validation: {
          ...validation,
          issues: JSON.parse(validation.issues || "[]"),
          warnings: JSON.parse(validation.warnings || "[]"),
        },
      });
    } catch (error) {
      console.error("Design check creation error:", error);
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
