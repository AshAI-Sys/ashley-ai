import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { GlobalKeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-dialog";
import { FetchInterceptorInit } from "@/components/fetch-interceptor-init";
import { ThemeProvider } from "@/contexts/ThemeContext";
import dynamic from "next/dynamic";

// Load ChatWidget only on client side to prevent hydration issues
const ___ChatWidget = dynamic(
  () =>
    import("@/components/ai-chat/ChatWidget").then(mod => ({
      default: mod.ChatWidget,
    })),
  {
    ssr: false,
  }
);

// Load PWA components only on client side
const PWAInstallPrompt = dynamic(
  () => import("@/components/pwa-install-prompt"),
  {
    ssr: false,
  }
);
const PWARegister = dynamic(() => import("@/components/pwa-register"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ashley AI - Manufacturing ERP",
  description:
    "Complete Manufacturing ERP System with AI-powered optimization for apparel production",
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
    description:
      "Complete Manufacturing ERP System with AI-powered optimization",
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/ash-ai-logo.png" />
        {/* Preconnect to speed up external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider>
            <Providers>
              {/* Initialize fetch interceptor to add auth headers */}
              <FetchInterceptorInit />

              <GlobalKeyboardShortcutsProvider>
                {children}
                {/* ChatWidget temporarily disabled for faster page load */}
                {/* <ChatWidget /> */}

                {/* PWA Components */}
                <PWARegister />
                <PWAInstallPrompt />

                {/* Enhanced Toast Provider */}
                <ToastProvider />
              </GlobalKeyboardShortcutsProvider>
            </Providers>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
