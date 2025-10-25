"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
/* eslint-disable */
const server_1 = require("next/server");
const types_1 = require("@/lib/sms/types");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/sms/templates - Get all SMS templates
async function GET() {
    try {
        const templates = Object.entries(types_1.SMS_TEMPLATES).map(([key, template]) => ({
            id: key,
            ...template,
        }));
        return server_1.NextResponse.json({
            success: true,
            templates,
            count: templates.length,
        });
        try { }
        catch (error) {
            return server_1.NextResponse.json({ error: "Failed to get templates", details: error.message }, { status: 500 });
        }
        // POST /api/sms/templates - Preview template with variables
        export const POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
            try {
                const body = await request.json();
                const { template_id, variables } = body;
                if (!template_id) {
                    return server_1.NextResponse.json({ error: "template_id is required" }, { status: 400 });
                }
                const template = types_1.SMS_TEMPLATES[template_id];
                if (!template) {
                    return server_1.NextResponse.json({ error: "Template not found" }, { status: 404 });
                }
                // Replace variables in template
                let preview = template.message;
                if (variables) {
                    Object.keys(variables).forEach(key => {
                        preview = preview.replace(new RegExp(`\\{${key}\\}`, "g"), variables[key]);
                    });
                    return server_1.NextResponse.json({
                        success: true,
                        template: {
                            id: template_id,
                            name: template.name,
                            original: template.message,
                            preview,
                            variables: template.variables,
                        },
                    });
                }
                try { }
                catch (error) {
                    return server_1.NextResponse.json({ error: "Failed to preview template", details: error.message }, { status: 500 });
                }
            }
            finally { }
        });
    }
    finally { }
}
