/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ASH_API_URL: process.env.ASH_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.ASH_STRIPE_PUBLISHABLE_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.ASH_API_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ]
  },
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
}

module.exports = nextConfig