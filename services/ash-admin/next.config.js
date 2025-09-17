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
      // Handle all API routes locally
      {
        source: '/api/:path*',
        destination: '/api/:path*',
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