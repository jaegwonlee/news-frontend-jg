import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.chosun.com",
      },
      {
        protocol: "https",
        hostname: "img.khan.co.kr",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "media.livere.org",
      },
    ],
  },
};

export default nextConfig;
