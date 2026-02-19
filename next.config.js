/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['supabase.co', '*.supabase.co'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig
