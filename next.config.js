// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    domains: [
      "raw.githubusercontent.com",
      "static.debank.com",
      "assets.coingecko.com",
      "s2.coinmarketcap.com",
      "avatars.githubusercontent.com",
      "cryptologos.cc",
      "img.notionusercontent.com",
    ],
    formats: ["image/avif", "image/webp"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "tokens-data.1inch.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
