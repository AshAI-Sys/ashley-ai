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
        const status = searchParams.get("status");
        const orderId = searchParams.get("order_id");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const where = {};
        if (status && status !== "all")
            where.status = status;
        if (orderId)
            where.order_id = orderId;
        const cartons = await db_1.prisma.carton.findMany({
            where,
            include: {
                order: { select: { order_number: true } },
                contents: {
                    include: {
                        finished_unit: {
                            select: { sku: true, size_code: true, color: true },
                        },
                    },
                },
                shipment_cartons: {
                    include: {
                        shipment: { select: { id: true, status: true } },
                    },
                },
            },
            orderBy: { created_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });
        // Process cartons to calculate metrics
        const processedCartons = cartons.map(carton => {
            const unitsCount = carton.contents.reduce((sum, content) => sum + content.qty, 0);
            return {
                ...carton,
                carton_no: carton.carton_no || `CTN-${carton.id.slice(-6)}`,
                dimensions: {
                    length: carton.length_cm || 0,
                    width: carton.width_cm || 0,
                    height: carton.height_cm || 0,
                },
                actual_weight: carton.actual_weight_kg || 0,
                fill_percent: carton.fill_percent || 0,
                units_count: unitsCount,
            };
        });
        return server_1.NextResponse.json({
            cartons: processedCartons,
            pagination: {
                page,
                limit,
                total: await db_1.prisma.carton.count({ where }),
            },
        });
    }
    catch (error) {
        console.error("Error fetching cartons:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch cartons" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        // Generate carton number if not provided
        const cartonCount = await db_1.prisma.carton.count({
            where: { order_id: data.order_id },
        });
        const cartonNo = data.carton_no || cartonCount + 1;
        const carton = await db_1.prisma.carton.create({
            data: {
                workspace_id: data.workspace_id || "default",
                order_id: data.order_id,
                carton_no: cartonNo,
                length_cm: data.length_cm || 40,
                width_cm: data.width_cm || 30,
                height_cm: data.height_cm || 25,
                tare_weight_kg: data.tare_weight_kg || 0.5,
                status: "OPEN",
            },
            include: {
                order: { select: { order_number: true } },
            },
        });
        return server_1.NextResponse.json(carton, { status: 201 });
    }
    catch (error) {
        console.error("Error creating carton:", error);
        return server_1.NextResponse.json({ error: "Failed to create carton" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        // Calculate metrics if closing carton
        if (updateData.status === "CLOSED") {
            const cartonWithContents = await db_1.prisma.carton.findUnique({
                where: { id },
                include: {
                    contents: {
                        include: {
                            finished_unit: true,
                        },
                    },
                },
            });
            if (cartonWithContents) {
                // Calculate actual weight and fill percentage
                const unitWeight = 0.15; // kg per unit (average)
                const totalUnits = cartonWithContents.contents.reduce((sum, c) => sum + c.qty, 0);
                const actualWeight = (cartonWithContents.tare_weight_kg || 0.5) + totalUnits * unitWeight;
                // Calculate volume utilization
                const cartonVolume = (cartonWithContents.length_cm || 40) *
                    (cartonWithContents.width_cm || 30) *
                    (cartonWithContents.height_cm || 25);
                const unitVolume = 300; // cm³ per unit (estimated)
                const usedVolume = totalUnits * unitVolume;
                const fillPercentage = Math.min(100, (usedVolume / cartonVolume) * 100);
                updateData.actual_weight_kg = actualWeight;
                updateData.fill_percent = fillPercentage;
                // Calculate dimensional weight for shipping
            }
            const dimWeight = cartonVolume / 5000; // Divisor varies by carrier
            updateData.dim_weight_kg = dimWeight;
        }
        const carton = await db_1.prisma.carton.update({
            where: { id },
            data: {
                ...updateData,
                updated_at: new Date(),
            },
            include: {
                order: { select: { order_number: true } },
                contents: {
                    include: {
                        finished_unit: {
                            select: { sku: true, size_code: true, color: true },
                        },
                    },
                },
            },
        });
        return server_1.NextResponse.json(carton);
    }
    catch (error) {
        console.error("Error updating carton:", error);
        return server_1.NextResponse.json({ error: "Failed to update carton" }, { status: 500 });
    }
});
