/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep Prisma out of the Next.js server bundle so it manages its own binary
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}

module.exports = nextConfig
