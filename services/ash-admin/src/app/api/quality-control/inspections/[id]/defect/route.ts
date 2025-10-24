/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const defect = await prisma.qCDefect.create({
      data: {
        workspace_id: data.workspace_id || "default",
        inspection_id: params.id,
        sample_id: data.sample_id,
        defect_code_id: data.defect_code_id,
        defect_type_id: data.defect_type_id,
        quantity: data.quantity || 1,
        severity: data.severity,
        location: data.location,
        description: data.description,
        photo_url: data.photo_url,
        operator_id: data.operator_id,
        root_cause: data.root_cause,
      },
      include: {
        defect_code: true,
        sample: true,
      },
        });
      
        return NextResponse.json(defect, { status: 201 });
  } catch (error) {
    console.error("Error creating defect:", error);
    return NextResponse.json(
      { error: "Failed to create defect" },
      { status: 500 }
    );
  }
}
