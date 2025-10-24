/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { translationManager } from "@/lib/i18n/translation-manager";
import { currencyManager } from "@/lib/i18n/currency-manager";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/i18n?action=languages|translations|currencies
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action") || "languages";
    const lang = (searchParams.get("lang") as any) || "en";

    switch (action) {
      case "languages":
        const languages = translationManager.getSupportedLanguages();
        return NextResponse.json({
          success: true,
          languages,
        });

      case "translations":
        const translations = translationManager.getAllTranslations(lang);
        return NextResponse.json({
          success: true,
          language: lang,
          translations,
        });

      case "currencies":
        const currencies = currencyManager.getSupportedCurrencies();
        return NextResponse.json({
          success: true,
          currencies,
        });

      case "exchange_rate":
        const from = (searchParams.get("from") as any) || "PHP";
        const to = (searchParams.get("to") as any) || "USD";
        const rate = currencyManager.getExchangeRate(from, to);
        return NextResponse.json({
          success: true,
          exchange_rate: rate,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
    console.error("i18n API error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
});

// POST /api/i18n/convert - Convert currency
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const { amount, from, to } = await req.json();

    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: "amount, from, and to are required" },
        { status: 400 }
      );
    }

    const converted = currencyManager.convert(amount, from, to);
    const formatted = currencyManager.formatAmount(converted, to);

    return NextResponse.json({
      success: true,
      original: { amount, currency: from },
      converted: { amount: converted, currency: to, formatted },
      rate: currencyManager.getExchangeRate(from, to).rate,
    });
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert currency", details: error.message },
      { status: 500 }
    );
  });