"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
/* eslint-disable */
const server_1 = require("next/server");
// TODO: Fix Prisma client model name issue for Shipment
// Temporarily disabled all shipment operations
async function GET(_request) {
    return server_1.NextResponse.json({
        success: true,
        shipments: [],
        pagination: {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0,
        },
        message: "Shipments temporarily disabled - Prisma model issue",
    });
}
async function POST(_request) {
    return server_1.NextResponse.json({
        success: false,
        message: "Shipment creation temporarily disabled - Prisma model issue",
    }, { status: 503 });
}
