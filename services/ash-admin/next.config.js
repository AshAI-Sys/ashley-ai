const path = require("path");
const { withSentryConfig } = require("@sentry/nextjs");
const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable instrumentation for Sentry server-side monitoring
  experimental: {
    instrumentationHook: true,
    scrollRestoration: true,
    workerThreads: false,
    cpus: 1,
  },
  // output: "standalone", // Disabled for development builds
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize production builds
  swcMinify: true,
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
  env: {
    ASH_API_URL: process.env.ASH_API_URL || "http://localhost:4000",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self)",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Handle all API routes locally
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compiler: {
    // Remove console.log/debug/info in production, keep error/warn for monitoring
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  poweredByHeader: false,
  generateEtags: false,

  // Handle static export errors gracefully
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Suppress static generation errors for error pages
  // These pages work correctly at runtime despite build warnings
  staticPageGenerationTimeout: 120,

  webpack: (config, { isServer, dev, webpack }) => {
    // Fix path aliases for deployment builds
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // Suppress OpenTelemetry and require-in-the-middle warnings from Sentry
    config.ignoreWarnings = [
      // Suppress OpenTelemetry dynamic require warnings
      {
        module: /@opentelemetry\/instrumentation/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      // Suppress require-in-the-middle warnings
      {
        module: /require-in-the-middle/,
        message: /Critical dependency: require function is used in a way/,
      },
    ];

    // Fix "self is not defined" error for QR code libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Server-side: Externalize packages that cause SSR issues
    if (isServer) {
      // Externalize packages that cause SSR issues
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals];
      config.externals = [
        ...externals.filter(Boolean),
        "canvas",
        "qrcode",
        "speakeasy",
      ];

      // CRITICAL: Fix Prisma Client query engine loading issue
      // Tell webpack to treat @prisma/client as external (don't bundle it)
      config.externals.push("@prisma/client");

      // Prisma will automatically use the correct query engine for the platform
      // No need to hardcode the path - schema.prisma handles this with binaryTargets
    }

    // Production optimizations
    if (!dev) {
      // Code splitting configuration (client-side only to avoid SSR issues)
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: "all",
          cacheGroups: {
            // React and React-DOM in separate chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "react",
              priority: 20,
            },
            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: "ui",
              priority: 15,
            },
            // Other vendor code
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
            },
          },
        };
      }

      // Minification and tree shaking
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
    }

    return config;
  },
  // Compression and caching
  compress: true,
  productionBrowserSourceMaps: false,

  // Disable source maps in development to prevent 404 errors
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: "bottom-right",
  },
};

// Sentry webpack plugin options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps to Sentry during production builds
  // This is disabled by default to avoid accidentally uploading during development
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// PWA Configuration
const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  sw: "sw.js",
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-font-assets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-image-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:mp3|wav|ogg)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-audio-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:mp4)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-video-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-style-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/api\/.*$/i,
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "apis",
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

// Combine PWA with Next.js config
const configWithPWA = pwaConfig(nextConfig);

// Make sure adding Sentry options is the last code to run before exporting
// Only apply Sentry config if DSN is configured
module.exports =
  process.env.NODE_ENV === "production" && process.env.SENTRY_DSN
    ? withSentryConfig(configWithPWA, sentryWebpackPluginOptions)
    : configWithPWA;
