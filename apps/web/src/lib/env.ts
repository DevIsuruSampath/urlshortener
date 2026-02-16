export const env = {
  apiBase: (process.env.NEXT_PUBLIC_API_BASE || "/api").replace(/\/$/, ""),
};
