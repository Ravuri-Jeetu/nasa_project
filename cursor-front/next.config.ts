import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Azure Static Web Apps
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
  // Removed experimental.esmExternals to fix Turbopack compatibility
};

export default nextConfig;
