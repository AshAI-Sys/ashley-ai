import { BIRSalesBookEntry, BIRPurchaseBookEntry, BIR2307Form } from "./types";
/**
 * BIR (Bureau of Internal Revenue) Service
 * Handles Philippine tax calculations and reporting
 */
export declare class BIRService {
    private readonly VAT_RATE;
    /**
     * Calculate VAT from gross amount
     */
    calculateVAT(grossAmount: number): {
        net: number;
        vat: number;
        gross: number;
    };
    /**
     * Add VAT to net amount
     */
    addVAT(netAmount: number): {
        net: number;
        vat: number;
        gross: number;
    };
    /**
     * Generate Sales Book (for VAT-registered businesses)
     */
    generateSalesBook(entries: BIRSalesBookEntry[], period: {
        from: string;
        to: string;
    }): Promise<{
        entries: BIRSalesBookEntry[];
        summary: {
            total_sales: number;
            total_vat: number;
            total_vat_exempt: number;
            total_zero_rated: number;
            grand_total: number;
        };
    }>;
    /**
     * Generate Purchase Book
     */
    generatePurchaseBook(entries: BIRPurchaseBookEntry[], period: {
        from: string;
        to: string;
    }): Promise<{
        entries: BIRPurchaseBookEntry[];
        summary: {
            total_purchases: number;
            total_vat: number;
            total_non_vat: number;
            grand_total: number;
        };
    }>;
    /**
     * Calculate withholding tax (common rates in Philippines)
     */
    calculateWithholdingTax(grossAmount: number, atcCode: string): {
        gross: number;
        rate: number;
        tax_withheld: number;
        net_amount: number;
    };
    /**
     * Generate BIR Form 2307 (Certificate of Creditable Tax Withheld at Source)
     */
    generate2307Form(data: BIR2307Form): Promise<BIR2307Form>;
    /**
     * Export to CSV format
     */
    exportToCSV(data: any[], headers: string[]): string;
    /**
     * Validate TIN (Tax Identification Number)
     * Format: XXX-XXX-XXX-XXX or XXXXXXXXXXXX (12 digits)
     */
    validateTIN(tin: string): boolean;
    /**
     * Format TIN with dashes
     */
    formatTIN(tin: string): string;
    /**
     * Get ATC code description
     */
    getATCDescription(atcCode: string): string;
}
export declare const birService: BIRService;
