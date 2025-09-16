import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const approved = searchParams.get('approved');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (approved !== null && approved !== 'all') {
      where.approved = approved === 'true';
    }
    if (dateFrom || dateTo) {
      where.expense_date = {};
      if (dateFrom) {
        where.expense_date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.expense_date.lte = new Date(dateTo);
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          order: {
            select: { id: true, order_number: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.expense.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      category,
      subcategory,
      description,
      amount,
      expense_date,
      payment_method,
      payment_ref,
      supplier,
      tax_amount = 0,
      receipt_url,
      order_id,
      notes
    } = body;

    // Generate expense number
    const lastExpense = await prisma.expense.findFirst({
      orderBy: { created_at: 'desc' },
      select: { expense_number: true }
    });

    const nextNumber = lastExpense
      ? parseInt(lastExpense.expense_number.split('-')[1]) + 1
      : 1;

    const expense_number = `EXP-${nextNumber.toString().padStart(6, '0')}`;

    const expense = await prisma.expense.create({
      data: {
        expense_number,
        category,
        subcategory,
        description,
        amount,
        expense_date: new Date(expense_date),
        payment_method,
        payment_ref,
        supplier,
        tax_amount,
        receipt_url,
        order_id,
        notes,
        approved: false // Requires approval by default
      },
      include: {
        order: {
          select: { id: true, order_number: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense recorded successfully'
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record expense' },
      { status: 500 }
    );
  }
}