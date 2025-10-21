// Multi-Language Translation System

export type SupportedLanguage =
  | "en"
  | "tl"
  | "zh"
  | "es"
  | "ja"
  | "ko"
  | "fr"
  | "de";

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  native_name: string;
  direction: "ltr" | "rtl";
}

export interface Translation {
  [key: string]: string | Translation;
}

export class TranslationManager {
  private readonly LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
    en: {
      code: "en",
      name: "English",
      native_name: "English",
      direction: "ltr",
    },
    tl: {
      code: "tl",
      name: "Tagalog",
      native_name: "Tagalog",
      direction: "ltr",
    },
    zh: { code: "zh", name: "Chinese", native_name: "中文", direction: "ltr" },
    es: {
      code: "es",
      name: "Spanish",
      native_name: "Español",
      direction: "ltr",
    },
    ja: {
      code: "ja",
      name: "Japanese",
      native_name: "日本語",
      direction: "ltr",
    },
    ko: { code: "ko", name: "Korean", native_name: "한국어", direction: "ltr" },
    fr: {
      code: "fr",
      name: "French",
      native_name: "Français",
      direction: "ltr",
    },
    de: {
      code: "de",
      name: "German",
      native_name: "Deutsch",
      direction: "ltr",
    },
  };

  private readonly TRANSLATIONS: Record<SupportedLanguage, Translation> = {
    en: {
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        search: "Search",
        filter: "Filter",
        export: "Export",
        import: "Import",
        yes: "Yes",
        no: "No",
        loading: "Loading...",
        success: "Success",
        error: "Error",
      },
      dashboard: {
        title: "Dashboard",
        welcome: "Welcome back",
        overview: "Overview",
        statistics: "Statistics",
      },
      orders: {
        title: "Orders",
        create: "Create Order",
        status: "Status",
        pending: "Pending",
        in_production: "In Production",
        completed: "Completed",
      },
      production: {
        title: "Production",
        cutting: "Cutting",
        sewing: "Sewing",
        quality: "Quality Control",
        finishing: "Finishing",
      },
    },
    tl: {
      common: {
        save: "I-save",
        cancel: "Kanselahin",
        delete: "Tanggalin",
        edit: "I-edit",
        create: "Lumikha",
        search: "Maghanap",
        filter: "Salain",
        export: "I-export",
        import: "Mag-import",
        yes: "Oo",
        no: "Hindi",
        loading: "Naglo-load...",
        success: "Tagumpay",
        error: "Error",
      },
      dashboard: {
        title: "Dashboard",
        welcome: "Maligayang pagbabalik",
        overview: "Pangkalahatang-ideya",
        statistics: "Estadistika",
      },
      orders: {
        title: "Mga Order",
        create: "Lumikha ng Order",
        status: "Katayuan",
        pending: "Naghihintay",
        in_production: "Sa Produksyon",
        completed: "Natapos na",
      },
      production: {
        title: "Produksyon",
        cutting: "Paggupit",
        sewing: "Pagtahi",
        quality: "Kontrol ng Kalidad",
        finishing: "Pagtatapos",
      },
    },
    zh: {
      common: {
        save: "保存",
        cancel: "取消",
        delete: "删除",
        edit: "编辑",
        create: "创建",
        search: "搜索",
        filter: "筛选",
        export: "导出",
        import: "导入",
        yes: "是",
        no: "否",
        loading: "加载中...",
        success: "成功",
        error: "错误",
      },
      dashboard: {
        title: "仪表板",
        welcome: "欢迎回来",
        overview: "概览",
        statistics: "统计",
      },
      orders: {
        title: "订单",
        create: "创建订单",
        status: "状态",
        pending: "待处理",
        in_production: "生产中",
        completed: "已完成",
      },
      production: {
        title: "生产",
        cutting: "裁剪",
        sewing: "缝纫",
        quality: "质量控制",
        finishing: "整理",
      },
    },
    es: {},
    ja: {},
    ko: {},
    fr: {},
    de: {},
  };

  // Get translation
  translate(
    key: string,
    language: SupportedLanguage,
    params?: Record<string, string>
  ): string {
    const keys = key.split(".");
    let translation: any = this.TRANSLATIONS[language];

    for (const k of keys) {
      if (translation && typeof translation === "object") {
        translation = translation[k];
      } else {
        break;
      }
    }

    let result = typeof translation === "string" ? translation : key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{{${param}}}`, value);
      });
    }

    return result;
  }

  // Get all supported languages
  getSupportedLanguages(): LanguageConfig[] {
    return Object.values(this.LANGUAGES);
  }

  // Get language config
  getLanguageConfig(code: SupportedLanguage): LanguageConfig {
    return this.LANGUAGES[code];
  }

  // Get all translations for a language
  getAllTranslations(language: SupportedLanguage): Translation {
    return this.TRANSLATIONS[language] || this.TRANSLATIONS.en;
  }
}

export const translationManager = new TranslationManager();
