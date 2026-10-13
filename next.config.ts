import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'www.tiendapadelpoint.com' },
      { hostname: 'dbvnuoayzevtoaolhqxd.supabase.co' },
      { hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/travels/for-klubber', destination: '/travels/skreddersydde-reiser', permanent: true },
      { source: '/travels/for-bedrifter', destination: '/travels/skreddersydde-reiser', permanent: true },
    ]
  },
}

export default nextConfig
