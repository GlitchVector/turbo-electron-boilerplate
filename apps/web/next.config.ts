import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Disable image optimization for static export (needed for Electron)
  images: {
    unoptimized: true,
  },
  // Transpile workspace packages
  transpilePackages: ["@repo/bridge", "@repo/shared"],
};

export default nextConfig;
