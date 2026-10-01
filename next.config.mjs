/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazon.com" },
      { protocol: "https", hostname: "*.ssl-images-amazon.com" },
      { protocol: "https", hostname: "*.media-amazon.com" },
      { protocol: "https", hostname: "*.temu.com" },
      { protocol: "https", hostname: "*.alicdn.com" },
      { protocol: "https", hostname: "*.aliexpress.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
