"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const employee_id = searchParams.get("employee_id");
        const date_from = searchParams.get("date_from");
        const date_to = searchParams.get("date_to");
        const status = searchParams.get("status");
        const _type = searchParams.get("type");
        const where = { workspace_id: "default" };
        if (employee_id)
            where.employee_id = employee_id;
        if (status && status !== "all") {
            // Map status to our schema fields
            if (status === "APPROVED")
                where.status = "APPROVED";
            else if (status === "PENDING")
                where.status = "PENDING";
            // Date filtering
        }
        if (date_from || date_to) {
            where.date = {};
            if (date_from)
                where.date.gte = new Date(date_from);
            if (date_to)
                where.date.lte = new Date(date_to);
        }
        else {
            // Default to today if no date range specified
            const today = new Date();
            where.date = {
                gte: new Date(today.setHours(0, 0, 0, 0)),
                lt: new Date(today.setHours(23, 59, 59, 999)),
            };
        }
        const attendanceLogs = await db_1.prisma.attendanceLog.findMany({
            where,
            include: {
                employee: {
                    select: {
                        first_name: true,
                        last_name: true,
                        position: true,
                        department: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });
        const processedLogs = attendanceLogs.map(log => ({
            id: log.id,
            employee: {
                name: `${log.employee.first_name} ${log.employee.last_name}`,
                role: log.employee.position,
            },
            date: log.date.toISOString(),
            time_in: log.time_in?.toISOString() || null,
            time_out: log.time_out?.toISOString() || null,
            break_minutes: log.break_minutes,
            overtime_minutes: log.overtime_minutes,
            status: log.status,
            notes: log.notes,
            created_at: log.created_at.toISOString(),
        }));
        return server_1.NextResponse.json({
            success: true,
            data: processedLogs,
        });
    }
    catch (error) {
        console.error("Error fetching attendance logs:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch attendance logs" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const data = await request.json();
        const { employee_id, type, // IN/OUT/BREAK_START/BREAK_END
        source = "MANUAL", // KIOSK/MOBILE/SUPERVISOR/WEBHOOK/MANUAL
        geo, selfie_url, device_id, timestamp, } = data;
        // Validate employee exists
        const employee = await db_1.prisma.employee.findUnique({
            where: { id: employee_id },
            select: { id: true, first_name: true, last_name: true, is_active: true },
        });
        if (!employee) {
            return server_1.NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
        }
        if (!employee.is_active) {
            return server_1.NextResponse.json({ success: false, error: "Employee is not active" }, { status: 400 });
        }
        const today = new Date();
        const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        // Check if attendance record already exists for today
        const existingAttendance = await db_1.prisma.attendanceLog.findUnique({
            where: {
                employee_id_date: {
                    employee_id,
                    date: dateOnly,
                },
            },
        });
        let attendanceLog;
        if (existingAttendance) {
            // Update existing record based on type
            const updateData = {};
            if (type === "IN" && !existingAttendance.time_in) {
                updateData.time_in = timestamp ? new Date(timestamp) : new Date();
                updateData.status = source === "MANUAL" ? "PENDING" : "APPROVED";
            }
            else if (type === "OUT" &&
                existingAttendance.time_in &&
                !existingAttendance.time_out) {
                updateData.time_out = timestamp ? new Date(timestamp) : new Date();
            }
            if (Object.keys(updateData).length > 0) {
                attendanceLog = await db_1.prisma.attendanceLog.update({
                    where: { id: existingAttendance.id },
                    data: updateData,
                    include: {
                        employee: {
                            select: {
                                first_name: true,
                                last_name: true,
                                position: true,
                                department: true,
                            },
                        },
                    },
                });
            }
            else {
                return server_1.NextResponse.json({ success: false, error: "Invalid attendance action" }, { status: 400 });
            }
        }
        else {
            // Create new attendance record
            attendanceLog = await db_1.prisma.attendanceLog.create({
                data: {
                    workspace_id: "default",
                    employee_id,
                    date: dateOnly,
                    time_in: type === "IN"
                        ? timestamp
                            ? new Date(timestamp)
                            : new Date()
                        : null,
                    time_out: type === "OUT"
                        ? timestamp
                            ? new Date(timestamp)
                            : new Date()
                        : null,
                    status: source === "MANUAL" ? "PENDING" : "APPROVED",
                    metadata: JSON.stringify({ source, geo: geo || {}, device_id }),
                },
                include: {
                    employee: {
                        select: {
                            first_name: true,
                            last_name: true,
                            position: true,
                            department: true,
                        },
                    },
                },
            });
        }
        return server_1.NextResponse.json({
            success: true,
            data: {
                id: attendanceLog.id,
                employee: {
                    name: `${attendanceLog.employee.first_name} ${attendanceLog.employee.last_name}`,
                    role: attendanceLog.employee.position,
                },
                date: attendanceLog.date.toISOString(),
                time_in: attendanceLog.time_in?.toISOString() || null,
                time_out: attendanceLog.time_out?.toISOString() || null,
                status: attendanceLog.status,
                type: type,
                timestamp: (attendanceLog.time_in || attendanceLog.time_out)?.toISOString(),
            },
        }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating attendance log:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create attendance log" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const data = await request.json();
        const { id, approved, approver_notes } = data;
        const attendanceLog = await db_1.prisma.attendanceLog.update({
            where: { id },
            data: {
                status: approved ? "APPROVED" : "REJECTED",
                notes: approver_notes,
            },
            include: {
                employee: {
                    select: {
                        first_name: true,
                        last_name: true,
                        position: true,
                        department: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: attendanceLog,
        });
    }
    catch (error) {
        console.error("Error updating attendance log:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update attendance log" }, { status: 500 });
    }
});
