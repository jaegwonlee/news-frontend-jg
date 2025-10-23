import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.chosun.com",
      },
      {
        protocol: "https",
        hostname: "*.khan.co.kr",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "media.livere.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.donga.com",
      },
      {
        protocol: "https",
        hostname: "flexible.img.hani.co.kr",
      },
    ],
  },
};

export default nextConfig;
