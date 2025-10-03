import {
  SSSContribution,
  SSSContributionTable,
  SSSRemittanceReport,
} from './types'

/**
 * SSS (Social Security System) Service
 * Philippine social security contribution calculations (2025 rates)
 */

export class SSSService {
  // SSS Contribution Table (2025 rates - updated)
  private contributionTable: SSSContributionTable[] = [
    { salary_range: { min: 0, max: 4249.99 }, monthly_salary_credit: 4000, ee_share: 180, er_share: 400, ec_share: 10, total: 590 },
    { salary_range: { min: 4250, max: 4749.99 }, monthly_salary_credit: 4500, ee_share: 202.50, er_share: 450, ec_share: 10, total: 662.50 },
    { salary_range: { min: 4750, max: 5249.99 }, monthly_salary_credit: 5000, ee_share: 225, er_share: 500, ec_share: 10, total: 735 },
    { salary_range: { min: 5250, max: 5749.99 }, monthly_salary_credit: 5500, ee_share: 247.50, er_share: 550, ec_share: 10, total: 807.50 },
    { salary_range: { min: 5750, max: 6249.99 }, monthly_salary_credit: 6000, ee_share: 270, er_share: 600, ec_share: 10, total: 880 },
    { salary_range: { min: 6250, max: 6749.99 }, monthly_salary_credit: 6500, ee_share: 292.50, er_share: 650, ec_share: 10, total: 952.50 },
    { salary_range: { min: 6750, max: 7249.99 }, monthly_salary_credit: 7000, ee_share: 315, er_share: 700, ec_share: 10, total: 1025 },
    { salary_range: { min: 7250, max: 7749.99 }, monthly_salary_credit: 7500, ee_share: 337.50, er_share: 750, ec_share: 10, total: 1097.50 },
    { salary_range: { min: 7750, max: 8249.99 }, monthly_salary_credit: 8000, ee_share: 360, er_share: 800, ec_share: 10, total: 1170 },
    { salary_range: { min: 8250, max: 8749.99 }, monthly_salary_credit: 8500, ee_share: 382.50, er_share: 850, ec_share: 10, total: 1242.50 },
    { salary_range: { min: 8750, max: 9249.99 }, monthly_salary_credit: 9000, ee_share: 405, er_share: 900, ec_share: 10, total: 1315 },
    { salary_range: { min: 9250, max: 9749.99 }, monthly_salary_credit: 9500, ee_share: 427.50, er_share: 950, ec_share: 10, total: 1387.50 },
    { salary_range: { min: 9750, max: 10249.99 }, monthly_salary_credit: 10000, ee_share: 450, er_share: 1000, ec_share: 10, total: 1460 },
    { salary_range: { min: 10250, max: 10749.99 }, monthly_salary_credit: 10500, ee_share: 472.50, er_share: 1050, ec_share: 10, total: 1532.50 },
    { salary_range: { min: 10750, max: 11249.99 }, monthly_salary_credit: 11000, ee_share: 495, er_share: 1100, ec_share: 10, total: 1605 },
    { salary_range: { min: 11250, max: 11749.99 }, monthly_salary_credit: 11500, ee_share: 517.50, er_share: 1150, ec_share: 10, total: 1677.50 },
    { salary_range: { min: 11750, max: 12249.99 }, monthly_salary_credit: 12000, ee_share: 540, er_share: 1200, ec_share: 10, total: 1750 },
    { salary_range: { min: 12250, max: 12749.99 }, monthly_salary_credit: 12500, ee_share: 562.50, er_share: 1250, ec_share: 10, total: 1822.50 },
    { salary_range: { min: 12750, max: 13249.99 }, monthly_salary_credit: 13000, ee_share: 585, er_share: 1300, ec_share: 10, total: 1895 },
    { salary_range: { min: 13250, max: 13749.99 }, monthly_salary_credit: 13500, ee_share: 607.50, er_share: 1350, ec_share: 10, total: 1967.50 },
    { salary_range: { min: 13750, max: 14249.99 }, monthly_salary_credit: 14000, ee_share: 630, er_share: 1400, ec_share: 10, total: 2040 },
    { salary_range: { min: 14250, max: 14749.99 }, monthly_salary_credit: 14500, ee_share: 652.50, er_share: 1450, ec_share: 10, total: 2112.50 },
    { salary_range: { min: 14750, max: 15249.99 }, monthly_salary_credit: 15000, ee_share: 675, er_share: 1500, ec_share: 10, total: 2185 },
    { salary_range: { min: 15250, max: 15749.99 }, monthly_salary_credit: 15500, ee_share: 697.50, er_share: 1550, ec_share: 10, total: 2257.50 },
    { salary_range: { min: 15750, max: 16249.99 }, monthly_salary_credit: 16000, ee_share: 720, er_share: 1600, ec_share: 10, total: 2330 },
    { salary_range: { min: 16250, max: 16749.99 }, monthly_salary_credit: 16500, ee_share: 742.50, er_share: 1650, ec_share: 10, total: 2402.50 },
    { salary_range: { min: 16750, max: 17249.99 }, monthly_salary_credit: 17000, ee_share: 765, er_share: 1700, ec_share: 10, total: 2475 },
    { salary_range: { min: 17250, max: 17749.99 }, monthly_salary_credit: 17500, ee_share: 787.50, er_share: 1750, ec_share: 10, total: 2547.50 },
    { salary_range: { min: 17750, max: 18249.99 }, monthly_salary_credit: 18000, ee_share: 810, er_share: 1800, ec_share: 10, total: 2620 },
    { salary_range: { min: 18250, max: 18749.99 }, monthly_salary_credit: 18500, ee_share: 832.50, er_share: 1850, ec_share: 10, total: 2692.50 },
    { salary_range: { min: 18750, max: 19249.99 }, monthly_salary_credit: 19000, ee_share: 855, er_share: 1900, ec_share: 10, total: 2765 },
    { salary_range: { min: 19250, max: 19749.99 }, monthly_salary_credit: 19500, ee_share: 877.50, er_share: 1950, ec_share: 10, total: 2837.50 },
    { salary_range: { min: 19750, max: 29999.99 }, monthly_salary_credit: 20000, ee_share: 900, er_share: 2000, ec_share: 10, total: 2910 },
    { salary_range: { min: 30000, max: Infinity }, monthly_salary_credit: 30000, ee_share: 1350, er_share: 3000, ec_share: 10, total: 4360 },
  ]

  /**
   * Calculate SSS contribution for an employee
   */
  calculateContribution(monthlySalary: number): {
    monthly_salary_credit: number
    ee_contribution: number
    er_contribution: number
    ec_contribution: number
    total_contribution: number
  } {
    const bracket = this.contributionTable.find(
      (b) => monthlySalary >= b.salary_range.min && monthlySalary <= b.salary_range.max
    ) || this.contributionTable[this.contributionTable.length - 1]

    return {
      monthly_salary_credit: bracket.monthly_salary_credit,
      ee_contribution: bracket.ee_share,
      er_contribution: bracket.er_share,
      ec_contribution: bracket.ec_share,
      total_contribution: bracket.total,
    }
  }

  /**
   * Generate SSS remittance report for a period
   */
  async generateRemittanceReport(
    period: string,
    employer: { sss_number: string; name: string; address: string },
    employees: Array<{
      employee_id: string
      employee_name: string
      sss_number: string
      monthly_salary: number
    }>
  ): Promise<SSSRemittanceReport> {
    const contributions: SSSContribution[] = employees.map((emp) => {
      const calc = this.calculateContribution(emp.monthly_salary)
      return {
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        sss_number: emp.sss_number,
        monthly_salary: emp.monthly_salary,
        ee_contribution: calc.ee_contribution,
        er_contribution: calc.er_contribution,
        ec_contribution: calc.ec_contribution,
        total_contribution: calc.total_contribution,
      }
    })

    const total_ee = contributions.reduce((sum, c) => sum + c.ee_contribution, 0)
    const total_er = contributions.reduce((sum, c) => sum + c.er_contribution, 0)
    const total_ec = contributions.reduce((sum, c) => sum + c.ec_contribution, 0)
    const grand_total = total_ee + total_er + total_ec

    return {
      period,
      employer,
      contributions,
      total_ee: Math.round(total_ee * 100) / 100,
      total_er: Math.round(total_er * 100) / 100,
      total_ec: Math.round(total_ec * 100) / 100,
      grand_total: Math.round(grand_total * 100) / 100,
    }
  }

  /**
   * Validate SSS number format
   * Format: XX-XXXXXXX-X (10 digits)
   */
  validateSSSNumber(sssNumber: string): boolean {
    const cleaned = sssNumber.replace(/-/g, '')
    return /^\d{10}$/.test(cleaned)
  }

  /**
   * Format SSS number with dashes
   */
  formatSSSNumber(sssNumber: string): string {
    const cleaned = sssNumber.replace(/-/g, '')
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}-${cleaned.slice(9)}`
    }
    return sssNumber
  }
}

// Export singleton instance
export const sssService = new SSSService()
