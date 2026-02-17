/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests for Server Actions (required for admin subdomain)
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_DOMAIN,
        process.env.NEXT_PUBLIC_ADMIN_DOMAIN,
        process.env.NEXT_PUBLIC_ADS_DOMAIN,
        "localhost:3000",
      ].filter(Boolean),
    },
  },
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
