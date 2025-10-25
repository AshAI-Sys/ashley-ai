import { PagIBIGContributionTable, PagIBIGRemittanceReport } from "./types";
/**
 * Pag-IBIG (Home Development Mutual Fund) Service
 * Philippine housing fund contribution calculations (2025 rates)
 */
export declare class PagIBIGService {
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
    };
    /**
     * Generate Pag-IBIG contribution table for reference
     */
    getContributionTable(): PagIBIGContributionTable[];
    /**
     * Generate Pag-IBIG remittance report for a period
     */
    generateRemittanceReport(period: string, employer: {
        employer_id: string;
        name: string;
        address: string;
    }, employees: Array<{
        employee_id: string;
        employee_name: string;
        pagibig_number: string;
        monthly_salary: number;
    }>): Promise<PagIBIGRemittanceReport>;
    /**
     * Validate Pag-IBIG MID number format
     * Format: XXXX-XXXX-XXXX (12 digits)
     */
    validatePagIBIGNumber(pagibigNumber: string): boolean;
    /**
     * Format Pag-IBIG number with dashes
     */
    formatPagIBIGNumber(pagibigNumber: string): string;
    /**
     * Calculate loan amortization (housing loan estimate)
     */
    calculateLoanAmortization(loanAmount: number, interestRate: number, termYears: number): {
        monthly_amortization: number;
        total_interest: number;
        total_amount_payable: number;
    };
    /**
     * Estimate maximum loanable amount based on contributions
     * Rule of thumb: 80% of total accumulated value (TAV) or salary-based multiplier
     */
    estimateMaxLoanable(totalAccumulatedValue: number, monthlySalary: number, yearsOfContribution: number): {
        max_loanable_tav_based: number;
        max_loanable_salary_based: number;
        recommended_amount: number;
    };
    /**
     * Calculate annual contribution for budgeting
     */
    calculateAnnualContribution(monthlySalary: number): {
        monthly_ee: number;
        monthly_er: number;
        annual_ee: number;
        annual_er: number;
        annual_total: number;
    };
}
export declare const pagIBIGService: PagIBIGService;
