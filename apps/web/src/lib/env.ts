export const env = {
  apiBase: (process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "/api").replace(/\/$/, ""),
};
