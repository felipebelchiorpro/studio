import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bancodedadosds.venturexp.pro',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

// Deploy Timestamp: 2026-01-29 22:45
