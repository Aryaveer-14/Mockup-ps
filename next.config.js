const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? '/Mockup-ps' : '',
  assetPrefix: isProd ? '/Mockup-ps/' : '',
  images: { unoptimized: true },
  // GLB/GLTF files are served from /public folder as static assets.
  // No webpack loader needed — useGLTF loads from URL paths directly.
  transpilePackages: ['three'],
  // Fix Turbopack workspace root detection (prevents resolving from wrong lockfile)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
