"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handling_1 = require("../../../../lib/error-handling");
const JWT_SECRET = process.env.JWT_SECRET || "ashley-ai-jwt-secret-2025-production";
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
    const data = await request.json();
    const { email, password } = data;
    // Validate required fields
    const validationError = (0, error_handling_1.validateRequiredFields)(data, ["email", "password"]);
    if (validationError) {
        throw validationError;
    }
    // Find employee by email
    const employee = await db_1.prisma.employee.findUnique({
        where: { email },
        include: {
            workspace: true,
        },
    });
    if (!employee) {
        return server_1.NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    // Check if employee is active
    if (!employee.is_active) {
        return server_1.NextResponse.json({ error: "Your account has been deactivated. Please contact HR." }, { status: 403 });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password_hash);
    if (!isPasswordValid) {
        return server_1.NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({
        id: employee.id,
        email: employee.email,
        role: employee.role,
        position: employee.position,
        department: employee.department,
        employee_number: employee.employee_number,
        type: "employee",
    }, JWT_SECRET, { expiresIn: "8h" } // 8-hour shift
    );
    // Prepare employee data (excluding sensitive fields)
    const employeeData = {
        id: employee.id,
        employee_number: employee.employee_number,
        name: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        role: employee.role,
        position: employee.position,
        department: employee.department,
        salary_type: employee.salary_type,
        workspace: {
            id: employee.workspace.id,
            name: employee.workspace.name,
            slug: employee.workspace.slug,
        },
    };
    return (0, error_handling_1.createSuccessResponse)({
        success: true,
        access_token: token,
        token_type: "Bearer",
        expires_in: 28800, // 8 hours in seconds
        employee: employeeData,
    });
});
