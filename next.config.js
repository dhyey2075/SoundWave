/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable server-side routes for Supabase auth
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
