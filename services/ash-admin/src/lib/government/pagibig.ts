import {
  PagIBIGContribution,
  PagIBIGContributionTable,
  PagIBIGRemittanceReport,
} from "./types";

/**
 * Pag-IBIG (Home Development Mutual Fund) Service
 * Philippine housing fund contribution calculations (2025 rates)
 */

export class PagIBIGService {
  /**
   * Calculate Pag-IBIG contribution for an employee
   * Rate structure:
   * - ≤ ₱1,500: 1% EE, 2% ER
   * - > ₱1,500: 2% EE, 2% ER
   * - Max employee contribution: ₱200/month
   * - Max employer contribution: ₱200/month
   */
  calculateContribution(monthlySalary: number): {
    ee_contribution: number;
    er_contribution: number;
    total_contribution: number;
    ee_rate: number;
    er_rate: number;
  } {
    let eeRate = 0.02; // Default 2%
    let erRate = 0.02; // Fixed 2%

    // If salary is ≤ ₱1,500, employee rate is 1%
    if (monthlySalary <= 1500) {
      eeRate = 0.01;
    }

    // Calculate contributions
    let eeContribution = monthlySalary * eeRate;
    let erContribution = monthlySalary * erRate;

    // Cap at maximum ₱200 for employee
    if (eeContribution > 200) {
      eeContribution = 200;
    }

    // Cap at maximum ₱200 for employer
    if (erContribution > 200) {
      erContribution = 200;
    }

    return {
      ee_contribution: Math.round(eeContribution * 100) / 100,
      er_contribution: Math.round(erContribution * 100) / 100,
      total_contribution:
        Math.round((eeContribution + erContribution) * 100) / 100,
      ee_rate: eeRate,
      er_rate: erRate,
    };
  }

  /**
   * Generate Pag-IBIG contribution table for reference
   */
  getContributionTable(): PagIBIGContributionTable[] {
    const table: PagIBIGContributionTable[] = [];

    // Low income bracket (≤ ₱1,500)
    table.push({
      salary_range: { min: 0, max: 1500 },
      ee_rate: 0.01,
      er_rate: 0.02,
      ee_amount: 15, // 1% of 1500
      er_amount: 30, // 2% of 1500
      total: 45,
    });

    // Standard bracket (> ₱1,500 to ₱10,000)
    for (let salary = 2000; salary <= 10000; salary += 1000) {
      const eeAmount = Math.min(salary * 0.02, 200);
      const erAmount = Math.min(salary * 0.02, 200);
      table.push({
        salary_range: { min: salary - 999, max: salary },
        ee_rate: 0.02,
        er_rate: 0.02,
        ee_amount: Math.round(eeAmount * 100) / 100,
        er_amount: Math.round(erAmount * 100) / 100,
        total: Math.round((eeAmount + erAmount) * 100) / 100,
      });
    }

    // High income bracket (> ₱10,000 - capped at ₱200 each)
    table.push({
      salary_range: { min: 10001, max: Infinity },
      ee_rate: 0.02,
      er_rate: 0.02,
      ee_amount: 200, // Capped
      er_amount: 200, // Capped
      total: 400,
    });

    return table;
  }

  /**
   * Generate Pag-IBIG remittance report for a period
   */
  async generateRemittanceReport(
    period: string,
    employer: { employer_id: string; name: string; address: string },
    employees: Array<{
      employee_id: string;
      employee_name: string;
      pagibig_number: string;
      monthly_salary: number;
    }>
  ): Promise<PagIBIGRemittanceReport> {
    const contributions: PagIBIGContribution[] = employees.map(emp => {
      const calc = this.calculateContribution(emp.monthly_salary);
      return {
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        pagibig_number: emp.pagibig_number,
        monthly_salary: emp.monthly_salary,
        ee_contribution: calc.ee_contribution,
        er_contribution: calc.er_contribution,
        total_contribution: calc.total_contribution,
      };
    });

    const total_ee = contributions.reduce(
      (sum, c) => sum + c.ee_contribution,
      0
    );
    const total_er = contributions.reduce(
      (sum, c) => sum + c.er_contribution,
      0
    );
    const grand_total = total_ee + total_er;

    return {
      period,
      employer,
      contributions,
      total_ee: Math.round(total_ee * 100) / 100,
      total_er: Math.round(total_er * 100) / 100,
      grand_total: Math.round(grand_total * 100) / 100,
    };
  }

  /**
   * Validate Pag-IBIG MID number format
   * Format: XXXX-XXXX-XXXX (12 digits)
   */
  validatePagIBIGNumber(pagibigNumber: string): boolean {
    const cleaned = pagibigNumber.replace(/-/g, "");
    return /^\d{12}$/.test(cleaned);
  }

  /**
   * Format Pag-IBIG number with dashes
   */
  formatPagIBIGNumber(pagibigNumber: string): string {
    const cleaned = pagibigNumber.replace(/-/g, "");
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
    }
    return pagibigNumber;
  }

  /**
   * Calculate loan amortization (housing loan estimate)
   */
  calculateLoanAmortization(
    loanAmount: number,
    interestRate: number,
    termYears: number
  ): {
    monthly_amortization: number;
    total_interest: number;
    total_amount_payable: number;
  } {
    const monthlyRate = interestRate / 12 / 100;
    const numPayments = termYears * 12;

    // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayable = monthlyPayment * numPayments;
    const totalInterest = totalPayable - loanAmount;

    return {
      monthly_amortization: Math.round(monthlyPayment * 100) / 100,
      total_interest: Math.round(totalInterest * 100) / 100,
      total_amount_payable: Math.round(totalPayable * 100) / 100,
    };
  }

  /**
   * Estimate maximum loanable amount based on contributions
   * Rule of thumb: 80% of total accumulated value (TAV) or salary-based multiplier
   */
  estimateMaxLoanable(
    totalAccumulatedValue: number,
    monthlySalary: number,
    yearsOfContribution: number
  ): {
    max_loanable_tav_based: number;
    max_loanable_salary_based: number;
    recommended_amount: number;
  } {
    // TAV-based: 80% of accumulated savings
    const tavBased = totalAccumulatedValue * 0.8;

    // Salary-based: Up to 100x monthly salary (depends on years of contribution)
    let multiplier = 100;
    if (yearsOfContribution >= 24) {
      multiplier = 100;
    } else if (yearsOfContribution >= 10) {
      multiplier = 80;
    } else if (yearsOfContribution >= 5) {
      multiplier = 60;
    } else {
      multiplier = 40;
    }
    const salaryBased = monthlySalary * multiplier;

    // Take the higher of the two, capped at ₱6,000,000
    const recommended = Math.min(Math.max(tavBased, salaryBased), 6000000);

    return {
      max_loanable_tav_based: Math.round(tavBased * 100) / 100,
      max_loanable_salary_based: Math.round(salaryBased * 100) / 100,
      recommended_amount: Math.round(recommended * 100) / 100,
    };
  }

  /**
   * Calculate annual contribution for budgeting
   */
  calculateAnnualContribution(monthlySalary: number): {
    monthly_ee: number;
    monthly_er: number;
    annual_ee: number;
    annual_er: number;
    annual_total: number;
  } {
    const calc = this.calculateContribution(monthlySalary);

    return {
      monthly_ee: calc.ee_contribution,
      monthly_er: calc.er_contribution,
      annual_ee: Math.round(calc.ee_contribution * 12 * 100) / 100,
      annual_er: Math.round(calc.er_contribution * 12 * 100) / 100,
      annual_total: Math.round(calc.total_contribution * 12 * 100) / 100,
    };
  }
}

// Export singleton instance
export const pagIBIGService = new PagIBIGService();
