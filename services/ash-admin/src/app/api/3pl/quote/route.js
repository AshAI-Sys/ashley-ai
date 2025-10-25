"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const _3pl_1 = require("@/lib/3pl");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/3pl/quote - Get shipping quotes from 3PL providers
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { provider, shipment } = body;
        if (!shipment) {
            return server_1.NextResponse.json({ error: "shipment details are required" }, { status: 400 });
        }
        // Validate required shipment fields
        if (!shipment.pickup_address ||
            !shipment.delivery_address ||
            !shipment.package_details) {
            return server_1.NextResponse.json({
                error: "pickup_address, delivery_address, and package_details are required",
            }, { status: 400 });
        }
        // Get quotes
        const quotes = await _3pl_1.threePLService.getQuotes({
            provider,
            shipment,
        });
        // Get comparison
        const comparison = await _3pl_1.threePLService.compareProviders(shipment);
        return server_1.NextResponse.json({
            quotes,
            recommended: comparison.cheapest,
            cheapest: comparison.cheapest,
            fastest: comparison.fastest,
        });
    }
    catch (error) {
        console.error("Error getting 3PL quotes:", error);
        return server_1.NextResponse.json({
            error: "Failed to get shipping quotes",
            details: error.message,
        }, { status: 500 });
    }
});
