import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context: { params: { id: string } }
) => {
  try {
    const inspection = await prisma.qCInspection.findUnique({
      where: { id: context.params.id },
      include: {
        order: { select: { order_number: true } },
        bundle: { select: { qr_code: true, size_code: true, qty: true } },
        checklist: true,
        inspector: { select: { first_name: true, last_name: true } },
        samples: {
          include: {
            defects: {
              include: {
                defect_code: true,
              },
            },
          },
        },
        defects: {
          include: {
            defect_code: true,
            sample: true,
          },
        },
        capa_tasks: true,
      },
    });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspection" },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (
  request: NextRequest,
  user,
  context: { params: { id: string } }
) => {
  try {
    const data = await request.json();

    const inspection = await prisma.qCInspection.update({
      where: { id: context.params.id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        order: { select: { order_number: true } },
        inspector: { select: { first_name: true, last_name: true } },
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error updating inspection:", error);
    return NextResponse.json(
      { error: "Failed to update inspection" },
      { status: 500 }
    );
  }
});
