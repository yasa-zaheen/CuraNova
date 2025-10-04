import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Clerk-hosted avatars to be used with next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/:path*",
      },
    ],
    // fallback for some Next versions: allow the domain explicitly
    domains: ["img.clerk.com"],
  },
};

export default nextConfig;
