/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product photos live on merchant CDNs (Temu/Daraz/AliExpress) and are
    // already web-sized. Serving them unoptimized keeps Vercel's free
    // Image Optimization quota untouched (75% warning, 2026-10-08) and
    // shows the original merchant photo exactly as required.
    unoptimized: true,
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
