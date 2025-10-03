// Philippine Government API Types

export type GovernmentAgency = 'BIR' | 'SSS' | 'PHILHEALTH' | 'PAGIBIG'

// ===== BIR (Bureau of Internal Revenue) =====

export interface BIRSalesBookEntry {
  date: string
  invoice_number: string
  customer_name: string
  tin?: string
  address?: string
  amount: number
  vat_amount: number
  vat_exempt_amount?: number
  zero_rated_amount?: number
  total_amount: number
}

export interface BIRPurchaseBookEntry {
  date: string
  reference_number: string
  supplier_name: string
  tin: string
  address?: string
  amount: number
  vat_amount: number
  non_vat_amount?: number
  total_amount: number
}

export interface BIRWithholdingTax {
  date: string
  payee_name: string
  tin: string
  atc_code: string // Alphanumeric Tax Code
  nature_of_income: string
  gross_amount: number
  tax_rate: number
  tax_withheld: number
}

export interface BIR2307Form {
  period_covered: {
    from: string
    to: string
  }
  payor: {
    tin: string
    name: string
    address: string
  }
  payee: {
    tin: string
    name: string
    address: string
  }
  withholding_entries: BIRWithholdingTax[]
  total_tax_withheld: number
}

// ===== SSS (Social Security System) =====

export interface SSSContribution {
  employee_id: string
  employee_name: string
  sss_number: string
  monthly_salary: number
  ee_contribution: number // Employee share
  er_contribution: number // Employer share
  ec_contribution: number // Employees' Compensation
  total_contribution: number
}

export interface SSSContributionTable {
  salary_range: {
    min: number
    max: number
  }
  monthly_salary_credit: number
  ee_share: number
  er_share: number
  ec_share: number
  total: number
}

export interface SSSRemittanceReport {
  period: string // YYYY-MM
  employer: {
    sss_number: string
    name: string
    address: string
  }
  contributions: SSSContribution[]
  total_ee: number
  total_er: number
  total_ec: number
  grand_total: number
}

// ===== PhilHealth (Philippine Health Insurance Corporation) =====

export interface PhilHealthContribution {
  employee_id: string
  employee_name: string
  philhealth_number: string
  monthly_salary: number
  premium_contribution: number
  ee_share: number
  er_share: number
}

export interface PhilHealthContributionTable {
  salary_range: {
    min: number
    max: number
  }
  premium_rate: number // Percentage
  monthly_premium: number
  ee_share: number
  er_share: number
}

export interface PhilHealthRemittanceReport {
  period: string // YYYY-MM
  employer: {
    pen: string // PhilHealth Employer Number
    name: string
    address: string
  }
  contributions: PhilHealthContribution[]
  total_premium: number
  total_ee: number
  total_er: number
}

// ===== Pag-IBIG (Home Development Mutual Fund) =====

export interface PagIBIGContribution {
  employee_id: string
  employee_name: string
  pagibig_number: string
  monthly_salary: number
  ee_contribution: number
  er_contribution: number
  total_contribution: number
}

export interface PagIBIGContributionTable {
  salary_range: {
    min: number
    max: number
  }
  ee_rate: number // Percentage
  er_rate: number // Percentage
  ee_amount: number
  er_amount: number
  total: number
}

export interface PagIBIGRemittanceReport {
  period: string // YYYY-MM
  employer: {
    employer_id: string
    name: string
    address: string
  }
  contributions: PagIBIGContribution[]
  total_ee: number
  total_er: number
  grand_total: number
}

// ===== Export Formats =====

export interface ExportOptions {
  format: 'CSV' | 'EXCEL' | 'PDF'
  period: {
    from: string
    to: string
  }
  include_headers?: boolean
}

export interface GovernmentReport {
  agency: GovernmentAgency
  report_type: string
  period: string
  data: any
  generated_at: string
  generated_by?: string
}
