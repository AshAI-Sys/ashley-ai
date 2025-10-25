"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Stub API for exporting audit logs
// TODO: Implement real audit log export
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    return (0, auth_middleware_1.requireAuth)(async (request, _user) => {
        try {
            const _body = await request.json();
            // Mock CSV data
            const csv = `ID,User,Action,Category,Status,IP Address,Timestamp
1,admin@ashleyai.com,Login Successful,authentication,success,192.168.1.100,${new Date().toISOString()}
2,admin@ashleyai.com,Password Changed,security,success,192.168.1.100,${new Date(Date.now() - 3600000).toISOString()}
3,admin@ashleyai.com,Failed Login Attempt,authentication,failure,192.168.1.101,${new Date(Date.now() - 7200000).toISOString()}
4,admin@ashleyai.com,Account Settings Updated,account,success,192.168.1.100,${new Date(Date.now() - 86400000).toISOString()}`;
            return new server_1.NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": 'attachment; filename="audit-logs.csv"',
                },
            });
        }
        catch (error) {
            console.error("Error exporting audit logs:", error);
            return server_1.NextResponse.json({ error: "Failed to export logs" }, { status: 500 });
        }
    });
});
