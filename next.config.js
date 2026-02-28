/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GLB/GLTF files are served from /public folder as static assets.
  // No webpack loader needed — useGLTF loads from URL paths directly.
  transpilePackages: ['three'],
};

module.exports = nextConfig;
