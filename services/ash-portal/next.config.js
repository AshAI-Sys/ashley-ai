/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ASH_API_URL: process.env.ASH_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.ASH_STRIPE_PUBLISHABLE_KEY,
    WATCHPACK_POLLING: process.env.WATCHPACK_POLLING || true,
  },
  // Disable source maps for faster builds
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.ASH_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ]
  },
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
  // Optimize for development stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Completely disable file watching to prevent path errors
      config.watchOptions = false

      // Fix watchpack TypeError with undefined paths
      config.infrastructureLogging = {
        level: 'error',
      }

      // Resolve path issues in monorepo
      config.resolve = {
        ...config.resolve,
        symlinks: false,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
          path: false,
        },
      }

      // Disable watch mode for development
      config.watch = false
      config.cache = false
    }
    return config
  },
  // Improve development experience
  experimental: {
    optimizePackageImports: ['lucide-react', '@ash/ui'],
  },
  // Disable strict mode to prevent double rendering issues
  reactStrictMode: false,
}

module.exports = nextConfig