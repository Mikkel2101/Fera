import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'www.tiendapadelpoint.com' },
    ],
  },
}

export default nextConfig
