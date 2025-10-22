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
        protocol: "httpshttps",
        hostname: "media.livere.org",
      },
      {
        protocol: "https",
        hostname: "news02.onrender.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;
