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
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
      {
        protocol: 'https',
        hostname: 'pb.darkstoresuplementos.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

// Deploy Timestamp: 2026-02-07 14:40
