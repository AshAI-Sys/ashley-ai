/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ASH_API_URL: process.env.ASH_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.ASH_STRIPE_PUBLISHABLE_KEY,
    WATCHPACK_POLLING: process.env.WATCHPACK_POLLING || true,
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Improve performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@ash/ui'],
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Disable strict mode to prevent double rendering issues
  reactStrictMode: false,
}

module.exports = nextConfig