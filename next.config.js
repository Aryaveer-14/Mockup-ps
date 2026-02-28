const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GLB/GLTF files are served from /public folder as static assets.
  // No webpack loader needed — useGLTF loads from URL paths directly.
  transpilePackages: ['three'],
  // Fix Turbopack workspace root detection (prevents resolving from wrong lockfile)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
