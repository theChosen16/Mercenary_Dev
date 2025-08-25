import type { NextConfig } from "next";
import withPWA from 'next-pwa';

// Security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages does not support Next.js image optimization.
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // The following options are not supported by 'output: export'.
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/backend/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
  //     },
  //   ]
  // },
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: securityHeaders,
  //     },
  //   ]
  // },
};

export default nextConfig;
