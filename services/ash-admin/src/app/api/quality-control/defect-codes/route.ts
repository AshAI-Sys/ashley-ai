/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (severity && severity !== "all") {
      where.severity = severity;
    }

    const defectCodes = await prisma.qCDefectCode.findMany({
      where,
      orderBy: { code: "asc" },
        
      
        });

    return NextResponse.json(defectCodes);
  } catch (error) {
    console.error("Error fetching defect codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch defect codes" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();

    const defectCode = await prisma.qCDefectCode.create({
      data: {
        workspace_id: data.workspace_id || "default",
        code: data.code,
        name: data.name,
        category: data.category,
        severity: data.severity,
        description: data.description,
      },
        
      
        });

    return NextResponse.json(defectCode, { status: 201 });
  } catch (error) {
    console.error("Error creating defect code:", error);
    return NextResponse.json(
      { error: "Failed to create defect code" },
      { status: 500 }
    );
  }
  });
