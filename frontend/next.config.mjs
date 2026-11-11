/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'https://ipms-backend-5eua.onrender.com';

const nextConfig = {
  reactStrictMode: true,
  // Rewrite backend calls or allow direct Render backend communication
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
