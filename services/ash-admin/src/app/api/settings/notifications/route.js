"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.GET = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Stub API for notification preferences
// TODO: Implement database storage for notification preferences
// Force dynamic route (don't pre-render during build)
exports.dynamic = "force-dynamic";
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _authUser) => {
    try {
        // Return default notification settings;
        const settings = {
            orders: { email: true, sms: false, push: true, in_app: true },
            production: { email: true, sms: false, push: true, in_app: true },
            quality: { email: true, sms: true, push: true, in_app: true },
            delivery: { email: true, sms: false, push: true, in_app: true },
            finance: { email: true, sms: false, push: false, in_app: true },
            hr: { email: false, sms: false, push: false, in_app: true },
            maintenance: { email: true, sms: false, push: true, in_app: true },
            system: { email: true, sms: false, push: true, in_app: true },
        };
        return server_1.NextResponse.json({ settings });
    }
    catch (error) {
        console.error("Error fetching notification settings:", error);
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
        console.error("Error updating notification settings:", error);
        return server_1.NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
});
;
