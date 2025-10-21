import {
  PhilHealthContribution,
  PhilHealthContributionTable,
  PhilHealthRemittanceReport,
} from "./types";

/**
 * PhilHealth (Philippine Health Insurance Corporation) Service
 * Philippine health insurance contribution calculations (2025 rates)
 */

export class PhilHealthService {
  // PhilHealth Premium Rate (2025)
  private readonly PREMIUM_RATE = 0.05; // 5% of monthly salary
  private readonly MIN_SALARY = 10000; // Minimum monthly salary credit
  private readonly MAX_SALARY = 100000; // Maximum monthly salary credit
  private readonly MIN_PREMIUM = 500; // Minimum monthly premium (5% of 10,000)
  private readonly MAX_PREMIUM = 5000; // Maximum monthly premium (5% of 100,000)

  /**
   * Calculate PhilHealth contribution for an employee
   */
  calculateContribution(monthlySalary: number): {
    monthly_salary_credit: number;
    premium_contribution: number;
    ee_contribution: number;
    er_contribution: number;
  } {
    // Determine salary credit (capped at min/max)
    let salaryCredit = monthlySalary;
    if (salaryCredit < this.MIN_SALARY) {
      salaryCredit = this.MIN_SALARY;
    } else if (salaryCredit > this.MAX_SALARY) {
      salaryCredit = this.MAX_SALARY;
    }

    // Calculate premium (5% of salary credit)
    const premium = salaryCredit * this.PREMIUM_RATE;

    // Split equally between employee and employer (50-50)
    const eeShare = premium / 2;
    const erShare = premium / 2;

    return {
      monthly_salary_credit: salaryCredit,
      premium_contribution: Math.round(premium * 100) / 100,
      ee_contribution: Math.round(eeShare * 100) / 100,
      er_contribution: Math.round(erShare * 100) / 100,
    };
  }

  /**
   * Generate PhilHealth contribution table for reference
   */
  getContributionTable(): PhilHealthContributionTable[] {
    const table: PhilHealthContributionTable[] = [];

    // Generate table from MIN to MAX in 5000 increments
    for (
      let salary = this.MIN_SALARY;
      salary <= this.MAX_SALARY;
      salary += 5000
    ) {
      const premium = salary * this.PREMIUM_RATE;
      const eeShare = premium / 2;
      const erShare = premium / 2;

      table.push({
        salary_range: {
          min: salary,
          max: salary === this.MAX_SALARY ? Infinity : salary + 4999.99,
        },
        premium_rate: this.PREMIUM_RATE,
        monthly_premium: Math.round(premium * 100) / 100,
        ee_share: Math.round(eeShare * 100) / 100,
        er_share: Math.round(erShare * 100) / 100,
      });
    }

    return table;
  }

  /**
   * Generate PhilHealth remittance report for a period
   */
  async generateRemittanceReport(
    period: string,
    employer: { pen: string; name: string; address: string },
    employees: Array<{
      employee_id: string;
      employee_name: string;
      philhealth_number: string;
      monthly_salary: number;
    }>
  ): Promise<PhilHealthRemittanceReport> {
    const contributions: PhilHealthContribution[] = employees.map(emp => {
      const calc = this.calculateContribution(emp.monthly_salary);
      return {
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        philhealth_number: emp.philhealth_number,
        monthly_salary: emp.monthly_salary,
        premium_contribution: calc.premium_contribution,
        ee_share: calc.ee_contribution,
        er_share: calc.er_contribution,
      };
    });

    const total_premium = contributions.reduce(
      (sum, c) => sum + c.premium_contribution,
      0
    );
    const total_ee = contributions.reduce((sum, c) => sum + c.ee_share, 0);
    const total_er = contributions.reduce((sum, c) => sum + c.er_share, 0);

    return {
      period,
      employer,
      contributions,
      total_premium: Math.round(total_premium * 100) / 100,
      total_ee: Math.round(total_ee * 100) / 100,
      total_er: Math.round(total_er * 100) / 100,
    };
  }

  /**
   * Validate PhilHealth number format
   * Format: XX-XXXXXXXXX-X (12 digits)
   */
  validatePhilHealthNumber(philhealthNumber: string): boolean {
    const cleaned = philhealthNumber.replace(/-/g, "");
    return /^\d{12}$/.test(cleaned);
  }

  /**
   * Format PhilHealth number with dashes
   */
  formatPhilHealthNumber(philhealthNumber: string): string {
    const cleaned = philhealthNumber.replace(/-/g, "");
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 11)}-${cleaned.slice(11)}`;
    }
    return philhealthNumber;
  }

  /**
   * Get premium rate for a specific year
   */
  getPremiumRate(year: number): number {
    // Premium rates by year (historical and projected)
    const rates: Record<number, number> = {
      2023: 0.04, // 4%
      2024: 0.045, // 4.5%
      2025: 0.05, // 5% (current)
      2026: 0.05, // 5% (projected to stabilize)
    };
    return rates[year] || this.PREMIUM_RATE;
  }

  /**
   * Calculate annual premium for budgeting
   */
  calculateAnnualPremium(monthlySalary: number): {
    monthly_premium: number;
    annual_employee_share: number;
    annual_employer_share: number;
    annual_total: number;
  } {
    const calc = this.calculateContribution(monthlySalary);

    return {
      monthly_premium: calc.premium_contribution,
      annual_employee_share: Math.round(calc.ee_contribution * 12 * 100) / 100,
      annual_employer_share: Math.round(calc.er_contribution * 12 * 100) / 100,
      annual_total: Math.round(calc.premium_contribution * 12 * 100) / 100,
    };
  }
}

// Export singleton instance
export const philHealthService = new PhilHealthService();
