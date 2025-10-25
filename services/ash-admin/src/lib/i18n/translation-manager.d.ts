export type SupportedLanguage = "en" | "tl" | "zh" | "es" | "ja" | "ko" | "fr" | "de";
export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    native_name: string;
    direction: "ltr" | "rtl";
}
export interface Translation {
    [key: string]: string | Translation;
}
export declare class TranslationManager {
    private readonly LANGUAGES;
    private readonly TRANSLATIONS;
    translate(key: string, language: SupportedLanguage, params?: Record<string, string>): string;
    getSupportedLanguages(): LanguageConfig[];
    getLanguageConfig(code: SupportedLanguage): LanguageConfig;
    getAllTranslations(language: SupportedLanguage): Translation;
}
export declare const translationManager: TranslationManager;
