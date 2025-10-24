/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");
    const inspectionType = searchParams.get("inspection_type");
    const result = searchParams.get("result");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (fromDate && toDate) {
      where.inspection_date = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };

    if (inspectionType && inspectionType !== "all") {
      where.inspection_type = inspectionType;
    }

    if (result && result !== "all") {
      where.result = result;
    }
    const inspections = await prisma.qCInspection.findMany({
      where,
      include: {
        order: {
          select: { order_number: true },
        },
        bundle: {
          select: { qr_code: true, size_code: true, qty: true },
        },
        checklist: {
          select: { name: true, type: true },
        },
        inspector: {
          select: { first_name: true, last_name: true },
        },
        _count: {
          select: {
            samples: true,
            defects: true,
            capa_tasks: true,
          },
        },
      },
      orderBy: { inspection_date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      });
    
      return NextResponse.json({
      inspections,
      pagination: {
        page,
        limit,
        total: await prisma.qCInspection.count({ where }),
      },
    });
  } catch (error) {
    console.error("Error fetching QC inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();

    // Calculate AQL sample size and acceptance/rejection numbers
    const { sample_size, acceptance, rejection } = calculateAQLSampling(
      data.lot_size,
      data.aql || 2.5,
      data.level || "GENERAL_II"
    );

    const inspection = await prisma.qCInspection.create({
      data: {
        workspace_id: data.workspace_id || "default",
        order_id: data.order_id,
        routing_step_id: data.routing_step_id,
        bundle_id: data.bundle_id,
        inspection_point_id: data.inspection_point_id,
        checklist_id: data.checklist_id,
        inspector_id: data.inspector_id,
        stage: data.stage, // PRINTING/SEWING/FINAL
        inspection_level: data.level || "GII",
        aql: data.aql || 2.5,
        lot_size: data.lot_size,
        sample_size,
        acceptance,
        rejection,
        inspection_date: new Date(),
      },
      include: {
        order: { select: { order_number: true } },
        inspector: { select: { first_name: true, last_name: true } },
      },
      });
    
      return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error("Error creating QC inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    );
  }
});
// AQL Sampling calculation based on ANSI/ASQ Z1.4
function calculateAQLSampling(lotSize: number, aql: number, level: string) {
  // Simplified AQL table - in production this should be a complete implementation
  const aqlTable: Record<
    string,
    { sampleSize: number; acceptance: number; rejection: number }
  > = {
    // Lot size ranges mapped to sample sizes for AQL 2.5
    "9-15": { sampleSize: 2, acceptance: 0, rejection: 1 },
    "16-25": { sampleSize: 3, acceptance: 0, rejection: 1 },
    "26-50": { sampleSize: 5, acceptance: 0, rejection: 1 },
    "51-90": { sampleSize: 8, acceptance: 0, rejection: 1 },
    "91-150": { sampleSize: 13, acceptance: 1, rejection: 2 },
    "151-280": { sampleSize: 20, acceptance: 1, rejection: 2 },
    "281-500": { sampleSize: 32, acceptance: 2, rejection: 3 },
    "501-1200": { sampleSize: 50, acceptance: 3, rejection: 4 },
    "1201-3200": { sampleSize: 80, acceptance: 5, rejection: 6 },
    "3201-10000": { sampleSize: 125, acceptance: 7, rejection: 8 },
    "10001+": { sampleSize: 200, acceptance: 10, rejection: 11 },
  };

  // Find appropriate sample size based on lot size
  let key = "10001+";
  if (lotSize <= 15) key = "9-15";
  else if (lotSize <= 25) key = "16-25";
  else if (lotSize <= 50) key = "26-50";
  else if (lotSize <= 90) key = "51-90";
  else if (lotSize <= 150) key = "91-150";
  else if (lotSize <= 280) key = "151-280";
  else if (lotSize <= 500) key = "281-500";
  else if (lotSize <= 1200) key = "501-1200";
  else if (lotSize <= 3200) key = "1201-3200";
  else if (lotSize <= 10000) key = "3201-10000";

  const result = aqlTable[key];
  return {
    sample_size: result.sampleSize,
    acceptance: result.acceptance,
    rejection: result.rejection,
  };
}
