"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const supplier_id = searchParams.get('supplier_id');
        const overdue_only = searchParams.get('overdue_only');
        const where = {};
        if (status && status !== 'all')
            where.status = status;
        if (supplier_id)
            where.supplier_id = supplier_id;
        // For overdue bills
        if (overdue_only === 'true') {
            where.due_date = { lt: new Date() };
            where.status = { in: ['OPEN', 'PARTIAL'] };
        }
        const bills = await db_1.prisma.bill.findMany({
            where,
            include: {
                supplier: { select: { name: true, tin: true } },
                brand: { select: { name: true } },
                bill_lines: true
            },
            orderBy: { date_received: 'desc' }
        });
        // Calculate days until due/overdue
        const processedBills = bills.map(bill => {
            const today = new Date();
            const dueDate = new Date(bill.due_date);
            let daysUntilDue = null;
            let daysOverdue = null;
            if (bill.status !== 'PAID') {
                const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDifference > 0) {
                    daysUntilDue = daysDifference;
                }
                else {
                    daysOverdue = Math.abs(daysDifference);
                }
            }
            return {
                ...bill,
                days_until_due: daysUntilDue,
                days_overdue: daysOverdue
            };
        });
        return server_1.NextResponse.json({
            success: true,
            data: processedBills
        });
    }
    catch (error) {
        console.error('Error fetching bills:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch bills' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const { supplier_id, brand_id, bill_no, date_received, due_date, lines, tax_mode = 'VAT_INCLUSIVE' } = data;
        // Calculate totals
        let subtotal = 0;
        const processedLines = lines.map((line) => {
            const lineTotal = line.qty * line.unit_cost;
            subtotal += lineTotal;
            return {
                ...line,
                line_total: lineTotal
            };
        });
        let vatAmount = 0;
        let total = subtotal;
        if (tax_mode === 'VAT_INCLUSIVE') {
            vatAmount = subtotal * 0.12 / 1.12;
            total = subtotal;
        }
        else if (tax_mode === 'VAT_EXCLUSIVE') {
            vatAmount = subtotal * 0.12;
            total = subtotal + vatAmount;
        }
        // Create bill with transaction
        const bill = await db_1.prisma.bill.create({
            data: {
                workspace_id: 'default',
                supplier_id,
                brand_id,
                bill_no,
                date_received: new Date(date_received),
                due_date: due_date ? new Date(due_date) : null,
                subtotal,
                vat_amount: vatAmount,
                total,
                bill_lines: {
                    create: processedLines
                }
            },
            include: {
                supplier: { select: { name: true } },
                brand: { select: { name: true } },
                bill_lines: true
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: bill
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating bill:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create bill' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const data = await request.json();
        const { id, status, payment_amount, payment_date, payment_ref } = data;
        if (status === 'PAID') {
            // Mark bill as paid
            const bill = await db_1.prisma.bill.update({
                where: { id },
                data: {
                    status: 'PAID',
                    meta: {
                        payment_amount,
                        payment_date: payment_date ? new Date(payment_date) : new Date(),
                        payment_ref
                    }
                },
                include: {
                    supplier: { select: { name: true } },
                    brand: { select: { name: true } }
                }
            });
            return server_1.NextResponse.json({
                success: true,
                data: bill
            });
        }
        // For other status updates
        const bill = await db_1.prisma.bill.update({
            where: { id },
            data: { status },
            include: {
                supplier: { select: { name: true } },
                brand: { select: { name: true } }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: bill
        });
    }
    catch (error) {
        console.error('Error updating bill:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update bill' }, { status: 500 });
    }
}
