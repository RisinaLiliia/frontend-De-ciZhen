import type { NextConfig } from 'next';

const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_BASE) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
