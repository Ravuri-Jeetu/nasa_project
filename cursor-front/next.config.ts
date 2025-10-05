import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for shared hosting (Hostingial)
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static hosting
  distDir: 'out'
};

export default nextConfig;
