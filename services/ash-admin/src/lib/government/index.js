"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagIBIGService = exports.pagIBIGService = exports.PhilHealthService = exports.philHealthService = exports.SSSService = exports.sssService = exports.BIRService = exports.birService = void 0;
// Government API Services - Philippine Compliance
var bir_1 = require("./bir");
Object.defineProperty(exports, "birService", { enumerable: true, get: function () { return bir_1.birService; } });
Object.defineProperty(exports, "BIRService", { enumerable: true, get: function () { return bir_1.BIRService; } });
var sss_1 = require("./sss");
Object.defineProperty(exports, "sssService", { enumerable: true, get: function () { return sss_1.sssService; } });
Object.defineProperty(exports, "SSSService", { enumerable: true, get: function () { return sss_1.SSSService; } });
var philhealth_1 = require("./philhealth");
Object.defineProperty(exports, "philHealthService", { enumerable: true, get: function () { return philhealth_1.philHealthService; } });
Object.defineProperty(exports, "PhilHealthService", { enumerable: true, get: function () { return philhealth_1.PhilHealthService; } });
var pagibig_1 = require("./pagibig");
Object.defineProperty(exports, "pagIBIGService", { enumerable: true, get: function () { return pagibig_1.pagIBIGService; } });
Object.defineProperty(exports, "PagIBIGService", { enumerable: true, get: function () { return pagibig_1.PagIBIGService; } });
/**
 * Government API Service Manager
 *
 * This module provides services for Philippine government compliance:
 *
 * 1. BIR (Bureau of Internal Revenue)
 *    - 12% VAT calculations
 *    - Withholding tax calculations with ATC codes
 *    - Sales and Purchase book generation
 *    - Form 2307 (Certificate of Creditable Tax Withheld)
 *
 * 2. SSS (Social Security System)
 *    - 2025 contribution table (34 salary brackets)
 *    - Employee, Employer, and EC contributions
 *    - Remittance report generation
 *
 * 3. PhilHealth (Philippine Health Insurance Corporation)
 *    - 5% premium rate (2025)
 *    - 50-50 employee-employer split
 *    - Remittance report generation
 *
 * 4. Pag-IBIG (Home Development Mutual Fund)
 *    - Progressive rate structure (1-2% employee, 2% employer)
 *    - Capped at ₱200 per share
 *    - Remittance report generation
 *    - Loan amortization calculator
 *
 * Usage:
 * ```typescript
 * import { birService, sssService, philHealthService, pagIBIGService } from '@/lib/government'
 *
 * // Calculate VAT
 * const vat = birService.calculateVAT(11200) // { net: 10000, vat: 1200, gross: 11200 }
 *
 * // Calculate SSS contribution
 * const sss = sssService.calculateContribution(25000)
 * // { monthly_salary_credit: 25000, ee_contribution: 1125, er_contribution: 2500, ... }
 *
 * // Calculate PhilHealth
 * const philhealth = philHealthService.calculateContribution(25000)
 * // { monthly_salary_credit: 25000, premium_contribution: 1250, ee_contribution: 625, ... }
 *
 * // Calculate Pag-IBIG
 * const pagibig = pagIBIGService.calculateContribution(25000)
 * // { ee_contribution: 200, er_contribution: 200, ... } (capped at ₱200)
 * ```
 */
