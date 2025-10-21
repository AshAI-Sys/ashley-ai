// Government API Services - Philippine Compliance
export { birService, BIRService } from "./bir";
export { sssService, SSSService } from "./sss";
export { philHealthService, PhilHealthService } from "./philhealth";
export { pagIBIGService, PagIBIGService } from "./pagibig";

export type {
  GovernmentAgency,
  // BIR Types
  BIRSalesBookEntry,
  BIRPurchaseBookEntry,
  BIRWithholdingTax,
  BIR2307Form,
  // SSS Types
  SSSContribution,
  SSSContributionTable,
  SSSRemittanceReport,
  // PhilHealth Types
  PhilHealthContribution,
  PhilHealthContributionTable,
  PhilHealthRemittanceReport,
  // Pag-IBIG Types
  PagIBIGContribution,
  PagIBIGContributionTable,
  PagIBIGRemittanceReport,
  // Export Types
  ExportOptions,
  GovernmentReport,
} from "./types";

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
