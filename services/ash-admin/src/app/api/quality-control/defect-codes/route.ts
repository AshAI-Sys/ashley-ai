import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// GET /api/quality-control/defect-codes
export const GET = requireAuth(async (request, user) => {
  try {
    const workspaceId = user.workspaceId;

    // Return standard defect codes
    const defectCodes = [
      { id: "1", code: "SEW-001", name: "Broken Stitch", severity: "MAJOR", category: "SEWING", description: "Stitch is broken or skipped" },
      { id: "2", code: "SEW-002", name: "Uneven Seam", severity: "MINOR", category: "SEWING", description: "Seam is not straight or even" },
      { id: "3", code: "FAB-001", name: "Fabric Hole", severity: "CRITICAL", category: "FABRIC", description: "Hole or tear in fabric" },
      { id: "4", code: "FAB-002", name: "Color Variation", severity: "MAJOR", category: "FABRIC", description: "Fabric color does not match specification" },
      { id: "5", code: "PRINT-001", name: "Print Misalignment", severity: "MAJOR", category: "PRINTING", description: "Print is not aligned correctly" },
      { id: "6", code: "PRINT-002", name: "Incomplete Print", severity: "CRITICAL", category: "PRINTING", description: "Print is incomplete or missing" },
      { id: "7", code: "CUT-001", name: "Incorrect Cut", severity: "MAJOR", category: "CUTTING", description: "Piece is cut incorrectly" },
      { id: "8", code: "MEAS-001", name: "Measurement Off", severity: "MAJOR", category: "MEASUREMENT", description: "Measurements do not meet specifications" },
      { id: "9", code: "FIN-001", name: "Loose Thread", severity: "MINOR", category: "FINISHING", description: "Loose threads not trimmed" },
      { id: "10", code: "PKG-001", name: "Packaging Damage", severity: "MINOR", category: "PACKAGING", description: "Packaging is damaged or dirty" },
    ];

    return NextResponse.json(defectCodes);
  } catch (error) {
    console.error("Defect codes fetch error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch defect codes" }, { status: 500 });
  }
});
