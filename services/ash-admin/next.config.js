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
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Production optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  generateEtags: false,
  webpack: (config, { isServer, dev }) => {
    // Fix "self is not defined" error for QR code libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }

      // Define 'self' for browser compatibility
      config.plugins.push(
        new (require('webpack').ProvidePlugin)({
          self: 'global',
        })
      )
    }

    // Server-side externals for better performance
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'qrcode']
    }

    // Production optimizations
    if (!dev) {
      // Advanced code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate vendor chunks for better caching
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name(module) {
              // Get package name from node_modules path
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1]
              return `vendor.${packageName?.replace('@', '')}`
            },
          },
          // Common components shared across pages
          common: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            name: 'common',
          },
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
        },
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