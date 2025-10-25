"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const bir_1 = require("@/lib/government/bir");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/government/bir - Generate BIR reports (Sales Book, Purchase Book, 2307)
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { report_type, period, workspace_id, data } = body;
        if (!report_type || !period || !workspace_id) {
            return server_1.NextResponse.json({ error: "report_type, period, and workspace_id are required" }, { status: 400 });
        }
        let report = null;
        switch (report_type.toUpperCase()) {
            case "SALES_BOOK":
                // Fetch invoices for sales book
                const invoices = await prisma.invoice.findMany({
                    where: {
                        workspace_id,
                        issue_date: {
                            gte: new Date(period.from),
                            lte: new Date(period.to),
                        },
                        status: { not: "CANCELLED" },
                    },
                    include: {
                        client: true,
                    },
                });
                const salesEntries = invoices.map(inv => {
                    const vat = bir_1.birService.calculateVAT(inv.total_amount);
                    return {
                        date: inv.issue_date.toISOString().split("T")[0],
                        invoice_number: inv.invoice_number,
                        customer_name: inv.client.name,
                        tin: inv.client.tax_id || "",
                        address: inv.client.address || "",
                        amount: vat.net,
                        vat_amount: vat.vat,
                        total_amount: inv.total_amount,
                    };
                });
                report = await bir_1.birService.generateSalesBook(salesEntries, period);
                break;
            case "PURCHASE_BOOK":
                // Fetch expenses for purchase book
                const expenses = await prisma.expense.findMany({
                    where: {
                        workspace_id,
                        expense_date: {
                            gte: new Date(period.from),
                            lte: new Date(period.to),
                        },
                        approved: true,
                    },
                });
                const purchaseEntries = expenses.map(exp => {
                    const vat = bir_1.birService.calculateVAT(exp.amount);
                    return {
                        date: exp.expense_date.toISOString().split("T")[0],
                        reference_number: exp.payment_ref || exp.id,
                        supplier_name: exp.supplier || "N/A",
                        tin: "000-000-000-000", // Should be stored in supplier/vendor table
                        address: "",
                        amount: vat.net,
                        vat_amount: vat.vat,
                        total_amount: exp.amount,
                    };
                });
                report = await bir_1.birService.generatePurchaseBook(purchaseEntries, period);
                break;
            case "FORM_2307":
                if (!data || !data.payor || !data.payee || !data.withholding_entries) {
                    return server_1.NextResponse.json({
                        error: "Form 2307 requires payor, payee, and withholding_entries data",
                    }, { status: 400 });
                }
                report = await bir_1.birService.generate2307Form({
                    period_covered: period,
                    payor: data.payor,
                    payee: data.payee,
                    withholding_entries: data.withholding_entries,
                    total_tax_withheld: 0, // Will be calculated
                });
                break;
            default:
                return server_1.NextResponse.json({
                    error: "Invalid report_type. Must be SALES_BOOK, PURCHASE_BOOK, or FORM_2307",
                }, { status: 400 });
        }
        return server_1.NextResponse.json({
            success: true,
            report_type,
            period,
            report,
        });
    }
    catch (error) {
        console.error("Error generating BIR report:", error);
        return server_1.NextResponse.json({ error: "Failed to generate BIR report", details: error.message }, { status: 500 });
    }
});
// GET /api/government/bir - Calculate VAT or withholding tax
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const operation = searchParams.get("operation"); // 'vat' or 'withholding'
        const amount = searchParams.get("amount");
        const atc_code = searchParams.get("atc_code");
        if (!operation || !amount) {
            return server_1.NextResponse.json({ error: "operation and amount are required" }, { status: 400 });
        }
        const numAmount = parseFloat(amount);
        let result = null;
        switch (operation.toLowerCase()) {
            case "calculate_vat":
                result = bir_1.birService.calculateVAT(numAmount);
                break;
            case "add_vat":
                result = bir_1.birService.addVAT(numAmount);
                break;
            case "withholding":
                if (!atc_code) {
                    return server_1.NextResponse.json({ error: "atc_code is required for withholding calculation" }, { status: 400 });
                }
                result = bir_1.birService.calculateWithholdingTax(numAmount, atc_code);
                result.atc_description = bir_1.birService.getATCDescription(atc_code);
                break;
            case "validate_tin":
                const tin = searchParams.get("tin");
                if (!tin) {
                    return server_1.NextResponse.json({ error: "tin is required for validation" }, { status: 400 });
                }
                result = {
                    tin,
                    is_valid: bir_1.birService.validateTIN(tin),
                    formatted: bir_1.birService.formatTIN(tin),
                };
                break;
            default:
                return server_1.NextResponse.json({
                    error: "Invalid operation. Must be calculate_vat, add_vat, withholding, or validate_tin",
                }, { status: 400 });
        }
        return server_1.NextResponse.json({ success: true, operation, result });
    }
    catch (error) {
        console.error("Error in BIR calculation:", error);
        return server_1.NextResponse.json({ error: "Failed to perform BIR calculation", details: error.message }, { status: 500 });
    }
});
