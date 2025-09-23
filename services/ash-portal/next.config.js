/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ASH_API_URL: process.env.ASH_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.ASH_STRIPE_PUBLISHABLE_KEY,
  },
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
      // Fix watchpack issues in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
        followSymlinks: false,
      }

      // Fix watchpack TypeError with undefined paths
      config.infrastructureLogging = {
        level: 'error',
      }

      // Resolve path issues in monorepo
      config.resolve = {
        ...config.resolve,
        symlinks: false,
      }
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