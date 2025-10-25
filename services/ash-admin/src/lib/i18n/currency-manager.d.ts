export type SupportedCurrency = "PHP" | "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "INR" | "AUD" | "CAD" | "SGD";
export interface CurrencyConfig {
    code: SupportedCurrency;
    name: string;
    symbol: string;
    decimal_digits: number;
    format: "before" | "after";
}
export interface ExchangeRate {
    from: SupportedCurrency;
    to: SupportedCurrency;
    rate: number;
    last_updated: Date;
}
export declare class CurrencyManager {
    private readonly CURRENCIES;
    private readonly EXCHANGE_RATES;
    formatAmount(amount: number, currency: SupportedCurrency, locale?: string): string;
    convert(amount: number, from: SupportedCurrency, to: SupportedCurrency): number;
    getSupportedCurrencies(): CurrencyConfig[];
    getCurrencyConfig(code: SupportedCurrency): CurrencyConfig;
    getExchangeRate(from: SupportedCurrency, to: SupportedCurrency): ExchangeRate;
}
export declare const currencyManager: CurrencyManager;
