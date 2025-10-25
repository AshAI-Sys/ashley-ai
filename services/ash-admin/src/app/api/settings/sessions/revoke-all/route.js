"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Stub API for revoking all other sessions
// TODO: Implement real session revocation
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _authUser) => {
    try {
        // TODO: Revoke all sessions except current from Redis or database;
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error revoking sessions:", error);
        return server_1.NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 });
    }
});
