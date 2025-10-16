/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    ASH_API_URL: process.env.ASH_API_URL || 'http://localhost:4000',
  },
  async rewrites() {
    return [
      // Handle all API routes locally
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Production optimizations
  experimental: {
    // optimizeCss: true, // Disabled - requires 'critters' package
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  generateEtags: false,
  webpack: (config, { isServer, dev, webpack }) => {
    // Fix "self is not defined" error for QR code libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Server-side: Externalize packages that cause SSR issues
    if (isServer) {
      // Externalize packages that cause SSR issues
      const externals = Array.isArray(config.externals) ? config.externals : [config.externals]
      config.externals = [...externals.filter(Boolean), 'canvas', 'qrcode', 'speakeasy']
    }

    // Production optimizations
    if (!dev) {
      // Code splitting configuration (client-side only to avoid SSR issues)
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            // React and React-DOM in separate chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 20,
            },
            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui',
              priority: 15,
            },
            // Other vendor code
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
          },
        }
      }

      // Minification and tree shaking
      config.optimization.minimize = true
      config.optimization.usedExports = true
      config.optimization.sideEffects = true
    }

    return config
  },
  // Compression and caching
  compress: true,
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig