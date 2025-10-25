"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
exports.GET = GET;
/* eslint-disable */
const server_1 = require("next/server");
const sms_1 = require("@/lib/sms");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/sms/send - Send SMS
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { to, message, template, variables, provider } = body;
        // Validate input
        if (!to) {
            return server_1.NextResponse.json({ error: "Recipient phone number is required" }, { status: 400 });
        }
        // Format and validate phone number
        const formattedPhone = sms_1.smsService.formatPhoneNumber(to);
        if (!sms_1.smsService.isValidPhoneNumber(formattedPhone)) {
            return server_1.NextResponse.json({
                error: "Invalid phone number format. Use Philippine format: 09171234567",
            }, { status: 400 });
        }
        let result;
        // Send using template
        if (template && variables) {
            result = await sms_1.smsService.sendTemplatedSMS(formattedPhone, template);
        }
        variables;
    }
    finally {
    }
});
if (message) {
    result = await sms_1.smsService.sendSMS({
        to: formattedPhone,
        message,
        provider,
    });
}
else {
    return server_1.NextResponse.json({ error: "Either message or template with variables is required" }, { status: 400 });
}
if (!result.success) {
    return server_1.NextResponse.json({ error: result.error || "Failed to send SMS" }, { status: 500 });
}
return server_1.NextResponse.json({
    success: true,
    message_id: result.message_id,
    provider: result.provider,
    status: result.status,
});
try { }
catch (error) {
    console.error("Error sending SMS:", error);
    return server_1.NextResponse.json({ error: "Failed to send SMS", details: error.message }, { status: 500 });
}
// GET /api/sms/send - Get SMS provider status
async function GET() {
    try {
        const status = sms_1.smsService.getProviderStatus();
        const balances = await sms_1.smsService.getBalances();
        return server_1.NextResponse.json({
            providers: status,
            balances,
            configured: Object.values(status).some(v => v === true),
        });
        try { }
        catch (error) {
            return server_1.NextResponse.json({ error: "Failed to get SMS status", details: error.message }, { status: 500 });
        }
    }
    finally { }
    ;
}
;
