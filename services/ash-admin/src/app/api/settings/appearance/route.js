"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.GET = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Stub API for appearance preferences
// TODO: Implement database storage for appearance preferences
// Force dynamic route (don't pre-render during build)
exports.dynamic = "force-dynamic";
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _authUser) => {
    try {
        // Return default appearance settings;
        const settings = {
            theme: "system",
            color_scheme: "blue",
            compact_mode: false,
            show_avatars: true,
            font_size: "medium",
        };
        return server_1.NextResponse.json(settings);
    }
    catch (error) {
        console.error("Error fetching appearance settings:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, _authUser) => {
    try {
        const _body = await request.json();
        // TODO: Save to database
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error updating appearance settings:", error);
        return server_1.NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
});
;
