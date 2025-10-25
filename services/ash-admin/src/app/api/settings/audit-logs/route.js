"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Stub API for audit logs
// TODO: Implement real audit log tracking
// Force dynamic route (don't pre-render during build)
exports.dynamic = "force-dynamic";
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    return (0, auth_middleware_1.requireAuth)(async (request, user) => {
        try {
            // Return mock audit logs;
            const logs = [
                {
                    id: "1",
                    user_email: "admin@ashleyai.com",
                    user_name: "Admin User",
                    action: "Login Successful",
                    category: "authentication",
                    resource_type: "user",
                    resource_id: user.id,
                    ip_address: "192.168.1.100",
                    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                    status: "success",
                    details: { method: "email_password" },
                    created_at: new Date().toISOString(),
                },
                {
                    id: "2",
                    user_email: "admin@ashleyai.com",
                    user_name: "Admin User",
                    action: "Password Changed",
                    category: "security",
                    resource_type: "user",
                    resource_id: user.id,
                    ip_address: "192.168.1.100",
                    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                    status: "success",
                    details: {},
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                    id: "3",
                    user_email: "admin@ashleyai.com",
                    user_name: "Admin User",
                    action: "Failed Login Attempt",
                    category: "authentication",
                    resource_type: "user",
                    resource_id: user.id,
                    ip_address: "192.168.1.101",
                    user_agent: "Mozilla/5.0 (iPhone; iOS 17) Safari/17.0",
                    status: "failure",
                    details: { reason: "invalid_password" },
                    created_at: new Date(Date.now() - 7200000).toISOString(),
                },
                {
                    id: "4",
                    user_email: "admin@ashleyai.com",
                    user_name: "Admin User",
                    action: "Account Settings Updated",
                    category: "account",
                    resource_type: "user",
                    resource_id: user.id,
                    ip_address: "192.168.1.100",
                    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                    status: "success",
                    details: { fields: ["name", "phone"] },
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                },
            ];
            return server_1.NextResponse.json({ logs });
        }
        catch (error) {
            console.error("Error fetching audit logs:", error);
            return server_1.NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
        }
    });
});
