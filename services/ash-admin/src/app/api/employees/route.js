"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        // Fixed: Changed createdAt to created_at;
        const { searchParams } = new URL(request.url);
        const department = searchParams.get("department");
        const status = searchParams.get("status");
        const position = searchParams.get("position");
        const limit = parseInt(searchParams.get("limit") || "100");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;
        const where = {};
        if (department) {
            where.department = department;
        }
        if (status) {
            where.status = status;
        }
        if (position) {
            where.position = position;
        }
        const [employees, total] = await Promise.all([
            db_1.prisma.employee.findMany({
                where,
                take: limit,
                skip,
                orderBy: {
                    created_at: "desc",
                },
            }),
            db_1.prisma.employee.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: employees,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Error fetching employees:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
    }
});
