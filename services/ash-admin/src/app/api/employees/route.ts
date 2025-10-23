import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    // Fixed: Changed createdAt to created_at;
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const position = searchParams.get("position");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (department) {
      where.department = department;

    if (status) {
      where.status = status;

    if (position) {
      where.position = position;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
});
