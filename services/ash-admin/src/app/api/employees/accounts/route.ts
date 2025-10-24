/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Employee accounts reference - for admin use only
export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    // Employee accounts with their login credentials and permissions;
    const employeeDirectory = [
      // Admin Accounts
      {
        employeeId: "EMP-001",
        name: "Ashley AI Admin",
        email: "admin@ashleyai.com",
        password: "admin123",
        role: "admin",
        position: "System Administrator",
        department: "Administration",
        access: "Full system access - All modules",
      },
      {
        employeeId: "EMP-002",
        name: "Production Manager",
        email: "manager@ashleyai.com",
        password: "manager123",
        role: "manager",
        position: "Production Manager",
        department: "Production",
        access: "Orders, Production, Quality, Employees, Reports",
      },

      // Design Department
      {
        employeeId: "EMP-003",
        name: "Maria Santos",
        email: "designer@ashleyai.com",
        password: "design123",
        role: "designer",
        position: "Senior Designer",
        department: "Design",
        access: "Design module, Orders view, Clients view",
      },

      // Cutting Department
      {
        employeeId: "EMP-004",
        name: "Juan Dela Cruz",
        email: "cutting.supervisor@ashleyai.com",
        password: "cutting123",
        role: "cutting_supervisor",
        position: "Cutting Supervisor",
        department: "Cutting",
        access: "Cutting operations, Orders view, Production view",
      },
      {
        employeeId: "EMP-005",
        name: "Pedro Garcia",
        email: "cutting.operator@ashleyai.com",
        password: "operator123",
        role: "cutting_operator",
        position: "Cutting Operator",
        department: "Cutting",
        access: "Cutting operations (limited), Production view",
      },

      // Printing Department
      {
        employeeId: "EMP-006",
        name: "Ana Reyes",
        email: "printing.supervisor@ashleyai.com",
        password: "printing123",
        role: "printing_supervisor",
        position: "Printing Supervisor",
        department: "Printing",
        access: "Printing operations, Orders view, Production view",
      },

      // Sewing Department
      {
        employeeId: "EMP-007",
        name: "Rosa Martinez",
        email: "sewing.supervisor@ashleyai.com",
        password: "sewing123",
        role: "sewing_supervisor",
        position: "Sewing Supervisor",
        department: "Sewing",
        access: "Sewing operations, Orders view, Production view",
      },
      {
        employeeId: "EMP-008",
        name: "Carmen Lopez",
        email: "sewing.operator@ashleyai.com",
        password: "sewing123",
        role: "sewing_operator",
        position: "Sewing Operator",
        department: "Sewing",
        access: "Sewing operations (limited)",
      },

      // Quality Control
      {
        employeeId: "EMP-009",
        name: "Miguel Torres",
        email: "qc.inspector@ashleyai.com",
        password: "qc123",
        role: "qc_inspector",
        position: "QC Inspector",
        department: "Quality Control",
        access: "Quality Control, Orders view, Production view",
      },

      // Warehouse/Finishing
      {
        employeeId: "EMP-010",
        name: "Jose Hernandez",
        email: "warehouse.staff@ashleyai.com",
        password: "warehouse123",
        role: "warehouse_staff",
        position: "Warehouse Staff",
        department: "Warehouse",
        access: "Finishing & Packing, Delivery view, Inventory view",
      },

      // Delivery
      {
        employeeId: "EMP-011",
        name: "Mark Cruz",
        email: "delivery.coordinator@ashleyai.com",
        password: "delivery123",
        role: "delivery_coordinator",
        position: "Delivery Coordinator",
        department: "Logistics",
        access: "Delivery Management, Orders view, Clients view",
      },

      // HR
      {
        employeeId: "EMP-012",
        name: "Linda Aquino",
        email: "hr.staff@ashleyai.com",
        password: "hr123",
        role: "hr_staff",
        position: "HR Staff",
        department: "Human Resources",
        access: "HR & Payroll, Employee management, Reports",
      },

      // Finance
      {
        employeeId: "EMP-013",
        name: "Robert Tan",
        email: "finance.staff@ashleyai.com",
        password: "finance123",
        role: "finance_staff",
        position: "Finance Staff",
        department: "Finance",
        access: "Finance module, Orders view, Clients view, Reports",
      },

      // Customer Service Representative
      {
        employeeId: "EMP-014",
        name: "Grace Mendoza",
        email: "csr@ashleyai.com",
        password: "csr123",
        role: "csr",
        position: "Customer Service Rep",
        department: "Customer Service",
        access: "Client management, Orders view/create, Communication",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        total_employees: employeeDirectory.length,
        employees: employeeDirectory,
        note: "Each employee has restricted access based on their role and department",
      },
    });
  } catch (error) {
    console.error("Error fetching employee accounts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee accounts" },
      { status: 500 }
    );
  }
});