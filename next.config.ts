import type { NextConfig } from 'next';

const apiBaseFromServerEnv = process.env.API_BASE_URL?.trim();
const apiBaseFromPublicEnv = process.env.NEXT_PUBLIC_API_BASE?.trim();
const imageUnoptimized =
  process.env.NEXT_IMAGE_UNOPTIMIZED === 'true' ||
  (process.env.NODE_ENV === 'development' && process.env.NEXT_IMAGE_OPTIMIZE_DEV !== 'true');
const API_BASE =
  apiBaseFromServerEnv ||
  (process.env.NODE_ENV === 'production' ? apiBaseFromPublicEnv : '') ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

const nextConfig: NextConfig = {
  images: {
    unoptimized: imageUnoptimized,
    qualities: [60, 62, 75],
    formats: ['image/avif', 'image/webp'],
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