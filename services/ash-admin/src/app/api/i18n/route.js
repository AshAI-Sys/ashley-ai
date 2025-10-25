"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const translation_manager_1 = require("@/lib/i18n/translation-manager");
const currency_manager_1 = require("@/lib/i18n/currency-manager");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/i18n?action=languages|translations|currencies
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const action = searchParams.get("action") || "languages";
        const lang = searchParams.get("lang") || "en";
        switch (action) {
            case "languages":
                const languages = translation_manager_1.translationManager.getSupportedLanguages();
                return server_1.NextResponse.json({
                    success: true,
                    languages,
                });
            case "translations":
                const translations = translation_manager_1.translationManager.getAllTranslations(lang);
                return server_1.NextResponse.json({
                    success: true,
                    language: lang,
                    translations,
                });
            case "currencies":
                const currencies = currency_manager_1.currencyManager.getSupportedCurrencies();
                return server_1.NextResponse.json({
                    success: true,
                    currencies,
                });
            case "exchange_rate":
                const from = searchParams.get("from") || "PHP";
                const to = searchParams.get("to") || "USD";
                const rate = currency_manager_1.currencyManager.getExchangeRate(from, to);
                return server_1.NextResponse.json({
                    success: true,
                    exchange_rate: rate,
                });
            default:
                return server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    }
    catch (error) {
        console.error("i18n API error:", error);
        return server_1.NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 });
    }
});
// POST /api/i18n/convert - Convert currency
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const { amount, from, to } = await req.json();
        if (!amount || !from || !to) {
            return server_1.NextResponse.json({ error: "amount, from, and to are required" }, { status: 400 });
        }
        const converted = currency_manager_1.currencyManager.convert(amount, from, to);
        const formatted = currency_manager_1.currencyManager.formatAmount(converted, to);
        return server_1.NextResponse.json({
            success: true,
            original: { amount, currency: from },
            converted: { amount: converted, currency: to, formatted },
            rate: currency_manager_1.currencyManager.getExchangeRate(from, to).rate,
        });
    }
    catch (error) {
        console.error("Currency conversion error:", error);
        return server_1.NextResponse.json({ error: "Failed to convert currency", details: error.message }, { status: 500 });
    }
});
