"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const _3pl_1 = require("@/lib/3pl");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/3pl/book - Book shipment with 3PL provider
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { provider, shipment, shipment_id, reference_number } = body;
        if (!provider || !shipment) {
            return server_1.NextResponse.json({ error: "provider and shipment details are required" }, { status: 400 });
        }
        // Book with 3PL provider
        const booking = await _3pl_1.threePLService.bookShipment({
            provider,
            shipment,
            reference_number,
        });
        if (!booking.success) {
            return server_1.NextResponse.json({ error: booking.error || "Booking failed" }, { status: 400 });
        }
        // Update shipment in database if shipment_id provided
        if (shipment_id) {
            await prisma.shipment.update({
                where: { id: shipment_id },
                data: {
                    method: provider,
                    carrier_ref: booking.booking_id,
                    tracking_number: booking.tracking_number,
                    status: "BOOKED",
                },
            });
            // Create initial tracking event
            const delivery = await prisma.delivery.findFirst({
                where: {
                    shipments: {
                        some: {
                            shipment_id: shipment_id,
                        },
                    },
                },
            });
            if (delivery) {
                await prisma.deliveryTrackingEvent.create({
                    data: {
                        delivery_id: delivery.id,
                        status: "BOOKED",
                        description: `Booked with ${provider} - Tracking: ${booking.tracking_number}`,
                        timestamp: new Date(),
                    },
                });
            }
            return server_1.NextResponse.json(booking, { status: 201 });
        }
        try { }
        catch (error) {
            console.error("Error booking 3PL shipment:", error);
            return server_1.NextResponse.json({
                error: "Failed to book shipment",
                details: error.message,
            }, { status: 500 });
        }
    }
    finally { }
});
