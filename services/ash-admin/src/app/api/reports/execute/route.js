"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/reports/execute - Execute a report and return data
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const workspaceId = req.headers.get("x-workspace-id") || "default-workspace";
        const userId = req.headers.get("x-user-id") || "system";
        const body = await req.json();
        const { report_id, filters: additionalFilters } = body;
        if (!report_id) {
            return server_1.NextResponse.json({ success: false, error: "Report ID is required" }, { status: 400 });
        }
        const startTime = Date.now();
        // Fetch report configuration
        const report = await prisma.customReport.findFirst({
            where: {
                id: report_id,
                workspace_id: workspaceId,
            },
        });
        if (!report) {
            return server_1.NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
        }
        const queryConfig = JSON.parse(report.query_config);
        const reportFilters = report.filters ? JSON.parse(report.filters) : [];
        const sortOrder = report.sort_order ? JSON.parse(report.sort_order) : null;
        // Build query based on data source
        let data = [];
        let rowCount = 0;
        try {
            switch (report.data_source) {
                case "ORDERS":
                    data = await executeOrdersQuery(workspaceId, queryConfig, [...reportFilters, ...(additionalFilters || [])], sortOrder);
                    break;
                case "PRODUCTION":
                    data = await executeProductionQuery(workspaceId, queryConfig, [...reportFilters, ...(additionalFilters || [])], sortOrder);
                    break;
                case "FINANCE":
                    data = await executeFinanceQuery(workspaceId, queryConfig, [...reportFilters, ...(additionalFilters || [])], sortOrder);
                    break;
                case "HR":
                    data = await executeHRQuery(workspaceId, queryConfig, [...reportFilters, ...(additionalFilters || [])], sortOrder);
                    break;
                case "INVENTORY":
                    data = await executeInventoryQuery(workspaceId, queryConfig, [...reportFilters, ...(additionalFilters || [])], sortOrder);
                    break;
                case "QUALITY":
                    data = await executeQualityQuery(workspaceId, queryConfig, [...reportFilters, ...(additionalFilters || [])], sortOrder);
                    break;
            }
            break;
        }
        finally {
        }
    }
    finally {
    }
});
throw new Error(`Unsupported data source: ${report.data_source}`);
rowCount = data.length;
const executionTime = Date.now() - startTime;
// Log execution
await prisma.reportExecution.create({
    data: {
        report_id,
        workspace_id: workspaceId,
        executed_by: userId,
        execution_time: executionTime,
        row_count: rowCount,
        status: "SUCCESS",
        filters_applied: JSON.stringify([
            ...reportFilters,
            ...(additionalFilters || []),
        ]),
    },
});
// Update view count
await prisma.customReport.update({
    where: { id: report_id },
    data: {
        view_count: { increment: 1 },
    },
});
return server_1.NextResponse.json({
    success: true,
    data,
    metadata: {
        row_count: rowCount,
        execution_time: executionTime,
        filters_applied: [...reportFilters, ...(additionalFilters || [])],
    },
});
try { }
catch (queryError) {
    const executionTime = Date.now() - startTime;
    // Log failed execution
    await prisma.reportExecution.create({
        data: {
            report_id,
            workspace_id: workspaceId,
            executed_by: userId,
            execution_time: executionTime,
            row_count: 0,
            status: "FAILED",
            error_message: queryError.message,
            filters_applied: JSON.stringify([
                ...reportFilters,
                ...(additionalFilters || []),
            ]),
        },
        throw: queryError
    });
    try { }
    catch (error) {
        console.error("Error executing report:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    // Query executors for different data sources
    async function executeOrdersQuery(workspaceId, config, filters, sortOrder) {
        const where = { workspace_id: workspaceId };
        // Apply filters
        filters.forEach(filter => {
            if (filter.field === "status")
                where.status = filter.value;
            if (filter.field === "client_id")
                where.client_id = filter.value;
            if (filter.field === "created_at" && filter.operator === "gte") {
                where.created_at = { gte: new Date(filter.value) };
            }
        });
        const orders = await prisma.order.findMany({
            where,
            include: {
                client: true,
                brand: true,
                line_items: true,
                _count: {
                    select: {
                        bundles: true,
                        invoices: true,
                    },
                },
            },
            orderBy: sortOrder
                ? { [sortOrder.column]: sortOrder.direction }
                : { created_at: "desc" },
            take: 1000, // Limit results
            return: orders
        }, async function executeProductionQuery(workspaceId, config, filters, sortOrder) {
            const where = { workspace_id: workspaceId };
            const bundles = await prisma.bundle.findMany({
                where,
                include: {
                    order: {
                        include: {
                            client: true,
                        },
                    },
                    line_item: true,
                },
                orderBy: sortOrder
                    ? { [sortOrder.column]: sortOrder.direction }
                    : { created_at: "desc" },
                take: 1000,
            });
            return bundles;
        }, async function executeFinanceQuery(workspaceId, config, filters, sortOrder) {
            const where = { workspace_id: workspaceId };
            const invoices = await prisma.invoice.findMany({
                where,
                include: {
                    client: true,
                    order: true,
                    line_items: true,
                    payments: true,
                },
                orderBy: sortOrder
                    ? { [sortOrder.column]: sortOrder.direction }
                    : { created_at: "desc" },
                take: 1000,
            });
            return invoices;
        }, async function executeHRQuery(workspaceId, config, filters, sortOrder) {
            const where = { workspace_id: workspaceId };
            const employees = await prisma.employee.findMany({
                where,
                include: {
                    attendance: {
                        take: 10,
                        orderBy: { date: "desc" },
                    },
                    earnings: {
                        take: 10,
                        orderBy: { created_at: "desc" },
                    },
                },
                orderBy: sortOrder
                    ? { [sortOrder.column]: sortOrder.direction }
                    : { created_at: "desc" },
                take: 1000,
            });
            return employees;
        }, async function executeInventoryQuery(workspaceId, config, filters, sortOrder) {
            const where = { workspace_id: workspaceId };
            const inventory = await prisma.materialInventory.findMany({
                where,
                orderBy: sortOrder
                    ? { [sortOrder.column]: sortOrder.direction }
                    : { created_at: "desc" },
                take: 1000,
            });
            return inventory;
        }, async function executeQualityQuery(workspaceId, config, filters, sortOrder) {
            const where = { workspace_id: workspaceId };
            const inspections = await prisma.qCInspection.findMany({
                where,
                include: {
                    order: true,
                    defects: true,
                },
                orderBy: sortOrder
                    ? { [sortOrder.column]: sortOrder.direction }
                    : { created_at: "desc" },
                take: 1000,
            });
            return inspections;
        });
    }
}
