import { NextRequest, NextResponse } from "next/server";
import { SMS_TEMPLATES } from "@/lib/sms/types";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/sms/templates - Get all SMS templates
export async function GET() {
  try {
    const templates = Object.entries(SMS_TEMPLATES).map(([key, template]) => ({
      id: key,
      ...template,
    }));

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get templates", details: error.message },
      { status: 500 }
    );
  }
});

// POST /api/sms/templates - Preview template with variables
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { template_id, variables } = body;

    if (!template_id) {
      return NextResponse.json(
        { error: "template_id is required" },
        { status: 400 }
      );
    }

    const template = SMS_TEMPLATES[template_id as keyof typeof SMS_TEMPLATES];

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Replace variables in template
    let preview = template.message;
    if (variables) {
      Object.keys(variables).forEach(key => {
        preview = preview.replace(
          new RegExp(`\\{${key}\\}`, "g"),
          variables[key]
        );
      });
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template_id,
        name: template.name,
        original: template.message,
        preview,
        variables: template.variables,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to preview template", details: error.message },
      { status: 500 }
    );
  }
};
