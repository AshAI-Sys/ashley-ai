"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const sss_1 = require("@/lib/government/sss");
const philhealth_1 = require("@/lib/government/philhealth");
const pagibig_1 = require("@/lib/government/pagibig");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/government/reports - Generate government remittance reports
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { agency, period, workspace_id, employer_details, employee_ids } = body;
        if (!agency || !period || !workspace_id) {
            return server_1.NextResponse.json({ error: "agency, period, and workspace_id are required" }, { status: 400 });
        }
        // Fetch employees
        const employees = await prisma.employee.findMany({
            where: {
                workspace_id,
                ...(employee_ids && employee_ids.length > 0
                    ? { id: { in: employee_ids } }
                    : {}),
                is_active: true,
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                contact_info: true, // Contains SSS, PhilHealth, Pag-IBIG numbers
                base_salary: true,
                piece_rate: true,
                salary_type: true,
            },
        });
        if (employees.length === 0) {
            return server_1.NextResponse.json({ error: "No active employees found" }, { status: 404 });
        }
        let report = null;
        // Parse contact_info JSON to extract government IDs
        const employeesWithGovIds = employees.map(emp => {
            let contactInfo = {};
            try {
                contactInfo = emp.contact_info ? JSON.parse(emp.contact_info) : {};
            }
            catch (e) {
                // If parsing fails, use empty object
                const monthlySalary = emp.base_salary || emp.piece_rate || 0;
                return {
                    ...emp,
                    sss_number: contactInfo.sss_number || null,
                    philhealth_number: contactInfo.philhealth_number || null,
                    pagibig_number: contactInfo.pagibig_number || null,
                    monthly_salary: monthlySalary,
                };
                switch (agency.toUpperCase()) {
                    case "SSS":
                        const sssEmployees = employeesWithGovIds
                            .filter(emp => emp.sss_number)
                            .map(emp => ({
                            employee_id: emp.id,
                            employee_name: `${emp.first_name} ${emp.last_name}`,
                            sss_number: emp.sss_number,
                            monthly_salary: emp.monthly_salary,
                        }));
                        report = await sss_1.sssService.generateRemittanceReport(period, employer_details || {
                            sss_number: "00-0000000-0",
                            name: "Ashley AI Manufacturing",
                            address: "Philippines",
                        }, sssEmployees);
                        break;
                    case "PHILHEALTH":
                        const philhealthEmployees = employeesWithGovIds
                            .filter(emp => emp.philhealth_number)
                            .map(emp => ({
                            employee_id: emp.id,
                            employee_name: `${emp.first_name} ${emp.last_name}`,
                            philhealth_number: emp.philhealth_number,
                            monthly_salary: emp.monthly_salary,
                        }));
                        report = await philhealth_1.philHealthService.generateRemittanceReport(period, employer_details || {
                            pen: "00-000000000-0",
                            name: "Ashley AI Manufacturing",
                            address: "Philippines",
                        }, philhealthEmployees);
                        break;
                    case "PAGIBIG":
                        const pagibigEmployees = employeesWithGovIds
                            .filter(emp => emp.pagibig_number)
                            .map(emp => ({
                            employee_id: emp.id,
                            employee_name: `${emp.first_name} ${emp.last_name}`,
                            pagibig_number: emp.pagibig_number,
                            monthly_salary: emp.monthly_salary,
                        }));
                        report = await pagibig_1.pagIBIGService.generateRemittanceReport(period, employer_details || {
                            employer_id: "0000-0000-0000",
                            name: "Ashley AI Manufacturing",
                            address: "Philippines",
                        }, pagibigEmployees);
                        break;
                }
                break;
            }
        });
    }
    finally {
    }
});
return server_1.NextResponse.json({ error: "Invalid agency. Must be SSS, PHILHEALTH, or PAGIBIG" }, { status: 400 });
return server_1.NextResponse.json({
    success: true,
    agency,
    period,
    report,
});
try { }
catch (error) {
    console.error("Error generating government report:", error);
    return server_1.NextResponse.json({ error: "Failed to generate report", details: error.message }, { status: 500 });
}
// GET /api/government/reports - Get contribution calculations for a single employee
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const employee_id = searchParams.get("employee_id");
        const monthly_salary = searchParams.get("monthly_salary");
        if (!monthly_salary) {
            return server_1.NextResponse.json({ error: "monthly_salary is required" }, { status: 400 });
        }
        const salary = parseFloat(monthly_salary);
        // Calculate all contributions
        const sss = sss_1.sssService.calculateContribution(salary);
        const philhealth = philhealth_1.philHealthService.calculateContribution(salary);
        const pagibig = pagibig_1.pagIBIGService.calculateContribution(salary);
        // Total deductions
        const totalEE = sss.ee_contribution +
            philhealth.ee_contribution +
            pagibig.ee_contribution;
        const totalER = sss.er_contribution +
            philhealth.er_contribution +
            pagibig.er_contribution;
        const grandTotal = totalEE + totalER;
        // Get employee details if ID provided
        let employee = null;
        if (employee_id) {
            const emp = await prisma.employee.findUnique({
                where: { id: employee_id },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    contact_info: true,
                },
            });
            if (emp) {
                let contactInfo = {};
                try {
                    contactInfo = emp.contact_info ? JSON.parse(emp.contact_info) : {};
                }
                catch (e) {
                    // If parsing fails, use empty object
                }
                employee = {
                    id: emp.id,
                    first_name: emp.first_name,
                    last_name: emp.last_name,
                    sss_number: contactInfo.sss_number || null,
                    philhealth_number: contactInfo.philhealth_number || null,
                    pagibig_number: contactInfo.pagibig_number || null,
                };
                return server_1.NextResponse.json({
                    employee,
                    monthly_salary: salary,
                    contributions: {
                        sss: {
                            monthly_salary_credit: sss.monthly_salary_credit,
                            ee_contribution: sss.ee_contribution,
                            er_contribution: sss.er_contribution,
                            ec_contribution: sss.ec_contribution,
                            total: sss.total_contribution,
                        },
                        philhealth: {
                            monthly_salary_credit: philhealth.monthly_salary_credit,
                            premium: philhealth.premium_contribution,
                            ee_contribution: philhealth.ee_contribution,
                            er_contribution: philhealth.er_contribution,
                        },
                        pagibig: {
                            ee_rate: pagibig.ee_rate,
                            er_rate: pagibig.er_rate,
                            ee_contribution: pagibig.ee_contribution,
                            er_contribution: pagibig.er_contribution,
                            total: pagibig.total_contribution,
                        },
                    },
                    totals: {
                        total_employee_deduction: Math.round(totalEE * 100) / 100,
                        total_employer_contribution: Math.round(totalER * 100) / 100,
                        grand_total: Math.round(grandTotal * 100) / 100,
                    },
                });
            }
            try { }
            catch (error) {
                console.error("Error calculating contributions:", error);
                return server_1.NextResponse.json({ error: "Failed to calculate contributions", details: error.message }, { status: 500 });
            }
        }
    }
    finally { }
});
