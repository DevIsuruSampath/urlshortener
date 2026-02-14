export const env = {
  apiBase: (process.env.NEXT_PUBLIC_API_BASE || "/api").replace(/\/$/, ""),
  adminApiToken: process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || "",
};
