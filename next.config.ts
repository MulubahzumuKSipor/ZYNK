import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.openfoodfacts.org' },
      { protocol: 'https', hostname: 'cdn.dummyjson.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com'},
      {
        protocol: 'https',
        hostname: 'niiqfjlpggrcslhnfbcw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  allowedDevOrigins: [
    'https://turner-nonbranded-jabberingly.ngrok-free.dev',
  ],
};

export default nextConfig;
