"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const _3pl_1 = require("@/lib/3pl");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/3pl/track?provider=LALAMOVE&tracking_number=xxx - Track shipment
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const provider = searchParams.get("provider");
        const tracking_number = searchParams.get("tracking_number");
        if (!provider || !tracking_number) {
            return server_1.NextResponse.json({ error: "provider and tracking_number are required" }, { status: 400 });
        }
        const tracking = await _3pl_1.threePLService.trackShipment(provider, tracking_number);
        return server_1.NextResponse.json(tracking);
    }
    catch (error) {
        console.error("Error tracking 3PL shipment:", error);
        return server_1.NextResponse.json({
            error: "Failed to track shipment",
            details: error.message,
        }, { status: 500 });
    }
});
;
