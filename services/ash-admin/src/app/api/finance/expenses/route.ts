import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/finance/expenses - List all expenses with filters
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");
    const approved = searchParams.get("approved");
    const supplier = searchParams.get("supplier");
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "100");

    const where: any = { workspace_id: user.workspaceId };

    if (category && category !== "all") {
      where.category = category;
    }

    if (subcategory) {
      where.subcategory = { contains: subcategory };
    }

    if (supplier) {
      where.supplier = { contains: supplier };
    }

    if (approved && approved !== "all") {
      where.approved = approved === "true";
    }

    if (date_from || date_to) {
      where.expense_date = {};
      if (date_from) where.expense_date.gte = new Date(date_from);
      if (date_to) where.expense_date.lte = new Date(date_to);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { expense_date: "desc" },
        skip,
        take,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
});

// POST /api/finance/expenses - Create new expense
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();
    const {
      category,
      subcategory,
      description,
      amount,
      expense_date,
      payment_method,
      payment_ref,
      supplier,
      tax_amount,
      receipt_url,
      order_id,
      notes,
    } = data;

    if (!category || !description || !amount || !expense_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, description, amount, expense_date",
        },
        { status: 400 }
      );
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const todayCount = await prisma.expense.count({
      where: {
        workspace_id: user.workspaceId,
        created_at: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const sequenceNumber = String(todayCount + 1).padStart(4, "0");
    const expense_number = `EXP-${dateStr}-${sequenceNumber}`;

    const expense = await prisma.expense.create({
      data: {
        workspace_id: user.workspaceId,
        expense_number,
        category,
        subcategory: subcategory || null,
        description,
        amount: parseFloat(amount),
        currency: "PHP",
        expense_date: new Date(expense_date),
        payment_method: payment_method || null,
        payment_ref: payment_ref || null,
        supplier: supplier || null,
        tax_amount: tax_amount ? parseFloat(tax_amount) : 0,
        receipt_url: receipt_url || null,
        order_id: order_id || null,
        notes: notes || null,
        created_by: user.id,
        approved: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create expense" },
      { status: 500 }
    );
  }
});

// PUT /api/finance/expenses - Update expense or approve
export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();
    const { id, approve, ...updateFields } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing expense ID" },
        { status: 400 }
      );
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    if (existingExpense.workspace_id !== user.workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this expense" },
        { status: 403 }
      );
    }

    if (approve) {
      const expense = await prisma.expense.update({
        where: { id },
        data: {
          approved: true,
          approved_by: user.id,
          approved_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: expense,
      });
    }

    if (existingExpense.approved) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot update approved expense",
        },
        { status: 400 }
      );
    }

    const { workspace_id, expense_number, created_by, ...allowedFields } = updateFields;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...allowedFields,
        amount: allowedFields.amount ? parseFloat(allowedFields.amount) : undefined,
        tax_amount: allowedFields.tax_amount ? parseFloat(allowedFields.tax_amount) : undefined,
        expense_date: allowedFields.expense_date ? new Date(allowedFields.expense_date) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update expense" },
      { status: 500 }
    );
  }
});

// DELETE /api/finance/expenses
export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing expense ID" },
        { status: 400 }
      );
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    if (existingExpense.workspace_id !== user.workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (existingExpense.approved) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete approved expense",
        },
        { status: 400 }
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete expense" },
      { status: 500 }
    );
  }
});
