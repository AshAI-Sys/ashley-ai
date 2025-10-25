"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewport = exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const providers_1 = require("@/components/providers");
const toast_provider_1 = require("@/components/ui/toast-provider");
const error_boundary_1 = require("@/components/ui/error-boundary");
const keyboard_shortcuts_dialog_1 = require("@/components/keyboard-shortcuts-dialog");
const fetch_interceptor_init_1 = require("@/components/fetch-interceptor-init");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const dynamic_1 = __importDefault(require("next/dynamic"));
// Load ChatWidget only on client side to prevent hydration issues
const _ChatWidget = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("@/components/ai-chat/ChatWidget"))).then(mod => ({
    default: mod.ChatWidget,
})), {
    ssr: false,
});
// Load PWA components only on client side
const PWAInstallPrompt = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("@/components/pwa-install-prompt"))), {
    ssr: false,
});
const PWARegister = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("@/components/pwa-register"))), {
    ssr: false,
});
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
exports.metadata = {
    title: "Ashley AI - Manufacturing ERP",
    description: "Complete Manufacturing ERP System with AI-powered optimization for apparel production",
    manifest: "/manifest.json",
    appleWebApp: {
        statusBarStyle: "default",
        title: "Ashley AI",
        startupImage: "/icons/icon-512x512.png",
    },
    other: {
        "mobile-web-app-capable": "yes",
    },
    applicationName: "Ashley AI",
    keywords: [
        "manufacturing",
        "erp",
        "apparel",
        "production",
        "ai",
        "automation",
    ],
    authors: [{ name: "Ashley AI Team" }],
    creator: "Ashley AI",
    publisher: "Ashley AI",
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        title: "Ashley AI - Manufacturing ERP",
        description: "Complete Manufacturing ERP System with AI-powered optimization",
        siteName: "Ashley AI",
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon.png", type: "image/png" },
            { url: "/ash-ai-logo.png", type: "image/png" },
            { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
            { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
            { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
            { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
        apple: [
            { url: "/ash-ai-logo.png", type: "image/png" },
            { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
            { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        ],
    },
};
exports.viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: "#ffffff",
};
function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="icon" type="image/png" href="/favicon.png"/>
        <link rel="apple-touch-icon" href="/ash-ai-logo.png"/>
        {/* Preconnect to speed up external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <error_boundary_1.ErrorBoundary>
          <ThemeContext_1.ThemeProvider>
            <providers_1.Providers>
              {/* Initialize fetch interceptor to add auth headers */}
              <fetch_interceptor_init_1.FetchInterceptorInit />

              <keyboard_shortcuts_dialog_1.GlobalKeyboardShortcutsProvider>
                {children}
                {/* ChatWidget temporarily disabled for faster page load */}
                {/* <ChatWidget /> */}

                {/* PWA Components */}
                <PWARegister />
                <PWAInstallPrompt />

                {/* Enhanced Toast Provider */}
                <toast_provider_1.ToastProvider />
              </keyboard_shortcuts_dialog_1.GlobalKeyboardShortcutsProvider>
            </providers_1.Providers>
          </ThemeContext_1.ThemeProvider>
        </error_boundary_1.ErrorBoundary>
      </body>
    </html>);
}
