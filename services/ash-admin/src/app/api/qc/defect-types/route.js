"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// GET /api/qc/defect-types - Get all defect types
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const workspaceId = req.headers.get("x-workspace-id") || "default-workspace";
        const defectTypes = await prisma.qCDefectType.findMany({
            where: {
                workspace_id: workspaceId,
                // QCDefectType doesn't have is_active field - removed
            },
            orderBy: {
                name: "asc", // Changed from 'code' to 'name' (code doesn't exist);
            },
        });
        // If no defect types exist, return default ones
        if (defectTypes.length === 0) {
            const defaultDefectTypes = [
                {
                    id: "def-1",
                    code: "SEW-001",
                    name: "Broken Stitch",
                    description: "Stitching is broken or incomplete",
                    default_severity: "MAJOR",
                    category: "SEWING",
                },
                {
                    id: "def-2",
                    code: "SEW-002",
                    name: "Uneven Seam",
                    description: "Seam is not straight or even",
                    default_severity: "MINOR",
                    category: "SEWING",
                },
                {
                    id: "def-3",
                    code: "FAB-001",
                    name: "Fabric Hole",
                    description: "Hole or tear in fabric",
                    default_severity: "CRITICAL",
                    category: "FABRIC",
                },
                {
                    id: "def-4",
                    code: "FAB-002",
                    name: "Stain/Mark",
                    description: "Stain or mark on fabric",
                    default_severity: "MAJOR",
                    category: "FABRIC",
                },
                {
                    id: "def-5",
                    code: "PRINT-001",
                    name: "Misaligned Print",
                    description: "Print is not aligned correctly",
                    default_severity: "MAJOR",
                    category: "PRINTING",
                },
                {
                    id: "def-6",
                    code: "PRINT-002",
                    name: "Faded Print",
                    description: "Print color is faded or incomplete",
                    default_severity: "MINOR",
                    category: "PRINTING",
                },
                {
                    id: "def-7",
                    code: "CUT-001",
                    name: "Wrong Size",
                    description: "Cut piece is wrong size",
                    default_severity: "CRITICAL",
                    category: "CUTTING",
                },
                {
                    id: "def-8",
                    code: "FIN-001",
                    name: "Missing Label",
                    description: "Label is missing",
                    default_severity: "MAJOR",
                    category: "FINISHING",
                },
                {
                    id: "def-9",
                    code: "FIN-002",
                    name: "Loose Thread",
                    description: "Loose threads not trimmed",
                    default_severity: "MINOR",
                    category: "FINISHING",
                },
                {
                    id: "def-10",
                    code: "GEN-001",
                    name: "Other Defect",
                    description: "Other quality issue",
                    default_severity: "MINOR",
                    category: "GENERAL",
                },
            ];
            return server_1.NextResponse.json({
                success: true,
                defectTypes: defaultDefectTypes,
            });
        }
        return server_1.NextResponse.json({
            success: true,
            defectTypes,
        });
    }
    catch (error) {
        console.error("Defect types fetch error:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
