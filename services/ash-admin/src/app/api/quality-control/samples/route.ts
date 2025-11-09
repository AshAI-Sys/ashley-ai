/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const data = await request.json();

    const sample = await prisma.qCSample.create({
      data: {
        workspace_id: data.workspace_id || "default",
        inspection_id: data.inspection_id,
        sample_no: data.sample_no,
        sampled_from: data.sampled_from || data.bundle_ref, // Support both field names
        unit_ref: data.unit_ref,
        qty_sampled: data.qty_sampled,
        defects_found: data.defects_found || 0,
        result: data.result || data.pass_fail || "OK", // Changed from pass_fail to result
        sample_data: data.sample_data ? JSON.stringify(data.sample_data) : null,
        sampled_at: new Date(),
      },
        
      
        });

    return NextResponse.json(sample, { status: 201 });
  } catch (error) {
    console.error("Error creating sample:", error);
    return NextResponse.json(
      { error: "Failed to create sample" },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const inspectionId = searchParams.get("inspection_id");

    if (!inspectionId) {
      
      return NextResponse.json(
        { error: "inspection_id is required" },
        { status: 400 }
      );
    }
    const samples = await prisma.qCSample.findMany({
      where: { inspection_id: inspectionId },
      include: {
        defects: {
          include: {
            defect_code: true,
          },
        },
      },
      orderBy: { sample_no: "asc" },
        
      
        });

    return NextResponse.json(samples);
  } catch (error) {
    console.error("Error fetching samples:", error);
    return NextResponse.json(
      { error: "Failed to fetch samples" },
      { status: 500 }
    );
  }
});
