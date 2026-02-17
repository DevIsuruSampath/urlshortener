/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose clean env vars to the client
  env: {
    APP_DOMAIN: process.env.APP_DOMAIN,
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    ADS_DOMAIN: process.env.ADS_DOMAIN,
    SHORT_DOMAIN: process.env.SHORT_DOMAIN,
    API_BASE: process.env.API_BASE,
    PROJECT_NAME: process.env.PROJECT_NAME,
  },
  // Allow cross-origin requests for Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.APP_DOMAIN,
        process.env.ADMIN_DOMAIN,
        process.env.ADS_DOMAIN,
        process.env.AUTH_DOMAIN,
        "localhost:3000",
      ].filter(Boolean),
    },
  },
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
