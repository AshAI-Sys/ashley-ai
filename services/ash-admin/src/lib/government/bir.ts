import {
  BIRSalesBookEntry,
  BIRPurchaseBookEntry, BIRWithholdingTax,
  BIR2307Form, ExportOptions,
} from "./types";

/**
 * BIR (Bureau of Internal Revenue) Service
 * Handles Philippine tax calculations and reporting
 */

export class BIRService {
  private readonly VAT_RATE = 0.12; // 12% VAT in Philippines

  /**
   * Calculate VAT from gross amount
   */
  calculateVAT(grossAmount: number): {
    net: number;
    vat: number;
    gross: number;
  } {
    const net = grossAmount / (1 + this.VAT_RATE);
    const vat = grossAmount - net;
    return {
      net: Math.round(net * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      gross: grossAmount,
    };
  }

  /**
   * Add VAT to net amount
   */
  addVAT(netAmount: number): { net: number; vat: number; gross: number } {
    const vat = netAmount * this.VAT_RATE;
    const gross = netAmount + vat;
    return {
      net: netAmount,
      vat: Math.round(vat * 100) / 100,
      gross: Math.round(gross * 100) / 100,
    };
  }

  /**
   * Generate Sales Book (for VAT-registered businesses)
   */
  async generateSalesBook(
    entries: BIRSalesBookEntry[],
    _period: { from: string; to: string }
  ): Promise<{
    entries: BIRSalesBookEntry[];
    summary: {
      total_sales: number;
      total_vat: number;
      total_vat_exempt: number;
      total_zero_rated: number;
      grand_total: number;
    };
  }> {
    const summary = entries.reduce(
      (acc, entry) => ({
        total_sales: acc.total_sales + entry.amount,
        total_vat: acc.total_vat + entry.vat_amount,
        total_vat_exempt: acc.total_vat_exempt + (entry.vat_exempt_amount || 0),
        total_zero_rated: acc.total_zero_rated + (entry.zero_rated_amount || 0),
        grand_total: acc.grand_total + entry.total_amount,
      }),
      {
        total_sales: 0,
        total_vat: 0,
        total_vat_exempt: 0,
        total_zero_rated: 0,
        grand_total: 0,
      }
    );

    return { entries, summary };
  }

  /**
   * Generate Purchase Book
   */
  async generatePurchaseBook(
    entries: BIRPurchaseBookEntry[],
    _period: { from: string; to: string }
  ): Promise<{
    entries: BIRPurchaseBookEntry[];
    summary: {
      total_purchases: number;
      total_vat: number;
      total_non_vat: number;
      grand_total: number;
    };
  }> {
    const summary = entries.reduce(
      (acc, entry) => ({
        total_purchases: acc.total_purchases + entry.amount,
        total_vat: acc.total_vat + entry.vat_amount,
        total_non_vat: acc.total_non_vat + (entry.non_vat_amount || 0),
        grand_total: acc.grand_total + entry.total_amount,
      }),
      {
        total_purchases: 0,
        total_vat: 0,
        total_non_vat: 0,
        grand_total: 0,
      }
    );

    return { entries, summary };
  }

  /**
   * Calculate withholding tax (common rates in Philippines)
   */
  calculateWithholdingTax(
    grossAmount: number,
    atcCode: string
  ): { gross: number; rate: number; tax_withheld: number; net_amount: number } {
    // Common ATC codes and rates
    const withholdingRates: Record<string, number> = {
      WI010: 0.01, // Professional fees (doctors, lawyers, etc.) - 1%
      WI020: 0.02, // Professional fees - 2%
      WI030: 0.05, // Rental - 5%
      WI050: 0.1, // Royalties - 10%
      WI070: 0.15, // Interest - 15%
      WI080: 0.2, // Dividends - 20%
      WI156: 0.01, // Income payments to contractors - 1%
      WI157: 0.02, // Income payments to contractors - 2%
      WI158: 0.05, // Income payments - 5%
    };

    const rate = withholdingRates[atcCode] || 0.01; // Default 1%
    const tax_withheld = Math.round(grossAmount * rate * 100) / 100;
    const net_amount = grossAmount - tax_withheld;

    return {
      gross: grossAmount,
      rate,
      tax_withheld,
      net_amount,
    };
  }

  /**
   * Generate BIR Form 2307 (Certificate of Creditable Tax Withheld at Source)
   */
  async generate2307Form(data: BIR2307Form): Promise<BIR2307Form> {
    // Calculate total tax withheld
    const total_tax_withheld = data.withholding_entries.reduce(
      (sum, entry) => sum + entry.tax_withheld,
      0
    );

    return {
      ...data,
      total_tax_withheld: Math.round(total_tax_withheld * 100) / 100,
    };
  }

  /**
   * Export to CSV format
   */
  exportToCSV(data: any[], headers: string[]): string {
    const csvRows = [headers.join(",")];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header.toLowerCase().replace(/ /g, "_")];
        return typeof value === "string" ? `"${value}"` : value;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  }

  /**
   * Validate TIN (Tax Identification Number)
   * Format: XXX-XXX-XXX-XXX or XXXXXXXXXXXX (12 digits)
   */
  validateTIN(tin: string): boolean {
    const cleaned = tin.replace(/-/g, "");
    return /^\d{9,12}$/.test(cleaned);
  }

  /**
   * Format TIN with dashes
   */
  formatTIN(tin: string): string {
    const cleaned = tin.replace(/-/g, "");
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}`;
    }
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9, 12)}`;
    }
    return tin;
  }

  /**
   * Get ATC code description
   */
  getATCDescription(atcCode: string): string {
    const descriptions: Record<string, string> = {
      WI010: "Professional fees - 1%",
      WI020: "Professional fees - 2%",
      WI030: "Rental - 5%",
      WI050: "Royalties - 10%",
      WI070: "Interest - 15%",
      WI080: "Dividends - 20%",
      WI156: "Contractor payments - 1%",
      WI157: "Contractor payments - 2%",
      WI158: "Income payments - 5%",
    };
    return descriptions[atcCode] || "Unknown ATC code";
  }
}

// Export singleton instance
export const birService = new BIRService();
