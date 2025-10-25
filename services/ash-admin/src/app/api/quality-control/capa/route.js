"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("order_id");
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const where = {};
        if (orderId)
            where.order_id = orderId;
        if (status && status !== "all")
            where.status = status;
        const capaTasks = await db_1.prisma.cAPATask.findMany({
            where,
            include: {
                order: { select: { order_number: true } },
                inspection: { select: { stage: true, result: true } }, // Changed from inspection_type to stage
                defect: { select: { severity: true, description: true } },
                assignee: { select: { first_name: true, last_name: true } },
                creator: { select: { first_name: true, last_name: true } },
                verifier: { select: { first_name: true, last_name: true } },
                attachments: true,
                updates: {
                    include: {
                        updater: { select: { first_name: true, last_name: true } },
                    },
                    orderBy: { updated_at: "desc" },
                },
            },
            orderBy: { created_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });
        return server_1.NextResponse.json({
            capa_tasks: capaTasks,
            pagination: {
                page,
                limit,
                total: await db_1.prisma.cAPATask.count({ where }),
            },
        });
    }
    catch (error) {
        console.error("Error fetching CAPA tasks:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch CAPA tasks" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        // Generate CAPA number
        const currentYear = new Date().getFullYear();
        const lastCapa = await db_1.prisma.cAPATask.findFirst({
            where: {
                capa_number: {
                    startsWith: `CAPA-${currentYear}-`,
                },
            },
            orderBy: { created_at: "desc" },
        });
        let nextNumber = 1;
        if (lastCapa) {
            const lastNumber = parseInt(lastCapa.capa_number.split("-").pop() || "0");
            nextNumber = lastNumber + 1;
        }
        const capaNumber = `CAPA-${currentYear}-${nextNumber.toString().padStart(4, "0")}`;
        const capaTask = await db_1.prisma.cAPATask.create({
            data: {
                workspace_id: data.workspace_id || "default",
                order_id: data.order_id,
                capa_number: capaNumber,
                title: data.title,
                type: data.type || "CORRECTIVE",
                priority: data.priority || "MEDIUM",
                source_type: data.source_type || "QC_INSPECTION",
                source_id: data.source_id,
                inspection_id: data.inspection_id,
                defect_id: data.defect_id,
                root_cause: data.root_cause,
                corrective_action: data.corrective_action,
                preventive_action: data.preventive_action,
                assigned_to: data.assigned_to,
                due_date: data.due_date ? new Date(data.due_date) : null,
                notes: data.notes,
                created_by: data.created_by,
            },
            include: {
                assignee: { select: { first_name: true, last_name: true } },
                creator: { select: { first_name: true, last_name: true } },
            },
        });
        return server_1.NextResponse.json(capaTask, { status: 201 });
    }
    catch (error) {
        console.error("Error creating CAPA task:", error);
        return server_1.NextResponse.json({ error: "Failed to create CAPA task" }, { status: 500 });
    }
});
