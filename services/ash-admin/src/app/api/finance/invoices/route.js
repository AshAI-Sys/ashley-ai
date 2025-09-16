"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const client_id = searchParams.get('client_id');
        const brand_id = searchParams.get('brand_id');
        const overdue_only = searchParams.get('overdue_only');
        const where = {};
        if (status && status !== 'all')
            where.status = status;
        if (client_id)
            where.client_id = client_id;
        if (brand_id)
            where.brand_id = brand_id;
        // For overdue invoices
        if (overdue_only === 'true') {
            where.due_date = { lt: new Date() };
            where.status = { in: ['OPEN', 'PARTIAL'] };
        }
        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                client: { select: { name: true } },
                brand: { select: { name: true } },
                order: { select: { order_number: true } },
                invoice_lines: true,
                payment_allocations: {
                    include: {
                        payment: { select: { amount: true, source: true, received_at: true } }
                    }
                }
            },
            orderBy: { date_issued: 'desc' }
        });
        // Calculate days overdue and other metrics
        const processedInvoices = invoices.map(invoice => {
            const today = new Date();
            const dueDate = new Date(invoice.due_date);
            const daysOverdue = invoice.status !== 'PAID' && dueDate < today
                ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                : null;
            return {
                ...invoice,
                days_overdue: daysOverdue,
                payment_history: invoice.payment_allocations.map(allocation => ({
                    amount: allocation.amount,
                    source: allocation.payment.source,
                    date: allocation.payment.received_at
                }))
            };
        });
        return server_1.NextResponse.json({
            success: true,
            data: processedInvoices
        });
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch invoices' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const { brand_id, client_id, order_id, lines, discount = 0, tax_mode = 'VAT_INCLUSIVE', due_date } = data;
        // Generate invoice number
        const brand = await prisma.brand.findUnique({ where: { id: brand_id } });
        const year = new Date().getFullYear();
        const invoiceCount = await prisma.invoice.count({
            where: {
                brand_id,
                date_issued: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1)
                }
            }
        });
        const invoiceNo = `${brand?.name.toUpperCase()}-${year}-${String(invoiceCount + 1).padStart(5, '0')}`;
        // Calculate totals
        let subtotal = 0;
        const processedLines = lines.map((line) => {
            const lineTotal = line.qty * line.unit_price;
            subtotal += lineTotal;
            return {
                ...line,
                line_total: lineTotal
            };
        });
        const discountAmount = (subtotal * discount) / 100;
        const netAmount = subtotal - discountAmount;
        let vatAmount = 0;
        let total = netAmount;
        if (tax_mode === 'VAT_INCLUSIVE') {
            vatAmount = netAmount * 0.12 / 1.12;
            total = netAmount;
        }
        else if (tax_mode === 'VAT_EXCLUSIVE') {
            vatAmount = netAmount * 0.12;
            total = netAmount + vatAmount;
        }
        // Create invoice with transaction
        const invoice = await prisma.invoice.create({
            data: {
                workspace_id: 'default',
                brand_id,
                client_id,
                order_id,
                invoice_no: invoiceNo,
                date_issued: new Date(),
                due_date: due_date ? new Date(due_date) : null,
                tax_mode,
                subtotal,
                discount: discountAmount,
                vat_amount: vatAmount,
                total,
                balance: total,
                invoice_lines: {
                    create: processedLines
                }
            },
            include: {
                client: { select: { name: true } },
                brand: { select: { name: true } },
                invoice_lines: true
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: invoice
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create invoice' }, { status: 500 });
    }
}
