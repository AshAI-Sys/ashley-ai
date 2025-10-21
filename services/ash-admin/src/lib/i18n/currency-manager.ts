// Multi-Currency Support System

export type SupportedCurrency =
  | "PHP"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "INR"
  | "AUD"
  | "CAD"
  | "SGD";

export interface CurrencyConfig {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  decimal_digits: number;
  format: "before" | "after"; // Symbol position
}

export interface ExchangeRate {
  from: SupportedCurrency;
  to: SupportedCurrency;
  rate: number;
  last_updated: Date;
}

export class CurrencyManager {
  private readonly CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
    PHP: {
      code: "PHP",
      name: "Philippine Peso",
      symbol: "₱",
      decimal_digits: 2,
      format: "before",
    },
    USD: {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      decimal_digits: 2,
      format: "before",
    },
    EUR: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      decimal_digits: 2,
      format: "before",
    },
    GBP: {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      decimal_digits: 2,
      format: "before",
    },
    JPY: {
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
      decimal_digits: 0,
      format: "before",
    },
    CNY: {
      code: "CNY",
      name: "Chinese Yuan",
      symbol: "¥",
      decimal_digits: 2,
      format: "before",
    },
    INR: {
      code: "INR",
      name: "Indian Rupee",
      symbol: "₹",
      decimal_digits: 2,
      format: "before",
    },
    AUD: {
      code: "AUD",
      name: "Australian Dollar",
      symbol: "A$",
      decimal_digits: 2,
      format: "before",
    },
    CAD: {
      code: "CAD",
      name: "Canadian Dollar",
      symbol: "C$",
      decimal_digits: 2,
      format: "before",
    },
    SGD: {
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      decimal_digits: 2,
      format: "before",
    },
  };

  // Simplified exchange rates (in production, would fetch from API)
  private readonly EXCHANGE_RATES: Record<string, number> = {
    "PHP-USD": 0.018,
    "PHP-EUR": 0.016,
    "USD-PHP": 56.0,
    "EUR-PHP": 61.0,
    "USD-EUR": 0.92,
    "EUR-USD": 1.09,
  };

  // Format amount in currency
  formatAmount(
    amount: number,
    currency: SupportedCurrency,
    locale?: string
  ): string {
    const config = this.CURRENCIES[currency];

    const formatted = amount.toLocaleString(locale || "en-US", {
      minimumFractionDigits: config.decimal_digits,
      maximumFractionDigits: config.decimal_digits,
    });

    return config.format === "before"
      ? `${config.symbol}${formatted}`
      : `${formatted} ${config.symbol}`;
  }

  // Convert between currencies
  convert(
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency
  ): number {
    if (from === to) return amount;

    const key = `${from}-${to}`;
    const reverseKey = `${to}-${from}`;

    let rate = this.EXCHANGE_RATES[key];

    if (!rate) {
      // Try reverse rate
      const reverseRate = this.EXCHANGE_RATES[reverseKey];
      if (reverseRate) {
        rate = 1 / reverseRate;
      } else {
        // If no direct rate, convert through USD
        const toUSD = this.EXCHANGE_RATES[`${from}-USD`] || 1;
        const fromUSD = this.EXCHANGE_RATES[`USD-${to}`] || 1;
        rate = toUSD * fromUSD;
      }
    }

    return amount * rate;
  }

  // Get all supported currencies
  getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(this.CURRENCIES);
  }

  // Get currency config
  getCurrencyConfig(code: SupportedCurrency): CurrencyConfig {
    return this.CURRENCIES[code];
  }

  // Get exchange rate
  getExchangeRate(
    from: SupportedCurrency,
    to: SupportedCurrency
  ): ExchangeRate {
    const rate = from === to ? 1 : this.convert(1, from, to);

    return {
      from,
      to,
      rate,
      last_updated: new Date(),
    };
  }
}

export const currencyManager = new CurrencyManager();
