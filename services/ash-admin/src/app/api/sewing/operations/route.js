"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const productType = searchParams.get("product_type");
        const _where = productType ? { product_type: productType } : {};
        // Return mock data for now since we don't have SewingOperation table yet
        const operations = [
            {
                id: "1",
                product_type: "T-SHIRT",
                name: "Join shoulders",
                standard_minutes: 2.5,
                piece_rate: 3.5,
                depends_on: [],
            },
            {
                id: "2",
                product_type: "T-SHIRT",
                name: "Attach collar",
                standard_minutes: 3.0,
                piece_rate: 4.0,
                depends_on: ["Join shoulders"],
            },
            {
                id: "3",
                product_type: "T-SHIRT",
                name: "Set sleeves",
                standard_minutes: 4.0,
                piece_rate: 5.0,
                depends_on: ["Join shoulders"],
            },
            {
                id: "4",
                product_type: "T-SHIRT",
                name: "Side seams",
                standard_minutes: 3.5,
                piece_rate: 4.5,
                depends_on: ["Set sleeves"],
            },
            {
                id: "5",
                product_type: "T-SHIRT",
                name: "Hem bottom",
                standard_minutes: 2.0,
                piece_rate: 3.0,
                depends_on: ["Side seams"],
            },
            {
                id: "6",
                product_type: "T-SHIRT",
                name: "Hem sleeves",
                standard_minutes: 1.5,
                piece_rate: 2.5,
                depends_on: ["Set sleeves"],
            },
        ];
        return server_1.NextResponse.json({
            success: true,
            data: operations,
        });
        try { }
        catch (error) {
            console.error("Error fetching sewing operations:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to fetch sewing operations" }, { status: 500 });
        }
    }
    finally {
    }
});
