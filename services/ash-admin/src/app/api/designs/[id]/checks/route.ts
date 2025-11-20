import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/designs/[id]/checks
// Get all file validation checks for a design asset
export const GET = requireAuth(async (
  req: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const id = context?.params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Design ID is required" },
        { status: 400 }
      );
    }

    const workspaceId = user.workspaceId;

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

    // Get all file validation checks for this design's versions
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
      issues_found: check.issues_found ? JSON.parse(check.issues_found) : [],
      validation_results: check.validation_results ? JSON.parse(check.validation_results) : null,
      auto_corrections: check.auto_corrections ? JSON.parse(check.auto_corrections) : [],
    }));

    // Calculate summary
    const summary = {
      total_checks: checksWithParsedData.length,
      passed: checksWithParsedData.filter((c) => c.print_ready).length,
      failed: checksWithParsedData.filter((c) => !c.print_ready).length,
      latest_check: checksWithParsedData[0] || null,
    };

    return NextResponse.json({
      success: true,
      checks: checksWithParsedData,
      summary,
    });
  } catch (error) {
    console.error("Checks fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
});

// POST /api/designs/[id]/checks
// Run validation checks on design files
export const POST = requireAuth(async (
  req: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const id = context?.params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Design ID is required" },
        { status: 400 }
      );
    }

    const workspaceId = user.workspaceId;
    const body = await req.json();
    const { design_version_id, file_url, file_type, file_size } = body;

    if (!design_version_id || !file_url || !file_type || !file_size) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: design_version_id, file_url, file_type, file_size",
        },
        { status: 400 }
      );
    }

    // Verify the design version exists
    const designVersion = await prisma.designVersion.findFirst({
      where: {
        id: design_version_id,
        asset_id: id,
      },
    });

    if (!designVersion) {
      return NextResponse.json(
        { success: false, message: "Design version not found" },
        { status: 404 }
      );
    }

    // Create the validation record
    const newCheck = await prisma.designFileValidation.create({
      data: {
        workspace_id: workspaceId,
        design_version_id,
        file_url,
        file_type,
        file_size,
        validation_status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      check: {
        ...newCheck,
        issues_found: newCheck.issues_found ? JSON.parse(newCheck.issues_found) : [],
        validation_results: newCheck.validation_results ? JSON.parse(newCheck.validation_results) : null,
      },
    });
  } catch (error) {
    console.error("Create check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
});
