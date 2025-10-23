/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// Note: Supplier model not yet implemented in schema
// Using expense.supplier field as temporary solution
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Get unique suppliers from expenses
    const expenses = await prisma.expense.findMany({
      where: search
        ? {
            supplier: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      select: {
        supplier: true,
        _count: true,
      },
      distinct: ["supplier"],
      });

    // Format as supplier list
    const suppliers = expenses
      .filter(e => e.supplier)
      .map(e => ({
        name: e.supplier,
        expense_count: 1, // Simplified for now
      }));

    return NextResponse.json({
      success: true,
      data: suppliers,
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // Supplier model not implemented yet
    // Return success but don't create anything;
    return NextResponse.json(
      {
        success: false,
        error:
          "Supplier model not yet implemented. Suppliers are tracked via Expense records.",
      },
      { status: 501 });
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 }
    );
  }
});