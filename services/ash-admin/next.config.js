/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    ASH_API_URL: process.env.ASH_API_URL || 'http://localhost:4000',
  },
  async rewrites() {
    return [
      // Handle auth routes locally
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Proxy other API routes to external service (if available)
      {
        source: '/api/:path*',
        destination: `${process.env.ASH_API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ]
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig