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
