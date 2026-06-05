import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'www.tiendapadelpoint.com' },
      { hostname: 'dbvnuoayzevtoaolhqxd.supabase.co' },
    ],
  },
}

export default nextConfig
