import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false, // Prevents auto-opening browser
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    serverComponentsHmrCache: true,
    optimizePackageImports: [
      "react-icons",
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
      "lodash",
      "@mui/material",
      "@mui/icons-material",
      "date-fns",
      "recharts",
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Remove console logs in production
  },
  distDir: "build",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withBundleAnalyzer(nextConfig);
