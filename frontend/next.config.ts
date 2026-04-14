import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/api/submissions/**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/uploads/**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/api/submissions/**'
      },
      {
        protocol: 'http',
        hostname: '192.168.1.19',
        port: '5000',
        pathname: '/uploads/**'
      },
      {
        protocol: 'http',
        hostname: '192.168.1.19',
        port: '5000',
        pathname: '/api/submissions/**'
      }
    ]
  }
};

export default nextConfig;
