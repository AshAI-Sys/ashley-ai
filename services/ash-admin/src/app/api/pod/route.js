"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/pod - Create proof of delivery record
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { workspace_id, delivery_id, shipment_id, carton_id, recipient_name, recipient_phone, signature_url, photo_urls, // Array of photo URLs
        notes, latitude, longitude, geolocation, delivery_status = "DELIVERED", cod_amount, cod_collected, cod_reference, } = body;
        if (!workspace_id || !delivery_id || !recipient_name) {
            return server_1.NextResponse.json({ error: "workspace_id, delivery_id, and recipient_name are required" }, { status: 400 });
        }
        // Create POD record
        const podRecord = await prisma.pODRecord.create({
            data: {
                workspace_id,
                delivery_id,
                shipment_id,
                carton_id,
                recipient_name,
                recipient_phone,
                signature_url,
                photo_urls: photo_urls ? JSON.stringify(photo_urls) : null,
                notes,
                latitude,
                longitude,
                geolocation,
                delivery_status,
                cod_amount,
                cod_collected,
                cod_reference,
            },
        });
        // Update delivery status to DELIVERED
        await prisma.delivery.update({
            where: { id: delivery_id },
            data: {
                status: delivery_status,
                actual_delivery_date: new Date(),
            },
        });
        return server_1.NextResponse.json(podRecord, { status: 201 });
    }
    catch (error) {
        console.error("Error creating POD record:", error);
        return server_1.NextResponse.json({
            error: "Failed to create POD record",
            details: error.message,
        }, { status: 500 });
    }
    // GET /api/pod?delivery_id=xxx - Get POD records for a delivery
    export const GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
        try {
            const { searchParams } = new URL(request.url);
            const delivery_id = searchParams.get("delivery_id");
            const workspace_id = searchParams.get("workspace_id");
            if (!delivery_id && !workspace_id) {
                return server_1.NextResponse.json({ error: "delivery_id or workspace_id is required" }, { status: 400 });
            }
            const where = {};
            if (delivery_id)
                where.delivery_id = delivery_id;
            if (workspace_id)
                where.workspace_id = workspace_id;
            const podRecords = await prisma.pODRecord.findMany({
                where,
                include: {
                    delivery: {
                        select: {
                            delivery_reference: true,
                            carrier_name: true,
                            tracking_number: true,
                            delivery_address: true,
                        },
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            });
            // Parse photo_urls JSON
            const formattedRecords = podRecords.map(record => ({
                ...record,
                photo_urls: record.photo_urls ? JSON.parse(record.photo_urls) : [],
            }));
            return server_1.NextResponse.json(formattedRecords);
        }
        catch (error) {
            console.error("Error fetching POD records:", error);
            return server_1.NextResponse.json({
                error: "Failed to fetch POD records",
                details: error.message,
            }, { status: 500 });
        }
        // PUT /api/pod/:id - Update POD record
        export const PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
            try {
                const { searchParams } = new URL(request.url);
                const id = searchParams.get("id");
                if (!id) {
                    return server_1.NextResponse.json({ error: "POD record ID is required" }, { status: 400 });
                }
                const body = await request.json();
                const { recipient_name, recipient_phone, signature_url, photo_urls, notes, latitude, longitude, geolocation, delivery_status, cod_amount, cod_collected, cod_reference, } = body;
                const updateData = {};
                if (recipient_name !== undefined)
                    updateData.recipient_name = recipient_name;
                if (recipient_phone !== undefined)
                    updateData.recipient_phone = recipient_phone;
                if (signature_url !== undefined)
                    updateData.signature_url = signature_url;
                if (photo_urls !== undefined)
                    updateData.photo_urls = JSON.stringify(photo_urls);
                if (notes !== undefined)
                    updateData.notes = notes;
                if (latitude !== undefined)
                    updateData.latitude = latitude;
                if (longitude !== undefined)
                    updateData.longitude = longitude;
                if (geolocation !== undefined)
                    updateData.geolocation = geolocation;
                if (delivery_status !== undefined)
                    updateData.delivery_status = delivery_status;
                if (cod_amount !== undefined)
                    updateData.cod_amount = cod_amount;
                if (cod_collected !== undefined)
                    updateData.cod_collected = cod_collected;
                if (cod_reference !== undefined)
                    updateData.cod_reference = cod_reference;
                const updatedRecord = await prisma.pODRecord.update({
                    where: { id },
                    data: updateData,
                    return: server_1.NextResponse.json(updatedRecord)
                });
                try { }
                catch (error) {
                    console.error("Error updating POD record:", error);
                    return server_1.NextResponse.json({
                        error: "Failed to update POD record",
                        details: error.message,
                    }, { status: 500 });
                }
            }
            finally { }
        });
    });
});
