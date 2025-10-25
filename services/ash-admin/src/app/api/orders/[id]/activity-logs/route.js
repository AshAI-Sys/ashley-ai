"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
/* eslint-disable */
const server_1 = require("next/server");
const zod_1 = require("zod");
const db_1 = require("@/lib/db");
const workspace_1 = require("@/lib/workspace");
const ActivityLogSchema = zod_1.z.object({
    event_type: zod_1.z.string().min(1, "Event type is required"),
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().optional(),
    performed_by: zod_1.z.string().optional(),
    metadata: zod_1.z.string().optional(), // JSON string
});
async function GET(request, { params }) {
    try {
        const orderId = params.id;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const activities = await db_1.prisma.orderActivityLog.findMany({
            where: {
                order_id: orderId,
            },
            orderBy: {
                created_at: "desc",
            },
            take: limit,
            return: server_1.NextResponse.json({
                success: true,
                data: { activities },
            })
        });
        try { }
        catch (error) {
            console.error("Error fetching activity logs:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to fetch activity logs" }, { status: 500 });
        }
        export async function POST(request, { params }) {
            try {
                const workspaceId = (0, workspace_1.getWorkspaceIdFromRequest)(request);
                const orderId = params.id;
                const body = await request.json();
                const validatedData = ActivityLogSchema.parse(body);
                const activityLog = await db_1.prisma.orderActivityLog.create({
                    data: {
                        workspace_id: workspaceId,
                        order_id: orderId,
                        event_type: validatedData.event_type,
                        title: validatedData.title,
                        description: validatedData.description || null,
                        performed_by: validatedData.performed_by || null,
                        metadata: validatedData.metadata || null,
                    },
                });
                return server_1.NextResponse.json({
                    success: true,
                    data: { activityLog },
                    message: "Activity log created successfully",
                }, { status: 201 });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    return server_1.NextResponse.json({
                        success: false,
                        error: "Validation failed",
                        details: error.errors,
                    }, { status: 400 });
                }
                console.error("Error creating activity log:", error);
                return server_1.NextResponse.json({ success: false, error: "Failed to create activity log" }, { status: 500 });
            }
        }
        ;
    }
    finally { }
}
