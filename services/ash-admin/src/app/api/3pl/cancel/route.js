"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const _3pl_1 = require("@/lib/3pl");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/3pl/cancel - Cancel shipment with 3PL provider
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { provider, booking_id, tracking_number, reason } = body;
        if (!provider || !booking_id) {
            return server_1.NextResponse.json({ error: "provider and booking_id are required" }, { status: 400 });
        }
        const result = await _3pl_1.threePLService.cancelShipment({
            provider,
            booking_id,
            tracking_number,
            reason,
        });
        if (!result.success) {
            return server_1.NextResponse.json({ error: result.error || "Cancellation failed" }, { status: 400 });
        }
        return server_1.NextResponse.json(result);
    }
    catch (error) {
        console.error("Error cancelling 3PL shipment:", error);
        return server_1.NextResponse.json({
            error: "Failed to cancel shipment",
            details: error.message,
        }, { status: 500 });
    }
});
