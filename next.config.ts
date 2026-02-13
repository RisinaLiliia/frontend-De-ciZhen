import type { NextConfig } from 'next';

const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    if (!API_BASE) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE}/:path*`,
      },
      {
        source: '/presence/:path*',
        destination: `${API_BASE}/presence/:path*`,
      },
    ];
  },
};

export default nextConfig;
