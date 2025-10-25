import { SSSRemittanceReport } from "./types";
/**
 * SSS (Social Security System) Service
 * Philippine social security contribution calculations (2025 rates)
 */
export declare class SSSService {
    private contributionTable;
    /**
     * Calculate SSS contribution for an employee
     */
    calculateContribution(monthlySalary: number): {
        monthly_salary_credit: number;
        ee_contribution: number;
        er_contribution: number;
        ec_contribution: number;
        total_contribution: number;
    };
    /**
     * Generate SSS remittance report for a period
     */
    generateRemittanceReport(period: string, employer: {
        sss_number: string;
        name: string;
        address: string;
    }, employees: Array<{
        employee_id: string;
        employee_name: string;
        sss_number: string;
        monthly_salary: number;
    }>): Promise<SSSRemittanceReport>;
    /**
     * Validate SSS number format
     * Format: XX-XXXXXXX-X (10 digits)
     */
    validateSSSNumber(sssNumber: string): boolean;
    /**
     * Format SSS number with dashes
     */
    formatSSSNumber(sssNumber: string): string;
}
export declare const sssService: SSSService;
