/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/samurai-website' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/samurai-website/' : '',
};

export default nextConfig;
