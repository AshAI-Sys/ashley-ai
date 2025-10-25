"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        // Bills feature not yet implemented - return empty array
        return server_1.NextResponse.json({
            success: true,
            data: [],
        });
    }
    catch (error) {
        console.error("Error fetching bills:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch bills" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        return server_1.NextResponse.json({ success: false, error: "Bills feature not yet implemented" }, { status: 501 });
    }
    catch (error) {
        console.error("Error creating bill:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create bill" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        return server_1.NextResponse.json({ success: false, error: "Bills feature not yet implemented" }, { status: 501 });
    }
    catch (error) {
        console.error("Error updating bill:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update bill" }, { status: 500 });
    }
});
