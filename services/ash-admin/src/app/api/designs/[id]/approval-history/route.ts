import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guards";

// GET /api/designs/[id]/approval-history
// Get all approval history for a design asset
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

      // Get all approval records for this design
      const approvals = await prisma.designApproval.findMany({
        where: {
          design_id: id,
        },
        orderBy: {
          sent_at: "desc",
        },
      });

      // Calculate summary statistics
      const summary = {
        total_approvals: approvals.length,
        pending: approvals.filter((a) => a.status === "PENDING").length,
        approved: approvals.filter((a) => a.status === "APPROVED").length,
        rejected: approvals.filter((a) => a.status === "REJECTED").length,
        latest_status: approvals[0]?.status || null,
      };

      return NextResponse.json({
        success: true,
        approvals,
        summary,
      });
    } catch (error) {
      console.error("Approval history fetch error:", error);
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
