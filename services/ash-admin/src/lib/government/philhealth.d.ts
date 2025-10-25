import { PhilHealthContributionTable, PhilHealthRemittanceReport } from "./types";
/**
 * PhilHealth (Philippine Health Insurance Corporation) Service
 * Philippine health insurance contribution calculations (2025 rates)
 */
export declare class PhilHealthService {
    private readonly PREMIUM_RATE;
    private readonly MIN_SALARY;
    private readonly MAX_SALARY;
    private readonly MIN_PREMIUM;
    private readonly MAX_PREMIUM;
    /**
     * Calculate PhilHealth contribution for an employee
     */
    calculateContribution(monthlySalary: number): {
        monthly_salary_credit: number;
        premium_contribution: number;
        ee_contribution: number;
        er_contribution: number;
    };
    /**
     * Generate PhilHealth contribution table for reference
     */
    getContributionTable(): PhilHealthContributionTable[];
    /**
     * Generate PhilHealth remittance report for a period
     */
    generateRemittanceReport(period: string, employer: {
        pen: string;
        name: string;
        address: string;
    }, employees: Array<{
        employee_id: string;
        employee_name: string;
        philhealth_number: string;
        monthly_salary: number;
    }>): Promise<PhilHealthRemittanceReport>;
    /**
     * Validate PhilHealth number format
     * Format: XX-XXXXXXXXX-X (12 digits)
     */
    validatePhilHealthNumber(philhealthNumber: string): boolean;
    /**
     * Format PhilHealth number with dashes
     */
    formatPhilHealthNumber(philhealthNumber: string): string;
    /**
     * Get premium rate for a specific year
     */
    getPremiumRate(year: number): number;
    /**
     * Calculate annual premium for budgeting
     */
    calculateAnnualPremium(monthlySalary: number): {
        monthly_premium: number;
        annual_employee_share: number;
        annual_employer_share: number;
        annual_total: number;
    };
}
export declare const philHealthService: PhilHealthService;
