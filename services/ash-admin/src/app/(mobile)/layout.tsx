/**
 * Mobile Layout
 * Wrapper for all mobile/PWA pages
 */

import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Ashley AI - Production Floor',
  description: 'Mobile production floor interface for manufacturing operations',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ashley AI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mobile-app">
      {/* Meta tags for mobile optimization */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Ashley AI" />
      <meta name="format-detection" content="telephone=no" />

      {/* Touch icon for iOS */}
      <link rel="apple-touch-icon" href="/icon-192x192.png" />

      {children}

      {/* Mobile-specific styles */}
      <style jsx global>{`
        .mobile-app {
          /* Prevent pull-to-refresh on mobile */
          overscroll-behavior-y: contain;

          /* Disable text selection for app-like feel */
          user-select: none;
          -webkit-user-select: none;

          /* Ensure full height on mobile */
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }

        /* Touch target sizing */
        .mobile-app button,
        .mobile-app a {
          min-height: 44px;
          min-width: 44px;
        }

        /* Disable tap highlight */
        .mobile-app * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Safe area insets for notched devices */
        @supports (padding: max(0px)) {
          .mobile-app {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        }
      `}</style>
    </div>
  )
}
