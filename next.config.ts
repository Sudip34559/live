import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip lint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Skip type errors during build
  },
};

export default nextConfig;
